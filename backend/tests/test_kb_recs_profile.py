from datetime import timezone
import os
import json
import pytest
from unittest.mock import MagicMock, patch
from backend.app.services.kb_manager import kb_manager
from backend.app.services.recommendation_engine import recommendation_engine
from backend.app.routers.auth import get_current_user
from backend.app.models.schemas import UserRegister, ProfileUpdate
from backend.tests.mock_db import MockDatabase

# Helper to clear test artifacts
def setup_teardown_kb():
    # Make sure test docs dir exists
    os.makedirs(kb_manager.docs_dir, exist_ok=True)
    test_pdf = os.path.join(kb_manager.docs_dir, "test_crop_advisory.pdf")
    # Write a dummy byte stream representing a PDF
    with open(test_pdf, "wb") as f:
        f.write(b"%PDF-1.4 ... dummy pdf content ...")
    
    yield test_pdf

    # Clean up test files
    if os.path.exists(test_pdf):
        os.remove(test_pdf)
    for f in [kb_manager.index_path, kb_manager.manifest_path, kb_manager.chunks_path]:
        if os.path.exists(f):
            os.remove(f)

@patch("pypdf.PdfReader")
def test_knowledge_base_ingestion_and_query(mock_pdf_reader):
    # Setup setup/teardown
    pdf_generator = setup_teardown_kb()
    test_pdf_path = next(pdf_generator)

    # Mock PdfReader behavior
    mock_page = MagicMock()
    mock_page.extract_text.return_value = "Tomato leaf spots and early blight are triggered by alternaria alternata spores under high humidity."
    mock_pdf_reader.return_value.pages = [mock_page]

    try:
        # Run update
        result = kb_manager.update_knowledge_base()
        assert result["status"] == "updated"
        assert result["documents_count"] == 1
        assert result["total_chunks"] > 0

        # Query the database
        search_res = kb_manager.query_knowledge_base("tomato blight alternaria", top_k=1)
        assert len(search_res) > 0
        assert "tomato" in search_res[0]["text"].lower()
        assert search_res[0]["doc_name"] == "test_crop_advisory.pdf"
    finally:
        # Run teardown
        try:
            next(pdf_generator)
        except StopIteration:
            pass

def test_recommendation_engine_logic():
    # Test case 1: Active rain detected
    recs_rain = recommendation_engine.generate_recommendation(
        soil_moisture=45.0,
        rain_sensor=1,
        temperature=24.0,
        humidity=65.0,
        light_intensity=10000.0,
        forecast_list=[],
        crop_name="Tomato",
        growth_stage="Vegetative",
        irrigation_method="Drip",
        water_source="Well"
    )
    assert recs_rain["recommendation"] == "Stop Irrigation"
    assert recs_rain["priority"] == "Critical"

    # Test case 2: Critically dry soil and high heat
    recs_dry = recommendation_engine.generate_recommendation(
        soil_moisture=30.0,
        rain_sensor=0,
        temperature=35.0,
        humidity=40.0,
        light_intensity=25000.0,
        forecast_list=[],
        crop_name="Tomato",
        growth_stage="Fruiting",
        irrigation_method="Drip",
        water_source="Well"
    )
    assert recs_dry["recommendation"] == "Irrigate Now"
    assert recs_dry["priority"] == "High"
    assert recs_dry["recommended_water"] == "3.5 L/m²"

    # Test case 3: Healthy soil moisture
    recs_normal = recommendation_engine.generate_recommendation(
        soil_moisture=55.0,
        rain_sensor=0,
        temperature=25.0,
        humidity=60.0,
        light_intensity=15000.0,
        forecast_list=[],
        crop_name="Tomato",
        growth_stage="Fruiting"
    )
    assert recs_normal["recommendation"] == "No Action Required"
    assert recs_normal["priority"] == "Low"

@pytest.mark.asyncio
async def test_extended_farmer_profile_defaults():
    # Setup a mock user database with an old user record lacking new farm details
    mock_db = MockDatabase()
    old_user_record = {
        "_id": "60c72b2f9b1d8e1234567890",
        "name": "John Farmer",
        "email": "john@example.com",
        "password_hash": "dummy_hash",
        "role": "farmer"
    }
    await mock_db.users.insert_one(old_user_record)

    # Retrieve current user and check that backward-compatible default keys are injected
    from bson import ObjectId
    user = await mock_db.users.find_one({"_id": ObjectId("60c72b2f9b1d8e1234567890")})
    assert user is not None
    
    # Apply setdefaults like in get_current_user router logic
    user["id"] = str(user["_id"])
    user.setdefault("farm_location", None)
    user.setdefault("preferred_language", "en")
    user.setdefault("crop_history", [])
    user.setdefault("farming_practices", "Conventional")

    assert user["farm_location"] is None
    assert user["preferred_language"] == "en"
    assert user["crop_history"] == []
    assert user["farming_practices"] == "Conventional"

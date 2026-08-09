import os
import sys
import uuid
import shutil
from datetime import datetime, timezone
from bson import ObjectId
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query

# Ensure parent directory is in search path to import from model folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.db.mongodb import get_database
from backend.app.routers.auth import get_current_user
from backend.app.models.schemas import (
    PredictionResponse, 
    PredictionHistoryResponse, 
    PredictRequest,
    AgrochemicalCompareRequest,
    CropAdvisorRequest
)
from backend.app.services.notification_service import NotificationService
from backend.app.models.notification import NotificationCreate

# Try to import predict_crop_disease, fallback to dummy classification if not created yet
from model.predict import predict_crop_disease, get_model_health_status

router = APIRouter(prefix="/api", tags=["Predictions"])

@router.get("/ai/model/status")
async def get_ai_model_status():
    status_data = get_model_health_status()
    if not status_data["ready"]:
        raise HTTPException(status_code=500, detail=status_data["status"])
    return status_data


from backend.app.core.upload_validator import validate_image_upload
from backend.app.core.rate_limiter import rate_limit, PREDICT_LIMIT

@router.post("/upload", status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit(PREDICT_LIMIT, 60))])
async def upload_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload crop leaf image with enterprise magic-byte, PIL, and OpenCV validation."""
    content_bytes, safe_filename = await validate_image_upload(file)

    upload_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
        "uploads"
    )
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, safe_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(content_bytes)

    relative_path = f"uploads/{safe_filename}"
    return {"image_path": relative_path}

@router.post("/agrochemical-scan")
async def agrochemical_scan_endpoint(
    req: PredictRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Intelligent Agrochemical Product Scanner Endpoint.
    Extracts OCR text, matches botanical/chemical database, saves scan history to MongoDB,
    and returns structured product intelligence.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    full_image_path = os.path.join(base_dir, req.image_path.replace("/", os.sep))

    if not os.path.exists(full_image_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified image file does not exist on server."
        )

    try:
        from backend.app.services.agrochemical_detector import detect_agrochemical
        agro_res = detect_agrochemical(full_image_path, force_scan=True)
        info = agro_res.get("info", {})
        extracted_text = agro_res.get("extracted_text", "")
        now = datetime.now(timezone.utc)

        # Save scan to MongoDB predictions history
        scan_record = {
            "user_id": str(current_user["id"]),
            "image_path": req.image_path,
            "crop_name": "Agrochemical Product",
            "disease_name": info.get("product_name", "Scanned Agrochemical"),
            "confidence": float(agro_res.get("confidence", 95.0) / 100.0 if agro_res.get("confidence", 95.0) > 1.0 else agro_res.get("confidence", 0.95)),
            "prediction_date": now.strftime("%Y-%m-%d"),
            "prediction_time": now.strftime("%H:%M:%S"),
            "prediction_status": "agrochemical",
            "created_at": now,
            "brand": info.get("brand", "AgriShield Certified"),
            "product_type": info.get("product_type", "Agrochemical"),
            "active_ingredients": info.get("active_ingredients", "N/A"),
            "language": req.language or "en",
            "extracted_text": extracted_text,
            "symptoms": f"Category: {info.get('product_type', 'Agrochemical')}\nBrand: {info.get('brand', 'Standard')}",
            "organic_treatment": f"Usage Protocol:\n{info.get('recommended_dosage', 'Apply as directed.')}",
            "chemical_treatment": f"Active Formulation: {info.get('active_ingredients', 'N/A')}"
        }
        await db.predictions.insert_one(scan_record)

        # Backwards compatible & structured frontend fields
        target_crops = info.get("target_crops", ["All Crops"])
        target_diseases = info.get("target_diseases", ["Fungal Pathogens", "Insect Pests"])
        target_pests = info.get("target_pests", ["Agricultural Pests"])

        return {
            "success": True,
            "is_agrochemical": True,
            "confidence": agro_res.get("confidence", 95.0),
            "productName": info.get("product_name", "Agricultural Product"),
            "category": info.get("product_type", "Agrochemical"),
            "brand": info.get("brand", "Generic Product"),
            "activeIngredient": info.get("active_ingredients", "N/A"),
            "formulation": info.get("formulation", "WP / Liquid"),
            "batchNumber": info.get("batch_number", "See Bottle Stamping"),
            "mfgDate": info.get("mfg_date", "Printed on Bottle"),
            "expDate": info.get("exp_date", "Best before 24 months"),
            "netQuantity": info.get("net_qty", "500 g / 1 L"),
            "registrationNumber": info.get("registration_number", "CIR-Verified"),
            "targetDiseases": ", ".join(target_diseases),
            "targetCrops": ", ".join(target_crops),
            "targetPests": ", ".join(target_pests),
            "dosage": info.get("recommended_dosage", "Apply as directed on product label."),
            "mixingRatio": info.get("mixing_ratio", "2.5 g / L of water"),
            "sprayInterval": info.get("spray_interval", "Follow label instructions."),
            "reentryInterval": info.get("reentry_interval", "24 hours"),
            "preharvestInterval": info.get("preharvest_interval", "7 days"),
            "toxicityClass": info.get("safety_category", "Class III - Caution"),
            "ppe": info.get("protective_equipment", "Wear gloves and safety goggles."),
            "storage": info.get("storage_instructions", "Store below 25°C in a dry place."),
            "disposal": info.get("disposal_instructions", "Dispose according to local regulations."),
            "compatibleProducts": info.get("compatible_products", []),
            "incompatibleProducts": info.get("incompatible_products", []),
            "extracted_text": extracted_text,
            # Structured AI Assistant Breakdown
            "product_overview": f"{info.get('product_name')} by {info.get('brand')}. {info.get('product_type')}.",
            "suitable_crops": target_crops,
            "suitable_diseases": target_diseases,
            "suitable_pests": target_pests,
            "recommended_dosage": info.get("recommended_dosage"),
            "mixing_instructions": f"Dissolve {info.get('mixing_ratio')} in clean water. Stir thoroughly before spraying.",
            "application_timing": info.get("spray_interval"),
            "safety_instructions": info.get("protective_equipment"),
            "farmer_tips": [
                "Always spray during early morning or late evening hours to protect beneficial pollinators.",
                "Ensure uniform foliar coverage on both upper and lower leaf surfaces.",
                "Do not mix with incompatible chemicals to prevent precipitation or crop injury."
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agrochemical scan error: {str(e)}"
        )

# Backwards compatibility alias route
@router.post("/scan-agrochemical")
async def scan_agrochemical_endpoint(
    req: PredictRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    return await agrochemical_scan_endpoint(req, current_user, db)

@router.post("/agrochemical-compare")
async def compare_agrochemical_endpoint(
    req: AgrochemicalCompareRequest,
    current_user: dict = Depends(get_current_user)
):
    """Side-by-side comparison endpoint for two agrochemical products."""
    from backend.app.services.agrochemical_detector import compare_agrochemical_products
    return compare_agrochemical_products(req.product1, req.product2)

@router.get("/agrochemical-recommendations/{disease_name}")
async def agrochemical_recommendations_endpoint(
    disease_name: str,
    current_user: dict = Depends(get_current_user)
):
    """Returns agrochemical product recommendations linked to a diagnosed crop disease."""
    from backend.app.services.agrochemical_detector import get_recommended_agrochemicals_for_disease
    return get_recommended_agrochemicals_for_disease(disease_name)

@router.post("/crop-advisor")
async def crop_advisor_endpoint(
    req: CropAdvisorRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Standalone Crop Advisor endpoint for testing, debugging, or third-party integrations.
    (Note: The main application UI uses the internally embedded advisor data from /predict-pytorch).
    """
    from backend.app.services.crop_advisor import crop_advisor_service
    try:
        advisor_data = crop_advisor_service.generate_advisory(
            crop_name=req.crop_name,
            disease_name=req.disease_name,
            confidence=req.confidence,
            prediction_status=req.prediction_status,
            uncertainty_score=req.uncertainty_score
        )
        return {"success": True, "advisor": advisor_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Crop Advisor error: {str(e)}"
        )

@router.post("/identify-plant")
async def identify_plant_endpoint(
    req: PredictRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Dedicated Plant Identification endpoint.
    Performs image validation, local & online plant species identification across
    crops, fruits, vegetables, flowers, trees, weeds, and medicinal plants.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    full_image_path = os.path.join(base_dir, req.image_path.replace("/", os.sep))

    if not os.path.exists(full_image_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified image file does not exist on server."
        )

    try:
        from backend.app.services.plant_identifier import plant_identifier_service
        result = await plant_identifier_service.identify_plant(full_image_path)
        if not result.get("success", False):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result.get("error", "This plant could not be confidently identified.")
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plant identification error: {str(e)}"
        )

# Backwards compatibility alias route
@router.post("/predict")
async def predict_legacy_alias(
    req: PredictRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    return await predict_pytorch_endpoint(req, current_user, db)

@router.post("/predict-pytorch")
async def predict_pytorch_endpoint(
    req: PredictRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Independent PyTorch inference endpoint for AI Scan Center (Disease Diagnosis tab).
    Uses the main predict_crop_disease pipeline with full diagnostics and optional translation.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    full_image_path = os.path.join(base_dir, req.image_path.replace("/", os.sep))

    if not os.path.exists(full_image_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified image file does not exist on server."
        )

    # Perform prediction using the real PyTorch pipeline
    try:
        prediction_result = predict_crop_disease(
            full_image_path, 
            req.explainer_type or "gradcam++",
            crop_filter=getattr(req, "crop_filter", None)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PyTorch inference error: {str(e)}"
        )

    # Return OOD rejection with 422 so frontend can show the message clearly
    if prediction_result.get("raw_label") == "OOD":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=prediction_result["disease_name"]
        )

    # Base diagnostic fields
    symptoms = prediction_result.get("symptoms", "None")
    severity = prediction_result.get("disease_severity", "Unknown")
    prevention_methods = prediction_result.get("prevention_methods", [])
    organic_treatment = prediction_result.get("organic_treatment", "None")
    chemical_treatment = prediction_result.get("chemical_treatment", "None")
    possible_causes = prediction_result.get("possible_causes", [])

    # Enrich with NVIDIA LLM agronomic advice
    try:
        from backend.app.services.nvidia_service import nvidia_service
        from backend.app.services.farm_profile_service import FarmProfileService
        active_farm = await FarmProfileService.get_active_farm(db, current_user["id"])
        llama_advice = await nvidia_service.generate_farming_advice(
            crop_name=prediction_result["crop_name"],
            disease_name=prediction_result["disease_name"],
            confidence=prediction_result["confidence"],
            farm_profile=active_farm
        )
        if llama_advice:
            def force_str(val):
                if isinstance(val, dict):
                    return ", ".join(f"{k}: {v}" for k, v in val.items())
                elif isinstance(val, list):
                    return ", ".join(map(str, val))
                return str(val) if val else "None"
                
            if llama_advice.get("disease_explanation"):
                symptoms = force_str(llama_advice["disease_explanation"])
            if llama_advice.get("severity"):
                severity = force_str(llama_advice["severity"])
            if llama_advice.get("organic_treatment"):
                organic_treatment = force_str(llama_advice["organic_treatment"])
            if llama_advice.get("chemical_treatment"):
                chemical_treatment = force_str(llama_advice["chemical_treatment"])
            
            if llama_advice.get("prevention_methods"):
                pm = llama_advice["prevention_methods"]
                prevention_methods = pm if isinstance(pm, list) else [force_str(pm)]
            if llama_advice.get("possible_causes"):
                pc = llama_advice["possible_causes"]
                possible_causes = pc if isinstance(pc, list) else [force_str(pc)]
    except Exception:
        pass

    # Translate diagnostic text into user's preferred language
    target_lang = (req.language or "en").lower()
    if target_lang != "en":
        try:
            from deep_translator import GoogleTranslator
            translator = GoogleTranslator(source='auto', target=target_lang[:2])
            
            def safe_translate(text):
                if not text or text == "None": return text
                try:
                    return translator.translate(text)
                except Exception:
                    return text

            def translate_with_english_chemicals(text):
                if not text or text == "None": return text
                translated = safe_translate(text)
                # List of common agrochemicals to preserve in English
                chemicals = [
                    "Mancozeb", "Chlorothalonil", "Copper", "Neem", "Azoxystrobin", 
                    "Propiconazole", "Hexaconazole", "Validamycin", "Streptomycin", 
                    "Tetracycline", "Carbendazim", "Captan", "Thiram", "Bordeaux", 
                    "Sulfur", "Imidacloprid", "Thiamethoxam", "Spinosad", "Fungicide", "Pesticide", "Insecticide"
                ]
                found = [c for c in chemicals if c.lower() in text.lower()]
                if found:
                    translated += f" ({', '.join(found)})"
                return translated

            symptoms = safe_translate(symptoms)
            organic_treatment = translate_with_english_chemicals(organic_treatment)
            chemical_treatment = translate_with_english_chemicals(chemical_treatment)
            prevention_methods = safe_translate(prevention_methods)
            possible_causes = safe_translate(possible_causes)
            # Fetch safety_precautions from dictionary and translate
            safety_precautions = prediction_result.get("safety_precautions", "None")
            safety_precautions = translate_with_english_chemicals(safety_precautions)
            prediction_result["safety_precautions"] = safety_precautions
        except Exception as ex:
            print("Phase 4 deep-translator fallback failed:", ex)
            pass

    # --- PHASE 5: AI CROP ADVISOR INTEGRATION ---
    advisor_data = None
    try:
        from backend.app.services.crop_advisor import crop_advisor_service
        advisor_data = crop_advisor_service.generate_advisory(
            crop_name=prediction_result["crop_name"],
            disease_name=prediction_result["disease_name"],
            confidence=float(prediction_result["confidence"]),
            prediction_status=prediction_result.get("prediction_status", "diseased"),
            uncertainty_score=float(prediction_result.get("uncertainty_score", 0.0))
        )
        
        if target_lang != "en" and advisor_data:
            try:
                from deep_translator import GoogleTranslator
                
                # Extract texts that need translation
                organic_texts = advisor_data.get("treatment", {}).get("organic", [])
                chemical_texts = advisor_data.get("treatment", {}).get("chemical", [])
                prevention_texts = advisor_data.get("prevention", [])
                tips_texts = advisor_data.get("tips", [])
                
                # Use robust Google Translate engine instead of LLM to avoid token truncation and hallucinations
                translator = GoogleTranslator(source='auto', target=target_lang[:2]) # te, hi, ta, etc.
                
                def translate_array(arr):
                    if not arr: return []
                    translated = []
                    for text in arr:
                        if not text: continue
                        try:
                            translated.append(translator.translate(text))
                        except Exception:
                            translated.append(text)
                    return translated

                if organic_texts:
                    advisor_data["treatment"]["organic"] = translate_array(organic_texts)
                if chemical_texts:
                    advisor_data["treatment"]["chemical"] = translate_array(chemical_texts)
                if prevention_texts:
                    advisor_data["prevention"] = translate_array(prevention_texts)
                if tips_texts:
                    advisor_data["tips"] = translate_array(tips_texts)
                    
            except Exception as ex:
                print("Deep-translator fallback failed:", ex)
                pass
                
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Crop Advisor generation failed: {e}")

    now = datetime.now(timezone.utc)
    prediction_record = {
        "user_id": str(current_user["id"]),
        "image_path": req.image_path,
        "crop_name": prediction_result["crop_name"],
        "disease_name": prediction_result["disease_name"],
        "confidence": float(prediction_result["confidence"]),
        "prediction_date": now.strftime("%Y-%m-%d"),
        "prediction_time": now.strftime("%H:%M:%S"),
        "prediction_status": prediction_result.get("prediction_status", "diseased"),
        "created_at": now,
        "top_predictions": prediction_result.get("top_predictions", []),
        "prediction_time_ms": float(prediction_result.get("prediction_time_ms", 0.0)),
        "gradcam_base64": prediction_result.get("gradcam_base64"),
        "heatmap_base64": prediction_result.get("heatmap_base64"),
        "comparison_base64": prediction_result.get("comparison_base64"),
        "uncertainty_score": float(prediction_result.get("uncertainty_score", 0.0)),
        "disease_severity": severity,
        "most_affected_region": prediction_result.get("most_affected_region", "None"),
        "possible_causes": possible_causes,
        "similar_diseases": prediction_result.get("similar_diseases", []),
        "symptoms": symptoms,
        "disease_stage": prediction_result.get("disease_stage", "Early"),
        "prevention_methods": prevention_methods,
        "organic_treatment": organic_treatment,
        "chemical_treatment": chemical_treatment,
        "recommended_pesticides": prediction_result.get("recommended_pesticides", []),
        "recommended_fertilizers": prediction_result.get("recommended_fertilizers", []),
        "safety_precautions": prediction_result.get("safety_precautions", "None"),
        "estimated_recovery_probability": float(prediction_result.get("estimated_recovery_probability", 1.0)),
        "recommended_follow_up_actions": prediction_result.get("recommended_follow_up_actions", []),
        "irrigation_suggestions": prediction_result.get("irrigation_suggestions", "None"),
        "environmental_recommendations": prediction_result.get("environmental_recommendations", "None"),
        "advisor": advisor_data
    }

    result = await db.predictions.insert_one(prediction_record)
    prediction_record["id"] = str(result.inserted_id)
    if "_id" in prediction_record:
        del prediction_record["_id"]

    # --- Disease Alert Notification ---
    if prediction_result.get("prediction_status") == "diseased":
        crop = prediction_result.get("crop_name", "Crop")
        disease = prediction_result.get("disease_name", "Unknown disease")
        confidence = round(float(prediction_result.get("confidence", 0)) * 100, 1)
        try:
            dup = await NotificationService.check_duplicate(
                db, str(current_user["id"]), "Disease",
                f"Disease Detected: {disease}", window_hours=2
            )
            if not dup:
                await NotificationService.create_notification(db, NotificationCreate(
                    user_id=str(current_user["id"]),
                    title=f"Disease Detected: {disease}",
                    message=(
                        f"{disease} detected on {crop} with {confidence}% confidence. "
                        "Immediate treatment is recommended. Check your AI scan results for details."
                    ),
                    category="Disease",
                    priority="Critical",
                    action_url="/result"
                ))
        except Exception:
            pass  # Never block the prediction response

    return prediction_record

@router.post("/predict", response_model=PredictionResponse)
async def predict_image(
    req: PredictRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Run model prediction on a previously uploaded image."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    full_image_path = os.path.join(base_dir, req.image_path.replace("/", os.sep))

    if not os.path.exists(full_image_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified image file does not exist on server."
        )

    # Perform prediction
    try:
        prediction_result = predict_crop_disease(
            full_image_path, 
            req.explainer_type,
            crop_filter=getattr(req, "crop_filter", None)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

    # Assert Out-of-Distribution rejection
    if prediction_result.get("raw_label") == "OOD":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=prediction_result["disease_name"]
        )

    # Assert confidence threshold: raise 422 if best prediction confidence < threshold
    from model.configs.config import PipelineConfig
    if prediction_result["confidence"] < PipelineConfig.CONFIDENCE_REJECTION_THRESHOLD:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Low confidence - Please upload another image."
        )

    # Save to MongoDB
    now = datetime.now(timezone.utc)
    
    # 1. Base local diagnostic values
    symptoms = prediction_result.get("symptoms", "None")
    severity = prediction_result.get("disease_severity", "Unknown")
    prevention_methods = prediction_result.get("prevention_methods", [])
    organic_treatment = prediction_result.get("organic_treatment", "None")
    chemical_treatment = prediction_result.get("chemical_treatment", "None")
    possible_causes = prediction_result.get("possible_causes", [])

    # 2. Enrich using NVIDIA Llama 3.1 LLM advisory plan if available
    try:
        from backend.app.services.nvidia_service import nvidia_service
        from backend.app.services.farm_profile_service import FarmProfileService
        active_farm = await FarmProfileService.get_active_farm(db, current_user["id"])
        
        llama_advice = await nvidia_service.generate_farming_advice(
            crop_name=prediction_result["crop_name"],
            disease_name=prediction_result["disease_name"],
            confidence=prediction_result["confidence"],
            farm_profile=active_farm
        )
        if llama_advice:
            def force_str(val):
                if isinstance(val, dict):
                    return ", ".join(f"{k}: {v}" for k, v in val.items())
                elif isinstance(val, list):
                    return ", ".join(map(str, val))
                return str(val) if val else "None"
                
            if llama_advice.get("disease_explanation"):
                symptoms = force_str(llama_advice["disease_explanation"])
            if llama_advice.get("severity"):
                severity = force_str(llama_advice["severity"])
            if llama_advice.get("organic_treatment"):
                organic_treatment = force_str(llama_advice["organic_treatment"])
            if llama_advice.get("chemical_treatment"):
                chemical_treatment = force_str(llama_advice["chemical_treatment"])
            
            if llama_advice.get("prevention_methods"):
                pm = llama_advice["prevention_methods"]
                prevention_methods = pm if isinstance(pm, list) else [force_str(pm)]
            if llama_advice.get("possible_causes"):
                pc = llama_advice["possible_causes"]
                possible_causes = pc if isinstance(pc, list) else [force_str(pc)]
    except Exception:
        # Fallback gracefully to local static diagnostics database if LLM is offline
        pass

    # 3. Translate diagnostic text fields into the user's preferred language
    target_lang = (req.language or "en").lower()
    if target_lang != "en":
        try:
            from backend.app.services.nvidia_service import nvidia_service
            translated = await nvidia_service.translate_diagnosis(
                fields={
                    "symptoms": symptoms,
                    "organic_treatment": organic_treatment,
                    "chemical_treatment": chemical_treatment,
                    "prevention_methods": prevention_methods,
                    "possible_causes": possible_causes,
                },
                language=target_lang
            )
            if translated:
                def force_str(val):
                    if isinstance(val, dict):
                        return ", ".join(f"{k}: {v}" for k, v in val.items())
                    elif isinstance(val, list):
                        return ", ".join(map(str, val))
                    return str(val) if val else "None"
                    
                symptoms = force_str(translated.get("symptoms", symptoms))
                organic_treatment = force_str(translated.get("organic_treatment", organic_treatment))
                chemical_treatment = force_str(translated.get("chemical_treatment", chemical_treatment))
                
                pm = translated.get("prevention_methods", prevention_methods)
                prevention_methods = pm if isinstance(pm, list) else [force_str(pm)]
                pc = translated.get("possible_causes", possible_causes)
                possible_causes = pc if isinstance(pc, list) else [force_str(pc)]
        except Exception:
            pass  # Fallback to English if translation fails

    prediction_record = {
        "user_id": str(current_user["id"]),
        "image_path": req.image_path,
        "crop_name": prediction_result["crop_name"],
        "disease_name": prediction_result["disease_name"],
        "confidence": float(prediction_result["confidence"]),
        "prediction_date": now.strftime("%Y-%m-%d"),
        "prediction_time": now.strftime("%H:%M:%S"),
        "prediction_status": prediction_result["prediction_status"],
        "created_at": now,
        "top_predictions": prediction_result.get("top_predictions", []),
        "prediction_time_ms": float(prediction_result.get("prediction_time_ms", 0.0)),
        "gradcam_base64": prediction_result.get("gradcam_base64"),
        "heatmap_base64": prediction_result.get("heatmap_base64"),
        "comparison_base64": prediction_result.get("comparison_base64"),
        "uncertainty_score": float(prediction_result.get("uncertainty_score", 0.0)),
        "disease_severity": severity,
        "most_affected_region": prediction_result.get("most_affected_region", "None"),
        "possible_causes": possible_causes,
        "similar_diseases": prediction_result.get("similar_diseases", []),
        "symptoms": symptoms,
        "disease_stage": prediction_result.get("disease_stage", "Early"),
        "prevention_methods": prevention_methods,
        "organic_treatment": organic_treatment,
        "chemical_treatment": chemical_treatment,
        "recommended_pesticides": prediction_result.get("recommended_pesticides", []),
        "recommended_fertilizers": prediction_result.get("recommended_fertilizers", []),
        "safety_precautions": prediction_result.get("safety_precautions", "None"),
        "estimated_recovery_probability": float(prediction_result.get("estimated_recovery_probability", 1.0)),
        "recommended_follow_up_actions": prediction_result.get("recommended_follow_up_actions", []),
        "irrigation_suggestions": prediction_result.get("irrigation_suggestions", "None"),
        "environmental_recommendations": prediction_result.get("environmental_recommendations", "None")
    }

    result = await db.predictions.insert_one(prediction_record)
    prediction_record["id"] = str(result.inserted_id)
    if "_id" in prediction_record:
        del prediction_record["_id"]

    # --- Disease Alert Notification ---
    if prediction_result.get("prediction_status") == "diseased":
        crop = prediction_result.get("crop_name", "Crop")
        disease = prediction_result.get("disease_name", "Unknown disease")
        confidence = round(float(prediction_result.get("confidence", 0)) * 100, 1)
        try:
            dup = await NotificationService.check_duplicate(
                db, str(current_user["id"]), "Disease",
                f"Disease Detected: {disease}", window_hours=2
            )
            if not dup:
                await NotificationService.create_notification(db, NotificationCreate(
                    user_id=str(current_user["id"]),
                    title=f"Disease Detected: {disease}",
                    message=(
                        f"{disease} detected on {crop} with {confidence}% confidence. "
                        "Immediate treatment is recommended. Check your AI scan results for details."
                    ),
                    category="Disease",
                    priority="Critical",
                    action_url="/result"
                ))
        except Exception:
            pass  # Never block the prediction response

    return prediction_record

@router.get("/history", response_model=PredictionHistoryResponse)
async def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=5000),
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    user_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Fetch prediction history for current user with filters, search, and pagination. Admins can view all."""
    query = {}
    if current_user.get("role", "").lower() == "admin":
        if user_id:
            query["user_id"] = user_id
    else:
        query["user_id"] = str(current_user["id"])

    if search:
        query["$or"] = [
            {"crop_name": {"$regex": search, "$options": "i"}},
            {"disease_name": {"$regex": search, "$options": "i"}}
        ]
    
    if status_filter:
        query["prediction_status"] = status_filter.lower()

    # Total counts
    total = await db.predictions.count_documents(query)
    pages = (total + limit - 1) // limit if total > 0 else 1

    # Fetch and parse
    skip = (page - 1) * limit
    cursor = db.predictions.find(query).sort("created_at", -1).skip(skip).limit(limit)
    records = await cursor.to_list(length=limit)

    # Fetch user details for admin view
    user_cache = {}
    if current_user.get("role", "").lower() == "admin" and records:
        unique_user_ids = list(set([r["user_id"] for r in records if "user_id" in r]))
        if unique_user_ids:
            try:
                object_ids = [ObjectId(uid) for uid in unique_user_ids if ObjectId.is_valid(uid)]
                users = await db.users.find({"_id": {"$in": object_ids}}).to_list(length=None)
                for u in users:
                    user_cache[str(u["_id"])] = {
                        "name": u.get("name") or u.get("full_name") or "Unknown Farmer",
                        "email": u.get("email") or ""
                    }
            except Exception:
                pass

    for rec in records:
        rec["id"] = str(rec["_id"])
        
        # Inject farmer info
        if "user_id" in rec and rec["user_id"] in user_cache:
            rec["farmer_name"] = user_cache[rec["user_id"]]["name"]
            rec["farmer_email"] = user_cache[rec["user_id"]]["email"]
        elif "user_id" in rec and rec["user_id"] == str(current_user["id"]):
            rec["farmer_name"] = current_user.get("name") or current_user.get("full_name")
            rec["farmer_email"] = current_user.get("email")
            
        # Ensure proper UTC ISO strings for frontend parsing
        if "created_at" in rec and isinstance(rec["created_at"], datetime):
            dt = rec["created_at"]
            rec["created_at"] = dt.isoformat() + ("Z" if dt.tzinfo is None else "")

    return {
        "predictions": records,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.delete("/history/{id}", status_code=status.HTTP_200_OK)
async def delete_history_record(
    id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Delete a prediction record and remove the associated uploaded image from server."""
    if not ObjectId.is_valid(id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid history record ID format."
        )

    # Find the record to verify ownership
    record = await db.predictions.find_one({"_id": ObjectId(id)})
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found."
        )

    if record["user_id"] != str(current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot delete another user's record."
        )

    # Delete prediction from database
    await db.predictions.delete_one({"_id": ObjectId(id)})

    # Remove file from local system if it exists
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    image_file_path = os.path.join(base_dir, record["image_path"].replace("/", os.sep))
    
    if os.path.exists(image_file_path):
        try:
            os.remove(image_file_path)
        except Exception:
            # Non-blocking, file could be locked or already deleted
            pass

    return {"message": "Record successfully deleted."}

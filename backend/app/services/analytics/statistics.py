from datetime import timezone
from typing import Dict, Any, List

async def calculate_summary_stats(db, match_stage: dict) -> Dict[str, Any]:
    """Calculates basic count statistics and averages."""
    base_query = dict(match_stage)
    
    # Total Scans
    total_scans = await db.predictions.count_documents(base_query)
    
    # Healthy vs Diseased (excluding agrochemical scans)
    disease_base = dict(base_query)
    disease_base["crop_name"] = {"$ne": "Agrochemical Product"}
    
    healthy_query = dict(disease_base)
    healthy_query["prediction_status"] = "healthy"
    healthy_plants = await db.predictions.count_documents(healthy_query)
    
    diseased_query = dict(disease_base)
    diseased_query["prediction_status"] = "diseased"
    diseased_plants = await db.predictions.count_documents(diseased_query)
    
    # Plant Identification Count (where prediction_status might be plant_identification or we can check crop_name presence but no disease_name)
    # Based on the system, Plant ID doesn't currently save to `predictions`. If it does in the future, we'd query it.
    # For now we'll query anything marked as plant_identification.
    plant_id_query = dict(base_query)
    plant_id_query["prediction_status"] = "plant_identification"
    plant_id_count = await db.predictions.count_documents(plant_id_query)
    
    # Disease Diagnosis Count (total minus agrochemical and pure plant ID)
    disease_diagnosis_count = healthy_plants + diseased_plants
    
    # Agrochemical Scans
    agro_query = dict(base_query)
    agro_query["crop_name"] = "Agrochemical Product"
    agrochemical_scans = await db.predictions.count_documents(agro_query)
    
    # Averages
    pipeline = [{"$match": base_query}] if base_query else []
    pipeline.append({
        "$group": {
            "_id": None,
            "avg_confidence": {"$avg": "$confidence"},
            "avg_inference_time": {"$avg": "$prediction_time_ms"}
        }
    })
    
    avg_cursor = db.predictions.aggregate(pipeline)
    avg_docs = await avg_cursor.to_list(length=1)
    
    avg_conf = 0.0
    avg_time = 0.0
    if avg_docs:
        avg_conf = avg_docs[0].get("avg_confidence", 0.0) or 0.0
        avg_time = avg_docs[0].get("avg_inference_time", 0.0) or 0.0
        
    scan_success_rate = 1.0 # default to 100% unless we track failures in DB
    
    return {
        "counts": {
            "total_scans": total_scans,
            "healthy_plants": healthy_plants,
            "diseased_plants": diseased_plants,
            "plant_identification": plant_id_count,
            "disease_diagnosis": disease_diagnosis_count,
            "agrochemical_scans": agrochemical_scans
        },
        "performance": {
            "average_confidence": round(avg_conf, 4),
            "average_inference_time_ms": round(avg_time, 2),
            "scan_success_rate": scan_success_rate
        }
    }

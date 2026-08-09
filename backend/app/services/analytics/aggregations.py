from datetime import timezone
from typing import List, Dict, Any

def get_top_crops_pipeline(match_stage: dict, limit: int = 5) -> List[Dict[str, Any]]:
    """Pipeline to get top diagnosed crops, excluding Agrochemical scans."""
    pipeline = [{"$match": {"crop_name": {"$ne": "Agrochemical Product"}}}]
    if match_stage:
        pipeline[0]["$match"].update(match_stage)
        
    pipeline.extend([
        {"$group": {"_id": "$crop_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "name": "$_id", "count": 1}}
    ])
    return pipeline

def get_top_diseases_pipeline(match_stage: dict, limit: int = 5) -> List[Dict[str, Any]]:
    """Pipeline to get top diagnosed diseases, excluding Healthy and Agrochemical scans."""
    pipeline = [{"$match": {
        "prediction_status": "diseased",
        "crop_name": {"$ne": "Agrochemical Product"}
    }}]
    if match_stage:
        pipeline[0]["$match"].update(match_stage)
        
    pipeline.extend([
        {"$group": {"_id": "$disease_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "name": "$_id", "count": 1}}
    ])
    return pipeline

def get_top_agrochemicals_pipeline(match_stage: dict, limit: int = 5) -> List[Dict[str, Any]]:
    """Pipeline to get top scanned agrochemical products."""
    pipeline = [{"$match": {"crop_name": "Agrochemical Product"}}]
    if match_stage:
        pipeline[0]["$match"].update(match_stage)
        
    pipeline.extend([
        {"$group": {"_id": "$disease_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0, "name": "$_id", "count": 1}}
    ])
    return pipeline

def get_time_series_pipeline(match_stage: dict, grouping: str = "daily") -> List[Dict[str, Any]]:
    """
    Pipeline to get scan counts over time.
    grouping can be 'daily', 'weekly', or 'monthly'
    """
    pipeline = []
    if match_stage:
        pipeline.append({"$match": match_stage})
        
    if grouping == "daily":
        date_format = "%Y-%m-%d"
    elif grouping == "weekly":
        date_format = "%Y-%U" # Year and Week number
    elif grouping == "monthly":
        date_format = "%Y-%m"
    else:
        date_format = "%Y-%m-%d"

    pipeline.extend([
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": date_format,
                        "date": "$created_at"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "date": "$_id", "count": 1}}
    ])
    
    return pipeline

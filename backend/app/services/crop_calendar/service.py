import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

STAGES_DATA = [
    {
        "stage_name": "Seed Selection",
        "duration_days": 7,
        "activities": ["Select certified disease-resistant hybrid seed variety.", "Perform seed germination viability test."],
        "fertilizer_schedule": ["Bio-fertilizer seed treatment with Azotobacter."],
        "irrigation_schedule": "Pre-sowing soil moistening (100 L/acre)",
        "pest_monitoring": ["Monitor for soil-borne cutworms and ants."],
        "disease_monitoring": ["Inspect for damping-off fungal spores."]
    },
    {
        "stage_name": "Sowing",
        "duration_days": 5,
        "activities": ["Prepare raised beds with proper drainage channels.", "Sow seeds at 1.5cm depth with 60cm row spacing."],
        "fertilizer_schedule": ["Apply basal dose: Single Super Phosphate (SSP) 50kg/acre."],
        "irrigation_schedule": "Gentle sprinkler moistening daily morning",
        "pest_monitoring": ["Inspect seedbed border rows."],
        "disease_monitoring": ["Ensure seed treatment fungicide coating."]
    },
    {
        "stage_name": "Germination",
        "duration_days": 10,
        "activities": ["Thin seedlings to maintain 45cm spacing.", "Perform gentle manual weeding."],
        "fertilizer_schedule": ["Apply starter nitrogen dose (Urea 15kg/acre)."],
        "irrigation_schedule": "Drip irrigation 20 mins every 48 hours",
        "pest_monitoring": ["Monitor for early flea beetles and thrips."],
        "disease_monitoring": ["Check seedling stems for Pythium rot."]
    },
    {
        "stage_name": "Vegetative",
        "duration_days": 35,
        "activities": ["Prune suckers below first flower cluster.", "Stake plants with bamboo supports."],
        "fertilizer_schedule": ["Apply N-P-K 19-19-19 foliar spray (5g/L) weekly."],
        "irrigation_schedule": "Drip irrigation 45 mins every 2 days (4000 L/acre)",
        "pest_monitoring": ["Trap whiteflies using yellow sticky sheets."],
        "disease_monitoring": ["AI Disease Scan for Early/Late Blight leaf spots."]
    },
    {
        "stage_name": "Flowering",
        "duration_days": 20,
        "activities": ["Maintain optimal bee pollination micro-climate.", "Avoid foliar sprays during peak morning blooms."],
        "fertilizer_schedule": ["Apply Calcium Nitrate + Boron foliar spray (2g/L)."],
        "irrigation_schedule": "Consistent moisture: Drip irrigation 60 mins every 2 days",
        "pest_monitoring": ["Check blossom clusters for thrips and mites."],
        "disease_monitoring": ["Inspect flowers for Botrytis gray mold."]
    },
    {
        "stage_name": "Fruiting",
        "duration_days": 30,
        "activities": ["Support heavy fruit clusters with trellis ties.", "Mulch base to prevent fruit-soil contact."],
        "fertilizer_schedule": ["Apply High Potassium dose (MOP 25kg/acre)."],
        "irrigation_schedule": "Deep drip irrigation 60 mins every 3 days",
        "pest_monitoring": ["Monitor for fruit borer larvae."],
        "disease_monitoring": ["Scan fruit surface for Alternaria rot spots."]
    },
    {
        "stage_name": "Harvest",
        "duration_days": 15,
        "activities": ["Harvest ripe fruit during cool morning hours.", "Grade and pack in ventilated crates."],
        "fertilizer_schedule": ["Post-harvest compost replenishment."],
        "irrigation_schedule": "Taper off irrigation 5 days prior to final pick",
        "pest_monitoring": ["Check storage crates for fruit flies."],
        "disease_monitoring": ["Inspect harvested fruit for post-harvest rot."]
    }
]

class CropCalendarService:
    async def get_crop_calendar(
        self,
        crop_name: str = "Tomato",
        current_stage: str = "Vegetative",
        days_since_sowing: int = 42
    ) -> Dict[str, Any]:
        start_time = time.time()

        stages: List[Dict[str, Any]] = []
        total_days = sum(s["duration_days"] for s in STAGES_DATA)

        for s in STAGES_DATA:
            is_active = s["stage_name"].lower() == current_stage.lower()
            stages.append({
                **s,
                "is_active": is_active
            })

        processing_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "metadata": {
                "api_version": "1.0",
                "generated_at": datetime.now(timezone.utc).isoformat() + "Z",
                "processing_time_ms": processing_time_ms,
                "cache_status": "Live",
                "cache_expires_in": 1800
            },
            "crop_name": crop_name,
            "current_stage": current_stage,
            "days_since_sowing": days_since_sowing,
            "total_lifecycle_days": total_days,
            "stages": stages
        }

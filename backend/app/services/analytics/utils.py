from datetime import datetime, timedelta, timezone
from typing import Tuple, Optional

def parse_time_range(time_range: str, start_date_str: Optional[str] = None, end_date_str: Optional[str] = None) -> Tuple[Optional[datetime], Optional[datetime]]:
    """
    Parses a time_range string (e.g. 'today', '7d', '30d', '90d', '1y', 'custom') 
    and returns a tuple of (start_datetime, end_datetime).
    If no filter is needed, returns (None, None).
    """
    now = datetime.now(timezone.utc)
    
    if time_range == 'today':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start, now
    elif time_range == '7d':
        return now - timedelta(days=7), now
    elif time_range == '30d':
        return now - timedelta(days=30), now
    elif time_range == '90d':
        return now - timedelta(days=90), now
    elif time_range == '1y':
        return now - timedelta(days=365), now
    elif time_range == 'custom' and start_date_str and end_date_str:
        try:
            start = datetime.strptime(start_date_str, "%Y-%m-%d")
            # Set end to end of day
            end = datetime.strptime(end_date_str, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            return start, end
        except ValueError:
            # Fallback to no filter on parsing error
            return None, None
            
    # Default is no filter
    return None, None
    
def build_date_match_stage(start_date: Optional[datetime], end_date: Optional[datetime]) -> dict:
    """
    Builds the MongoDB $match stage for the created_at date field.
    Returns empty dict if no dates provided.
    """
    if not start_date or not end_date:
        return {}
        
    return {
        "created_at": {
            "$gte": start_date,
            "$lte": end_date
        }
    }

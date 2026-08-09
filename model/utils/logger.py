import logging
import os
import sys

def get_logger(name="AI_Pipeline"):
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger
        
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s", "%Y-%m-%d %H:%M:%S")
    
    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(formatter)
    logger.addHandler(ch)
    
    # File handler (optional log save to root directory)
    log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "evaluation", "reports")
    try:
        os.makedirs(log_dir, exist_ok=True)
        fh = logging.FileHandler(os.path.join(log_dir, "pipeline_run.log"), encoding="utf-8")
        fh.setFormatter(formatter)
        logger.addHandler(fh)
    except Exception:
        # Non-blocking if directory cannot be created at initialization
        pass
        
    return logger

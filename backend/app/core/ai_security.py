from datetime import timezone
import re
from typing import Tuple
from fastapi import HTTPException, status

MAX_PROMPT_LENGTH = 1000

# Common prompt injection / jailbreak patterns
JAILBREAK_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|above)\s+instructions",
    r"system\s*override",
    r"you\s+are\s+now\s+in\s+DAN\s+mode",
    r"do\s+anything\s+now",
    r"bypass\s+safety\s+filters",
    r"pretend\s+you\s+have\s+no\s+restrictions",
    r"disregard\s+prior\s+rules",
    r"developer\s+mode\s+enabled",
    r"<\|im_start\|>",
    r"<\|im_end\|>"
]

def sanitize_prompt(prompt_text: str) -> str:
    """Sanitize prompt string by stripping dangerous HTML or control tags."""
    if not prompt_text:
        return ""
    # Strip HTML tags
    cleaned = re.sub(r'<[^>]*>', '', prompt_text)
    # Strip non-printable ASCII / control characters
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', cleaned)
    return cleaned.strip()

def detect_prompt_injection(prompt_text: str) -> Tuple[bool, str]:
    """
    Inspect prompt text for known jailbreak / prompt injection patterns.
    Returns (is_malicious, reasoning).
    """
    if not prompt_text:
        return False, "Empty prompt"

    if len(prompt_text) > MAX_PROMPT_LENGTH:
        return True, f"Prompt length ({len(prompt_text)} chars) exceeds maximum limit of {MAX_PROMPT_LENGTH} characters."

    for pattern in JAILBREAK_PATTERNS:
        if re.search(pattern, prompt_text, re.IGNORECASE):
            return True, f"Prompt injection / jailbreak pattern detected: '{pattern}'"

    return False, "Prompt passed security validation."

def validate_ai_prompt(prompt_text: str) -> str:
    """
    FastAPI helper to validate and sanitize AI prompts.
    Raises HTTP 400 if malicious or oversized.
    Returns sanitized prompt.
    """
    is_malicious, reason = detect_prompt_injection(prompt_text)
    if is_malicious:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Security violation in AI Prompt: {reason}"
        )
    return sanitize_prompt(prompt_text)

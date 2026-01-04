import os
from fastapi import Header, HTTPException

def verify_api_key(x_api_key: str = Header(None)):
    expected_key = os.getenv("AI_API_KEY")
    if not expected_key or x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized")

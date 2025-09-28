# utils/image_utils.py
import requests
import numpy as np
import cv2
from deepface import DeepFace
from typing import Optional
import os
import base64

DEBUG_LOAD = True

def load_image_from_source(path: Optional[str], url: Optional[str]):
    """
    Load image from an http(s) url, a data URL (data:image/...), or a local filesystem path.
    Returns an OpenCV BGR image or None on failure.
    """
    # Handle data URL first
    if url and isinstance(url, str) and url.startswith("data:image"):
        try:
            header, b64data = url.split(',', 1)
            raw = base64.b64decode(b64data)
            arr = np.frombuffer(raw, np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if DEBUG_LOAD:
                print(f"[AI-IMG] dataURL decode {'OK' if img is not None else 'FAIL'} len={len(b64data)}")
            return img
        except Exception as e:
            if DEBUG_LOAD:
                print("[AI-IMG] dataURL error", e)
            return None
    if url:
        try:
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            arr = np.frombuffer(resp.content, np.uint8)
            img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if DEBUG_LOAD:
                print(f"[AI-IMG] http url load {'OK' if img is not None else 'FAIL'}")
            return img
        except Exception as e:
            if DEBUG_LOAD:
                print("[AI-IMG] url error", e)
            return None
    if path and os.path.exists(path):
        try:
            img = cv2.imread(path)
            if DEBUG_LOAD:
                print(f"[AI-IMG] path load {'OK' if img is not None else 'FAIL'} {path}")
            return img
        except Exception as e:
            if DEBUG_LOAD:
                print("[AI-IMG] path error", e)
            return None
    if DEBUG_LOAD:
        print("[AI-IMG] no valid source provided")
    return None


def compute_embedding(image_bgr):
    """
    Compute embedding for a BGR image using DeepFace (Facenet).
    image_bgr: OpenCV image in BGR color space.
    Returns numpy array embedding or None.
    """
    try:
        # convert to RGB for DeepFace
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        reps = DeepFace.represent(img_path=image_rgb, model_name="Facenet", enforce_detection=False)
        if isinstance(reps, list) and len(reps) > 0 and "embedding" in reps[0]:
            import numpy as np
            return np.array(reps[0]["embedding"], dtype=float)
    except Exception as e:
        # print("compute_embedding error:", e)
        return None
    return None


def cosine_distance(vec_a, vec_b):
    import numpy as np
    a = vec_a / (np.linalg.norm(vec_a) + 1e-12)
    b = vec_b / (np.linalg.norm(vec_b) + 1e-12)
    return 1.0 - float(np.dot(a, b))
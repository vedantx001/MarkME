import os
import numpy as np
from insightface.app import FaceAnalysis

# ------------------------------------------------------------------
# Render / low-memory safety settings (MUST be before model loading)
# ------------------------------------------------------------------
os.environ["MPLBACKEND"] = "Agg"
os.environ["MPLCONFIGDIR"] = "/tmp/matplotlib"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

# ------------------------------------------------------------------
# Lazy-loaded InsightFace app (singleton)
# ------------------------------------------------------------------
_face_app = None


def get_face_app() -> FaceAnalysis:
    """
    Lazily initializes and returns the InsightFace FaceAnalysis app.
    This prevents large memory usage at server startup.
    """
    global _face_app

    if _face_app is None:
        app = FaceAnalysis(
            name="buffalo_l",  # keep accuracy; switch to buffalo_s if needed
            providers=["CPUExecutionProvider"]
        )
        app.prepare(ctx_id=0, det_size=(640, 640))
        _face_app = app

    return _face_app


# ------------------------------------------------------------------
# Face embedding extraction
# ------------------------------------------------------------------
def get_embeddings_from_image(image_array: np.ndarray) -> list[np.ndarray]:
    """
    Detect faces in the given image and extract embeddings.

    Args:
        image_array (np.ndarray): RGB image array.

    Returns:
        list[np.ndarray]: List of 512-D face embeddings.
    """
    face_app = get_face_app()
    faces = face_app.get(image_array)

    return [face.embedding for face in faces]


# ------------------------------------------------------------------
# Cosine similarity computation
# ------------------------------------------------------------------
def compute_similarity(feat1: np.ndarray, feat2: np.ndarray) -> float:
    """
    Compute cosine similarity between two face embeddings.

    Returns:
        float: Similarity score in range [-1, 1]
    """
    feat1 = feat1.astype(np.float32)
    feat2 = feat2.astype(np.float32)

    norm_a = np.linalg.norm(feat1)
    norm_b = np.linalg.norm(feat2)

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    similarity = np.dot(feat1, feat2) / (norm_a * norm_b)
    return float(np.clip(similarity, -1.0, 1.0))

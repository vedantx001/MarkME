import numpy as np
from insightface.app import FaceAnalysis

# Initialize InsightFace App globally ONCE

# Use below code when you are using CPU
# using buffalo_l model and CPU provider as requested
app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])


# Below code Use only when you are using GPU
# app = FaceAnalysis(name="buffalo_l", providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
app.prepare(ctx_id=0, det_size=(640, 640))

def get_embeddings_from_image(image_array: np.ndarray) -> list[np.ndarray]:
    """
    Detects faces in the given image and extracts embeddings.
    
    Args:
        image_array (np.ndarray): Input image in RGB format.
        
    Returns:
        list[np.ndarray]: A list of face embeddings (NumPy arrays).
                          Returns an empty list if no faces are detected.
    """
    # Detect faces
    faces = app.get(image_array)
    
    # Extract embeddings
    embeddings = [face.embedding for face in faces]
    
    return embeddings

def compute_similarity(feat1: np.ndarray, feat2: np.ndarray) -> float:
    """
    Computes the cosine similarity between two face embeddings.
    
    Args:
        feat1 (np.ndarray): First embedding vector.
        feat2 (np.ndarray): Second embedding vector.
        
    Returns:
        float: Cosine similarity score between -1 and 1.
    """
    # Ensure inputs are float arrays
    feat1 = feat1.astype(float)
    feat2 = feat2.astype(float)
    
    # Compute dot product and norms
    dot_product = np.dot(feat1, feat2)
    norm_a = np.linalg.norm(feat1)
    norm_b = np.linalg.norm(feat2)
    
    # Avoid division by zero
    if norm_a == 0 or norm_b == 0:
        return 0.0
        
    similarity = dot_product / (norm_a * norm_b)
    
    # Clamp result to [-1, 1] to handle potential floating point errors
    return float(np.clip(similarity, -1.0, 1.0))
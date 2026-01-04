from fastapi import APIRouter, HTTPException, Depends
from typing import List, Set
from core.security import verify_api_key
import logging
import os
from dotenv import load_dotenv

load_dotenv()

face_similarity_threshold = float(os.getenv("FACE_SIMILARITY_THRESHOLD", 0.45))
max_classroom_images = int(os.getenv("MAX_CLASSROOM_IMAGES", 4))   

from models.schemas import GenerateEmbeddingRequest, RecognizeRequest
from core.utils import download_image
from core.face_processor import get_embeddings_from_image, compute_similarity
from database.mongo import get_known_encodings, save_student_embedding

router = APIRouter(
    dependencies=[Depends(verify_api_key)]
)
logger = logging.getLogger(__name__)

@router.post("/generate-embedding")
async def generate_embedding(request: GenerateEmbeddingRequest):
    """
    Generates and saves a face embedding for a student.
    """
    try:
        # 1. Download image
        image_array = download_image(request.imageUrl)
        
        # 2. Detect faces
        embeddings = get_embeddings_from_image(image_array)
        
        # 3. Handle detection results
        if not embeddings:
            raise HTTPException(status_code=400, detail="No face detected in the image")
        
        # 4. Use first detected face (assuming one student per profile picture)
        # If multiple faces, we pick the first one as per checking logic, 
        # or we could error out. Requirement said: "Use ONLY the first detected face embedding."
        target_embedding = embeddings[0]
        
        # 5. Save to MongoDB
        # Convert numpy array to list for JSON serialization/storage
        embedding_list = target_embedding.tolist()
        
        save_student_embedding(request.studentId, request.classId, embedding_list)
        
        return {"message": "Embedding generated and saved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/recognize")
async def recognize_students(request: RecognizeRequest):
    """
    Recognizes students in classroom images.
    """
    # Validation checked by Pydantic, but enforcing max 4 limits
    if len(request.imageUrls) > max_classroom_images:
         raise HTTPException(status_code=400, detail=f"Maximum {max_classroom_images} images allowed")
         
    try:
        # Step A: Load known embeddings
        known_encodings = get_known_encodings(request.classId)
        if not known_encodings:
            return {"presentStudentIds": []}
            
        # Step B: Initialize deduplication
        present_students: Set[str] = set()
        
        # Step C: Process images
        for url in request.imageUrls:
            try:
                # 1. Download
                image = download_image(url)
                
                # 2. Detect
                embeddings = get_embeddings_from_image(image)
                if not embeddings:
                    continue
                    
                # 3. Compare
                for face_embedding in embeddings:
                    for student_id, known_emb in known_encodings.items():
                        # known_emb is list from DB, need convert to numpy for calculation if not handled in utils
                        # compute_similarity handles casting to float ndarray
                        
                        import numpy as np
                        # DB returns list, convert to np array
                        known_emb_arr = np.array(known_emb)
                        
                        similarity = compute_similarity(face_embedding, known_emb_arr)
                        
                        if similarity > face_similarity_threshold:
                            present_students.add(student_id)
                            # Dont break, one face might match multiple (unlikely but possible if strict), 
                            # or we want to find best match? 
                            # Requirement: "If similarity > 0.45: Add... Do NOT remove..."
                            # Usually we take max similarity, but here simple threshold is requested.
                            
            except Exception as e:
                # Log and continue as per "Do NOT crash on missing faces or broken images"
                logger.warning(f"Failed to process image {url}: {str(e)}")
                continue
                
        # Step D: Response
        return {"presentStudentIds": list(present_students)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in recognition: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

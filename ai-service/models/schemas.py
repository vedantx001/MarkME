from pydantic import BaseModel, validator
from typing import List

class GenerateEmbeddingRequest(BaseModel):
    """
    Request model for generating a face embedding for a student.
    """
    imageUrl: str
    studentId: str
    classId: str

class RecognizeRequest(BaseModel):
    """
    Request model for recognizing faces in a list of images against a specific class.
    """
    classId: str
    imageUrls: List[str]

    @validator('imageUrls')
    def validate_image_urls(cls, v):
        if not v:
            raise ValueError('imageUrls must be a non-empty list')
        return v

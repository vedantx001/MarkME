import os
from dotenv import load_dotenv



# 1. Environment setup (MUST happen before other imports)
load_dotenv()

host = os.getenv("HOST")
port = os.getenv("PORT")    

from fastapi import FastAPI     
from routers import face_routes


# 2. FastAPI app initialization
app = FastAPI(title="Attendance AI Service")

# 3. Router inclusion
app.include_router(face_routes.router, prefix="/api/ai")

# 4. Health check endpoint
@app.get("/")
async def health_check():
    """
    Simple health check endpoint to verify service status.
    """
    return {
        "status": "online",
        "model": "insightface-buffalo_l"
    }

if __name__ == "__main__":
    import uvicorn
    # Allow running directly for debugging
    uvicorn.run(app, host=host, port=port)

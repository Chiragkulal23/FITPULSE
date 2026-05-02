from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Enable CORS as requested
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to frontend URL via os.getenv("FRONTEND_URL")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Fitness Tracker API (FastAPI) is running"}

@app.get("/api/healthz")
async def health():
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)

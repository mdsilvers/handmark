from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="GradeBot API",
    description="AI-powered grading API for K-12 teachers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "GradeBot API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Import routers here
# from app.api.v1 import auth, users, classes, assignments, submissions, grades
# app.include_router(auth.router, prefix="/v1/auth", tags=["auth"])
# app.include_router(users.router, prefix="/v1/users", tags=["users"])
# ...

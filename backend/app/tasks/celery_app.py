"""Celery app for background tasks"""
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "gradebot",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Import tasks here
# from app.tasks import grading_tasks

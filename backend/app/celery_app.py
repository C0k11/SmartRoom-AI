from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "room_design_ai",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.analysis_tasks",
        "app.tasks.design_tasks",
        "app.tasks.export_tasks",
    ],
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 minutes
    task_soft_time_limit=540,  # 9 minutes
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    result_expires=3600,  # 1 hour
)

# Task routing
celery_app.conf.task_routes = {
    "app.tasks.analysis_tasks.*": {"queue": "analysis"},
    "app.tasks.design_tasks.*": {"queue": "design"},
    "app.tasks.export_tasks.*": {"queue": "export"},
}

# Rate limiting
celery_app.conf.task_annotations = {
    "app.tasks.design_tasks.generate_design_image": {
        "rate_limit": "10/m",  # 10 per minute
    },
    "app.tasks.analysis_tasks.analyze_room_image": {
        "rate_limit": "20/m",  # 20 per minute
    },
}


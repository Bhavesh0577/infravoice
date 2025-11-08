import logging
from sqlalchemy.orm import Session

from app.db.base import Base, engine
from app.db.session import SessionLocal
from app.core.constants import SubscriptionTier
from app.core.security import hash_password

logger = logging.getLogger(__name__)


def init_db(db: Session = None) -> None:
    """Initialize database with tables and seed data"""
    # Import all models here to ensure they are registered with Base
    from app.models import user, deployment, security_scan, cost_estimate
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # Create default admin user if needed
    if db:
        from app.models.user import User
        admin = db.query(User).filter(User.email == "admin@infravoice.com").first()
        if not admin:
            admin_user = User(
                email="admin@infravoice.com",
                username="admin",
                password_hash=hash_password("admin123"),
                subscription_tier=SubscriptionTier.ENTERPRISE,
                api_quota=10000,
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            logger.info("Created default admin user")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()
    print("Database initialized successfully!")

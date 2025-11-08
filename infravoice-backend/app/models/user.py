import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.core.constants import SubscriptionTier, API_QUOTAS


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    
    # Subscription
    subscription_tier = Column(String, default=SubscriptionTier.FREE, nullable=False)
    api_quota = Column(Integer, default=API_QUOTAS[SubscriptionTier.FREE])
    api_calls_used = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    deployments = relationship("Deployment", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.username} ({self.email})>"
    
    @property
    def quota_remaining(self) -> int:
        """Calculate remaining API quota"""
        return max(0, self.api_quota - self.api_calls_used)
    
    @property
    def is_quota_exceeded(self) -> bool:
        """Check if user has exceeded their API quota"""
        return self.api_calls_used >= self.api_quota

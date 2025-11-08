import uuid
from datetime import datetime
from sqlalchemy import Column, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class CostEstimate(Base):
    """Cost estimate model"""
    __tablename__ = "cost_estimates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False)
    
    # Cost details
    monthly_cost = Column(Float, nullable=False)
    annual_cost = Column(Float, nullable=False)
    
    # Cost breakdown by resource (dict)
    breakdown = Column(JSONB, nullable=True, default=dict)
    
    # Optimization recommendations (array of objects)
    recommendations = Column(JSONB, nullable=True, default=list)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    deployment = relationship("Deployment", back_populates="cost_estimates")
    
    def __repr__(self):
        return f"<CostEstimate {self.id} (monthly: ${self.monthly_cost:.2f})>"

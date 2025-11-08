import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class SecurityScan(Base):
    """Security scan model"""
    __tablename__ = "security_scans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey("deployments.id", ondelete="CASCADE"), nullable=False)
    
    # Scan results
    security_score = Column(Float, nullable=False)  # 0-10 scale
    passed_checks = Column(Integer, default=0)
    failed_checks = Column(Integer, default=0)
    
    # Issue counts by severity
    critical_issues = Column(Integer, default=0)
    high_issues = Column(Integer, default=0)
    medium_issues = Column(Integer, default=0)
    low_issues = Column(Integer, default=0)
    
    # Detailed issues (array of objects)
    issues = Column(JSONB, nullable=True, default=list)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    deployment = relationship("Deployment", back_populates="security_scans")
    
    def __repr__(self):
        return f"<SecurityScan {self.id} (score: {self.security_score})>"

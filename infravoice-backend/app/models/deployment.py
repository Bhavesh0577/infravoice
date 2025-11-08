import uuid
import json
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.core.constants import CloudProvider, DeploymentStatus


class Deployment(Base):
    """Deployment model"""
    __tablename__ = "deployments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Deployment details
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cloud_provider = Column(SQLEnum(CloudProvider), nullable=False)
    region = Column(String, nullable=False)
    
    # Terraform code
    terraform_code = Column(Text, nullable=True)  # JSON string with main.tf, variables.tf, outputs.tf
    
    # Status
    status = Column(SQLEnum(DeploymentStatus), default=DeploymentStatus.PENDING, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # Resources
    resources = Column(Text, nullable=True)  # JSON array of resource types
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deployed_at = Column(DateTime, nullable=True)
    destroyed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="deployments")
    security_scans = relationship("SecurityScan", back_populates="deployment", cascade="all, delete-orphan")
    cost_estimates = relationship("CostEstimate", back_populates="deployment", cascade="all, delete-orphan")
    
    @property
    def resources_list(self) -> Optional[List[str]]:
        """Parse resources JSON string to list"""
        if self.resources:
            try:
                return json.loads(self.resources)
            except (json.JSONDecodeError, TypeError):
                return []
        return []
    
    def __repr__(self):
        return f"<Deployment {self.name} ({self.cloud_provider}/{self.region})>"

from datetime import datetime
from typing import Optional, List, Union
import json
from pydantic import BaseModel, Field, field_validator
from uuid import UUID

from app.core.constants import CloudProvider, DeploymentStatus


class DeploymentBase(BaseModel):
    """Base deployment schema"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    cloud_provider: CloudProvider
    region: str


class DeploymentCreate(DeploymentBase):
    """Schema for deployment creation"""
    pass


class TerraformCode(BaseModel):
    """Schema for Terraform code"""
    main_tf: str
    variables_tf: str
    outputs_tf: str


class DeploymentResponse(DeploymentBase):
    """Schema for deployment response"""
    id: UUID
    user_id: UUID
    terraform_code: Optional[str]
    status: DeploymentStatus
    error_message: Optional[str]
    resources: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime
    deployed_at: Optional[datetime]
    destroyed_at: Optional[datetime]
    
    @field_validator('resources', mode='before')
    @classmethod
    def parse_resources(cls, v):
        """Parse resources from JSON string if needed"""
        if v is None:
            return []
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return []
        if isinstance(v, list):
            return v
        return []
    
    class Config:
        from_attributes = True


class DeploymentUpdate(BaseModel):
    """Schema for deployment update"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    terraform_code: Optional[str] = None
    status: Optional[DeploymentStatus] = None


class DeploymentStats(BaseModel):
    """Schema for deployment statistics"""
    total_deployments: int
    active_deployments: int
    failed_deployments: int
    total_cost: float
    success_rate: float

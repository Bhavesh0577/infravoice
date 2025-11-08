from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from uuid import UUID


class ResourceCost(BaseModel):
    """Schema for individual resource cost"""
    name: str
    type: str
    monthly_cost: float
    percentage: float


class CostOptimization(BaseModel):
    """Schema for cost optimization recommendation"""
    title: str
    description: str
    potential_savings: float
    priority: str  # high, medium, low


class CostEstimateRequest(BaseModel):
    """Schema for cost estimation request"""
    terraform_code: str = Field(..., min_length=1)
    deployment_id: Optional[UUID] = None


class CostEstimateResponse(BaseModel):
    """Schema for cost estimate response"""
    id: UUID
    deployment_id: Optional[UUID]
    monthly_cost: float
    annual_cost: float
    breakdown: Dict[str, float]
    resource_costs: List[ResourceCost]
    recommendations: List[CostOptimization]
    created_at: datetime
    warning: Optional[str] = None
    message: str = "Cost estimate completed"
    
    class Config:
        from_attributes = True

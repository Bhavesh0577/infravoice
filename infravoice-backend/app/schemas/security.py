from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import UUID


class SecurityIssue(BaseModel):
    """Schema for security issue"""
    check_id: str
    severity: str
    title: str
    description: str
    resource: str
    file_path: str = "main.tf"
    line_number: Optional[int] = None
    guideline: Optional[str] = None


class SecurityScanRequest(BaseModel):
    """Schema for security scan request"""
    terraform_code: str = Field(..., min_length=1)
    deployment_id: Optional[UUID] = None


class SecurityScanResponse(BaseModel):
    """Schema for security scan response"""
    id: UUID
    deployment_id: Optional[UUID]
    security_score: float = Field(..., ge=0.0, le=10.0)
    passed_checks: int
    failed_checks: int
    critical_issues: int
    high_issues: int
    medium_issues: int
    low_issues: int
    issues: List[SecurityIssue]
    created_at: datetime
    message: str = "Security scan completed"
    
    class Config:
        from_attributes = True

from typing import List, Optional
from pydantic import BaseModel, Field

from app.core.constants import CloudProvider


class CodeGenerationRequest(BaseModel):
    """Schema for code generation request"""
    description: str = Field(..., min_length=10, max_length=2000)
    cloud_provider: CloudProvider
    region: str = Field(..., min_length=2, max_length=50)


class CodeGenerationResponse(BaseModel):
    """Schema for code generation response"""
    deployment_id: str
    main_tf: str
    variables_tf: str
    outputs_tf: str
    resources: List[str]
    message: str = "Terraform code generated successfully"


class CodeUpdateRequest(BaseModel):
    """Schema for code update request"""
    terraform_code: str = Field(..., min_length=1)

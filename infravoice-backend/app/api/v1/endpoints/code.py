import json
import logging
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.constants import DeploymentStatus
from app.db.session import get_db
from app.models.user import User
from app.models.deployment import Deployment
from app.schemas.code import CodeGenerationRequest, CodeGenerationResponse, CodeUpdateRequest
from app.schemas.deployment import DeploymentResponse
from app.services.code_service import get_terraform_generator

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=CodeGenerationResponse, status_code=status.HTTP_201_CREATED)
async def generate_terraform_code(
    request: CodeGenerationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate Terraform code from natural language description"""
    try:
        # Check API quota
        if current_user.is_quota_exceeded:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"API quota exceeded. Used {current_user.api_calls_used}/{current_user.api_quota}"
            )
        
        logger.info(f"Generating Terraform for user {current_user.email}: {request.description[:100]}")
        
        # Create deployment record
        deployment = Deployment(
            user_id=current_user.id,
            name=request.description[:100],  # Use first 100 chars as name
            description=request.description,
            cloud_provider=request.cloud_provider,
            region=request.region,
            status=DeploymentStatus.GENERATING
        )
        db.add(deployment)
        db.commit()
        db.refresh(deployment)
        
        try:
            # Generate Terraform code
            terraform_generator = get_terraform_generator()
            terraform_code = await terraform_generator.generate_terraform(
                description=request.description,
                cloud_provider=request.cloud_provider,
                region=request.region
            )
            
            # Store code in deployment
            deployment.terraform_code = json.dumps({
                "main_tf": terraform_code["main_tf"],
                "variables_tf": terraform_code["variables_tf"],
                "outputs_tf": terraform_code["outputs_tf"]
            })
            deployment.resources = json.dumps(terraform_code.get("resources", []))
            deployment.status = DeploymentStatus.GENERATED
            
            # Increment API calls counter
            current_user.api_calls_used += 1
            
            db.commit()
            db.refresh(deployment)
            
            logger.info(f"Terraform code generated successfully for deployment {deployment.id}")
            
            return CodeGenerationResponse(
                deployment_id=str(deployment.id),
                main_tf=terraform_code["main_tf"],
                variables_tf=terraform_code["variables_tf"],
                outputs_tf=terraform_code["outputs_tf"],
                resources=terraform_code.get("resources", [])
            )
            
        except Exception as e:
            # Update deployment status to failed
            deployment.status = DeploymentStatus.FAILED
            deployment.error_message = str(e)
            db.commit()
            raise
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Code generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Terraform code: {str(e)}"
        )


@router.get("/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(
    deployment_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get deployment by ID"""
    try:
        deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
        
        if not deployment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deployment not found"
            )
        
        # Verify ownership
        if deployment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this deployment"
            )
        
        return deployment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get deployment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve deployment"
        )


@router.put("/{deployment_id}", response_model=DeploymentResponse)
async def update_deployment_code(
    deployment_id: UUID,
    update_data: CodeUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update Terraform code for a deployment"""
    try:
        deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
        
        if not deployment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deployment not found"
            )
        
        # Verify ownership
        if deployment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this deployment"
            )
        
        # Update code
        deployment.terraform_code = update_data.terraform_code
        deployment.status = DeploymentStatus.GENERATED
        
        db.commit()
        db.refresh(deployment)
        
        logger.info(f"Updated deployment {deployment_id}")
        return deployment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update deployment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update deployment"
        )

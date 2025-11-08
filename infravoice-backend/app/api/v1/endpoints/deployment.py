import logging
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.core.constants import DeploymentStatus
from app.db.session import get_db
from app.models.user import User
from app.models.deployment import Deployment
from app.schemas.deployment import DeploymentResponse, DeploymentStats

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[DeploymentResponse])
async def list_deployments(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status_filter: Optional[DeploymentStatus] = None,
    cloud_provider: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List user's deployments with pagination and filters"""
    try:
        query = db.query(Deployment).filter(Deployment.user_id == current_user.id)
        
        # Apply filters
        if status_filter:
            query = query.filter(Deployment.status == status_filter)
        if cloud_provider:
            query = query.filter(Deployment.cloud_provider == cloud_provider)
        
        # Order by created_at descending
        query = query.order_by(Deployment.created_at.desc())
        
        # Pagination
        deployments = query.offset(skip).limit(limit).all()
        
        return deployments
        
    except Exception as e:
        logger.error(f"Failed to list deployments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve deployments"
        )


@router.get("/stats", response_model=DeploymentStats)
async def get_deployment_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get deployment statistics for the current user"""
    try:
        # Total deployments
        total = db.query(func.count(Deployment.id)).filter(
            Deployment.user_id == current_user.id
        ).scalar()
        
        # Active deployments (deployed status)
        active = db.query(func.count(Deployment.id)).filter(
            Deployment.user_id == current_user.id,
            Deployment.status == DeploymentStatus.DEPLOYED
        ).scalar()
        
        # Failed deployments
        failed = db.query(func.count(Deployment.id)).filter(
            Deployment.user_id == current_user.id,
            Deployment.status == DeploymentStatus.FAILED
        ).scalar()
        
        # Success rate
        success_rate = ((total - failed) / total * 100) if total > 0 else 0.0
        
        # Total cost (sum of latest cost estimates)
        # TODO: Implement proper cost calculation from cost_estimates table
        total_cost = 0.0
        
        return DeploymentStats(
            total_deployments=total,
            active_deployments=active,
            failed_deployments=failed,
            total_cost=total_cost,
            success_rate=round(success_rate, 1)
        )
        
    except Exception as e:
        logger.error(f"Failed to get deployment stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve deployment statistics"
        )


@router.get("/{deployment_id}", response_model=DeploymentResponse)
async def get_deployment(
    deployment_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a single deployment by ID"""
    try:
        deployment = db.query(Deployment).filter(
            Deployment.id == deployment_id,
            Deployment.user_id == current_user.id
        ).first()
        
        if not deployment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deployment not found"
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


@router.post("/{deployment_id}/deploy")
async def deploy_infrastructure(
    deployment_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deploy infrastructure using Terraform"""
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
                detail="Not authorized to deploy this infrastructure"
            )
        
        # Check if code is generated
        if not deployment.terraform_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Terraform code to deploy"
            )
        
        # Update status to deploying
        deployment.status = DeploymentStatus.DEPLOYING
        db.commit()
        
        # TODO: Implement actual Terraform deployment
        # This would involve:
        # 1. Writing Terraform files to temp directory
        # 2. Running terraform init
        # 3. Running terraform plan
        # 4. Running terraform apply
        # 5. Streaming logs via WebSocket
        # 6. Updating deployment status
        
        logger.info(f"Deployment initiated: {deployment_id}")
        
        return {
            "message": "Deployment initiated",
            "deployment_id": str(deployment_id),
            "status": "deploying"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deployment failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deploy infrastructure: {str(e)}"
        )


@router.delete("/{deployment_id}")
async def destroy_deployment(
    deployment_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Destroy deployed infrastructure"""
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
                detail="Not authorized to destroy this deployment"
            )
        
        # Update status
        deployment.status = DeploymentStatus.DESTROYING
        db.commit()
        
        # TODO: Implement terraform destroy
        
        logger.info(f"Destroy initiated: {deployment_id}")
        
        return {
            "message": "Destroy initiated",
            "deployment_id": str(deployment_id),
            "status": "destroying"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Destroy failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to destroy deployment: {str(e)}"
        )

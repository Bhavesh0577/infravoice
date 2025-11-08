import json
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.deployment import Deployment
from app.models.cost_estimate import CostEstimate
from app.schemas.cost import CostEstimateRequest, CostEstimateResponse, ResourceCost
from app.services.cost_service import get_cost_estimator

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/estimate", response_model=CostEstimateResponse, status_code=status.HTTP_201_CREATED)
async def estimate_terraform_cost(
    request: CostEstimateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Estimate infrastructure costs using Infracost"""
    try:
        # Verify deployment ownership if deployment_id provided
        if request.deployment_id:
            deployment = db.query(Deployment).filter(
                Deployment.id == request.deployment_id
            ).first()
            
            if not deployment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Deployment not found"
                )
            
            if deployment.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this deployment"
                )
        
        logger.info(f"Starting cost estimation for user {current_user.email}")
        
        # Parse terraform code
        try:
            terraform_code = json.loads(request.terraform_code)
        except json.JSONDecodeError:
            # If not JSON, assume it's just main.tf
            terraform_code = {
                "main_tf": request.terraform_code,
                "variables_tf": "",
                "outputs_tf": ""
            }
        
        # Run cost estimation
        cost_estimator = get_cost_estimator()
        cost_result = await cost_estimator.estimate_cost(terraform_code)
        
        # Create cost estimate record
        cost_estimate = CostEstimate(
            deployment_id=request.deployment_id,
            monthly_cost=cost_result["monthly_cost"],
            annual_cost=cost_result["annual_cost"],
            breakdown=cost_result["breakdown"],
            recommendations=cost_result["recommendations"]
        )
        
        db.add(cost_estimate)
        db.commit()
        db.refresh(cost_estimate)
        
        logger.info(f"Cost estimation completed: {cost_estimate.id} (${cost_estimate.monthly_cost:.2f}/month)")
        
        return CostEstimateResponse(
            id=cost_estimate.id,
            deployment_id=cost_estimate.deployment_id,
            monthly_cost=cost_estimate.monthly_cost,
            annual_cost=cost_estimate.annual_cost,
            breakdown=cost_estimate.breakdown,
            resource_costs=cost_result.get("resource_costs", []),
            recommendations=cost_estimate.recommendations,
            created_at=cost_estimate.created_at,
            warning=cost_result.get("warning")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cost estimation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to estimate costs: {str(e)}"
        )


@router.get("/{deployment_id}/cost", response_model=CostEstimateResponse)
async def get_deployment_cost(
    deployment_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get latest cost estimate for a deployment"""
    try:
        # Verify deployment ownership
        deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
        
        if not deployment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Deployment not found"
            )
        
        if deployment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this deployment"
            )
        
        # Get latest cost estimate
        cost_estimate = db.query(CostEstimate).filter(
            CostEstimate.deployment_id == deployment_id
        ).order_by(CostEstimate.created_at.desc()).first()
        
        if not cost_estimate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No cost estimate found for this deployment"
            )
        
        # Build resource costs from breakdown
        resource_costs = []
        total_cost = cost_estimate.monthly_cost
        for name, cost in cost_estimate.breakdown.items():
            percentage = (cost / total_cost * 100) if total_cost > 0 else 0
            resource_costs.append(ResourceCost(
                name=name,
                type="resource",
                monthly_cost=cost,
                percentage=round(percentage, 1)
            ))
        
        return CostEstimateResponse(
            id=cost_estimate.id,
            deployment_id=cost_estimate.deployment_id,
            monthly_cost=cost_estimate.monthly_cost,
            annual_cost=cost_estimate.annual_cost,
            breakdown=cost_estimate.breakdown,
            resource_costs=resource_costs,
            recommendations=cost_estimate.recommendations,
            created_at=cost_estimate.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get cost estimate: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve cost estimate"
        )

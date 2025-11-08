import json
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.deployment import Deployment
from app.models.security_scan import SecurityScan
from app.schemas.security import SecurityScanRequest, SecurityScanResponse
from app.services.security_service import get_security_scanner

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/scan", response_model=SecurityScanResponse, status_code=status.HTTP_201_CREATED)
async def scan_terraform_code(
    request: SecurityScanRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Scan Terraform code for security issues using Checkov"""
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
        
        logger.info(f"Starting security scan for user {current_user.email}")
        
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
        
        # Run security scan
        security_scanner = get_security_scanner()
        scan_result = await security_scanner.scan_terraform(terraform_code)
        
        # Create security scan record
        security_scan = SecurityScan(
            deployment_id=request.deployment_id,
            security_score=scan_result["security_score"],
            passed_checks=scan_result["passed_checks"],
            failed_checks=scan_result["failed_checks"],
            critical_issues=scan_result["critical_issues"],
            high_issues=scan_result["high_issues"],
            medium_issues=scan_result["medium_issues"],
            low_issues=scan_result["low_issues"],
            issues=scan_result["issues"]
        )
        
        db.add(security_scan)
        db.commit()
        db.refresh(security_scan)
        
        logger.info(f"Security scan completed: {security_scan.id} (score: {security_scan.security_score})")
        
        return SecurityScanResponse(
            id=security_scan.id,
            deployment_id=security_scan.deployment_id,
            security_score=security_scan.security_score,
            passed_checks=security_scan.passed_checks,
            failed_checks=security_scan.failed_checks,
            critical_issues=security_scan.critical_issues,
            high_issues=security_scan.high_issues,
            medium_issues=security_scan.medium_issues,
            low_issues=security_scan.low_issues,
            issues=security_scan.issues,
            created_at=security_scan.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Security scan failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to scan Terraform code: {str(e)}"
        )


@router.get("/{scan_id}", response_model=SecurityScanResponse)
async def get_security_scan(
    scan_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get security scan by ID"""
    try:
        security_scan = db.query(SecurityScan).filter(SecurityScan.id == scan_id).first()
        
        if not security_scan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Security scan not found"
            )
        
        # Verify ownership through deployment
        if security_scan.deployment_id:
            deployment = db.query(Deployment).filter(
                Deployment.id == security_scan.deployment_id
            ).first()
            
            if deployment and deployment.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this scan"
                )
        
        return SecurityScanResponse(
            id=security_scan.id,
            deployment_id=security_scan.deployment_id,
            security_score=security_scan.security_score,
            passed_checks=security_scan.passed_checks,
            failed_checks=security_scan.failed_checks,
            critical_issues=security_scan.critical_issues,
            high_issues=security_scan.high_issues,
            medium_issues=security_scan.medium_issues,
            low_issues=security_scan.low_issues,
            issues=security_scan.issues,
            created_at=security_scan.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get security scan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve security scan"
        )

import json
import subprocess
import tempfile
import os
import logging
from typing import Dict, List

from app.core.config import settings

logger = logging.getLogger(__name__)


class CheckovSecurityScanner:
    """Service for security scanning using Checkov"""
    
    def __init__(self):
        """Initialize Checkov scanner"""
        self.checkov_path = settings.CHECKOV_PATH
        logger.info("Checkov Security Scanner initialized")
    
    async def scan_terraform(self, terraform_code: Dict[str, str]) -> Dict[str, any]:
        """
        Scan Terraform code for security issues using Checkov
        
        Args:
            terraform_code: Dict with main_tf, variables_tf, outputs_tf
            
        Returns:
            Dict with security score and issues
        """
        try:
            logger.info("Starting Checkov security scan")
            
            # Create temporary directory for Terraform files
            with tempfile.TemporaryDirectory() as temp_dir:
                # Write Terraform files
                main_path = os.path.join(temp_dir, "main.tf")
                vars_path = os.path.join(temp_dir, "variables.tf")
                outputs_path = os.path.join(temp_dir, "outputs.tf")
                
                with open(main_path, 'w') as f:
                    f.write(terraform_code.get("main_tf", ""))
                with open(vars_path, 'w') as f:
                    f.write(terraform_code.get("variables_tf", ""))
                with open(outputs_path, 'w') as f:
                    f.write(terraform_code.get("outputs_tf", ""))
                
                # Run Checkov
                result = await self._run_checkov(temp_dir)
                
                # Calculate security score
                security_data = self._calculate_security_score(result)
                
                logger.info(f"Security scan completed: score {security_data['security_score']:.1f}/10")
                return security_data
                
        except Exception as e:
            logger.error(f"Security scan failed: {str(e)}")
            raise RuntimeError(f"Failed to scan Terraform code: {str(e)}")
    
    async def _run_checkov(self, directory: str) -> Dict:
        """Run Checkov subprocess and return results"""
        try:
            # Run checkov with JSON output
            cmd = [
                self.checkov_path,
                "-d", directory,
                "-o", "json",
                "--compact",
                "--quiet"
            ]
            
            logger.debug(f"Running command: {' '.join(cmd)}")
            
            # Run subprocess
            process = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            # Checkov returns non-zero exit code when issues are found
            # So we don't check returncode
            
            # Parse JSON output
            if process.stdout:
                try:
                    result = json.loads(process.stdout)
                    return result
                except json.JSONDecodeError:
                    logger.warning("Failed to parse Checkov JSON output")
                    return {"results": {"passed_checks": [], "failed_checks": []}}
            
            return {"results": {"passed_checks": [], "failed_checks": []}}
            
        except subprocess.TimeoutExpired:
            logger.error("Checkov scan timed out")
            raise RuntimeError("Security scan timed out")
        except FileNotFoundError:
            logger.error(f"Checkov not found at {self.checkov_path}")
            raise RuntimeError("Checkov is not installed or not found in PATH")
        except Exception as e:
            logger.error(f"Checkov execution failed: {str(e)}")
            raise RuntimeError(f"Failed to run Checkov: {str(e)}")
    
    def _calculate_security_score(self, checkov_result: Dict) -> Dict[str, any]:
        """Calculate security score from Checkov results"""
        
        # Extract results
        results = checkov_result.get("results", {})
        passed_checks = results.get("passed_checks", [])
        failed_checks = results.get("failed_checks", [])
        
        passed_count = len(passed_checks)
        failed_count = len(failed_checks)
        total_checks = passed_count + failed_count
        
        # Count by severity
        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        }
        
        issues = []
        
        for check in failed_checks:
            # Get severity with fallback to MEDIUM if None or missing
            severity_raw = check.get("severity") or "MEDIUM"
            severity = severity_raw.lower() if isinstance(severity_raw, str) else "medium"
            if severity == "critical":
                severity_counts["critical"] += 1
            elif severity == "high":
                severity_counts["high"] += 1
            elif severity == "medium":
                severity_counts["medium"] += 1
            else:
                severity_counts["low"] += 1
            
            # Build issue object with safe string defaults
            issue = {
                "check_id": check.get("check_id") or "",
                "severity": severity,
                "title": check.get("check_name") or "",
                "description": check.get("description") or "",
                "resource": check.get("resource") or "",
                "file_path": check.get("file_path") or "main.tf",
                "line_number": check.get("file_line_range", [0])[0] if check.get("file_line_range") else None,
                "guideline": check.get("guideline") or ""
            }
            issues.append(issue)
        
        # Calculate score (0-10)
        if total_checks == 0:
            security_score = 7.0  # Default score if no checks
        else:
            # Base score on pass rate
            pass_rate = passed_count / total_checks
            
            # Penalize based on severity
            penalty = (
                severity_counts["critical"] * 2.0 +
                severity_counts["high"] * 1.0 +
                severity_counts["medium"] * 0.5 +
                severity_counts["low"] * 0.2
            )
            
            # Calculate final score
            security_score = max(0, min(10, (pass_rate * 10) - (penalty * 0.5)))
        
        return {
            "security_score": round(security_score, 2),
            "passed_checks": passed_count,
            "failed_checks": failed_count,
            "critical_issues": severity_counts["critical"],
            "high_issues": severity_counts["high"],
            "medium_issues": severity_counts["medium"],
            "low_issues": severity_counts["low"],
            "issues": issues
        }


# Singleton instance
_security_scanner = None


def get_security_scanner() -> CheckovSecurityScanner:
    """Get or create security scanner singleton"""
    global _security_scanner
    if _security_scanner is None:
        _security_scanner = CheckovSecurityScanner()
    return _security_scanner

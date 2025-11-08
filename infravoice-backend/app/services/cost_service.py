import json
import subprocess
import tempfile
import os
import logging
from typing import Dict, List

from app.core.config import settings
from app.core.constants import COST_WARNING_THRESHOLD

logger = logging.getLogger(__name__)


class InfracostEstimator:
    """Service for cost estimation using Infracost"""
    
    def __init__(self):
        """Initialize Infracost estimator"""
        self.infracost_path = settings.INFRACOST_PATH
        logger.info("Infracost Estimator initialized")
    
    async def estimate_cost(self, terraform_code: Dict[str, str]) -> Dict[str, any]:
        """
        Estimate infrastructure costs using Infracost
        
        Args:
            terraform_code: Dict with main_tf, variables_tf, outputs_tf
            
        Returns:
            Dict with monthly cost, annual cost, breakdown, and recommendations
        """
        try:
            logger.info("Starting Infracost cost estimation")
            
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
                
                # Run Infracost
                result = await self._run_infracost(temp_dir)
                
                # Parse and process results
                cost_data = self._process_cost_data(result)
                
                logger.info(f"Cost estimation completed: ${cost_data['monthly_cost']:.2f}/month")
                return cost_data
                
        except Exception as e:
            logger.error(f"Cost estimation failed: {str(e)}")
            # Return fallback estimate instead of failing
            return self._get_fallback_estimate(terraform_code)
    
    async def _run_infracost(self, directory: str) -> Dict:
        """Run Infracost subprocess and return results"""
        try:
            # Run infracost breakdown with JSON output
            cmd = [
                self.infracost_path,
                "breakdown",
                "--path", directory,
                "--format", "json"
            ]
            
            logger.debug(f"Running command: {' '.join(cmd)}")
            
            # Run subprocess
            process = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
                env={**os.environ, "INFRACOST_SKIP_UPDATE_CHECK": "true"}
            )
            
            if process.returncode != 0:
                logger.warning(f"Infracost returned non-zero exit code: {process.returncode}")
                logger.warning(f"stderr: {process.stderr}")
            
            # Parse JSON output
            if process.stdout:
                try:
                    result = json.loads(process.stdout)
                    return result
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse Infracost JSON output: {e}")
                    return {}
            
            return {}
            
        except subprocess.TimeoutExpired:
            logger.error("Infracost estimation timed out")
            raise RuntimeError("Cost estimation timed out")
        except FileNotFoundError:
            logger.error(f"Infracost not found at {self.infracost_path}")
            raise RuntimeError("Infracost is not installed or not found in PATH")
        except Exception as e:
            logger.error(f"Infracost execution failed: {str(e)}")
            raise RuntimeError(f"Failed to run Infracost: {str(e)}")
    
    def _process_cost_data(self, infracost_result: Dict) -> Dict[str, any]:
        """Process Infracost results into standardized format"""
        
        # Extract total cost
        total_monthly_cost = infracost_result.get("totalMonthlyCost", "0")
        try:
            monthly_cost = float(total_monthly_cost)
        except (ValueError, TypeError):
            monthly_cost = 0.0
        
        annual_cost = monthly_cost * 12
        
        # Extract resource breakdown
        breakdown = {}
        resource_costs = []
        
        projects = infracost_result.get("projects", [])
        for project in projects:
            for resource in project.get("breakdown", {}).get("resources", []):
                name = resource.get("name", "unknown")
                resource_type = resource.get("resourceType", "unknown")
                cost = resource.get("monthlyCost")
                
                try:
                    cost_value = float(cost) if cost else 0.0
                except (ValueError, TypeError):
                    cost_value = 0.0
                
                if cost_value > 0:
                    breakdown[name] = cost_value
                    
                    # Calculate percentage
                    percentage = (cost_value / monthly_cost * 100) if monthly_cost > 0 else 0
                    
                    resource_costs.append({
                        "name": name,
                        "type": resource_type,
                        "monthly_cost": round(cost_value, 2),
                        "percentage": round(percentage, 1)
                    })
        
        # Sort resource costs by cost (descending)
        resource_costs.sort(key=lambda x: x["monthly_cost"], reverse=True)
        
        # Generate optimization recommendations
        recommendations = self._generate_recommendations(monthly_cost, resource_costs)
        
        # Check for cost warning
        warning = None
        if monthly_cost > COST_WARNING_THRESHOLD:
            warning = f"Monthly cost exceeds ${COST_WARNING_THRESHOLD:,.0f} threshold"
        
        return {
            "monthly_cost": round(monthly_cost, 2),
            "annual_cost": round(annual_cost, 2),
            "breakdown": breakdown,
            "resource_costs": resource_costs,
            "recommendations": recommendations,
            "warning": warning
        }
    
    def _generate_recommendations(self, monthly_cost: float, resource_costs: List[Dict]) -> List[Dict]:
        """Generate cost optimization recommendations"""
        recommendations = []
        
        # Check for expensive resources
        for resource in resource_costs[:5]:  # Top 5 most expensive
            if resource["monthly_cost"] > 100:
                # Generic recommendation for expensive resources
                recommendations.append({
                    "title": f"Review {resource['type']} sizing",
                    "description": f"{resource['name']} costs ${resource['monthly_cost']:.2f}/month. Consider right-sizing or using spot/reserved instances.",
                    "potential_savings": round(resource["monthly_cost"] * 0.3, 2),  # Estimate 30% savings
                    "priority": "high" if resource["monthly_cost"] > 200 else "medium"
                })
        
        # General recommendations
        if monthly_cost > 500:
            recommendations.append({
                "title": "Consider Reserved Instances",
                "description": "Your infrastructure could benefit from reserved instances or savings plans for predictable workloads.",
                "potential_savings": round(monthly_cost * 0.35, 2),  # 35% typical RI savings
                "priority": "high"
            })
        
        if monthly_cost > 200:
            recommendations.append({
                "title": "Enable Auto-Scaling",
                "description": "Implement auto-scaling to match resource capacity with actual demand and reduce idle costs.",
                "potential_savings": round(monthly_cost * 0.20, 2),  # 20% typical savings
                "priority": "medium"
            })
        
        return recommendations
    
    def _get_fallback_estimate(self, terraform_code: Dict[str, str]) -> Dict[str, any]:
        """Generate fallback estimate when Infracost is unavailable"""
        
        # Simple heuristic-based estimation
        main_tf = terraform_code.get("main_tf", "")
        
        # Count resource types (very rough estimate)
        import re
        resources = re.findall(r'resource\s+"([^"]+)"', main_tf)
        
        # Rough cost estimates per resource type
        cost_map = {
            "aws_instance": 50,
            "aws_db_instance": 100,
            "aws_lb": 25,
            "aws_nat_gateway": 45,
            "aws_vpn_gateway": 40,
            "google_compute_instance": 50,
            "google_sql_database_instance": 100,
            "azurerm_virtual_machine": 50,
            "azurerm_sql_database": 100,
        }
        
        monthly_cost = 0.0
        breakdown = {}
        resource_costs = []
        
        for i, resource_type in enumerate(resources):
            cost = cost_map.get(resource_type, 20)  # Default $20/month
            monthly_cost += cost
            resource_name = f"{resource_type}_{i}"
            breakdown[resource_name] = cost
            
            resource_costs.append({
                "name": resource_name,
                "type": resource_type,
                "monthly_cost": cost,
                "percentage": 0  # Will calculate after total known
            })
        
        # Calculate percentages
        for rc in resource_costs:
            rc["percentage"] = round((rc["monthly_cost"] / monthly_cost * 100) if monthly_cost > 0 else 0, 1)
        
        annual_cost = monthly_cost * 12
        
        return {
            "monthly_cost": round(monthly_cost, 2),
            "annual_cost": round(annual_cost, 2),
            "breakdown": breakdown,
            "resource_costs": resource_costs,
            "recommendations": [
                {
                    "title": "Estimate based on heuristics",
                    "description": "This is a rough estimate. Install Infracost for accurate cost estimation.",
                    "potential_savings": 0,
                    "priority": "low"
                }
            ],
            "warning": "This is a fallback estimate - Infracost is not available"
        }


# Singleton instance
_cost_estimator = None


def get_cost_estimator() -> InfracostEstimator:
    """Get or create cost estimator singleton"""
    global _cost_estimator
    if _cost_estimator is None:
        _cost_estimator = InfracostEstimator()
    return _cost_estimator

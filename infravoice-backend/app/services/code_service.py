import json
import logging
import re
from typing import Dict, List
import google.generativeai as genai

from app.core.config import settings
from app.core.constants import CloudProvider

logger = logging.getLogger(__name__)


class GeminiTerraformGenerator:
    """Service for generating Terraform code using Google Gemini"""
    
    def __init__(self):
        """Initialize Gemini client"""
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        logger.info("Gemini Terraform Generator initialized")
    
    def _build_system_prompt(self, cloud_provider: CloudProvider, region: str) -> str:
        """Build system prompt for Terraform generation"""
        return f"""You are an expert Infrastructure-as-Code engineer specializing in Terraform.

CRITICAL REQUIREMENTS:
1. Generate production-ready, secure, and cost-optimized Terraform code
2. Follow cloud provider best practices for {cloud_provider.value.upper()}
3. Implement security best practices (encryption, least privilege, network isolation)
4. Use variables for configurable parameters
5. Include comprehensive outputs for important resources
6. Add comments explaining key configurations
7. Use resource naming conventions
8. Implement proper tagging/labeling
9. Enable monitoring and logging where applicable
10. Consider cost optimization (right-sizing, reserved instances where appropriate)

TARGET CLOUD: {cloud_provider.value.upper()}
REGION: {region}

OUTPUT FORMAT:
Generate three separate Terraform files:

1. main.tf - Main resource definitions
2. variables.tf - Variable declarations with descriptions and defaults
3. outputs.tf - Output values for important resources

IMPORTANT: 
- Respond ONLY with valid Terraform HCL code
- Separate the three files with the markers: "### main.tf", "### variables.tf", "### outputs.tf"
- Do not include any explanatory text outside the code blocks
- Ensure all code is syntactically correct and follows Terraform 1.x conventions
"""
    
    async def generate_terraform(
        self,
        description: str,
        cloud_provider: CloudProvider,
        region: str
    ) -> Dict[str, str]:
        """
        Generate Terraform code from natural language description
        
        Args:
            description: Natural language description of infrastructure
            cloud_provider: Target cloud provider
            region: Target region
            
        Returns:
            Dict with main_tf, variables_tf, outputs_tf, and resources list
        """
        try:
            logger.info(f"Generating Terraform for {cloud_provider.value} in {region}")
            
            # Build prompt
            system_prompt = self._build_system_prompt(cloud_provider, region)
            user_prompt = f"Generate Terraform code for the following infrastructure:\n\n{description}"
            
            # Generate with Gemini
            response = self.model.generate_content(
                f"{system_prompt}\n\n{user_prompt}",
                generation_config={
                    "temperature": 0.3,  # Lower temperature for more consistent code
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 8192,
                }
            )
            
            generated_text = response.text
            logger.debug(f"Generated response length: {len(generated_text)} characters")
            
            # Parse response into separate files
            terraform_code = self._parse_terraform_files(generated_text)
            
            # Extract resource list
            resources = self._extract_resources(terraform_code["main_tf"])
            terraform_code["resources"] = resources
            
            logger.info(f"Successfully generated Terraform code with {len(resources)} resources")
            return terraform_code
            
        except Exception as e:
            logger.error(f"Terraform generation failed: {str(e)}")
            raise RuntimeError(f"Failed to generate Terraform code: {str(e)}")
    
    def _parse_terraform_files(self, generated_text: str) -> Dict[str, str]:
        """Parse generated text into separate Terraform files"""
        
        # Initialize with defaults
        terraform_code = {
            "main_tf": "",
            "variables_tf": "",
            "outputs_tf": ""
        }
        
        # Try to extract files using markers
        main_match = re.search(r'###\s*main\.tf\s*\n(.*?)(?=###|$)', generated_text, re.DOTALL | re.IGNORECASE)
        vars_match = re.search(r'###\s*variables\.tf\s*\n(.*?)(?=###|$)', generated_text, re.DOTALL | re.IGNORECASE)
        outputs_match = re.search(r'###\s*outputs\.tf\s*\n(.*?)(?=###|$)', generated_text, re.DOTALL | re.IGNORECASE)
        
        if main_match:
            terraform_code["main_tf"] = self._clean_code_block(main_match.group(1))
        if vars_match:
            terraform_code["variables_tf"] = self._clean_code_block(vars_match.group(1))
        if outputs_match:
            terraform_code["outputs_tf"] = self._clean_code_block(outputs_match.group(1))
        
        # Fallback: if markers not found, try to split by code blocks
        if not terraform_code["main_tf"]:
            code_blocks = re.findall(r'```(?:hcl|terraform)?\n(.*?)```', generated_text, re.DOTALL)
            if len(code_blocks) >= 3:
                terraform_code["main_tf"] = code_blocks[0].strip()
                terraform_code["variables_tf"] = code_blocks[1].strip()
                terraform_code["outputs_tf"] = code_blocks[2].strip()
            elif len(code_blocks) == 1:
                # Single code block - use as main.tf
                terraform_code["main_tf"] = code_blocks[0].strip()
        
        # Ensure we have at least main.tf
        if not terraform_code["main_tf"]:
            terraform_code["main_tf"] = self._clean_code_block(generated_text)
        
        # Add default variables if empty
        if not terraform_code["variables_tf"]:
            terraform_code["variables_tf"] = self._generate_default_variables()
        
        return terraform_code
    
    def _clean_code_block(self, code: str) -> str:
        """Clean code block by removing markdown formatting"""
        # Remove code fence markers
        code = re.sub(r'```(?:hcl|terraform)?', '', code)
        # Remove excessive blank lines
        code = re.sub(r'\n\s*\n\s*\n', '\n\n', code)
        return code.strip()
    
    def _generate_default_variables(self) -> str:
        """Generate default variables.tf"""
        return """variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "region" {
  description = "Cloud region"
  type        = string
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
"""
    
    def _extract_resources(self, main_tf: str) -> List[str]:
        """Extract resource types from main.tf"""
        resources = []
        
        # Match resource blocks: resource "type" "name"
        resource_pattern = r'resource\s+"([^"]+)"\s+"[^"]+"'
        matches = re.findall(resource_pattern, main_tf)
        
        # Get unique resource types
        resources = list(set(matches))
        
        return sorted(resources)


# Singleton instance
_terraform_generator = None


def get_terraform_generator() -> GeminiTerraformGenerator:
    """Get or create Terraform generator singleton"""
    global _terraform_generator
    if _terraform_generator is None:
        _terraform_generator = GeminiTerraformGenerator()
    return _terraform_generator

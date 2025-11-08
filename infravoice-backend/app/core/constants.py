from enum import Enum


class CloudProvider(str, Enum):
    """Supported cloud providers"""
    AWS = "aws"
    GCP = "gcp"
    AZURE = "azure"


class DeploymentStatus(str, Enum):
    """Deployment status options"""
    PENDING = "pending"
    GENERATING = "generating"
    GENERATED = "generated"
    SCANNING = "scanning"
    ESTIMATING = "estimating"
    READY = "ready"
    DEPLOYING = "deploying"
    DEPLOYED = "deployed"
    FAILED = "failed"
    DESTROYING = "destroying"
    DESTROYED = "destroyed"


class SubscriptionTier(str, Enum):
    """User subscription tiers"""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class SecuritySeverity(str, Enum):
    """Security issue severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


# API Quotas by subscription tier
API_QUOTAS = {
    SubscriptionTier.FREE: 100,
    SubscriptionTier.PRO: 1000,
    SubscriptionTier.ENTERPRISE: 10000,
}

# Supported audio formats
SUPPORTED_AUDIO_FORMATS = ["audio/mpeg", "audio/wav", "audio/webm", "audio/mp4"]
SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".webm", ".m4a"]

# Terraform file names
TERRAFORM_FILES = {
    "main": "main.tf",
    "variables": "variables.tf",
    "outputs": "outputs.tf",
}

# Security score thresholds
SECURITY_SCORE_EXCELLENT = 8.0
SECURITY_SCORE_GOOD = 6.0
SECURITY_SCORE_POOR = 4.0

# Cost warning threshold (monthly)
COST_WARNING_THRESHOLD = 1000.0  # $1000/month

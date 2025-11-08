# InfraVoice Backend

FastAPI-based backend for InfraVoice - Voice-powered Infrastructure-as-Code platform.

## 🚀 Features

- **JWT Authentication**: Secure user authentication with access and refresh tokens
- **Voice Transcription**: Local Whisper model for audio-to-text conversion
- **AI Code Generation**: Google Gemini 2.5 Pro for Terraform code generation
- **Security Scanning**: Automated Checkov security analysis
- **Cost Estimation**: Infracost integration for infrastructure cost estimation
- **API Rate Limiting**: User-based API quotas
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis for session management and caching

## 📋 Requirements

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Terraform 1.6+
- Checkov (pip installable)
- Infracost (optional, for cost estimation)
- Google API Key (for Gemini)

## 🔧 Installation

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env and set your values
```

### 4. Initialize Database

```bash
python -m app.db.init_db
```

### 5. Run Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## 📁 Project Structure

```
app/
├── api/
│   └── v1/
│       └── endpoints/
│           ├── auth.py          # Authentication endpoints
│           ├── voice.py         # Voice transcription
│           ├── code.py          # Code generation
│           ├── security.py      # Security scanning
│           ├── cost.py          # Cost estimation
│           └── deployment.py    # Deployment management
├── core/
│   ├── config.py               # App configuration
│   ├── security.py             # JWT & password handling
│   └── constants.py            # Constants and enums
├── db/
│   ├── base.py                 # Database base
│   ├── session.py              # Session management
│   └── init_db.py              # Database initialization
├── models/
│   ├── user.py                 # User model
│   ├── deployment.py           # Deployment model
│   ├── security_scan.py        # Security scan model
│   └── cost_estimate.py        # Cost estimate model
├── schemas/
│   ├── user.py                 # User schemas
│   ├── deployment.py           # Deployment schemas
│   ├── voice.py                # Voice schemas
│   ├── code.py                 # Code schemas
│   ├── security.py             # Security schemas
│   └── cost.py                 # Cost schemas
├── services/
│   ├── voice_service.py        # Whisper transcription
│   ├── code_service.py         # Gemini code generation
│   ├── security_service.py     # Checkov scanning
│   └── cost_service.py         # Infracost estimation
└── main.py                     # FastAPI application
```

## 🔐 Authentication

### Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Use Access Token

```bash
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎤 Voice Transcription

```bash
curl -X POST http://localhost:8000/api/v1/voice/transcribe \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@audio.mp3"
```

## 🤖 Generate Terraform Code

```bash
curl -X POST http://localhost:8000/api/v1/code/generate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Deploy a secure web server on AWS with auto-scaling",
    "cloud_provider": "aws",
    "region": "us-east-1"
  }'
```

## 🔒 Security Scan

```bash
curl -X POST http://localhost:8000/api/v1/security/scan \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "terraform_code": "{...}",
    "deployment_id": "uuid"
  }'
```

## 💰 Cost Estimation

```bash
curl -X POST http://localhost:8000/api/v1/cost/estimate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "terraform_code": "{...}",
    "deployment_id": "uuid"
  }'
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py
```

## 🐳 Docker

### Build Image

```bash
docker build -t infravoice-backend .
```

### Run Container

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e REDIS_URL=redis://host:6379/0 \
  -e SECRET_KEY=your-secret \
  -e GOOGLE_API_KEY=your-key \
  infravoice-backend
```

## 📊 Database Migrations

Using Alembic for database migrations:

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🔍 API Documentation

Interactive API documentation available at:

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

## ⚙️ Configuration

Key environment variables:

| Variable           | Description                  | Required | Default               |
| ------------------ | ---------------------------- | -------- | --------------------- |
| DATABASE_URL       | PostgreSQL connection string | Yes      | -                     |
| REDIS_URL          | Redis connection string      | Yes      | -                     |
| SECRET_KEY         | JWT secret key               | Yes      | -                     |
| GOOGLE_API_KEY     | Google Gemini API key        | Yes      | -                     |
| FRONTEND_URL       | Frontend URL for CORS        | No       | http://localhost:3000 |
| WHISPER_MODEL_SIZE | Whisper model size           | No       | base                  |
| DEFAULT_API_QUOTA  | Default API quota per user   | No       | 100                   |

## 🚨 Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## 📝 Logging

Logs are written to stdout in JSON format for production:

```python
import logging

logger = logging.getLogger(__name__)
logger.info("Message", extra={"user_id": user.id})
```

## 🔧 Development

### Code Style

```bash
# Format code
black app/

# Lint
flake8 app/

# Type checking
mypy app/
```

### Pre-commit Hooks

```bash
pip install pre-commit
pre-commit install
```

## 📄 License

MIT License

## 👥 Contributors

InfraVoice Development Team

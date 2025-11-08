# InfraVoice

A voice-powered Infrastructure-as-Code platform that converts natural language (voice or text) into production-ready Terraform with built-in security scanning, cost estimation, and deployment automation.

## 🚀 Features

- **Voice Input**: Transcribe voice commands to infrastructure descriptions using Whisper
- **AI-Powered Code Generation**: Generate Terraform code using Google Gemini 2.5 Pro
- **Security Scanning**: Automated security analysis with Checkov
- **Cost Estimation**: Real-time cost estimates with Infracost
- **Multi-Cloud Support**: AWS, GCP, and Azure
- **Deployment Automation**: One-click infrastructure deployment
- **User Management**: JWT-based authentication with API quotas

## 🏗️ Architecture

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis
- **AI Services**: 
  - Local Whisper (openai-whisper) for voice transcription
  - Google Gemini 2.5 Pro for Terraform generation
  - Checkov for security scanning
  - Infracost for cost estimation

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: React 19, Tailwind CSS, Framer Motion
- **State Management**: Zustand
- **Data Fetching**: Axios with React Query
- **Forms**: React Hook Form with Zod validation

## 📦 Installation

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)
- Google API Key (for Gemini)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd infravoice
```

2. **Set up environment variables**
```bash
# Backend
cp infravoice-backend/.env.example infravoice-backend/.env
# Edit infravoice-backend/.env and add your GOOGLE_API_KEY

# Frontend
cp infravoice-frontend/.env.local.example infravoice-frontend/.env.local
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Initialize the database**
```bash
docker-compose exec backend python -m app.db.init_db
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

### Local Development

#### Backend Setup
```bash
cd infravoice-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up .env file
cp .env.example .env
# Edit .env and configure

# Initialize database
python -m app.db.init_db

# Run development server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd infravoice-frontend
npm install

# Set up .env.local
cp .env.local.example .env.local

# Run development server
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://infravoice:password@localhost:5432/infravoice
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-this-in-production
GOOGLE_API_KEY=your-google-api-key-here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 API Documentation

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Voice Transcription
- `POST /api/v1/voice/transcribe` - Transcribe audio file
- `GET /api/v1/voice/history` - Get transcription history

### Code Generation
- `POST /api/v1/code/generate` - Generate Terraform code
- `GET /api/v1/code/{deployment_id}` - Get deployment
- `PUT /api/v1/code/{deployment_id}` - Update Terraform code

### Security Scanning
- `POST /api/v1/security/scan` - Scan Terraform code
- `GET /api/v1/security/{scan_id}` - Get scan results

### Cost Estimation
- `POST /api/v1/cost/estimate` - Estimate infrastructure costs
- `GET /api/v1/cost/{deployment_id}/cost` - Get deployment cost

### Deployment
- `GET /api/v1/deployment/` - List deployments
- `GET /api/v1/deployment/stats` - Get deployment statistics
- `POST /api/v1/deployment/{id}/deploy` - Deploy infrastructure
- `DELETE /api/v1/deployment/{id}` - Destroy deployment

## 🧪 Testing

### Backend Tests
```bash
cd infravoice-backend
pytest
```

### Frontend Tests
```bash
cd infravoice-frontend
npm test
```

## 🚢 Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy from main branch

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd infravoice-frontend && npm run build`
3. Set output directory: `infravoice-frontend/.next`
4. Add environment variable: `NEXT_PUBLIC_API_URL`

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Pydantic and Zod
- Rate limiting with API quotas
- CORS configuration
- SQL injection prevention with SQLAlchemy ORM

## 📝 Workflow Example

1. User opens Deploy page and clicks microphone
2. Speaks: "Deploy a secure web server on AWS with auto-scaling and load balancer in us-east-1"
3. Audio transcribed to text via Whisper (2-3 seconds)
4. Clicks "Generate Code" button
5. Gemini generates production-ready Terraform code (15 seconds)
6. Automatically runs security scan with Checkov
7. Automatically estimates costs with Infracost
8. Reviews code, security score (8.5/10), and costs ($125.50/month)
9. Clicks "Deploy Now" to provision infrastructure
10. Real-time logs show Terraform apply progress
11. Infrastructure deployed in 2 minutes

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License

## 👥 Authors

InfraVoice Development Team

## 🙏 Acknowledgments

- OpenAI Whisper for speech recognition
- Google Gemini for AI-powered code generation
- Checkov for security scanning
- Infracost for cost estimation
- HashiCorp Terraform for infrastructure provisioning

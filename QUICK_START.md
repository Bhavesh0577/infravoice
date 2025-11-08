# InfraVoice - Quick Start Guide

## Prerequisites

- Docker Desktop (Windows)
- Git (optional)
- Google API Key (optional, for AI features)

## Installation Steps

### 1. Navigate to Project Directory

```powershell
cd c:\Users\bhave\infravoice
```

### 2. Configure Environment Variables (Optional)

Edit `.env` file in the root directory to add your Google API key:

```bash
GOOGLE_API_KEY=your-api-key-here
```

**Get Google API Key:** https://makersuite.google.com/app/apikey

> **Note:** If you don't have a Google API key, the application will still work with limited AI features.

### 3. Start All Services

```powershell
docker-compose up -d
```

This will start:

- **PostgreSQL** database on port 5432
- **Redis** cache on port 6379
- **Backend API** on port 8000
- **Frontend** on port 3000

### 4. Verify Services are Running

```powershell
docker-compose ps
```

You should see 4 services running:

- `infravoice-postgres`
- `infravoice-redis`
- `infravoice-backend`
- `infravoice-frontend`

### 5. Check Service Logs (if needed)

```powershell
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

## Access the Application

### Frontend UI

- **URL:** http://localhost:3000
- **Description:** Main web interface for InfraVoice

### Backend API

- **URL:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Database Access (if needed)

```powershell
# Connection string
postgresql://infravoice:password@localhost:5432/infravoice

# Or connect via docker
docker exec -it infravoice-postgres psql -U infravoice -d infravoice
```

## First Time Setup

### 1. Create an Account

1. Go to http://localhost:3000
2. Click **Sign Up**
3. Enter:
   - Email
   - Username
   - Password
4. Click **Create Account**

### 2. Login

1. Click **Login**
2. Enter your credentials
3. You'll be redirected to the Dashboard

## Usage Examples

### Example 1: Generate Terraform Code (Text Input)

1. Navigate to **Deploy** page
2. In the description box, type:
   ```
   Create an AWS EC2 instance in us-east-1 with:
   - Instance type: t3.micro
   - OS: Ubuntu 22.04
   - Security group allowing SSH from anywhere
   - 20GB EBS volume
   ```
3. Select **Cloud Provider:** AWS
4. Select **Region:** us-east-1
5. Click **Generate Terraform Code**
6. View the generated code, security scan, and cost estimate

### Example 2: Voice Input (Upload Audio)

1. Navigate to **Deploy** page
2. Click the microphone icon or **Upload Audio**
3. Upload an audio file describing your infrastructure
4. The audio will be transcribed using Whisper
5. Terraform code will be generated from the transcription

### Example 3: View Deployments

1. Navigate to **Deployments** page
2. See all your previous deployments
3. Filter by:
   - Cloud Provider
   - Status
   - Date Range
4. Click on a deployment to view details:
   - Terraform code
   - Security scan results
   - Cost estimates
   - Resources created

## Common Commands

### Stop All Services

```powershell
docker-compose down
```

### Restart Services

```powershell
docker-compose restart
```

### Rebuild After Code Changes

```powershell
docker-compose up --build -d
```

### View Real-time Logs

```powershell
docker-compose logs -f backend
```

### Remove All Data (Reset)

```powershell
docker-compose down -v
```

> **Warning:** This will delete all database data!

## Troubleshooting

### Issue: Port Already in Use

**Error:** `port is already allocated`

**Solution:**

```powershell
# Find process using the port (e.g., 3000)
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <process_id> /F

# Or change port in docker-compose.yml
```

### Issue: Frontend Not Loading

**Check:**

1. Frontend container is running: `docker-compose ps`
2. Backend is accessible: http://localhost:8000/health
3. Logs for errors: `docker-compose logs frontend`

**Solution:**

```powershell
docker-compose restart frontend
```

### Issue: Backend API Errors

**Check:**

1. Database is running: `docker-compose ps postgres`
2. Redis is running: `docker-compose ps redis`
3. Environment variables are set: `docker-compose config`

**Solution:**

```powershell
# Restart backend
docker-compose restart backend

# Or rebuild
docker-compose up --build -d backend
```

### Issue: No Terraform Code Generated

**Possible Causes:**

1. Google API key not set or invalid
2. API quota exceeded
3. Network connectivity issues

**Solution:**

1. Check `.env` file has valid `GOOGLE_API_KEY`
2. Check backend logs: `docker-compose logs backend`
3. Verify quota: Check your user profile in the app

## Development Mode

### Hot Reload Enabled

- **Frontend:** Changes to React/TypeScript files auto-reload
- **Backend:** Changes to Python files auto-reload with uvicorn

### Local Development (Without Docker)

#### Backend

```powershell
cd infravoice-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

#### Frontend

```powershell
cd infravoice-frontend
npm install --legacy-peer-deps
npm run dev
```

## API Testing with cURL

### Health Check

```powershell
curl http://localhost:8000/health
```

### Sign Up

```powershell
curl -X POST http://localhost:8000/api/v1/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"password123\"}'
```

### Login

```powershell
curl -X POST http://localhost:8000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### Generate Terraform (with token)

```powershell
$token = "your-access-token-here"
curl -X POST http://localhost:8000/api/v1/code/generate `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{\"description\":\"Create AWS EC2 t3.micro\",\"cloud_provider\":\"AWS\",\"region\":\"us-east-1\"}'
```

## Next Steps

1. ✅ Explore the Dashboard
2. ✅ Generate your first Terraform code
3. ✅ Review security scan results
4. ✅ Check cost estimates
5. ⏳ Deploy infrastructure (manual Terraform apply)
6. ⏳ Integrate with CI/CD pipeline

## Support & Resources

- **API Documentation:** http://localhost:8000/docs
- **Backend README:** `infravoice-backend/README.md`
- **Frontend README:** `infravoice-frontend/FRONTEND_README.md`
- **Fixes Applied:** `FIXES_APPLIED.md`

## Stopping the Application

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (delete all data)
docker-compose down -v
```

---

**Last Updated:** November 6, 2025  
**Version:** 1.0.0  
**License:** MIT

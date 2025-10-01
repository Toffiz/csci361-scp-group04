# SCP Platform - Monorepo

Supplier-Consumer Platform - B2B collaboration system

## Project Structure

```
csci361-scp-group04/
├── frontend/          # Next.js frontend application
├── backend/           # (Future) Backend API
├── Dockerfile         # Docker configuration for frontend
├── docker-compose.yml # Docker Compose for all services
├── nginx.conf         # Nginx configuration
└── .github/           # CI/CD workflows
```

## Services

### Frontend (Next.js)
Located in `./frontend` - See [Frontend README](./frontend/README.md) for setup instructions.

**Live Demo:** https://toffiz.github.io/csci361-scp-group04/

### Backend (Coming Soon)
Backend API services will be added here.

## Quick Start

### Local Development
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000

### GitHub Pages Deployment
Push to `main` branch - automatically deploys via GitHub Actions to:
https://toffiz.github.io/csci361-scp-group04/

**Setup:**
1. Go to Settings → Pages
2. Source: GitHub Actions
3. Push to main - it will deploy automatically
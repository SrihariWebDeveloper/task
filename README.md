# AI Task Processing Platform

## Overview
This repository includes a full-stack AI task platform with:

- React + Vite + Tailwind frontend
- Express backend with JWT authentication
- MongoDB task persistence
- Redis queue for async processing
- Python worker service for job execution
- Docker Compose for local development
- Kubernetes manifests in `infra/`

## Run locally with Docker Compose

1. Copy server `.env` from `server/.env.example` and set `JWT_SECRET`.
2. Copy worker `.env` from `worker/.env.example` if needed.
3. Start services:

```bash
docker-compose up --build
```

4. Open the frontend at http://localhost:5173.

## Local development

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Worker

```bash
cd worker
pip install -r requirements.txt
python worker.py
```

## Kubernetes deployment

Manifests are stored in `infra/` for GitOps deployment, including:

- Namespace
- Backend deployment/service
- Frontend deployment/service
- Worker deployment
- MongoDB and Redis deployment/services
- Ingress configuration
- Secrets manifest

## Notes

- Use `server/.env.example` and `worker/.env.example` to avoid committing secrets.
- The frontend uses `VITE_API_URL` configured in `client/.env`.
- The worker supports operations: `uppercase`, `lowercase`, `reverse`, `word_count`.

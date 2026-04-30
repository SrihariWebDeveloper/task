# AI Task Processing Platform Architecture

## Overview
The platform is designed as a MERN-style application with a Python worker that processes queued jobs asynchronously.

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + MongoDB + JWT authentication
- Worker: Python background service consuming Redis queue jobs
- Queue: Redis list queue (`task_queue`)
- Database: MongoDB storing users and tasks

## Worker Scaling Strategy

1. **Stateless workers**: Each worker reads jobs from Redis and updates MongoDB. This means workers can be horizontally scaled without coordination.
2. **Queue-based load distribution**: Workers use Redis `BRPOP` to claim jobs one at a time. Scaling to multiple replicas spreads task processing.
3. **Replica count**: Increase worker replicas when throughput grows, e.g. 2-4 replicas for moderate volume, more under high load.

## High Task Volume Handling (100k tasks/day)

- **Queue buffering**: Redis holds pending work while backend remains responsive.
- **Batching and small tasks**: Each task is lightweight; workers process operations quickly, keeping latency low.
- **Autoscaling**: Kubernetes can scale workers based on CPU/queue length.
- **Database sharding/indexing**: Use MongoDB index on `userId` and `createdAt` for fast task lookups and queries.
- **Connection pooling**: MongoDB driver reuses connections for worker and backend.

## Database Indexing Strategy

- `Task` collection indexes:
  - `userId` for user-specific queries
  - `createdAt` for recent task sorting

The model already stores `userId` as an ObjectId reference for efficient filtering.

## Redis Failure Handling

- If Redis is unavailable, the backend returns an error when queueing.
- The worker will fail fast if it cannot connect; Kubernetes restart policies can recover a worker once Redis is back.
- In production, use Redis persistence and replication to avoid single point of failure.
- For resilience, the backend could add a fallback status and retry mechanism when enqueueing fails.

## Environment Separation

- **Staging**: use separate Kubernetes namespace, image tags like `:staging`, and database/Redis instances.
- **Production**: use `:latest` or versioned tags, stronger resource limits, TLS-enabled ingress, and secure secret management.

## Deployment

- Local dev: `docker-compose up --build`
- Kubernetes: apply manifests in `infra/` namespace and configure Argo CD to sync from this repository.

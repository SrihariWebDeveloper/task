# Infra Repo

This repository contains Kubernetes manifests for the AI Task Platform.
It is organized for GitOps deployments and should be pointed at by Argo CD.

## Structure

- `namespace.yaml`: shared namespace definition
- `config/configmap.yaml`: environment configuration
- `config/secret.yaml`: secret placeholders for credentials and connection strings
- `backend/deployment.yaml`: backend deployment and service
- `frontend/deployment.yaml`: frontend deployment and service
- `worker/deployment.yaml`: worker deployment and headless service
- `worker/hpa.yaml`: autoscaling policy for the worker
- `database/mongo.yaml`: MongoDB deployment, PVC, and service
- `database/redis.yaml`: Redis deployment and service
- `ingress.yaml`: ingress routes for frontend and backend
- `argocd-app.yaml`: Argo CD Application manifest
- `kustomization.yaml`: root Kustomize manifest

## Deploying

1. Push this folder to a dedicated Git repository.
2. Update `argocd-app.yaml` with your repository URL.
3. Apply the manifests with Argo CD or `kubectl apply -k .`.

## Notes

- `config/secret.yaml` uses placeholders and must be replaced with real secrets.
- Ingress host values should be updated for your DNS / TLS setup.
- The backend and worker rely on `mongo` and `redis` service hostnames.

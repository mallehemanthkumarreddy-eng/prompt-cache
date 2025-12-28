---
layout: default
title: Deployment
nav_order: 6
---

# Deployment Guide

Production deployment options for PromptCache.

## Docker Deployment

### Using Docker Compose (Recommended)

**1. Create `.env` file**:

```bash
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
CACHE_HIGH_THRESHOLD=0.70
CACHE_LOW_THRESHOLD=0.30
ENABLE_GRAY_ZONE_VERIFIER=true
```

**2. Start the service**:

```bash
docker-compose up -d
```

**3. Verify**:

```bash
curl http://localhost:8080/v1/config/provider
```

**4. View logs**:

```bash
docker-compose logs -f
```

**5. Stop**:

```bash
docker-compose down
```

### Using Docker Directly

```bash
# Build image
docker build -t prompt-cache:latest .

# Run container
docker run -d \
  -p 8080:8080 \
  -e EMBEDDING_PROVIDER=openai \
  -e OPENAI_API_KEY=your-key \
  -v $(pwd)/badger_data:/root/badger_data \
  --name prompt-cache \
  prompt-cache:latest

# Check logs
docker logs -f prompt-cache

# Stop
docker stop prompt-cache
docker rm prompt-cache
```

---

## Kubernetes Deployment

### Basic Deployment

**deployment.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prompt-cache
spec:
  replicas: 3
  selector:
    matchLabels:
      app: prompt-cache
  template:
    metadata:
      labels:
        app: prompt-cache
    spec:
      containers:
      - name: prompt-cache
        image: prompt-cache:latest
        ports:
        - containerPort: 8080
        env:
        - name: EMBEDDING_PROVIDER
          value: "openai"
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: prompt-cache-secrets
              key: openai-api-key
        - name: CACHE_HIGH_THRESHOLD
          value: "0.70"
        - name: CACHE_LOW_THRESHOLD
          value: "0.30"
        - name: ENABLE_GRAY_ZONE_VERIFIER
          value: "true"
        volumeMounts:
        - name: cache-storage
          mountPath: /root/badger_data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: cache-storage
        persistentVolumeClaim:
          claimName: prompt-cache-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: prompt-cache
spec:
  selector:
    app: prompt-cache
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 8080
  type: LoadBalancer
```

**secrets.yaml**:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: prompt-cache-secrets
type: Opaque
stringData:
  openai-api-key: your-openai-api-key
  mistral-api-key: your-mistral-api-key
  anthropic-api-key: your-anthropic-api-key
  voyage-api-key: your-voyage-api-key
```

**pvc.yaml**:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: prompt-cache-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

**Deploy**:

```bash
kubectl apply -f secrets.yaml
kubectl apply -f pvc.yaml
kubectl apply -f deployment.yaml

# Check status
kubectl get pods
kubectl logs -f deployment/prompt-cache

# Get service URL
kubectl get svc prompt-cache
```

---

## Cloud Deployments

### AWS ECS

**task-definition.json**:

```json
{
  "family": "prompt-cache",
  "containerDefinitions": [
    {
      "name": "prompt-cache",
      "image": "your-ecr-repo/prompt-cache:latest",
      "memory": 512,
      "cpu": 256,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "EMBEDDING_PROVIDER",
          "value": "openai"
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:openai-key"
        }
      ]
    }
  ]
}
```

### Google Cloud Run

```bash
# Build and push
docker build -t gcr.io/your-project/prompt-cache:latest .
docker push gcr.io/your-project/prompt-cache:latest

# Deploy
gcloud run deploy prompt-cache \
  --image gcr.io/your-project/prompt-cache:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars EMBEDDING_PROVIDER=openai \
  --set-secrets OPENAI_API_KEY=openai-key:latest
```

### Azure Container Instances

```bash
az container create \
  --resource-group your-rg \
  --name prompt-cache \
  --image your-registry.azurecr.io/prompt-cache:latest \
  --cpu 1 \
  --memory 1 \
  --registry-login-server your-registry.azurecr.io \
  --registry-username your-username \
  --registry-password your-password \
  --ip-address Public \
  --ports 8080 \
  --environment-variables \
    EMBEDDING_PROVIDER=openai \
  --secure-environment-variables \
    OPENAI_API_KEY=your-key
```

---

## Reverse Proxy Setup

### Nginx

```nginx
upstream prompt-cache {
    server localhost:8080;
}

server {
    listen 80;
    server_name cache.example.com;

    location / {
        proxy_pass http://prompt-cache;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for LLM requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Caddy

```
cache.example.com {
    reverse_proxy localhost:8080
}
```

---

## High Availability Setup

### Load Balanced Configuration

```yaml
# docker-compose.ha.yml
version: '3.8'

services:
  prompt-cache-1:
    build: .
    environment:
      - EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data/node1:/root/badger_data
    networks:
      - cache-network

  prompt-cache-2:
    build: .
    environment:
      - EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data/node2:/root/badger_data
    networks:
      - cache-network

  prompt-cache-3:
    build: .
    environment:
      - EMBEDDING_PROVIDER=${EMBEDDING_PROVIDER}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data/node3:/root/badger_data
    networks:
      - cache-network

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - prompt-cache-1
      - prompt-cache-2
      - prompt-cache-3
    networks:
      - cache-network

networks:
  cache-network:
    driver: bridge
```

**nginx.conf** for load balancing:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream prompt-cache-cluster {
        least_conn;
        server prompt-cache-1:8080;
        server prompt-cache-2:8080;
        server prompt-cache-3:8080;
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://prompt-cache-cluster;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_next_upstream error timeout http_502 http_503;
        }
    }
}
```

---

## Monitoring & Observability

### Prometheus Metrics (Coming Soon)

Future versions will expose:

```
# Current metrics (from logs)
- cache_hits_total
- cache_misses_total
- provider_requests_total
- request_duration_seconds
```

### Health Checks

```bash
# Simple health check
curl http://localhost:8080/v1/config/provider

# For Kubernetes
livenessProbe:
  httpGet:
    path: /v1/config/provider
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 30
```

---

## Production Checklist

- [ ] Set appropriate `CACHE_HIGH_THRESHOLD` and `CACHE_LOW_THRESHOLD`
- [ ] Configure gray zone verifier based on requirements
- [ ] Use secrets manager for API keys
- [ ] Set up persistent storage for BadgerDB
- [ ] Configure resource limits (CPU, memory)
- [ ] Set up log aggregation
- [ ] Configure health checks
- [ ] Set up monitoring/alerting
- [ ] Test failover scenarios
- [ ] Document rollback procedure
- [ ] Set up backup for cache data (optional)
- [ ] Configure rate limiting at proxy level
- [ ] Set up SSL/TLS termination
- [ ] Test with production traffic patterns

---

## Scaling Considerations

### Horizontal Scaling

Each instance maintains its own cache. For shared cache:
- Use network file system for BadgerDB (not recommended for production)
- Wait for v1.0 clustered mode
- Use consistent hashing at load balancer

### Vertical Scaling

- **CPU**: 1 core per 1000 req/min
- **Memory**: 512MB base + 1MB per 10k cached prompts
- **Storage**: 100MB per 100k cached prompts

---

## Security Best Practices

1. **Never commit API keys** - use environment variables
2. **Use secrets management** (AWS Secrets Manager, Vault)
3. **Enable HTTPS** via reverse proxy
4. **Restrict network access** to port 8080
5. **Regular security updates** - keep dependencies updated
6. **Monitor for anomalies** - unusual cache patterns
7. **Implement rate limiting** at proxy level
8. **Use least privilege** IAM roles

---

## Backup & Recovery

### Backing Up Cache Data

```bash
# Stop service
docker-compose down

# Backup BadgerDB
tar -czf cache-backup-$(date +%Y%m%d).tar.gz badger_data/

# Restart
docker-compose up -d
```

### Restore from Backup

```bash
# Stop service
docker-compose down

# Restore data
tar -xzf cache-backup-20251228.tar.gz

# Restart
docker-compose up -d
```

{: .note }
> Cache data is optional. Deleting it will not cause failures, only cache misses.

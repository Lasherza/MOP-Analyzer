# Deployment Checklist

Complete checklist for deploying Telco MOP Analysis Agent to production.

## Pre-Deployment

### 1. Environment Setup
- [ ] Create production `.env` file from `.env.example`
- [ ] Set strong `X_API_KEY` (min 32 characters, random)
- [ ] Obtain and set `TAVILY_API_KEY` (from https://tavily.com)
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set appropriate `RATE_LIMIT_MAX_REQUESTS` for your traffic
- [ ] Configure `MAX_FILE_SIZE_BYTES` based on expected MOP sizes
- [ ] Set `LOG_LEVEL=info` or `warn` for production

### 2. Security Review
- [ ] API key is stored securely (secrets manager, not in code)
- [ ] HTTPS/TLS enabled on frontend and backend
- [ ] CORS restricted to known domains only
- [ ] Rate limiting configured appropriately
- [ ] Helmet.js security headers enabled
- [ ] File upload validation enabled
- [ ] No secrets in Docker images or Git history
- [ ] Firewall rules configured (allow only necessary ports)

### 3. Infrastructure
- [ ] Docker images built and tested
- [ ] Container registry configured (Docker Hub, ECR, etc.)
- [ ] Kubernetes manifests or docker-compose.yml reviewed
- [ ] Persistent volumes configured (if needed)
- [ ] Load balancer/ingress configured
- [ ] SSL certificates obtained and configured
- [ ] DNS records updated

### 4. Monitoring & Logging
- [ ] Structured logging configured (Winston)
- [ ] Log aggregation set up (CloudWatch, Datadog, ELK, etc.)
- [ ] Error tracking enabled (Sentry, optional)
- [ ] Health check endpoints tested (`/api/health`)
- [ ] Metrics/observability configured (Prometheus, optional)
- [ ] Alerting rules defined (uptime, error rate, etc.)

### 5. Testing
- [ ] All unit tests passing (`npm test`)
- [ ] Integration tests passing
- [ ] Load testing completed (k6, Apache Bench, etc.)
- [ ] Sample MOPs analyzed successfully
- [ ] PDF generation tested
- [ ] Tavily integration verified
- [ ] Rate limiting tested
- [ ] Error handling tested (invalid files, large files, etc.)

## Deployment Steps

### Docker Compose (Simple Deployment)

1. **Build images**:
```bash
docker-compose build
```

2. **Tag for registry**:
```bash
docker tag telco-mop-backend:latest your-registry/telco-mop-backend:v1.0.0
docker tag telco-mop-frontend:latest your-registry/telco-mop-frontend:v1.0.0
```

3. **Push to registry**:
```bash
docker push your-registry/telco-mop-backend:v1.0.0
docker push your-registry/telco-mop-frontend:v1.0.0
```

4. **Deploy on server**:
```bash
scp docker-compose.yml .env server:/app/
ssh server "cd /app && docker-compose up -d"
```

5. **Verify**:
```bash
curl https://your-domain.com/api/health
curl https://your-frontend-domain.com/health
```

### Kubernetes (Production Deployment)

1. **Create namespace**:
```bash
kubectl create namespace telco-mop
```

2. **Create secrets**:
```bash
kubectl create secret generic telco-mop-secrets \
  --from-literal=X_API_KEY=your-key \
  --from-literal=TAVILY_API_KEY=your-tavily-key \
  -n telco-mop
```

3. **Apply manifests** (create these based on docker-compose.yml):
```bash
kubectl apply -f k8s/backend-deployment.yml -n telco-mop
kubectl apply -f k8s/backend-service.yml -n telco-mop
kubectl apply -f k8s/frontend-deployment.yml -n telco-mop
kubectl apply -f k8s/frontend-service.yml -n telco-mop
kubectl apply -f k8s/ingress.yml -n telco-mop
```

4. **Verify**:
```bash
kubectl get pods -n telco-mop
kubectl get services -n telco-mop
kubectl logs -f deployment/backend -n telco-mop
```

### Cloud Platforms

#### AWS ECS/Fargate
- Use task definitions from docker-compose.yml
- Configure Application Load Balancer
- Set up CloudWatch logs
- Use AWS Secrets Manager for API keys

#### Azure Container Instances
- Deploy with `az container create`
- Use Azure Key Vault for secrets
- Configure Azure Application Gateway

#### GCP Cloud Run
- Deploy with `gcloud run deploy`
- Use Secret Manager for API keys
- Configure Cloud Load Balancing

## Post-Deployment

### 1. Smoke Tests
- [ ] Frontend loads at production URL
- [ ] Backend `/api/health` returns 200
- [ ] Upload test MOP and verify analysis
- [ ] Download JSON report
- [ ] Download PDF report
- [ ] Check logs for errors

### 2. Performance Validation
- [ ] Response time < 10s for typical MOP
- [ ] No memory leaks (monitor over 24 hours)
- [ ] CPU usage within acceptable range
- [ ] Tavily caching working (check cache hit rate in logs)

### 3. Monitoring Setup
- [ ] Dashboard created (Grafana, CloudWatch, etc.)
- [ ] Alert rules active
- [ ] Log aggregation working
- [ ] Error tracking capturing exceptions

### 4. Documentation
- [ ] Update README with production URL
- [ ] Document deployment process for team
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

### 5. Backup & Recovery
- [ ] Database backups configured (if applicable)
- [ ] Configuration backed up
- [ ] Disaster recovery plan documented
- [ ] Test restore procedure

## Rollback Plan

If deployment fails:

1. **Immediate rollback**:
```bash
# Docker Compose
docker-compose down
docker-compose pull previous-version
docker-compose up -d

# Kubernetes
kubectl rollout undo deployment/backend -n telco-mop
kubectl rollout undo deployment/frontend -n telco-mop
```

2. **Verify rollback**:
```bash
curl https://your-domain.com/api/health
```

3. **Investigate issue**:
- Check logs
- Review error messages
- Test locally with production-like environment

## Maintenance

### Regular Tasks

**Daily**:
- Check error logs
- Monitor uptime
- Review alerts

**Weekly**:
- Review performance metrics
- Check disk usage
- Update dependencies (npm audit)

**Monthly**:
- Security scan (Snyk, npm audit)
- Load testing
- Review and optimize caching

**Quarterly**:
- Update base images (Node, Nginx)
- Review and update documentation
- Disaster recovery drill

## Scaling

### Horizontal Scaling
```bash
# Docker Compose
docker-compose up -d --scale backend=3

# Kubernetes
kubectl scale deployment/backend --replicas=3 -n telco-mop
```

### Vertical Scaling
- Increase container resource limits
- Upgrade instance/pod size

### Optimization
- Enable Redis caching layer
- Implement CDN for frontend assets
- Add API gateway for rate limiting (Kong, Tyk)
- Database connection pooling (if database added)

## Troubleshooting

### Backend won't start
- Check logs: `docker logs <container-id>`
- Verify environment variables
- Check database connectivity (if applicable)

### High response times
- Check Tavily API latency
- Verify cache is working
- Monitor CPU/memory usage

### Rate limiting issues
- Adjust `RATE_LIMIT_MAX_REQUESTS`
- Implement distributed rate limiting (Redis)

### File upload failures
- Check `MAX_FILE_SIZE_BYTES`
- Verify disk space
- Check nginx/reverse proxy upload limits

## Security Incidents

1. **Suspected API key leak**:
   - Immediately rotate `X_API_KEY`
   - Update all clients
   - Review access logs

2. **DDoS attack**:
   - Enable CloudFlare or similar
   - Tighten rate limits
   - Enable IP blocking

3. **Vulnerability discovered**:
   - Assess impact
   - Apply patch
   - Test thoroughly
   - Deploy update

## Support

- **On-call**: <your-oncall-process>
- **Escalation**: <escalation-path>
- **Documentation**: /docs
- **Runbook**: /docs/runbook.md

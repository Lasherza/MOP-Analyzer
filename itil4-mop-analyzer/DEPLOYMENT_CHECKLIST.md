# Deployment Checklist

Use this checklist when deploying the ITIL 4 MOP Analyzer to production.

## Pre-Deployment

### ? Environment Setup
- [ ] Python 3.11+ installed on production server
- [ ] Node.js 18+ installed on production server (if building frontend locally)
- [ ] Docker installed (if using containers)
- [ ] SSL certificates obtained for HTTPS
- [ ] Domain name configured and DNS records updated

### ? API Keys & Secrets
- [ ] OpenAI API key obtained and tested
- [ ] Tavily API key obtained and tested
- [ ] Strong SECRET_KEY generated (32+ characters)
- [ ] Secrets stored in secure vault (not in code)
- [ ] Environment variables configured on production server

### ? Security Configuration
- [ ] Firewall rules configured (only necessary ports open)
- [ ] CORS origins updated for production domain
- [ ] Rate limiting configured
- [ ] File upload limits verified
- [ ] Security headers enabled
- [ ] HTTPS enforced (no HTTP)

### ? Database
- [ ] Production database chosen (PostgreSQL recommended)
- [ ] Database credentials secured
- [ ] Backup strategy implemented
- [ ] Database migrations tested

### ? Code Review
- [ ] All TODOs and FIXMEs addressed
- [ ] Debug mode disabled (`DEBUG=False`)
- [ ] Sensitive data not in code
- [ ] Error messages don't expose system details
- [ ] Logging configured appropriately

## Deployment Steps

### 1. Backend Deployment

#### Option A: Docker (Recommended)
```bash
# Build backend image
cd backend
docker build -t itil4-mop-backend:1.0.0 .

# Run backend container
docker run -d \
  --name mop-backend \
  -p 8000:8000 \
  --env-file .env.prod \
  -v mop-uploads:/app/uploads \
  -v mop-reports:/app/reports \
  -v mop-db:/app/database \
  itil4-mop-backend:1.0.0
```

#### Option B: Traditional Deployment
```bash
# On production server
cd /opt/itil4-mop-analyzer/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service
sudo cp deployment/mop-backend.service /etc/systemd/system/
sudo systemctl enable mop-backend
sudo systemctl start mop-backend
```

### 2. Frontend Deployment

#### Option A: Static Build (Recommended)
```bash
# Build frontend
cd frontend
npm install
npm run build

# Deploy to nginx/Apache
sudo cp -r dist/* /var/www/html/mop-analyzer/
```

#### Option B: Docker
```bash
cd frontend
docker build -t itil4-mop-frontend:1.0.0 .
docker run -d \
  --name mop-frontend \
  -p 3000:3000 \
  itil4-mop-frontend:1.0.0
```

### 3. Reverse Proxy (nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

    # Frontend
    location / {
        root /var/www/html/mop-analyzer;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for long-running analysis
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # File upload size
    client_max_body_size 10M;
}
```

## Post-Deployment

### ? Smoke Tests
- [ ] Frontend loads correctly at https://yourdomain.com
- [ ] API health check responds: `curl https://yourdomain.com/api/health`
- [ ] Can select category
- [ ] Can upload document
- [ ] Analysis completes successfully
- [ ] Can download PDF report
- [ ] SSL certificate is valid
- [ ] All pages load over HTTPS

### ? Monitoring Setup
- [ ] Application monitoring configured (e.g., New Relic, DataDog)
- [ ] Error tracking enabled (e.g., Sentry)
- [ ] Log aggregation configured (e.g., ELK, CloudWatch)
- [ ] Uptime monitoring enabled (e.g., Pingdom)
- [ ] Alerts configured for:
  - Application errors
  - API failures
  - High response times
  - Server resource usage
  - SSL expiration

### ? Backup Strategy
- [ ] Database backup automated (daily recommended)
- [ ] Uploaded files backed up
- [ ] Generated reports backed up (or set retention policy)
- [ ] Configuration files backed up
- [ ] Backup restoration tested

### ? Documentation
- [ ] Production URLs documented
- [ ] Deployment process documented
- [ ] Monitoring dashboards documented
- [ ] Emergency procedures documented
- [ ] Team trained on application

## Security Hardening

### ? Server Security
- [ ] OS updates applied
- [ ] Unnecessary services disabled
- [ ] Fail2ban or similar configured
- [ ] SSH key-only authentication
- [ ] Regular security scans scheduled

### ? Application Security
- [ ] Dependencies updated to latest secure versions
- [ ] API rate limiting enabled
- [ ] Input validation tested
- [ ] File upload security tested
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

### ? Data Protection
- [ ] Uploaded files encrypted at rest
- [ ] Database encrypted
- [ ] Backups encrypted
- [ ] Data retention policy implemented
- [ ] GDPR compliance reviewed (if applicable)

## Performance Optimization

### ? Backend
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Caching implemented where appropriate
- [ ] Async operations optimized
- [ ] Resource limits configured

### ? Frontend
- [ ] Assets minified
- [ ] Images optimized
- [ ] CDN configured (optional)
- [ ] Lazy loading implemented where appropriate
- [ ] Browser caching configured

### ? Infrastructure
- [ ] Load balancer configured (if needed)
- [ ] Auto-scaling rules set (if using cloud)
- [ ] Database read replicas (if needed)
- [ ] CDN for static assets (optional)

## Maintenance Plan

### Daily
- [ ] Monitor error logs
- [ ] Check application uptime
- [ ] Verify backup completion

### Weekly
- [ ] Review performance metrics
- [ ] Check disk space usage
- [ ] Review security alerts

### Monthly
- [ ] Apply security updates
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Review API usage and costs

### Quarterly
- [ ] Dependency updates
- [ ] Security audit
- [ ] Performance review
- [ ] Disaster recovery test

## Rollback Plan

In case of deployment issues:

1. **Identify Issue**
   - Check error logs
   - Review monitoring alerts
   - Test specific functionality

2. **Rollback Steps**
   ```bash
   # Stop new version
   docker stop mop-backend mop-frontend
   
   # Start previous version
   docker start mop-backend-old mop-frontend-old
   
   # Or rollback systemd service
   sudo systemctl stop mop-backend
   cd /opt/itil4-mop-analyzer/backend
   git checkout <previous-tag>
   sudo systemctl start mop-backend
   ```

3. **Verify Rollback**
   - Test critical functionality
   - Check monitoring
   - Notify users if necessary

4. **Post-Mortem**
   - Document what went wrong
   - Identify root cause
   - Plan fixes
   - Schedule re-deployment

## Production Environment Variables

Create `/opt/itil4-mop-analyzer/backend/.env` (or use secrets manager):

```env
# Application
APP_NAME=ITIL4 MOP Analyzer
APP_VERSION=1.0.0
DEBUG=False

# API Keys (use secrets manager in production)
OPENAI_API_KEY=${OPENAI_API_KEY}
TAVILY_API_KEY=${TAVILY_API_KEY}

# Security
SECRET_KEY=${STRONG_SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.pdf,.docx,.doc

# Database (use PostgreSQL in production)
DATABASE_URL=postgresql+asyncpg://user:password@localhost/mopanalyzer

# CORS - Add your production domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Monitoring (optional)
SENTRY_DSN=${SENTRY_DSN}
```

## Contact Information

### Production Support
- **Primary:** ops@yourcompany.com
- **Secondary:** devops@yourcompany.com
- **Emergency:** +1-555-ON-CALL

### Escalation Path
1. DevOps Engineer (0-30 min)
2. Lead Developer (30-60 min)
3. CTO (60+ min)

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Developer | | | |
| DevOps | | | |
| Security | | | |
| Manager | | | |

---

**Deployment Version:** 1.0.0  
**Deployment Date:** _____________  
**Next Review:** _____________

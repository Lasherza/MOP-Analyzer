# ?? Deployment Guide

This guide covers various deployment options for the ITIL 4 MOP Analyzer.

## ?? Deployment Options

### Option 1: Local File System (Easiest)

Simply open `index.html` in a browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

**Pros**: No setup required  
**Cons**: Some browsers restrict local file access

---

### Option 2: Python HTTP Server (Recommended for Development)

Perfect for local testing and development:

```bash
# Python 3
python3 -m http.server 8000

# Python 2 (legacy)
python -m SimpleHTTPServer 8000
```

Access at: `http://localhost:8000`

**Pros**: Simple, works everywhere  
**Cons**: Not for production use

---

### Option 3: Node.js HTTP Server

Using `http-server` package:

```bash
# Install globally
npm install -g http-server

# Run
http-server -p 8000

# Or use npx (no install needed)
npx http-server -p 8000
```

Access at: `http://localhost:8000`

---

### Option 4: Apache Web Server

For organizations with Apache:

1. Copy files to web root:
```bash
sudo cp -r /path/to/mop-analyzer /var/www/html/mop-analyzer
```

2. Set permissions:
```bash
sudo chown -R www-data:www-data /var/www/html/mop-analyzer
sudo chmod -R 755 /var/www/html/mop-analyzer
```

3. Access at: `http://your-server/mop-analyzer`

**Configuration** (`/etc/apache2/sites-available/mop-analyzer.conf`):
```apache
<VirtualHost *:80>
    ServerName mop-analyzer.yourcompany.com
    DocumentRoot /var/www/html/mop-analyzer
    
    <Directory /var/www/html/mop-analyzer>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/mop-analyzer-error.log
    CustomLog ${APACHE_LOG_DIR}/mop-analyzer-access.log combined
</VirtualHost>
```

Enable site:
```bash
sudo a2ensite mop-analyzer
sudo systemctl reload apache2
```

---

### Option 5: Nginx Web Server

For organizations using Nginx:

1. Copy files:
```bash
sudo cp -r /path/to/mop-analyzer /usr/share/nginx/html/mop-analyzer
```

2. Configure Nginx (`/etc/nginx/sites-available/mop-analyzer`):
```nginx
server {
    listen 80;
    server_name mop-analyzer.yourcompany.com;
    root /usr/share/nginx/html/mop-analyzer;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/mop-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Option 6: Docker Container

Create a `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Copy application files
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY README.md /usr/share/nginx/html/
COPY sample_mop.txt /usr/share/nginx/html/

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
# Build image
docker build -t mop-analyzer:latest .

# Run container
docker run -d -p 8080:80 --name mop-analyzer mop-analyzer:latest

# Access at http://localhost:8080
```

---

### Option 7: Cloud Hosting (AWS S3)

Host as a static website on AWS S3:

1. Create S3 bucket:
```bash
aws s3 mb s3://mop-analyzer-yourcompany
```

2. Upload files:
```bash
aws s3 sync . s3://mop-analyzer-yourcompany \
  --exclude ".git/*" \
  --exclude "*.md" \
  --exclude ".gitignore"
```

3. Enable static website hosting:
```bash
aws s3 website s3://mop-analyzer-yourcompany \
  --index-document index.html
```

4. Set bucket policy (public read):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mop-analyzer-yourcompany/*"
    }
  ]
}
```

---

### Option 8: Cloud Hosting (Azure Static Web Apps)

```bash
# Install Azure CLI
az login

# Create resource group
az group create --name mop-analyzer-rg --location eastus

# Create static web app
az staticwebapp create \
  --name mop-analyzer \
  --resource-group mop-analyzer-rg \
  --source . \
  --location eastus \
  --branch main
```

---

### Option 9: Cloud Hosting (Google Cloud Storage)

```bash
# Create bucket
gsutil mb gs://mop-analyzer-yourcompany

# Upload files
gsutil -m cp -r * gs://mop-analyzer-yourcompany

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://mop-analyzer-yourcompany

# Enable website configuration
gsutil web set -m index.html gs://mop-analyzer-yourcompany
```

---

### Option 10: Netlify (Easiest Cloud Option)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

Or simply drag and drop the folder to [netlify.com/drop](https://app.netlify.com/drop)

---

## ?? Security Considerations

### For Internal Corporate Networks

1. **Authentication**: Add corporate SSO
2. **Network**: Deploy behind VPN/firewall
3. **HTTPS**: Use valid SSL certificates
4. **Headers**: Add security headers (see Nginx example)

### For Public Internet

?? **Not recommended** - This tool processes sensitive MOP documents

If you must deploy publicly:
- Use authentication (OAuth, SAML)
- Implement rate limiting
- Add CAPTCHA
- Use WAF (Web Application Firewall)
- Regular security audits

---

## ?? Monitoring

### Apache Logs
```bash
tail -f /var/log/apache2/mop-analyzer-access.log
```

### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
```

### Docker Logs
```bash
docker logs -f mop-analyzer
```

---

## ?? Updates and Maintenance

### Update Deployment

```bash
# Stop service
sudo systemctl stop nginx

# Backup current version
sudo cp -r /usr/share/nginx/html/mop-analyzer \
  /backups/mop-analyzer-$(date +%Y%m%d)

# Deploy new version
sudo cp -r /path/to/new/version/* \
  /usr/share/nginx/html/mop-analyzer/

# Start service
sudo systemctl start nginx
```

### Automated Updates (GitOps)

Create a deployment script:

```bash
#!/bin/bash
# deploy.sh

REPO_URL="https://github.com/yourorg/mop-analyzer.git"
DEPLOY_PATH="/usr/share/nginx/html/mop-analyzer"

# Pull latest
git pull $REPO_URL

# Backup
cp -r $DEPLOY_PATH $DEPLOY_PATH.backup

# Deploy
rsync -av --exclude='.git' ./ $DEPLOY_PATH/

# Reload
sudo systemctl reload nginx

echo "Deployment complete!"
```

---

## ?? Testing Deployment

### Test checklist:

```bash
# Test 1: Check if site loads
curl -I http://localhost:8000

# Test 2: Verify all assets load
curl http://localhost:8000/styles.css
curl http://localhost:8000/app.js

# Test 3: Check JavaScript functionality
# (Open browser console, no errors)

# Test 4: Test file upload
# (Upload sample_mop.txt through UI)

# Test 5: Test API integration
# (Analyze a MOP with valid Tavily key)
```

---

## ?? Mobile Access

All deployment options work on mobile devices. Ensure:
- Responsive CSS loads correctly
- Touch events work
- File upload works on mobile browsers

---

## ?? Multi-Region Deployment

For global teams, consider CDN deployment:

### CloudFront (AWS)
```bash
aws cloudfront create-distribution \
  --origin-domain-name mop-analyzer.s3.amazonaws.com
```

### Azure CDN
```bash
az cdn endpoint create \
  --resource-group mop-analyzer-rg \
  --profile-name mop-cdn \
  --name mop-analyzer
```

---

## ?? Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure proper CORS headers in web server config

### Issue: File Upload Fails
**Solution**: Check max upload size in server config

### Issue: API Calls Blocked
**Solution**: Verify firewall allows HTTPS to tavily.com

### Issue: Slow Performance
**Solution**: Enable gzip compression in web server

---

## ?? Support

For deployment issues:
1. Check server logs
2. Verify file permissions
3. Test with curl/wget
4. Check firewall rules
5. Contact DevOps team

---

**Recommended for Most Organizations**: Nginx + Internal Network + HTTPS

This provides the best balance of security, performance, and ease of maintenance.

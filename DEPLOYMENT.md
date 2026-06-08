# Deployment Guide - Neural Tutor Hub

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [SSL Certificate Setup](#ssl-certificate-setup)
5. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required
- Ubuntu 20.04+ or Debian 11+ server
- Docker & Docker Compose
- Domain name (for SSL)
- API Keys:
  - Anthropic Claude API
  - OpenAI API
  - Google OAuth credentials

### Recommended Specs
- **CPU**: 2+ cores
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 50GB+ SSD
- **Bandwidth**: Unmetered or 1TB+/month

---

## Local Development

### 1. Clone Repository
```bash
git clone https://github.com/lakshitkumarsingh-gif/laxiishowspeed.git
cd laxiishowspeed
```

### 2. Setup Environment
```bash
cp .env.example .env

# Edit .env with your keys
nano .env
```

### 3. Install Dependencies
```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 4. Setup Database
```bash
cd backend
npx prisma migrate dev --name init
cd ..
```

### 5. Run Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Access at http://localhost:3000

---

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Add user to docker group
sudo usermod -aG docker $USER
log out and log back in

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PostgreSQL client tools
sudo apt install -y postgresql-client
```

### 2. Clone & Configure

```bash
# Clone repository
git clone https://github.com/lakshitkumarsingh-gif/laxiishowspeed.git
cd laxiishowspeed

# Create .env file
cp .env.example .env

# Edit with production values
sudo nano .env
```

**Important .env values for production:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://aiuser:STRONG_PASSWORD@postgres:5432/my_first_ai
JWT_SECRET=GENERATE_SECURE_KEY_256_CHARS
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

Generate secure JWT secret:
```bash
openssl rand -base64 32
```

### 3. SSL Certificate (Let's Encrypt)

```bash
# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Certificates will be at:
# /etc/letsencrypt/live/your-domain.com/

# Copy to project
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
sudo chown $USER:$USER ssl/*
```

### 4. Update nginx.conf

Uncomment the HTTPS section in `nginx.conf` and update:
```nginx
server_name your-domain.com www.your-domain.com;
```

### 5. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Initialize database (first time only)
docker exec neural-tutor-backend npx prisma migrate deploy
```

### 6. Verify Deployment

```bash
# Check health
curl http://localhost/health

# Check API
curl http://localhost/api/version

# Check frontend
curl http://localhost
```

---

## Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Database Backup

```bash
# Manual backup
docker exec neural-tutor-postgres pg_dump -U aiuser my_first_ai > backup_$(date +%Y%m%d).sql

# Automated daily backup (add to crontab)
0 2 * * * cd /path/to/laxiishowspeed && docker exec neural-tutor-postgres pg_dump -U aiuser my_first_ai > backups/db_$(date +\%Y\%m\%d).sql
```

### System Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Run migrations if needed
docker exec neural-tutor-backend npx prisma migrate deploy
```

### Monitor Resources

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory
free -h
```

### SSL Renewal (Auto)

```bash
# Setup auto-renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx
```

### Troubleshooting

```bash
# Restart all services
docker-compose restart

# Rebuild containers
docker-compose up -d --build

# Check container logs
docker logs neural-tutor-backend
docker logs neural-tutor-postgres

# Reset database (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
```

---

## Scaling Tips

### Horizontal Scaling
1. Deploy multiple backend instances behind load balancer
2. Use managed database (AWS RDS, DigitalOcean Managed)
3. Use managed Redis (AWS ElastiCache, DigitalOcean)
4. Use CDN for static assets (Cloudflare, AWS CloudFront)

### Performance Optimization
1. Enable database query caching
2. Implement Redis caching layer
3. Use compression (Gzip, Brotli)
4. Optimize images and assets
5. Enable HTTP/2

---

## Cost Optimization

- Use smaller instances with auto-scaling
- Enable S3 for file storage instead of local
- Use Lambda functions for async tasks
- Implement cost monitoring and alerts

---

## Support & Help

For issues:
1. Check Docker logs
2. Verify .env configuration
3. Check network connectivity
4. Open GitHub issue with logs

---

**Happy deploying! 🚀**

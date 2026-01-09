# Deployment Guide

## Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Domain name configured (for production)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd Premium-plumbing-and-leak-detection-
```

2. **Create environment file**
```bash
cp .env.example .env
# Edit .env with your production values
```

3. **Start all services**
```bash
docker-compose up -d
```

Services will be available at:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000
- MongoDB: localhost:27017

4. **View logs**
```bash
docker-compose logs -f
```

5. **Stop services**
```bash
docker-compose down
```

## Production Deployment

### 1. Cloud Platform Deployment (AWS, GCP, Azure)

#### Option A: AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - At least t3.medium (2 vCPU, 4GB RAM)
   - Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

2. **Install Docker**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

3. **Clone and configure**
```bash
git clone <repository-url>
cd Premium-plumbing-and-leak-detection-
cp .env.example .env
nano .env  # Configure production values
```

4. **Start services**
```bash
docker-compose up -d
```

5. **Set up nginx reverse proxy**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/ppld
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ppld /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **Set up SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### Option B: Heroku

1. **Install Heroku CLI**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

2. **Create Heroku apps**
```bash
# Backend
heroku create ppld-backend
heroku addons:create mongolab:sandbox -a ppld-backend

# Set environment variables
heroku config:set JWT_SECRET=your_secret -a ppld-backend
heroku config:set BSV_PRIVATE_KEY=your_key -a ppld-backend
# ... set all other env vars

# Deploy
git subtree push --prefix server heroku main
```

3. **Deploy frontend to Netlify or Vercel**

For Netlify:
```bash
cd client
npm run build
netlify deploy --prod
```

#### Option C: DigitalOcean App Platform

1. **Connect repository** to DigitalOcean App Platform
2. **Configure build settings:**
   - Backend: Node.js, Build: `npm install`, Run: `node server/index.js`
   - Frontend: Static Site, Build: `cd client && npm install && npm run build`
3. **Add MongoDB managed database**
4. **Configure environment variables**
5. **Deploy**

### 2. Traditional VPS Deployment

1. **Prepare VPS** (Ubuntu 22.04)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Deploy application**
```bash
# Clone repository
git clone <repository-url>
cd Premium-plumbing-and-leak-detection-

# Install backend dependencies
npm install

# Configure environment
cp .env.example .env
nano .env

# Install frontend dependencies
cd client
npm install
npm run build
cd ..

# Start backend with PM2
pm2 start server/index.js --name ppld-backend
pm2 save
pm2 startup
```

3. **Configure nginx** (same as AWS EC2 step 5)

### 3. Kubernetes Deployment

Create Kubernetes manifests:

**deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ppld-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ppld-backend
  template:
    metadata:
      labels:
        app: ppld-backend
    spec:
      containers:
      - name: backend
        image: your-registry/ppld-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: ppld-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: ppld-secrets
              key: jwt-secret
---
apiVersion: v1
kind: Service
metadata:
  name: ppld-backend
spec:
  selector:
    app: ppld-backend
  ports:
  - port: 5000
    targetPort: 5000
  type: LoadBalancer
```

Deploy:
```bash
kubectl apply -f deployment.yaml
```

## Environment Variables for Production

Critical settings for `.env`:

```bash
# Production mode
NODE_ENV=production

# Strong JWT secret (generate with: openssl rand -base64 32)
JWT_SECRET=<strong-random-string>

# MongoDB connection
MONGODB_URI=mongodb://username:password@host:port/database

# Real BSV keys (NEVER commit these)
BSV_PRIVATE_KEY=<your-private-key>
BSV_NETWORK=mainnet
COMPANY_BSV_ADDRESS=<company-address>
WATERBOARD_BSV_ADDRESS=<waterboard-address>

# Production domain
CORS_ORIGIN=https://yourdomain.com
```

## Security Checklist

- [ ] Use HTTPS (SSL/TLS certificates)
- [ ] Set strong JWT_SECRET
- [ ] Secure MongoDB with authentication
- [ ] Enable firewall (only ports 80, 443, 22 open)
- [ ] Set up automatic backups
- [ ] Configure rate limiting
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB encryption at rest
- [ ] Implement logging and monitoring
- [ ] Set up DDoS protection (Cloudflare)
- [ ] Regular security updates
- [ ] Use BSV mainnet with real keys

## Monitoring

### Set up monitoring with PM2

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Health check endpoint
The API provides a health check at `/`:
```bash
curl http://localhost:5000/
```

### Logging

Application logs are available:
```bash
# PM2 logs
pm2 logs ppld-backend

# Docker logs
docker-compose logs -f backend

# System logs
journalctl -u ppld-backend -f
```

## Backup Strategy

### MongoDB Backup
```bash
# Daily backup script
mongodump --uri="mongodb://localhost:27017/plumbing-leak-detection" --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/plumbing-leak-detection" /backups/20240101
```

### Automated backups with cron
```bash
# Add to crontab
0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/plumbing-leak-detection" --out=/backups/$(date +\%Y\%m\%d) >> /var/log/mongodb-backup.log 2>&1
```

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy, or cloud LB)
- Run multiple backend instances
- Use MongoDB replica set
- Consider Redis for session storage

### Vertical Scaling
- Increase server resources
- Optimize MongoDB indexes
- Implement caching (Redis)
- Use CDN for static assets

## Maintenance

### Update application
```bash
git pull origin main
npm install
cd client && npm install && npm run build && cd ..
pm2 restart ppld-backend
```

### Database maintenance
```bash
# Check MongoDB status
sudo systemctl status mongod

# Compact database
mongo plumbing-leak-detection --eval "db.runCommand({compact: 'collection_name'})"
```

## Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs ppld-backend
# or
docker-compose logs backend

# Check MongoDB connection
mongo --eval "db.runCommand({ connectionStatus: 1 })"
```

### High memory usage
```bash
# Check PM2 status
pm2 monit

# Restart if needed
pm2 restart ppld-backend
```

### Database connection issues
```bash
# Test MongoDB connection
mongo "mongodb://localhost:27017/plumbing-leak-detection"

# Check if MongoDB is running
sudo systemctl status mongod
```

## Support

For deployment issues:
1. Check logs first
2. Review environment variables
3. Verify network connectivity
4. Check firewall rules
5. Consult documentation
6. Open GitHub issue

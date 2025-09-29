# Deployment Guide

## Production Deployment Options

### 1. Local Server Deployment

#### Requirements
- Node.js 16+
- Stable internet connection
- RFID hardware connected

#### Steps
1. **Clone/Download the project**
2. **Install dependencies**: `npm install`
3. **Configure production environment**:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```
4. **Setup Google Sheets** (see GOOGLE_SHEETS_SETUP.md)
5. **Start production server**:
   ```bash
   NODE_ENV=production npm start
   ```

### 2. Cloud Deployment (Heroku)

#### Steps
1. **Install Heroku CLI**
2. **Create Heroku app**:
   ```bash
   heroku create rfid-attendance-system
   ```
3. **Set environment variables**:
   ```bash
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set GOOGLE_SHEET_ID=your_sheet_id
   heroku config:set NODE_ENV=production
   ```
4. **Upload credentials**:
   ```bash
   # Add credentials as base64 encoded config var
   heroku config:set GOOGLE_CREDENTIALS_BASE64=$(base64 -i credentials.json)
   ```
5. **Deploy**:
   ```bash
   git push heroku main
   ```

### 3. VPS Deployment (Ubuntu/CentOS)

#### Initial Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash attendance
sudo usermod -aG sudo attendance
```

#### Application Deployment
```bash
# Switch to application user
sudo su - attendance

# Clone repository
git clone <your-repo-url> rfid-attendance
cd rfid-attendance

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env  # Edit configuration

# Upload credentials.json to backend/ folder

# Start with PM2
pm2 start backend/server.js --name "rfid-attendance"
pm2 startup
pm2 save
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/attendance/rfid-attendance/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 5000

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  rfid-attendance:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_SHEET_ID=${GOOGLE_SHEET_ID}
    volumes:
      - ./backend/credentials.json:/app/backend/credentials.json:ro
      - /dev/ttyUSB0:/dev/ttyUSB0  # RFID reader
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    restart: unless-stopped
```

## Security Considerations

### 1. Environment Variables
```bash
# Strong JWT secret (32+ characters)
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here

# Secure database credentials
GOOGLE_SHEET_ID=your_actual_sheet_id

# Restrict CORS origins
FRONTEND_URL=https://your-domain.com
```

### 2. HTTPS Setup
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Firewall Configuration
```bash
# Ubuntu UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 5000  # Block direct backend access
```

### 4. Google Sheets Security
1. **Restrict API key** to specific IPs
2. **Use service account** with minimal permissions
3. **Enable audit logging** in Google Cloud Console
4. **Regularly rotate** service account keys

## Monitoring and Maintenance

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Log monitoring
pm2 logs rfid-attendance --lines 100

# Performance monitoring
pm2 status
```

### 2. System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor resources
htop           # CPU/Memory
iotop          # Disk I/O
nethogs        # Network usage
```

### 3. Log Management
```javascript
// Production logging configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### 4. Backup Strategy
```bash
#!/bin/bash
# backup.sh - Daily backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/rfid-attendance"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /home/attendance/rfid-attendance

# Backup Google Sheets (export as CSV)
# Note: Implement using Google Sheets API

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

## Performance Optimization

### 1. Node.js Optimization
```javascript
// Production server configuration
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    require('./server.js');
}
```

### 2. Database Optimization
- **Cache frequently accessed data**
- **Implement pagination** for large datasets
- **Use database indexes** for common queries
- **Archive old attendance records**

### 3. Frontend Optimization
- **Enable gzip compression**
- **Minify CSS/JS files**
- **Use CDN** for static assets
- **Implement service worker** for offline capability

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission denied for RFID port**
   ```bash
   sudo usermod -a -G dialout $USER
   # Logout and login again
   ```

3. **Google Sheets API quota exceeded**
   - Implement request caching
   - Use batch operations
   - Request quota increase

4. **Memory leaks**
   ```bash
   # Monitor memory usage
   pm2 show rfid-attendance
   
   # Restart if needed
   pm2 restart rfid-attendance
   ```

### Health Checks
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});
```

## Scaling Considerations

### 1. Horizontal Scaling
- **Load balancer** (Nginx, HAProxy)
- **Multiple application instances**
- **Session sharing** (Redis)

### 2. Database Scaling
- **Read replicas** for Google Sheets
- **Database sharding** by date/department
- **Caching layer** (Redis, Memcached)

### 3. RFID Hardware Scaling
- **Multiple RFID readers** per location
- **Network-enabled readers** 
- **Centralized processing** server
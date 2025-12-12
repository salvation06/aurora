# Aurora Deployment Guide

Complete guide for deploying Aurora to various hosting platforms.

## 📋 Prerequisites

- Node.js 18+ installed
- npm 9+ installed
- Git repository set up
- (Optional) Docker installed for containerized deployment

## 🏗️ Building for Production

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Build the Application

```bash
npm run build:production
```

This will:
- Clean previous builds
- Build frontend (React + Vite)
- Build backend (TypeScript)
- Copy all necessary files to `dist/` folder
- Create production server
- Set up runtime directories

### 3. Test Locally

```bash
cd dist
node start.js
```

Visit http://localhost:3001 to verify everything works.

## 🚀 Deployment Options

### Option 1: Heroku

#### Setup
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create aurora-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PINATA_JWT=your_jwt_token  # Optional

# Deploy
git add .
git commit -m "Production build"
git push heroku main
```

#### Configuration
- **Buildpack**: Node.js (auto-detected)
- **Start Command**: Defined in `Procfile`
- **Port**: Automatically set by Heroku

#### Post-Deployment
```bash
# View logs
heroku logs --tail

# Open app
heroku open
```

---

### Option 2: Railway

#### Setup
1. Visit https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your Aurora repository
4. Railway auto-detects Node.js

#### Configuration
- **Build Command**: `npm run build:production`
- **Start Command**: `node dist/start.js`
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PINATA_JWT=your_jwt_token` (optional)

#### Custom Domain
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

### Option 3: Render

#### Setup
1. Visit https://render.com/
2. Click "New" → "Web Service"
3. Connect your GitHub repository

#### Configuration
- **Environment**: Node
- **Build Command**: `npm run build:production`
- **Start Command**: `node dist/start.js`
- **Environment Variables**:
  ```
  NODE_ENV=production
  PINATA_JWT=your_jwt_token
  ```

#### Persistent Storage
1. Add a disk in Render dashboard
2. Mount path: `/app/dist/backend/uploads`
3. This preserves uploaded files across deploys

---

### Option 4: DigitalOcean App Platform

#### Setup
1. Visit https://cloud.digitalocean.com/apps
2. Click "Create App" → "GitHub"
3. Select Aurora repository

#### Configuration
```yaml
name: aurora
services:
  - name: web
    environment_slug: node-js
    github:
      branch: main
      deploy_on_push: true
    build_command: npm run build:production
    run_command: node dist/start.js
    envs:
      - key: NODE_ENV
        value: production
      - key: PINATA_JWT
        value: your_jwt_token
        type: SECRET
    http_port: 3001
```

---

### Option 5: Docker Deployment

#### Build Image
```bash
docker build -t aurora:latest .
```

#### Run Container
```bash
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e PINATA_JWT=your_jwt_token \
  -v $(pwd)/data/uploads:/app/backend/uploads \
  -v $(pwd)/data/iso_output:/app/backend/iso_output \
  --name aurora \
  aurora:latest
```

#### Using Docker Compose
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Push to Registry
```bash
# Docker Hub
docker tag aurora:latest yourusername/aurora:latest
docker push yourusername/aurora:latest

# GitHub Container Registry
docker tag aurora:latest ghcr.io/yourusername/aurora:latest
docker push ghcr.io/yourusername/aurora:latest
```

---

### Option 6: AWS (EC2 or ECS)

#### EC2 Deployment
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone https://github.com/yourusername/aurora.git
cd aurora

# Build and run
npm run install:all
npm run build:production
cd dist
node start.js

# Use PM2 for process management
npm install -g pm2
pm2 start start.js --name aurora
pm2 startup
pm2 save
```

#### ECS Deployment
1. Push Docker image to ECR
2. Create ECS task definition
3. Create ECS service
4. Configure load balancer

---

### Option 7: Vercel (Frontend Only)

Vercel is best for static sites, but you can deploy the frontend:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

**Note**: You'll need to deploy the backend separately and update API endpoints.

---

### Option 8: Netlify (Frontend Only)

Similar to Vercel, deploy frontend only:

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build frontend
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Note**: Backend must be deployed separately.

---

## 🔧 Environment Variables

### Required
- `NODE_ENV` - Set to `production`
- `PORT` - Server port (default: 3001)

### Optional
- `PINATA_JWT` - Pinata API key for IPFS uploads
- `POLKADOT_NETWORK` - `westend` (testnet) or `polkadot` (mainnet)
- `CORS_ORIGIN` - Allowed CORS origin (if needed)

### Setting Environment Variables

#### Heroku
```bash
heroku config:set VARIABLE_NAME=value
```

#### Railway/Render
Set in dashboard under "Environment Variables"

#### Docker
```bash
docker run -e VARIABLE_NAME=value ...
```

#### .env file (local)
```bash
cp .env.example .env
# Edit .env with your values
```

---

## 📊 Monitoring & Logs

### Heroku
```bash
heroku logs --tail
heroku ps
```

### Railway
View logs in dashboard under "Deployments"

### Render
View logs in dashboard under "Logs"

### Docker
```bash
docker logs -f aurora
docker stats aurora
```

### PM2 (EC2)
```bash
pm2 logs aurora
pm2 monit
```

---

## 🔒 Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS (most platforms provide this automatically)
- [ ] Set secure CORS origins
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting (if needed)
- [ ] Set up monitoring and alerts
- [ ] Regular backups of uploaded files
- [ ] Review and rotate API keys regularly

---

## 📈 Performance Optimization

### Frontend
- ✅ Code splitting (configured in Vite)
- ✅ Asset optimization
- ✅ Gzip compression (enable on server)
- Consider CDN for static assets

### Backend
- Use PM2 cluster mode for multiple cores
- Enable caching where appropriate
- Monitor memory usage
- Set up health checks

### Database (if added later)
- Use connection pooling
- Add indexes
- Regular backups

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
npm run clean
npm run install:all
npm run build:production
```

### Port Already in Use
```bash
# Change port
export PORT=3002
node dist/start.js
```

### Module Not Found
```bash
# Ensure all dependencies are installed
cd backend
npm install
cd ../frontend
npm install
```

### NFT Minting Fails
- Check user has wallet extension installed
- Verify network configuration (testnet vs mainnet)
- Ensure user has sufficient tokens
- Check PINATA_JWT if using IPFS

---

## 📦 File Storage

### Uploads Directory
User-uploaded tracks are stored in `backend/uploads/`

**Production**: Use cloud storage (S3, Google Cloud Storage, etc.)

### ISO Files
Generated ISOs are stored in `backend/iso_output/`

**Production**: Consider cleanup strategy or cloud storage

---

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Aurora

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm run install:all
      
      - name: Build
        run: npm run build:production
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.14
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "aurora-app"
          heroku_email: "your-email@example.com"
```

---

## 📞 Support

### Documentation
- Main README: `README.md`
- NFT Setup: `backend/NFT_README.md`
- Quick Start: `backend/QUICK_START_NFT.md`

### Common Issues
1. **Build fails**: Check Node.js version (18+)
2. **Port conflicts**: Change PORT environment variable
3. **NFT issues**: See NFT documentation
4. **File uploads**: Check directory permissions

---

## 🎯 Post-Deployment Checklist

- [ ] Application accessible via URL
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] File uploads work
- [ ] ISO creation works (if applicable)
- [ ] NFT minting works (with wallet)
- [ ] Environment variables set
- [ ] Logs are accessible
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL/HTTPS enabled
- [ ] Performance acceptable

---

## 🚀 Quick Deploy Commands

### Heroku
```bash
npm run build:production
git add dist/
git commit -m "Production build"
git push heroku main
```

### Railway
```bash
git push origin main
# Railway auto-deploys
```

### Docker
```bash
docker build -t aurora .
docker run -d -p 3001:3001 aurora
```

---

**Need help?** Check the troubleshooting section or review the platform-specific documentation.

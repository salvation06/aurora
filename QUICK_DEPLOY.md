# Quick Deploy Reference

Fast reference for deploying Aurora to production.

## 🚀 One-Command Deploy

### Build
```bash
npm run build:production
```

### Test Locally
```bash
cd dist && node start.js
```

## 📦 Platform Quick Start

### Heroku
```bash
heroku create aurora-app
git push heroku main
```

### Railway
```bash
# Push to GitHub, Railway auto-deploys
git push origin main
```

### Render
```bash
# Connect GitHub repo in Render dashboard
# Build: npm run build:production
# Start: node dist/start.js
```

### Docker
```bash
docker build -t aurora .
docker run -d -p 3001:3001 aurora
```

## 🔧 Environment Variables

```bash
NODE_ENV=production
PORT=3001
PINATA_JWT=your_jwt_token  # Optional
```

## 📋 Pre-Deploy Checklist

- [ ] Code committed to Git
- [ ] Build successful locally
- [ ] Environment variables set
- [ ] Platform account created
- [ ] Domain configured (optional)

## 🎯 Post-Deploy Verification

1. Visit your app URL
2. Check frontend loads
3. Test file upload
4. Verify API responds
5. Test NFT minting (with wallet)

## 📞 Quick Links

- Full Guide: `DEPLOYMENT.md`
- Build Guide: `BUILD_GUIDE.md`
- NFT Setup: `backend/NFT_README.md`

---

**Need help?** See `DEPLOYMENT.md` for detailed instructions.

# Aurora - Production Build

This is the production build of Aurora, ready for deployment.

## Quick Start

```bash
node start.js
```

The server will start on port 3001 (or PORT environment variable).

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Set to "production"
- `PINATA_JWT` - Pinata API key for IPFS uploads (optional)

## Directory Structure

```
dist/
├── server.js              # Production server
├── start.js               # Start script
├── backend/               # Backend API
│   ├── server.js
│   ├── agents/
│   ├── blockchain/
│   ├── uploads/           # User uploads
│   ├── iso_output/        # Generated ISOs
│   └── iso_workspace/     # Temp workspace
└── frontend/              # Static frontend files
    ├── index.html
    └── assets/
```

## Deployment Platforms

### Heroku
```bash
# Create Procfile
echo "web: node start.js" > Procfile

# Deploy
git add .
git commit -m "Production build"
heroku create aurora-app
git push heroku main
```

### Railway
```bash
# Railway will auto-detect Node.js
# Set start command: node start.js
```

### Render
```bash
# Build command: npm run build:production
# Start command: node dist/start.js
```

### DigitalOcean App Platform
```bash
# Build command: npm run build:production
# Run command: node dist/start.js
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY dist/ .
EXPOSE 3001
CMD ["node", "start.js"]
```

## NFT Integration

The Polkadot NFT integration requires:
1. User's browser wallet extension (Polkadot.js, SubWallet, or Talisman)
2. WND tokens for testnet or DOT for mainnet
3. Optional: PINATA_JWT environment variable for IPFS uploads

See `backend/NFT_README.md` for complete setup.

## Notes

- Frontend is served as static files
- Backend API runs on the same server
- File uploads stored in `backend/uploads/`
- ISO files created in `backend/iso_output/`
- NFT minting requires user's wallet extension

## Support

For issues or questions, see the documentation in the source repository.

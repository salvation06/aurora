# Aurora

AI-powered CD package generator for AI-generated music tracks.

## Project Structure

```
aurora/
├── frontend/          # React + TypeScript + TailwindCSS
├── backend/           # Node.js + Express + TypeScript
├── KiroFlow.yaml      # Multi-agent system specification
└── README.md
```

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Run the App

```bash
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend UI on http://localhost:3000

### 3. Use the App

1. Open http://localhost:3000 in your browser
2. Fill in artist name, album name, and description
3. Upload one or more audio/video files (AI-generated tracks)
4. Click "Generate CD Package"
5. Watch the progress and see the generated AI assets

## Features

- **Artist Persona Generation** - Creates an AI artist identity
- **Album Identity** - Defines themes, colors, and visual direction
- **Liner Notes** - Writes album story and track notes
- **Cover Art** - Generates prompts and placeholder images
- **Promo Storyboard** - Creates a 20-second promo video outline
- **Content Bundle** - Packages everything for CD creation
- **ISO Creation** - (Optional) Creates ISO and burns to CD

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express, TypeScript, Multer
- **Multi-Agent System**: Custom flow executor with 8 specialized agents

## Development

```bash
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build for production
npm run build:production
```

## 🚀 Deployment

Aurora is ready for production deployment!

### Quick Deploy
```bash
# Build for production
npm run build:production

# Test locally
cd dist && node start.js
```

### Supported Platforms
- ✅ Heroku
- ✅ Railway
- ✅ Render
- ✅ DigitalOcean
- ✅ Docker
- ✅ AWS (EC2/ECS)
- ✅ Vercel (frontend)
- ✅ Netlify (frontend)

**See `DEPLOYMENT.md` for complete deployment guide**  
**See `BUILD_GUIDE.md` for build instructions**  
**See `QUICK_DEPLOY.md` for quick reference**

## NFT Integration 🆕

Aurora now includes **full Polkadot blockchain integration** for minting Album Master NFTs!

- ✅ Real on-chain NFTs (not mocked)
- ✅ ISO SHA-256 hash stored permanently
- ✅ Wallet support (Polkadot.js, SubWallet, Talisman)
- ✅ Testnet ready (Westend Asset Hub)

**Get started**: See `backend/QUICK_START_NFT.md` for 5-minute setup  
**Full docs**: See `backend/NFT_README.md` for complete guide

## Notes

- This is a minimal working implementation with mock data
- Cover art uses AI-generated images via Pollinations AI
- ISO creation uses native macOS/Linux tools (hdiutil/mkisofs)
- **NFT minting is fully implemented** - See NFT documentation above
- File uploads are stored in `backend/uploads/`
- ISO files are created in `backend/iso_output/`

# Aurora Build Guide

Step-by-step guide to building Aurora for production deployment.

## 📋 Prerequisites

Before building, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm 9+ installed
- ✅ Git repository initialized
- ✅ All source code committed

Check versions:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

## 🏗️ Build Process

### Step 1: Clean Previous Builds

```bash
npm run clean
```

This removes the `dist/` directory if it exists.

### Step 2: Install Dependencies

```bash
npm run install:all
```

This installs dependencies for:
- Root workspace
- Frontend workspace
- Backend workspace

### Step 3: Build for Production

```bash
npm run build:production
```

This command:
1. Cleans previous builds
2. Builds frontend (TypeScript → JavaScript, React → optimized bundle)
3. Builds backend (TypeScript → JavaScript)
4. Copies all files to `dist/` folder
5. Creates production server
6. Sets up runtime directories

### Step 4: Verify Build

```bash
cd dist
ls -la
```

You should see:
```
dist/
├── backend/           # Backend compiled code
├── frontend/          # Frontend static files
├── server.js          # Production server
├── start.js           # Start script
├── package.json       # Dist package.json
└── README.md          # Deployment instructions
```

### Step 5: Test Locally

```bash
node start.js
```

Visit http://localhost:3001 to verify:
- ✅ Frontend loads
- ✅ Backend API responds
- ✅ File uploads work
- ✅ All features functional

## 📦 What Gets Built

### Frontend Build
- **Input**: `frontend/src/` (TypeScript + React)
- **Output**: `dist/frontend/` (Optimized static files)
- **Process**:
  - TypeScript compilation
  - React component bundling
  - CSS processing (Tailwind)
  - Asset optimization
  - Code splitting
  - Minification

### Backend Build
- **Input**: `backend/src/` (TypeScript)
- **Output**: `dist/backend/` (JavaScript modules)
- **Process**:
  - TypeScript compilation
  - Module resolution
  - Source maps (optional)
  - Dependencies copied

### Production Server
- **File**: `dist/server.js`
- **Purpose**: Serves both frontend and backend
- **Features**:
  - Static file serving (frontend)
  - API routing (backend)
  - CORS handling
  - Error handling

## 🔍 Build Output Structure

```
dist/
├── backend/
│   ├── dist/                    # Compiled backend code
│   │   ├── server.js
│   │   ├── flows.js
│   │   ├── types.js
│   │   └── agents/
│   │       ├── MediaIngestionAgent.js
│   │       ├── ArtistPersonaAgent.js
│   │       ├── AlbumIdentityAgent.js
│   │       ├── LinerNotesAgent.js
│   │       ├── CoverArtAgent.js
│   │       ├── PromoStoryboardAgent.js
│   │       ├── PackagingAgent.js
│   │       ├── CDWriterAgent.js
│   │       └── NFTMinterAgent.js
│   ├── blockchain/              # Blockchain integration
│   │   ├── blockchain.js
│   │   ├── album-nft.js
│   │   └── example.js
│   ├── node_modules/            # Production dependencies
│   ├── uploads/                 # User uploads (empty)
│   ├── iso_output/              # Generated ISOs (empty)
│   ├── iso_workspace/           # Temp workspace (empty)
│   └── package.json
│
├── frontend/
│   ├── index.html               # Entry point
│   ├── assets/                  # Optimized assets
│   │   ├── index-[hash].js      # Main bundle
│   │   ├── vendor-[hash].js     # Vendor bundle
│   │   └── index-[hash].css     # Styles
│   └── [other static files]
│
├── server.js                    # Production server
├── start.js                     # Start script
├── package.json                 # Dist package.json
└── README.md                    # Deployment guide
```

## 🎯 Build Optimization

### Frontend Optimizations
- ✅ Code splitting (vendor/app bundles)
- ✅ Tree shaking (unused code removed)
- ✅ Minification (smaller file sizes)
- ✅ Asset optimization (images, fonts)
- ✅ CSS purging (unused styles removed)
- ✅ Gzip compression ready

### Backend Optimizations
- ✅ TypeScript compilation
- ✅ Production dependencies only
- ✅ Module bundling
- ✅ Source maps (optional)

## 🐛 Troubleshooting

### Build Fails

**Error: TypeScript compilation errors**
```bash
# Check for type errors
cd frontend
npx tsc --noEmit

cd ../backend
npx tsc --noEmit
```

**Error: Module not found**
```bash
# Reinstall dependencies
npm run clean
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

**Error: Permission denied**
```bash
# Fix permissions
chmod +x scripts/build.js
```

### Build Succeeds but App Doesn't Work

**Frontend doesn't load**
- Check `dist/frontend/index.html` exists
- Verify assets in `dist/frontend/assets/`
- Check browser console for errors

**Backend API doesn't respond**
- Check `dist/backend/dist/server.js` exists
- Verify node_modules copied
- Check server logs

**File uploads fail**
- Verify `dist/backend/uploads/` directory exists
- Check directory permissions
- Ensure multer is in dependencies

## 📊 Build Metrics

Typical build output sizes:

### Frontend
- **Uncompressed**: ~500KB - 1MB
- **Gzipped**: ~150KB - 300KB
- **Files**: 10-20 files

### Backend
- **Code**: ~100KB - 200KB
- **node_modules**: ~50MB - 100MB
- **Total**: ~50MB - 100MB

### Total Build
- **Size**: ~50MB - 100MB
- **Time**: 30-60 seconds
- **Files**: 1000+ files (including node_modules)

## 🚀 Build Scripts Reference

### Available Scripts

```bash
# Clean build directory
npm run clean

# Install all dependencies
npm run install:all

# Build workspaces (frontend + backend)
npm run build

# Full production build
npm run build:production

# Copy assets (internal)
npm run copy:assets

# Start production server
npm run start:production
```

### Custom Build

If you need a custom build process:

```bash
# Build frontend only
cd frontend
npm run build

# Build backend only
cd backend
npm run build

# Manual copy
node scripts/build.js
```

## 🔧 Build Configuration

### Frontend (Vite)
Configuration: `frontend/vite.config.ts`

```typescript
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
})
```

### Backend (TypeScript)
Configuration: `backend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## 📝 Build Checklist

Before building:
- [ ] All code committed to Git
- [ ] Dependencies up to date
- [ ] Tests passing (if applicable)
- [ ] Environment variables documented
- [ ] README updated

After building:
- [ ] Build completes without errors
- [ ] `dist/` directory created
- [ ] Frontend files in `dist/frontend/`
- [ ] Backend files in `dist/backend/`
- [ ] Production server created
- [ ] Local test successful
- [ ] File uploads work
- [ ] API endpoints respond

## 🎓 Next Steps

After successful build:

1. **Test Locally**
   ```bash
   cd dist
   node start.js
   ```

2. **Review Deployment Guide**
   ```bash
   cat DEPLOYMENT.md
   ```

3. **Choose Deployment Platform**
   - Heroku
   - Railway
   - Render
   - DigitalOcean
   - Docker
   - AWS

4. **Deploy**
   Follow platform-specific instructions in `DEPLOYMENT.md`

## 📞 Support

### Build Issues
- Check Node.js version (18+)
- Verify all dependencies installed
- Review error messages carefully
- Check file permissions

### Documentation
- Deployment: `DEPLOYMENT.md`
- NFT Setup: `backend/NFT_README.md`
- Main README: `README.md`

---

**Ready to deploy?** See `DEPLOYMENT.md` for platform-specific instructions.

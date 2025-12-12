// Build script for production deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🚀 Building Aurora for production...\n');

// Create dist directory structure
const distDir = path.join(rootDir, 'dist');
const distBackendDir = path.join(distDir, 'backend');
const distFrontendDir = path.join(distDir, 'frontend');

console.log('📁 Creating directory structure...');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy backend build
console.log('📦 Copying backend build...');
const backendDistSrc = path.join(rootDir, 'backend', 'dist');
if (fs.existsSync(backendDistSrc)) {
  copyRecursive(backendDistSrc, distBackendDir);
} else {
  console.error('❌ Backend build not found. Run "npm run build" first.');
  process.exit(1);
}

// Copy backend node_modules (production only)
console.log('📦 Copying backend dependencies...');
const backendNodeModules = path.join(rootDir, 'backend', 'node_modules');
const distNodeModules = path.join(distBackendDir, 'node_modules');
if (fs.existsSync(backendNodeModules)) {
  copyRecursive(backendNodeModules, distNodeModules);
}

// Copy backend package.json
console.log('📄 Copying backend package.json...');
const backendPackageJson = path.join(rootDir, 'backend', 'package.json');
const distPackageJson = path.join(distBackendDir, 'package.json');
fs.copyFileSync(backendPackageJson, distPackageJson);

// Copy frontend build
console.log('📦 Copying frontend build...');
const frontendDistSrc = path.join(rootDir, 'frontend', 'dist');
if (fs.existsSync(frontendDistSrc)) {
  copyRecursive(frontendDistSrc, distFrontendDir);
} else {
  console.error('❌ Frontend build not found. Run "npm run build" first.');
  process.exit(1);
}

// Create necessary runtime directories
console.log('📁 Creating runtime directories...');
const uploadsDir = path.join(distBackendDir, 'uploads');
const isoOutputDir = path.join(distBackendDir, 'iso_output');
const isoWorkspaceDir = path.join(distBackendDir, 'iso_workspace');

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(isoOutputDir, { recursive: true });
fs.mkdirSync(isoWorkspaceDir, { recursive: true });

// Create .gitkeep files
fs.writeFileSync(path.join(uploadsDir, '.gitkeep'), '');
fs.writeFileSync(path.join(isoOutputDir, '.gitkeep'), '');
fs.writeFileSync(path.join(isoWorkspaceDir, '.gitkeep'), '');

// Create production server.js that serves both frontend and backend
console.log('📝 Creating production server...');
const productionServerContent = `// Production server for Aurora
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import backend routes
import('./backend/server.js').then((module) => {
  console.log('✅ Backend API loaded');
}).catch((err) => {
  console.error('❌ Failed to load backend:', err);
});

// Serve static frontend files
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// API routes are handled by backend/server.js
// Frontend routes - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(\`🚀 Aurora production server running on http://localhost:\${PORT}\`);
  console.log(\`📱 Frontend: http://localhost:\${PORT}\`);
  console.log(\`🔌 Backend API: http://localhost:\${PORT}/api\`);
});
`;

fs.writeFileSync(path.join(distDir, 'server.js'), productionServerContent);

// Create start script
console.log('📝 Creating start script...');
const startScriptContent = `#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Aurora...');

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(\`Server exited with code \${code}\`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('\\n👋 Shutting down Aurora...');
  server.kill('SIGINT');
});
`;

fs.writeFileSync(path.join(distDir, 'start.js'), startScriptContent);

// Create README for deployment
console.log('📝 Creating deployment README...');
const deploymentReadme = `# Aurora - Production Build

This is the production build of Aurora, ready for deployment.

## Quick Start

\`\`\`bash
node start.js
\`\`\`

The server will start on port 3001 (or PORT environment variable).

## Environment Variables

- \`PORT\` - Server port (default: 3001)
- \`NODE_ENV\` - Set to "production"
- \`PINATA_JWT\` - Pinata API key for IPFS uploads (optional)

## Directory Structure

\`\`\`
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
\`\`\`

## Deployment Platforms

### Heroku
\`\`\`bash
# Create Procfile
echo "web: node start.js" > Procfile

# Deploy
git add .
git commit -m "Production build"
heroku create aurora-app
git push heroku main
\`\`\`

### Railway
\`\`\`bash
# Railway will auto-detect Node.js
# Set start command: node start.js
\`\`\`

### Render
\`\`\`bash
# Build command: npm run build:production
# Start command: node dist/start.js
\`\`\`

### DigitalOcean App Platform
\`\`\`bash
# Build command: npm run build:production
# Run command: node dist/start.js
\`\`\`

### Docker
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY dist/ .
EXPOSE 3001
CMD ["node", "start.js"]
\`\`\`

## NFT Integration

The Polkadot NFT integration requires:
1. User's browser wallet extension (Polkadot.js, SubWallet, or Talisman)
2. WND tokens for testnet or DOT for mainnet
3. Optional: PINATA_JWT environment variable for IPFS uploads

See \`backend/NFT_README.md\` for complete setup.

## Notes

- Frontend is served as static files
- Backend API runs on the same server
- File uploads stored in \`backend/uploads/\`
- ISO files created in \`backend/iso_output/\`
- NFT minting requires user's wallet extension

## Support

For issues or questions, see the documentation in the source repository.
`;

fs.writeFileSync(path.join(distDir, 'README.md'), deploymentReadme);

// Create package.json for dist
console.log('📝 Creating dist package.json...');
const distPackageJsonContent = {
  name: 'aurora-production',
  version: '1.0.0',
  type: 'module',
  scripts: {
    start: 'node start.js'
  },
  engines: {
    node: '>=18.0.0'
  }
};

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(distPackageJsonContent, null, 2)
);

console.log('\n✅ Production build complete!');
console.log('\n📦 Build output: ./dist/');
console.log('\n🚀 To start production server:');
console.log('   cd dist');
console.log('   node start.js');
console.log('\n📚 See dist/README.md for deployment instructions\n');

// Helper function to copy directories recursively
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }

  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach((file) => {
      // Skip node_modules subdirectories we don't need
      if (file === '.git' || file === '.DS_Store' || file === 'tsconfig.tsbuildinfo') {
        return;
      }

      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

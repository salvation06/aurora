// Production server for Aurora
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
  console.log(`🚀 Aurora production server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 Backend API: http://localhost:${PORT}/api`);
});

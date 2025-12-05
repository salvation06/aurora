import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { FlowExecutor } from './flows.js';
import { TrackUpload } from './types.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

const flowExecutor = new FlowExecutor();

// POST /api/aurora/start
app.post('/api/aurora/start', upload.array('uploadedTracks'), async (req, res) => {
  try {
    const { artistName, albumName, albumDescription, burnCD, driveId } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!artistName || !albumName || !albumDescription || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const uploadedTracks: TrackUpload[] = files.map((file) => ({
      id: uuidv4(),
      filePath: file.path,
      originalFileName: file.originalname,
      userTitle: file.originalname.replace(/\.[^/.]+$/, ''),
    }));

    const jobId = uuidv4();

    // Execute flow asynchronously
    flowExecutor.executeGenerateCDPackage(
      jobId,
      artistName,
      albumName,
      albumDescription,
      uploadedTracks,
      burnCD === 'true',
      driveId
    );

    res.status(202).json({ jobId });
  } catch (error) {
    console.error('Error starting job:', error);
    res.status(500).json({ error: 'Failed to start job' });
  }
});

// GET /api/aurora/status
app.get('/api/aurora/status', (req, res) => {
  const { jobId } = req.query;

  if (!jobId || typeof jobId !== 'string') {
    return res.status(400).json({ error: 'Missing jobId' });
  }

  const job = flowExecutor.getJobStatus(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json(job);
});

app.listen(PORT, () => {
  console.log(`Aurora backend running on http://localhost:${PORT}`);
});

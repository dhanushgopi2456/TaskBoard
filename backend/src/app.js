import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Health check endpoint as required by assignment specification
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// JSON Health check endpoint alternative
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Serve static frontend assets if frontend build exists
const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // SPA fallback for client-side navigation (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
} else {
  // Root fallback when running purely as API server
  app.get('/', (req, res) => {
    res.send('TaskBoard API Server is running smoothly!');
  });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

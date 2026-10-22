import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { initDb } from './db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 TaskBoard REST API server listening on http://localhost:${PORT}`);
      console.log(`🩺 Health check ready at http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to initialize database or start server:', err);
    process.exit(1);
  }
}

startServer();

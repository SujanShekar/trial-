import { createServer as createViteServer } from 'vite';
import path from 'path';
import express from 'express';
import app from './server/app';
import { recoverBiometricQueue } from './server/services/biometricQueue';

async function startServer() {
  const PORT = 8082;

  // --- Vite / Static Middleware setup ---
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[${new Date().toISOString()}] Server running on http://localhost:${PORT}`);
    console.log(`[${new Date().toISOString()}] Port: ${PORT}, Mode: ${process.env.NODE_ENV || 'development'}`);
    void recoverBiometricQueue();
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

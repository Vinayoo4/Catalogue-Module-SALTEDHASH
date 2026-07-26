import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Contracts Server Endpoints for Catalog Module
  app.get('/api/catalog/health', (req, res) => {
    res.json({
      status: 'ok',
      module: 'Catalog',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Serve Vite in development mode
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`
=============================================
               SALTEDHASH
            Business OS Core
=============================================
    `);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();

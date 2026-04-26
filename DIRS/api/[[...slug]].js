import fs from 'fs';
import path from 'path';

/**
 * Catch-all handler for SPA routing
 * 
 * Routes matched:
 * - /api/health → health.js (exact match, doesn't reach here)
 * - /api/users → users.js (exact match, doesn't reach here)
 * - /dashboard → THIS HANDLER (no exact match, so catch-all)
 * - /settings → THIS HANDLER
 * - /any/nested/path → THIS HANDLER
 * 
 * Returns index.html for all non-API routes so React Router can handle them
 */
export default function handler(req, res) {
  try {
    // Safety check: this shouldn't happen, but if an API request somehow reaches here, reject it
    if (req.url.startsWith('/api/')) {
      return res.status(404).json({ 
        error: 'API endpoint not found',
        path: req.url 
      });
    }

    // For all other routes, serve the frontend's index.html
    // React Router will handle the client-side routing
    const indexPath = path.join(process.cwd(), '.vercel', 'output', 'static', 'index.html');
    
    // Try multiple possible locations for index.html
    let htmlPath = indexPath;
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), 'frontend', 'dist', 'index.html');
    }
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(process.cwd(), '.vercel', 'output', 'public', 'index.html');
    }

    if (!fs.existsSync(htmlPath)) {
      return res.status(500).json({
        error: 'Frontend build not found',
        searched: [indexPath, path.join(process.cwd(), 'frontend', 'dist', 'index.html')],
        message: 'Run: npm install && cd frontend && npm install && npm run build'
      });
    }

    const html = fs.readFileSync(htmlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error in catch-all handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

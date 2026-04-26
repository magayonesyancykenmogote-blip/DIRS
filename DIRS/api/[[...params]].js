import fs from 'fs';
import path from 'path';

/**
 * Catch-all handler for SPA routing
 * 
 * This catches all requests that don't match other routes
 * and serves index.html for React Router to handle client-side routing.
 * 
 * Request flow:
 * 1. /api/health → matches api/health.js (processed before this)
 * 2. /api/users → matches api/users.js (processed before this)  
 * 3. /dashboard → no specific handler → caught here → returns index.html
 * 4. /login → no specific handler → caught here → returns index.html
 */
export default async function handler(req, res) {
  try {
    // Don't serve index.html for API requests (this shouldn't be reached, but just in case)
    if (req.url.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }

    // For all other requests, serve index.html (SPA fallback)
    const indexPath = path.join(process.cwd(), 'frontend', 'dist', 'index.html');
    
    // Check if file exists
    if (!fs.existsSync(indexPath)) {
      return res.status(500).json({ 
        error: 'Frontend build not found. Run: npm run build' 
      });
    }

    const html = fs.readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error serving SPA fallback:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

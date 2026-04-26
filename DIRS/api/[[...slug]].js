/**
 * Catch-all handler for undefined API routes
 * 
 * This only handles API routes that don't match specific handlers.
 * Routes matched:
 * - /api/health → health.js (specific match, doesn't reach here)
 * - /api/users → users.js (specific match, doesn't reach here)
 * - /api/undefined-route → THIS HANDLER (404 for undefined API routes)
 * 
 * Note: Non-API routes (like /dashboard) are handled by vercel.json rewrites
 * which rewrite them to /index.html for SPA routing
 */
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.url,
    message: 'Check if your API endpoint is properly defined in the /api folder'
  });
}

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  // If it's an API route that doesn't exist, return 404
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.url
    });
  }
  
  // For non-API routes, return 404 (Vercel rewrites handle SPA routing)
  return res.status(404).json({
    error: 'Not found',
    path: req.url
  });
}

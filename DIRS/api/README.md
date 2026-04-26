# Vercel Serverless API Functions

This `/api` folder contains the serverless API handlers for Vercel deployment.

## Structure

- `index.js` - Main Express app handler that manages all API routes

## How It Works

The `index.js` file:
1. Initializes an Express app with all your routes
2. Handles CORS configuration
3. Manages MongoDB database connection
4. Exports the Express app as a default export

Vercel automatically:
- Converts this into serverless functions
- Routes `/api/*` requests to this handler
- Manages cold starts and scaling

## Environment Variables

Make sure these are set in your Vercel project:

- `MONGODB_URI` - Your MongoDB connection string
- `FRONTEND_URL` - Your frontend URL (for CORS)
- `NODE_ENV` - Set to 'production'

## Database Connection

The MongoDB connection is initialized once and reused across invocations for better performance. Cold starts may take longer on the first request.

## Testing Locally

```bash
# From root directory
npm run dev:backend
```

## Deployment

Simply push to your git repository connected to Vercel, and your changes will be automatically deployed!

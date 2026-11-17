import app from '../server/app.ts';

// Vercel catch-all serverless function.
// Preserve the incoming /api/... pathname so Express can match API routes.
export default app;

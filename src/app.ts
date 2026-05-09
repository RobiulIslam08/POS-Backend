import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import notFound from './app/middleware/notFound';
import config from './app/config';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [config.frontend_url as string, 'http://localhost:3000'],
    credentials: true,
  }),
);

// API routes
app.use('/api/v1', router);

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'POS Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(globalErrorHandler);

// Not found handler
app.use(notFound);

export default app;

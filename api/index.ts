import app from '../src/app';
import mongoose from 'mongoose';
import config from '../src/app/config';

let isConnected = false;

// Export the serverless function handler
export default async function handler(req: any, res: any) {
  // Connect to database if not already connected
  if (!isConnected) {
    try {
      await mongoose.connect(config.database_url as string);
      isConnected = true;
      console.log('MongoDB Connected to Vercel Serverless Function');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return res.status(500).json({ success: false, message: 'Database connection failed' });
    }
  }

  // Let Express handle the request
  return app(req, res);
}

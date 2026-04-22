import express, { Express, NextFunction, Request, Response } from 'express';
import { assessmentRoutes } from './routes/assessmentRoutes';
import { classRoutes } from './routes/classRoutes';
import { emailRoutes } from './routes/emailRoutes';
import { goalRoutes } from './routes/goalRoutes';
import { studentRoutes } from './routes/studentRoutes';
import { errorHandler } from './utils/errorHandler';

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use('/api/students', studentRoutes());
  app.use('/api/goals', goalRoutes());
  app.use('/api/classes', classRoutes());
  app.use('/api/assessments', assessmentRoutes());
  app.use('/api/emails', emailRoutes());

  app.use(errorHandler);
  return app;
}

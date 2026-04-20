import { Router } from 'express';
import * as controller from '../controllers/assessmentController';

export function assessmentRoutes(): Router {
  const router = Router();
  router.get('/', controller.list);
  router.put('/:studentId/:goalId', controller.setOne);
  router.delete('/:studentId/:goalId', controller.remove);
  return router;
}

import { Router } from 'express';
import * as controller from '../controllers/emailController';

export function emailRoutes(): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/dispatch', controller.dispatch);
  return router;
}

import { Router } from 'express';
import * as controller from '../controllers/studentController';

export function studentRoutes(): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.getOne);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}

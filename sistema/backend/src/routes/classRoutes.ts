import { Router } from 'express';
import * as controller from '../controllers/classController';

export function classRoutes(): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.getOne);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  router.post('/:id/students/:studentId', controller.enroll);
  router.delete('/:id/students/:studentId', controller.unenroll);

  router.get('/:id/assessments', controller.listAssessments);
  router.put('/:id/assessments/:studentId/:goalId', controller.setAssessment);
  router.delete('/:id/assessments/:studentId/:goalId', controller.clearAssessment);

  return router;
}

import { NextFunction, Request, Response } from 'express';
import * as service from '../services/assessmentService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const assessments = await service.listAssessments();
    res.json(assessments);
  } catch (err) {
    next(err);
  }
}

export async function setOne(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, goalId } = req.params;
    const assessment = await service.setAssessment(studentId, goalId, req.body);
    res.json(assessment);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const { studentId, goalId } = req.params;
    await service.clearAssessment(studentId, goalId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

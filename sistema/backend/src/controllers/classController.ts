import { NextFunction, Request, Response } from 'express';
import * as classService from '../services/classService';
import * as classAssessmentService from '../services/classAssessmentService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const classes = await classService.listClasses();
    res.json(classes);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const entity = await classService.getClass(req.params.id);
    res.json(entity);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const entity = await classService.createClass(req.body);
    res.status(201).json(entity);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const entity = await classService.updateClass(req.params.id, req.body);
    res.json(entity);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await classService.deleteClass(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function enroll(req: Request, res: Response, next: NextFunction) {
  try {
    const entity = await classService.enrollStudent(req.params.id, req.params.studentId);
    res.status(200).json(entity);
  } catch (err) {
    next(err);
  }
}

export async function unenroll(req: Request, res: Response, next: NextFunction) {
  try {
    const entity = await classService.unenrollStudent(
      req.params.id,
      req.params.studentId,
    );
    res.status(200).json(entity);
  } catch (err) {
    next(err);
  }
}

export async function listAssessments(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const assessments = await classAssessmentService.listByClass(req.params.id);
    res.json(assessments);
  } catch (err) {
    next(err);
  }
}

export async function setAssessment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: classId, studentId, goalId } = req.params;
    const assessment = await classAssessmentService.setClassAssessment(
      classId,
      studentId,
      goalId,
      req.body,
    );
    res.json(assessment);
  } catch (err) {
    next(err);
  }
}

export async function clearAssessment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: classId, studentId, goalId } = req.params;
    await classAssessmentService.clearClassAssessment(classId, studentId, goalId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

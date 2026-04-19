import { NextFunction, Request, Response } from 'express';
import * as service from '../services/studentService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const students = await service.listStudents();
    res.json(students);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await service.getStudent(req.params.id);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await service.createStudent(req.body);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await service.updateStudent(req.params.id, req.body);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteStudent(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

import { NextFunction, Request, Response } from 'express';
import * as service from '../services/goalService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const goals = await service.listGoals();
    res.json(goals);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await service.getGoal(req.params.id);
    res.json(goal);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await service.createGoal(req.body);
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await service.updateGoal(req.params.id, req.body);
    res.json(goal);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteGoal(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

import { NextFunction, Request, Response } from 'express';
import { EmailStatus } from '../models/email';
import * as service from '../services/emailService';

function stringQuery(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function parseStatus(value: unknown): EmailStatus | undefined {
  return value === 'pending' || value === 'sent' ? value : undefined;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filter: Parameters<typeof service.listEmails>[0] = {};
    const status = parseStatus(req.query.status);
    if (status) filter.status = status;
    const studentId = stringQuery(req.query.studentId);
    if (studentId) filter.studentId = studentId;
    const dateKey = stringQuery(req.query.date);
    if (dateKey) filter.dateKey = dateKey;
    const emails = await service.listEmails(filter);
    res.json(emails);
  } catch (err) {
    next(err);
  }
}

export async function dispatch(req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.body && typeof req.body.date === 'string' ? req.body.date : undefined;
    const dispatched = await service.dispatchForDate(raw);
    res.json(dispatched);
  } catch (err) {
    next(err);
  }
}

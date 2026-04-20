import { randomUUID } from 'node:crypto';
import { Goal, GoalInput } from '../models/goal';
import * as repo from '../repositories/goalRepository';
import * as assessmentRepo from '../repositories/assessmentRepository';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

function validateInput(input: Partial<GoalInput>): GoalInput {
  const fields: Record<string, string> = {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) fields.name = 'name is required';

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Invalid goal payload', fields);
  }
  return { name };
}

export async function listGoals(): Promise<Goal[]> {
  return repo.findAll();
}

export async function getGoal(id: string): Promise<Goal> {
  const goal = await repo.findById(id);
  if (!goal) throw new NotFoundError('Goal not found');
  return goal;
}

export async function createGoal(input: Partial<GoalInput>): Promise<Goal> {
  const data = validateInput(input);

  const byName = await repo.findByName(data.name);
  if (byName) throw new ConflictError('A goal with this name already exists');

  const goal: Goal = { id: randomUUID(), ...data };
  return repo.save(goal);
}

export async function updateGoal(id: string, input: Partial<GoalInput>): Promise<Goal> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Goal not found');

  const data = validateInput(input);

  const byName = await repo.findByName(data.name);
  if (byName && byName.id !== id) {
    throw new ConflictError('A goal with this name already exists');
  }

  const updated: Goal = { id, ...data };
  return repo.save(updated);
}

export async function deleteGoal(id: string): Promise<void> {
  const removed = await repo.deleteById(id);
  if (!removed) throw new NotFoundError('Goal not found');
  await assessmentRepo.deleteByGoal(id);
}

import type { Goal, GoalInput } from '../types/assessment';
import { parseError } from './api';

const BASE = '/api/goals';

export async function listGoals(): Promise<Goal[]> {
  const res = await fetch(BASE);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createGoal(input: GoalInput): Promise<Goal> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function updateGoal(id: string, input: GoalInput): Promise<Goal> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseError(res);
}

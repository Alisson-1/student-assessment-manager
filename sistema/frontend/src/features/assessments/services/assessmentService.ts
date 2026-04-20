import type { Assessment, AssessmentValue } from '../types/assessment';
import { parseError } from './api';

const BASE = '/api/assessments';

export async function listAssessments(): Promise<Assessment[]> {
  const res = await fetch(BASE);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function setAssessment(
  studentId: string,
  goalId: string,
  value: AssessmentValue,
): Promise<Assessment> {
  const res = await fetch(`${BASE}/${studentId}/${goalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function clearAssessment(studentId: string, goalId: string): Promise<void> {
  const res = await fetch(`${BASE}/${studentId}/${goalId}`, { method: 'DELETE' });
  if (!res.ok) await parseError(res);
}

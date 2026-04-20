import { parseError } from '@/features/assessments/services/api';
import type { AssessmentValue } from '@/features/assessments/types/assessment';
import type { ClassAssessment } from '../types/class';

const BASE = '/api/classes';

export async function listClassAssessments(
  classId: string,
): Promise<ClassAssessment[]> {
  const res = await fetch(`${BASE}/${classId}/assessments`);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function setClassAssessment(
  classId: string,
  studentId: string,
  goalId: string,
  value: AssessmentValue,
): Promise<ClassAssessment> {
  const res = await fetch(
    `${BASE}/${classId}/assessments/${studentId}/${goalId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    },
  );
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function clearClassAssessment(
  classId: string,
  studentId: string,
  goalId: string,
): Promise<void> {
  const res = await fetch(
    `${BASE}/${classId}/assessments/${studentId}/${goalId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) await parseError(res);
}

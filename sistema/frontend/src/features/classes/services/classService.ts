import { parseError } from '@/features/assessments/services/api';
import type { ClassInput, ClassRoom } from '../types/class';

const BASE = '/api/classes';

export async function listClasses(): Promise<ClassRoom[]> {
  const res = await fetch(BASE);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function getClass(id: string): Promise<ClassRoom> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createClass(input: ClassInput): Promise<ClassRoom> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function updateClass(id: string, input: ClassInput): Promise<ClassRoom> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteClass(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseError(res);
}

export async function enrollStudent(
  classId: string,
  studentId: string,
): Promise<ClassRoom> {
  const res = await fetch(`${BASE}/${classId}/students/${studentId}`, {
    method: 'POST',
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function unenrollStudent(
  classId: string,
  studentId: string,
): Promise<ClassRoom> {
  const res = await fetch(`${BASE}/${classId}/students/${studentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

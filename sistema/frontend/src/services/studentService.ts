import type { Student, StudentInput } from '../types/student';

const BASE = '/api/students';

async function parseError(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}`;
  let fields: Record<string, string> | undefined;
  try {
    const body = (await response.json()) as { message?: string; fields?: Record<string, string> };
    if (body.message) message = body.message;
    if (body.fields) fields = body.fields;
  } catch {
    // ignore non-json bodies
  }
  const err = new Error(message) as Error & {
    status: number;
    fields?: Record<string, string>;
  };
  err.status = response.status;
  err.fields = fields;
  throw err;
}

export async function listStudents(): Promise<Student[]> {
  const res = await fetch(BASE);
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function updateStudent(id: string, input: StudentInput): Promise<Student> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) await parseError(res);
}

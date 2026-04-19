import path from 'node:path';
import { Student } from '../models/student';
import { getDataDir } from '../utils/dataDir';
import { readJsonArray, writeJsonArray } from '../utils/jsonStore';

const FILE_NAME = 'students.json';

function filePath(): string {
  return path.join(getDataDir(), FILE_NAME);
}

export async function findAll(): Promise<Student[]> {
  return readJsonArray<Student>(filePath());
}

export async function findById(id: string): Promise<Student | null> {
  const students = await findAll();
  return students.find((s) => s.id === id) ?? null;
}

export async function findByCpf(cpf: string): Promise<Student | null> {
  const students = await findAll();
  return students.find((s) => s.cpf === cpf) ?? null;
}

export async function findByEmail(email: string): Promise<Student | null> {
  const students = await findAll();
  return students.find((s) => s.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function save(student: Student): Promise<Student> {
  const students = await findAll();
  const idx = students.findIndex((s) => s.id === student.id);
  if (idx >= 0) {
    students[idx] = student;
  } else {
    students.push(student);
  }
  await writeJsonArray(filePath(), students);
  return student;
}

export async function deleteById(id: string): Promise<boolean> {
  const students = await findAll();
  const next = students.filter((s) => s.id !== id);
  if (next.length === students.length) return false;
  await writeJsonArray(filePath(), next);
  return true;
}

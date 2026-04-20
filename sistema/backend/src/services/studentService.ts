import { randomUUID } from 'node:crypto';
import { Student, StudentInput } from '../models/student';
import * as assessmentRepo from '../repositories/assessmentRepository';
import * as classAssessmentRepo from '../repositories/classAssessmentRepository';
import * as classRepo from '../repositories/classRepository';
import * as repo from '../repositories/studentRepository';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeCpf(cpf: unknown): string {
  if (typeof cpf !== 'string') return '';
  return cpf.replace(/\D+/g, '');
}

function validateInput(input: Partial<StudentInput>): StudentInput {
  const fields: Record<string, string> = {};

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) fields.name = 'name is required';

  const cpf = normalizeCpf(input.cpf);
  if (!cpf) fields.cpf = 'cpf is required';
  else if (cpf.length !== 11) fields.cpf = 'cpf must contain 11 digits';

  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (!email) fields.email = 'email is required';
  else if (!EMAIL_REGEX.test(email)) fields.email = 'email is invalid';

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Invalid student payload', fields);
  }

  return { name, cpf, email };
}

export async function listStudents(): Promise<Student[]> {
  return repo.findAll();
}

export async function getStudent(id: string): Promise<Student> {
  const student = await repo.findById(id);
  if (!student) throw new NotFoundError('Student not found');
  return student;
}

export async function createStudent(input: Partial<StudentInput>): Promise<Student> {
  const data = validateInput(input);

  const byCpf = await repo.findByCpf(data.cpf);
  if (byCpf) throw new ConflictError('A student with this CPF already exists');

  const byEmail = await repo.findByEmail(data.email);
  if (byEmail) throw new ConflictError('A student with this email already exists');

  const student: Student = { id: randomUUID(), ...data };
  return repo.save(student);
}

export async function updateStudent(
  id: string,
  input: Partial<StudentInput>,
): Promise<Student> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Student not found');

  const data = validateInput(input);

  const byCpf = await repo.findByCpf(data.cpf);
  if (byCpf && byCpf.id !== id) {
    throw new ConflictError('A student with this CPF already exists');
  }

  const byEmail = await repo.findByEmail(data.email);
  if (byEmail && byEmail.id !== id) {
    throw new ConflictError('A student with this email already exists');
  }

  const updated: Student = { id, ...data };
  return repo.save(updated);
}

export async function deleteStudent(id: string): Promise<void> {
  const removed = await repo.deleteById(id);
  if (!removed) throw new NotFoundError('Student not found');
  await assessmentRepo.deleteByStudent(id);
  await classAssessmentRepo.deleteByStudent(id);
  await classRepo.removeStudentFromAll(id);
}

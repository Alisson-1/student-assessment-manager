import { randomUUID } from 'node:crypto';
import { ClassInput, ClassRoom } from '../models/class';
import * as classAssessmentRepo from '../repositories/classAssessmentRepository';
import * as repo from '../repositories/classRepository';
import * as studentRepo from '../repositories/studentRepository';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

const MIN_YEAR = 1900;
const MAX_YEAR = 2200;
const VALID_SEMESTERS = [1, 2];

interface NormalizedInput {
  topic: string;
  year: number;
  semester: number;
  studentIds: string[];
}

function parseInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isInteger(n)) return n;
  }
  return null;
}

async function validateInput(input: Partial<ClassInput>): Promise<NormalizedInput> {
  const fields: Record<string, string> = {};

  const topic = typeof input.topic === 'string' ? input.topic.trim() : '';
  if (!topic) fields.topic = 'topic is required';

  const year = parseInteger(input.year);
  if (year === null) {
    fields.year = 'year is required';
  } else if (year < MIN_YEAR || year > MAX_YEAR) {
    fields.year = `year must be between ${MIN_YEAR} and ${MAX_YEAR}`;
  }

  const semester = parseInteger(input.semester);
  if (semester === null) {
    fields.semester = 'semester is required';
  } else if (!VALID_SEMESTERS.includes(semester)) {
    fields.semester = 'semester must be 1 or 2';
  }

  let studentIds: string[] = [];
  if (input.studentIds !== undefined) {
    if (!Array.isArray(input.studentIds)) {
      fields.studentIds = 'studentIds must be an array';
    } else if (input.studentIds.some((id) => typeof id !== 'string' || !id.trim())) {
      fields.studentIds = 'studentIds must contain non-empty string ids';
    } else {
      studentIds = Array.from(new Set(input.studentIds as string[]));
    }
  }

  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Invalid class payload', fields);
  }

  for (const id of studentIds) {
    const exists = await studentRepo.findById(id);
    if (!exists) {
      throw new ValidationError('Invalid class payload', {
        studentIds: `student "${id}" does not exist`,
      });
    }
  }

  return { topic, year: year as number, semester: semester as number, studentIds };
}

export async function listClasses(): Promise<ClassRoom[]> {
  return repo.findAll();
}

export async function getClass(id: string): Promise<ClassRoom> {
  const found = await repo.findById(id);
  if (!found) throw new NotFoundError('Class not found');
  return found;
}

export async function createClass(input: Partial<ClassInput>): Promise<ClassRoom> {
  const data = await validateInput(input);

  const dup = await repo.findByTopicYearSemester(data.topic, data.year, data.semester);
  if (dup) {
    throw new ConflictError(
      'A class with this topic, year, and semester already exists',
    );
  }

  const entity: ClassRoom = { id: randomUUID(), ...data };
  return repo.save(entity);
}

export async function updateClass(
  id: string,
  input: Partial<ClassInput>,
): Promise<ClassRoom> {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Class not found');

  const data = await validateInput(input);

  const dup = await repo.findByTopicYearSemester(data.topic, data.year, data.semester);
  if (dup && dup.id !== id) {
    throw new ConflictError(
      'A class with this topic, year, and semester already exists',
    );
  }

  const removedStudents = existing.studentIds.filter(
    (sid) => !data.studentIds.includes(sid),
  );
  for (const sid of removedStudents) {
    await classAssessmentRepo.deleteByClassAndStudent(id, sid);
  }

  const updated: ClassRoom = { id, ...data };
  return repo.save(updated);
}

export async function deleteClass(id: string): Promise<void> {
  const removed = await repo.deleteById(id);
  if (!removed) throw new NotFoundError('Class not found');
  await classAssessmentRepo.deleteByClass(id);
}

export async function enrollStudent(
  classId: string,
  studentId: string,
): Promise<ClassRoom> {
  const entity = await repo.findById(classId);
  if (!entity) throw new NotFoundError('Class not found');

  const student = await studentRepo.findById(studentId);
  if (!student) throw new NotFoundError('Student not found');

  if (entity.studentIds.includes(studentId)) {
    throw new ConflictError('Student is already enrolled in this class');
  }

  const updated: ClassRoom = {
    ...entity,
    studentIds: [...entity.studentIds, studentId],
  };
  return repo.save(updated);
}

export async function unenrollStudent(
  classId: string,
  studentId: string,
): Promise<ClassRoom> {
  const entity = await repo.findById(classId);
  if (!entity) throw new NotFoundError('Class not found');

  if (!entity.studentIds.includes(studentId)) {
    throw new NotFoundError('Student is not enrolled in this class');
  }

  const updated: ClassRoom = {
    ...entity,
    studentIds: entity.studentIds.filter((id) => id !== studentId),
  };
  await repo.save(updated);
  await classAssessmentRepo.deleteByClassAndStudent(classId, studentId);
  return updated;
}

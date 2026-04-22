import {
  ASSESSMENT_VALUES,
  AssessmentInput,
  isAssessmentValue,
} from '../models/assessment';
import { ClassAssessment } from '../models/class';
import * as repo from '../repositories/classAssessmentRepository';
import * as classRepo from '../repositories/classRepository';
import * as goalRepo from '../repositories/goalRepository';
import * as studentRepo from '../repositories/studentRepository';
import * as emailService from './emailService';
import { NotFoundError, ValidationError } from '../utils/errors';

function validateInput(input: Partial<AssessmentInput>): AssessmentInput {
  const fields: Record<string, string> = {};
  if (!isAssessmentValue(input.value)) {
    fields.value = `value must be one of ${ASSESSMENT_VALUES.join(', ')}`;
  }
  if (Object.keys(fields).length > 0) {
    throw new ValidationError('Invalid assessment payload', fields);
  }
  return { value: input.value as (typeof ASSESSMENT_VALUES)[number] };
}

export async function listByClass(classId: string): Promise<ClassAssessment[]> {
  const existing = await classRepo.findById(classId);
  if (!existing) throw new NotFoundError('Class not found');
  return repo.findByClass(classId);
}

export async function setClassAssessment(
  classId: string,
  studentId: string,
  goalId: string,
  input: Partial<AssessmentInput>,
): Promise<ClassAssessment> {
  const data = validateInput(input);

  const classRoom = await classRepo.findById(classId);
  if (!classRoom) throw new NotFoundError('Class not found');

  const student = await studentRepo.findById(studentId);
  if (!student) throw new NotFoundError('Student not found');

  if (!classRoom.studentIds.includes(studentId)) {
    throw new ValidationError('Student is not enrolled in this class', {
      studentId: 'student is not enrolled in this class',
    });
  }

  const goal = await goalRepo.findById(goalId);
  if (!goal) throw new NotFoundError('Goal not found');

  const assessment: ClassAssessment = {
    classId,
    studentId,
    goalId,
    value: data.value,
    updatedAt: new Date().toISOString(),
  };
  const saved = await repo.upsert(assessment);
  await emailService.recordAssessmentChange({
    student,
    goal,
    classRoom,
    value: saved.value,
    occurredAt: saved.updatedAt,
  });
  return saved;
}

export async function clearClassAssessment(
  classId: string,
  studentId: string,
  goalId: string,
): Promise<void> {
  const classRoom = await classRepo.findById(classId);
  if (!classRoom) throw new NotFoundError('Class not found');

  const removed = await repo.deleteByKey(classId, studentId, goalId);
  if (!removed) throw new NotFoundError('Assessment not found');
}

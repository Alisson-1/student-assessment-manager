import {
  Assessment,
  ASSESSMENT_VALUES,
  AssessmentInput,
  isAssessmentValue,
} from '../models/assessment';
import * as assessmentRepo from '../repositories/assessmentRepository';
import * as goalRepo from '../repositories/goalRepository';
import * as studentRepo from '../repositories/studentRepository';
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

export async function listAssessments(): Promise<Assessment[]> {
  return assessmentRepo.findAll();
}

export async function setAssessment(
  studentId: string,
  goalId: string,
  input: Partial<AssessmentInput>,
): Promise<Assessment> {
  const data = validateInput(input);

  const student = await studentRepo.findById(studentId);
  if (!student) throw new NotFoundError('Student not found');

  const goal = await goalRepo.findById(goalId);
  if (!goal) throw new NotFoundError('Goal not found');

  const assessment: Assessment = {
    studentId,
    goalId,
    value: data.value,
    updatedAt: new Date().toISOString(),
  };
  return assessmentRepo.upsert(assessment);
}

export async function clearAssessment(studentId: string, goalId: string): Promise<void> {
  const removed = await assessmentRepo.deleteByKey(studentId, goalId);
  if (!removed) throw new NotFoundError('Assessment not found');
}

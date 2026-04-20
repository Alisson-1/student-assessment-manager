import { AssessmentValue } from './assessment';

export interface ClassRoom {
  id: string;
  topic: string;
  year: number;
  semester: number;
  studentIds: string[];
}

export interface ClassInput {
  topic: string;
  year: number;
  semester: number;
  studentIds?: string[];
}

export interface ClassAssessment {
  classId: string;
  studentId: string;
  goalId: string;
  value: AssessmentValue;
  updatedAt: string;
}

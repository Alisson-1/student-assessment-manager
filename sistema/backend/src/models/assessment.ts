export const ASSESSMENT_VALUES = ['MANA', 'MPA', 'MA'] as const;

export type AssessmentValue = (typeof ASSESSMENT_VALUES)[number];

export function isAssessmentValue(value: unknown): value is AssessmentValue {
  return typeof value === 'string' && (ASSESSMENT_VALUES as readonly string[]).includes(value);
}

export interface Assessment {
  studentId: string;
  goalId: string;
  value: AssessmentValue;
  updatedAt: string;
}

export interface AssessmentInput {
  value: AssessmentValue;
}

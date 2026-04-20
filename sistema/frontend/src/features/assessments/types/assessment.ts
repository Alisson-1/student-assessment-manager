export const ASSESSMENT_VALUES = ['MANA', 'MPA', 'MA'] as const;

export type AssessmentValue = (typeof ASSESSMENT_VALUES)[number];

export const ASSESSMENT_LABELS: Record<AssessmentValue, string> = {
  MANA: 'Meta Ainda Não Atingida',
  MPA: 'Meta Parcialmente Atingida',
  MA: 'Meta Atingida',
};

export interface Goal {
  id: string;
  name: string;
}

export type GoalInput = Omit<Goal, 'id'>;

export interface Assessment {
  studentId: string;
  goalId: string;
  value: AssessmentValue;
  updatedAt: string;
}

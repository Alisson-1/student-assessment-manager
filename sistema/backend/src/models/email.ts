import { AssessmentValue } from './assessment';

export type EmailStatus = 'pending' | 'sent';

export interface EmailChange {
  goalId: string;
  goalName: string;
  value: AssessmentValue;
  classId: string | null;
  classTopic: string | null;
  occurredAt: string;
}

export interface EmailNotification {
  id: string;
  studentId: string;
  studentEmail: string;
  dateKey: string;
  status: EmailStatus;
  changes: EmailChange[];
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

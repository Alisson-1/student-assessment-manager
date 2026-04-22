import { randomUUID } from 'node:crypto';
import { AssessmentValue } from '../models/assessment';
import { ClassRoom } from '../models/class';
import { EmailChange, EmailNotification, EmailStatus } from '../models/email';
import { Goal } from '../models/goal';
import { Student } from '../models/student';
import { getEmailTransport } from '../mailer/emailTransport';
import * as repo from '../repositories/pendingEmailRepository';
import { ValidationError } from '../utils/errors';

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function dateKeyOf(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayKey(): string {
  return dateKeyOf(new Date());
}

function nextDateKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  return dateKeyOf(date);
}

export interface RecordChangeArgs {
  student: Student;
  goal: Goal;
  classRoom: ClassRoom | null;
  value: AssessmentValue;
  occurredAt: string;
}

export async function recordAssessmentChange(
  args: RecordChangeArgs,
): Promise<EmailNotification> {
  let dateKey = todayKey();
  const sentToday = await repo.findByStudentAndDate(args.student.id, dateKey, 'sent');
  if (sentToday) {
    dateKey = nextDateKey(dateKey);
  }

  const change: EmailChange = {
    goalId: args.goal.id,
    goalName: args.goal.name,
    value: args.value,
    classId: args.classRoom ? args.classRoom.id : null,
    classTopic: args.classRoom ? args.classRoom.topic : null,
    occurredAt: args.occurredAt,
  };

  const now = new Date().toISOString();
  const existing = await repo.findByStudentAndDate(args.student.id, dateKey, 'pending');
  if (existing) {
    const updated: EmailNotification = {
      ...existing,
      studentEmail: args.student.email,
      changes: [...existing.changes, change],
      updatedAt: now,
    };
    return repo.save(updated);
  }

  const notification: EmailNotification = {
    id: randomUUID(),
    studentId: args.student.id,
    studentEmail: args.student.email,
    dateKey,
    status: 'pending',
    changes: [change],
    createdAt: now,
    updatedAt: now,
    sentAt: null,
  };
  return repo.save(notification);
}

function formatBody(n: EmailNotification): string {
  const lines = n.changes.map((c) => {
    const where = c.classTopic ? ` (class: ${c.classTopic})` : '';
    return `- ${c.goalName}: ${c.value}${where}`;
  });
  return [
    `Hello,`,
    ``,
    `Your assessments for ${n.dateKey} were updated:`,
    ...lines,
    ``,
    `Best regards,`,
    `TALP2`,
  ].join('\n');
}

export async function dispatchForDate(rawDateKey?: string): Promise<EmailNotification[]> {
  const target = rawDateKey ?? todayKey();
  if (!DATE_KEY_REGEX.test(target)) {
    throw new ValidationError('Invalid dispatch date', {
      date: 'date must match YYYY-MM-DD',
    });
  }

  const all = await repo.findAll();
  const pending = all.filter((e) => e.status === 'pending' && e.dateKey === target);
  const transport = getEmailTransport();
  const dispatched: EmailNotification[] = [];
  for (const entry of pending) {
    await transport.deliver({
      to: entry.studentEmail,
      subject: `Assessment updates for ${entry.dateKey}`,
      body: formatBody(entry),
    });
    const now = new Date().toISOString();
    const sent: EmailNotification = {
      ...entry,
      status: 'sent',
      sentAt: now,
      updatedAt: now,
    };
    await repo.save(sent);
    dispatched.push(sent);
  }
  return dispatched;
}

export interface ListEmailsFilter {
  status?: EmailStatus;
  studentId?: string;
  dateKey?: string;
}

export async function listEmails(
  filter: ListEmailsFilter = {},
): Promise<EmailNotification[]> {
  const all = await repo.findAll();
  return all.filter((e) => {
    if (filter.status && e.status !== filter.status) return false;
    if (filter.studentId && e.studentId !== filter.studentId) return false;
    if (filter.dateKey && e.dateKey !== filter.dateKey) return false;
    return true;
  });
}

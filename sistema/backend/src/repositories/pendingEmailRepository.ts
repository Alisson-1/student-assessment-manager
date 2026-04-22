import path from 'node:path';
import { EmailNotification, EmailStatus } from '../models/email';
import { getDataDir } from '../utils/dataDir';
import { readJsonArray, writeJsonArray } from '../utils/jsonStore';

const FILE_NAME = 'pendingEmails.json';

function filePath(): string {
  return path.join(getDataDir(), FILE_NAME);
}

export async function findAll(): Promise<EmailNotification[]> {
  return readJsonArray<EmailNotification>(filePath());
}

export async function findById(id: string): Promise<EmailNotification | null> {
  const all = await findAll();
  return all.find((e) => e.id === id) ?? null;
}

export async function findByStudentAndDate(
  studentId: string,
  dateKey: string,
  status: EmailStatus,
): Promise<EmailNotification | null> {
  const all = await findAll();
  return (
    all.find(
      (e) =>
        e.studentId === studentId && e.dateKey === dateKey && e.status === status,
    ) ?? null
  );
}

export async function save(entity: EmailNotification): Promise<EmailNotification> {
  const all = await findAll();
  const idx = all.findIndex((e) => e.id === entity.id);
  if (idx >= 0) {
    all[idx] = entity;
  } else {
    all.push(entity);
  }
  await writeJsonArray(filePath(), all);
  return entity;
}

export async function deleteByStudent(studentId: string): Promise<number> {
  const all = await findAll();
  const next = all.filter((e) => e.studentId !== studentId);
  const removed = all.length - next.length;
  if (removed > 0) await writeJsonArray(filePath(), next);
  return removed;
}

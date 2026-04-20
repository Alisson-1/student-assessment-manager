import path from 'node:path';
import { Assessment } from '../models/assessment';
import { getDataDir } from '../utils/dataDir';
import { readJsonArray, writeJsonArray } from '../utils/jsonStore';

const FILE_NAME = 'assessments.json';

function filePath(): string {
  return path.join(getDataDir(), FILE_NAME);
}

function sameKey(a: Pick<Assessment, 'studentId' | 'goalId'>, studentId: string, goalId: string) {
  return a.studentId === studentId && a.goalId === goalId;
}

export async function findAll(): Promise<Assessment[]> {
  return readJsonArray<Assessment>(filePath());
}

export async function findByKey(
  studentId: string,
  goalId: string,
): Promise<Assessment | null> {
  const all = await findAll();
  return all.find((a) => sameKey(a, studentId, goalId)) ?? null;
}

export async function upsert(assessment: Assessment): Promise<Assessment> {
  const all = await findAll();
  const idx = all.findIndex((a) => sameKey(a, assessment.studentId, assessment.goalId));
  if (idx >= 0) {
    all[idx] = assessment;
  } else {
    all.push(assessment);
  }
  await writeJsonArray(filePath(), all);
  return assessment;
}

export async function deleteByKey(studentId: string, goalId: string): Promise<boolean> {
  const all = await findAll();
  const next = all.filter((a) => !sameKey(a, studentId, goalId));
  if (next.length === all.length) return false;
  await writeJsonArray(filePath(), next);
  return true;
}

export async function deleteByStudent(studentId: string): Promise<number> {
  const all = await findAll();
  const next = all.filter((a) => a.studentId !== studentId);
  const removed = all.length - next.length;
  if (removed > 0) await writeJsonArray(filePath(), next);
  return removed;
}

export async function deleteByGoal(goalId: string): Promise<number> {
  const all = await findAll();
  const next = all.filter((a) => a.goalId !== goalId);
  const removed = all.length - next.length;
  if (removed > 0) await writeJsonArray(filePath(), next);
  return removed;
}

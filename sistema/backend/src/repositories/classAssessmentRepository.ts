import path from 'node:path';
import { ClassAssessment } from '../models/class';
import { getDataDir } from '../utils/dataDir';
import { readJsonArray, writeJsonArray } from '../utils/jsonStore';

const FILE_NAME = 'classAssessments.json';

function filePath(): string {
  return path.join(getDataDir(), FILE_NAME);
}

function sameKey(
  a: Pick<ClassAssessment, 'classId' | 'studentId' | 'goalId'>,
  classId: string,
  studentId: string,
  goalId: string,
) {
  return a.classId === classId && a.studentId === studentId && a.goalId === goalId;
}

export async function findAll(): Promise<ClassAssessment[]> {
  return readJsonArray<ClassAssessment>(filePath());
}

export async function findByClass(classId: string): Promise<ClassAssessment[]> {
  const all = await findAll();
  return all.filter((a) => a.classId === classId);
}

export async function findByKey(
  classId: string,
  studentId: string,
  goalId: string,
): Promise<ClassAssessment | null> {
  const all = await findAll();
  return all.find((a) => sameKey(a, classId, studentId, goalId)) ?? null;
}

export async function upsert(assessment: ClassAssessment): Promise<ClassAssessment> {
  const all = await findAll();
  const idx = all.findIndex((a) =>
    sameKey(a, assessment.classId, assessment.studentId, assessment.goalId),
  );
  if (idx >= 0) {
    all[idx] = assessment;
  } else {
    all.push(assessment);
  }
  await writeJsonArray(filePath(), all);
  return assessment;
}

export async function deleteByKey(
  classId: string,
  studentId: string,
  goalId: string,
): Promise<boolean> {
  const all = await findAll();
  const next = all.filter((a) => !sameKey(a, classId, studentId, goalId));
  if (next.length === all.length) return false;
  await writeJsonArray(filePath(), next);
  return true;
}

export async function deleteByClass(classId: string): Promise<number> {
  const all = await findAll();
  const next = all.filter((a) => a.classId !== classId);
  const removed = all.length - next.length;
  if (removed > 0) await writeJsonArray(filePath(), next);
  return removed;
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

export async function deleteByClassAndStudent(
  classId: string,
  studentId: string,
): Promise<number> {
  const all = await findAll();
  const next = all.filter((a) => !(a.classId === classId && a.studentId === studentId));
  const removed = all.length - next.length;
  if (removed > 0) await writeJsonArray(filePath(), next);
  return removed;
}

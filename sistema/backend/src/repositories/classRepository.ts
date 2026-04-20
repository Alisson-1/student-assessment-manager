import path from 'node:path';
import { ClassRoom } from '../models/class';
import { getDataDir } from '../utils/dataDir';
import { readJsonArray, writeJsonArray } from '../utils/jsonStore';

const FILE_NAME = 'classes.json';

function filePath(): string {
  return path.join(getDataDir(), FILE_NAME);
}

export async function findAll(): Promise<ClassRoom[]> {
  return readJsonArray<ClassRoom>(filePath());
}

export async function findById(id: string): Promise<ClassRoom | null> {
  const classes = await findAll();
  return classes.find((c) => c.id === id) ?? null;
}

export async function findByTopicYearSemester(
  topic: string,
  year: number,
  semester: number,
): Promise<ClassRoom | null> {
  const classes = await findAll();
  const normalized = topic.trim().toLowerCase();
  return (
    classes.find(
      (c) =>
        c.topic.trim().toLowerCase() === normalized &&
        c.year === year &&
        c.semester === semester,
    ) ?? null
  );
}

export async function save(entity: ClassRoom): Promise<ClassRoom> {
  const classes = await findAll();
  const idx = classes.findIndex((c) => c.id === entity.id);
  if (idx >= 0) {
    classes[idx] = entity;
  } else {
    classes.push(entity);
  }
  await writeJsonArray(filePath(), classes);
  return entity;
}

export async function deleteById(id: string): Promise<boolean> {
  const classes = await findAll();
  const next = classes.filter((c) => c.id !== id);
  if (next.length === classes.length) return false;
  await writeJsonArray(filePath(), next);
  return true;
}

export async function removeStudentFromAll(studentId: string): Promise<void> {
  const classes = await findAll();
  let changed = false;
  const next = classes.map((c) => {
    if (!c.studentIds.includes(studentId)) return c;
    changed = true;
    return { ...c, studentIds: c.studentIds.filter((id) => id !== studentId) };
  });
  if (changed) await writeJsonArray(filePath(), next);
}

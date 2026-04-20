import path from 'node:path';
import { Goal } from '../models/goal';
import { getDataDir } from '../utils/dataDir';
import { readJsonArray, writeJsonArray } from '../utils/jsonStore';

const FILE_NAME = 'goals.json';

function filePath(): string {
  return path.join(getDataDir(), FILE_NAME);
}

export async function findAll(): Promise<Goal[]> {
  return readJsonArray<Goal>(filePath());
}

export async function findById(id: string): Promise<Goal | null> {
  const goals = await findAll();
  return goals.find((g) => g.id === id) ?? null;
}

export async function findByName(name: string): Promise<Goal | null> {
  const goals = await findAll();
  return goals.find((g) => g.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export async function save(goal: Goal): Promise<Goal> {
  const goals = await findAll();
  const idx = goals.findIndex((g) => g.id === goal.id);
  if (idx >= 0) {
    goals[idx] = goal;
  } else {
    goals.push(goal);
  }
  await writeJsonArray(filePath(), goals);
  return goal;
}

export async function deleteById(id: string): Promise<boolean> {
  const goals = await findAll();
  const next = goals.filter((g) => g.id !== id);
  if (next.length === goals.length) return false;
  await writeJsonArray(filePath(), next);
  return true;
}

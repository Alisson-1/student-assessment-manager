import { After, Before, setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { promises as fs } from 'node:fs';
import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../../src/app';

export interface StudentRecord {
  id: string;
  name: string;
  cpf: string;
  email: string;
}

export interface GoalRecord {
  id: string;
  name: string;
}

export class TalpWorld extends World {
  baseUrl = '';
  dataDir = '';
  server: Server | null = null;
  studentsByName: Map<string, StudentRecord> = new Map();
  goalsByName: Map<string, GoalRecord> = new Map();
  lastStatus = 0;
  lastBody: unknown = null;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(TalpWorld);

Before(async function (this: TalpWorld) {
  this.dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'talp2-students-'));
  process.env.TALP2_DATA_DIR = this.dataDir;

  const app = createApp();
  this.server = app.listen(0);
  await new Promise<void>((resolve) => this.server!.once('listening', () => resolve()));
  const address = this.server.address() as AddressInfo;
  this.baseUrl = `http://127.0.0.1:${address.port}`;

  this.studentsByName = new Map();
  this.goalsByName = new Map();
  this.lastStatus = 0;
  this.lastBody = null;
});

After(async function (this: TalpWorld) {
  if (this.server) {
    await new Promise<void>((resolve, reject) =>
      this.server!.close((err) => (err ? reject(err) : resolve())),
    );
    this.server = null;
  }
  if (this.dataDir) {
    await fs.rm(this.dataDir, { recursive: true, force: true });
    this.dataDir = '';
  }
  delete process.env.TALP2_DATA_DIR;
});

import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { ClassRecord, GoalRecord, StudentRecord, TalpWorld } from '../support/world';

interface HttpResult {
  status: number;
  body: unknown;
}

async function request(
  world: TalpWorld,
  method: string,
  pathname: string,
  body?: unknown,
): Promise<HttpResult> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const response = await fetch(`${world.baseUrl}${pathname}`, init);
  const text = await response.text();
  let parsed: unknown = null;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  return { status: response.status, body: parsed };
}

function rememberClass(
  world: TalpWorld,
  previousTopic: string | null,
  record: ClassRecord,
): void {
  if (previousTopic && previousTopic !== record.topic) {
    world.classesByTopic.delete(previousTopic);
  }
  world.classesByTopic.set(record.topic, record);
}

function classOrFail(world: TalpWorld, topic: string): ClassRecord {
  const found = world.classesByTopic.get(topic);
  assert.ok(found, `Class "${topic}" was not registered in this scenario`);
  return found;
}

function studentOrFail(world: TalpWorld, name: string): StudentRecord {
  const student = world.studentsByName.get(name);
  assert.ok(student, `Student "${name}" was not registered in this scenario`);
  return student;
}

function goalOrFail(world: TalpWorld, name: string): GoalRecord {
  const goal = world.goalsByName.get(name);
  assert.ok(goal, `Goal "${name}" was not registered in this scenario`);
  return goal;
}

function rowToClassInput(row: Record<string, string>) {
  return {
    topic: row.topic,
    year: Number(row.year),
    semester: Number(row.semester),
  };
}

Given('no classes are registered', async function (this: TalpWorld) {
  const result = await request(this, 'GET', '/api/classes');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, []);
});

Given(
  'the following classes are registered:',
  async function (this: TalpWorld, table: DataTable) {
    for (const row of table.hashes()) {
      const result = await request(this, 'POST', '/api/classes', rowToClassInput(row));
      assert.equal(
        result.status,
        201,
        `Failed to register class "${row.topic}" (status ${result.status}): ${JSON.stringify(result.body)}`,
      );
      rememberClass(this, null, result.body as ClassRecord);
    }
  },
);

Given(
  '{string} has been enrolled in {string}',
  async function (this: TalpWorld, student: string, topic: string) {
    const s = studentOrFail(this, student);
    const c = classOrFail(this, topic);
    const result = await request(
      this,
      'POST',
      `/api/classes/${c.id}/students/${s.id}`,
    );
    assert.equal(
      result.status,
      200,
      `Failed to enroll "${student}" in "${topic}": ${JSON.stringify(result.body)}`,
    );
    rememberClass(this, null, result.body as ClassRecord);
  },
);

Given(
  'the class assessment of {string} in {string} for {string} is set to {string}',
  async function (
    this: TalpWorld,
    student: string,
    topic: string,
    goal: string,
    value: string,
  ) {
    const s = studentOrFail(this, student);
    const g = goalOrFail(this, goal);
    const c = classOrFail(this, topic);
    const result = await request(
      this,
      'PUT',
      `/api/classes/${c.id}/assessments/${s.id}/${g.id}`,
      { value },
    );
    assert.equal(
      result.status,
      200,
      `Failed to seed class assessment (status ${result.status}): ${JSON.stringify(result.body)}`,
    );
  },
);

When(
  'the professor registers a class with:',
  async function (this: TalpWorld, table: DataTable) {
    const row = table.hashes()[0];
    const payload: Record<string, unknown> = { topic: row.topic };
    payload.year = row.year === '' ? '' : Number(row.year);
    payload.semester = row.semester === '' ? '' : Number(row.semester);
    const result = await request(this, 'POST', '/api/classes', payload);
    this.lastStatus = result.status;
    this.lastBody = result.body;
    if (result.status === 201) {
      rememberClass(this, null, result.body as ClassRecord);
    }
  },
);

When('the professor requests the list of classes', async function (this: TalpWorld) {
  const result = await request(this, 'GET', '/api/classes');
  this.lastStatus = result.status;
  this.lastBody = result.body;
});

When(
  'the professor updates the class {string} with:',
  async function (this: TalpWorld, topic: string, table: DataTable) {
    const existing = classOrFail(this, topic);
    const row = table.hashes()[0];
    const result = await request(
      this,
      'PUT',
      `/api/classes/${existing.id}`,
      rowToClassInput(row),
    );
    this.lastStatus = result.status;
    this.lastBody = result.body;
    if (result.status === 200) {
      rememberClass(this, topic, result.body as ClassRecord);
    }
  },
);

When('the professor updates a non-existent class', async function (this: TalpWorld) {
  const result = await request(this, 'PUT', '/api/classes/does-not-exist', {
    topic: 'Ghost',
    year: 2026,
    semester: 1,
  });
  this.lastStatus = result.status;
  this.lastBody = result.body;
});

When(
  'the professor deletes the class {string}',
  async function (this: TalpWorld, topic: string) {
    const existing = classOrFail(this, topic);
    const result = await request(this, 'DELETE', `/api/classes/${existing.id}`);
    this.lastStatus = result.status;
    this.lastBody = result.body;
    if (result.status === 204) {
      this.classesByTopic.delete(topic);
    }
  },
);

When('the professor deletes a non-existent class', async function (this: TalpWorld) {
  const result = await request(this, 'DELETE', '/api/classes/does-not-exist');
  this.lastStatus = result.status;
  this.lastBody = result.body;
});

When(
  'the professor enrolls {string} in {string}',
  async function (this: TalpWorld, student: string, topic: string) {
    const s = studentOrFail(this, student);
    const c = classOrFail(this, topic);
    const result = await request(
      this,
      'POST',
      `/api/classes/${c.id}/students/${s.id}`,
    );
    this.lastStatus = result.status;
    this.lastBody = result.body;
    if (result.status === 200) {
      rememberClass(this, null, result.body as ClassRecord);
    }
  },
);

When(
  'the professor unenrolls {string} from {string}',
  async function (this: TalpWorld, student: string, topic: string) {
    const s = studentOrFail(this, student);
    const c = classOrFail(this, topic);
    const result = await request(
      this,
      'DELETE',
      `/api/classes/${c.id}/students/${s.id}`,
    );
    this.lastStatus = result.status;
    this.lastBody = result.body;
    if (result.status === 200) {
      rememberClass(this, null, result.body as ClassRecord);
    }
  },
);

When(
  'the professor sets the class assessment of {string} in {string} for {string} to {string}',
  async function (
    this: TalpWorld,
    student: string,
    topic: string,
    goal: string,
    value: string,
  ) {
    const s = studentOrFail(this, student);
    const g = goalOrFail(this, goal);
    const c = classOrFail(this, topic);
    const result = await request(
      this,
      'PUT',
      `/api/classes/${c.id}/assessments/${s.id}/${g.id}`,
      { value },
    );
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

When(
  'the professor clears the class assessment of {string} in {string} for {string}',
  async function (this: TalpWorld, student: string, topic: string, goal: string) {
    const s = studentOrFail(this, student);
    const g = goalOrFail(this, goal);
    const c = classOrFail(this, topic);
    const result = await request(
      this,
      'DELETE',
      `/api/classes/${c.id}/assessments/${s.id}/${g.id}`,
    );
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

When(
  'the professor requests the assessments of the class {string}',
  async function (this: TalpWorld, topic: string) {
    const c = classOrFail(this, topic);
    const result = await request(this, 'GET', `/api/classes/${c.id}/assessments`);
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

Then(
  'the class catalog contains {string} for {int} semester {int}',
  async function (this: TalpWorld, topic: string, year: number, semester: number) {
    const result = await request(this, 'GET', '/api/classes');
    assert.equal(result.status, 200);
    const list = result.body as ClassRecord[];
    const match = list.find(
      (c) => c.topic === topic && c.year === year && c.semester === semester,
    );
    assert.ok(
      match,
      `No class "${topic}" for ${year} semester ${semester}. Got: ${JSON.stringify(list)}`,
    );
  },
);

Then(
  'the class catalog does not contain {string} for {int} semester {int}',
  async function (this: TalpWorld, topic: string, year: number, semester: number) {
    const result = await request(this, 'GET', '/api/classes');
    assert.equal(result.status, 200);
    const list = result.body as ClassRecord[];
    const match = list.find(
      (c) => c.topic === topic && c.year === year && c.semester === semester,
    );
    assert.ok(
      !match,
      `Did not expect class "${topic}" for ${year} semester ${semester} in catalog`,
    );
  },
);

Then(
  'the list of classes contains {int} entries',
  function (this: TalpWorld, count: number) {
    assert.ok(Array.isArray(this.lastBody), 'Expected response body to be an array');
    assert.equal((this.lastBody as unknown[]).length, count);
  },
);

Then(
  '{string} is enrolled in {string}',
  async function (this: TalpWorld, student: string, topic: string) {
    const s = studentOrFail(this, student);
    const c = classOrFail(this, topic);
    const result = await request(this, 'GET', `/api/classes/${c.id}`);
    assert.equal(result.status, 200);
    const body = result.body as ClassRecord;
    assert.ok(
      body.studentIds.includes(s.id),
      `Expected "${student}" to be enrolled in "${topic}"`,
    );
  },
);

Then(
  '{string} is not enrolled in {string}',
  async function (this: TalpWorld, student: string, topic: string) {
    const s = this.studentsByName.get(student);
    const c = this.classesByTopic.get(topic);
    if (!c) return;
    const result = await request(this, 'GET', `/api/classes/${c.id}`);
    if (result.status !== 200) return;
    const body = result.body as ClassRecord;
    if (!s) {
      return;
    }
    assert.ok(
      !body.studentIds.includes(s.id),
      `Did not expect "${student}" to be enrolled in "${topic}"`,
    );
  },
);

Then(
  /^the list of class assessments contains (\d+) (?:entry|entries)$/,
  function (this: TalpWorld, rawCount: string) {
    const count = Number(rawCount);
    assert.ok(Array.isArray(this.lastBody), 'Expected response body to be an array');
    assert.equal((this.lastBody as unknown[]).length, count);
  },
);

Then(
  /^the list of class assessments contains (\d+) (?:entry|entries) when the professor lists assessments of "([^"]+)"$/,
  async function (this: TalpWorld, rawCount: string, topic: string) {
    const count = Number(rawCount);
    const c = classOrFail(this, topic);
    const result = await request(this, 'GET', `/api/classes/${c.id}/assessments`);
    assert.equal(result.status, 200);
    const list = result.body as unknown[];
    assert.equal(list.length, count);
  },
);

interface ClassAssessmentRecord {
  classId: string;
  studentId: string;
  goalId: string;
  value: string;
  updatedAt: string;
}

Then(
  'the class assessment of {string} in {string} for {string} is {string}',
  async function (
    this: TalpWorld,
    student: string,
    topic: string,
    goal: string,
    value: string,
  ) {
    const s = studentOrFail(this, student);
    const g = goalOrFail(this, goal);
    const c = classOrFail(this, topic);
    const result = await request(this, 'GET', `/api/classes/${c.id}/assessments`);
    assert.equal(result.status, 200);
    const list = result.body as ClassAssessmentRecord[];
    const match = list.find((a) => a.studentId === s.id && a.goalId === g.id);
    assert.ok(
      match,
      `No class assessment for "${student}" on "${goal}" in "${topic}". Got: ${JSON.stringify(list)}`,
    );
    assert.equal(match.value, value);
  },
);

Then(
  'there is no class assessment for {string} in {string} on {string}',
  async function (this: TalpWorld, student: string, topic: string, goal: string) {
    const s = this.studentsByName.get(student);
    const g = this.goalsByName.get(goal);
    const c = classOrFail(this, topic);
    const result = await request(this, 'GET', `/api/classes/${c.id}/assessments`);
    assert.equal(result.status, 200);
    const list = result.body as ClassAssessmentRecord[];
    if (!s || !g) return;
    const match = list.find((a) => a.studentId === s.id && a.goalId === g.id);
    assert.ok(
      !match,
      `Did not expect a class assessment for "${student}" on "${goal}" in "${topic}"`,
    );
  },
);

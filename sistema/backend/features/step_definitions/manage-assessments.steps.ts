import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { GoalRecord, StudentRecord, TalpWorld } from '../support/world';

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

function rememberGoal(world: TalpWorld, previousName: string | null, goal: GoalRecord) {
  if (previousName && previousName !== goal.name) {
    world.goalsByName.delete(previousName);
  }
  world.goalsByName.set(goal.name, goal);
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

Given('no goals are registered', async function (this: TalpWorld) {
  const result = await request(this, 'GET', '/api/goals');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, []);
});

Given('the following goals are registered:', async function (this: TalpWorld, table: DataTable) {
  for (const row of table.hashes()) {
    const result = await request(this, 'POST', '/api/goals', { name: row.name });
    assert.equal(
      result.status,
      201,
      `Failed to register goal "${row.name}" (status ${result.status}): ${JSON.stringify(result.body)}`,
    );
    rememberGoal(this, null, result.body as GoalRecord);
  }
});

When(
  'the professor registers a goal named {string}',
  async function (this: TalpWorld, name: string) {
    const result = await request(this, 'POST', '/api/goals', { name });
    this.lastStatus = result.status;
    this.lastBody = result.body;
    if (result.status === 201) {
      rememberGoal(this, null, result.body as GoalRecord);
    }
  },
);

When('the professor requests the list of goals', async function (this: TalpWorld) {
  const result = await request(this, 'GET', '/api/goals');
  this.lastStatus = result.status;
  this.lastBody = result.body;
});

When(
  'the professor renames the goal {string} to {string}',
  async function (this: TalpWorld, from: string, to: string) {
    const existing = goalOrFail(this, from);
    const result = await request(this, 'PUT', `/api/goals/${existing.id}`, { name: to });
    this.lastStatus = result.status;
    this.lastBody = result.body;
    if (result.status === 200) {
      rememberGoal(this, from, result.body as GoalRecord);
    }
  },
);

When('the professor deletes the goal {string}', async function (this: TalpWorld, name: string) {
  const existing = goalOrFail(this, name);
  const result = await request(this, 'DELETE', `/api/goals/${existing.id}`);
  this.lastStatus = result.status;
  this.lastBody = result.body;
  if (result.status === 204) {
    this.goalsByName.delete(name);
  }
});

Then('the list of goals contains {int} entries', function (this: TalpWorld, count: number) {
  assert.ok(Array.isArray(this.lastBody), 'Expected response body to be an array');
  assert.equal((this.lastBody as unknown[]).length, count);
});

Then(
  'the goal catalog contains {string}',
  async function (this: TalpWorld, name: string) {
    const result = await request(this, 'GET', '/api/goals');
    assert.equal(result.status, 200);
    const list = result.body as GoalRecord[];
    const match = list.find((g) => g.name === name);
    assert.ok(match, `No goal named "${name}" in catalog`);
  },
);

Then(
  'the goal catalog does not contain {string}',
  async function (this: TalpWorld, name: string) {
    const result = await request(this, 'GET', '/api/goals');
    assert.equal(result.status, 200);
    const list = result.body as GoalRecord[];
    const match = list.find((g) => g.name === name);
    assert.ok(!match, `Did not expect goal "${name}" in catalog`);
  },
);

interface AssessmentRecord {
  studentId: string;
  goalId: string;
  value: string;
  updatedAt: string;
}

Given(
  'the assessment of {string} for {string} is set to {string}',
  async function (this: TalpWorld, student: string, goal: string, value: string) {
    const s = studentOrFail(this, student);
    const g = goalOrFail(this, goal);
    const result = await request(this, 'PUT', `/api/assessments/${s.id}/${g.id}`, { value });
    assert.equal(
      result.status,
      200,
      `Failed to seed assessment (status ${result.status}): ${JSON.stringify(result.body)}`,
    );
  },
);

When(
  'the professor sets the assessment of {string} for {string} to {string}',
  async function (this: TalpWorld, student: string, goal: string, value: string) {
    const s = studentOrFail(this, student);
    const g = goalOrFail(this, goal);
    const result = await request(this, 'PUT', `/api/assessments/${s.id}/${g.id}`, { value });
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

When(
  'the professor sets an assessment for an unknown student on {string} to {string}',
  async function (this: TalpWorld, goal: string, value: string) {
    const g = goalOrFail(this, goal);
    const result = await request(this, 'PUT', `/api/assessments/does-not-exist/${g.id}`, {
      value,
    });
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

When(
  'the professor sets an assessment for {string} on an unknown goal to {string}',
  async function (this: TalpWorld, student: string, value: string) {
    const s = studentOrFail(this, student);
    const result = await request(this, 'PUT', `/api/assessments/${s.id}/does-not-exist`, {
      value,
    });
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

When('the professor requests the list of assessments', async function (this: TalpWorld) {
  const result = await request(this, 'GET', '/api/assessments');
  this.lastStatus = result.status;
  this.lastBody = result.body;
});

When(
  'the professor clears the assessment of {string} for {string}',
  async function (this: TalpWorld, student: string, goal: string) {
    const s = studentOrFail(this, student);
    const g = goalOrFail(this, goal);
    const result = await request(this, 'DELETE', `/api/assessments/${s.id}/${g.id}`);
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

Then(
  /^the list of assessments contains (\d+) (?:entry|entries)$/,
  async function (this: TalpWorld, rawCount: string) {
    const count = Number(rawCount);
    const result = await request(this, 'GET', '/api/assessments');
    assert.equal(result.status, 200);
    const list = result.body as AssessmentRecord[];
    assert.equal(list.length, count);
  },
);

Then(
  'the assessment of {string} for {string} is {string}',
  async function (this: TalpWorld, student: string, goal: string, value: string) {
    const s = studentOrFail(this, student);
    const g = goalOrFail(this, goal);
    const result = await request(this, 'GET', '/api/assessments');
    assert.equal(result.status, 200);
    const list = result.body as AssessmentRecord[];
    const match = list.find((a) => a.studentId === s.id && a.goalId === g.id);
    assert.ok(
      match,
      `No assessment recorded for "${student}" on "${goal}". Got: ${JSON.stringify(list)}`,
    );
    assert.equal(match.value, value);
  },
);

Then(
  'there is no assessment for {string} on {string}',
  async function (this: TalpWorld, student: string, goal: string) {
    const s = this.studentsByName.get(student);
    const g = this.goalsByName.get(goal);
    const result = await request(this, 'GET', '/api/assessments');
    assert.equal(result.status, 200);
    const list = result.body as AssessmentRecord[];
    if (!s || !g) return;
    const match = list.find((a) => a.studentId === s.id && a.goalId === g.id);
    assert.ok(!match, `Did not expect an assessment for "${student}" on "${goal}"`);
  },
);

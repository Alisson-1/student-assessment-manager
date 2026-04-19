import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { StudentRecord, TalpWorld } from '../support/world';

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

function rowToInput(row: Record<string, string>) {
  return { name: row.name, cpf: row.cpf, email: row.email };
}

function rememberStudent(world: TalpWorld, previousName: string | null, student: StudentRecord) {
  if (previousName && previousName !== student.name) {
    world.studentsByName.delete(previousName);
  }
  world.studentsByName.set(student.name, student);
}

Given('no students are registered', async function (this: TalpWorld) {
  const result = await request(this, 'GET', '/api/students');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, []);
});

Given('the following students are registered:', async function (this: TalpWorld, table: DataTable) {
  for (const row of table.hashes()) {
    const result = await request(this, 'POST', '/api/students', rowToInput(row));
    assert.equal(
      result.status,
      201,
      `Failed to register "${row.name}" (status ${result.status}): ${JSON.stringify(result.body)}`,
    );
    rememberStudent(this, null, result.body as StudentRecord);
  }
});

When('the professor registers a student with:', async function (this: TalpWorld, table: DataTable) {
  const row = table.hashes()[0];
  const result = await request(this, 'POST', '/api/students', rowToInput(row));
  this.lastStatus = result.status;
  this.lastBody = result.body;
  if (result.status === 201) {
    rememberStudent(this, null, result.body as StudentRecord);
  }
});

When('the professor requests the list of students', async function (this: TalpWorld) {
  const result = await request(this, 'GET', '/api/students');
  this.lastStatus = result.status;
  this.lastBody = result.body;
});

When(
  'the professor updates the student {string} with:',
  async function (this: TalpWorld, name: string, table: DataTable) {
    const existing = this.studentsByName.get(name);
    assert.ok(existing, `Student "${name}" was not registered in this scenario`);
    const row = table.hashes()[0];
    const result = await request(this, 'PUT', `/api/students/${existing.id}`, rowToInput(row));
    this.lastStatus = result.status;
    this.lastBody = result.body;
    if (result.status === 200) {
      rememberStudent(this, name, result.body as StudentRecord);
    }
  },
);

When('the professor updates a non-existent student', async function (this: TalpWorld) {
  const result = await request(this, 'PUT', '/api/students/does-not-exist', {
    name: 'Ghost',
    cpf: '12345678909',
    email: 'ghost@example.com',
  });
  this.lastStatus = result.status;
  this.lastBody = result.body;
});

When('the professor deletes the student {string}', async function (this: TalpWorld, name: string) {
  const existing = this.studentsByName.get(name);
  assert.ok(existing, `Student "${name}" was not registered in this scenario`);
  const result = await request(this, 'DELETE', `/api/students/${existing.id}`);
  this.lastStatus = result.status;
  this.lastBody = result.body;
  if (result.status === 204) {
    this.studentsByName.delete(name);
  }
});

When('the professor deletes a non-existent student', async function (this: TalpWorld) {
  const result = await request(this, 'DELETE', '/api/students/does-not-exist');
  this.lastStatus = result.status;
  this.lastBody = result.body;
});

Then('the request succeeds with status {int}', function (this: TalpWorld, status: number) {
  assert.equal(
    this.lastStatus,
    status,
    `Expected ${status}, got ${this.lastStatus}. Body: ${JSON.stringify(this.lastBody)}`,
  );
});

Then('the request fails with status {int}', function (this: TalpWorld, status: number) {
  assert.equal(
    this.lastStatus,
    status,
    `Expected ${status}, got ${this.lastStatus}. Body: ${JSON.stringify(this.lastBody)}`,
  );
});

Then('the list of students contains {int} entries', function (this: TalpWorld, count: number) {
  assert.ok(Array.isArray(this.lastBody), 'Expected response body to be an array');
  assert.equal((this.lastBody as unknown[]).length, count);
});

Then(
  'the roster contains the student {string} with email {string}',
  async function (this: TalpWorld, name: string, email: string) {
    const result = await request(this, 'GET', '/api/students');
    assert.equal(result.status, 200);
    const list = result.body as StudentRecord[];
    const match = list.find((s) => s.name === name);
    assert.ok(match, `No student named "${name}" in roster`);
    assert.equal(match.email, email);
  },
);

Then('the roster is empty', async function (this: TalpWorld) {
  const result = await request(this, 'GET', '/api/students');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, []);
});

Then(
  'the error reports a problem with the field {string}',
  function (this: TalpWorld, field: string) {
    const body = this.lastBody as { fields?: Record<string, string> } | null;
    assert.ok(body && body.fields, 'Expected response body to include a `fields` map');
    assert.ok(
      body.fields[field],
      `Expected error to report field "${field}", got: ${JSON.stringify(body.fields)}`,
    );
  },
);

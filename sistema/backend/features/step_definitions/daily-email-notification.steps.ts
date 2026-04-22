import { Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { StudentRecord, TalpWorld } from '../support/world';

interface HttpResult {
  status: number;
  body: unknown;
}

interface EmailChangeRecord {
  goalId: string;
  goalName: string;
  value: string;
  classId: string | null;
  classTopic: string | null;
  occurredAt: string;
}

interface EmailRecord {
  id: string;
  studentId: string;
  studentEmail: string;
  dateKey: string;
  status: 'pending' | 'sent';
  changes: EmailChangeRecord[];
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
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

async function fetchEmails(
  world: TalpWorld,
  filters: Record<string, string> = {},
): Promise<EmailRecord[]> {
  const query = new URLSearchParams(filters).toString();
  const pathname = `/api/emails${query ? `?${query}` : ''}`;
  const result = await request(world, 'GET', pathname);
  assert.equal(result.status, 200);
  return result.body as EmailRecord[];
}

function studentOrFail(world: TalpWorld, name: string): StudentRecord {
  const student = world.studentsByName.get(name);
  assert.ok(student, `Student "${name}" was not registered in this scenario`);
  return student;
}

When(
  'the professor dispatches the daily assessment emails',
  async function (this: TalpWorld) {
    const result = await request(this, 'POST', '/api/emails/dispatch', {});
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

When(
  'the professor dispatches the daily assessment emails for date {string}',
  async function (this: TalpWorld, date: string) {
    const result = await request(this, 'POST', '/api/emails/dispatch', { date });
    this.lastStatus = result.status;
    this.lastBody = result.body;
  },
);

Then(
  /^the pending email queue contains (\d+) (?:entry|entries)$/,
  async function (this: TalpWorld, rawCount: string) {
    const emails = await fetchEmails(this, { status: 'pending' });
    assert.equal(emails.length, Number(rawCount));
  },
);

Then(
  /^"([^"]+)" has (\d+) pending emails?$/,
  async function (this: TalpWorld, name: string, rawCount: string) {
    const student = studentOrFail(this, name);
    const emails = await fetchEmails(this, {
      status: 'pending',
      studentId: student.id,
    });
    assert.equal(emails.length, Number(rawCount));
  },
);

Then('{string} has no pending email', async function (this: TalpWorld, name: string) {
  const student = studentOrFail(this, name);
  const emails = await fetchEmails(this, {
    status: 'pending',
    studentId: student.id,
  });
  assert.equal(emails.length, 0);
});

Then(
  /^the pending email to "([^"]+)" summarizes (\d+) changes?$/,
  async function (this: TalpWorld, name: string, rawCount: string) {
    const student = studentOrFail(this, name);
    const emails = await fetchEmails(this, {
      status: 'pending',
      studentId: student.id,
    });
    assert.equal(emails.length, 1, `Expected exactly one pending email for "${name}"`);
    assert.equal(emails[0].changes.length, Number(rawCount));
  },
);

Then(
  'the pending email to {string} mentions the class {string}',
  async function (this: TalpWorld, name: string, topic: string) {
    const student = studentOrFail(this, name);
    const emails = await fetchEmails(this, {
      status: 'pending',
      studentId: student.id,
    });
    assert.equal(emails.length, 1, `Expected exactly one pending email for "${name}"`);
    const match = emails[0].changes.find((c) => c.classTopic === topic);
    assert.ok(
      match,
      `No change for class "${topic}" in pending email. Got: ${JSON.stringify(emails[0].changes)}`,
    );
  },
);

Then(
  /^"([^"]+)" has received (\d+) emails?$/,
  async function (this: TalpWorld, name: string, rawCount: string) {
    const student = studentOrFail(this, name);
    const emails = await fetchEmails(this, {
      status: 'sent',
      studentId: student.id,
    });
    assert.equal(emails.length, Number(rawCount));
  },
);

Then(
  'the sent email to {string} lists {string} as {string}',
  async function (this: TalpWorld, name: string, goalName: string, value: string) {
    const student = studentOrFail(this, name);
    const emails = await fetchEmails(this, {
      status: 'sent',
      studentId: student.id,
    });
    assert.ok(emails.length >= 1, `Expected at least one sent email for "${name}"`);
    const aggregated = emails.flatMap((e) => e.changes);
    const match = aggregated.find((c) => c.goalName === goalName && c.value === value);
    assert.ok(
      match,
      `No sent change for "${goalName}" with value "${value}". Got: ${JSON.stringify(aggregated)}`,
    );
  },
);

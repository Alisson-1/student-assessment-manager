# TALP2 — Student & Assessment Management System

A web application for professors to manage students, classes, and goal-based assessments. Changes to assessments trigger consolidated daily email notifications to students.

## Tech Stack

| Layer            | Technology                        |
| ---------------- | --------------------------------- |
| Frontend         | React 18 + TypeScript (Vite)      |
| Backend          | Node.js + TypeScript (Express)    |
| Persistence      | JSON files on disk (no database)  |
| Acceptance tests | Cucumber + Gherkin                |

## Project Structure

```
sistema/
├── frontend/   # React + TypeScript client
└── backend/    # Express API + Cucumber acceptance tests
```

## Getting Started

### Backend

```bash
cd sistema/backend
npm install
npm run dev        # starts on http://localhost:3000
```

### Frontend

```bash
cd sistema/frontend
npm install
npm run dev        # starts on http://localhost:5173
```

## Available Scripts

### Backend (`sistema/backend`)

| Script               | Description                        |
| -------------------- | ---------------------------------- |
| `npm run dev`        | Start dev server with live reload  |
| `npm run build`      | Compile TypeScript to `dist/`      |
| `npm start`          | Run compiled build                 |
| `npm run typecheck`  | Type-check without emitting        |
| `npm run test:acceptance` | Run Cucumber acceptance tests |

### Frontend (`sistema/frontend`)

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start Vite dev server             |
| `npm run build`     | Type-check + build for production |
| `npm run preview`   | Preview production build          |
| `npm run typecheck` | Type-check without emitting       |

## API Endpoints

| Method | Path                                          | Description                          |
| ------ | --------------------------------------------- | ------------------------------------ |
| GET    | `/api/students`                               | List all students                    |
| POST   | `/api/students`                               | Create student                       |
| PUT    | `/api/students/:id`                           | Update student                       |
| DELETE | `/api/students/:id`                           | Delete student                       |
| GET    | `/api/goals`                                  | List all goals                       |
| POST   | `/api/goals`                                  | Create goal                          |
| GET    | `/api/classes`                                | List all classes                     |
| POST   | `/api/classes`                                | Create class                         |
| PUT    | `/api/classes/:id`                            | Update class                         |
| DELETE | `/api/classes/:id`                            | Delete class                         |
| GET    | `/api/assessments`                            | List assessments (global)            |
| PUT    | `/api/assessments`                            | Set/update an assessment             |
| DELETE | `/api/assessments`                            | Clear an assessment                  |
| GET    | `/api/classes/:id/assessments`                | List assessments for a class         |
| PUT    | `/api/classes/:id/assessments`                | Set/update a class assessment        |
| GET    | `/api/emails`                                 | List email notifications             |
| POST   | `/api/emails/dispatch`                        | Dispatch pending emails for a date   |

## Domain Concepts

- **Student** — learner identified by name, CPF, and email.
- **Class** — course offering with topic, year, semester, and enrolled students.
- **Goal** — learning objective to be assessed (e.g., Requirements, Testing, Implementation).
- **Assessment** — value assigned to a (student, goal) pair:
  - `MANA` — Goal Not Yet Achieved
  - `MPA` — Goal Partially Achieved
  - `MA` — Goal Achieved

## Email Notifications

When a student's assessment changes, the system schedules a **single consolidated daily email** per student. All changes made on the same day — across any class — are grouped into one message. Emails are dispatched via `POST /api/emails/dispatch` (can be triggered manually or by the built-in daily job).

## Acceptance Tests

Feature files live in `sistema/backend/features/`:

- `manage-students.feature` — student CRUD
- `manage-classes.feature` — class CRUD and per-class views
- `manage-assessments.feature` — assigning assessment values
- `daily-email-notification.feature` — one-email-per-day invariant and dispatch lifecycle

Tests run against a temporary data directory and use an in-memory email transport — production data is never touched.

```bash
cd sistema/backend
npm run test:acceptance
```

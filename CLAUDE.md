# CLAUDE.md

This file provides persistent context and guidance for Claude Code (and any equivalent AI coding agent) when working on this repository.

---

## 1. Project Overview

### Name

**TALP2 — Student & Assessment Management System**

### Objective

Build a simple web application that allows a professor to manage students, classes, and goal-based assessments for an academic context. The system records learner progress against learning goals (e.g., Requirements, Testing, Implementation), persists data locally as JSON files, and notifies students by email when their assessments change.

### Domain

Academic course management. Core concepts:

- **Student (Aluno):** a learner identified by name, CPF, and email.
- **Class (Turma):** a course offering with a topic description, year, semester, enrolled students, and their assessments within that class.
- **Goal (Meta):** a learning objective that is assessed (e.g., Requirements, Testing, Implementation).
- **Assessment (Avaliação):** a concept assigned to a (student, goal) pair inside a class. Allowed values:
  - `MANA` — _Meta Ainda Não Atingida_ (Goal Not Yet Achieved)
  - `MPA` — _Meta Parcialmente Atingida_ (Goal Partially Achieved)
  - `MA` — _Meta Atingida_ (Goal Achieved)

### Core Functional Scope

1. **Student management:** full CRUD (create, update, delete) with a dedicated listing page. Each student has `name`, `cpf`, and `email`.
2. **Assessment management:** a page showing a table where the first column lists students and the subsequent columns are goals. Each cell holds `MANA`, `MPA`, or `MA`.
3. **JSON persistence:** all students, classes, and assessments are stored in JSON files on the backend filesystem. No database.
4. **Class management:** full CRUD for classes. Each class has `topic`, `year`, `semester`, enrolled students, and the assessments of those students for that class. Classes can be viewed in isolation with their own students and assessments.
5. **Daily consolidated email notifications:** when the professor creates or changes any assessment for a student, the system schedules a **single daily email** per student that consolidates _all_ assessment changes made that day across _all_ classes the student is enrolled in. Never send more than one email per student per day.

### Mandatory Tech Stack

| Layer            | Technology                                |
| ---------------- | ----------------------------------------- |
| Frontend         | **React + TypeScript** (Vite)             |
| Backend          | **Node.js + TypeScript** (Express)        |
| Persistence      | **JSON files** on disk (no database)      |
| Acceptance tests | **Cucumber + Gherkin** (`.feature` files) |
| Package manager  | npm (workspaces allowed)                  |

Do not introduce additional frameworks, ORMs, or databases without explicit user approval.

---

## 2. Architecture & Folder Structure

### Monorepo Layout

All application code lives under the top-level `sistema/` directory:

```
sistema/
├── frontend/                  # React + TypeScript (Vite) client
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable presentational components
│   │   ├── pages/             # Route-level screens (StudentsPage, ClassesPage, AssessmentsPage, ...)
│   │   ├── hooks/             # Custom React hooks (useStudents, useClasses, ...)
│   │   ├── services/          # HTTP clients that talk to the backend API
│   │   ├── types/             # Shared TypeScript types / DTOs
│   │   ├── utils/             # Pure helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/                   # Node.js + TypeScript (Express) API
    ├── src/
    │   ├── routes/            # Express routers — HTTP endpoint wiring only
    │   ├── controllers/       # Request/response handling, input validation, status codes
    │   ├── services/          # Business rules (assessment workflow, email scheduling, ...)
    │   ├── repositories/      # JSON file I/O; the only layer that touches disk
    │   ├── models/            # Domain types and schemas (Student, Class, Assessment, Goal)
    │   ├── jobs/              # Scheduled tasks (daily email consolidation)
    │   ├── mailer/            # Email transport abstraction
    │   ├── utils/             # Pure helpers
    │   ├── app.ts             # Express app wiring (middleware, routes)
    │   └── server.ts          # Process entry point
    ├── data/                  # JSON persistence files (students.json, classes.json, assessments.json, pendingEmails.json)
    ├── features/              # Cucumber .feature files + step definitions
    │   ├── step_definitions/
    │   └── support/
    ├── package.json
    ├── tsconfig.json
    └── cucumber.js
```

### Mandatory Separation of Responsibilities

**Backend layers (top to bottom — dependencies flow downward only):**

- **routes/** — Declare HTTP endpoints and bind them to controllers. No business logic.
- **controllers/** — Parse and validate the HTTP request, call a service, shape the HTTP response. No business logic, no file I/O.
- **services/** — Business rules and use-case orchestration (e.g., "upsert an assessment and enqueue a daily email"). Services call repositories; they never touch `fs` directly.
- **repositories/** — The **only** layer allowed to read/write JSON files. Expose domain-level operations (`findStudentById`, `saveAssessment`), not raw file operations.
- **models/** — Domain types and validation schemas shared across layers.
- **jobs/** — Scheduled workers (e.g., the daily email dispatcher). Delegate work to services.
- **mailer/** — Abstracts the email transport so tests can swap in a fake.

**Frontend layers:**

- **pages/** — Route-level screens composed from components; own page-level state and data fetching.
- **components/** — Reusable, presentational, ideally stateless building blocks.
- **hooks/** — Encapsulate client-side state, data fetching, and side effects.
- **services/** — Typed HTTP clients for the backend API. Pages and hooks call services, never `fetch` directly.
- **types/** — Shared DTOs that mirror the backend contract.

Do not collapse layers (e.g., never import `fs` from a controller, never call `fetch` from a component).

### File Naming Conventions

- **TypeScript source files:** `camelCase.ts` (e.g., `studentService.ts`, `assessmentRepository.ts`).
- **React components and pages:** `PascalCase.tsx` (e.g., `StudentsPage.tsx`, `AssessmentTable.tsx`). One component per file; filename matches the exported component.
- **React hooks:** `camelCase.ts` starting with `use` (e.g., `useStudents.ts`).
- **Tests (unit/integration):** mirror the source filename with a `.test.ts` / `.test.tsx` suffix, colocated with the file under test.
- **Cucumber feature files:** `kebab-case.feature` (e.g., `manage-students.feature`, `daily-email-notification.feature`).
- **Step definitions:** `kebab-case.steps.ts` (e.g., `manage-students.steps.ts`).
- **JSON data files:** `camelCase.json` (e.g., `students.json`, `classes.json`, `assessments.json`, `pendingEmails.json`).
- **Folders:** lowercase, singular for domain concepts when they match a layer name (`controllers/`, `services/`) and plural for collections of assets (`components/`, `pages/`).
- **Domain vocabulary:** source code, types, and API paths use **English** names (`Student`, `Class`, `Assessment`, `Goal`, `/api/students`).

---

## 3. Acceptance Tests

- Every user-visible feature must have **acceptance tests written in Gherkin** and executed by **Cucumber**.
- Feature files live in **`sistema/backend/features/`**, with step definitions in `sistema/backend/features/step_definitions/` and shared hooks/world in `sistema/backend/features/support/`.
- All Gherkin scenarios (`Feature`, `Scenario`, `Given`/`When`/`Then`, `Background`, `Scenario Outline`, `Examples`) **must be written in English**. Do not use `# language:` directives for Portuguese.
- Each core feature has its own `.feature` file. Expected minimum coverage:
  - `manage-students.feature` — student CRUD.
  - `manage-classes.feature` — class CRUD and per-class views.
  - `manage-assessments.feature` — assigning `MANA` / `MPA` / `MA` to (student, goal) in a class.
  - `daily-email-notification.feature` — a single consolidated email per student per day, aggregating changes across all classes.
- Acceptance tests run against the real backend with JSON persistence pointed at a **temporary data directory** (created in `Before` hooks, cleaned in `After` hooks). Never run tests against the real `sistema/backend/data/` files.
- The email transport is replaced with an in-memory fake in tests so scenarios can assert on emails that _would_ have been sent, including the one-email-per-day invariant.
- Cucumber is invoked via an npm script in `sistema/backend/package.json` (e.g., `npm run test:acceptance`). CI must run it on every change.

---

## 4. External Skills (skills.sh)

This project integrates external skills via [skills.sh](https://skills.sh) (the Vercel Labs skill manager). Installed skills live under [.agents/skills/](.agents/skills/) and are tracked in [skills-lock.json](skills-lock.json). When a task matches a skill's description, prefer applying that skill's guidance over generic advice.

| Skill                           | Source                              | Location                                                                                   | When to apply                                                                                                                                                                         |
| ------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **cucumber-gherkin**            | `el-feo/ai-context` (GitHub)        | [.agents/skills/cucumber-gherkin/](.agents/skills/cucumber-gherkin/)                       | Writing or editing `.feature` files, step definitions, hooks, Cucumber configuration, or any BDD/acceptance-test work under [sistema/backend/features/](sistema/backend/features/).   |
| **nodejs-backend-patterns**     | `wshobson/agents` (GitHub)          | [.agents/skills/nodejs-backend-patterns/](.agents/skills/nodejs-backend-patterns/)         | Designing or modifying the Express backend: routes, controllers, services, repositories, middleware, error handling, and API design under [sistema/backend/](sistema/backend/).       |
| **vercel-react-best-practices** | `vercel-labs/agent-skills` (GitHub) | [.agents/skills/vercel-react-best-practices/](.agents/skills/vercel-react-best-practices/) | Writing, reviewing, or refactoring React/TypeScript code in the Vite frontend: components, hooks, pages, data fetching, and performance under [sistema/frontend/](sistema/frontend/). |
| **git-commit**                  | `github/awesome-copilot` (GitHub)   | [.agents/skills/git-commit/](.agents/skills/git-commit/)                                   | Crafting commit messages that follow the Conventional Commits specification (auto-detected type/scope, intelligent staging). Apply whenever committing changes in this repo.          |

Before starting work in any of the areas above, open the corresponding `SKILL.md` (and `references/` or `rules/` folders when present) and follow the guidance it defines. Do not modify files under `.agents/skills/` or `skills-lock.json` manually — they are managed by `skills.sh`.

---

## Working Agreements for the Agent

- Prefer editing existing files over creating new ones; do not introduce files outside the structure above without asking.
- Keep backend and frontend type definitions in sync; when an API contract changes, update both sides in the same change.
- Before marking a task done, verify the code compiles (`tsc --noEmit` on both workspaces) and the relevant Cucumber scenarios pass.
- Do not add databases, ORMs, authentication frameworks, or cloud SDKs unless the user explicitly requests them.
- When a change affects observable behavior, add or update the corresponding `.feature` scenario in the same change.

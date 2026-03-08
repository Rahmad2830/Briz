# Contributing to Briz.js

Thank you for your interest in contributing to Briz.js! This document provides everything you need to know to contribute effectively — from setting up your development environment to submitting your first pull request.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Questions & Discussion](#questions--discussion)

---

## Code of Conduct

All contributors are expected to engage respectfully and constructively. Please be welcoming to newcomers, patient with those who are learning, and thoughtful in all discussions. Harassment or exclusionary behavior of any kind will not be tolerated.

---

## Project Overview

Briz.js is a lightweight, declarative JavaScript library for building dynamic, server-driven UIs without a heavy frontend framework. It works by intercepting navigation and form submissions, fetching HTML from the server, and swapping it into the page — all controlled via HTML attributes.

The library is built around several core capabilities:

- **AJAX navigation and form handling** — Intercepts `[data-nav]` links and `[data-ajax]` forms to perform client-side navigation without full page reloads.
- **HTML swapping** — Replaces or inserts DOM content using the `[data-swap]` attribute, with support for multiple insertion modes (`append`, `prepend`, `before`, `after`).
- **Polling** — Periodically fetches and swaps content for `[data-polling]` elements, with configurable intervals and automatic pause when the tab is hidden.
- **Server-Sent Events (SSE)** — Connects `[data-sse]` elements to SSE endpoints and updates the DOM when server events arrive.
- **Batched DOM updates** — Swap operations are queued and applied in a single microtask to minimise layout thrashing.
- **MutationObserver integration** — Automatically starts and stops polling and SSE connections as elements are added to or removed from the DOM.

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- A package manager: `npm`
- Basic familiarity with vanilla JavaScript and the DOM API

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/Rahmad2830/Briz.git
cd Briz

# Add the upstream remote to keep your fork in sync
git remote add upstream https://github.com/Rahmad2830/Briz.git
```

### Install Dependencies

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

This will start a local server and watch for file changes. Open the address shown in your terminal to see the demo page.

---

## Project Structure

```
Briz/
├── src/
│   ├── index.js              # Entry point — bootstraps the library on DOMContentLoaded
│   ├── core/
│   │   ├── init.js           # Event listener setup, navigation, form handling, popstate
│   │   ├── fetch.js          # $fetch wrapper with AbortController, timeout, and lifecycle events
│   │   ├── swap.js           # DOM swap logic (partial swap and full page swap)
│   │   ├── batching.js       # Microtask queue for batched swap operations
│   │   └── utils.js          # Shared utilities: custom event dispatch, history state helpers
│   └── streams/
│       ├── mutation_observer.js   # Observes DOM mutations to auto-start/stop polling and SSE
│       ├── polling/
│       │   └── polling.js         # Polling bootstrap, start/stop, visibility handler
│       └── sse/
│           └── sse.js             # SSE bootstrap, start/stop, EventSource management
├── tests/
├── examples/
├── package.json
└── CONTRIBUTING.md
```

---

## Development Workflow

### Branching

Always create a new branch for your work. Branch names should follow this convention:

| Type | Format | Example |
|---|---|---|
| Bug fix | `fix/short-description` | `fix/polling-pause-on-hidden` |
| New feature | `feat/short-description` | `feat/retry-on-error` |
| Documentation | `docs/short-description` | `docs/update-contributing` |
| Refactor | `refactor/short-description` | `refactor/swap-batching` |

```bash
git checkout -b fix/polling-pause-on-hidden
```

### Keeping Your Fork Up to Date

Before starting new work, sync your fork with the upstream repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### Running Tests

```bash
npm test
```

Please ensure all existing tests pass before submitting a pull request. If you are adding new functionality, include corresponding tests.

---

## Coding Standards

Briz.js is intentionally minimal and dependency-free. Please keep this philosophy in mind when contributing.

**General principles:**

- Write plain, modern JavaScript (ES modules). Do not introduce build-time dependencies unless absolutely necessary and agreed upon in an issue first.
- Keep functions small and focused on a single responsibility.
- Prefer explicit, readable code over clever one-liners.
- Avoid introducing global state. New features should follow the existing patterns — `WeakMap` for per-element state, `Set` for tracking active elements, and `AbortController` for cancellable requests.

**Custom events:**

All lifecycle events must be dispatched using the `dispatchZEvent` utility from `utils.js`. Event names should follow the `z:` prefix convention (e.g., `z:before-swap`, `z:after-request`). This ensures consistency and allows users to hook into the library's lifecycle predictably.

**Error handling:**

Errors should be caught at the boundary of async operations and logged via `console.error`. Where recovery is possible (e.g., falling back to a full page load on failed navigation), implement it. Do not let unhandled promise rejections propagate silently.

**Timeout format:**

User-configurable timeout and interval values follow the `<number>s` format (e.g., `"5s"`, `"0.5s"`). Any new attribute that accepts a duration must validate this format and emit a descriptive `console.error` on invalid input — see `fetch.js` and `polling.js` for the established pattern.

---

## Submitting Changes

1. Ensure your changes are committed to a dedicated branch (not `main`).
2. Run tests and verify they pass.
3. Push your branch to your fork:
   ```bash
   git push origin fix/polling-pause-on-hidden
   ```
4. Open a pull request against the `main` branch of the upstream repository.
5. Fill in the pull request template, describing what changed and why.

A maintainer will review your pull request as soon as possible. You may be asked to make revisions before it is merged. Please don't be discouraged — this is a normal part of the process and reflects a commitment to code quality.

---

## Reporting Bugs

Before opening a bug report, please search the existing issues to check whether the problem has already been reported.

When filing a new bug report, please include the following:

- A clear and descriptive title.
- Steps to reproduce the issue reliably.
- The expected behaviour and what actually happened.
- The browser and version you tested in.
- A minimal reproduction (a CodePen, JSFiddle, or small repository) if possible.

---

## Requesting Features

Feature requests are welcome. Open a GitHub issue with the `enhancement` label and describe:

- The problem you are trying to solve or the use case you have in mind.
- How you envision the feature working, including any proposed HTML attributes or JavaScript API surface.
- Any alternatives you have considered.

For significant changes, it is best to open an issue and discuss it before writing code. This avoids the situation where substantial work is done in a direction that doesn't align with the project's goals.

---

## Questions & Discussion

If you have a question about how Briz.js works or want to discuss an idea before opening an issue, feel free to start a discussion in the GitHub Discussions tab. We're happy to help.

---

Thank you for contributing to Briz.js. Every improvement, however small, is appreciated.

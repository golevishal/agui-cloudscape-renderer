# Contributing to AUI Cloudscape Renderer

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/aui-cloudscape-renderer.git
cd aui-cloudscape-renderer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:5173`:

| Route | Description |
|---|---|
| `/` | Live agent demo with simulated HITL interaction |
| `/playground` | Interactive JSON → Cloudscape rendering playground |

### Running Tests

```bash
# Lint + type-check + test in one pass
npm run lint && npm run test

# Run tests in watch mode during development
npx vitest --watch
```

## How to Contribute

### Reporting Bugs

1. Search [existing issues](../../issues) to avoid duplicates.
2. Open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the behavior
   - Expected vs. actual behavior
   - Environment details (OS, Node version, browser)

### Suggesting Features

Open an issue with the **enhancement** label. Describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Submitting Pull Requests

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feature/my-new-feature
   ```
2. Make your changes, following the coding conventions below.
3. Add or update tests for any new functionality.
4. Ensure all checks pass:
   ```bash
   npm run lint && npm run test
   ```
5. Write a clear PR description linking to any related issues.
6. Submit the PR against `main`.

## Coding Conventions

- **TypeScript** — all source code is strictly typed. Avoid `any`; use proper types from `src/types/agui.ts`.
- **React** — functional components with hooks only. No class components.
- **Cloudscape** — map A2UI catalog primitives 1:1 to their Cloudscape counterparts. Don't introduce custom UI primitives unless they have no Cloudscape equivalent.
- **Naming** — PascalCase for components, camelCase for hooks and utilities.
- **Testing** — use Vitest + React Testing Library. Co-locate test files (`ComponentName.test.tsx`) alongside their source.

## Project Structure

```
src/
├── components/          # React components
│   ├── A2UIRenderer.tsx        # Recursive catalog component renderer
│   ├── A2UITableRenderer.tsx   # Table with auto-columns & status indicators
│   ├── A2UIPropertyRedact.tsx  # Sensitive data redaction wrapper
│   ├── ProtocolBridge.tsx      # Event router (A2UI_RENDER, ACTION_REQUIRED, etc.)
│   ├── SurfaceRenderer.tsx     # HITL form builder with validation
│   ├── TraceSidebar.tsx        # Tool-call trace visualization
│   └── ErrorBoundary.tsx       # Global error boundary
├── hooks/               # Custom React hooks
│   └── useAgUiEvents.ts        # (Mock) Simulated AG-UI event stream
├── pages/               # Route pages
│   ├── Demo.tsx                # Live agent demo
│   └── Playground.tsx          # JSON playground
├── types/               # TypeScript type definitions
│   └── agui.ts                 # AG-UI Protocol & A2UI Catalog types
└── test/                # Test setup & utilities
```

## Adding a New A2UI Catalog Component

1. Add the TypeScript interface to `src/types/agui.ts`.
2. Add the type to the `AnyCatalogComponent` union.
3. Add a rendering `case` in `A2UIRenderer.tsx`.
4. Add a template entry in `Playground.tsx` so it's testable.
5. Write a test if the component has non-trivial logic.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

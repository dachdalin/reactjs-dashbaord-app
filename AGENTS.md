# Repository Guidelines

## Project Structure & Module Organization
This is a React 19 + TypeScript dashboard app built with Vite. Application code lives in `src/`.

- `src/main.tsx` mounts the app; `src/App.tsx` defines top-level routing.
- `src/pages/` contains route-level screens, grouped by feature such as `dashboard/`, `settings/`, `blog/`, `comments/`, and `auth/`.
- `src/components/` contains reusable UI pieces; subfolders such as `auth/`, `editor/`, and `ui/` should stay focused.
- `src/layouts/` contains shared layout shells.
- `src/context/` holds React context providers, including authentication state.
- `src/actions/` and `src/lib/` contain API actions, helpers, and shared data utilities.
- `src/assets/` and `public/` store static assets. Build output is generated in `dist/` and should not be edited directly.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite development server with HMR.
- `npm run build`: run TypeScript project checks with `tsc -b`, then create a production build.
- `npm run lint`: run ESLint over the repository.
- `npm run preview`: serve the production build locally for final verification.

## Coding Style & Naming Conventions
Use TypeScript and React function components. Name components and page files in PascalCase, for example `StatsCard.tsx` or `RootLayout.tsx`. Name hooks with a `use` prefix.

Follow the existing style: two-space indentation in TSX/TS files, single quotes, no semicolons, and concise JSX. Prefer Tailwind utility classes and existing CSS modules before adding new global CSS. Use `clsx` for conditional class names.

ESLint is configured in `eslint.config.js` with TypeScript, React Hooks, and React Refresh rules. Run `npm run lint` before opening a pull request.

## Testing Guidelines
No automated test runner is currently configured in `package.json`. For now, validate changes with `npm run lint`, `npm run build`, and manual browser checks.

When tests are added, prefer colocated `*.test.tsx` files or a dedicated `src/__tests__/` folder, and cover routing, API actions, context behavior, and reusable UI components.

## Commit & Pull Request Guidelines
Recent commits use short, imperative summaries such as `build comment manager` and `update readme file`. Keep commits focused and describe the user-visible change.

Pull requests should include a brief description, verification steps, linked issues when applicable, and screenshots for UI changes. Note any new dependencies, environment variables, or route/API changes.

## Security & Configuration Tips
Do not commit secrets or local environment files. Keep API base URLs and credentials in environment-specific configuration, and document any required variables in the README when adding them.

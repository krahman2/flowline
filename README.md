# Flowline

A timeline-based productivity app that turns projects into visual flow paths. Follow connected time blocks through focus sessions, earn XP, and track your progress.

## Features

- **Flowline timeline** — Visual vertical path with sections, tasks, subtasks, breaks, buffers, and review blocks
- **Focus mode** — Pomodoro-style timer with start/pause/complete/skip
- **Multiple views** — Flowline, List, Calendar (placeholder), History, Goals
- **Gamification** — XP per minute, streaks, weekly focus goals, project completion bonus
- **Local persistence** — Works offline in the browser; optional **Google sign-in** syncs to Firebase

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app starts empty — create a flow or load sample data from Settings.

### Cloud sync (optional)

Sign in with Google (top right) to save progress across devices. Local data merges into your account on first sign-in.

See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for Firebase, Firestore rules, and Vercel env vars.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- React Router
- localStorage + Firebase (Auth + Firestore sync)

## Project structure

```
src/
  components/     UI components by feature
  pages/          Route pages
  store/          Context, storage, seed data, gamification
  types/          TypeScript models
  utils/          Flow helpers and formatting
```

## Usage

1. Open the **Math Homework** project from the dashboard
2. Click **Start Flow** to enter focus mode on the first block
3. Complete tasks to advance along the timeline and earn XP
4. Switch between **Flowline** and **List** views to edit items
5. Check **Goals** for weekly targets and **History** for session logs

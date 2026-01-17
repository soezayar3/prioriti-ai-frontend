# PrioritiAI Frontend

Next.js web application for the AI Productivity Suite.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + CSS Variables
- **State**: React Context
- **Theme**: Dark/Light mode

## Features

- **🚀 Multi-App Suite**: Extensible productivity app platform
- **✨ Task Prioritizer**: AI-powered task organization with energy context
- **📅 Daily Planner**: AI-generated time-blocked schedules
- **🌈 Mood Journal**: AI sentiment analysis with monthly insights
- **🔧 Admin Dashboard**: User management and feature toggles
- **📱 Responsive UI**: Mobile-first design across all pages
- **🌓 Theme Support**: System-aware Dark/Light mode

## Getting Started

```bash
# Install
npm install

# Configure (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Run
npm run dev
```

Open `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing
│   ├── login/                # Auth pages
│   ├── register/
│   ├── apps/
│   │   ├── page.tsx          # Apps List
│   │   ├── task-prioritizer/ # Task Prioritizer
│   │   ├── daily-planner/    # Daily Planner + History
│   │   └── mood-journal/     # Mood Journal + Insights
│   └── admin/                # Admin Dashboard
│
├── components/
│   ├── ui/                   # Button, ThemeToggle, Toast
│   ├── BrainDump.tsx         # Task input
│   ├── EnergySelector.tsx    # Energy level picker
│   ├── TaskCard.tsx          # Task display
│   └── Timeline.tsx          # Schedule visualization
│
├── context/
│   └── AuthContext.tsx       # Auth state
│
└── lib/
    └── api.ts                # API client
```

## Apps

### Task Prioritizer

AI analyzes your task list and energy level to create an optimal priority order.

### Daily Planner

Input your tasks and work hours; AI generates a realistic time-blocked schedule.

### Mood Journal

Write 1-2 sentences about your day. AI extracts:

- Mood score (-1 to +1)
- Mood label (happy, stressed, calm, etc.)
- Entities (activities, people, places)

Monthly insights show patterns and correlations.

## Scripts

| Script          | Description        |
| --------------- | ------------------ |
| `npm run dev`   | Development server |
| `npm run build` | Production build   |
| `npm start`     | Run production     |
| `npm run lint`  | ESLint             |

## License

MIT

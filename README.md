# PrioritiAI Frontend

Next.js web application for the Smart Task Prioritizer.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + PostCSS
- **State**: React Context
- **Theme**: Dark/Light mode (Tailwind + CSS Variables)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`

## Scripts

| Script          | Description          |
| --------------- | -------------------- |
| `npm run dev`   | Start dev server     |
| `npm run build` | Build for production |
| `npm start`     | Run production build |
| `npm run lint`  | Run ESLint           |

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Landing page
│   ├── apps/                 # Apps Suite
│   │   ├── page.tsx          # Apps List
│   │   └── task-prioritizer/ # Task Prioritizer App
│   │       └── page.tsx      # Main app view
│   ├── login/                # Login page
│   └── register/             # Register page
│
├── components/               # React components
│   ├── ui/                   # Reusable (Button, ThemeToggle)
│   ├── BrainDump.tsx         # Task input textarea
│   ├── EnergySelector.tsx    # Energy level selector
│   └── TaskCard.tsx          # Prioritized task display
│
├── context/                  # React Context
│   └── AuthContext.tsx       # Auth state management
│
├── lib/                      # Utilities
│   └── api.ts                # API client with token management
│
└── styles/                   # Global CSS
    └── globals.css           # Tailwind directives & theme variables
```

## Features

- **🚀 Multi-App Suite**: Extensible app architecture
- **✨ Task Prioritizer**: AI-powered task organization
  - **🧠 Brain Dump**: Freeform task input
  - **⚡ Energy Context**: Prioritize based on user energy
  - **📋 History Sidebar**: View and manage previous schedules
- **🌓 Theme Support**: System-aware Dark/Light mode
- **🔐 Authentication**: Laravel Sanctum integration
- **📱 Responsive**: Mobile-first design with Tailwind CSS

## Theme System

Tailwind CSS v4 handles styling, with CSS variables defining the color palette in `globals.css` to support dynamic theming:

```css
:root {
  --bg-primary: #ffffff;
  --accent: #6366f1;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --accent: #818cf8;
  /* ... */
}
```

Components consume these variables via Tailwind or inline styles.

## License

MIT

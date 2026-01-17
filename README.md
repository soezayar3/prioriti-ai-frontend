# PrioritiAI Frontend

Next.js web application for the Smart Task Prioritizer.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + CSS Variables
- **State**: React Context

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
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
├── app/                 # Next.js App Router
│   ├── page.tsx         # Landing page
│   ├── login/           # Login page
│   ├── register/        # Register page
│   └── dashboard/       # Main app
│
├── components/          # React components
│   ├── ui/              # Reusable (Button, ThemeToggle)
│   ├── BrainDump.tsx    # Task input textarea
│   ├── EnergySelector.tsx
│   └── TaskCard.tsx     # Prioritized task display
│
├── context/             # React Context
│   └── AuthContext.tsx  # Auth state management
│
├── hooks/               # Custom hooks
│   └── useTheme.ts      # Light/dark mode
│
├── lib/                 # Utilities
│   └── api.ts           # API client with token refresh
│
└── styles/              # Global CSS
    └── globals.css      # Theme variables
```

## Features

- **🧠 Brain Dump**: Freeform task input
- **⚡ Energy Selector**: Low/Medium/High energy modes
- **🎯 Task Cards**: Priority badges, time estimates, AI reasoning
- **🌓 Theme Toggle**: Light/dark mode
- **🔐 Authentication**: JWT with auto-refresh
- **📱 Responsive**: Mobile-friendly design

## Theme System

CSS variables in `globals.css` handle theming:

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

## License

MIT

# PrioritiAI Frontend

Modern AI Productivity Suite built with Next.js and Supabase.

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + CSS Variables
- **AI**: Google Gemini via Supabase Edge Functions

## Features

- **✨ Task Prioritizer**: AI-powered task organization with energy context
- **📅 Daily Planner**: AI-generated time-blocked schedules
- **🌈 Mood Journal**: AI sentiment analysis with monthly insights
- **🔒 User Approval System**: Admin-controlled user access
- **🔧 Admin Dashboard**: User management and approval
- **📱 Responsive UI**: Mobile-first design
- **🌓 Theme Support**: Dark/Light mode

## Setup

### 1. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase Setup

Run the SQL in `supabase/schema.sql` to create tables and RLS policies.

### 3. Edge Functions

Deploy the AI Edge Functions:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase secrets set GEMINI_API_KEY=your-gemini-key
supabase functions deploy
```

### 4. Run Development Server

```bash
npm install
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
│   │   ├── task-prioritizer/
│   │   ├── daily-planner/
│   │   └── mood-journal/
│   └── admin/                # Admin Dashboard
│
├── components/ui/            # Reusable UI components
├── context/AuthContext.tsx   # Supabase Auth state
│
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── api.ts                # API methods
│
└── supabase/
    └── functions/            # Edge Functions
        ├── prioritize/
        ├── generate-daily-plan/
        └── analyze-journal/
```

## User Flow

1. **Register** → Account created with `pending` status
2. **Admin Approval** → Admin approves user in `/admin`
3. **Access Granted** → User can access all AI features

## Scripts

| Script          | Description        |
| --------------- | ------------------ |
| `npm run dev`   | Development server |
| `npm run build` | Production build   |
| `npm start`     | Run production     |
| `npm run lint`  | ESLint             |

## License

MIT

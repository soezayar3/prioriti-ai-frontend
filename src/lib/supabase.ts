import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  name: string | null;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  brain_dump: string;
  energy_level: string;
  created_at: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  schedule_id: string;
  title: string;
  priority: string;
  estimated_minutes: number;
  category: string;
  reason: string;
  is_completed: boolean;
  order: number;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string;
  schedule: ScheduledBlock[];
  original_input: string;
  created_at: string;
}

export interface ScheduledBlock {
  time: string;
  activity: string;
  type: 'focus' | 'break' | 'meeting' | 'routine';
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood_score: number | null;
  mood_label: string | null;
  entities: {
    activities: string[];
    people: string[];
    places: string[];
  } | null;
  created_at: string;
}

export interface Feature {
  id: number;
  slug: string;
  name: string;
  description: string;
  is_enabled: boolean;
}

-- =====================================================
-- PrioritiAI - Complete Supabase Schema
-- Run this SQL in a new Supabase project SQL Editor
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules (Task Prioritizer)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  brain_dump TEXT NOT NULL,
  energy_level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES schedules ON DELETE CASCADE,
  title TEXT NOT NULL,
  priority TEXT,
  estimated_minutes INTEGER,
  category TEXT,
  reason TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  "order" INTEGER
);

-- Daily Plans
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  schedule JSONB NOT NULL,
  original_input TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mood_score DECIMAL(3,2),
  mood_label TEXT,
  entities JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies (simple - no recursion)
CREATE POLICY "profiles_select_policy" ON profiles 
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "profiles_insert_policy" ON profiles 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles 
FOR UPDATE TO authenticated 
USING (auth.uid() = id);

-- Schedules policies
CREATE POLICY "schedules_policy" ON schedules 
FOR ALL TO authenticated 
USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "tasks_policy" ON tasks 
FOR ALL TO authenticated 
USING (
  schedule_id IN (SELECT id FROM schedules WHERE user_id = auth.uid())
);

-- Daily Plans policies
CREATE POLICY "daily_plans_policy" ON daily_plans 
FOR ALL TO authenticated 
USING (auth.uid() = user_id);

-- Journal Entries policies
CREATE POLICY "journal_entries_policy" ON journal_entries 
FOR ALL TO authenticated 
USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'user',
    'pending'
  );
  RETURN NEW;
END;
$$;

-- Admin function to update user status
CREATE OR REPLACE FUNCTION admin_update_user_status(
  target_user_id UUID,
  new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update user status';
  END IF;
  
  UPDATE profiles SET status = new_status WHERE id = target_user_id;
END;
$$;

-- Admin function to update user role
CREATE OR REPLACE FUNCTION admin_update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  SELECT role INTO caller_role FROM profiles WHERE id = auth.uid();
  
  IF caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;
  
  UPDATE profiles SET role = new_role WHERE id = target_user_id;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- INITIAL ADMIN (Optional - update with your user ID)
-- =====================================================
-- After registering your first user, run:
-- UPDATE profiles SET role = 'admin', status = 'approved' WHERE id = 'YOUR-USER-UUID';

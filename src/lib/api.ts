import { supabase, Schedule, Task, DailyPlan, JournalEntry, ScheduledBlock } from './supabase';

// Re-export types from supabase.ts
export type { Schedule, Task, DailyPlan, JournalEntry, ScheduledBlock };

export interface JournalInsights {
  month: string;
  entry_count: number;
  insights: {
    average_mood: number;
    mood_distribution: Record<string, number>;
    top_activities: Record<string, number>;
    top_people: Record<string, number>;
    top_places: Record<string, number>;
  } | null;
}

// Helper to parse AI errors into user-friendly messages
function parseAIError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  if (message.includes('Too Many Requests') || message.includes('429')) {
    return 'AI service is temporarily busy. Please wait a minute and try again.';
  }
  if (message.includes('GEMINI_API_KEY not configured')) {
    return 'AI service is not configured. Please contact support.';
  }
  if (message.includes('No JSON found')) {
    return 'AI returned an unexpected response. Please try again.';
  }
  if (message.includes('Not authenticated')) {
    return 'Please log in to use this feature.';
  }
  
  return message || 'An unexpected error occurred. Please try again.';
}

class SupabaseApi {
  // Get current user ID
  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user.id;
  }

  // ============ Task Prioritizer ============

  async prioritize(brainDump: string, energyLevel: string): Promise<{ schedule: Schedule }> {
    const userId = await this.getUserId();

    // Call Edge Function for AI processing
    const { data: aiData, error: aiError } = await supabase.functions.invoke('prioritize', {
      body: { brainDump, energyLevel },
    });

    // Handle errors - when Edge Function returns 500, aiData is null and error is in aiError.context
    if (aiError) {
      let errorMessage = aiError.message;
      
      // Try to get the actual error from the response body
      if ('context' in aiError && aiError.context instanceof Response) {
        try {
          const errorBody = await aiError.context.json();
          if (errorBody?.error) {
            errorMessage = errorBody.error;
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      throw new Error(parseAIError(new Error(errorMessage)));
    }
    
    if (!aiData?.schedule) {
      throw new Error('AI service returned an invalid response. Please try again.');
    }

    // Save schedule to database
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('schedules')
      .insert({ user_id: userId, brain_dump: brainDump, energy_level: energyLevel })
      .select()
      .single();

    if (scheduleError) throw new Error(scheduleError.message);

    interface AITask {
      title: string;
      priority: string;
      estimated_minutes: number;
      category: string;
      reason: string;
    }

    // Save tasks
    const tasks = aiData.schedule.map((task: AITask, index: number) => ({
      schedule_id: scheduleData.id,
      title: task.title,
      priority: task.priority,
      estimated_minutes: task.estimated_minutes,
      category: task.category,
      reason: task.reason,
      is_completed: false,
      order: index,
    }));

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks)
      .select();

    if (tasksError) throw new Error(tasksError.message);

    return {
      schedule: {
        ...scheduleData,
        tasks: tasksData,
      },
    };
  }

  async getSchedules(limit = 10, offset = 0): Promise<{ schedules: Schedule[]; total: number }> {
    const userId = await this.getUserId();

    const { data, error, count } = await supabase
      .from('schedules')
      .select('*, tasks(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return { schedules: data || [], total: count || 0 };
  }

  async deleteSchedule(id: string): Promise<{ message: string }> {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Schedule deleted' };
  }

  async updateTask(id: string, updates: { isCompleted?: boolean; order?: number }): Promise<{ task: Task }> {
    const updateData: Partial<Task> = {};
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;
    if (updates.order !== undefined) updateData.order = updates.order;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { task: data };
  }

  // ============ Daily Planner ============

  async generateDailyPlan(tasks: string, startTime: string, endTime: string): Promise<{ schedule: ScheduledBlock[] }> {
    // Call Edge Function for AI processing
    const { data, error } = await supabase.functions.invoke('generate-daily-plan', {
      body: { tasks, startTime, endTime },
    });

    // Handle errors - when Edge Function returns 500, data is null and error is in error.context
    if (error) {
      let errorMessage = error.message;
      
      if ('context' in error && error.context instanceof Response) {
        try {
          const errorBody = await error.context.json();
          if (errorBody?.error) {
            errorMessage = errorBody.error;
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      throw new Error(parseAIError(new Error(errorMessage)));
    }
    
    if (!data?.schedule) {
      throw new Error('AI service returned an invalid response. Please try again.');
    }
    return { schedule: data.schedule };
  }

  async saveDailyPlan(date: string, schedule: ScheduledBlock[], originalInput?: string): Promise<{ plan: DailyPlan }> {
    const userId = await this.getUserId();

    const { data, error } = await supabase
      .from('daily_plans')
      .insert({
        user_id: userId,
        date,
        schedule,
        original_input: originalInput,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { plan: data };
  }

  async getDailyPlans(): Promise<{ plans: DailyPlan[] }> {
    const userId = await this.getUserId();

    const { data, error } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { plans: data || [] };
  }

  async getDailyPlan(date: string): Promise<{ plan: DailyPlan | null }> {
    const userId = await this.getUserId();

    const { data, error } = await supabase
      .from('daily_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { plan: data };
  }

  // ============ Mood Journal ============

  async createJournalEntry(content: string): Promise<{ entry: JournalEntry; analysis: { summary: string } | null }> {
    const userId = await this.getUserId();

    // Call Edge Function for AI analysis
    let analysis = null;
    try {
      const { data: aiData, error: aiError } = await supabase.functions.invoke('analyze-journal', {
        body: { content },
      });

      // Handle errors - when Edge Function returns 500, aiData is null and error is in aiError.context
      if (aiError) {
        let errorMessage = aiError.message;
        
        if ('context' in aiError && aiError.context instanceof Response) {
          try {
            const errorBody = await aiError.context.json();
            if (errorBody?.error) {
              errorMessage = errorBody.error;
            }
          } catch {
            // Ignore parse errors
          }
        }
        
        throw new Error(parseAIError(new Error(errorMessage)));
      }
      
      analysis = aiData;
    } catch (err) {
      console.warn('AI analysis failed:', err instanceof Error ? err.message : err);
      throw err; // Re-throw to show user-friendly error
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        content,
        mood_score: analysis?.mood_score ?? null,
        mood_label: analysis?.mood_label ?? null,
        entities: analysis?.entities ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { entry: data, analysis };
  }

  async getJournalEntries(page = 1): Promise<{ data: JournalEntry[]; current_page: number; last_page: number }> {
    const userId = await this.getUserId();
    const pageSize = 20;
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(error.message);

    const totalCount = count || 0;
    return {
      data: data || [],
      current_page: page,
      last_page: Math.ceil(totalCount / pageSize),
    };
  }

  async getJournalInsights(month?: string): Promise<JournalInsights> {
    const userId = await this.getUserId();
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${targetMonth}-01`)
      .lt('created_at', `${targetMonth}-31T23:59:59`);

    if (error) throw new Error(error.message);

    const entries = data || [];

    if (entries.length === 0) {
      return { month: targetMonth, entry_count: 0, insights: null };
    }

    // Calculate insights
    const moodScores = entries.filter((e) => e.mood_score !== null).map((e) => e.mood_score as number);
    const avgMood = moodScores.length > 0 ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length : 0;

    const moodDistribution: Record<string, number> = {};
    const allActivities: string[] = [];
    const allPeople: string[] = [];
    const allPlaces: string[] = [];

    entries.forEach((entry) => {
      if (entry.mood_label) {
        moodDistribution[entry.mood_label] = (moodDistribution[entry.mood_label] || 0) + 1;
      }
      if (entry.entities) {
        allActivities.push(...(entry.entities.activities || []));
        allPeople.push(...(entry.entities.people || []));
        allPlaces.push(...(entry.entities.places || []));
      }
    });

    const countFrequency = (arr: string[]) => {
      const freq: Record<string, number> = {};
      arr.forEach((item) => {
        freq[item] = (freq[item] || 0) + 1;
      });
      return Object.fromEntries(Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5));
    };

    return {
      month: targetMonth,
      entry_count: entries.length,
      insights: {
        average_mood: Math.round(avgMood * 100) / 100,
        mood_distribution: moodDistribution,
        top_activities: countFrequency(allActivities),
        top_people: countFrequency(allPeople),
        top_places: countFrequency(allPlaces),
      },
    };
  }

  async deleteJournalEntry(id: string): Promise<{ message: string }> {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Entry deleted' };
  }

  // ============ Admin Functions ============

  async adminGetUsers(): Promise<{ users: AdminUser[] }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { users: data || [] };
  }

  async adminUpdateUserStatus(userId: string, status: 'pending' | 'approved' | 'rejected'): Promise<{ user: AdminUser }> {
    const { error } = await supabase.rpc('admin_update_user_status', {
      target_user_id: userId,
      new_status: status,
    });

    if (error) throw new Error(error.message);

    // Fetch updated user
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return { user: data };
  }

  async adminUpdateUserRole(userId: string, role: 'user' | 'admin'): Promise<{ user: AdminUser }> {
    const { error } = await supabase.rpc('admin_update_user_role', {
      target_user_id: userId,
      new_role: role,
    });

    if (error) throw new Error(error.message);

    // Fetch updated user
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return { user: data };
  }
}

// Admin User type
export interface AdminUser {
  id: string;
  name: string | null;
  email?: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Singleton
export const api = new SupabaseApi();
export default api;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiError {
  error?: string;
  message?: string;
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private accessToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  setToken(accessToken: string) {
    this.accessToken = accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (requiresAuth && this.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Laravel validation errors or general errors
      const errorMessage = (data as ApiError).error || 
                          (data as ApiError).message ||
                          (data.errors ? Object.values(data.errors).flat().join(', ') : 'Request failed');
      throw new Error(errorMessage as string);
    }

    return data as T;
  }

  // Auth methods
  async register(email: string, password: string, name: string) {
    const data = await this.request<{
      user: { id: number; email: string; name: string };
      accessToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      requiresAuth: false,
    });
    this.setToken(data.accessToken);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{
      user: { id: number; email: string; name: string };
      accessToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
    });
    this.setToken(data.accessToken);
    return data;
  }

  async logout() {
    try {
      await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearTokens();
    }
  }

  // API methods
  async prioritize(brainDump: string, energyLevel: string) {
    return this.request<{
      schedule: Schedule;
    }>('/prioritize', {
      method: 'POST',
      body: JSON.stringify({ brainDump, energyLevel }),
    });
  }

  async getSchedules(limit = 10, offset = 0) {
    return this.request<{
      schedules: Schedule[];
      total: number;
    }>(`/schedules?limit=${limit}&offset=${offset}`);
  }

  async getSchedule(id: string) {
    return this.request<{ schedule: Schedule }>(`/schedules/${id}`);
  }

  async deleteSchedule(id: string) {
    return this.request<{ message: string }>(`/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  async updateTask(id: string, data: { isCompleted?: boolean; order?: number }) {
    return this.request<{ task: Task }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Types - matching Laravel's snake_case responses
export interface Task {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  estimated_minutes: number;
  category: string;
  reason: string;
  is_completed: boolean;
  order: number;
}

export interface Schedule {
  id: string;
  brain_dump: string;
  energy_level: string;
  tasks: Task[];
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

// Singleton instance
export const api = new ApiClient();
export default api;

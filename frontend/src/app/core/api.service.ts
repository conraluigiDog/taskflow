import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export const API_URL = 'http://localhost:8000/api';

export type Status = 'todo' | 'doing' | 'done';

export interface Category { id: number; name: string; }
export interface Task {
  id: number; title: string; description: string; status: Status;
  category: number | null; category_name: string | null;
  due_date: string | null; created_at: string;
}
export type Stats = Record<Status, number>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  tasks(filters: { category?: number | null; search?: string } = {}) {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<Task[]>(`${API_URL}/tasks/`, { params });
  }
  createTask(data: Partial<Task>) { return this.http.post<Task>(`${API_URL}/tasks/`, data); }
  updateTask(id: number, data: Partial<Task>) { return this.http.patch<Task>(`${API_URL}/tasks/${id}/`, data); }
  deleteTask(id: number) { return this.http.delete(`${API_URL}/tasks/${id}/`); }
  stats() { return this.http.get<Stats>(`${API_URL}/tasks/stats/`); }

  categories() { return this.http.get<Category[]>(`${API_URL}/categories/`); }
  createCategory(name: string) { return this.http.post<Category>(`${API_URL}/categories/`, { name }); }
}

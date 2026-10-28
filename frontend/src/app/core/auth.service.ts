import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly loggedIn = signal(!!localStorage.getItem('access'));
  readonly username = signal(localStorage.getItem('username') ?? '');

  get token() {
    return localStorage.getItem('access');
  }

  login(username: string, password: string) {
    return this.http.post<{ access: string }>(`${API_URL}/auth/login/`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem('access', res.access);
        localStorage.setItem('username', username);
        this.loggedIn.set(true);
        this.username.set(username);
      })
    );
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${API_URL}/auth/register/`, { username, email, password });
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('username');
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }
}

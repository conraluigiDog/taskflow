import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="page">
      <header>
        <span class="logo">TASKFLOW</span>
        <span class="tagline">Organizador pessoal de tarefas</span>
        @if (auth.loggedIn()) { <span class="user">Olá, {{ auth.username() }}</span> }
      </header>

      <nav class="tabs" aria-label="Principal">
        @if (auth.loggedIn()) {
          <a class="tab active" routerLink="/">Tarefas</a>
          <button class="tab" (click)="auth.logout()">Sair</button>
        } @else {
          <a class="tab" routerLink="/login" routerLinkActive="active">Entrar</a>
          <a class="tab" routerLink="/cadastro" routerLinkActive="active">Criar conta</a>
        }
      </nav>

      <router-outlet />

      <footer>© 2026 Taskflow. Todos os direitos reservados.</footer>
    </div>
  `,
  styles: [`
    .page { max-width: 880px; margin: 0 auto; padding: 1.5rem 1rem 2rem; }
    header { display: flex; align-items: baseline; flex-wrap: wrap; gap: .5rem 1.25rem; margin-bottom: 1rem; }
    .logo { font: 800 30px/1 "Arial Black", Verdana, sans-serif; letter-spacing: .12em; color: #4b5057; }
    .tagline { color: #5f9a14; font-size: 15px; }
    .user { margin-left: auto; color: var(--muted); font-size: 12px; }
    .tabs { display: flex; flex-wrap: wrap; gap: 3px; }
    .tab { background: var(--tab); border: 1px solid var(--tab-line); border-bottom: none;
           border-radius: 7px 7px 0 0; padding: .35rem 1.1rem; font-size: 11px; font-weight: 700;
           letter-spacing: .06em; text-transform: uppercase; color: var(--olive); text-decoration: none; }
    .tab.active { background: #b5dc3c; color: #34430a; }
    footer { margin-top: 2.5rem; text-align: right; font-size: 11px; color: var(--muted); }
  `],
})
export class AppComponent {
  auth = inject(AuthService);
}

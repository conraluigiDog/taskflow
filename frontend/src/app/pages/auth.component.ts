import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="hero">
      <h1>{{ isRegister ? 'Criar conta' : 'Entrar' }}</h1>
      <p>Organize suas tarefas em três colunas.</p>
    </section>
    <section class="panel">
      <form (ngSubmit)="submit()">
        <label>Usuário <input name="username" [(ngModel)]="username" required autocomplete="username" /></label>
        @if (isRegister) {
          <label>E-mail <input name="email" type="email" [(ngModel)]="email" autocomplete="email" /></label>
        }
        <label>Senha
          <input name="password" type="password" [(ngModel)]="password" required minlength="8"
                 [autocomplete]="isRegister ? 'new-password' : 'current-password'" />
        </label>
        @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
        <div class="row">
          <button class="go" [disabled]="loading()">{{ isRegister ? 'Criar conta' : 'Entrar' }}</button>
          <span class="muted">
            @if (isRegister) { Já tem conta? <a routerLink="/login">Entrar</a> }
            @else { Ainda não tem conta? <a routerLink="/cadastro">Criar conta</a> }
          </span>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .hero { background: linear-gradient(#bde14a 0 10%, #9acb25 10% 14%, #6f9f10 14% 50%, #5f8f0a 50% 72%, #78ac16 72% 90%, #c3e55a 90%);
            padding: 2rem 1.5rem; color: var(--lime-hi); }
    .hero h1 { font-size: 26px; }
    .hero p { margin: .4rem 0 0; }
    .panel { border: 1px solid var(--tab-line); border-top: none; padding: 1.5rem; }
    form { display: grid; gap: 1rem; max-width: 360px; }
    label { display: grid; gap: .3rem; font-weight: 700; color: var(--olive); }
    .row { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; }
    a { color: var(--edge); font-weight: 700; }
  `],
})
export class AuthComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  isRegister = inject(ActivatedRoute).snapshot.data['mode'] === 'register';

  username = '';
  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  submit() {
    this.error.set('');
    this.loading.set(true);
    const done = () => this.router.navigate(['/']);
    const fail = (e: any) => {
      this.loading.set(false);
      const body = e.error ?? {};
      const first = Object.values(body).flat()[0] as string | undefined;
      this.error.set(body.detail ?? first ?? 'Não foi possível concluir. Tente novamente.');
    };

    if (this.isRegister) {
      this.auth.register(this.username, this.email, this.password).subscribe({
        next: () => this.auth.login(this.username, this.password).subscribe({ next: done, error: fail }),
        error: fail,
      });
    } else {
      this.auth.login(this.username, this.password).subscribe({ next: done, error: fail });
    }
  }
}

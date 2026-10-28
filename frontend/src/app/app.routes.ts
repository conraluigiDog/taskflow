import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AuthComponent } from './pages/auth.component';
import { BoardComponent } from './pages/board.component';

export const routes: Routes = [
  { path: '', component: BoardComponent, canActivate: [authGuard] },
  { path: 'login', component: AuthComponent, data: { mode: 'login' } },
  { path: 'cadastro', component: AuthComponent, data: { mode: 'register' } },
  { path: '**', redirectTo: '' },
];

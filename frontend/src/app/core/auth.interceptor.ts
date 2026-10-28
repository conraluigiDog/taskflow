import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err) => {
      // Token expirado ou inválido fora das telas de login/cadastro: volta para o login.
      if (err.status === 401 && !req.url.includes('/auth/')) auth.logout();
      return throwError(() => err);
    })
  );
};

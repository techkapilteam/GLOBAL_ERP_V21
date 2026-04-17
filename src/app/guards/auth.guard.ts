import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protects private routes — redirects to /login if not authenticated
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) return true;

  router.navigate(['/login']);
  return false;
};

// Protects public routes — redirects to /dashboard if already logged in
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) return true;

  router.navigate(['/dashboard']);
  return false;
};
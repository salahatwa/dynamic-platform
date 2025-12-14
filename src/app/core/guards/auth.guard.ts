import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppContextService } from '../services/app-context.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const appContextService = inject(AppContextService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    // Ensure apps are initialized when accessing admin routes
    // This handles cases where the user refreshes the page or navigates directly to admin routes
    if (!appContextService.hasApps() && !appContextService.loading()) {
      console.log('Auth guard: Initializing apps for authenticated user');
      appContextService.initialize();
    }
    
    return true;
  }
  
  // Redirect to landing page if not authenticated
  router.navigate(['/']);
  return false;
};

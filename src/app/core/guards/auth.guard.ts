import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppContextService } from '../services/app-context.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const appContextService = inject(AppContextService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    // Only initialize apps if they haven't been loaded and aren't currently loading
    // This prevents duplicate API calls when navigating between admin routes
    if (!appContextService.hasApps() && !appContextService.loading()) {
      console.log('Auth guard: Initializing apps for authenticated user');
      appContextService.initialize();
    } else if (appContextService.hasApps()) {
      console.log('Auth guard: Apps already loaded, skipping initialization');
    } else if (appContextService.loading()) {
      console.log('Auth guard: Apps currently loading, skipping duplicate initialization');
    }
    
    return true;
  }
  
  // Redirect to landing page if not authenticated
  router.navigate(['/']);
  return false;
};

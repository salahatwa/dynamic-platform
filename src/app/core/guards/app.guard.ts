import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppContextService } from '../services/app-context.service';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard to ensure user has at least one app and has selected an app
 * Redirects to app creation or selection if needed
 */
export const appGuard: CanActivateFn = (route, state) => {
  const appContext = inject(AppContextService);
  const router = inject(Router);

  // Wait for apps to load if still loading
  if (appContext.loading()) {
    return of(false).pipe(
      map(() => {
        // Check again after loading
        if (!appContext.hasApps()) {
          console.log('No apps found, redirecting to app creation');
          router.navigate(['/admin/apps/create']);
          return false;
        }

        if (!appContext.hasSelectedApp()) {
          console.log('No app selected, redirecting to app selection');
          router.navigate(['/admin/apps']);
          return false;
        }

        return true;
      })
    );
  }

  // Check if user has any apps
  if (!appContext.hasApps()) {
    console.log('No apps found, redirecting to app creation');
    router.navigate(['/admin/apps/create']);
    return false;
  }

  // Check if an app is selected
  if (!appContext.hasSelectedApp()) {
    console.log('No app selected, redirecting to app selection');
    router.navigate(['/admin/apps']);
    return false;
  }

  return true;
};

/**
 * Guard to check if user can create more apps (subscription limit)
 */
export const canCreateAppGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  // This would need to check subscription limits
  // For now, allow access and handle limit in the component
  return true;
};

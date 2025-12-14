import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const storageService = inject(StorageService);
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized (Token expired or invalid)
      if (error.status === 401) {
        console.warn('Token expired or invalid. Redirecting to landing page...');
        
        // Clear user data while preserving UI preferences
        storageService.clearUserData();
        
        // Redirect to landing page
        router.navigate(['/']);
        
        return throwError(() => new Error('Session expired. Please login again.'));
      }
      
      // Handle 403 Forbidden (Access denied)
      if (error.status === 403) {
        // Check if this is an authentication issue or just access denied to a resource
        const errorMessage = error.error?.message || error.message || '';
        
        // Only redirect to login if it's clearly an authentication issue
        if (errorMessage.includes('User not associated') || 
            errorMessage.includes('authentication') || 
            errorMessage.includes('login')) {
          console.warn('Authentication issue. Redirecting to landing page...');
          
          // Clear user data while preserving UI preferences
          storageService.clearUserData();
          
          // Redirect to landing page
          router.navigate(['/']);
          
          return throwError(() => new Error('Session expired. Please login again.'));
        } else {
          // For other 403 errors, just show the error without redirecting
          console.warn('Access denied to resource:', errorMessage);
          return throwError(() => new Error('Access denied. Please check your permissions.'));
        }
      }
      
      // Pass through other errors
      return throwError(() => error);
    })
  );
};

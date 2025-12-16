import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private errorHandler = inject(ErrorHandlerService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only handle errors that should show user notifications
        // Skip certain endpoints or error codes if needed
        if (this.shouldHandleError(error, request)) {
          this.errorHandler.handleHttpError(error, this.getContextFromRequest(request));
        }
        
        // Always re-throw the error so components can still handle it if needed
        return throwError(() => error);
      })
    );
  }

  /**
   * Determine if this error should be handled by the global error handler
   */
  private shouldHandleError(error: HttpErrorResponse, request: HttpRequest<any>): boolean {
    // Skip handling for certain endpoints
    const skipEndpoints = [
      '/api/auth/validate', // Don't show errors for token validation
      '/api/health',        // Don't show errors for health checks
    ];

    const shouldSkip = skipEndpoints.some(endpoint => request.url.includes(endpoint));
    if (shouldSkip) {
      return false;
    }

    // Skip handling for certain status codes that components might handle specifically
    const skipStatusCodes: number[] = [
      // 401, // Uncomment if you want components to handle auth errors specifically
      // 403, // Uncomment if you want components to handle permission errors specifically
    ];

    if (skipStatusCodes.includes(error.status)) {
      return false;
    }

    // Skip if the request has a custom header indicating it should handle errors itself
    if (request.headers.has('X-Skip-Global-Error-Handler')) {
      return false;
    }

    return true;
  }

  /**
   * Extract context information from the HTTP request
   */
  private getContextFromRequest(request: HttpRequest<any>): string | undefined {
    const url = request.url;
    const method = request.method;

    // Map common API patterns to context
    if (url.includes('/api/media/files') && method === 'POST') {
      return 'upload_media';
    }
    if (url.includes('/api/media/files') && method === 'DELETE') {
      return 'delete_media';
    }
    if (url.includes('/api/media/folders') && method === 'POST') {
      return 'create_folder';
    }
    if (url.includes('/api/media/folders') && method === 'DELETE') {
      return 'delete_folder';
    }
    if (url.includes('/api/templates') && method === 'POST') {
      return 'save_template';
    }
    if (url.includes('/api/templates') && method === 'DELETE') {
      return 'delete_template';
    }
    if (url.includes('/api/translations') && method === 'POST') {
      return 'create_translation';
    }
    if (url.includes('/api/translations') && method === 'PUT') {
      return 'update_translation';
    }
    if (url.includes('/api/translations') && method === 'DELETE') {
      return 'delete_translation';
    }
    if (url.includes('/api/lov') && method === 'POST') {
      return 'create_lov';
    }
    if (url.includes('/api/lov') && method === 'PUT') {
      return 'update_lov';
    }
    if (url.includes('/api/lov') && method === 'DELETE') {
      return 'delete_lov';
    }
    if (url.includes('/api/config') && method === 'POST') {
      return 'create_config';
    }
    if (url.includes('/api/config') && method === 'PUT') {
      return 'update_config';
    }
    if (url.includes('/api/config') && method === 'DELETE') {
      return 'delete_config';
    }
    if (url.includes('/api/error-codes') && method === 'POST') {
      return 'create_error_code';
    }
    if (url.includes('/api/error-codes') && method === 'PUT') {
      return 'update_error_code';
    }
    if (url.includes('/api/error-codes') && method === 'DELETE') {
      return 'delete_error_code';
    }
    if (url.includes('/api/users') && method === 'POST') {
      return 'create_user';
    }
    if (url.includes('/api/users') && method === 'PUT') {
      return 'update_user';
    }
    if (url.includes('/api/users') && method === 'DELETE') {
      return 'delete_user';
    }
    if (url.includes('/api/invitations') && method === 'POST') {
      return 'send_invitation';
    }
    if (url.includes('/api/invitations') && method === 'DELETE') {
      return 'cancel_invitation';
    }
    if (url.includes('/api/api-keys') && method === 'POST') {
      return 'create_api_key';
    }
    if (url.includes('/api/api-keys') && method === 'DELETE') {
      return 'delete_api_key';
    }
    if (url.includes('/api/media/storage/test')) {
      return 'storage_provider_test';
    }
    if (url.includes('/api/media/storage') && method === 'POST') {
      return 'storage_provider_save';
    }

    return undefined;
  }
}
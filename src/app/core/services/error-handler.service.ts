import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from './toast.service';
import { TranslationService } from './translation.service';

export interface ErrorCode {
  code: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface ApiError {
  error: {
    code?: string;
    message?: string;
    details?: string;
    timestamp?: string;
    path?: string;
  };
  status?: number;
  statusText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);

  // Error code mappings for user-friendly messages
  private errorCodeMappings: Record<string, ErrorCode> = {
    // Authentication & Authorization
    'AUTH_001': {
      code: 'AUTH_001',
      message: 'errors.auth.invalid_credentials',
      details: 'errors.auth.invalid_credentials_details'
    },
    'AUTH_002': {
      code: 'AUTH_002',
      message: 'errors.auth.session_expired',
      details: 'errors.auth.session_expired_details',
      action: {
        label: 'common.login',
        handler: () => this.redirectToLogin()
      }
    },
    'AUTH_003': {
      code: 'AUTH_003',
      message: 'errors.auth.insufficient_permissions',
      details: 'errors.auth.insufficient_permissions_details'
    },

    // Validation Errors
    'VAL_001': {
      code: 'VAL_001',
      message: 'errors.validation.required_field',
      details: 'errors.validation.required_field_details'
    },
    'VAL_002': {
      code: 'VAL_002',
      message: 'errors.validation.invalid_format',
      details: 'errors.validation.invalid_format_details'
    },
    'VAL_003': {
      code: 'VAL_003',
      message: 'errors.validation.duplicate_entry',
      details: 'errors.validation.duplicate_entry_details'
    },

    // File & Media Errors
    'MEDIA_001': {
      code: 'MEDIA_001',
      message: 'errors.media.file_too_large',
      details: 'errors.media.file_too_large_details'
    },
    'MEDIA_002': {
      code: 'MEDIA_002',
      message: 'errors.media.unsupported_format',
      details: 'errors.media.unsupported_format_details'
    },
    'MEDIA_003': {
      code: 'MEDIA_003',
      message: 'errors.media.upload_failed',
      details: 'errors.media.upload_failed_details'
    },
    'MEDIA_004': {
      code: 'MEDIA_004',
      message: 'errors.media.storage_provider_error',
      details: 'errors.media.storage_provider_error_details'
    },

    // Database Errors
    'DB_001': {
      code: 'DB_001',
      message: 'errors.database.connection_failed',
      details: 'errors.database.connection_failed_details'
    },
    'DB_002': {
      code: 'DB_002',
      message: 'errors.database.constraint_violation',
      details: 'errors.database.constraint_violation_details'
    },

    // Network Errors
    'NET_001': {
      code: 'NET_001',
      message: 'errors.network.connection_timeout',
      details: 'errors.network.connection_timeout_details'
    },
    'NET_002': {
      code: 'NET_002',
      message: 'errors.network.server_unavailable',
      details: 'errors.network.server_unavailable_details'
    },

    // Business Logic Errors
    'BIZ_001': {
      code: 'BIZ_001',
      message: 'errors.business.subscription_limit_exceeded',
      details: 'errors.business.subscription_limit_exceeded_details'
    },
    'BIZ_002': {
      code: 'BIZ_002',
      message: 'errors.business.feature_not_available',
      details: 'errors.business.feature_not_available_details'
    }
  };

  /**
   * Handle any error and display appropriate user message
   */
  handleError(error: any, context?: string): void {
    console.error('Error occurred:', error, 'Context:', context);

    const errorInfo = this.parseError(error);
    const userMessage = this.getUserFriendlyMessage(errorInfo, context);

    this.displayError(userMessage, errorInfo);
  }

  /**
   * Handle HTTP errors specifically
   */
  handleHttpError(error: HttpErrorResponse, context?: string): void {
    console.error('HTTP Error occurred:', error, 'Context:', context);

    const errorInfo = this.parseHttpError(error);
    const userMessage = this.getUserFriendlyMessage(errorInfo, context);

    this.displayError(userMessage, errorInfo);
  }

  /**
   * Parse generic error into structured format
   */
  private parseError(error: any): ErrorCode {
    if (error instanceof HttpErrorResponse) {
      return this.parseHttpError(error);
    }

    // Handle JavaScript errors
    if (error instanceof Error) {
      return {
        code: 'JS_ERROR',
        message: 'errors.generic.unexpected_error',
        details: error.message
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        code: 'STRING_ERROR',
        message: 'errors.generic.operation_failed',
        details: error
      };
    }

    // Handle object errors
    if (error && typeof error === 'object') {
      return {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'errors.generic.unexpected_error',
        details: error.details || error.error?.message || JSON.stringify(error)
      };
    }

    // Fallback for unknown error types
    return {
      code: 'UNKNOWN_ERROR',
      message: 'errors.generic.unexpected_error',
      details: 'errors.generic.contact_support'
    };
  }

  /**
   * Parse HTTP error response
   */
  private parseHttpError(error: HttpErrorResponse): ErrorCode {
    const apiError = error.error as ApiError;
    
    // Check if backend provided a structured error
    if (apiError?.error?.code) {
      const knownError = this.errorCodeMappings[apiError.error.code];
      if (knownError) {
        return {
          ...knownError,
          details: apiError.error.details || knownError.details
        };
      }
    }

    // Handle HTTP status codes
    switch (error.status) {
      case 400:
        return {
          code: 'HTTP_400',
          message: 'errors.http.bad_request',
          details: apiError?.error?.message || 'errors.http.bad_request_details'
        };
      case 401:
        return {
          code: 'HTTP_401',
          message: 'errors.http.unauthorized',
          details: 'errors.http.unauthorized_details',
          action: {
            label: 'common.login',
            handler: () => this.redirectToLogin()
          }
        };
      case 403:
        return {
          code: 'HTTP_403',
          message: 'errors.http.forbidden',
          details: 'errors.http.forbidden_details'
        };
      case 404:
        return {
          code: 'HTTP_404',
          message: 'errors.http.not_found',
          details: 'errors.http.not_found_details'
        };
      case 409:
        return {
          code: 'HTTP_409',
          message: 'errors.http.conflict',
          details: apiError?.error?.message || 'errors.http.conflict_details'
        };
      case 422:
        return {
          code: 'HTTP_422',
          message: 'errors.http.validation_failed',
          details: apiError?.error?.message || 'errors.http.validation_failed_details'
        };
      case 429:
        return {
          code: 'HTTP_429',
          message: 'errors.http.too_many_requests',
          details: 'errors.http.too_many_requests_details'
        };
      case 500:
        return {
          code: 'HTTP_500',
          message: 'errors.http.internal_server_error',
          details: 'errors.http.internal_server_error_details'
        };
      case 502:
        return {
          code: 'HTTP_502',
          message: 'errors.http.bad_gateway',
          details: 'errors.http.bad_gateway_details'
        };
      case 503:
        return {
          code: 'HTTP_503',
          message: 'errors.http.service_unavailable',
          details: 'errors.http.service_unavailable_details'
        };
      case 504:
        return {
          code: 'HTTP_504',
          message: 'errors.http.gateway_timeout',
          details: 'errors.http.gateway_timeout_details'
        };
      default:
        return {
          code: `HTTP_${error.status}`,
          message: 'errors.http.unknown_error',
          details: apiError?.error?.message || error.message || 'errors.http.unknown_error_details'
        };
    }
  }

  /**
   * Get user-friendly message with context
   */
  private getUserFriendlyMessage(errorInfo: ErrorCode, context?: string): ErrorCode {
    const translatedMessage = this.translationService.translate(errorInfo.message);
    const translatedDetails = errorInfo.details ? this.translationService.translate(errorInfo.details) : undefined;

    let contextualMessage = translatedMessage;
    if (context) {
      const contextKey = `errors.context.${context}`;
      const contextTranslation = this.translationService.translate(contextKey);
      if (contextTranslation !== contextKey) {
        contextualMessage = `${contextTranslation}: ${translatedMessage}`;
      }
    }

    return {
      ...errorInfo,
      message: contextualMessage,
      details: translatedDetails,
      action: errorInfo.action ? {
        ...errorInfo.action,
        label: this.translationService.translate(errorInfo.action.label)
      } : undefined
    };
  }

  /**
   * Display error using toast service
   */
  private displayError(errorInfo: ErrorCode, originalError: ErrorCode): void {
    this.toastService.error(
      errorInfo.message,
      errorInfo.details,
      {
        duration: 8000,
        action: errorInfo.action
      }
    );
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    // Clear any stored tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Register custom error code mapping
   */
  registerErrorCode(code: string, errorInfo: Omit<ErrorCode, 'code'>): void {
    this.errorCodeMappings[code] = {
      code,
      ...errorInfo
    };
  }

  /**
   * Handle operation-specific errors with context
   */
  handleOperationError(operation: string, entity: string, error: any): void {
    const context = `${operation}_${entity}`.toLowerCase();
    this.handleError(error, context);
  }

  /**
   * Show validation errors for forms
   */
  handleValidationErrors(errors: Record<string, string[]>): void {
    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach(message => {
        this.toastService.error(
          this.translationService.translate('errors.validation.field_error').replace('{{field}}', field),
          message,
          { duration: 6000 }
        );
      });
    });
  }
}
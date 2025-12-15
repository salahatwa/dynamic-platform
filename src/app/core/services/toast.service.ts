import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  
  // Public readonly signal
  toasts$ = this.toasts.asReadonly();

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private addToast(toast: Omit<Toast, 'id'>): string {
    const id = this.generateId();
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast
    };

    this.toasts.update(toasts => [...toasts, newToast]);

    // Auto-remove after duration (unless persistent)
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }

    return id;
  }

  success(title: string, message?: string, options?: Partial<Toast>): string {
    return this.addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  error(title: string, message?: string, options?: Partial<Toast>): string {
    return this.addToast({
      type: 'error',
      title,
      message,
      duration: 8000, // Errors stay longer
      ...options
    });
  }

  warning(title: string, message?: string, options?: Partial<Toast>): string {
    return this.addToast({
      type: 'warning',
      title,
      message,
      duration: 6000,
      ...options
    });
  }

  info(title: string, message?: string, options?: Partial<Toast>): string {
    return this.addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  remove(id: string): void {
    this.toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  // Convenience methods for common operations
  operationSuccess(operation: string, entity: string): string {
    return this.success(
      `${entity} ${operation}`,
      `The ${entity.toLowerCase()} has been ${operation.toLowerCase()} successfully.`
    );
  }

  operationError(operation: string, entity: string, error?: any): string {
    const errorMessage = error?.error?.message || error?.message || 'An unexpected error occurred.';
    return this.error(
      `Failed to ${operation.toLowerCase()} ${entity.toLowerCase()}`,
      errorMessage
    );
  }
}
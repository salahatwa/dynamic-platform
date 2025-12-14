import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-alert',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (visible) {
      <div [class]="alertClasses" role="alert">
        <div class="alert-content">
          <div class="alert-icon">
            @switch (variant) {
              @case ('success') {
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
              @case ('danger') {
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
              @case ('warning') {
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              }
              @case ('info') {
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            }
          </div>
          
          <div class="alert-body">
            @if (title) {
              <h4 class="alert-title">{{ title }}</h4>
            }
            <div class="alert-message">
              <ng-content></ng-content>
            </div>
          </div>
          
          @if (dismissible) {
            <button class="alert-close" (click)="close()" aria-label="Close">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          }
        </div>
      </div>
    }
  `,
    styles: [`
    div[role="alert"] {
      padding: 1rem 1.25rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alert-content {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .alert-icon {
      flex-shrink: 0;
      display: flex;
    }

    .alert-body {
      flex: 1;
    }

    .alert-title {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .alert-message {
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .alert-close {
      flex-shrink: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      border-radius: var(--radius-xs);
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alert-close:hover {
      opacity: 0.7;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.1);
      border-color: var(--success);
      color: var(--success);
    }

    .alert-danger {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--danger);
      color: var(--danger);
    }

    .alert-warning {
      background: rgba(245, 158, 11, 0.1);
      border-color: var(--warning);
      color: var(--warning);
    }

    .alert-info {
      background: rgba(59, 130, 246, 0.1);
      border-color: var(--info);
      color: var(--info);
    }

    [data-theme="dark"] .alert-success {
      background: rgba(16, 185, 129, 0.15);
    }

    [data-theme="dark"] .alert-danger {
      background: rgba(239, 68, 68, 0.15);
    }

    [data-theme="dark"] .alert-warning {
      background: rgba(245, 158, 11, 0.15);
    }

    [data-theme="dark"] .alert-info {
      background: rgba(59, 130, 246, 0.15);
    }
  `]
})
export class AlertComponent {
    @Input() variant: 'success' | 'danger' | 'warning' | 'info' = 'info';
    @Input() title: string = '';
    @Input() dismissible: boolean = false;
    @Input() visible: boolean = true;

    @Output() dismissed = new EventEmitter<void>();

    get alertClasses(): string {
        return `alert-${this.variant}`;
    }

    close() {
        this.visible = false;
        this.dismissed.emit();
    }
}

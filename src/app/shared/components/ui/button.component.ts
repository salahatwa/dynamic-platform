import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)"
    >
      @if (loading) {
        <span class="spinner"></span>
      } @else if (icon) {
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="icon"></svg>
      }
      <ng-content></ng-content>
    </button>
  `,
    styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: var(--transition);
      white-space: nowrap;
      font-family: inherit;
      position: relative;
      overflow: hidden;
    }

    button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    button:hover::before {
      width: 300px;
      height: 300px;
    }

    button:active {
      transform: scale(0.98);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    .btn-primary {
      background: var(--gradient-primary);
      color: white;
      box-shadow: var(--shadow-primary);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px -5px rgba(99, 102, 241, 0.4);
    }

    .btn-secondary {
      background: var(--gradient-secondary);
      color: white;
      box-shadow: var(--shadow-secondary);
    }

    .btn-secondary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px -5px rgba(139, 92, 246, 0.4);
    }

    .btn-outline {
      background: transparent;
      border: 2px solid var(--border);
      color: var(--text);
    }

    .btn-outline:hover:not(:disabled) {
      background: var(--surface);
      border-color: var(--primary);
      color: var(--primary);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text);
    }

    .btn-ghost:hover:not(:disabled) {
      background: var(--surface-hover);
    }

    .btn-success {
      background: var(--gradient-success);
      color: white;
      box-shadow: 0 10px 30px -5px rgba(16, 185, 129, 0.3);
    }

    .btn-success:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.4);
    }

    .btn-danger {
      background: linear-gradient(135deg, var(--danger) 0%, var(--danger-light) 100%);
      color: white;
      box-shadow: 0 10px 30px -5px rgba(239, 68, 68, 0.3);
    }

    .btn-danger:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px -5px rgba(239, 68, 68, 0.4);
    }

    .btn-warning {
      background: linear-gradient(135deg, var(--warning) 0%, var(--warning-light) 100%);
      color: white;
      box-shadow: 0 10px 30px -5px rgba(245, 158, 11, 0.3);
    }

    .btn-warning:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px -5px rgba(245, 158, 11, 0.4);
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1rem;
      border-radius: var(--radius);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
    }

    .btn-xs {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .btn-icon {
      padding: 0.75rem;
      aspect-ratio: 1;
    }

    .btn-icon.btn-sm {
      padding: 0.5rem;
    }

    .btn-icon.btn-lg {
      padding: 1rem;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    button * {
      position: relative;
      z-index: 1;
    }
  `]
})
export class ButtonComponent {
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'warning' = 'primary';
    @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
    @Input() disabled: boolean = false;
    @Input() loading: boolean = false;
    @Input() icon: string = '';
    @Input() iconOnly: boolean = false;

    get buttonClasses(): string {
        const classes = [
            `btn-${this.variant}`,
            this.size !== 'md' ? `btn-${this.size}` : '',
            this.iconOnly ? 'btn-icon' : ''
        ];
        return classes.filter(c => c).join(' ');
    }

    handleClick(event: Event) {
        if (this.disabled || this.loading) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}

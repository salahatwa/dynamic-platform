import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-badge',
    standalone: true,
    imports: [CommonModule],
    template: `
    <span [class]="badgeClasses">
      <ng-content></ng-content>
    </span>
  `,
    styles: [`
    span {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }

    .badge-primary {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
    }

    .badge-secondary {
      background: rgba(139, 92, 246, 0.1);
      color: var(--secondary);
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning);
    }

    .badge-info {
      background: rgba(59, 130, 246, 0.1);
      color: var(--info);
    }

    .badge-outline-primary {
      background: transparent;
      border: 1px solid var(--primary);
      color: var(--primary);
    }

    .badge-outline-success {
      background: transparent;
      border: 1px solid var(--success);
      color: var(--success);
    }

    .badge-outline-danger {
      background: transparent;
      border: 1px solid var(--danger);
      color: var(--danger);
    }

    .badge-sm {
      padding: 0.125rem 0.5rem;
      font-size: 0.625rem;
    }

    .badge-lg {
      padding: 0.375rem 1rem;
      font-size: 0.875rem;
    }
  `]
})
export class BadgeComponent {
    @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline-primary' | 'outline-success' | 'outline-danger' = 'primary';
    @Input() size: 'sm' | 'md' | 'lg' = 'md';

    get badgeClasses(): string {
        const classes = [
            `badge-${this.variant}`,
            this.size !== 'md' ? `badge-${this.size}` : ''
        ];
        return classes.filter(c => c).join(' ');
    }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card" [class]="'stat-' + variant">
      <div class="stat-icon">
        <ng-content select="[icon]"></ng-content>
      </div>
      <div class="stat-content">
        <div class="stat-label">{{ label }}</div>
        <div class="stat-value">{{ value }}</div>
        @if (change) {
          <div class="stat-change" [class.positive]="changeType === 'positive'" [class.negative]="changeType === 'negative'">
            @if (changeType === 'positive') {
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
            } @else {
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            }
            <span>{{ change }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--surface);
      border-radius: var(--radius);
      padding: 1.5rem;
      display: flex;
      gap: 1.25rem;
      border: 1px solid var(--border);
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      color: var(--primary);
      flex-shrink: 0;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .stat-change {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.813rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .stat-change.positive {
      color: var(--success);
      background: rgba(16, 185, 129, 0.1);
    }

    .stat-change.negative {
      color: var(--danger);
      background: rgba(239, 68, 68, 0.1);
    }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() change?: string;
  @Input() changeType: 'positive' | 'negative' = 'positive';
  @Input() variant: 'primary' | 'success' | 'warning' | 'info' = 'primary';
}

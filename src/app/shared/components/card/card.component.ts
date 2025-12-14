import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.hoverable]="hoverable">
      @if (title) {
        <div class="card-header">
          <h3 class="card-title">{{ title }}</h3>
          @if (subtitle) {
            <p class="card-subtitle">{{ subtitle }}</p>
          }
        </div>
      }
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      @if (hasFooter) {
        <div class="card-footer">
          <ng-content select="[footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .card-header {
      padding: 1.5rem 1.5rem 0;
    }
    
    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin: 0;
    }
    
    .card-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0.5rem 0 0;
    }
    
    .card-footer {
      padding: 0 1.5rem 1.5rem;
      border-top: 1px solid var(--border);
      margin-top: 1rem;
      padding-top: 1rem;
    }
    
    .hoverable {
      cursor: pointer;
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() hoverable = false;
  @Input() hasFooter = false;
}

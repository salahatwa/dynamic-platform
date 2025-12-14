import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppContextService } from '../../../core/services/app-context.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { App } from '../../../core/models/app.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  template: `
    <div class="app-selector" [class.rtl]="isRTL()">
      @if (appContext.hasApps()) {
        <div class="app-display-container">
          @if (appContext.selectedApp(); as app) {
            <div class="selected-app-display">
              <div class="app-icon">
                @if (app.iconUrl) {
                  <img [src]="app.iconUrl" [alt]="app.name" />
                } @else {
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 002 2zM9 9h6v6H9V9z"/>
                  </svg>
                }
              </div>
              <div class="app-info">
                <span class="app-name">{{ app.name }}</span>
              </div>
            </div>
            <div class="app-key-display">
              <div class="key-icon">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span class="app-key">{{ app.appKey }}</span>
            </div>
          } @else {
            <div class="no-app-selected">
              <span class="no-selection">{{ 'apps.selectApp' | translate }}</span>
              <a routerLink="/admin/apps" class="select-app-link">
                {{ 'apps.selectFromList' | translate }}
              </a>
            </div>
          }
        </div>
      } @else {
        <a routerLink="/admin/apps/create" class="create-first-app">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>{{ 'apps.createFirst' | translate }}</span>
        </a>
      }
    </div>
  `,
  styles: [`
    .app-selector {
      position: relative;
    }

    .app-display-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
    }

    .selected-app-display {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      min-width: 200px;
    }

    .app-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: white;
    }

    .app-icon img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: cover;
    }

    .app-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
      flex: 1;
    }

    .app-name {
      font-weight: 600;
      font-size: 1rem;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-key-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--surface-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      min-width: 200px;
    }

    .key-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      flex-shrink: 0;
    }

    .app-key {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-family: 'Courier New', monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .no-app-selected {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    .no-selection {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .select-app-link {
      color: var(--primary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .select-app-link:hover {
      background: rgba(99, 102, 241, 0.1);
    }

    .create-first-app {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--primary);
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .create-first-app:hover {
      background: var(--primary-dark);
      transform: translateY(-1px);
    }

    /* RTL Support */
    .rtl .app-display-container {
      flex-direction: row-reverse;
    }

    .rtl .selected-app-display {
      flex-direction: row-reverse;
    }

    .rtl .app-key-display {
      flex-direction: row-reverse;
    }

    .rtl .no-app-selected {
      flex-direction: row-reverse;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .app-display-container {
        flex-direction: column;
        gap: 0.5rem;
        align-items: stretch;
      }

      .selected-app-display,
      .app-key-display {
        min-width: auto;
        width: 100%;
      }

      .rtl .app-display-container {
        flex-direction: column;
      }
    }
  `]
})
export class AppSelectorComponent {
  appContext = inject(AppContextService);
  private subscriptionService = inject(SubscriptionService);

  maxApps = signal<number | string>('∞');
  canCreateApp = signal(true);
  isRTL = signal(document.documentElement.dir === 'rtl');

  constructor() {
    // Load subscription limits
    this.loadLimits();
  }

  private loadLimits(): void {
    this.subscriptionService.getUsageLimits().subscribe({
      next: (limits) => {
        this.maxApps.set(limits.subscription.isUnlimitedApps ? '∞' : limits.subscription.maxApps);
        this.canCreateApp.set(limits.canCreateApp);
      },
      error: (error) => {
        console.error('Error loading subscription limits:', error);
      }
    });
  }
}
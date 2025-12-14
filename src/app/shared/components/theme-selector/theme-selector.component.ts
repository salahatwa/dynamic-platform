import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-selector">
      <div class="theme-toggle">
        <button 
          class="mode-btn" 
          [class.active]="currentMode === 'light'"
          (click)="setMode('light')"
          title="Light Mode">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
        <button 
          class="mode-btn" 
          [class.active]="currentMode === 'dark'"
          (click)="setMode('dark')"
          title="Dark Mode">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
      
      <div class="theme-dropdown" *ngIf="availableThemes">
        <select 
          class="theme-select" 
          [value]="currentTheme" 
          (change)="setTheme($event)">
          <option *ngFor="let theme of getThemeEntries()" [value]="theme.key">
            {{ theme.value.name }}
          </option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .theme-selector {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .theme-toggle {
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 2px;
      gap: 2px;
    }

    .mode-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .mode-btn:hover {
      background: var(--surface-hover);
      color: var(--text);
    }

    .mode-btn.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .theme-select {
      padding: 0.5rem 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      min-width: 140px;
    }

    .theme-select:hover {
      border-color: var(--primary);
    }

    .theme-select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
    }

    .theme-select option {
      background: var(--surface);
      color: var(--text);
    }
  `]
})
export class ThemeSelectorComponent implements OnInit {
  private themeService = inject(ThemeService);
  
  currentTheme = '';
  currentMode: 'light' | 'dark' = 'light';
  availableThemes: { [key: string]: Theme } | null = null;

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });

    this.themeService.currentMode$.subscribe(mode => {
      this.currentMode = mode;
    });

    // Get available themes
    this.availableThemes = this.themeService.availableThemes;
  }

  setTheme(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.themeService.setTheme(target.value);
  }

  setMode(mode: 'light' | 'dark') {
    this.themeService.setMode(mode);
  }

  getThemeEntries() {
    if (!this.availableThemes) return [];
    return Object.entries(this.availableThemes).map(([key, value]) => ({ key, value }));
  }
}
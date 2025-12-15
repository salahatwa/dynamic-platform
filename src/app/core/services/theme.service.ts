import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  accent: string;
  light: {
    background: string;
    surface: string;
    surfaceHover: string;
    surfaceElevated: string;
    border: string;
    borderLight: string;
    borderFocus: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
  };
  dark: {
    background: string;
    surface: string;
    surfaceHover: string;
    surfaceElevated: string;
    border: string;
    borderLight: string;
    borderFocus: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
  };
}

export interface Theme {
  name: string;
  description: string;
  colors: ThemeColors;
}

export interface ThemeConfig {
  themes: { [key: string]: Theme };
  activeTheme: string;
  defaultMode: 'light' | 'dark';
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeConfig: ThemeConfig | null = null;
  private currentTheme = new BehaviorSubject<string>('modern-saas');
  private currentMode = new BehaviorSubject<'light' | 'dark'>('light');

  constructor(private http: HttpClient) {
    this.loadThemeConfig();
    this.initializeTheme();
  }

  private async loadThemeConfig(): Promise<void> {
    try {
      const config = await this.http.get<ThemeConfig>('./assets/config/theme-settings.json').toPromise();
      this.themeConfig = config || null;
      if (this.themeConfig) {
        // Check for saved preferences first, then fall back to config defaults
        const savedTheme = localStorage.getItem('selected-theme');
        const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark';
        
        const themeName = savedTheme || this.themeConfig.activeTheme;
        const mode = savedMode || this.themeConfig.defaultMode;
        
        console.log('Loading theme:', { themeName, mode, savedTheme, savedMode });
        
        this.currentTheme.next(themeName);
        this.currentMode.next(mode);
        this.applyTheme(themeName, mode);
      }
    } catch (error) {
      console.error('Failed to load theme configuration:', error);
      // Even if config fails, try to apply saved preferences
      this.initializeSavedTheme();
    }
  }

  private initializeTheme(): void {
    // Listen for system theme changes (only if no saved preference)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme-mode')) {
        const mode = e.matches ? 'dark' : 'light';
        console.log('System theme changed to:', mode);
        this.currentMode.next(mode);
        this.applyTheme(this.currentTheme.value, mode);
      }
    });
  }

  private initializeSavedTheme(): void {
    // Fallback method to initialize saved theme when config loading fails
    const savedTheme = localStorage.getItem('selected-theme');
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark';
    
    console.log('Initializing saved theme (fallback):', { savedTheme, savedMode });
    
    if (savedTheme) {
      this.currentTheme.next(savedTheme);
    }
    
    if (savedMode) {
      this.currentMode.next(savedMode);
    } else {
      // Check system preference for dark mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const mode = prefersDark ? 'dark' : 'light';
      this.currentMode.next(mode);
    }
    
    // Apply fallback theme with saved/detected mode
    this.applyDefaultTheme();
  }

  public setTheme(themeName: string): void {
    if (this.themeConfig && this.themeConfig.themes[themeName]) {
      this.currentTheme.next(themeName);
      localStorage.setItem('selected-theme', themeName);
      this.applyTheme(themeName, this.currentMode.value);
    }
  }

  public setMode(mode: 'light' | 'dark'): void {
    this.currentMode.next(mode);
    localStorage.setItem('theme-mode', mode);
    this.applyTheme(this.currentTheme.value, mode);
  }

  public toggleMode(): void {
    const newMode = this.currentMode.value === 'light' ? 'dark' : 'light';
    this.setMode(newMode);
  }

  private applyTheme(themeName: string, mode: 'light' | 'dark'): void {
    if (!this.themeConfig || !this.themeConfig.themes[themeName]) {
      return;
    }

    const theme = this.themeConfig.themes[themeName];
    const colors = theme.colors;
    const modeColors = colors[mode];

    // Apply CSS custom properties to root
    const root = document.documentElement;
    
    // Common colors
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-hover', colors.primaryHover);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--danger', colors.danger);
    root.style.setProperty('--warning', colors.warning);
    root.style.setProperty('--accent', colors.accent);

    // Mode-specific colors
    root.style.setProperty('--background', modeColors.background);
    root.style.setProperty('--surface', modeColors.surface);
    root.style.setProperty('--surface-hover', modeColors.surfaceHover);
    root.style.setProperty('--surface-elevated', modeColors.surfaceElevated);
    root.style.setProperty('--border', modeColors.border);
    root.style.setProperty('--border-light', modeColors.borderLight);
    root.style.setProperty('--border-focus', modeColors.borderFocus);
    root.style.setProperty('--text', modeColors.text);
    root.style.setProperty('--text-secondary', modeColors.textSecondary);
    root.style.setProperty('--text-muted', modeColors.textMuted);
    root.style.setProperty('--text-inverse', modeColors.textInverse);

    // Set data attribute for theme-specific CSS
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-theme-name', themeName);

    // Generate shadow colors based on text color
    const shadowColor = mode === 'dark' ? '0, 0, 0' : this.hexToRgb(modeColors.text);
    root.style.setProperty('--shadow', `0 1px 3px 0 rgba(${shadowColor}, 0.1)`);
    root.style.setProperty('--shadow-md', `0 4px 6px -1px rgba(${shadowColor}, 0.1)`);
    root.style.setProperty('--shadow-lg', `0 10px 15px -3px rgba(${shadowColor}, 0.1)`);
  }

  private applyDefaultTheme(): void {
    // Fallback theme if config fails to load
    const root = document.documentElement;
    const mode = this.currentMode.value;
    
    console.log('Applying default theme with mode:', mode);
    
    // Common colors
    root.style.setProperty('--primary', '#6C63FF');
    root.style.setProperty('--primary-hover', '#5A52E6');
    root.style.setProperty('--secondary', '#8B5CF6');
    root.style.setProperty('--success', '#10B981');
    root.style.setProperty('--danger', '#EF4444');
    root.style.setProperty('--warning', '#F59E0B');
    root.style.setProperty('--accent', '#EC4899');
    
    // Mode-specific colors
    if (mode === 'dark') {
      root.style.setProperty('--background', '#0F172A');
      root.style.setProperty('--surface', '#1E293B');
      root.style.setProperty('--surface-hover', '#334155');
      root.style.setProperty('--surface-elevated', '#475569');
      root.style.setProperty('--border', '#475569');
      root.style.setProperty('--border-light', '#64748B');
      root.style.setProperty('--border-focus', '#6C63FF');
      root.style.setProperty('--text', '#F8FAFC');
      root.style.setProperty('--text-secondary', '#CBD5E1');
      root.style.setProperty('--text-muted', '#94A3B8');
      root.style.setProperty('--text-inverse', '#0F172A');
    } else {
      root.style.setProperty('--background', '#F8FAFC');
      root.style.setProperty('--surface', '#FFFFFF');
      root.style.setProperty('--surface-hover', '#F1F5F9');
      root.style.setProperty('--surface-elevated', '#E2E8F0');
      root.style.setProperty('--border', '#E2E8F0');
      root.style.setProperty('--border-light', '#F1F5F9');
      root.style.setProperty('--border-focus', '#6C63FF');
      root.style.setProperty('--text', '#0F172A');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#64748B');
      root.style.setProperty('--text-inverse', '#F8FAFC');
    }
    
    // Set data attributes
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-theme-name', 'default');
    
    // Generate shadows
    const shadowColor = mode === 'dark' ? '0, 0, 0' : '15, 23, 42';
    root.style.setProperty('--shadow', `0 1px 3px 0 rgba(${shadowColor}, 0.1)`);
    root.style.setProperty('--shadow-md', `0 4px 6px -1px rgba(${shadowColor}, 0.1)`);
    root.style.setProperty('--shadow-lg', `0 10px 15px -3px rgba(${shadowColor}, 0.1)`);
  }

  private hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r}, ${g}, ${b}`;
    }
    return '0, 0, 0';
  }

  // Observables for components to subscribe to
  public get currentTheme$(): Observable<string> {
    return this.currentTheme.asObservable();
  }

  public get currentMode$(): Observable<'light' | 'dark'> {
    return this.currentMode.asObservable();
  }

  public get availableThemes(): { [key: string]: Theme } | null {
    return this.themeConfig?.themes || null;
  }

  public getCurrentTheme(): string {
    return this.currentTheme.value;
  }

  public getCurrentMode(): 'light' | 'dark' {
    return this.currentMode.value;
  }

  // Public getters for template access
  public get isDarkMode(): boolean {
    return this.currentMode.value === 'dark';
  }

  public get isLightMode(): boolean {
    return this.currentMode.value === 'light';
  }

  // Force re-initialization (useful for debugging)
  public forceReload(): void {
    console.log('Force reloading theme service...');
    const savedTheme = localStorage.getItem('selected-theme');
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark';
    
    console.log('Current saved values:', { savedTheme, savedMode });
    console.log('Current service state:', { 
      theme: this.currentTheme.value, 
      mode: this.currentMode.value 
    });
    
    if (savedMode) {
      this.currentMode.next(savedMode);
    }
    
    if (savedTheme) {
      this.currentTheme.next(savedTheme);
    }
    
    // Re-apply theme
    if (this.themeConfig && savedTheme && this.themeConfig.themes[savedTheme]) {
      this.applyTheme(savedTheme, savedMode || 'light');
    } else {
      this.applyDefaultTheme();
    }
  }
}
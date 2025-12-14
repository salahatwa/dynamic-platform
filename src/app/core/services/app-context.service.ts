import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '../models/app.model';
import { AppService } from './app.service';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppContextService {
  private appService = inject(AppService);
  private router = inject(Router);

  // Signals for reactive state management
  private selectedAppSignal = signal<App | null>(null);
  private appsSignal = signal<App[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  selectedApp = this.selectedAppSignal.asReadonly();
  apps = this.appsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed signals
  hasApps = computed(() => this.apps().length > 0);
  hasSelectedApp = computed(() => this.selectedApp() !== null);
  activeApps = computed(() => this.apps().filter(app => app.status === 'ACTIVE'));
  archivedApps = computed(() => this.apps().filter(app => app.status === 'ARCHIVED'));

  private readonly STORAGE_KEY = 'selectedAppId';

  constructor() {
    // Don't auto-load apps in constructor to avoid authentication timing issues
    // Apps will be loaded when authentication is confirmed
    
    // Effect to persist selected app to localStorage
    effect(() => {
      const app = this.selectedApp();
      if (app) {
        localStorage.setItem(this.STORAGE_KEY, app.id.toString());
        console.log('Saved selected app to localStorage:', app.id);
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('Removed selected app from localStorage');
      }
    });
  }

  /**
   * Load all apps for the user
   */
  loadApps(): void {
    console.log('Loading apps for current user...');
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Clear any existing app data before loading new data
    this.appsSignal.set([]);
    this.selectedAppSignal.set(null);

    this.appService.getActiveApps().pipe(
      tap(apps => {
        console.log('Loaded apps for current user:', apps);
        console.log('Number of apps loaded:', apps.length);
        
        // Log corporate IDs for debugging
        const corporateIds = [...new Set(apps.map(app => app.corporateId))];
        console.log('Corporate IDs in loaded apps:', corporateIds);
        
        this.appsSignal.set(apps);
        this.loadingSignal.set(false);

        // Always try to restore or auto-select app when apps are loaded
        this.restoreOrAutoSelectApp(apps);
      }),
      catchError(error => {
        console.error('Error loading apps:', error);
        this.errorSignal.set('Failed to load applications');
        this.loadingSignal.set(false);
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Restore saved app or auto-select first app
   */
  private restoreOrAutoSelectApp(apps: App[]): void {
    if (apps.length === 0) {
      console.log('No apps available to select');
      return;
    }

    const savedAppId = localStorage.getItem(this.STORAGE_KEY);
    console.log('Attempting to restore saved app ID:', savedAppId);
    
    if (savedAppId) {
      const savedApp = apps.find(app => app.id === parseInt(savedAppId));
      if (savedApp) {
        console.log('Restored saved app:', savedApp.name);
        this.selectApp(savedApp);
        return;
      } else {
        console.log('Saved app not found in current apps list, clearing localStorage');
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }

    // Select first app if no saved selection or saved app not found
    console.log('Auto-selecting first app:', apps[0].name);
    this.selectApp(apps[0]);
  }



  /**
   * Select an app
   */
  selectApp(app: App): void {
    const previousApp = this.selectedApp();
    console.log('Selecting app:', app.name, '(ID:', app.id + ')');
    
    if (previousApp?.id === app.id) {
      console.log('App already selected, skipping');
      return;
    }

    this.selectedAppSignal.set(app);
    
    // Emit event for other components to react
    window.dispatchEvent(new CustomEvent('appChanged', { 
      detail: { 
        app, 
        previousApp 
      } 
    }));
    
    console.log('App selection changed from', previousApp?.name || 'none', 'to', app.name);
  }

  /**
   * Clear selected app
   */
  clearSelectedApp(): void {
    this.selectedAppSignal.set(null);
  }

  /**
   * Refresh apps list
   */
  refreshApps(): void {
    this.loadApps();
  }

  /**
   * Add new app to the list
   */
  addApp(app: App): void {
    const currentApps = this.apps();
    this.appsSignal.set([...currentApps, app]);
    
    // Auto-select the new app
    this.selectApp(app);
  }

  /**
   * Update app in the list
   */
  updateApp(updatedApp: App): void {
    const currentApps = this.apps();
    const index = currentApps.findIndex(app => app.id === updatedApp.id);
    
    if (index !== -1) {
      const newApps = [...currentApps];
      newApps[index] = updatedApp;
      this.appsSignal.set(newApps);

      // Update selected app if it's the one being updated
      if (this.selectedApp()?.id === updatedApp.id) {
        this.selectedAppSignal.set(updatedApp);
      }
    }
  }

  /**
   * Remove app from the list
   */
  removeApp(appId: number): void {
    const currentApps = this.apps();
    const newApps = currentApps.filter(app => app.id !== appId);
    this.appsSignal.set(newApps);

    // Clear selection if removed app was selected
    if (this.selectedApp()?.id === appId) {
      this.clearSelectedApp();
      
      // Auto-select first app if available
      if (newApps.length > 0) {
        this.selectApp(newApps[0]);
      }
    }
  }

  /**
   * Get app by ID
   */
  getAppById(id: number): App | undefined {
    return this.apps().find(app => app.id === id);
  }

  /**
   * Check if user has any apps
   */
  checkHasApps(): boolean {
    return this.hasApps();
  }

  /**
   * Navigate to app creation if no apps
   */
  navigateToAppCreationIfNeeded(): void {
    if (!this.hasApps()) {
      this.router.navigate(['/admin/apps/create']);
    }
  }

  /**
   * Manually restore selected app from localStorage
   */
  restoreSelectedApp(): void {
    const apps = this.apps();
    if (apps.length > 0) {
      this.restoreOrAutoSelectApp(apps);
    }
  }

  /**
   * Get the saved app ID from localStorage
   */
  getSavedAppId(): number | null {
    const savedAppId = localStorage.getItem(this.STORAGE_KEY);
    return savedAppId ? parseInt(savedAppId) : null;
  }

  /**
   * Initialize apps when authentication is ready
   */
  initialize(): void {
    console.log('Initializing AppContextService...');
    this.loadApps();
  }

  /**
   * Reset state (useful for logout)
   */
  reset(): void {
    console.log('Resetting AppContextService state');
    this.selectedAppSignal.set(null);
    this.appsSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    
    // Clear any cached app data that might persist across sessions
    this.clearAppCache();
  }

  /**
   * Clear all app-related cache data
   */
  private clearAppCache(): void {
    // Remove any app-related localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('app_') || key.includes('App') || key === 'selectedAppId')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('Clearing cached app data:', key);
      localStorage.removeItem(key);
    });
  }
}

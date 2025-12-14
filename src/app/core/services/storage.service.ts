import { Injectable } from '@angular/core';

/**
 * Service for managing localStorage with selective clearing capabilities
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  
  // Keys that should be preserved during logout
  private readonly PRESERVED_KEYS = [
    'language',           // User's language preference
    'selected-theme',     // User's theme preference
    'theme-mode'          // Light/dark mode preference
  ];
  
  // Keys that should be cleared during logout
  private readonly USER_DATA_KEYS = [
    'token',              // Authentication token
    'selectedAppId',      // Currently selected app
    // App-specific language data (dynamic keys)
  ];
  
  /**
   * Clear all user-specific data while preserving UI preferences
   */
  clearUserData(): void {
    console.log('Clearing user data from localStorage...');
    
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    
    // Clear specific user data keys
    this.USER_DATA_KEYS.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Cleared: ${key}`);
      }
    });
    
    // Clear app-specific language data (keys like "app_123_languages")
    allKeys.forEach(key => {
      if (key.startsWith('app_') && key.endsWith('_languages')) {
        localStorage.removeItem(key);
        console.log(`Cleared app-specific data: ${key}`);
      }
    });
    
    console.log('User data cleared. Preserved keys:', this.PRESERVED_KEYS);
  }
  
  /**
   * Clear all localStorage data (complete reset)
   */
  clearAll(): void {
    console.log('Clearing all localStorage data...');
    localStorage.clear();
  }
  
  /**
   * Get preserved settings that should survive logout
   */
  getPreservedSettings(): { [key: string]: string | null } {
    const preserved: { [key: string]: string | null } = {};
    
    this.PRESERVED_KEYS.forEach(key => {
      preserved[key] = localStorage.getItem(key);
    });
    
    return preserved;
  }
  
  /**
   * Restore preserved settings after a complete clear
   */
  restorePreservedSettings(settings: { [key: string]: string | null }): void {
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== null && this.PRESERVED_KEYS.includes(key)) {
        localStorage.setItem(key, value);
      }
    });
  }
  
  /**
   * Check if a key should be preserved during logout
   */
  isPreservedKey(key: string): boolean {
    return this.PRESERVED_KEYS.includes(key);
  }
  
  /**
   * Get all current localStorage keys for debugging
   */
  getAllKeys(): string[] {
    return Object.keys(localStorage);
  }
  
  /**
   * Get storage summary for debugging
   */
  getStorageSummary(): {
    total: number;
    preserved: string[];
    userData: string[];
    appSpecific: string[];
    other: string[];
  } {
    const allKeys = this.getAllKeys();
    
    const preserved = allKeys.filter(key => this.PRESERVED_KEYS.includes(key));
    const userData = allKeys.filter(key => this.USER_DATA_KEYS.includes(key));
    const appSpecific = allKeys.filter(key => key.startsWith('app_') && key.endsWith('_languages'));
    const other = allKeys.filter(key => 
      !this.PRESERVED_KEYS.includes(key) && 
      !this.USER_DATA_KEYS.includes(key) &&
      !(key.startsWith('app_') && key.endsWith('_languages'))
    );
    
    return {
      total: allKeys.length,
      preserved,
      userData,
      appSpecific,
      other
    };
  }
}
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TemplateFolder, Template } from '../models/template.model';
import { FolderTreeNode, FolderContent } from './folder.service';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated memory size in bytes
}

export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  maxAge: number; // Maximum age in milliseconds
  maxEntries: number; // Maximum number of entries
  cleanupInterval: number; // Cleanup interval in milliseconds
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  oldestEntry: number;
  newestEntry: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private readonly DEFAULT_CONFIG: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxAge: 30 * 60 * 1000, // 30 minutes
    maxEntries: 1000,
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
  };

  private config: CacheConfig;
  
  // Cache storage
  private folderTreeCache = new Map<string, CacheEntry<FolderTreeNode>>();
  private folderContentCache = new Map<string, CacheEntry<FolderContent>>();
  private templateCache = new Map<string, CacheEntry<Template>>();
  private searchResultsCache = new Map<string, CacheEntry<any>>();
  
  // Cache statistics
  private hits = 0;
  private misses = 0;
  private totalSize = 0;
  
  // Reactive state
  private cacheStatsSubject = new BehaviorSubject<CacheStats>(this.getInitialStats());
  cacheStats$ = this.cacheStatsSubject.asObservable();
  
  // Signals
  isCleaningUp = signal(false);
  memoryPressure = signal(false);

  constructor() {
    this.config = { ...this.DEFAULT_CONFIG };
    this.startCleanupTimer();
    this.monitorMemoryPressure();
  }

  // Configuration
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  // Folder Tree Caching
  getFolderTree(applicationId: number): Observable<FolderTreeNode | null> {
    const key = `folder-tree-${applicationId}`;
    const cached = this.getFromCache(this.folderTreeCache, key);
    
    if (cached) {
      this.recordHit();
      return of(cached);
    }
    
    this.recordMiss();
    return of(null);
  }

  cacheFolderTree(applicationId: number, tree: FolderTreeNode): void {
    const key = `folder-tree-${applicationId}`;
    this.setInCache(this.folderTreeCache, key, tree);
  }

  // Folder Content Caching
  getFolderContent(folderId: number, page: number = 0, size: number = 20): Observable<FolderContent | null> {
    const key = `folder-content-${folderId}-${page}-${size}`;
    const cached = this.getFromCache(this.folderContentCache, key);
    
    if (cached) {
      this.recordHit();
      return of(cached);
    }
    
    this.recordMiss();
    return of(null);
  }

  cacheFolderContent(folderId: number, content: FolderContent, page: number = 0, size: number = 20): void {
    const key = `folder-content-${folderId}-${page}-${size}`;
    this.setInCache(this.folderContentCache, key, content);
  }

  // Template Caching
  getTemplate(templateId: number): Observable<Template | null> {
    const key = `template-${templateId}`;
    const cached = this.getFromCache(this.templateCache, key);
    
    if (cached) {
      this.recordHit();
      return of(cached);
    }
    
    this.recordMiss();
    return of(null);
  }

  cacheTemplate(template: Template): void {
    const key = `template-${template.id}`;
    this.setInCache(this.templateCache, key, template);
  }

  // Search Results Caching
  getSearchResults(query: string, applicationId: number, type: 'templates' | 'folders'): Observable<any[] | null> {
    const key = `search-${type}-${applicationId}-${this.hashString(query)}`;
    const cached = this.getFromCache(this.searchResultsCache, key);
    
    if (cached) {
      this.recordHit();
      return of(cached);
    }
    
    this.recordMiss();
    return of(null);
  }

  cacheSearchResults(query: string, applicationId: number, type: 'templates' | 'folders', results: any[]): void {
    const key = `search-${type}-${applicationId}-${this.hashString(query)}`;
    this.setInCache(this.searchResultsCache, key, results);
  }

  // Cache Invalidation
  invalidateFolderTree(applicationId: number): void {
    const key = `folder-tree-${applicationId}`;
    this.removeFromCache(this.folderTreeCache, key);
  }

  invalidateFolderContent(folderId: number): void {
    // Remove all cached content for this folder (different pages/sizes)
    const keysToRemove: string[] = [];
    this.folderContentCache.forEach((_, key) => {
      if (key.startsWith(`folder-content-${folderId}-`)) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      this.removeFromCache(this.folderContentCache, key);
    });
  }

  invalidateTemplate(templateId: number): void {
    const key = `template-${templateId}`;
    this.removeFromCache(this.templateCache, key);
  }

  invalidateSearchResults(applicationId?: number): void {
    if (applicationId) {
      // Remove search results for specific application
      const keysToRemove: string[] = [];
      this.searchResultsCache.forEach((_, key) => {
        if (key.includes(`-${applicationId}-`)) {
          keysToRemove.push(key);
        }
      });
      
      keysToRemove.forEach(key => {
        this.removeFromCache(this.searchResultsCache, key);
      });
    } else {
      // Clear all search results
      this.searchResultsCache.clear();
    }
  }

  // Bulk Invalidation
  invalidateAll(): void {
    this.folderTreeCache.clear();
    this.folderContentCache.clear();
    this.templateCache.clear();
    this.searchResultsCache.clear();
    this.totalSize = 0;
    this.updateStats();
  }

  invalidateByApplication(applicationId: number): void {
    this.invalidateFolderTree(applicationId);
    this.invalidateSearchResults(applicationId);
    
    // Invalidate folder content for folders in this application
    // This would need application context in cache keys for full implementation
  }

  // Memory Management
  cleanup(): void {
    this.isCleaningUp.set(true);
    
    const now = Date.now();
    let cleanedEntries = 0;
    
    // Clean expired entries from all caches
    cleanedEntries += this.cleanExpiredEntries(this.folderTreeCache, now);
    cleanedEntries += this.cleanExpiredEntries(this.folderContentCache, now);
    cleanedEntries += this.cleanExpiredEntries(this.templateCache, now);
    cleanedEntries += this.cleanExpiredEntries(this.searchResultsCache, now);
    
    // If still over limits, perform LRU cleanup
    if (this.isOverLimits()) {
      cleanedEntries += this.performLRUCleanup();
    }
    
    this.updateStats();
    this.isCleaningUp.set(false);
    
    console.log(`Cache cleanup completed. Removed ${cleanedEntries} entries.`);
  }

  forceCleanup(): void {
    this.cleanup();
  }

  // Statistics
  getStats(): CacheStats {
    return this.cacheStatsSubject.value;
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.updateStats();
  }

  // Private Helper Methods
  private getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (this.isExpired(entry)) {
      cache.delete(key);
      this.totalSize -= entry.size;
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  private setInCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    const size = this.estimateSize(data);
    const now = Date.now();
    
    // Remove existing entry if present
    const existing = cache.get(key);
    if (existing) {
      this.totalSize -= existing.size;
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
      size
    };
    
    cache.set(key, entry);
    this.totalSize += size;
    
    // Check if we need cleanup
    if (this.isOverLimits()) {
      this.scheduleCleanup();
    }
    
    this.updateStats();
  }

  private removeFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): void {
    const entry = cache.get(key);
    if (entry) {
      cache.delete(key);
      this.totalSize -= entry.size;
      this.updateStats();
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > this.config.maxAge;
  }

  private isOverLimits(): boolean {
    const totalEntries = this.getTotalEntries();
    return this.totalSize > this.config.maxSize || totalEntries > this.config.maxEntries;
  }

  private getTotalEntries(): number {
    return this.folderTreeCache.size + 
           this.folderContentCache.size + 
           this.templateCache.size + 
           this.searchResultsCache.size;
  }

  private cleanExpiredEntries<T>(cache: Map<string, CacheEntry<T>>, now: number): number {
    let cleaned = 0;
    const keysToRemove: string[] = [];
    
    cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.config.maxAge) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      const entry = cache.get(key);
      if (entry) {
        cache.delete(key);
        this.totalSize -= entry.size;
        cleaned++;
      }
    });
    
    return cleaned;
  }

  private performLRUCleanup(): number {
    // Collect all entries with their access info
    const allEntries: Array<{ key: string; entry: CacheEntry<any>; cache: Map<string, CacheEntry<any>> }> = [];
    
    this.folderTreeCache.forEach((entry, key) => {
      allEntries.push({ key, entry, cache: this.folderTreeCache });
    });
    
    this.folderContentCache.forEach((entry, key) => {
      allEntries.push({ key, entry, cache: this.folderContentCache });
    });
    
    this.templateCache.forEach((entry, key) => {
      allEntries.push({ key, entry, cache: this.templateCache });
    });
    
    this.searchResultsCache.forEach((entry, key) => {
      allEntries.push({ key, entry, cache: this.searchResultsCache });
    });
    
    // Sort by last accessed (LRU first)
    allEntries.sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);
    
    // Remove entries until we're under limits
    let cleaned = 0;
    for (const { key, entry, cache } of allEntries) {
      if (!this.isOverLimits()) {
        break;
      }
      
      cache.delete(key);
      this.totalSize -= entry.size;
      cleaned++;
    }
    
    return cleaned;
  }

  private estimateSize(data: any): number {
    // Simple size estimation - could be enhanced
    try {
      return JSON.stringify(data).length * 2; // Rough estimate for UTF-16
    } catch {
      return 1024; // Default size if serialization fails
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private recordHit(): void {
    this.hits++;
  }

  private recordMiss(): void {
    this.misses++;
  }

  private updateStats(): void {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.misses / totalRequests : 0;
    
    const allEntries = [
      ...this.folderTreeCache.values(),
      ...this.folderContentCache.values(),
      ...this.templateCache.values(),
      ...this.searchResultsCache.values()
    ];
    
    const timestamps = allEntries.map(entry => entry.timestamp);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : 0;
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : 0;
    
    const stats: CacheStats = {
      totalEntries: this.getTotalEntries(),
      totalSize: this.totalSize,
      hitRate,
      missRate,
      oldestEntry,
      newestEntry
    };
    
    this.cacheStatsSubject.next(stats);
  }

  private getInitialStats(): CacheStats {
    return {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      oldestEntry: 0,
      newestEntry: 0
    };
  }

  private startCleanupTimer(): void {
    timer(this.config.cleanupInterval, this.config.cleanupInterval)
      .subscribe(() => {
        this.cleanup();
      });
  }

  private scheduleCleanup(): void {
    // Immediate cleanup if severely over limits
    if (this.totalSize > this.config.maxSize * 1.5) {
      setTimeout(() => this.cleanup(), 0);
    }
  }

  private monitorMemoryPressure(): void {
    // Monitor memory pressure and adjust cache behavior
    timer(10000, 10000) // Check every 10 seconds
      .subscribe(() => {
        const pressure = this.totalSize > this.config.maxSize * 0.8;
        this.memoryPressure.set(pressure);
        
        if (pressure) {
          // Reduce cache size proactively
          this.config.maxAge = Math.max(this.config.maxAge * 0.8, 60000); // Minimum 1 minute
        } else {
          // Restore normal cache age
          this.config.maxAge = this.DEFAULT_CONFIG.maxAge;
        }
      });
  }
}
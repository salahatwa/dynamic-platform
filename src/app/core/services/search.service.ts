import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, debounceTime, distinctUntilChanged, switchMap, tap, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Template, TemplateFolder } from '../models/template.model';
import { AppContextService } from './app-context.service';

export interface SearchResult {
  templates: SearchResultTemplate[];
  folders: SearchResultFolder[];
  totalResults: number;
  query: string;
  searchTime: number;
}

export interface SearchResultTemplate extends Template {
  folderPath: string;
  highlightedName?: string;
  matchType: 'name' | 'content' | 'folder';
}

export interface SearchResultFolder extends TemplateFolder {
  highlightedName?: string;
  matchType: 'name' | 'path';
  templateCount: number;
}

export interface SearchState {
  isSearching: boolean;
  hasResults: boolean;
  query: string;
  results: SearchResult | null;
  error: string | null;
  history: SearchHistoryItem[];
}

export interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface SearchFilters {
  includeTemplates: boolean;
  includeFolders: boolean;
  templateTypes: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = environment.apiUrl;
  private searchSubject = new BehaviorSubject<string>('');
  private maxHistoryItems = 10;
  private appContext = inject(AppContextService);
  
  // Reactive state
  private searchStateSubject = new BehaviorSubject<SearchState>({
    isSearching: false,
    hasResults: false,
    query: '',
    results: null,
    error: null,
    history: this.loadSearchHistory()
  });
  
  // Public observables
  searchState$ = this.searchStateSubject.asObservable();
  
  // Signals for reactive UI
  isSearching = signal(false);
  searchResults = signal<SearchResult | null>(null);
  searchQuery = signal('');
  searchHistory = signal<SearchHistoryItem[]>([]); // Add reactive search history signal
  searchFilters = signal<SearchFilters>({
    includeTemplates: true,
    includeFolders: true,
    templateTypes: [],
    dateRange: undefined
  });

  constructor(private http: HttpClient) {
    // Initialize search history signal with loaded history
    this.searchHistory.set(this.loadSearchHistory());
    this.initializeSearch();
  }

  private initializeSearch(): void {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          return of(null);
        }
        return this.performSearch(query);
      })
    ).subscribe(result => {
      if (result) {
        this.updateSearchState({
          isSearching: false,
          hasResults: result.totalResults > 0,
          query: result.query,
          results: result,
          error: null
        });
        this.addToHistory(result.query, result.totalResults);
      } else {
        this.clearSearch();
      }
    });
  }

  // Public search methods
  search(query: string, applicationId: number, filters?: SearchFilters): void {
    if (!query.trim()) {
      this.clearSearch();
      return;
    }

    this.searchQuery.set(query);
    this.updateSearchState({
      isSearching: true,
      hasResults: false,
      query: query,
      results: null,
      error: null
    });

    this.searchSubject.next(query);
  }

  searchImmediate(query: string, applicationId: number, filters?: SearchFilters): Observable<SearchResult> {
    return this.performSearch(query, applicationId, filters);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set(null);
    this.updateSearchState({
      isSearching: false,
      hasResults: false,
      query: '',
      results: null,
      error: null
    });
  }

  // Comprehensive search across templates and folders
  private performSearch(query: string, applicationId?: number, filters?: SearchFilters): Observable<SearchResult> {
    const startTime = Date.now();
    this.isSearching.set(true);

    const params = new HttpParams()
      .set('query', query)
      .set('page', '0')
      .set('size', '50');

    // Use current application if not provided
    const appId = applicationId || this.getCurrentApplicationId();
    
    return this.http.get<any>(`${this.apiUrl}/template-folders/search/${appId}`, { params })
      .pipe(
        switchMap(templateResults => {
          // Also search folders
          return this.searchFolders(query, appId).pipe(
            tap(folderResults => {
              const searchTime = Date.now() - startTime;
              const result: SearchResult = {
                templates: this.processTemplateResults(templateResults.content || [], query),
                folders: this.processFolderResults(folderResults, query),
                totalResults: (templateResults.totalElements || 0) + folderResults.length,
                query: query,
                searchTime: searchTime
              };
              
              this.searchResults.set(result);
              this.isSearching.set(false);
            })
          );
        }),
        switchMap(() => {
          // Return the combined results
          const currentResults = this.searchResults();
          return of(currentResults!);
        })
      );
  }

  // Search folders specifically
  searchFolders(query: string, applicationId: number): Observable<SearchResultFolder[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('applicationId', applicationId.toString());
    
    return this.http.get<TemplateFolder[]>(`${this.apiUrl}/template-folders/search`, { params })
      .pipe(
        map(folders => this.processFolderResults(folders, query))
      );
  }

  // Search templates specifically
  searchTemplates(query: string, applicationId: number, folderId?: number): Observable<SearchResultTemplate[]> {
    let params = new HttpParams()
      .set('query', query)
      .set('applicationId', applicationId.toString());
    
    if (folderId) {
      params = params.set('folderId', folderId.toString());
    }
    
    return this.http.get<Template[]>(`${this.apiUrl}/templates/search`, { params })
      .pipe(
        map(templates => this.processTemplateResults(templates, query))
      );
  }

  // Navigate to search result
  navigateToResult(result: SearchResultTemplate | SearchResultFolder): Observable<any> {
    if ('folderPath' in result) {
      // Template result - navigate to containing folder
      return this.navigateToTemplate(result);
    } else {
      // Folder result - navigate to folder
      return this.navigateToFolder(result);
    }
  }

  private navigateToTemplate(template: SearchResultTemplate): Observable<any> {
    // Navigate to the folder containing this template
    const folderId = template.folderId;
    if (folderId) {
      return this.http.get(`${this.apiUrl}/templates/folder/${folderId}`)
        .pipe(
          tap(() => {
            // Emit navigation event or update router
            this.emitNavigationEvent('template', template.id, folderId);
          })
        );
    }
    
    // Template is in root folder
    return this.http.get(`${this.apiUrl}/template-folders/root/${(template as any).applicationId}/templates`)
      .pipe(
        tap(() => {
          this.emitNavigationEvent('template', template.id, null);
        })
      );
  }

  private navigateToFolder(folder: SearchResultFolder): Observable<any> {
    return this.http.get(`${this.apiUrl}/templates/folder/${folder.id}`)
      .pipe(
        tap(() => {
          this.emitNavigationEvent('folder', folder.id, folder.parentId || null);
        })
      );
  }

  // Search suggestions and autocomplete
  getSearchSuggestions(query: string, applicationId: number): Observable<string[]> {
    if (!query.trim() || query.length < 2) {
      return of([]);
    }

    const params = new HttpParams()
      .set('query', query)
      .set('applicationId', applicationId.toString())
      .set('limit', '5');
    
    return this.http.get<string[]>(`${this.apiUrl}/template-folders/search/suggestions`, { params });
  }

  // Search history management
  getSearchHistory(): SearchHistoryItem[] {
    return this.searchHistory();
  }

  clearSearchHistory(): void {
    localStorage.removeItem('template-search-history');
    this.searchHistory.set([]); // Update the reactive signal
    this.updateSearchState({
      history: []
    });
  }

  searchFromHistory(historyItem: SearchHistoryItem, applicationId: number): void {
    this.search(historyItem.query, applicationId);
  }

  // Filter management
  updateSearchFilters(filters: Partial<SearchFilters>): void {
    const currentFilters = this.searchFilters();
    const newFilters = { ...currentFilters, ...filters };
    this.searchFilters.set(newFilters);
    
    // Re-run search if there's an active query
    const currentQuery = this.searchQuery();
    if (currentQuery) {
      this.search(currentQuery, this.getCurrentApplicationId(), newFilters);
    }
  }

  // Helper methods
  private processTemplateResults(templates: Template[], query: string): SearchResultTemplate[] {
    return templates.map(template => ({
      ...template,
      folderPath: (template as any).folderPath || '/',
      highlightedName: this.highlightText(template.name, query),
      matchType: this.getTemplateMatchType(template, query)
    }));
  }

  private processFolderResults(folders: TemplateFolder[], query: string): SearchResultFolder[] {
    return folders.map(folder => ({
      ...folder,
      highlightedName: this.highlightText(folder.name, query),
      matchType: this.getFolderMatchType(folder, query),
      templateCount: folder.templatesCount || 0
    }));
  }

  private getTemplateMatchType(template: Template, query: string): 'name' | 'content' | 'folder' {
    const lowerQuery = query.toLowerCase();
    if (template.name.toLowerCase().includes(lowerQuery)) {
      return 'name';
    }
    const folderPath = (template as any).folderPath;
    if (folderPath && folderPath.toLowerCase().includes(lowerQuery)) {
      return 'folder';
    }
    return 'content';
  }

  private getFolderMatchType(folder: TemplateFolder, query: string): 'name' | 'path' {
    const lowerQuery = query.toLowerCase();
    if (folder.name.toLowerCase().includes(lowerQuery)) {
      return 'name';
    }
    return 'path';
  }

  private highlightText(text: string, query: string): string {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  private addToHistory(query: string, resultCount: number): void {
    const currentHistory = this.getSearchHistory();
    const existingIndex = currentHistory.findIndex(item => item.query === query);
    
    const historyItem: SearchHistoryItem = {
      query,
      timestamp: new Date(),
      resultCount
    };
    
    let newHistory: SearchHistoryItem[];
    if (existingIndex >= 0) {
      // Update existing item
      newHistory = [...currentHistory];
      newHistory[existingIndex] = historyItem;
    } else {
      // Add new item
      newHistory = [historyItem, ...currentHistory];
    }
    
    // Limit history size
    newHistory = newHistory.slice(0, this.maxHistoryItems);
    
    this.searchHistory.set(newHistory); // Update the reactive signal
    this.updateSearchState({ history: newHistory });
    this.saveSearchHistory(newHistory);
  }

  private loadSearchHistory(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem('template-search-history');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
    return [];
  }

  private saveSearchHistory(history: SearchHistoryItem[]): void {
    try {
      localStorage.setItem('template-search-history', JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  }

  private updateSearchState(updates: Partial<SearchState>): void {
    const currentState = this.searchStateSubject.value;
    const newState = { ...currentState, ...updates };
    this.searchStateSubject.next(newState);
  }

  private emitNavigationEvent(type: 'template' | 'folder', id: number, parentId: number | null): void {
    // This would typically emit an event that the main component listens to
    // For now, we'll use a simple event system
    window.dispatchEvent(new CustomEvent('search-navigation', {
      detail: { type, id, parentId }
    }));
  }

  private getCurrentApplicationId(): number {
    // Get the current application ID from the app context service
    const selectedApp = this.appContext?.selectedApp();
    return selectedApp?.id || 1;
  }
}
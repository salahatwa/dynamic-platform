import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchService, SearchResult, SearchResultTemplate, SearchResultFolder, SearchHistoryItem } from '../../../core/services/search.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface SearchNavigationEvent {
  type: 'template' | 'folder';
  id: number;
  parentId: number | null;
  item: SearchResultTemplate | SearchResultFolder;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="search-container" [class.expanded]="isExpanded()">
      <!-- Search Input -->
      <div class="search-input-wrapper">
        <div class="search-input-container">
          <span class="search-icon">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          
          <input 
            type="text" 
            class="search-input"
            [placeholder]="placeholder || ('search.placeholder' | translate)"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput($event)"
            (focus)="onSearchFocus()"
            (blur)="onSearchBlur()"
            (keydown)="onKeyDown($event)"
            #searchInput
          />
          
          @if (searchQuery) {
            <button class="clear-btn" (click)="clearSearch()" type="button" aria-label="Clear search">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }
          
          @if (searchService.isSearching()) {
            <div class="search-loading">
              <div class="spinner-sm"></div>
            </div>
          }
        </div>
        
        <!-- Search Filters Toggle -->
        @if (showFilters) {
          <button 
            class="filter-toggle-btn"
            (click)="toggleFilters()"
            [class.active]="showFiltersPanel()"
            title="{{ 'search.filters' | translate }}"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
          </button>
        }
      </div>
      
      <!-- Search Filters Panel -->
      @if (showFilters && showFiltersPanel()) {
        <div class="search-filters-panel">
          <div class="filter-section">
            <h4>{{ 'search.filters.content' | translate }}</h4>
            <div class="filter-checkboxes">
              <label class="filter-checkbox">
                <input 
                  type="checkbox" 
                  [(ngModel)]="filters().includeTemplates"
                  (change)="updateFilters()"
                />
                <span>{{ 'search.filters.templates' | translate }}</span>
              </label>
              <label class="filter-checkbox">
                <input 
                  type="checkbox" 
                  [(ngModel)]="filters().includeFolders"
                  (change)="updateFilters()"
                />
                <span>{{ 'search.filters.folders' | translate }}</span>
              </label>
            </div>
          </div>
          
          @if (templateTypes.length > 0) {
            <div class="filter-section">
              <h4>{{ 'search.filters.templateTypes' | translate }}</h4>
              <div class="filter-checkboxes">
                @for (type of templateTypes; track type) {
                  <label class="filter-checkbox">
                    <input 
                      type="checkbox" 
                      [checked]="filters().templateTypes.includes(type)"
                      (change)="toggleTemplateType(type)"
                    />
                    <span>{{ type }}</span>
                  </label>
                }
              </div>
            </div>
          }
        </div>
      }
      
      <!-- Search Results Dropdown -->
      @if (isExpanded() && (hasResults() || hasHistory() || searchService.isSearching())) {
        <div class="search-results-dropdown" 
             (mousedown)="onResultsMouseDown()" 
             (mouseup)="onResultsMouseUp()">
          <!-- Loading State -->
          @if (searchService.isSearching()) {
            <div class="search-loading-state">
              <div class="spinner-sm"></div>
              <span>{{ 'search.searching' | translate }}</span>
            </div>
          }
          
          <!-- Search Results -->
          @if (hasResults() && !searchService.isSearching()) {
            <div class="search-results">
              <div class="search-results-header">
                <span class="results-count">
                  {{ searchResults()!.totalResults }} {{ 'search.resultsFound' | translate }}
                </span>
                <span class="search-time">
                  {{ searchResults()!.searchTime }}ms
                </span>
              </div>
              
              <!-- Template Results -->
              @if (searchResults()!.templates.length > 0) {
                <div class="result-section">
                  <h4 class="result-section-title">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ 'search.templates' | translate }} ({{ searchResults()!.templates.length }})
                  </h4>
                  
                  @for (template of searchResults()!.templates; track template.id) {
                    <div 
                      class="search-result-item template-result"
                      (click)="selectResult(template)"
                      [class.selected]="selectedIndex() === getResultIndex('template', template.id)"
                    >
                      <div class="result-icon">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      
                      <div class="result-content">
                        <div class="result-title" [innerHTML]="template.highlightedName || template.name"></div>
                        <div class="result-path">
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                          {{ template.folderPath }}
                        </div>
                      </div>
                      
                      <div class="result-meta">
                        <span class="match-type" [class]="'match-' + template.matchType">
                          {{ ('search.matchType.' + template.matchType) | translate }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
              
              <!-- Folder Results -->
              @if (searchResults()!.folders.length > 0) {
                <div class="result-section">
                  <h4 class="result-section-title">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    {{ 'search.folders' | translate }} ({{ searchResults()!.folders.length }})
                  </h4>
                  
                  @for (folder of searchResults()!.folders; track folder.id) {
                    <div 
                      class="search-result-item folder-result"
                      (click)="selectResult(folder)"
                      [class.selected]="selectedIndex() === getResultIndex('folder', folder.id)"
                    >
                      <div class="result-icon">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                      </div>
                      
                      <div class="result-content">
                        <div class="result-title" [innerHTML]="folder.highlightedName || folder.name"></div>
                        <div class="result-path">
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {{ folder.path }}
                        </div>
                      </div>
                      
                      <div class="result-meta">
                        <span class="template-count">
                          {{ folder.templateCount }} {{ 'search.templates' | translate }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
              
              <!-- View All Results -->
              @if (searchResults()!.totalResults > maxDisplayResults) {
                <div class="view-all-results">
                  <button class="btn btn-link" (click)="viewAllResults()">
                    {{ 'search.viewAllResults' | translate }} ({{ searchResults()!.totalResults }})
                  </button>
                </div>
              }
            </div>
          }
          
          <!-- No Results -->
          @if (!hasResults() && !searchService.isSearching() && searchQuery) {
            <div class="no-results">
              <div class="no-results-icon">
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h4>{{ 'search.noResults' | translate }}</h4>
              <p>{{ 'search.noResultsDesc' | translate }}</p>
              <div class="search-suggestions">
                <p>{{ 'search.suggestions' | translate }}</p>
                <ul>
                  <li>{{ 'search.suggestion1' | translate }}</li>
                  <li>{{ 'search.suggestion2' | translate }}</li>
                  <li>{{ 'search.suggestion3' | translate }}</li>
                </ul>
              </div>
            </div>
          }
          
          <!-- Search History -->
          @if (hasHistory() && !searchQuery && !searchService.isSearching()) {
            <div class="search-history">
              <div class="search-history-header">
                <h4>{{ 'search.recentSearches' | translate }}</h4>
                <button class="btn btn-link btn-sm" (click)="clearHistory()">
                  {{ 'search.clearHistory' | translate }}
                </button>
              </div>
              
              @for (historyItem of searchHistory(); track historyItem.query) {
                <div class="history-item" (click)="searchFromHistory(historyItem)">
                  <div class="history-icon">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="history-content">
                    <div class="history-query">{{ historyItem.query }}</div>
                    <div class="history-meta">
                      {{ historyItem.resultCount }} {{ 'search.results' | translate }} • 
                      {{ formatHistoryTime(historyItem.timestamp) }}
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() placeholder?: string;
  @Input() showFilters = true;
  @Input() maxDisplayResults = 10;
  @Input() templateTypes: string[] = [];
  
  @Output() resultSelected = new EventEmitter<SearchNavigationEvent>();
  @Output() searchStateChanged = new EventEmitter<{ query: string; hasResults: boolean }>();
  
  private destroy$ = new Subject<void>();
  private searchInput$ = new Subject<string>();
  
  // Injected services
  searchService = inject(SearchService);
  private appContext = inject(AppContextService);
  
  // Component state
  searchQuery = '';
  isExpanded = signal(false);
  showFiltersPanel = signal(false);
  selectedIndex = signal(-1);
  isMouseDownOnResults = false; // Track if mouse is down on results
  
  // Computed properties
  searchResults = computed(() => this.searchService.searchResults());
  hasResults = computed(() => {
    const results = this.searchResults();
    return results !== null && results.totalResults > 0;
  });
  
  filters = computed(() => this.searchService.searchFilters());
  searchHistory = computed(() => this.searchService.searchHistory());
  hasHistory = computed(() => this.searchHistory().length > 0);
  
  ngOnInit(): void {
    this.setupSearchInput();
    this.setupNavigationListener();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private setupSearchInput(): void {
    this.searchInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim()) {
        const appId = this.appContext.selectedApp()?.id;
        if (appId) {
          this.searchService.search(query, appId, this.filters());
        }
      } else {
        this.searchService.clearSearch();
      }
      
      this.searchStateChanged.emit({
        query: query,
        hasResults: this.hasResults()
      });
    });
  }
  
  private setupNavigationListener(): void {
    window.addEventListener('search-navigation', (event: any) => {
      const { type, id, parentId } = event.detail;
      this.isExpanded.set(false);
      // Additional navigation handling can be added here
    });
  }
  
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.searchInput$.next(this.searchQuery);
    this.selectedIndex.set(-1);
    
    if (this.searchQuery.trim()) {
      this.isExpanded.set(true);
    }
  }
  
  onSearchFocus(): void {
    this.isExpanded.set(true);
  }
  
  onSearchBlur(): void {
    // Don't hide if user is clicking on results
    if (this.isMouseDownOnResults) {
      return;
    }
    
    // Delay hiding to allow for result clicks
    setTimeout(() => {
      if (!this.isMouseDownOnResults) {
        this.isExpanded.set(false);
        this.showFiltersPanel.set(false);
      }
    }, 150); // Reduced delay for better responsiveness
  }
  
  onKeyDown(event: KeyboardEvent): void {
    const results = this.searchResults();
    if (!results) return;
    
    const totalResults = results.templates.length + results.folders.length;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update(index => 
          index < totalResults - 1 ? index + 1 : 0
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update(index => 
          index > 0 ? index - 1 : totalResults - 1
        );
        break;
        
      case 'Enter':
        event.preventDefault();
        const selected = this.getSelectedResult();
        if (selected) {
          this.selectResult(selected);
        }
        break;
        
      case 'Escape':
        this.clearSearch();
        break;
    }
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.searchService.clearSearch();
    this.isExpanded.set(false);
    this.selectedIndex.set(-1);
    
    this.searchStateChanged.emit({
      query: '',
      hasResults: false
    });
  }
  
  onResultsMouseDown(): void {
    this.isMouseDownOnResults = true;
  }
  
  onResultsMouseUp(): void {
    this.isMouseDownOnResults = false;
  }
  
  toggleFilters(): void {
    this.showFiltersPanel.update(show => !show);
  }
  
  updateFilters(): void {
    // Filters are updated via two-way binding
    // Re-run search if there's an active query
    if (this.searchQuery.trim()) {
      const appId = this.appContext.selectedApp()?.id;
      if (appId) {
        this.searchService.search(this.searchQuery, appId, this.filters());
      }
    }
  }
  
  toggleTemplateType(type: string): void {
    const currentFilters = this.filters();
    const currentTypes = [...currentFilters.templateTypes];
    const index = currentTypes.indexOf(type);
    
    if (index >= 0) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(type);
    }
    
    this.searchService.updateSearchFilters({
      templateTypes: currentTypes
    });
  }
  
  selectResult(result: SearchResultTemplate | SearchResultFolder): void {
    // Immediately close dropdown and reset mouse state
    this.isExpanded.set(false);
    this.isMouseDownOnResults = false;
    
    // Determine type based on the result structure
    const isTemplate = 'folderPath' in result;
    
    const navigationEvent: SearchNavigationEvent = {
      type: isTemplate ? 'template' : 'folder',
      id: result.id,
      parentId: isTemplate ? null : ('parentId' in result ? (result.parentId ?? null) : null),
      item: result
    };
    
    // Emit the event to parent component for handling
    this.resultSelected.emit(navigationEvent);
  }
  
  viewAllResults(): void {
    // Emit event to show full search results page
    this.resultSelected.emit({
      type: 'template', // This will be handled differently
      id: -1, // Special ID for "view all"
      parentId: null,
      item: null as any
    });
  }
  
  searchFromHistory(historyItem: SearchHistoryItem): void {
    this.searchQuery = historyItem.query;
    this.isMouseDownOnResults = false; // Reset mouse state
    const appId = this.appContext.selectedApp()?.id;
    if (appId) {
      this.searchService.searchFromHistory(historyItem, appId);
    }
  }
  
  clearHistory(): void {
    this.searchService.clearSearchHistory();
  }
  
  formatHistoryTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  
  private getSelectedResult(): SearchResultTemplate | SearchResultFolder | null {
    const results = this.searchResults();
    if (!results) return null;
    
    const index = this.selectedIndex();
    const allResults = [...results.templates, ...results.folders];
    
    return allResults[index] || null;
  }
  
  getResultIndex(type: 'template' | 'folder', id: number): number {
    const results = this.searchResults();
    if (!results) return -1;
    
    if (type === 'template') {
      return results.templates.findIndex(t => t.id === id);
    } else {
      return results.templates.length + results.folders.findIndex(f => f.id === id);
    }
  }
}
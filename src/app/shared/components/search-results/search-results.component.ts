import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SearchService, SearchResult, SearchResultTemplate, SearchResultFolder, SearchFilters } from '../../../core/services/search.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

export interface SearchResultsNavigationEvent {
  type: 'template' | 'folder';
  id: number;
  parentId: number | null;
  item: SearchResultTemplate | SearchResultFolder;
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="search-results-page">
      <!-- Search Header -->
      <div class="search-header">
        <div class="search-header-content">
          <div class="search-info">
            <h1>{{ 'search.results.title' | translate }}</h1>
            @if (searchResults()) {
              <p class="search-query">
                {{ 'search.results.for' | translate }} "<strong>{{ searchResults()!.query }}</strong>"
              </p>
              <div class="search-stats">
                <span class="result-count">
                  {{ searchResults()!.totalResults }} {{ 'search.results.found' | translate }}
                </span>
                <span class="search-time">
                  {{ 'search.results.in' | translate }} {{ searchResults()!.searchTime }}ms
                </span>
              </div>
            }
          </div>
          
          <div class="search-actions">
            <button class="btn btn-outline" (click)="goBack()">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              {{ 'common.back' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Search Filters -->
      <div class="search-filters">
        <div class="filter-group">
          <label class="filter-label">{{ 'search.filters.content' | translate }}</label>
          <div class="filter-options">
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                [(ngModel)]="filters().includeTemplates"
                (change)="updateFilters()"
              />
              <span>{{ 'search.filters.templates' | translate }} ({{ templateCount() }})</span>
            </label>
            <label class="filter-checkbox">
              <input 
                type="checkbox" 
                [(ngModel)]="filters().includeFolders"
                (change)="updateFilters()"
              />
              <span>{{ 'search.filters.folders' | translate }} ({{ folderCount() }})</span>
            </label>
          </div>
        </div>

        @if (availableTemplateTypes().length > 0) {
          <div class="filter-group">
            <label class="filter-label">{{ 'search.filters.templateTypes' | translate }}</label>
            <div class="filter-options">
              @for (type of availableTemplateTypes(); track type) {
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

        <div class="filter-group">
          <label class="filter-label">{{ 'search.filters.sortBy' | translate }}</label>
          <select class="form-control" [(ngModel)]="sortBy" (change)="updateSort()">
            <option value="relevance">{{ 'search.sort.relevance' | translate }}</option>
            <option value="name">{{ 'search.sort.name' | translate }}</option>
            <option value="date">{{ 'search.sort.date' | translate }}</option>
            <option value="type">{{ 'search.sort.type' | translate }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">{{ 'search.filters.viewMode' | translate }}</label>
          <div class="view-toggle">
            <button 
              class="btn btn-icon" 
              [class.btn-primary]="viewMode() === 'grid'"
              [class.btn-outline]="viewMode() !== 'grid'" 
              (click)="setViewMode('grid')"
              title="{{ 'search.view.grid' | translate }}"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z" />
              </svg>
            </button>
            <button 
              class="btn btn-icon" 
              [class.btn-primary]="viewMode() === 'list'"
              [class.btn-outline]="viewMode() !== 'list'" 
              (click)="setViewMode('list')"
              title="{{ 'search.view.list' | translate }}"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (searchService.isSearching()) {
        <div class="search-loading">
          <div class="spinner"></div>
          <p>{{ 'search.searching' | translate }}</p>
        </div>
      }

      <!-- Search Results -->
      @if (!searchService.isSearching() && searchResults()) {
        <div class="search-results-content">
          <!-- Template Results -->
          @if (filteredTemplates().length > 0) {
            <div class="result-section">
              <div class="section-header">
                <h2>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ 'search.templates' | translate }} ({{ filteredTemplates().length }})
                </h2>
              </div>

              @if (viewMode() === 'grid') {
                <div class="results-grid">
                  @for (template of filteredTemplates(); track template.id) {
                    <div class="result-card template-card" (click)="selectResult(template)">
                      <div class="card-header">
                        <div class="card-icon">
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div class="match-type" [class]="'match-' + template.matchType">
                          {{ ('search.matchType.' + template.matchType) | translate }}
                        </div>
                      </div>

                      <div class="card-body">
                        <h3 class="card-title" [innerHTML]="template.highlightedName || template.name"></h3>
                        <div class="card-path">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                          {{ template.folderPath }}
                        </div>
                      </div>

                      <div class="card-footer">
                        <span class="template-type">{{ template.type }}</span>
                        <span class="template-date">{{ formatDate(template.updatedAt) }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="results-list">
                  @for (template of filteredTemplates(); track template.id) {
                    <div class="result-row template-row" (click)="selectResult(template)">
                      <div class="row-icon">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      <div class="row-content">
                        <div class="row-title" [innerHTML]="template.highlightedName || template.name"></div>
                        <div class="row-path">{{ template.folderPath }}</div>
                      </div>

                      <div class="row-meta">
                        <span class="template-type">{{ template.type }}</span>
                        <span class="match-type" [class]="'match-' + template.matchType">
                          {{ ('search.matchType.' + template.matchType) | translate }}
                        </span>
                        <span class="template-date">{{ formatDate(template.updatedAt) }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- Folder Results -->
          @if (filteredFolders().length > 0) {
            <div class="result-section">
              <div class="section-header">
                <h2>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  {{ 'search.folders' | translate }} ({{ filteredFolders().length }})
                </h2>
              </div>

              @if (viewMode() === 'grid') {
                <div class="results-grid">
                  @for (folder of filteredFolders(); track folder.id) {
                    <div class="result-card folder-card" (click)="selectResult(folder)">
                      <div class="card-header">
                        <div class="card-icon">
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <div class="match-type" [class]="'match-' + folder.matchType">
                          {{ ('search.matchType.' + folder.matchType) | translate }}
                        </div>
                      </div>

                      <div class="card-body">
                        <h3 class="card-title" [innerHTML]="folder.highlightedName || folder.name"></h3>
                        <div class="card-path">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          {{ folder.path }}
                        </div>
                      </div>

                      <div class="card-footer">
                        <span class="template-count">
                          {{ folder.templateCount }} {{ 'search.templates' | translate }}
                        </span>
                        <span class="folder-date">{{ formatDate(folder.updatedAt) }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="results-list">
                  @for (folder of filteredFolders(); track folder.id) {
                    <div class="result-row folder-row" (click)="selectResult(folder)">
                      <div class="row-icon">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                      </div>

                      <div class="row-content">
                        <div class="row-title" [innerHTML]="folder.highlightedName || folder.name"></div>
                        <div class="row-path">{{ folder.path }}</div>
                      </div>

                      <div class="row-meta">
                        <span class="template-count">
                          {{ folder.templateCount }} {{ 'search.templates' | translate }}
                        </span>
                        <span class="match-type" [class]="'match-' + folder.matchType">
                          {{ ('search.matchType.' + folder.matchType) | translate }}
                        </span>
                        <span class="folder-date">{{ formatDate(folder.updatedAt) }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- No Results -->
          @if (filteredTemplates().length === 0 && filteredFolders().length === 0) {
            <div class="no-results">
              <div class="no-results-icon">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3>{{ 'search.noResults' | translate }}</h3>
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
        </div>
      }
    </div>
  `,
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  @Input() query = '';
  @Output() resultSelected = new EventEmitter<SearchResultsNavigationEvent>();
  @Output() backRequested = new EventEmitter<void>();

  private destroy$ = new Subject<void>();

  // Injected services
  searchService = inject(SearchService);
  private appContext = inject(AppContextService);

  // Component state
  viewMode = signal<'grid' | 'list'>('grid');
  sortBy = 'relevance';

  // Computed properties
  searchResults = computed(() => this.searchService.searchResults());
  filters = computed(() => this.searchService.searchFilters());

  templateCount = computed(() => this.searchResults()?.templates.length || 0);
  folderCount = computed(() => this.searchResults()?.folders.length || 0);

  availableTemplateTypes = computed(() => {
    const results = this.searchResults();
    if (!results) return [];
    
    const types = new Set<string>();
    results.templates.forEach(template => {
      if (template.type) types.add(template.type);
    });
    
    return Array.from(types).sort();
  });

  filteredTemplates = computed(() => {
    const results = this.searchResults();
    const currentFilters = this.filters();
    
    if (!results || !currentFilters.includeTemplates) return [];
    
    let templates = results.templates;
    
    // Filter by template types
    if (currentFilters.templateTypes.length > 0) {
      templates = templates.filter(template => 
        currentFilters.templateTypes.includes(template.type || '')
      );
    }
    
    // Sort results
    return this.sortResults(templates, this.sortBy);
  });

  filteredFolders = computed(() => {
    const results = this.searchResults();
    const currentFilters = this.filters();
    
    if (!results || !currentFilters.includeFolders) return [];
    
    return this.sortResults(results.folders, this.sortBy);
  });

  ngOnInit(): void {
    // Perform search if query is provided
    if (this.query) {
      const appId = this.appContext.selectedApp()?.id;
      if (appId) {
        this.searchService.search(this.query, appId);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateFilters(): void {
    // Filters are updated via two-way binding
    // The computed properties will automatically update
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

  updateSort(): void {
    // Sorting is handled by computed properties
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  selectResult(result: SearchResultTemplate | SearchResultFolder): void {
    const navigationEvent: SearchResultsNavigationEvent = {
      type: 'folderPath' in result ? 'template' : 'folder',
      id: result.id,
      parentId: 'parentId' in result ? result.parentId : null,
      item: result
    };
    
    this.resultSelected.emit(navigationEvent);
    
    // Also trigger navigation through the search service
    this.searchService.navigateToResult(result).subscribe();
  }

  goBack(): void {
    this.backRequested.emit();
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString();
  }

  private sortResults<T extends SearchResultTemplate | SearchResultFolder>(
    results: T[], 
    sortBy: string
  ): T[] {
    const sorted = [...results];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'date':
        return sorted.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      
      case 'type':
        return sorted.sort((a, b) => {
          const typeA = 'type' in a ? a.type || '' : 'folder';
          const typeB = 'type' in b ? b.type || '' : 'folder';
          return typeA.localeCompare(typeB);
        });
      
      case 'relevance':
      default:
        // Sort by match type priority: name > content > folder/path
        return sorted.sort((a, b) => {
          const priorityA = this.getMatchPriority(a.matchType);
          const priorityB = this.getMatchPriority(b.matchType);
          return priorityA - priorityB;
        });
    }
  }

  private getMatchPriority(matchType: string): number {
    switch (matchType) {
      case 'name': return 1;
      case 'content': return 2;
      case 'folder':
      case 'path': return 3;
      default: return 4;
    }
  }
}
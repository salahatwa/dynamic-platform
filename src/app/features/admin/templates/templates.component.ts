import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { SearchComponent, SearchNavigationEvent } from '../../../shared/components/search/search.component';
import { FolderContentComponent } from '../../../shared/components/folder-content/folder-content.component';
import { TranslationService } from '../../../core/services/translation.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { PermissionService } from '../../../core/services/permission.service';
import { FolderService } from '../../../core/services/folder.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

interface Template {
  id: number;
  name: string;
  type: string;
  htmlContent: string;
  cssStyles: string;
  createdAt: string;
  updatedAt: string;
}

interface PageResponse {
  content: Template[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface DialogData {
  show: boolean;
  type: 'delete' | 'duplicate' | null;
  template: Template | null;
  loading: boolean;
}



interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}



interface AuditDialog {
  show: boolean;
  template: Template | null;
  logs: AuditLog[];
  loading: boolean;
}

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, TranslatePipe, HasPermissionDirective, SearchComponent, FolderContentComponent],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private appContext = inject(AppContextService);
  private permissionService = inject(PermissionService);
  private folderService = inject(FolderService);
  private toastService = inject(ToastService);
  private apiUrl = `${environment.apiUrl}/template-editor`;
  private dashboardApiUrl = `${environment.apiUrl}/dashboard`;

  // Permission checks
  canCreateTemplates = computed(() => this.permissionService.canCreate('templates'));
  canUpdateTemplates = computed(() => this.permissionService.canUpdate('templates'));
  canDeleteTemplates = computed(() => this.permissionService.canDelete('templates'));

  // App context
  selectedApp = this.appContext.selectedApp;
  
  // Folder management
  currentFolderId = signal<number | null>(null); // null means root folder
  showFolderView = signal(true); // Start in folder view by default
  
  // Folder creation dialog
  showCreateFolderDialog = signal(false);
  newFolderName = signal('');
  newFolderDescription = signal('');
  newFolderImageUrl = signal('');
  newFolderActive = signal(true);
  refreshTrigger = signal(0);

  templates = signal<Template[]>([]);
  loading = signal(true);
  skeletonLoading = signal(false);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  searchQuery = '';
  selectedType = signal<string>('ALL');
  private searchTimeout: any;
  private loadingRequest: any = null;

  dialog = signal<DialogData>({
    show: false,
    type: null,
    template: null,
    loading: false
  });



  auditDialog = signal<AuditDialog>({
    show: false,
    template: null,
    logs: [],
    loading: false
  });



  templateTypes = [
    { value: 'ALL', label: 'All', icon: '📄', color: '#6366f1' },
    { value: 'HTML', label: 'HTML', icon: '✉️', color: '#3b82f6' },
    { value: 'TXT', label: 'TXT', icon: '📊', color: '#8b5cf6' },
  ];

  // Computed property for filtered template types (excluding 'ALL')
  filteredTemplateTypes = computed(() => 
    this.templateTypes.map(t => t.value).filter(t => t !== 'ALL')
  );

  showFiltersDropdown = signal(false);
  activeView = signal<'grid' | 'list'>('grid');
  
  // Computed property for folder view mode - always use activeView for grid/list
  folderViewMode = computed(() => this.activeView());

  constructor() {
    // No effect - we'll handle app changes manually
  }

  ngOnInit() {
    // Always start in folder view and let folder-content component handle the API calls
    // This ensures we call the correct folder-based API endpoints
    this.showFolderView.set(true);
    this.currentFolderId.set(null); // null means root folder
    
    console.log('Templates component initialized');
    console.log('Show folder view:', this.showFolderView());
    console.log('Current folder ID:', this.currentFolderId());
    console.log('Selected app:', this.selectedApp());
  }

  ngOnDestroy() {
    if (this.loadingRequest) {
      this.loadingRequest.unsubscribe();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private i18n = inject(TranslationService);

  loadTemplates(useSkeletonLoading = false) {
    // Cancel any existing request
    if (this.loadingRequest) {
      this.loadingRequest.unsubscribe();
    }

    if (useSkeletonLoading) {
      this.skeletonLoading.set(true);
    } else {
      this.loading.set(true);
    }

    const params: any = {
      page: this.currentPage(),
      size: 12
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    // Add type filtering as server-side parameter
    if (this.selectedType() !== 'ALL') {
      params.type = this.selectedType();
    }

    // Add appName parameter for app-centric filtering
    const app = this.selectedApp();
    if (app) {
      params.appName = app.name;
    }

    console.log('loadTemplates called with params:', params);

    this.loadingRequest = this.http.get<PageResponse>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        console.log('loadTemplates response:', data);
        
        // Server-side filtering is now handled by params, no need for client-side filtering
        this.templates.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        // Don't update currentPage from response to avoid conflicts
        // this.currentPage.set(data.number);
        this.loading.set(false);
        this.skeletonLoading.set(false);
        this.loadingRequest = null;
      },
      error: (error) => {
        console.error('loadTemplates error:', error);
        this.loading.set(false);
        this.skeletonLoading.set(false);
        this.loadingRequest = null;
      }
    });
  }

  filterByType(type: string) {
    this.selectedType.set(type);
    this.currentPage.set(0);
    this.loadTemplates(true);
  }

  selectTypeFromDropdown(type: string) {
    this.filterByType(type);
    this.showFiltersDropdown.set(false);
  }

  getSelectedTypeLabel(): string {
    const selected = this.templateTypes.find(t => t.value === this.selectedType());
    const key = 'templates.type.' + (selected ? selected.value : 'ALL');
    return this.i18n.t(key);
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadTemplates();
    }, 500);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage.set(0);
    this.loadTemplates(true);
  }

  goToPage(page: number) {
    console.log('goToPage called with page:', page);
    if (page < 0 || page >= this.totalPages()) {
      console.warn('Invalid page number:', page, 'totalPages:', this.totalPages());
      return;
    }
    this.currentPage.set(page);
    this.loadTemplates(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openDeleteDialog(template: Template) {
    this.dialog.set({
      show: true,
      type: 'delete',
      template,
      loading: false
    });
  }

  openDuplicateDialog(template: Template) {
    this.dialog.set({
      show: true,
      type: 'duplicate',
      template,
      loading: false
    });
  }

  closeDialog() {
    this.dialog.set({
      show: false,
      type: null,
      template: null,
      loading: false
    });
  }

  confirmDialog() {
    const currentDialog = this.dialog();
    if (!currentDialog.template) return;

    this.dialog.update(d => ({ ...d, loading: true }));

    if (currentDialog.type === 'delete') {
      this.performDelete(currentDialog.template.id);
    } else if (currentDialog.type === 'duplicate') {
      this.performDuplicate(currentDialog.template.id);
    }
  }

  performDelete(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.closeDialog();
        this.loadTemplates(true);
      },
      error: () => {
        this.dialog.update(d => ({ ...d, loading: false }));
      }
    });
  }

  performDuplicate(id: number) {
    this.http.get<Template>(`${this.apiUrl}/${id}`).subscribe({
      next: (template) => {
        const duplicate = {
          name: template.name + ' (Copy)',
          type: template.type,
          htmlContent: template.htmlContent,
          cssStyles: template.cssStyles
        };
        this.http.post(this.apiUrl, duplicate).subscribe({
          next: () => {
            this.closeDialog();
            this.loadTemplates(true);
          },
          error: () => {
            this.dialog.update(d => ({ ...d, loading: false }));
          }
        });
      },
      error: () => {
        this.dialog.update(d => ({ ...d, loading: false }));
      }
    });
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      if (current < 4) {
        for (let i = 0; i < 5; i++) pages.push(i);
        pages.push(-1, total - 1);
      } else if (current > total - 5) {
        pages.push(0, -1);
        for (let i = total - 5; i < total; i++) pages.push(i);
      } else {
        pages.push(0, -1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1, total - 1);
      }
    }

    return pages;
  }

  createNew() {
    // Pass the current folder ID as a query parameter so the template editor knows which folder to associate the new template with
    const queryParams: any = {};
    
    if (this.currentFolderId()) {
      queryParams.folderId = this.currentFolderId();
    }
    
    // Also pass the application ID to ensure proper context
    const app = this.selectedApp();
    if (app) {
      queryParams.applicationId = app.id;
    }
    
    this.router.navigate(['/admin/template-editor'], { queryParams });
  }

  editTemplate(id: number) {
    this.router.navigate(['/admin/template-editor', id]);
  }

  getPreview(template: Template): string {
    return `<style>${template.cssStyles}</style>${template.htmlContent}`;
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString();
  }



  openAuditDialog(template: Template) {
    this.auditDialog.set({
      show: true,
      template,
      logs: [],
      loading: true
    });

    this.http.get<any>(`${this.dashboardApiUrl}/audit-logs/entity/TEMPLATE/${template.id}`).subscribe({
      next: (response) => {
        this.auditDialog.update(d => ({ ...d, logs: response.content, loading: false }));
      },
      error: () => {
        this.auditDialog.update(d => ({ ...d, loading: false }));
      }
    });
  }

  closeAuditDialog() {
    this.auditDialog.set({
      show: false,
      template: null,
      logs: [],
      loading: false
    });
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onSearchResultSelected(event: SearchNavigationEvent): void {
    if (event.type === 'template') {
      // Navigate to template editor
      this.editTemplate(event.id);
    } else if (event.type === 'folder') {
      // Navigate to the selected folder
      this.currentFolderId.set(event.id);
      // Make sure we're in folder view
      if (!this.showFolderView()) {
        this.showFolderView.set(true);
      }
    }
  }

  onSearchStateChanged(event: { query: string; hasResults: boolean }): void {
    // Update the search query for the existing search functionality
    this.searchQuery = event.query;
    
    // If there are search results from the comprehensive search,
    // we might want to hide the regular template list or show a different view
    if (event.hasResults && event.query) {
      // The search component is handling the display of results
      // We could hide the main template grid here if needed
    } else if (!event.query) {
      // If search is cleared, reload the regular template list
      this.loadTemplates();
    }
  }

  // Folder navigation methods
  onFolderSelected(folder: any): void {
    this.currentFolderId.set(folder?.id || null);
  }

  onTemplateSelected(template: any): void {
    this.editTemplate(template.id);
  }

  onBreadcrumbClicked(breadcrumb: any): void {
    // Handle null ID as root folder
    this.currentFolderId.set(breadcrumb.id || null);
  }

  toggleView(): void {
    this.showFolderView.set(!this.showFolderView());
    
    // If switching to legacy view, load templates using the old API
    if (!this.showFolderView()) {
      this.loadTemplates();
    }
  }

  createFolder(): void {
    this.newFolderName.set('');
    this.newFolderDescription.set('');
    this.newFolderImageUrl.set('');
    this.newFolderActive.set(true);
    this.showCreateFolderDialog.set(true);
  }

  confirmCreateFolder(): void {
    const app = this.selectedApp();
    const folderName = this.newFolderName().trim();
    
    if (!app) {
      console.error('No application selected');
      return;
    }

    if (!folderName) {
      return;
    }

    const folderRequest = {
      name: folderName,
      applicationId: app.id,
      parentId: this.currentFolderId(),
      sortOrder: 0,
      active: this.newFolderActive(),
      description: this.newFolderDescription().trim() || undefined,
      imageUrl: this.newFolderImageUrl().trim() || undefined
    };

    this.http.post(`${environment.apiUrl}/template-folders`, folderRequest).subscribe({
      next: (response) => {
        this.showCreateFolderDialog.set(false);
        this.newFolderName.set('');
        this.newFolderDescription.set('');
        this.newFolderImageUrl.set('');
        this.newFolderActive.set(true);
        
        // Trigger refresh by incrementing the refresh trigger
        this.refreshTrigger.set(this.refreshTrigger() + 1);
        
        console.log('Folder created successfully');
        this.toastService.success('Folder Created', 'Template folder created successfully');
      },
      error: (error) => {
        console.error('Error creating folder:', error);
        
        // Extract error message from backend response
        let errorMessage = 'Failed to create folder. Please try again.';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Show toast notification instead of alert
        this.toastService.error('Folder Creation Failed', errorMessage);
      }
    });
  }

  cancelCreateFolder(): void {
    this.showCreateFolderDialog.set(false);
    this.newFolderName.set('');
    this.newFolderDescription.set('');
    this.newFolderImageUrl.set('');
    this.newFolderActive.set(true);
  }
}

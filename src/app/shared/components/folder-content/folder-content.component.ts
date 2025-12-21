import { Component, Input, Output, EventEmitter, signal, computed, inject, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { FolderService, FolderContent, BreadcrumbItem } from '../../../core/services/folder.service';
import { Template, TemplateFolder } from '../../../core/models/template.model';
import { DragDropService } from '../../../core/services/drag-drop.service';
import { ToastService } from '../../../core/services/toast.service';

export interface ViewMode {
  type: 'grid' | 'list';
  label: string;
  icon: string;
}



@Component({
  selector: 'app-folder-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './folder-content.component.html',
  styleUrls: ['./folder-content.component.scss', './folder-actions.scss']
})
export class FolderContentComponent implements OnInit, OnDestroy, OnChanges {
  private destroy$ = new Subject<void>();
  private folderService = inject(FolderService);
  private dragDropService = inject(DragDropService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  // Input properties
  @Input() folderId: number | null = null;
  @Input() applicationId: number | null = null;
  @Input() showBreadcrumbs: boolean = true;
  @Input() enableDragDrop: boolean = true;
  @Input() refreshTrigger: number = 0; // Used to trigger refresh
  @Input() viewMode: 'grid' | 'list' = 'grid'; // View mode from parent

  // Output events
  @Output() folderSelected = new EventEmitter<TemplateFolder>();
  @Output() templateSelected = new EventEmitter<Template>();
  @Output() breadcrumbClicked = new EventEmitter<BreadcrumbItem>();
  @Output() createFolderRequested = new EventEmitter<void>();

  // Component state
  folderContent = signal<FolderContent | null>(null);
  loading = signal(false);
  currentViewMode = signal<'grid' | 'list'>('grid'); // Use signal instead of computed
  
  // Folder management dialogs
  showEditFolderDialog = signal(false);
  showDeleteFolderDialog = signal(false);
  editingFolder = signal<TemplateFolder | null>(null);
  editFolderName = signal('');
  editFolderDescription = signal('');
  editFolderImageUrl = signal('');
  editFolderActive = signal(true);
  folderActionLoading = signal(false);
  
  // Template management dialogs
  showDeleteTemplateDialog = signal(false);
  editingTemplate = signal<Template | null>(null);
  templateActionLoading = signal(false);
  
  // Pagination
  currentPage = signal(0);
  pageSize = signal(12); // Set to 12 for testing as requested
  totalPages = signal(0);
  totalElements = signal(0);

  viewModes: ViewMode[] = [
    { type: 'grid', label: 'Grid View', icon: 'M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z' },
    { type: 'list', label: 'List View', icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' }
  ];

  // Computed properties
  breadcrumbs = computed(() => this.folderContent()?.breadcrumbs || []);
  currentFolder = computed(() => this.folderContent()?.currentFolder || null);
  templates = computed(() => this.folderContent()?.templates || []);
  subfolders = computed(() => this.folderContent()?.subfolders || []);

  ngOnInit() {
    // Initialize view mode from input
    this.currentViewMode.set(this.viewMode);
    
    // Subscribe to folder service state
    this.folderService.currentFolder$
      .pipe(takeUntil(this.destroy$))
      .subscribe(folder => {
        if (folder) {
          this.loadFolderContent();
        }
      });

    // Load initial content when component initializes
    // This will load root folder content if folderId is null and applicationId is provided
    if (this.applicationId) {
      this.loadFolderContent();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // React to folderId changes
    if (changes['folderId'] && !changes['folderId'].firstChange) {
      this.loadFolderContent();
    }
    
    // React to applicationId changes
    if (changes['applicationId'] && !changes['applicationId'].firstChange) {
      this.loadFolderContent();
    }
    
    // React to refresh trigger changes
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.loadFolderContent();
    }
    
    // React to viewMode changes
    if (changes['viewMode']) {
      this.currentViewMode.set(changes['viewMode'].currentValue);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Content loading
  loadFolderContent() {
    if (!this.applicationId) {
      console.warn('No applicationId provided to folder-content component');
      return;
    }

    this.loading.set(true);
    
    if (this.folderId === null) {
      // Load root folder content
      this.loadRootFolderContent();
    } else {
      // Load specific folder content using the API endpoint
      const params = {
        applicationId: this.applicationId!.toString(),
        page: this.currentPage().toString(),
        size: this.pageSize().toString()
      };
      
      this.http.get<any>(`${environment.apiUrl}/template-folders/${this.folderId}/templates`, { params })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Full API response:', response);
            
            this.folderContent.set({
              currentFolder: response.currentFolder || null,
              templates: response.templates?.content || [],
              subfolders: response.subfolders || [],
              breadcrumbs: response.breadcrumbs || [],
              totalItems: response.totalItems || 0,
              isLoading: false
            });
            
            // Calculate combined pagination info
            const totalItems = response.totalItems || 0;
            const pageSize = this.pageSize();
            const calculatedTotalPages = Math.ceil(totalItems / pageSize);
            
            console.log('Folder content loaded:', {
              templatesCount: response.templates?.content?.length || 0,
              subfoldersCount: response.subfolders?.length || 0,
              totalItems: totalItems,
              calculatedTotalPages: calculatedTotalPages,
              currentPage: this.currentPage(),
              pageSize: pageSize,
              responseTemplates: response.templates
            });
            
            // Set pagination info based on combined total items
            this.totalPages.set(calculatedTotalPages);
            this.totalElements.set(totalItems);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error loading folder content:', error);
            this.loading.set(false);
          }
        });
    }
  }

  private loadRootFolderContent() {
    // Load root folder content using the dedicated API endpoint
    const params = {
      page: this.currentPage().toString(),
      size: this.pageSize().toString()
    };
    
    console.log(`Loading root folder content for application ${this.applicationId}`);
    console.log(`API call: ${environment.apiUrl}/template-folders/root/${this.applicationId}/templates`);
    
    this.http.get<any>(`${environment.apiUrl}/template-folders/root/${this.applicationId}/templates`, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Full root API response:', response);
          
          this.folderContent.set({
            currentFolder: response.currentFolder || null,
            templates: response.templates?.content || [],
            subfolders: response.subfolders || [],
            breadcrumbs: response.breadcrumbs || [],
            totalItems: response.totalItems || 0,
            isLoading: false
          });
          
          // Calculate combined pagination info
          const totalItems = response.totalItems || 0;
          const pageSize = this.pageSize();
          const calculatedTotalPages = Math.ceil(totalItems / pageSize);
          
          console.log('Root folder content loaded:', {
            templatesCount: response.templates?.content?.length || 0,
            subfoldersCount: response.subfolders?.length || 0,
            totalItems: totalItems,
            calculatedTotalPages: calculatedTotalPages,
            currentPage: this.currentPage(),
            pageSize: pageSize,
            responseTemplates: response.templates
          });
          
          // Set pagination info based on combined total items
          this.totalPages.set(calculatedTotalPages);
          this.totalElements.set(totalItems);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading root folder content:', error);
          this.loading.set(false);
        }
      });
  }

  // View mode is now managed by parent component

  // Navigation
  navigateToFolder(folder: TemplateFolder) {
    this.folderSelected.emit(folder);
  }

  navigateToBreadcrumb(breadcrumb: BreadcrumbItem) {
    this.breadcrumbClicked.emit(breadcrumb);
    this.loadFolderContent();
  }

  navigateToRoot() {
    const rootBreadcrumb: BreadcrumbItem = {
      id: null,
      name: 'Root',
      path: '/'
    };
    this.breadcrumbClicked.emit(rootBreadcrumb);
  }

  openTemplate(template: Template) {
    this.templateSelected.emit(template);
    this.router.navigate(['/admin/template-editor', template.id]);
  }

  // Pagination
  goToPage(page: number) {
    console.log('goToPage called:', {
      requestedPage: page,
      currentPage: this.currentPage(),
      totalPages: this.totalPages(),
      pageSize: this.pageSize()
    });
    
    if (page < 0 || page >= this.totalPages()) {
      console.warn('Invalid page number:', page, 'Total pages:', this.totalPages());
      return;
    }
    
    this.currentPage.set(page);
    this.loadFolderContent();
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

  getEndRange(): number {
    return Math.min((this.currentPage() + 1) * this.pageSize(), this.totalElements());
  }

  // Drag and drop
  onDragStart(event: DragEvent, item: Template | TemplateFolder) {
    if (!this.enableDragDrop) return;
    
    const currentFolder = this.currentFolder();
    if (!currentFolder) return;
    
    // Start drag operation using the service
    this.dragDropService.startDrag([item], currentFolder);
    
    // Set drag data for browser compatibility
    event.dataTransfer?.setData('text/plain', JSON.stringify({
      type: this.getItemType(item),
      id: item.id,
      name: item.name
    }));
  }

  onDragOver(event: DragEvent) {
    if (!this.enableDragDrop) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, targetFolder: TemplateFolder) {
    if (!this.enableDragDrop) return;
    
    event.preventDefault();
    
    if (this.applicationId) {
      const success = this.dragDropService.attemptDrop(targetFolder, this.applicationId);
      if (success) {
        // Reload content after successful drop
        this.loadFolderContent();
      }
    }
  }

  // Helper methods
  private buildBreadcrumbs(folder: TemplateFolder): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (folder.path) {
      const pathParts = folder.path.split('/').filter(part => part.length > 0);
      let currentPath = '';
      
      pathParts.forEach((part: string, index: number) => {
        currentPath += `/${part}`;
        breadcrumbs.push({
          id: index === pathParts.length - 1 ? folder.id : 0,
          name: part,
          path: currentPath
        });
      });
    }
    
    return breadcrumbs;
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

  getItemIcon(item: Template | TemplateFolder): string {
    if ('htmlContent' in item) {
      // Template
      switch (item.type) {
        case 'HTML': return '✉️';
        case 'TXT': return '📄';
        default: return '📄';
      }
    } else {
      // Folder
      return '📁';
    }
  }

  getItemType(item: Template | TemplateFolder): string {
    if ('htmlContent' in item) {
      return 'template';
    } else {
      return 'folder';
    }
  }

  requestCreateFolder(): void {
    this.createFolderRequested.emit();
  }

  // Folder management methods
  editFolder(folder: TemplateFolder, event?: Event): void {
    console.log('editFolder called with:', folder);
    if (event) {
      event.stopPropagation();
    }
    
    this.editingFolder.set(folder);
    this.editFolderName.set(folder.name);
    this.editFolderDescription.set(folder.description || '');
    this.editFolderImageUrl.set(folder.imageUrl || '');
    this.editFolderActive.set(folder.active !== false); // Default to true if undefined
    this.showEditFolderDialog.set(true);
    console.log('Edit dialog should be visible now');
  }

  deleteFolder(folder: TemplateFolder, event?: Event): void {
    console.log('deleteFolder called with:', folder);
    if (event) {
      event.stopPropagation();
    }
    
    this.editingFolder.set(folder);
    this.showDeleteFolderDialog.set(true);
    console.log('Delete dialog should be visible now');
  }

  confirmEditFolder(): void {
    console.log('confirmEditFolder called');
    const folder = this.editingFolder();
    const newName = this.editFolderName().trim();
    console.log('Folder to edit:', folder);
    console.log('New name:', newName);
    console.log('Application ID:', this.applicationId);
    
    if (!folder || !newName || !this.applicationId) {
      console.warn('Missing folder, name, or applicationId');
      return;
    }

    console.log('Starting edit operation...');
    this.folderActionLoading.set(true);

    const updateRequest = {
      name: newName,
      applicationId: this.applicationId,
      sortOrder: folder.sortOrder || 0,
      active: this.editFolderActive(),
      description: this.editFolderDescription().trim() || undefined,
      imageUrl: this.editFolderImageUrl().trim() || undefined
    };

    console.log('Making PUT request to:', `${environment.apiUrl}/template-folders/${folder.id}`, 'with body:', updateRequest);

    this.http.put(`${environment.apiUrl}/template-folders/${folder.id}`, updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Edit successful:', response);
          this.showEditFolderDialog.set(false);
          this.editingFolder.set(null);
          this.editFolderName.set('');
          this.editFolderDescription.set('');
          this.editFolderImageUrl.set('');
          this.editFolderActive.set(true);
          this.folderActionLoading.set(false);
          this.loadFolderContent(); // Refresh the content
          this.toastService.success('Folder Updated', 'Folder updated successfully');
        },
        error: (error) => {
          console.error('Error updating folder:', error);
          this.folderActionLoading.set(false);
          
          // Extract error message from backend response
          let errorMessage = 'Failed to update folder. Please try again.';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.toastService.error('Folder Update Failed', errorMessage);
        }
      });
  }

  confirmDeleteFolder(): void {
    console.log('confirmDeleteFolder called');
    const folder = this.editingFolder();
    console.log('Folder to delete:', folder);
    console.log('Application ID:', this.applicationId);
    
    if (!folder || !this.applicationId) {
      console.warn('Missing folder or applicationId');
      return;
    }

    console.log('Starting delete operation...');
    this.folderActionLoading.set(true);

    const params = {
      applicationId: this.applicationId.toString()
    };

    console.log('Making DELETE request to:', `${environment.apiUrl}/template-folders/${folder.id}`, 'with params:', params);

    this.http.delete(`${environment.apiUrl}/template-folders/${folder.id}`, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Delete successful:', response);
          this.showDeleteFolderDialog.set(false);
          this.editingFolder.set(null);
          this.folderActionLoading.set(false);
          this.loadFolderContent(); // Refresh the content
          this.toastService.success('Folder Deleted', 'Folder deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting folder:', error);
          this.folderActionLoading.set(false);
          
          // Extract error message from backend response
          let errorMessage = 'Failed to delete folder. The folder may not be empty or you may not have permission.';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.toastService.error('Folder Deletion Failed', errorMessage);
        }
      });
  }

  cancelFolderDialog(): void {
    this.showEditFolderDialog.set(false);
    this.showDeleteFolderDialog.set(false);
    this.editingFolder.set(null);
    this.editFolderName.set('');
    this.editFolderDescription.set('');
    this.editFolderImageUrl.set('');
    this.editFolderActive.set(true);
    this.folderActionLoading.set(false);
  }

  // Template management methods
  deleteTemplate(template: Template, event?: Event): void {
    console.log('deleteTemplate called with:', template);
    if (event) {
      event.stopPropagation();
    }
    
    this.editingTemplate.set(template);
    this.showDeleteTemplateDialog.set(true);
    console.log('Delete template dialog should be visible now');
  }

  confirmDeleteTemplate(): void {
    console.log('confirmDeleteTemplate called');
    const template = this.editingTemplate();
    console.log('Template to delete:', template);
    console.log('Application ID:', this.applicationId);
    
    if (!template || !this.applicationId) {
      console.warn('Missing template or applicationId');
      return;
    }

    console.log('Starting template delete operation...');
    this.templateActionLoading.set(true);

    console.log('Making DELETE request to:', `${environment.apiUrl}/template-editor/${template.id}`);

    this.http.delete(`${environment.apiUrl}/template-editor/${template.id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Template delete successful:', response);
          this.showDeleteTemplateDialog.set(false);
          this.editingTemplate.set(null);
          this.templateActionLoading.set(false);
          this.loadFolderContent(); // Refresh the content
          this.toastService.success('Template Deleted', 'Template deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting template:', error);
          this.templateActionLoading.set(false);
          
          // Extract error message from backend response
          let errorMessage = 'Failed to delete template. Please try again.';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.toastService.error('Template Deletion Failed', errorMessage);
        }
      });
  }

  cancelTemplateDialog(): void {
    this.showDeleteTemplateDialog.set(false);
    this.editingTemplate.set(null);
    this.templateActionLoading.set(false);
  }

  // Image error handling
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // The template will show the default folder icon when the image is hidden
  }

  // Toggle folder status
  toggleFolderStatus(folder: TemplateFolder, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    console.log('Toggling folder status for:', folder);
    
    // Use PUT method and include applicationId as query parameter
    const params = { applicationId: this.applicationId!.toString() };
    
    this.http.put(`${environment.apiUrl}/template-folders/${folder.id}/toggle-status`, {}, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Folder status toggled successfully:', response);
          this.loadFolderContent(); // Refresh the content to show updated status
          const statusText = response.active ? 'activated' : 'deactivated';
          this.toastService.success('Folder Status Updated', `Folder ${statusText} successfully`);
        },
        error: (error) => {
          console.error('Error toggling folder status:', error);
          
          let errorMessage = 'Failed to update folder status. Please try again.';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.toastService.error('Status Update Failed', errorMessage);
        }
      });
  }
}
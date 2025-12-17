import { Component, signal, inject, OnInit, OnDestroy, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { MediaService, MediaFile, MediaFolder, PagedResponse, CreateFolderRequest } from '../../../core/services/media.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, HasPermissionDirective],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent implements OnInit, OnDestroy {
  private mediaService = inject(MediaService);
  private errorHandler = inject(ErrorHandlerService);
  private toastService = inject(ToastService);
  private permissionService = inject(PermissionService);
  appContext = inject(AppContextService);

  // Permission checks
  canCreateMedia = computed(() => this.permissionService.canCreate('media'));
  canUpdateMedia = computed(() => this.permissionService.canUpdate('media'));
  canDeleteMedia = computed(() => this.permissionService.canDelete('media'));

  // Component instance identifier
  componentId = Math.random().toString(36).substring(2, 11);

  // App context
  selectedApp = this.appContext.selectedApp;
  hasApps = this.appContext.hasApps;

  // State
  files = signal<PagedResponse<MediaFile>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
    first: true,
    last: true
  });
  
  folders = signal<MediaFolder[]>([]);
  currentFolder = signal<MediaFolder | null>(null);
  breadcrumbs = signal<MediaFolder[]>([]);
  
  isLoading = signal(false);
  selectedFile = signal<MediaFile | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');
  
  // Filters
  searchTerm = '';
  selectedFileType = '';
  currentPage = 0;
  pageSize = 20;
  
  // Upload
  showUploadDialog = signal(false);
  selectedFiles = signal<File[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);

  // Folder Management
  showCreateFolderDialog = signal(false);
  newFolderName = signal('');

  // Storage Provider Management
  showStorageSettingsDialog = signal(false);
  currentStorageProvider = signal<any>(null);
  selectedProviderType = signal<string | null>(null);
  isSavingProvider = signal(false);
  
  // Provider configuration
  providerConfig = {
    accessKey: '',
    secretKey: '',
    bucketName: '',
    region: '',
    credentials: '',
    folderId: '',
    description: '',
    // Cloudflare R2 specific fields
    accessKeyId: '',
    secretAccessKey: '',
    accountId: '',
    endpoint: '',
    publicAccess: false,
    customDomain: ''
  };

  // Available storage providers
  availableProviders = [
    {
      type: 'LOCAL',
      name: 'Local Storage',
      description: 'Store files on the local server filesystem'
    },
    {
      type: 'AWS_S3',
      name: 'Amazon S3',
      description: 'Store files in Amazon S3 cloud storage'
    },
    {
      type: 'CLOUDFLARE_R2',
      name: 'Cloudflare R2',
      description: 'Store files in Cloudflare R2 object storage'
    },
    {
      type: 'GOOGLE_DRIVE',
      name: 'Google Drive',
      description: 'Store files in Google Drive cloud storage'
    }
  ];

  constructor() {
    console.log('MediaComponent constructor called - Instance ID:', this.componentId);
    console.log('MediaComponent instances count:', (window as any).mediaComponentInstances = ((window as any).mediaComponentInstances || 0) + 1);
    // Watch for app changes and reload files
    effect(() => {
      const app = this.selectedApp();
      console.log('Media - App changed:', app);
      if (app) {
        console.log('Loading media files for app:', app.name);
        // Use setTimeout to ensure the effect runs after the component is fully initialized
        setTimeout(() => {
          this.loadFolders();
          this.loadFiles();
        }, 0);
      } else {
        // Clear files and folders when no app is selected
        this.files.set({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 20,
          number: 0,
          first: true,
          last: true
        });
        this.folders.set([]);
        this.currentFolder.set(null);
        this.breadcrumbs.set([]);
      }
    });
  }

  ngOnInit() {
    // Data will be loaded automatically when app is selected via effect
    // No need to load here as effect will handle both initial load and app changes
    console.log('MediaComponent ngOnInit - Instance:', this.componentId);
  }

  ngOnDestroy() {
    console.log('MediaComponent ngOnDestroy - Instance:', this.componentId);
    // Clean up any subscriptions or effects if needed
  }

  loadFolders() {
    const app = this.selectedApp();
    if (!app) {
      this.folders.set([]);
      return;
    }

    const currentFolderId = this.currentFolder()?.id;
    
    this.mediaService.getFolders(currentFolderId).subscribe({
      next: (folders) => {
        console.log('Loaded folders:', folders);
        folders.forEach(folder => {
          console.log(`Folder ID: ${folder.id}, Name: "${folder.name}", Length: ${folder.name?.length}`);
        });
        this.folders.set(folders);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'load_folders');
        this.folders.set([]);
      }
    });
  }

  loadFiles() {
    const app = this.selectedApp();
    if (!app) {
      console.log('No app selected, clearing files');
      this.files.set({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 20,
        number: 0,
        first: true,
        last: true
      });
      return;
    }

    this.isLoading.set(true);
    
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      search: this.searchTerm || undefined,
      mimeType: this.selectedFileType || undefined,
      folderId: this.currentFolder()?.id,
      sort: 'updatedAt,desc'
    };

    this.mediaService.getFiles(params).subscribe({
      next: (response) => {
        this.files.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'load_files');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange() {
    this.currentPage = 0;
    this.loadFiles();
  }

  onFilterChange() {
    this.currentPage = 0;
    this.loadFiles();
  }

  // Folder Navigation
  navigateToFolder(folder: MediaFolder | null) {
    this.currentFolder.set(folder);
    this.updateBreadcrumbs();
    this.currentPage = 0;
    this.loadFolders();
    this.loadFiles();
  }

  navigateToParent() {
    const current = this.currentFolder();
    if (current && current.parentId) {
      // Find parent folder from breadcrumbs or load it
      const breadcrumbs = this.breadcrumbs();
      const parentFolder = breadcrumbs.find(f => f.id === current.parentId);
      this.navigateToFolder(parentFolder || null);
    } else {
      this.navigateToFolder(null); // Go to root
    }
  }

  navigateToRoot() {
    this.navigateToFolder(null);
  }

  private updateBreadcrumbs() {
    const current = this.currentFolder();
    if (!current) {
      this.breadcrumbs.set([]);
      return;
    }

    // Build breadcrumb trail
    const trail: MediaFolder[] = [];
    let folder: MediaFolder | null = current;
    
    while (folder) {
      trail.unshift(folder);
      // For now, we'll just break if we don't have parent info
      // In a full implementation, we'd load the parent chain
      break;
    }
    
    this.breadcrumbs.set(trail);
  }

  // Folder Management
  openCreateFolderDialog() {
    this.showCreateFolderDialog.set(true);
    this.newFolderName.set('');
  }

  closeCreateFolderDialog() {
    this.showCreateFolderDialog.set(false);
    this.newFolderName.set('');
  }

  createFolder() {
    const name = this.newFolderName().trim();
    if (!name) return;

    const request: CreateFolderRequest = {
      name,
      parentId: this.currentFolder()?.id,
      isPublic: false
    };

    this.mediaService.createFolder(request).subscribe({
      next: () => {
        this.toastService.success('Folder created successfully');
        this.closeCreateFolderDialog();
        this.loadFolders();
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'create_folder');
      }
    });
  }

  deleteFolder(folder: MediaFolder) {
    if (confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
      this.mediaService.deleteFolder(folder.id).subscribe({
        next: () => {
          this.toastService.success('Folder deleted successfully');
          this.loadFolders();
        },
        error: (error) => {
          this.errorHandler.handleError(error, 'delete_folder');
        }
      });
    }
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
    localStorage.setItem('media-view-mode', mode);
  }

  selectFile(file: MediaFile) {
    this.selectedFile.set(file);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadFiles();
  }

  // Upload Methods
  openUploadDialog() {
    this.showUploadDialog.set(true);
    this.selectedFiles.set([]);
  }

  closeUploadDialog() {
    this.showUploadDialog.set(false);
    this.selectedFiles.set([]);
    this.isDragOver.set(false);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver.set(false);
    
    const files = Array.from(event.dataTransfer?.files || []);
    this.addFiles(files);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.addFiles(files);
  }

  addFiles(newFiles: File[]) {
    const currentFiles = this.selectedFiles();
    const allFiles = [...currentFiles, ...newFiles];
    this.selectedFiles.set(allFiles);
  }

  removeFile(fileToRemove: File) {
    const currentFiles = this.selectedFiles();
    const updatedFiles = currentFiles.filter(file => file !== fileToRemove);
    this.selectedFiles.set(updatedFiles);
  }

  uploadFiles() {
    const files = this.selectedFiles();
    if (files.length === 0) return;

    this.isUploading.set(true);
    let completedUploads = 0;
    let hasErrors = false;

    files.forEach(file => {
      this.mediaService.uploadFile({ 
        file, 
        isPublic: true, 
        folderId: this.currentFolder()?.id 
      }).subscribe({
        next: () => {
          completedUploads++;
          if (completedUploads === files.length) {
            this.isUploading.set(false);
            if (!hasErrors) {
              this.toastService.success(`Successfully uploaded ${files.length} file(s)`);
              this.closeUploadDialog();
              this.loadFiles();
            }
          }
        },
        error: (error) => {
          hasErrors = true;
          completedUploads++;
          
          this.errorHandler.handleError(error, 'upload_media');
          
          if (completedUploads === files.length) {
            this.isUploading.set(false);
          }
        }
      });
    });
  }

  // File Actions
  openFileInNewTab(file: MediaFile) {
    if (file.publicUrl) {
      window.open(file.publicUrl, '_blank');
    } else {
      this.mediaService.generateFileUrl(file.id, 'PUBLIC').subscribe({
        next: (urlResponse) => {
          window.open(urlResponse.url, '_blank');
        },
        error: (error) => {
          this.errorHandler.handleError(error, 'generate_file_url');
        }
      });
    }
  }

  downloadFile(file: MediaFile) {
    // Use the download endpoint for proper file download
    this.mediaService.downloadFile(file.id).subscribe({
      next: (response) => {
        // Create blob and download
        const blob = new Blob([response], { type: file.mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'download_file');
        // Fallback to opening in new tab
        this.openFileInNewTab(file);
      }
    });
  }

  deleteFile(file: MediaFile) {
    if (confirm(`Are you sure you want to delete "${file.originalFilename}"?`)) {
      this.mediaService.deleteFile(file.id).subscribe({
        next: () => {
          this.toastService.success('File deleted successfully');
          this.loadFiles();
          if (this.selectedFile()?.id === file.id) {
            this.selectedFile.set(null);
          }
        },
        error: (error) => {
          this.errorHandler.handleError(error, 'delete_file');
        }
      });
    }
  }

  // Utility Methods
  getFileIcon(file: MediaFile): string {
    return this.mediaService.getFileIcon(file);
  }

  getFileTypeColor(file: MediaFile): string {
    return this.mediaService.getFileTypeColor(file);
  }

  formatFileSize(bytes: number): string {
    return this.mediaService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Storage Provider Management Methods
  openStorageSettingsDialog() {
    console.log('Opening storage settings dialog...');
    this.showStorageSettingsDialog.set(true);
    this.loadCurrentStorageProvider();
  }

  closeStorageSettingsDialog() {
    this.showStorageSettingsDialog.set(false);
    this.selectedProviderType.set(null);
    this.resetProviderConfig();
  }

  loadCurrentStorageProvider() {
    this.mediaService.getCurrentStorageProvider().subscribe({
      next: (provider) => {
        this.currentStorageProvider.set(provider);
        console.log('Current storage provider loaded:', provider);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'load_storage_provider');
        // Fallback to local storage as default
        this.currentStorageProvider.set({
          providerType: 'LOCAL',
          description: 'Default local file storage',
          config: {}
        });
      }
    });
  }

  selectProvider(providerType: string) {
    this.selectedProviderType.set(providerType);
    
    // If selecting the current active provider, pre-fill with existing configuration
    const currentProvider = this.currentStorageProvider();
    if (currentProvider && currentProvider.providerType === providerType && currentProvider.config) {
      this.loadProviderConfig(currentProvider.config);
    } else {
      this.resetProviderConfig();
    }
  }

  loadProviderConfig(config: any) {
    this.providerConfig = {
      accessKey: config.accessKey || '',
      secretKey: config.secretKey || '',
      bucketName: config.bucketName || '',
      region: config.region || '',
      credentials: config.credentials || config.serviceAccountJson || '', // Support both field names
      folderId: config.folderId || '',
      description: config.description || '',
      // Cloudflare R2 specific fields
      accessKeyId: config.accessKeyId || '',
      secretAccessKey: config.secretAccessKey || '',
      accountId: config.accountId || '',
      endpoint: config.endpoint || '',
      publicAccess: config.publicAccess || false,
      customDomain: config.customDomain || ''
    };
  }

  resetProviderConfig() {
    this.providerConfig = {
      accessKey: '',
      secretKey: '',
      bucketName: '',
      region: '',
      credentials: '',
      folderId: '',
      description: '',
      // Cloudflare R2 specific fields
      accessKeyId: '',
      secretAccessKey: '',
      accountId: '',
      endpoint: '',
      publicAccess: false,
      customDomain: ''
    };
  }

  getProviderDisplayName(providerType: string): string {
    const provider = this.availableProviders.find(p => p.type === providerType);
    return provider ? provider.name : providerType;
  }

  isProviderConfigValid(): boolean {
    const selectedType = this.selectedProviderType();
    if (!selectedType) return false;

    if (selectedType === 'LOCAL') return true;

    if (selectedType === 'AWS_S3') {
      return !!(this.providerConfig.accessKey && 
                this.providerConfig.secretKey && 
                this.providerConfig.bucketName && 
                this.providerConfig.region);
    }

    if (selectedType === 'CLOUDFLARE_R2') {
      return !!(this.providerConfig.accessKeyId && 
                this.providerConfig.secretAccessKey && 
                this.providerConfig.bucketName && 
                this.providerConfig.accountId);
    }

    if (selectedType === 'GOOGLE_DRIVE') {
      return !!(this.providerConfig.credentials);
    }

    return false;
  }

  saveProviderConfig() {
    if (!this.isProviderConfigValid()) return;

    this.isSavingProvider.set(true);

    // Map frontend config to backend expected format
    let config: any = { ...this.providerConfig };
    if (this.selectedProviderType() === 'GOOGLE_DRIVE') {
      // Map 'credentials' to 'serviceAccountJson' for backend
      config.serviceAccountJson = this.providerConfig.credentials;
      delete config.credentials; // Remove the frontend field
    }

    const providerData = {
      providerType: this.selectedProviderType(),
      config: config,
      description: this.providerConfig.description || `${this.getProviderDisplayName(this.selectedProviderType()!)} configuration`
    };

    console.log('Saving storage provider configuration:', providerData);

    this.mediaService.saveStorageProvider(providerData).subscribe({
      next: (response) => {
        // Update current provider
        this.currentStorageProvider.set({
          providerType: this.selectedProviderType(),
          description: providerData.description,
          config: this.providerConfig
        });

        this.isSavingProvider.set(false);
        this.closeStorageSettingsDialog();
        
        this.toastService.success('Storage provider configured successfully');
      },
      error: (error) => {
        this.isSavingProvider.set(false);
        this.errorHandler.handleError(error, 'storage_provider_save');
      }
    });
  }

  testProviderConnection() {
    if (!this.isProviderConfigValid()) return;

    // Map frontend config to backend expected format
    let config: any = { ...this.providerConfig };
    if (this.selectedProviderType() === 'GOOGLE_DRIVE') {
      // Map 'credentials' to 'serviceAccountJson' for backend
      config.serviceAccountJson = this.providerConfig.credentials;
      delete config.credentials; // Remove the frontend field
    }

    const providerData = {
      providerType: this.selectedProviderType(),
      config: config
    };

    console.log('Testing storage provider connection:', providerData);

    this.mediaService.testStorageProvider(providerData).subscribe({
      next: (response) => {
        console.log('Test connection response:', response);
        this.toastService.success('Connection test passed', 'Storage provider connection is working correctly');
      },
      error: (error) => {
        console.error('Test connection error:', error);
        this.errorHandler.handleError(error, 'storage_provider_test');
      }
    });
  }
}
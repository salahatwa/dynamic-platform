import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { MediaService, MediaFile, MediaFolder, PagedResponse, CreateFolderRequest } from '../../../core/services/media.service';
import { AppContextService } from '../../../core/services/app-context.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, HasPermissionDirective],
  templateUrl: './media.component.html',
  styleUrl: './media.component.scss'
})
export class MediaComponent implements OnInit {
  private mediaService = inject(MediaService);
  appContext = inject(AppContextService);
  // private toastService = inject(ToastService);

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
    description: ''
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
      type: 'GOOGLE_DRIVE',
      name: 'Google Drive',
      description: 'Store files in Google Drive cloud storage'
    }
  ];

  constructor() {
    const instanceId = Math.random().toString(36).substring(2, 11);
    console.log('MediaComponent constructor called - Instance ID:', instanceId);
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
        console.error('Error loading folders:', error);
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
        console.error('Error loading files:', error);
        console.error('Failed to load files');
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
        console.log('Folder created successfully');
        this.closeCreateFolderDialog();
        this.loadFolders();
      },
      error: (error) => {
        console.error('Error creating folder:', error);
        console.error('Failed to create folder');
      }
    });
  }

  deleteFolder(folder: MediaFolder) {
    if (confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
      this.mediaService.deleteFolder(folder.id).subscribe({
        next: () => {
          console.log('Folder deleted successfully');
          this.loadFolders();
        },
        error: (error) => {
          console.error('Error deleting folder:', error);
          console.error('Failed to delete folder');
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
              console.log(`Successfully uploaded ${files.length} file(s)`);
              this.closeUploadDialog();
              this.loadFiles();
            }
          }
        },
        error: (error) => {
          console.error('Upload error:', error);
          hasErrors = true;
          completedUploads++;
          
          if (completedUploads === files.length) {
            this.isUploading.set(false);
            console.error('Some files failed to upload');
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
          console.error('Error generating file URL:', error);
          console.error('Failed to open file');
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
        console.error('Error downloading file:', error);
        console.error('Failed to download file');
        // Fallback to opening in new tab
        this.openFileInNewTab(file);
      }
    });
  }

  deleteFile(file: MediaFile) {
    if (confirm(`Are you sure you want to delete "${file.originalFilename}"?`)) {
      this.mediaService.deleteFile(file.id).subscribe({
        next: () => {
          console.log('File deleted successfully');
          this.loadFiles();
          if (this.selectedFile()?.id === file.id) {
            this.selectedFile.set(null);
          }
        },
        error: (error) => {
          console.error('Error deleting file:', error);
          console.error('Failed to delete file');
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
        console.error('Error loading current storage provider:', error);
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
      credentials: config.credentials || '',
      folderId: config.folderId || '',
      description: config.description || ''
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
      description: ''
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

    if (selectedType === 'GOOGLE_DRIVE') {
      return !!(this.providerConfig.credentials);
    }

    return false;
  }

  saveProviderConfig() {
    if (!this.isProviderConfigValid()) return;

    this.isSavingProvider.set(true);

    const providerData = {
      providerType: this.selectedProviderType(),
      config: this.providerConfig,
      description: this.providerConfig.description || `${this.getProviderDisplayName(this.selectedProviderType()!)} configuration`
    };

    console.log('Saving storage provider configuration:', providerData);

    this.mediaService.saveStorageProvider(providerData).subscribe({
      next: (response) => {
        console.log('Storage provider configuration saved successfully:', response);
        
        // Update current provider
        this.currentStorageProvider.set({
          providerType: this.selectedProviderType(),
          description: providerData.description,
          config: this.providerConfig
        });

        this.isSavingProvider.set(false);
        this.closeStorageSettingsDialog();
        
        // Show success message
        console.log('Storage provider configured successfully');
      },
      error: (error) => {
        console.error('Error saving storage provider configuration:', error);
        this.isSavingProvider.set(false);
        
        // Show error message
        console.error('Failed to save storage provider configuration');
      }
    });
  }

  testProviderConnection() {
    if (!this.isProviderConfigValid()) return;

    const providerData = {
      providerType: this.selectedProviderType(),
      config: this.providerConfig
    };

    console.log('Testing storage provider connection:', providerData);

    this.mediaService.testStorageProvider(providerData).subscribe({
      next: (response) => {
        console.log('Storage provider connection test successful:', response);
        console.log('Connection test passed');
      },
      error: (error) => {
        console.error('Storage provider connection test failed:', error);
        console.error('Connection test failed');
      }
    });
  }
}
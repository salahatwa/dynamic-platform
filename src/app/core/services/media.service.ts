import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppContextService } from './app-context.service';

export interface MediaFile {
  id: number;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  fileSizeFormatted: string;
  fileHash: string;
  folderId?: number;
  folderName?: string;
  folderPath: string;
  providerType: string;
  providerKey: string;
  publicUrl?: string;
  isPublic: boolean;
  status: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  isImage: boolean;
  isVideo: boolean;
  isDocument: boolean;
  downloadUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
}

export interface MediaFolder {
  id: number;
  name: string;
  path: string;
  fullPath: string;
  parentId?: number;
  parentName?: string;
  isPublic: boolean;
  isRoot: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  childFolderCount: number;
  fileCount: number;
  totalSize: number;
  totalSizeFormatted: string;
  children?: MediaFolder[];
  files?: MediaFile[];
}

export interface MediaUploadRequest {
  file: File;
  folderId?: number;
  filename?: string;
  isPublic?: boolean;
  description?: string;
  providerType?: string;
}

export interface CreateFolderRequest {
  name: string;
  parentId?: number;
  isPublic?: boolean;
  description?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  parentId?: number;
  isPublic?: boolean;
  description?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private appContext = inject(AppContextService);
  private apiUrl = `${environment.apiUrl}/media`;

  // File Operations
  uploadFile(request: MediaUploadRequest): Observable<MediaFile> {
    const formData = new FormData();
    formData.append('file', request.file);
    
    if (request.folderId) {
      formData.append('folderId', request.folderId.toString());
    }
    if (request.filename) {
      formData.append('filename', request.filename);
    }
    if (request.isPublic !== undefined) {
      formData.append('isPublic', request.isPublic.toString());
    }
    if (request.description) {
      formData.append('description', request.description);
    }
    if (request.providerType) {
      formData.append('providerType', request.providerType);
    }

    // Add appId as query parameter
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }

    return this.http.post<MediaFile>(`${this.apiUrl}/upload`, formData, { params });
  }

  getFiles(params: {
    folderId?: number;
    mimeType?: string;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
  } = {}): Observable<PagedResponse<MediaFile>> {
    let httpParams = new HttpParams();
    
    if (params.folderId) {
      httpParams = httpParams.set('folderId', params.folderId.toString());
    }
    if (params.mimeType) {
      httpParams = httpParams.set('mimeType', params.mimeType);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    // Add appId parameter
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      httpParams = httpParams.set('appId', currentApp.id.toString());
    }

    return this.http.get<PagedResponse<MediaFile>>(`${this.apiUrl}/files`, { params: httpParams });
  }

  getFile(id: number): Observable<MediaFile> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }

    return this.http.get<MediaFile>(`${this.apiUrl}/files/${id}`, { params });
  }

  deleteFile(id: number): Observable<void> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }

    return this.http.delete<void>(`${this.apiUrl}/files/${id}`, { params });
  }

  generateFileUrl(id: number, accessType: 'PUBLIC' | 'SIGNED' | 'PRIVATE' = 'PUBLIC'): Observable<{ url: string }> {
    let params = new HttpParams().set('accessType', accessType);
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }

    return this.http.post<{ url: string }>(`${this.apiUrl}/files/${id}/url`, null, { params });
  }

  downloadFile(id: number): Observable<ArrayBuffer> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }

    return this.http.get(`${this.apiUrl}/files/${id}/download`, { 
      params, 
      responseType: 'arraybuffer' 
    });
  }

  // Folder Operations
  getFolders(parentId?: number): Observable<MediaFolder[]> {
    let params = new HttpParams();
    if (parentId) {
      params = params.set('parentId', parentId.toString());
    }
    
    // Add appId parameter
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.get<MediaFolder[]>(`${this.apiUrl}/folders`, { params });
  }

  createFolder(request: CreateFolderRequest): Observable<MediaFolder> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.post<MediaFolder>(`${this.apiUrl}/folders`, request, { params });
  }

  updateFolder(id: number, request: UpdateFolderRequest): Observable<MediaFolder> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.put<MediaFolder>(`${this.apiUrl}/folders/${id}`, request, { params });
  }

  deleteFolder(id: number): Observable<void> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.delete<void>(`${this.apiUrl}/folders/${id}`, { params });
  }

  getFolderTree(id: number): Observable<MediaFolder> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.get<MediaFolder>(`${this.apiUrl}/folders/${id}/tree`, { params });
  }

  // Utility Methods
  getFileIcon(file: MediaFile): string {
    if (file.isImage) {
      return 'image';
    } else if (file.isVideo) {
      return 'video_file';
    } else if (file.isDocument) {
      return 'description';
    } else {
      return 'insert_drive_file';
    }
  }

  getFileTypeColor(file: MediaFile): string {
    if (file.isImage) {
      return 'text-green-600';
    } else if (file.isVideo) {
      return 'text-blue-600';
    } else if (file.isDocument) {
      return 'text-red-600';
    } else {
      return 'text-gray-600';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Storage Provider Management
  getCurrentStorageProvider(): Observable<any> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.get<any>(`${this.apiUrl}/providers/current`, { params });
  }

  getStorageProviders(): Observable<any[]> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/providers`, { params });
  }

  saveStorageProvider(providerConfig: any): Observable<any> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.post<any>(`${this.apiUrl}/providers`, providerConfig, { params });
  }

  testStorageProvider(providerConfig: any): Observable<any> {
    let params = new HttpParams();
    const currentApp = this.appContext.selectedApp();
    if (currentApp) {
      params = params.set('appId', currentApp.id.toString());
    }
    
    return this.http.post<any>(`${this.apiUrl}/providers/test`, providerConfig, { params });
  }
}
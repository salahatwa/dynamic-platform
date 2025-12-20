import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TemplateFolder, Template } from '../models/template.model';

export interface FolderTreeNode {
  id: number;
  name: string;
  parentId: number | null;
  children: FolderTreeNode[];
  isExpanded: boolean;
  isLoading: boolean;
  hasChildren: boolean;
  permissions: FolderPermissions;
  templateCount: number;
  subfolderCount: number;
  path: string;
  level: number;
}

export interface FolderPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface FolderContent {
  currentFolder: TemplateFolder;
  templates: Template[];
  subfolders: TemplateFolder[];
  breadcrumbs: BreadcrumbItem[];
  totalItems: number;
  isLoading: boolean;
}

export interface BreadcrumbItem {
  id: number | null;
  name: string;
  path: string;
}

export interface FolderTreeResponse {
  rootFolder: FolderTreeNode;
  totalFolders: number;
}

export interface CreateFolderRequest {
  name: string;
  parentId: number | null;
  applicationId: number;
}

export interface MoveFolderRequest {
  targetParentId: number | null;
  position?: number;
}

export interface FolderTemplatesResponse {
  templates: Template[];
  folder: TemplateFolder;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface BulkMoveRequest {
  templateIds: number[];
  targetFolderId: number;
}

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  private apiUrl = environment.apiUrl;
  
  // Reactive state management
  private currentFolderSubject = new BehaviorSubject<TemplateFolder | null>(null);
  private folderTreeSubject = new BehaviorSubject<FolderTreeNode | null>(null);
  private breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  
  // Public observables
  currentFolder$ = this.currentFolderSubject.asObservable();
  folderTree$ = this.folderTreeSubject.asObservable();
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();
  
  // Signals for reactive UI
  isLoading = signal(false);
  selectedItems = signal<(Template | TemplateFolder)[]>([]);

  constructor(private http: HttpClient) {}

  // Folder Tree Operations
  getFolderTree(applicationId: number): Observable<FolderTreeResponse> {
    this.isLoading.set(true);
    return this.http.get<FolderTreeResponse>(`${this.apiUrl}/template-folders/tree/${applicationId}`)
      .pipe(
        tap(response => {
          this.folderTreeSubject.next(response.rootFolder);
          this.isLoading.set(false);
        })
      );
  }

  // Folder CRUD Operations
  createFolder(request: CreateFolderRequest): Observable<TemplateFolder> {
    return this.http.post<TemplateFolder>(`${this.apiUrl}/template-folders`, request);
  }

  updateFolder(id: number, request: Partial<CreateFolderRequest>): Observable<TemplateFolder> {
    return this.http.put<TemplateFolder>(`${this.apiUrl}/template-folders/${id}`, request);
  }

  deleteFolder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/template-folders/${id}`);
  }

  moveFolder(id: number, request: MoveFolderRequest): Observable<TemplateFolder> {
    return this.http.put<TemplateFolder>(`${this.apiUrl}/template-folders/${id}/move`, request);
  }

  // Folder Content Operations
  getFolderContent(folderId: number, page: number = 0, size: number = 20): Observable<FolderTemplatesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    this.isLoading.set(true);
    return this.http.get<FolderTemplatesResponse>(`${this.apiUrl}/templates/folder/${folderId}`, { params })
      .pipe(
        tap(response => {
          this.currentFolderSubject.next(response.folder);
          this.updateBreadcrumbs(response.folder);
          this.isLoading.set(false);
        })
      );
  }

  getRootContent(applicationId: number, page: number = 0, size: number = 20): Observable<FolderTemplatesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    this.isLoading.set(true);
    return this.http.get<FolderTemplatesResponse>(`${this.apiUrl}/template-folders/root/${applicationId}/templates`, { params })
      .pipe(
        tap(response => {
          this.currentFolderSubject.next(null); // Root has no current folder
          this.isLoading.set(false);
        })
      );
  }

  // Lazy Loading for Tree Nodes
  loadFolderChildren(folderId: number): Observable<FolderTreeNode[]> {
    return this.http.get<FolderTreeNode[]>(`${this.apiUrl}/template-folders/${folderId}/children`);
  }

  // Bulk Operations
  bulkMoveTemplates(request: BulkMoveRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/templates/bulk-move`, request);
  }

  bulkCopyTemplates(templateIds: number[], targetFolderId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/templates/bulk-copy`, {
      templateIds,
      targetFolderId
    });
  }

  bulkDeleteTemplates(templateIds: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/bulk-delete`, {
      body: { templateIds }
    });
  }

  // Search Operations
  searchFolders(query: string, applicationId: number): Observable<TemplateFolder[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('applicationId', applicationId.toString());
    
    return this.http.get<TemplateFolder[]>(`${this.apiUrl}/template-folders/search`, { params });
  }

  searchTemplates(query: string, applicationId: number, folderId?: number): Observable<Template[]> {
    let params = new HttpParams()
      .set('query', query)
      .set('applicationId', applicationId.toString());
    
    if (folderId) {
      params = params.set('folderId', folderId.toString());
    }
    
    return this.http.get<Template[]>(`${this.apiUrl}/templates/search`, { params });
  }

  // Permission Operations
  getFolderPermissions(folderId: number): Observable<FolderPermissions> {
    return this.http.get<FolderPermissions>(`${this.apiUrl}/template-folders/${folderId}/permissions`);
  }

  // State Management Helpers
  setCurrentFolder(folder: TemplateFolder): void {
    this.currentFolderSubject.next(folder);
    this.updateBreadcrumbs(folder);
  }

  clearSelection(): void {
    this.selectedItems.set([]);
  }

  selectItem(item: Template | TemplateFolder): void {
    const current = this.selectedItems();
    if (!current.find(i => i.id === item.id)) {
      this.selectedItems.set([...current, item]);
    }
  }

  deselectItem(item: Template | TemplateFolder): void {
    const current = this.selectedItems();
    this.selectedItems.set(current.filter(i => i.id !== item.id));
  }

  toggleItemSelection(item: Template | TemplateFolder): void {
    const current = this.selectedItems();
    const exists = current.find(i => i.id === item.id);
    
    if (exists) {
      this.deselectItem(item);
    } else {
      this.selectItem(item);
    }
  }

  // Navigation Helpers
  navigateToFolder(folderId: number): Observable<FolderTemplatesResponse> {
    return this.getFolderContent(folderId);
  }

  navigateToBreadcrumb(breadcrumbItem: BreadcrumbItem): Observable<FolderTemplatesResponse> {
    if (breadcrumbItem.id === null) {
      // For root navigation, the component should handle this directly
      throw new Error('Root navigation should be handled by the component');
    }
    return this.getFolderContent(breadcrumbItem.id);
  }

  // Private Helper Methods
  private updateBreadcrumbs(folder: TemplateFolder): void {
    // Build breadcrumbs from folder path
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (folder.path) {
      const pathParts = folder.path.split('/').filter(part => part.length > 0);
      let currentPath = '';
      
      pathParts.forEach((part: string, index: number) => {
        currentPath += `/${part}`;
        breadcrumbs.push({
          id: index === pathParts.length - 1 ? folder.id : 0, // Only set ID for current folder
          name: part,
          path: currentPath
        });
      });
    }
    
    this.breadcrumbsSubject.next(breadcrumbs);
  }

  // Tree Node Helpers
  expandTreeNode(nodeId: number): void {
    const currentTree = this.folderTreeSubject.value;
    if (currentTree) {
      this.updateTreeNodeExpansion(currentTree, nodeId, true);
      this.folderTreeSubject.next(currentTree);
    }
  }

  collapseTreeNode(nodeId: number): void {
    const currentTree = this.folderTreeSubject.value;
    if (currentTree) {
      this.updateTreeNodeExpansion(currentTree, nodeId, false);
      this.folderTreeSubject.next(currentTree);
    }
  }

  private updateTreeNodeExpansion(node: FolderTreeNode, targetId: number, expanded: boolean): boolean {
    if (node.id === targetId) {
      node.isExpanded = expanded;
      return true;
    }
    
    for (const child of node.children) {
      if (this.updateTreeNodeExpansion(child, targetId, expanded)) {
        return true;
      }
    }
    
    return false;
  }
}
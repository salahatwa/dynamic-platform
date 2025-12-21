import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  TemplateFolder,
  TemplateFolderRequest,
  TemplatePage,
  TemplatePageRequest,
  TemplateAttribute,
  TemplateAttributeRequest,
  Template,
  TemplateRequest,
  TemplatePreviewRequest
} from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateManagementService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Folder Management
  getAllFolders(): Observable<TemplateFolder[]> {
    return this.http.get<TemplateFolder[]>(`${this.apiUrl}/template-folders`);
  }

  getAllFoldersForApplication(applicationId: number): Observable<TemplateFolder[]> {
    return this.http.get<TemplateFolder[]>(`${this.apiUrl}/template-folders/tree/${applicationId}`)
      .pipe(
        map((response: any) => {
          // Extract all folders from the tree response
          const allFolders: TemplateFolder[] = [];
          
          function extractFolders(node: any) {
            if (node.id !== null) { // Skip virtual root
              allFolders.push({
                id: node.id,
                name: node.name,
                parentId: node.parentId,
                applicationId: node.applicationId,
                path: node.path,
                level: node.level,
                sortOrder: node.sortOrder,
                active: node.active,
                description: node.description,
                imageUrl: node.imageUrl
              } as TemplateFolder);
            }
            
            if (node.children) {
              node.children.forEach((child: any) => extractFolders(child));
            }
          }
          
          if (response.rootFolder) {
            extractFolders(response.rootFolder);
          }
          
          return allFolders;
        })
      );
  }

  getRootFolders(applicationId?: number): Observable<TemplateFolder[]> {
    if (applicationId) {
      // Use the new application-based endpoint
      return this.http.get<TemplateFolder[]>(`${this.apiUrl}/template-folders/tree/${applicationId}`)
        .pipe(
          map((response: any) => response.rootFolders || [])
        );
    } else {
      // Fallback to the legacy endpoint
      return this.http.get<TemplateFolder[]>(`${this.apiUrl}/template-folders/root`);
    }
  }

  getFolderById(id: number): Observable<TemplateFolder> {
    return this.http.get<TemplateFolder>(`${this.apiUrl}/template-folders/${id}`);
  }

  getSubFolders(parentId: number): Observable<TemplateFolder[]> {
    return this.http.get<TemplateFolder[]>(`${this.apiUrl}/template-folders/${parentId}/children`);
  }

  createFolder(request: TemplateFolderRequest): Observable<TemplateFolder> {
    return this.http.post<TemplateFolder>(`${this.apiUrl}/template-folders`, request);
  }

  updateFolder(id: number, request: TemplateFolderRequest): Observable<TemplateFolder> {
    return this.http.put<TemplateFolder>(`${this.apiUrl}/template-folders/${id}`, request);
  }

  deleteFolder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/template-folders/${id}`);
  }

  toggleFolderStatus(id: number, applicationId: number): Observable<TemplateFolder> {
    const params = { applicationId: applicationId.toString() };
    return this.http.put<TemplateFolder>(`${this.apiUrl}/template-folders/${id}/toggle-status`, {}, { params });
  }

  // Page Management
  getAllPages(templateId: number): Observable<TemplatePage[]> {
    return this.http.get<TemplatePage[]>(`${this.apiUrl}/templates/${templateId}/pages`);
  }

  getPageById(templateId: number, pageId: number): Observable<TemplatePage> {
    return this.http.get<TemplatePage>(`${this.apiUrl}/templates/${templateId}/pages/${pageId}`);
  }

  createPage(templateId: number, request: TemplatePageRequest): Observable<TemplatePage> {
    return this.http.post<TemplatePage>(`${this.apiUrl}/templates/${templateId}/pages`, request);
  }

  updatePage(templateId: number, pageId: number, request: TemplatePageRequest): Observable<TemplatePage> {
    return this.http.put<TemplatePage>(`${this.apiUrl}/templates/${templateId}/pages/${pageId}`, request);
  }

  deletePage(templateId: number, pageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${templateId}/pages/${pageId}`);
  }

  reorderPages(templateId: number, pageIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/templates/${templateId}/pages/reorder`, pageIds);
  }

  // Attribute Management
  getAllAttributes(templateId: number): Observable<TemplateAttribute[]> {
    return this.http.get<TemplateAttribute[]>(`${this.apiUrl}/templates/${templateId}/attributes`);
  }

  getAttributeById(templateId: number, attributeId: number): Observable<TemplateAttribute> {
    return this.http.get<TemplateAttribute>(`${this.apiUrl}/templates/${templateId}/attributes/${attributeId}`);
  }

  createAttribute(templateId: number, request: TemplateAttributeRequest): Observable<TemplateAttribute> {
    return this.http.post<TemplateAttribute>(`${this.apiUrl}/templates/${templateId}/attributes`, request);
  }

  updateAttribute(templateId: number, attributeId: number, request: TemplateAttributeRequest): Observable<TemplateAttribute> {
    return this.http.put<TemplateAttribute>(`${this.apiUrl}/templates/${templateId}/attributes/${attributeId}`, request);
  }

  deleteAttribute(templateId: number, attributeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/templates/${templateId}/attributes/${attributeId}`);
  }

  // Template Management
  createTemplate(request: TemplateRequest, appName?: string): Observable<Template> {
    if (appName) {
      return this.http.post<Template>(`${this.apiUrl}/template-editor`, request, { params: { appName } });
    } else {
      return this.http.post<Template>(`${this.apiUrl}/template-editor`, request);
    }
  }

  updateTemplate(id: number, request: TemplateRequest, appName?: string): Observable<Template> {
    if (appName) {
      return this.http.put<Template>(`${this.apiUrl}/template-editor/${id}`, request, { params: { appName } });
    } else {
      return this.http.put<Template>(`${this.apiUrl}/template-editor/${id}`, request);
    }
  }

  getTemplate(id: number, appName?: string): Observable<Template> {
    if (appName) {
      return this.http.get<Template>(`${this.apiUrl}/template-editor/${id}`, { params: { appName } });
    } else {
      return this.http.get<Template>(`${this.apiUrl}/template-editor/${id}`);
    }
  }

  // Export Methods
  exportToPdf(id: number, request: { parameters?: { [key: string]: any }; pageNumber?: number }): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/template-editor/${id}/preview-pdf`, request, {
      responseType: 'blob',
      observe: 'body'
    });
  }

  exportToWord(id: number, request: { parameters?: { [key: string]: any } }): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/template-editor/${id}/preview-word`, request, {
      responseType: 'blob',
      observe: 'body'
    });
  }

  getTemplateInfo(id: number, appName?: string): Observable<any> {
    if (appName) {
      return this.http.get(`${this.apiUrl}/template-editor/${id}/info`, { params: { appName } });
    } else {
      return this.http.get(`${this.apiUrl}/template-editor/${id}/info`);
    }
  }
}

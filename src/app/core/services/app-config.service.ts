import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { 
  AppConfig, 
  AppConfigGroup, 
  AppConfigRequest, 
  AppConfigGroupRequest,
  AppConfigVersion,
  AppConfigAudit
} from '../models/app-config.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/config`;
  private cache = new Map<string, AppConfig[]>();

  // ==================== Configuration CRUD ====================

  getAllConfigs(appId?: number, groupId?: number, active?: boolean, page?: number, size?: number): Observable<any> {
    let params = new HttpParams();
    if (appId) params = params.set('appId', appId.toString());
    if (groupId !== undefined) params = params.set('groupId', groupId.toString());
    if (active !== undefined) params = params.set('active', active.toString());
    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    
    const cacheKey = `${appId || 'all'}_${groupId || 'all'}_${active || 'all'}_${page || 0}_${size || 20}`;
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      tap(response => {
        // For paginated response, cache the content
        if (response && response.content) {
          this.cache.set(cacheKey, response.content);
        } else {
          // For non-paginated response (backward compatibility)
          this.cache.set(cacheKey, response);
        }
      })
    );
  }

  getConfigById(id: number): Observable<AppConfig> {
    return this.http.get<AppConfig>(`${this.apiUrl}/${id}`);
  }

  getConfigByKey(configKey: string, appName: string): Observable<AppConfig> {
    const params = new HttpParams().set('appName', appName);
    return this.http.get<AppConfig>(`${this.apiUrl}/key/${configKey}`, { params });
  }

  getPublicConfigs(appName: string): Observable<AppConfig[]> {
    return this.http.get<AppConfig[]>(`${this.apiUrl}/public/${appName}`);
  }

  createConfig(request: AppConfigRequest): Observable<AppConfig> {
    return this.http.post<AppConfig>(this.apiUrl, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  updateConfig(id: number, request: AppConfigRequest): Observable<AppConfig> {
    return this.http.put<AppConfig>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  deleteConfig(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  // ==================== Configuration Groups ====================

  getAllGroups(appId?: number, active?: boolean): Observable<AppConfigGroup[]> {
    let params = new HttpParams();
    if (appId) params = params.set('appId', appId.toString());
    if (active !== undefined) params = params.set('active', active.toString());
    return this.http.get<AppConfigGroup[]>(`${this.apiUrl}/groups`, { params });
  }

  getGroupById(id: number): Observable<AppConfigGroup> {
    return this.http.get<AppConfigGroup>(`${this.apiUrl}/groups/${id}`);
  }

  createGroup(request: AppConfigGroupRequest): Observable<AppConfigGroup> {
    return this.http.post<AppConfigGroup>(`${this.apiUrl}/groups`, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  updateGroup(id: number, request: AppConfigGroupRequest): Observable<AppConfigGroup> {
    return this.http.put<AppConfigGroup>(`${this.apiUrl}/groups/${id}`, request).pipe(
      tap(() => this.invalidateCache())
    );
  }

  deleteGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/groups/${id}`).pipe(
      tap(() => this.invalidateCache())
    );
  }

  // ==================== Versioning ====================

  getConfigVersions(id: number): Observable<AppConfigVersion[]> {
    return this.http.get<AppConfigVersion[]>(`${this.apiUrl}/${id}/versions`);
  }

  restoreVersion(id: number, versionId: number): Observable<AppConfig> {
    return this.http.post<AppConfig>(`${this.apiUrl}/${id}/versions/${versionId}/restore`, {}).pipe(
      tap(() => this.invalidateCache())
    );
  }

  // ==================== Audit ====================

  getConfigAudit(id: number): Observable<AppConfigAudit[]> {
    return this.http.get<AppConfigAudit[]>(`${this.apiUrl}/${id}/audit`);
  }

  // ==================== Utility ====================

  getAppNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/apps`);
  }

  invalidateCache(): void {
    this.cache.clear();
    this.http.post<void>(`${this.apiUrl}/cache/invalidate`, {}).subscribe();
  }

  // ==================== Bulk Operations ====================

  bulkCreateConfigs(requests: AppConfigRequest[]): Observable<AppConfig[]> {
    return this.http.post<AppConfig[]>(`${this.apiUrl}/bulk`, requests).pipe(
      tap(() => this.invalidateCache())
    );
  }

  bulkDeleteConfigs(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bulk`, { body: ids }).pipe(
      tap(() => this.invalidateCache())
    );
  }

  // ==================== Helper Methods ====================

  getConfigTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'TEXT': '📝',
      'NUMBER': '🔢',
      'BOOLEAN': '✓',
      'ENUM': '📋',
      'JSON': '{ }',
      'TEMPLATE': '📄',
      'LIST': '•••'
    };
    return icons[type] || '⚙️';
  }

  getConfigTypeColor(type: string): string {
    const colors: Record<string, string> = {
      'TEXT': '#6366f1',
      'NUMBER': '#10b981',
      'BOOLEAN': '#f59e0b',
      'ENUM': '#8b5cf6',
      'JSON': '#ef4444',
      'TEMPLATE': '#06b6d4',
      'LIST': '#ec4899'
    };
    return colors[type] || '#6b7280';
  }

  parseEnumValues(enumValues?: string): string[] {
    if (!enumValues) return [];
    try {
      return JSON.parse(enumValues);
    } catch {
      return [];
    }
  }

  parseValidationRules(validationRules?: string): any {
    if (!validationRules) return {};
    try {
      return JSON.parse(validationRules);
    } catch {
      return {};
    }
  }
}

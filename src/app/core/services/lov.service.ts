import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lov, LovRequest, LovType, LovVersion, LovAudit } from '../models/lov.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LovService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/lov`;

  // LOV Pages (distinct LOV codes)
  getAllLovPages(active?: boolean, appName?: string): Observable<import('../models/lov.model').LovPage[]> {
    let params = new HttpParams();
    if (active !== undefined) params = params.set('active', active.toString());
    if (appName) params = params.set('appName', appName);
    return this.http.get<import('../models/lov.model').LovPage[]>(`${this.apiUrl}/pages`, { params });
  }

  // LOV CRUD Operations
  getAllLovs(lovType?: string, active?: boolean, appName?: string): Observable<Lov[]> {
    let params = new HttpParams();
    if (lovType) params = params.set('lovType', lovType);
    if (active !== undefined) params = params.set('active', active.toString());
    if (appName) params = params.set('appName', appName);
    return this.http.get<Lov[]>(this.apiUrl, { params });
  }

  getAllLovsWithTranslations(lovType?: string, active?: boolean, appName?: string): Observable<Lov[]> {
    let params = new HttpParams();
    if (lovType) params = params.set('lovType', lovType);
    if (active !== undefined) params = params.set('active', active.toString());
    if (appName) params = params.set('appName', appName);
    return this.http.get<Lov[]>(`${this.apiUrl}/with-translations`, { params });
  }

  getLovById(id: number): Observable<Lov> {
    return this.http.get<Lov>(`${this.apiUrl}/${id}`);
  }

  getLovByCode(lovCode: string): Observable<Lov> {
    return this.http.get<Lov>(`${this.apiUrl}/code/${lovCode}`);
  }

  getLovsByType(lovType: string): Observable<Lov[]> {
    return this.http.get<Lov[]>(`${this.apiUrl}/type/${lovType}`);
  }

  createLov(request: LovRequest): Observable<Lov> {
    return this.http.post<Lov>(this.apiUrl, request);
  }

  updateLov(id: number, request: LovRequest): Observable<Lov> {
    return this.http.put<Lov>(`${this.apiUrl}/${id}`, request);
  }

  deleteLov(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // LOV Types
  getAllLovTypes(): Observable<LovType[]> {
    return this.http.get<LovType[]>(`${this.apiUrl}/types`);
  }

  // Versioning
  getLovVersions(lovId: number): Observable<LovVersion[]> {
    return this.http.get<LovVersion[]>(`${this.apiUrl}/${lovId}/versions`);
  }

  restoreLovVersion(lovId: number, versionId: number): Observable<Lov> {
    return this.http.post<Lov>(`${this.apiUrl}/${lovId}/versions/${versionId}/restore`, {});
  }

  // Auditing
  getLovAudit(lovId: number): Observable<LovAudit[]> {
    return this.http.get<LovAudit[]>(`${this.apiUrl}/${lovId}/audit`);
  }

  // Bulk Operations
  bulkCreate(requests: LovRequest[]): Observable<Lov[]> {
    return this.http.post<Lov[]>(`${this.apiUrl}/bulk`, requests);
  }

  bulkUpdate(updates: { id: number; request: LovRequest }[]): Observable<Lov[]> {
    return this.http.put<Lov[]>(`${this.apiUrl}/bulk`, updates);
  }

  bulkDelete(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bulk`, { body: ids });
  }

  // Export/Import
  exportLovs(lovType?: string): Observable<Blob> {
    let params = new HttpParams();
    if (lovType) params = params.set('lovType', lovType);
    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  importLovs(file: File): Observable<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ success: number; failed: number; errors: string[] }>(
      `${this.apiUrl}/import`, 
      formData
    );
  }
}

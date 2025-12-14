import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  ErrorCode, 
  ErrorCodeCategory, 
  ErrorCodeRequest, 
  ErrorCodeVersion, 
  ErrorCodeAudit,
  ErrorSeverity,
  ErrorStatus
} from '../models/error-code.model';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorCodeService {
  private http = inject(HttpClient);
  private apiUrl = '/error-codes';

  // ==================== ERROR CODE OPERATIONS ====================

  createErrorCode(request: ErrorCodeRequest): Observable<ErrorCode> {
    return this.http.post<ErrorCode>(this.apiUrl, request);
  }

  updateErrorCode(id: number, request: ErrorCodeRequest): Observable<ErrorCode> {
    return this.http.put<ErrorCode>(`${this.apiUrl}/${id}`, request);
  }

  deleteErrorCode(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getErrorCode(id: number): Observable<ErrorCode> {
    return this.http.get<ErrorCode>(`${this.apiUrl}/${id}`);
  }

  getAllErrorCodes(
    page: number = 0,
    size: number = 20,
    appName?: string,
    categoryId?: number,
    severity?: ErrorSeverity,
    status?: ErrorStatus,
    search?: string
  ): Observable<PageResponse<ErrorCode>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (appName) params = params.set('appName', appName);
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (severity) params = params.set('severity', severity);
    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.http.get<PageResponse<ErrorCode>>(this.apiUrl, { params });
  }

  getDistinctApps(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/apps`);
  }

  // ==================== CATEGORY OPERATIONS ====================

  createCategory(request: Partial<ErrorCodeCategory>): Observable<ErrorCodeCategory> {
    return this.http.post<ErrorCodeCategory>(`${this.apiUrl}/categories`, request);
  }

  updateCategory(id: number, request: Partial<ErrorCodeCategory>): Observable<ErrorCodeCategory> {
    return this.http.put<ErrorCodeCategory>(`${this.apiUrl}/categories/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  getAllCategories(activeOnly?: boolean): Observable<ErrorCodeCategory[]> {
    let params = new HttpParams();
    if (activeOnly !== undefined) {
      params = params.set('activeOnly', activeOnly.toString());
    }
    return this.http.get<ErrorCodeCategory[]>(`${this.apiUrl}/categories`, { params });
  }

  // ==================== VERSION & AUDIT OPERATIONS ====================

  getVersionHistory(id: number): Observable<ErrorCodeVersion[]> {
    return this.http.get<ErrorCodeVersion[]>(`${this.apiUrl}/${id}/versions`);
  }

  getAuditLog(id: number): Observable<ErrorCodeAudit[]> {
    return this.http.get<ErrorCodeAudit[]>(`${this.apiUrl}/${id}/audit`);
  }

  restoreVersion(id: number, versionNumber: number): Observable<ErrorCode> {
    return this.http.post<ErrorCode>(`${this.apiUrl}/${id}/restore/${versionNumber}`, {});
  }
}

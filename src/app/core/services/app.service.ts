import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { App, AppRequest, AppStats } from '../models/app.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/apps`;

  /**
   * Get all apps for the authenticated user's corporate
   */
  getApps(activeOnly: boolean = false): Observable<App[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<App[]>(this.apiUrl, { params });
  }

  /**
   * Get active apps only
   */
  getActiveApps(): Observable<App[]> {
    return this.getApps(true);
  }

  /**
   * Get app by ID
   */
  getAppById(id: number): Observable<App> {
    return this.http.get<App>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get app by app key
   */
  getAppByKey(appKey: string): Observable<App> {
    return this.http.get<App>(`${this.apiUrl}/key/${appKey}`);
  }

  /**
   * Create new app
   */
  createApp(request: AppRequest): Observable<App> {
    return this.http.post<App>(this.apiUrl, request);
  }

  /**
   * Update app
   */
  updateApp(id: number, request: AppRequest): Observable<App> {
    return this.http.put<App>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Archive app (soft delete)
   */
  archiveApp(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Restore archived app
   */
  restoreApp(id: number): Observable<App> {
    return this.http.post<App>(`${this.apiUrl}/${id}/restore`, {});
  }

  /**
   * Permanently delete app
   */
  deleteAppPermanently(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/permanent`);
  }

  /**
   * Search apps by name
   */
  searchApps(query: string): Observable<App[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<App[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get app count
   */
  getAppCount(activeOnly: boolean = false): Observable<number> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<number>(`${this.apiUrl}/count`, { params });
  }

  /**
   * Get app statistics
   */
  getAppStats(): Observable<AppStats> {
    // This could be a separate endpoint or calculated from getApps()
    return new Observable(observer => {
      this.getApps().subscribe({
        next: (apps) => {
          const stats: AppStats = {
            totalApps: apps.length,
            activeApps: apps.filter(a => a.status === 'ACTIVE').length,
            archivedApps: apps.filter(a => a.status === 'ARCHIVED').length
          };
          observer.next(stats);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }
}

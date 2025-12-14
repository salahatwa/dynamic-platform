import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  // Global Stats
  totalApps: number;
  totalUsers: number;
  totalApiKeys: number;
  
  // App-Specific Stats (when app is selected)
  templates: {
    total: number;
    active: number;
    change: number;
  };
  translations: {
    totalKeys: number;
    totalTranslations: number;
    languages: number;
    change: number;
  };
  lov: {
    totalLists: number;
    totalValues: number;
    change: number;
  };
  appConfig: {
    totalConfigs: number;
    totalGroups: number;
    change: number;
  };
  errorCodes: {
    total: number;
    active: number;
    change: number;
  };
  
  // Activity Stats
  pdfsGenerated: number;
  pdfsChange: number;
  activeUsers: number;
  usersChange: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  entityType: string;
  entityName: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Get dashboard statistics
   * @param appId Optional app ID for app-specific stats
   */
  getStats(appId?: number): Observable<DashboardStats> {
    const url = appId ? `${this.apiUrl}/stats?appId=${appId}` : `${this.apiUrl}/stats`;
    return this.http.get<DashboardStats>(url);
  }

  /**
   * Get recent activity
   * @param appId Optional app ID for app-specific activity
   * @param size Number of items to return
   */
  getRecentActivity(appId?: number, size: number = 10): Observable<{content: RecentActivity[]}> {
    const params: any = { size };
    if (appId) {
      params.appId = appId;
    }
    
    return this.http.get<{content: RecentActivity[]}>(`${this.apiUrl}/activity`, { params });
  }

  /**
   * Get audit logs (future implementation)
   * @param appId Optional app ID for app-specific logs
   * @param page Page number
   * @param size Page size
   */
  getAuditLogs(appId?: number, page: number = 0, size: number = 20): Observable<{content: RecentActivity[]}> {
    const params: any = { page, size };
    if (appId) {
      params.appId = appId;
    }
    
    return this.http.get<{content: RecentActivity[]}>(`${this.apiUrl}/audit-logs`, { params });
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription, SubscriptionTier, UsageLimits } from '../models/subscription.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/subscription`;

  /**
   * Get current subscription
   */
  getSubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(this.apiUrl);
  }

  /**
   * Get active subscription
   */
  getActiveSubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/active`);
  }

  /**
   * Get usage limits and current usage
   */
  getUsageLimits(): Observable<UsageLimits> {
    return this.http.get<UsageLimits>(`${this.apiUrl}/limits`);
  }

  /**
   * Alias for getUsageLimits()
   */
  getLimits(): Observable<UsageLimits> {
    return this.getUsageLimits();
  }

  /**
   * Check if can create app
   */
  canCreateApp(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/can-create-app`);
  }

  /**
   * Check if can add user
   */
  canAddUser(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/can-add-user`);
  }

  /**
   * Upgrade subscription
   */
  upgradeSubscription(tier: SubscriptionTier): Observable<Subscription> {
    const params = new HttpParams().set('tier', tier);
    return this.http.post<Subscription>(`${this.apiUrl}/upgrade`, null, { params });
  }

  /**
   * Get current month API usage
   */
  getCurrentMonthApiUsage(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/api-usage`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Corporate, CorporateUpdateRequest, NameAvailabilityResponse, DomainAvailabilityResponse } from '../models/corporate.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CorporateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/corporate`;

  /**
   * Get current corporate information
   */
  getCurrentCorporate(): Observable<Corporate> {
    return this.http.get<Corporate>(this.apiUrl);
  }

  /**
   * Update corporate information
   */
  updateCorporate(corporate: CorporateUpdateRequest): Observable<Corporate> {
    return this.http.put<Corporate>(this.apiUrl, corporate);
  }

  /**
   * Check if corporate name is available
   */
  checkNameAvailability(name: string): Observable<NameAvailabilityResponse> {
    return this.http.get<NameAvailabilityResponse>(`${this.apiUrl}/check-name`, {
      params: { name }
    });
  }

  /**
   * Check if corporate domain is available
   */
  checkDomainAvailability(domain: string): Observable<DomainAvailabilityResponse> {
    return this.http.get<DomainAvailabilityResponse>(`${this.apiUrl}/check-domain`, {
      params: { domain }
    });
  }

  /**
   * Get corporate by ID
   */
  getCorporateById(id: number): Observable<Corporate> {
    return this.http.get<Corporate>(`${this.apiUrl}/${id}`);
  }
}
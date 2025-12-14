import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TranslationApp,
  TranslationKey,
  Translation,
  TranslationVersion,
  TranslationAppRequest,
  TranslationKeyRequest,
  TranslationRequest,
  BulkTranslationRequest
} from '../models/translation.model';

@Injectable({
  providedIn: 'root'
})
export class TranslationManagementService {
  private apiUrl = `${environment.apiUrl}/translation-apps`;
  private keysUrl = `${environment.apiUrl}/translation-keys`;
  private translationsUrl = `${environment.apiUrl}/translations`;
  private versionsUrl = `${environment.apiUrl}/translation-versions`;

  constructor(private http: HttpClient) {}

  // Translation Apps
  getApps(page: number = 0, size: number = 20, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  getApp(id: number): Observable<TranslationApp> {
    return this.http.get<TranslationApp>(`${this.apiUrl}/${id}`);
  }

  createApp(request: TranslationAppRequest): Observable<TranslationApp> {
    return this.http.post<TranslationApp>(this.apiUrl, request);
  }

  updateApp(id: number, request: TranslationAppRequest): Observable<TranslationApp> {
    return this.http.put<TranslationApp>(`${this.apiUrl}/${id}`, request);
  }

  deleteApp(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  regenerateApiKey(id: number): Observable<{ apiKey: string }> {
    return this.http.post<{ apiKey: string }>(`${this.apiUrl}/${id}/regenerate-api-key`, {});
  }

  // Translation Keys
  getKeys(appId: number, page: number = 0, size: number = 50, search?: string): Observable<any> {
    let params = new HttpParams()
      .set('appId', appId.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<any>(this.keysUrl, { params });
  }

  getKey(id: number): Observable<TranslationKey> {
    return this.http.get<TranslationKey>(`${this.keysUrl}/${id}`);
  }

  createKey(request: TranslationKeyRequest): Observable<TranslationKey> {
    return this.http.post<TranslationKey>(this.keysUrl, request);
  }

  updateKey(id: number, request: TranslationKeyRequest): Observable<TranslationKey> {
    return this.http.put<TranslationKey>(`${this.keysUrl}/${id}`, request);
  }

  deleteKey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.keysUrl}/${id}`);
  }

  bulkDeleteKeys(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.keysUrl}/bulk-delete`, ids);
  }

  // Translations
  getTranslationsByKey(keyId: number): Observable<Translation[]> {
    return this.http.get<Translation[]>(`${this.translationsUrl}/key/${keyId}`);
  }

  createOrUpdateTranslation(request: TranslationRequest): Observable<Translation> {
    return this.http.post<Translation>(this.translationsUrl, request);
  }

  updateTranslation(id: number, request: TranslationRequest): Observable<Translation> {
    return this.http.put<Translation>(`${this.translationsUrl}/${id}`, request);
  }

  deleteTranslation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.translationsUrl}/${id}`);
  }

  bulkCreateOrUpdateTranslations(request: BulkTranslationRequest): Observable<Translation[]> {
    return this.http.post<Translation[]>(`${this.translationsUrl}/bulk`, request);
  }

  // Language Management
  getAppLanguages(appId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${appId}/languages`);
  }

  // Get or create TranslationApp for a regular App
  getOrCreateTranslationApp(appName: string, appDescription?: string): Observable<TranslationApp> {
    return this.http.post<TranslationApp>(`${this.apiUrl}/get-or-create`, {
      name: appName,
      description: appDescription,
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'ar'],
      active: true
    });
  }

  addAppLanguage(appId: number, languageCode: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${appId}/languages`, { languageCode });
  }

  removeAppLanguage(appId: number, languageCode: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${appId}/languages/${languageCode}`);
  }

  updateAppLanguages(appId: number, languages: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${appId}/languages`, { languages });
  }

  // Versions
  getVersions(appId: number, page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('appId', appId.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<any>(this.versionsUrl, { params });
  }

  getVersion(id: number): Observable<TranslationVersion> {
    return this.http.get<TranslationVersion>(`${this.versionsUrl}/${id}`);
  }

  getVersionSnapshot(id: number): Observable<any> {
    return this.http.get<any>(`${this.versionsUrl}/${id}/snapshot`);
  }

  createVersion(appId: number, changelog: string): Observable<TranslationVersion> {
    return this.http.post<TranslationVersion>(this.versionsUrl, { appId, changelog });
  }
}

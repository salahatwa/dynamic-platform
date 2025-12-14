import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { environment } from '../../../../environments/environment';

interface ApiKey {
  id: number;
  keyValue: string;
  name: string;
  description: string;
  appId: number;
  appName: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  active: boolean;
  createdAt: string;
}

interface DialogData {
  show: boolean;
  type: 'create' | 'delete' | null;
  apiKey: ApiKey | null;
  loading: boolean;
}

interface ApiGuide {
  title: string;
  description: string;
  baseUrl: string;
  endpoints: Record<string, any>;
}

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, TranslatePipe],
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.scss']
})
export class ApiKeysComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/api-keys`;
  private docUrl = `${environment.apiUrl}/documentation/api-keys`;
  private t = inject(TranslationService);
  private appContext = inject(AppContextService);
  
  apiKeys = signal<ApiKey[]>([]);
  loading = signal(true);
  apiGuide = signal<ApiGuide | null>(null);
  
  // App context
  selectedApp = this.appContext.selectedApp;
  hasApps = this.appContext.hasApps;
  
  private lastLoadedAppId: number | null = null;
  
  dialog = signal<DialogData>({
    show: false,
    type: null,
    apiKey: null,
    loading: false
  });
  
  newKey = {
    name: '',
    description: '',
    expiryDays: null as number | null
  };
  
  constructor() {
    // No effect to avoid duplicate calls - handle manually
  }
  
  ngOnInit() {
    console.log('API Keys ngOnInit');
    this.checkAndLoadData();
    this.loadApiGuide();
  }
  
  private checkAndLoadData() {
    const app = this.selectedApp();
    console.log('checkAndLoadData - app:', app, 'lastLoadedAppId:', this.lastLoadedAppId);
    
    if (!app) {
      console.log('No app selected, clearing API keys');
      this.apiKeys.set([]);
      this.lastLoadedAppId = null;
      return;
    }

    // Only load if app has changed
    if (this.lastLoadedAppId !== app.id) {
      console.log('App changed from', this.lastLoadedAppId, 'to', app.id, '- loading API keys');
      this.lastLoadedAppId = app.id;
      this.loadApiKeys();
    } else {
      console.log('Same app, skipping API keys load');
    }
  }
  
  loadApiKeys() {
    const app = this.selectedApp();
    if (!app) {
      this.apiKeys.set([]);
      this.loading.set(false);
      return;
    }

    console.log('Loading API keys for app:', app.name);
    this.loading.set(true);
    
    // Add appId parameter to the request
    const url = `${this.apiUrl}?appId=${app.id}`;
    
    this.http.get<ApiKey[]>(url).subscribe({
      next: (data) => {
        console.log('API keys loaded:', data);
        this.apiKeys.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading API keys:', error);
        this.loading.set(false);
      }
    });
  }
  
  openCreateDialog() {
    this.newKey = { name: '', description: '', expiryDays: null };
    this.dialog.set({
      show: true,
      type: 'create',
      apiKey: null,
      loading: false
    });
  }
  
  openDeleteDialog(apiKey: ApiKey) {
    this.dialog.set({
      show: true,
      type: 'delete',
      apiKey,
      loading: false
    });
  }
  
  closeDialog() {
    this.dialog.set({
      show: false,
      type: null,
      apiKey: null,
      loading: false
    });
  }
  
  createApiKey(event: Event) {
    event.preventDefault();
    
    const app = this.selectedApp();
    if (!app) {
      alert('Please select an app first');
      return;
    }
    
    this.dialog.update(d => ({ ...d, loading: true }));
    
    // Include appId in the request
    const requestData = {
      ...this.newKey,
      appId: app.id
    };
    
    this.http.post<ApiKey>(this.apiUrl, requestData).subscribe({
      next: () => {
        this.closeDialog();
        this.loadApiKeys();
      },
      error: (error) => {
        console.error('Error creating API key:', error);
        this.dialog.update(d => ({ ...d, loading: false }));
        alert(error.error?.message || 'Error creating API key');
      }
    });
  }
  
  revokeKey(apiKey: ApiKey) {
    if (confirm(this.t.translate('apiKeys.revokeConfirmPrefix') + ` "${apiKey.name}"?`)) {
      this.http.put(`${this.apiUrl}/${apiKey.id}/revoke`, {}).subscribe({
        next: () => this.loadApiKeys()
      });
    }
  }
  
  confirmDelete() {
    const apiKey = this.dialog().apiKey;
    if (!apiKey) return;
    
    this.dialog.update(d => ({ ...d, loading: true }));
    
    this.http.delete(`${this.apiUrl}/${apiKey.id}`).subscribe({
      next: () => {
        this.closeDialog();
        this.loadApiKeys();
      },
      error: () => {
        this.dialog.update(d => ({ ...d, loading: false }));
      }
    });
  }
  
  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert(this.t.translate('apiKeys.copied'));
    });
  }
  
  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  loadApiGuide() {
    console.log('Loading API guide from:', this.docUrl);
    this.http.get<ApiGuide>(this.docUrl).subscribe({
      next: (data) => {
        console.log('API guide loaded successfully:', data);
        this.apiGuide.set(data);
      },
      error: (error) => {
        console.error('Error loading API guide:', error);
        console.log('Falling back to static examples');
        // Set apiGuide to null to show fallback examples
        this.apiGuide.set(null);
      }
    });
  }

  viewDocumentation() {
    this.router.navigate(['/admin/api-documentation']);
  }

  getEndpointsList() {
    // Always return the endpoints list, regardless of API guide status
    return [
      { key: 'errorCodes', name: 'Error Codes', url: '/api/content/error-codes' },
      { key: 'templates', name: 'Templates', url: '/api/content/templates' },
      { key: 'translations', name: 'Translations', url: '/api/content/translations' },
      { key: 'lov', name: 'List of Values', url: '/api/content/lov' },
      { key: 'appConfig', name: 'App Configuration', url: '/api/content/app-config' }
    ];
  }
}

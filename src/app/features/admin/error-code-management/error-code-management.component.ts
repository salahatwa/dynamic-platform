import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorCodeService } from '../../../core/services/error-code.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { 
  ErrorCode, 
  ErrorCodeCategory, 
  ErrorCodeRequest,
  ErrorSeverity,
  ErrorStatus
} from '../../../core/models/error-code.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-error-code-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './error-code-management.component.html',
  styleUrls: ['./error-code-management.component.scss']
})
export class ErrorCodeManagementComponent implements OnInit {
  // Services
  private appContext = inject(AppContextService);
  private errorHandler = inject(ErrorHandlerService);
  private toastService = inject(ToastService);
  
  // Signals
  errorCodes = signal<ErrorCode[]>([]);
  categories = signal<ErrorCodeCategory[]>([]);
  modules = signal<string[]>([]);
  loading = signal(false);
  totalElements = signal(0);
  currentPage = signal(0);
  pageSize = signal(20);

  // Filters
  selectedSeverity = signal<ErrorSeverity | undefined>(undefined);
  selectedStatus = signal<ErrorStatus | undefined>(undefined);
  searchTerm = signal('');

  // App context
  selectedApp = this.appContext.selectedApp;
  hasApps = this.appContext.hasApps;

  // View mode
  viewMode = signal<'grid' | 'list'>('grid');

  // Modal states
  showModal = signal(false);
  showCategoryModal = signal(false);
  showVersionModal = signal(false);
  showAuditModal = signal(false);
  showSettingsModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  saving = signal(false);

  // Auto-generation states
  errorCodeSettings = signal<any>(null);
  generatingCode = signal(false);
  previewCode = signal<string>('');

  // Current items
  currentErrorCode = signal<ErrorCode | null>(null);
  currentCategory = signal<ErrorCodeCategory | null>(null);

  // Enums for template
  ErrorSeverity = ErrorSeverity;
  ErrorStatus = ErrorStatus;
  severityOptions = Object.values(ErrorSeverity);
  statusOptions = Object.values(ErrorStatus);

  // Available languages
  availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' }
  ];

  // Selected languages for current error code
  selectedLanguages = signal<string[]>(['en']);

  // Computed
  totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));
  hasFilters = computed(() => 
    !!this.selectedSeverity() || 
    !!this.selectedStatus() || 
    !!this.searchTerm()
  );

  // Form validation
  isErrorCodeFormValid = computed(() => {
    const errorCode = this.currentErrorCode();
    if (!errorCode) return false;
    
    return errorCode.errorCode.trim().length > 0 && 
           errorCode.severity && 
           errorCode.status && 
           errorCode.defaultMessage.trim().length > 0;
  });

  private lastLoadedAppId: number | null = null;

  constructor(private errorCodeService: ErrorCodeService) {
    // No effect - we'll handle app changes manually to avoid duplicates
  }

  ngOnInit() {
    console.log('Error Code Management ngOnInit');
    this.checkAndLoadData();
  }

  private checkAndLoadData() {
    const app = this.selectedApp();
    console.log('checkAndLoadData - app:', app, 'lastLoadedAppId:', this.lastLoadedAppId);
    
    if (!app) {
      console.log('No app selected, clearing data');
      this.errorCodes.set([]);
      this.categories.set([]);
      this.lastLoadedAppId = null;
      return;
    }

    // Only load if app has changed
    if (this.lastLoadedAppId !== app.id) {
      console.log('App changed from', this.lastLoadedAppId, 'to', app.id, '- loading data');
      this.lastLoadedAppId = app.id;
      this.loadCategories();
      this.loadModules();
      this.loadErrorCodes();
    } else {
      console.log('Same app, skipping data load');
    }
  }

  // ==================== LOAD DATA ====================

  loadErrorCodes() {
    const app = this.selectedApp();
    console.log('loadErrorCodes called - app:', app);
    if (!app) {
      console.log('No app selected, clearing error codes');
      this.errorCodes.set([]);
      return;
    }

    console.log('Loading error codes for app:', app.name);
    this.loading.set(true);
    this.errorCodeService.getAllErrorCodes(
      this.currentPage(),
      this.pageSize(),
      app.name, // Use app name for now, will be updated to appId in backend
      undefined, // Remove category filter
      this.selectedSeverity(),
      this.selectedStatus(),
      this.searchTerm() || undefined
    ).subscribe({
      next: (response) => {
        this.errorCodes.set(response.content);
        this.totalElements.set(response.totalElements);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'load_error_codes');
        this.loading.set(false);
      }
    });
  }

  loadCategories() {
    this.errorCodeService.getAllCategories(true).subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => this.errorHandler.handleError(error, 'load_error_code_categories')
    });
  }

  loadModules() {
    const app = this.selectedApp();
    if (!app) {
      this.modules.set([]);
      return;
    }

    this.errorCodeService.getDistinctModules(app.name).subscribe({
      next: (modules) => this.modules.set(modules.filter(m => m != null && m.trim() !== '')),
      error: (error) => this.errorHandler.handleError(error, 'load_error_code_modules')
    });
  }


  // ==================== FILTER ACTIONS ====================

  onSeverityChange(value: string) {
    this.selectedSeverity.set(value ? value as ErrorSeverity : undefined);
    this.currentPage.set(0);
    this.loadErrorCodes();
  }

  onStatusChange(value: string) {
    this.selectedStatus.set(value ? value as ErrorStatus : undefined);
    this.currentPage.set(0);
    this.loadErrorCodes();
  }

  onSearch() {
    this.currentPage.set(0);
    this.loadErrorCodes();
  }

  clearFilters() {
    this.selectedSeverity.set(undefined);
    this.selectedStatus.set(undefined);
    this.searchTerm.set('');
    this.currentPage.set(0);
    this.loadErrorCodes();
  }

  // ==================== CRUD ACTIONS ====================

  openCreateModal() {
    const app = this.selectedApp();
    if (!app) return;

    this.modalMode.set('create');
    this.currentErrorCode.set({
      errorCode: '',
      appName: app.name,
      severity: ErrorSeverity.ERROR,
      status: ErrorStatus.ACTIVE,
      isPublic: true,
      isRetryable: false,
      defaultMessage: '',
      translations: {
        en: { message: '' }
      }
    });
    this.selectedLanguages.set(['en']); // English is always default
    
    // Load settings and preview for auto-generation
    this.loadErrorCodeSettings();
    
    this.showModal.set(true);
  }

  openEditModal(errorCode: ErrorCode) {
    this.modalMode.set('edit');
    this.currentErrorCode.set({ ...errorCode });
    // Set selected languages based on existing translations
    const langs = errorCode.translations ? Object.keys(errorCode.translations) : ['en'];
    if (!langs.includes('en')) {
      langs.unshift('en'); // Ensure English is always included
    }
    this.selectedLanguages.set(langs);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.currentErrorCode.set(null);
  }

  saveErrorCode() {
    if (!this.isErrorCodeFormValid()) return;
    
    const errorCode = this.currentErrorCode();
    if (!errorCode) return;

    this.saving.set(true);

    const request: ErrorCodeRequest = {
      errorCode: errorCode.errorCode,
      categoryId: errorCode.categoryId,
      appName: errorCode.appName,
      moduleName: errorCode.moduleName,
      severity: errorCode.severity,
      status: errorCode.status,
      httpStatusCode: errorCode.httpStatusCode,
      isPublic: errorCode.isPublic,
      isRetryable: errorCode.isRetryable,
      defaultMessage: errorCode.defaultMessage,
      technicalDetails: errorCode.technicalDetails,
      resolutionSteps: errorCode.resolutionSteps,
      documentationUrl: errorCode.documentationUrl,
      translations: errorCode.translations
    };

    const operation = this.modalMode() === 'create'
      ? this.errorCodeService.createErrorCode(request)
      : this.errorCodeService.updateErrorCode(errorCode.id!, request);

    operation.subscribe({
      next: () => {
        const action = this.modalMode() === 'create' ? 'created' : 'updated';
        this.toastService.success(`Error code ${action} successfully`);
        this.loadErrorCodes();
        this.closeModal();
        this.saving.set(false);
      },
      error: (error) => {
        const context = this.modalMode() === 'create' ? 'create_error_code' : 'update_error_code';
        this.errorHandler.handleError(error, context);
        this.saving.set(false);
      }
    });
  }

  deleteErrorCode(id: number) {
    if (!confirm('Are you sure you want to delete this error code?')) return;

    this.errorCodeService.deleteErrorCode(id).subscribe({
      next: () => {
        this.toastService.success('Error code deleted successfully');
        this.loadErrorCodes();
      },
      error: (error) => this.errorHandler.handleError(error, 'delete_error_code')
    });
  }

  // ==================== PAGINATION ====================

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadErrorCodes();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  // ==================== VIEW HELPERS ====================

  toggleViewMode() {
    this.viewMode.set(this.viewMode() === 'grid' ? 'list' : 'grid');
  }

  getSeverityClass(severity: ErrorSeverity): string {
    const classes = {
      [ErrorSeverity.INFO]: 'severity-info',
      [ErrorSeverity.WARNING]: 'severity-warning',
      [ErrorSeverity.ERROR]: 'severity-error',
      [ErrorSeverity.CRITICAL]: 'severity-critical'
    };
    return classes[severity] || '';
  }

  getStatusClass(status: ErrorStatus): string {
    const classes = {
      [ErrorStatus.ACTIVE]: 'status-active',
      [ErrorStatus.DEPRECATED]: 'status-deprecated',
      [ErrorStatus.REMOVED]: 'status-removed'
    };
    return classes[status] || '';
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) return '-';
    const category = this.categories().find(c => c.id === categoryId);
    return category?.categoryName || '-';
  }

  // ==================== TRANSLATION HELPERS ====================

  addLanguage(langCode: string) {
    const currentLangs = this.selectedLanguages();
    if (!currentLangs.includes(langCode)) {
      this.selectedLanguages.set([...currentLangs, langCode]);
      
      // Initialize translation for this language
      const errorCode = this.currentErrorCode();
      if (errorCode && errorCode.translations) {
        if (!errorCode.translations[langCode]) {
          errorCode.translations[langCode] = { message: '' };
          this.currentErrorCode.set({ ...errorCode });
        }
      }
    }
  }

  removeLanguage(langCode: string) {
    // Cannot remove English (default language)
    if (langCode === 'en') return;
    
    const currentLangs = this.selectedLanguages();
    this.selectedLanguages.set(currentLangs.filter(l => l !== langCode));
    
    // Remove translation for this language
    const errorCode = this.currentErrorCode();
    if (errorCode && errorCode.translations && errorCode.translations[langCode]) {
      delete errorCode.translations[langCode];
      this.currentErrorCode.set({ ...errorCode });
    }
  }

  getLanguageName(langCode: string): string {
    const lang = this.availableLanguages.find(l => l.code === langCode);
    return lang ? `${lang.name} (${lang.nativeName})` : langCode.toUpperCase();
  }

  getAvailableLanguagesToAdd() {
    const selected = this.selectedLanguages();
    return this.availableLanguages.filter(lang => !selected.includes(lang.code));
  }

  updateTranslation(lang: string, field: string, value: string) {
    const errorCode = this.currentErrorCode();
    if (!errorCode || !errorCode.translations) return;

    if (!errorCode.translations[lang]) {
      errorCode.translations[lang] = { message: '' };
    }

    const translation = errorCode.translations[lang];
    if (field === 'message') {
      translation.message = value;
    } else if (field === 'technicalDetails') {
      translation.technicalDetails = value;
    } else if (field === 'resolutionSteps') {
      translation.resolutionSteps = value;
    }
    
    this.currentErrorCode.set({ ...errorCode });
  }

  getTranslation(lang: string, field: string): string {
    const errorCode = this.currentErrorCode();
    if (!errorCode || !errorCode.translations || !errorCode.translations[lang]) {
      return '';
    }
    const translation = errorCode.translations[lang];
    const value = (translation as any)[field];
    return (typeof value === 'string' ? value : '') || '';
  }

  // ==================== AUTO-GENERATION METHODS ====================

  loadErrorCodeSettings() {
    this.errorCodeService.getErrorCodeSettings().subscribe({
      next: (settings) => {
        this.errorCodeSettings.set(settings);
        this.updatePreviewCode();
      },
      error: (error) => this.errorHandler.handleError(error, 'load_error_code_settings')
    });
  }

  openSettingsModal() {
    this.loadErrorCodeSettings();
    this.showSettingsModal.set(true);
  }

  closeSettingsModal() {
    this.showSettingsModal.set(false);
  }

  saveErrorCodeSettings() {
    const settings = this.errorCodeSettings();
    if (!settings) return;

    this.saving.set(true);
    this.errorCodeService.updateErrorCodeSettings(settings).subscribe({
      next: (updatedSettings) => {
        this.errorCodeSettings.set(updatedSettings);
        this.toastService.success('Error code settings updated successfully');
        this.updatePreviewCode();
        this.saving.set(false);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'update_error_code_settings');
        this.saving.set(false);
      }
    });
  }

  generateErrorCode() {
    this.generatingCode.set(true);
    this.errorCodeService.generateNextErrorCode().subscribe({
      next: (response) => {
        const errorCode = this.currentErrorCode();
        if (errorCode) {
          errorCode.errorCode = response.generatedCode;
          this.currentErrorCode.set({ ...errorCode });
        }
        this.updatePreviewCode();
        this.generatingCode.set(false);
        this.toastService.success(`Generated code: ${response.generatedCode}`);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'generate_error_code');
        this.generatingCode.set(false);
      }
    });
  }

  updatePreviewCode() {
    this.errorCodeService.previewNextErrorCode().subscribe({
      next: (response) => {
        this.previewCode.set(response.generatedCode);
      },
      error: (error) => {
        console.error('Failed to update preview code:', error);
        this.previewCode.set('');
      }
    });
  }

  onSettingsChange() {
    this.updatePreviewCode();
  }
}

import { Component, OnInit, signal, computed, ChangeDetectorRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationManagementService } from '../../../core/services/translation-management.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { PermissionService } from '../../../core/services/permission.service';
import {
  TranslationKey,
  TranslationStatus,
  TranslationKeyRequest,
  TranslationRequest
} from '../../../core/models/translation.model';

// Import new unified components
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';


@Component({
  selector: 'app-translations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    HasPermissionDirective
  ],
  templateUrl: './translations.component.html',
  styleUrls: ['./translations.component.scss']
})
export class TranslationsComponent implements OnInit {
  // Services
  private appContext = inject(AppContextService);
  private themeService = inject(ThemeService);
  private errorHandler = inject(ErrorHandlerService);
  private toastService = inject(ToastService);
  private permissionService = inject(PermissionService);

  // Permission checks
  canCreateTranslations = computed(() => this.permissionService.canCreate('translations'));
  canUpdateTranslations = computed(() => this.permissionService.canUpdate('translations'));
  canDeleteTranslations = computed(() => this.permissionService.canDelete('translations'));
  canReadTranslations = computed(() => this.permissionService.canRead('translations'));

  // State
  activeView = signal<'grid' | 'list'>('list');
  keys = signal<TranslationKey[]>([]);
  selectedLanguage = signal<string>('en');
  loading = signal(false);
  saving = signal(false);
  searchQuery = signal('');
  currentLanguage = signal(localStorage.getItem('language') || 'en');

  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  pageSize = 10;

  // Modals - using regular properties for better change detection
  showKeyModal = false;
  showDeleteConfirm = false;
  showLanguageModal = false;
  editingKey: TranslationKey | null = null;
  deletingItem: any = null;

  // Forms
  keyForm = signal<TranslationKeyRequest>({
    appId: 0,
    keyName: '',
    description: '',
    context: ''
  });

  // App context
  selectedApp = this.appContext.selectedApp;
  hasApps = this.appContext.hasApps;

  // Language management
  appLanguages = signal<string[]>(['en']); // Current app's supported languages
  newLanguageCode = signal('');
  languageLoading = signal(false); // Loading state for language operations
  translationAppId = signal<number | null>(null); // ID of the TranslationApp entity

  // Computed
  filteredKeys = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.keys();

    return this.keys().filter(key =>
      key.keyName.toLowerCase().includes(query) ||
      key.description?.toLowerCase().includes(query)
    );
  });

  // Form validation
  isKeyFormValid = computed(() => {
    const form = this.keyForm();
    return form.keyName.trim().length > 0;
  });

  isLanguageFormValid = computed(() => {
    return this.newLanguageCode().trim().length > 0;
  });

  availableLanguages = computed(() => {
    return this.appLanguages();
  });

  // All possible languages for selection
  allLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' }
  ];



  TranslationStatus = TranslationStatus;

  constructor(
    private translationService: TranslationManagementService,
    private cdr: ChangeDetectorRef
  ) {
    // Listen for custom language change event
    window.addEventListener('languageChanged', ((e: CustomEvent) => {
      this.currentLanguage.set(e.detail || 'en');
      this.cdr.detectChanges();
    }) as EventListener);

    // Check localStorage periodically as fallback
    setInterval(() => {
      const lang = localStorage.getItem('language') || 'en';
      if (lang !== this.currentLanguage()) {
        this.currentLanguage.set(lang);
        this.cdr.detectChanges();
      }
    }, 500);

    // Watch for app changes and reload keys
    effect(() => {
      const app = this.selectedApp();
      console.log('Translations - App changed:', app);
      if (app) {
        console.log('Loading app languages and keys for app:', app.name);
        // Use setTimeout to ensure the effect runs after the component is fully initialized
        setTimeout(() => {
          this.loadAppLanguages();
          // loadKeys() will be called after translationAppId is set in loadAppLanguages()
        }, 0);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    // Data will be loaded automatically when app is selected via effect
    // No need to load here as effect will handle both initial load and app changes
  }



  closeKeyModal() {
    this.showKeyModal = false;
  }

  closeDeleteModal() {
    this.showDeleteConfirm = false;
  }

  closeLanguageModal() {
    this.showLanguageModal = false;
    this.newLanguageCode.set('');
  }

  // Language Management
  loadAppLanguages() {
    const app = this.selectedApp();
    if (!app) {
      this.appLanguages.set(['en']);
      return;
    }

    // First, get or create the TranslationApp for this regular App
    this.translationService.getOrCreateTranslationApp(app.name, app.description).subscribe({
      next: (translationApp) => {
        console.log('TranslationApp created/found:', translationApp);
        this.translationAppId.set(translationApp.id);

        // Now load languages from the TranslationApp
        this.translationService.getAppLanguages(translationApp.id).subscribe({
          next: (languages) => {
            console.log('Loaded languages:', languages);
            // Ensure English is always included as default
            const appLanguages = languages.includes('en') ? languages : ['en', ...languages];
            this.appLanguages.set(appLanguages);

            // Set selected language to first available if current selection is not supported
            if (!this.appLanguages().includes(this.selectedLanguage())) {
              this.selectedLanguage.set(this.appLanguages()[0]);
            }

            // Now that we have the translationAppId, load the keys
            console.log('Loading translation keys for translationApp:', translationApp.id);
            this.loadKeys();
          },
          error: (error) => {
            this.errorHandler.handleError(error, 'load_app_languages');
            // Fallback to default languages
            this.appLanguages.set(['en', 'ar']);

            // Set selected language to first available if current selection is not supported
            if (!this.appLanguages().includes(this.selectedLanguage())) {
              this.selectedLanguage.set(this.appLanguages()[0]);
            }

            // Still try to load keys even if language loading failed
            console.log('Loading translation keys despite language error for translationApp:', translationApp.id);
            this.loadKeys();
          }
        });
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'create_translation_app');
        // Fallback to localStorage or default languages
        const savedLanguages = localStorage.getItem(`app_${app.id}_languages`);
        if (savedLanguages) {
          try {
            const languages = JSON.parse(savedLanguages);
            this.appLanguages.set(languages);
          } catch {
            this.appLanguages.set(['en', 'ar']); // Default languages
          }
        } else {
          this.appLanguages.set(['en', 'ar']); // Default languages
        }

        // Set selected language to first available if current selection is not supported
        if (!this.appLanguages().includes(this.selectedLanguage())) {
          this.selectedLanguage.set(this.appLanguages()[0]);
        }

        // Clear keys since we couldn't get the translation app
        this.keys.set([]);
      }
    });
  }

  openLanguageModal() {
    this.showLanguageModal = true;
  }

  addLanguage() {
    const langCode = this.newLanguageCode().toLowerCase().trim();
    if (!langCode || this.appLanguages().includes(langCode)) {
      return;
    }

    const translationAppId = this.translationAppId();
    if (!translationAppId) return;

    // Set loading state
    this.languageLoading.set(true);

    // Add language via backend API
    this.translationService.addAppLanguage(translationAppId, langCode).subscribe({
      next: () => {
        // Update local state
        const updatedLanguages = [...this.appLanguages(), langCode];
        this.appLanguages.set(updatedLanguages);

        // Also save to localStorage as backup
        const app = this.selectedApp();
        if (app) {
          localStorage.setItem(`app_${app.id}_languages`, JSON.stringify(updatedLanguages));
        }

        this.languageLoading.set(false);
        this.closeLanguageModal();

        // Show success message
        this.toastService.success('Language Added', `Language ${langCode.toUpperCase()} added successfully`);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'add_language');

        // Fallback to local storage update if API fails
        const updatedLanguages = [...this.appLanguages(), langCode];
        this.appLanguages.set(updatedLanguages);

        const app = this.selectedApp();
        if (app) {
          localStorage.setItem(`app_${app.id}_languages`, JSON.stringify(updatedLanguages));
        }

        this.languageLoading.set(false);
        this.closeLanguageModal();

        // Show warning that it's only saved locally
        this.toastService.warning('Language Added Locally', 'Language added locally. Backend sync failed - please check your connection.');
      }
    });
  }

  removeLanguage(langCode: string) {
    // Don't allow removing the default language or if it's the only language
    if (langCode === 'en' || this.appLanguages().length <= 1) {
      alert('Cannot remove the default language or the last remaining language.');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${langCode.toUpperCase()} language? This will delete all translations for this language.`)) {
      return;
    }

    const translationAppId = this.translationAppId();
    if (!translationAppId) return;

    // Set loading state
    this.languageLoading.set(true);

    // Remove language via backend API
    this.translationService.removeAppLanguage(translationAppId, langCode).subscribe({
      next: () => {
        // Update local state
        const updatedLanguages = this.appLanguages().filter(lang => lang !== langCode);
        this.appLanguages.set(updatedLanguages);

        // Also save to localStorage as backup
        const app = this.selectedApp();
        if (app) {
          localStorage.setItem(`app_${app.id}_languages`, JSON.stringify(updatedLanguages));
        }

        // Switch to first available language if current selection was removed
        if (this.selectedLanguage() === langCode) {
          this.selectedLanguage.set(this.appLanguages()[0]);
        }

        // Reload keys to refresh the translations
        this.loadKeys();

        this.languageLoading.set(false);
        this.toastService.success('Language Removed', `Language ${langCode.toUpperCase()} removed successfully`);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'remove_language');

        // Fallback to local storage update if API fails
        const updatedLanguages = this.appLanguages().filter(lang => lang !== langCode);
        this.appLanguages.set(updatedLanguages);

        const app = this.selectedApp();
        if (app) {
          localStorage.setItem(`app_${app.id}_languages`, JSON.stringify(updatedLanguages));
        }

        // Switch to first available language if current selection was removed
        if (this.selectedLanguage() === langCode) {
          this.selectedLanguage.set(this.appLanguages()[0]);
        }

        // Reload keys to refresh the translations
        this.loadKeys();

        this.languageLoading.set(false);
        // Show warning that it's only saved locally
        this.toastService.warning('Language Removed Locally', 'Language removed locally. Backend sync failed - please check your connection.');
      }
    });
  }

  getLanguageInfo(langCode: string) {
    return this.allLanguages.find(lang => lang.code === langCode) ||
      { code: langCode, name: langCode.toUpperCase(), flag: '🌐' };
  }

  getAvailableLanguagesToAdd() {
    return this.allLanguages.filter(lang => !this.appLanguages().includes(lang.code));
  }

  // Keys Management
  loadKeys() {
    const translationAppId = this.translationAppId();
    console.log('loadKeys called - translationAppId:', translationAppId);
    if (!translationAppId) {
      console.log('No translationAppId, clearing keys');
      this.keys.set([]);
      return;
    }

    console.log('Loading translation keys for translationAppId:', translationAppId, 'page:', this.currentPage(), 'size:', this.pageSize);
    this.loading.set(true);
    this.translationService.getKeys(translationAppId, this.currentPage(), this.pageSize).subscribe({
      next: (response) => {
        console.log('Translation keys API response:', response);
        this.keys.set(response.content || []);
        this.totalPages.set(response.totalPages || 0);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleError(error, 'load_translation_keys');
        this.loading.set(false);
      }
    });
  }

  openKeyModal(key?: TranslationKey) {
    const translationAppId = this.translationAppId();
    if (!translationAppId) return;

    console.log('openKeyModal called', key);
    if (key) {
      this.editingKey = key;
      this.keyForm.set({
        appId: translationAppId,
        keyName: key.keyName,
        description: key.description || '',
        context: key.context || ''
      });
    } else {
      this.editingKey = null;
      this.keyForm.set({
        appId: translationAppId,
        keyName: '',
        description: '',
        context: ''
      });
    }
    this.showKeyModal = true;
    console.log('showKeyModal set to:', this.showKeyModal);
    this.cdr.detectChanges();
  }

  saveKey() {
    if (!this.isKeyFormValid()) return;
    
    const form = this.keyForm();
    const editing = this.editingKey;
    
    this.saving.set(true);

    if (editing) {
      this.translationService.updateKey(editing.id, form).subscribe({
        next: () => {
          this.loadKeys();
          this.showKeyModal = false;
          this.saving.set(false);
          this.toastService.success('Translation Key Updated', 'Translation key updated successfully');
        },
        error: (error) => {
          this.saving.set(false);
          this.errorHandler.handleError(error, 'update_translation_key');
        }
      });
    } else {
      this.translationService.createKey(form).subscribe({
        next: () => {
          this.loadKeys();
          this.showKeyModal = false;
          this.saving.set(false);
          this.toastService.success('Translation Key Created', 'Translation key created successfully');
        },
        error: (error) => {
          this.saving.set(false);
          this.errorHandler.handleError(error, 'create_translation_key');
        }
      });
    }
  }

  // Translation Management
  updateTranslation(key: TranslationKey, language: string, value: string) {
    const existingTranslation = key.translations[language];

    const request: TranslationRequest = {
      keyId: key.id,
      language: language,
      value: value,
      status: TranslationStatus.PUBLISHED
    };

    this.translationService.createOrUpdateTranslation(request).subscribe({
      next: () => {
        // Update local state
        key.translations[language] = {
          id: existingTranslation?.id || 0,
          language: language,
          value: value,
          status: TranslationStatus.PUBLISHED,
          updatedAt: new Date().toISOString()
        };
        this.toastService.success('Translation Updated', `Translation for ${language.toUpperCase()} updated successfully`);
      },
      error: (error) => this.errorHandler.handleError(error, 'update_translation')
    });
  }

  // Delete
  confirmDelete(item: TranslationKey) {
    this.deletingItem = item;
    this.showDeleteConfirm = true;
  }

  deleteItem() {
    const deleting = this.deletingItem;
    if (!deleting) return;

    this.translationService.deleteKey(deleting.id).subscribe({
      next: () => {
        this.loadKeys();
        this.showDeleteConfirm = false;
        this.deletingItem = null;
        this.toastService.success('Translation Key Deleted', 'Translation key deleted successfully');
      },
      error: (error) => this.errorHandler.handleError(error, 'delete_translation_key')
    });
  }

  // Form Helpers
  updateKeyFormField(field: string, value: any) {
    const form = this.keyForm();
    this.keyForm.set({ ...form, [field]: value });
  }

  // Pagination
  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadKeys();
    }
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadKeys();
    }
  }

  // Export
  exportTranslations() {
    const app = this.selectedApp();
    if (!app) return;

    const data: any = {};
    this.keys().forEach(key => {
      data[key.keyName] = {};
      Object.entries(key.translations).forEach(([lang, trans]) => {
        data[key.keyName][lang] = trans.value;
      });
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.name}-translations.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

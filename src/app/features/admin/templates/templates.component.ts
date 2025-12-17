import { Component, inject, signal, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslationService } from '../../../core/services/translation.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { PermissionService } from '../../../core/services/permission.service';
import { environment } from '../../../../environments/environment';

interface Template {
  id: number;
  name: string;
  type: string;
  htmlContent: string;
  cssStyles: string;
  createdAt: string;
  updatedAt: string;
}

interface PageResponse {
  content: Template[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface DialogData {
  show: boolean;
  type: 'delete' | 'duplicate' | null;
  template: Template | null;
  loading: boolean;
}

interface TemplateVersion {
  id: number;
  version: number;
  htmlContent: string;
  cssStyles: string;
  changeLog: string;
  createdAt: string;
}

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  userName: string;
  userEmail: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

interface VersionsDialog {
  show: boolean;
  template: Template | null;
  versions: TemplateVersion[];
  loading: boolean;
}

interface AuditDialog {
  show: boolean;
  template: Template | null;
  logs: AuditLog[];
  loading: boolean;
}

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, TranslatePipe, HasPermissionDirective],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private appContext = inject(AppContextService);
  private permissionService = inject(PermissionService);
  private apiUrl = `${environment.apiUrl}/template-editor`;
  private dashboardApiUrl = `${environment.apiUrl}/dashboard`;

  // Permission checks
  canCreateTemplates = computed(() => this.permissionService.canCreate('templates'));
  canUpdateTemplates = computed(() => this.permissionService.canUpdate('templates'));
  canDeleteTemplates = computed(() => this.permissionService.canDelete('templates'));

  // App context
  selectedApp = this.appContext.selectedApp;

  templates = signal<Template[]>([]);
  loading = signal(true);
  skeletonLoading = signal(false);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  searchQuery = '';
  selectedType = signal<string>('ALL');
  private searchTimeout: any;

  dialog = signal<DialogData>({
    show: false,
    type: null,
    template: null,
    loading: false
  });

  versionsDialog = signal<VersionsDialog>({
    show: false,
    template: null,
    versions: [],
    loading: false
  });

  auditDialog = signal<AuditDialog>({
    show: false,
    template: null,
    logs: [],
    loading: false
  });

  versionCounts = signal<Map<number, number>>(new Map());

  templateTypes = [
    { value: 'ALL', label: 'All', icon: '📄', color: '#6366f1' },
    { value: 'HTML', label: 'HTML', icon: '✉️', color: '#3b82f6' },
    { value: 'TXT', label: 'TXT', icon: '📊', color: '#8b5cf6' },
  ];

  showFiltersDropdown = signal(false);
  activeView = signal<'grid' | 'list'>('grid');

  ngOnInit() {
    this.loadTemplates();

    // Watch for app changes and reload templates
    effect(() => {
      const app = this.selectedApp();
      console.log('Templates - App changed:', app);
      if (app) {
        this.currentPage.set(0);
        this.loadTemplates(true);
      }
    });
  }

  private i18n = inject(TranslationService);

  loadTemplates(useSkeletonLoading = false) {
    if (useSkeletonLoading) {
      this.skeletonLoading.set(true);
    } else {
      this.loading.set(true);
    }

    const params: any = {
      page: this.currentPage(),
      size: 12
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    // Add appName parameter for app-centric filtering
    const app = this.selectedApp();
    if (app) {
      params.appName = app.name;
    }

    this.http.get<PageResponse>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        let filteredContent = data.content;

        // Client-side filtering by type
        if (this.selectedType() !== 'ALL') {
          filteredContent = data.content.filter(t => t.type === this.selectedType());
        }

        this.templates.set(filteredContent);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.currentPage.set(data.number);
        this.loading.set(false);
        this.skeletonLoading.set(false);
        this.loadVersionCounts();
      },
      error: () => {
        this.loading.set(false);
        this.skeletonLoading.set(false);
      }
    });
  }

  filterByType(type: string) {
    this.selectedType.set(type);
    this.currentPage.set(0);
    this.loadTemplates(true);
  }

  selectTypeFromDropdown(type: string) {
    this.filterByType(type);
    this.showFiltersDropdown.set(false);
  }

  getSelectedTypeLabel(): string {
    const selected = this.templateTypes.find(t => t.value === this.selectedType());
    const key = 'templates.type.' + (selected ? selected.value : 'ALL');
    return this.i18n.t(key);
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadTemplates();
    }, 500);
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage.set(0);
    this.loadTemplates(true);
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadTemplates(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openDeleteDialog(template: Template) {
    this.dialog.set({
      show: true,
      type: 'delete',
      template,
      loading: false
    });
  }

  openDuplicateDialog(template: Template) {
    this.dialog.set({
      show: true,
      type: 'duplicate',
      template,
      loading: false
    });
  }

  closeDialog() {
    this.dialog.set({
      show: false,
      type: null,
      template: null,
      loading: false
    });
  }

  confirmDialog() {
    const currentDialog = this.dialog();
    if (!currentDialog.template) return;

    this.dialog.update(d => ({ ...d, loading: true }));

    if (currentDialog.type === 'delete') {
      this.performDelete(currentDialog.template.id);
    } else if (currentDialog.type === 'duplicate') {
      this.performDuplicate(currentDialog.template.id);
    }
  }

  performDelete(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.closeDialog();
        this.loadTemplates(true);
      },
      error: () => {
        this.dialog.update(d => ({ ...d, loading: false }));
      }
    });
  }

  performDuplicate(id: number) {
    this.http.get<Template>(`${this.apiUrl}/${id}`).subscribe({
      next: (template) => {
        const duplicate = {
          name: template.name + ' (Copy)',
          type: template.type,
          htmlContent: template.htmlContent,
          cssStyles: template.cssStyles
        };
        this.http.post(this.apiUrl, duplicate).subscribe({
          next: () => {
            this.closeDialog();
            this.loadTemplates(true);
          },
          error: () => {
            this.dialog.update(d => ({ ...d, loading: false }));
          }
        });
      },
      error: () => {
        this.dialog.update(d => ({ ...d, loading: false }));
      }
    });
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i);
    } else {
      if (current < 4) {
        for (let i = 0; i < 5; i++) pages.push(i);
        pages.push(-1, total - 1);
      } else if (current > total - 5) {
        pages.push(0, -1);
        for (let i = total - 5; i < total; i++) pages.push(i);
      } else {
        pages.push(0, -1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1, total - 1);
      }
    }

    return pages;
  }

  createNew() {
    this.router.navigate(['/admin/template-editor']);
  }

  editTemplate(id: number) {
    this.router.navigate(['/admin/template-editor', id]);
  }

  getPreview(template: Template): string {
    return `<style>${template.cssStyles}</style>${template.htmlContent}`;
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return d.toLocaleDateString();
  }

  // Load version counts for all templates
  loadVersionCounts() {
    this.templates().forEach(template => {
      this.http.get<TemplateVersion[]>(`${this.apiUrl}/${template.id}/versions`).subscribe({
        next: (versions) => {
          const counts = this.versionCounts();
          counts.set(template.id, versions.length);
          this.versionCounts.set(new Map(counts));
        }
      });
    });
  }

  getVersionCount(templateId: number): number {
    return this.versionCounts().get(templateId) || 0;
  }

  openVersionsDialog(template: Template) {
    this.versionsDialog.set({
      show: true,
      template,
      versions: [],
      loading: true
    });

    this.http.get<TemplateVersion[]>(`${this.apiUrl}/${template.id}/versions`).subscribe({
      next: (versions) => {
        this.versionsDialog.update(d => ({ ...d, versions, loading: false }));
      },
      error: () => {
        this.versionsDialog.update(d => ({ ...d, loading: false }));
      }
    });
  }

  closeVersionsDialog() {
    this.versionsDialog.set({
      show: false,
      template: null,
      versions: [],
      loading: false
    });
  }

  openAuditDialog(template: Template) {
    this.auditDialog.set({
      show: true,
      template,
      logs: [],
      loading: true
    });

    this.http.get<any>(`${this.dashboardApiUrl}/audit-logs/entity/TEMPLATE/${template.id}`).subscribe({
      next: (response) => {
        this.auditDialog.update(d => ({ ...d, logs: response.content, loading: false }));
      },
      error: () => {
        this.auditDialog.update(d => ({ ...d, loading: false }));
      }
    });
  }

  closeAuditDialog() {
    this.auditDialog.set({
      show: false,
      template: null,
      logs: [],
      loading: false
    });
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

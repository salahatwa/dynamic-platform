import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LovService } from '../../../core/services/lov.service';
import { Lov, LovRequest, LovType, LovVersion, LovAudit } from '../../../core/models/lov.model';
import { AppContextService } from '../../../core/services/app-context.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-lov-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './lov-management.component.html',
  styleUrls: ['./lov-management.component.scss']
})
export class LovManagementComponent implements OnInit {
  // Data
  lovs = signal<Lov[]>([]);
  lovTypes = signal<LovType[]>([]);
  selectedLov = signal<Lov | null>(null);
  versions = signal<LovVersion[]>([]);
  auditLogs = signal<LovAudit[]>([]);

  // Filters
  selectedLovCode = signal<string>('');
  searchQuery = signal('');
  showActiveOnly = signal(false);
  showLovCodeDropdown = signal(false);
  
  // UI State
  loading = signal(false);
  saving = signal(false);
  activeView = signal<'list' | 'grid'>('grid');
  activeTab = signal<'details' | 'versions' | 'audit'>('details');
  
  // Modals
  showLovModal = signal(false);
  showDeleteModal = signal(false);
  showVersionModal = signal(false);
  showImportModal = signal(false);
  
  // Form - Simplified for LOV Type creation
  lovCode = signal('');
  lovName = signal('');
  lovDescription = signal('');
  active = signal(true);
  editingLovId = signal<number | null>(null);
  
  // Delete
  deleteId = signal<number | null>(null);
  deleteName = signal('');
  
  // Computed
  filteredLovs = computed(() => {
    let filtered = this.lovs();
    
    // Filter by selected LOV code
    if (this.selectedLovCode()) {
      filtered = filtered.filter(l => l.lovCode === this.selectedLovCode());
    }
    
    // Note: Active filtering is handled by backend when loading data
    // No need to filter again here
    
    // Filter by search query
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(l => 
        l.lovCode.toLowerCase().includes(query) ||
        (l.attribute1 && l.attribute1.toLowerCase().includes(query)) ||
        (l.attribute2 && l.attribute2.toLowerCase().includes(query))
      );
    }
    
    return filtered.sort((a, b) => a.lovCode.localeCompare(b.lovCode));
  });
  
  // Get available LOV codes for dropdown
  availableLovCodes = computed(() => {
    const codes = new Set<string>();
    this.lovs().forEach(lov => codes.add(lov.lovCode));
    return Array.from(codes).sort();
  });
  
  groupedLovs = computed(() => {
    const grouped: Record<string, Lov[]> = {};
    this.filteredLovs().forEach(lov => {
      if (!grouped[lov.lovType]) {
        grouped[lov.lovType] = [];
      }
      grouped[lov.lovType].push(lov);
    });
    return grouped;
  });

  selectedAppName = computed(() => {
    const app = this.appContext.selectedApp();
    return app ? app.name : '';
  });

  hasSelectedApp = computed(() => !!this.appContext.selectedApp());

  // Get available languages from all LOVs
  availableLanguages = computed(() => {
    const languages = new Set<string>();
    this.filteredLovs().forEach(lov => {
      if (lov.descriptions) {
        Object.keys(lov.descriptions).forEach(lang => languages.add(lang));
      }
    });
    return Array.from(languages).sort();
  });

  constructor(
    private lovService: LovService,
    private router: Router,
    private appContext: AppContextService
  ) {}

  getGroupedLovTypes(): string[] {
    return Object.keys(this.groupedLovs());
  }

  ngOnInit() {
    this.loadLovTypes();
    this.loadLovs();
    
    // Fallback: If types don't load after 2 seconds, use predefined types
    setTimeout(() => {
      if (this.lovTypes().length === 0) {
        console.warn('LOV types not loaded from backend, using fallback');
        this.lovTypes.set([
          { code: 'COUNTRY', name: 'Country', description: 'Country codes and names', allowHierarchy: true, count: 0 },
          { code: 'MARKET_STATUS', name: 'Market Status', description: 'Market status values', allowHierarchy: true, count: 0 },
          { code: 'USER_ROLE', name: 'User Role', description: 'User role types', allowHierarchy: true, count: 0 },
          { code: 'CURRENCY', name: 'Currency', description: 'Currency codes', allowHierarchy: true, count: 0 },
          { code: 'LANGUAGE', name: 'Language', description: 'Language codes', allowHierarchy: true, count: 0 },
          { code: 'STATUS', name: 'Status', description: 'General status values', allowHierarchy: true, count: 0 },
          { code: 'PRIORITY', name: 'Priority', description: 'Priority levels', allowHierarchy: true, count: 0 },
          { code: 'CATEGORY', name: 'Category', description: 'Category types', allowHierarchy: true, count: 0 }
        ]);
      }
    }, 2000);
  }

  loadLovTypes() {
    console.log('Loading LOV types...');
    this.lovService.getAllLovTypes().subscribe({
      next: (types) => {
        console.log('LOV types received:', types);
        this.lovTypes.set(types);
      },
      error: (err) => {
        console.error('Error loading LOV types:', err);
        console.error('Error details:', err.error);
      }
    });
  }

  loadLovs() {
    this.loading.set(true);
    // Use pages endpoint to get distinct LOV codes
    // Pass active filter: undefined means all, true means active only
    const activeFilter = this.showActiveOnly() ? true : undefined;
    const selectedApp = this.appContext.selectedApp();
    const appName = selectedApp ? selectedApp.name : undefined;
    
    this.lovService.getAllLovPages(activeFilter, appName).subscribe({
      next: (pages) => {
        console.log('LOV pages loaded:', pages);
        // Convert pages to Lov format for display
        const lovs = pages.map(page => ({
          id: 0, // Not used for pages
          lovCode: page.lovCode,
          lovType: page.lovCode,
          lovValue: undefined,
          attribute1: page.name,
          attribute2: page.description,
          attribute3: `${page.valueCount} values`,
          displayOrder: 0,
          active: page.active,
          parentLovId: undefined,
          translationApp: page.translationApp,
          translationKey: undefined,
          descriptions: undefined,
          metadata: JSON.stringify({name: page.name, description: page.description}),
          corporateId: 1,
          version: 1,
          createdBy: page.createdBy,
          createdAt: page.createdAt,
          updatedBy: page.updatedBy,
          updatedAt: page.updatedAt
        }));
        this.lovs.set(lovs);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading LOV pages:', err);
        this.loading.set(false);
      }
    });
  }

  selectType(type: string) {
    this.selectedLovCode.set(type);
    this.loadLovs();
  }

  openLovModal(lov?: Lov) {
    if (lov) {
      // Editing existing LOV type - just navigate to values editor
      this.editValues(lov);
    } else {
      // Creating new LOV type
      this.resetForm();
      this.showLovModal.set(true);
    }
  }

  saveLov() {
    if (!this.lovCode() || !this.lovName()) {
      alert('Please fill in LOV Code and Name');
      return;
    }

    // Store values before resetting
    const code = this.lovCode();
    const name = this.lovName();
    const description = this.lovDescription();

    // Close modal and reset form
    this.showLovModal.set(false);
    this.resetForm();
    
    // Navigate to values editor to add actual values
    this.router.navigate(['/admin/lov/values'], {
      queryParams: {
        lovCode: code,
        lovName: name,
        lovDescription: description
      }
    });
  }

  confirmDelete(lov: Lov) {
    this.deleteId.set(lov.id);
    this.deleteName.set(`${lov.lovCode}${lov.lovValue ? ' - ' + lov.lovValue : ''}`);
    this.showDeleteModal.set(true);
  }

  deleteLov() {
    const id = this.deleteId();
    if (!id) return;

    this.lovService.deleteLov(id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.loadLovs();
      },
      error: (err) => {
        console.error('Error deleting LOV:', err);
        alert('Error deleting LOV');
      }
    });
  }

  viewDetails(lov: Lov) {
    this.selectedLov.set(lov);
    this.activeTab.set('details');
    this.loadVersions(lov.id);
    this.loadAudit(lov.id);
  }

  loadVersions(lovId: number) {
    this.lovService.getLovVersions(lovId).subscribe({
      next: (versions) => this.versions.set(versions),
      error: (err) => console.error('Error loading versions:', err)
    });
  }

  loadAudit(lovId: number) {
    this.lovService.getLovAudit(lovId).subscribe({
      next: (audit) => this.auditLogs.set(audit),
      error: (err) => console.error('Error loading audit:', err)
    });
  }

  restoreVersion(versionId: number) {
    const lov = this.selectedLov();
    if (!lov) return;

    if (confirm('Are you sure you want to restore this version?')) {
      this.lovService.restoreLovVersion(lov.id, versionId).subscribe({
        next: () => {
          this.loadLovs();
          this.loadVersions(lov.id);
          alert('Version restored successfully');
        },
        error: (err) => {
          console.error('Error restoring version:', err);
          alert('Error restoring version');
        }
      });
    }
  }

  exportLovs() {
    this.lovService.exportLovs(this.selectedLovCode() || undefined).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lovs_${this.selectedLovCode() || 'all'}_${new Date().getTime()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error exporting LOVs:', err)
    });
  }

  resetForm() {
    this.editingLovId.set(null);
    this.lovCode.set('');
    this.lovName.set('');
    this.lovDescription.set('');
    this.active.set(true);
  }

  closeModal(modalName: string) {
    switch (modalName) {
      case 'lov':
        this.showLovModal.set(false);
        break;
      case 'delete':
        this.showDeleteModal.set(false);
        break;
      case 'version':
        this.showVersionModal.set(false);
        break;
      case 'import':
        this.showImportModal.set(false);
        break;
    }
  }

  closeDetails() {
    this.selectedLov.set(null);
  }

  editValues(lov: Lov) {
    // Navigate to values editor
    this.router.navigate(['/admin/lov/values'], {
      queryParams: {
        lovCode: lov.lovCode  // Use lovCode
      }
    });
  }
  
  toggleLovCodeDropdown() {
    this.showLovCodeDropdown.update(v => !v);
  }
  
  selectLovCode(code: string) {
    this.selectedLovCode.set(code);
    this.showLovCodeDropdown.set(false);
    // No need to reload - filtering happens in computed property
  }
}

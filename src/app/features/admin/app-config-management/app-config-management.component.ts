import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AppConfigService } from '../../../core/services/app-config.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { 
  AppConfig, 
  AppConfigGroup, 
  AppConfigRequest,
  AppConfigGroupRequest,
  ConfigType,
  AppConfigVersion,
  AppConfigAudit
} from '../../../core/models/app-config.model';

@Component({
  selector: 'app-app-config-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './app-config-management.component.html',
  styleUrls: ['./app-config-management.component.scss']
})
export class AppConfigManagementComponent implements OnInit {
  // Services
  private appContext = inject(AppContextService);
  
  // Data
  configs = signal<AppConfig[]>([]);
  groups = signal<AppConfigGroup[]>([]);
  selectedConfig = signal<AppConfig | null>(null);
  versions = signal<AppConfigVersion[]>([]);
  auditLogs = signal<AppConfigAudit[]>([]);
  
  // Filters
  selectedGroup = signal<number | undefined>(undefined);
  selectedType = signal<string>('');
  searchQuery = signal('');
  showActiveOnly = signal(false);
  showGroupDropdown = signal(false);
  showTypeDropdown = signal(false);
  
  // App context
  selectedApp = this.appContext.selectedApp;
  hasApps = this.appContext.hasApps;
  
  // UI State
  loading = signal(false);
  loadingGroups = signal(false);
  saving = signal(false);
  activeView = signal<'list' | 'grid'>('grid');
  activeTab = signal<'details' | 'versions' | 'audit'>('details');
  
  // Pagination
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  pageSize = signal(20);
  
  // Modals
  showConfigModal = signal(false);
  showGroupModal = signal(false);
  showDeleteModal = signal(false);
  showDetailsModal = signal(false);
  
  // Form - Config
  configId = signal<number | null>(null);
  configKey = signal('');
  configName = signal('');
  configDescription = signal('');
  configType = signal<ConfigType>(ConfigType.TEXT);
  configValue = signal('');
  defaultValue = signal('');
  enumValues = signal('');
  validationRules = signal('');
  isPublic = signal(false);
  isRequired = signal(false);
  displayOrder = signal(0);
  groupId = signal<number | undefined>(undefined);
  appName = signal('');
  active = signal(true);
  
  // Form - Group
  groupFormId = signal<number | null>(null);
  groupKey = signal('');
  groupName = signal('');
  groupDescription = signal('');
  groupAppName = signal('');
  groupDisplayOrder = signal(0);
  groupActive = signal(true);
  
  // Delete
  deleteId = signal<number | null>(null);
  deleteName = signal('');
  deleteType = signal<'config' | 'group'>('config');
  
  // Config Types
  configTypes = Object.values(ConfigType);
  ConfigType = ConfigType;
  
  // Math for template
  Math = Math;
  
  // Computed
  filteredConfigs = computed(() => {
    let filtered = this.configs();
    
    // Filter by group
    if (this.selectedGroup()) {
      filtered = filtered.filter(c => c.groupId === this.selectedGroup());
    }
    
    // Filter by type
    if (this.selectedType()) {
      filtered = filtered.filter(c => c.configType === this.selectedType());
    }
    
    // Filter by search query
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(c => 
        c.configKey.toLowerCase().includes(query) ||
        c.configName.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
      );
    }
    
    return filtered.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.configKey.localeCompare(b.configKey);
    });
  });
  
  filteredGroups = computed(() => {
    return this.groups().sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.groupName.localeCompare(b.groupName);
    });
  });

  private lastLoadedAppId: number | null = null;

  constructor(
    private configService: AppConfigService,
    private router: Router
  ) {
    // No effect - we'll handle app changes manually
  }

  ngOnInit() {
    console.log('App Config Management ngOnInit');
    this.checkAndLoadData();
  }

  private checkAndLoadData() {
    const app = this.selectedApp();
    console.log('checkAndLoadData - app:', app, 'lastLoadedAppId:', this.lastLoadedAppId);
    
    if (!app) {
      console.log('No app selected, clearing data');
      this.configs.set([]);
      this.groups.set([]);
      this.lastLoadedAppId = null;
      return;
    }

    // Only load if app has changed
    if (this.lastLoadedAppId !== app.id) {
      console.log('App changed from', this.lastLoadedAppId, 'to', app.id, '- loading data');
      this.lastLoadedAppId = app.id;
      this.loadConfigs();
      this.loadGroups();
    } else {
      console.log('Same app, skipping data load');
    }
  }

  loadConfigs() {
    const app = this.selectedApp();
    console.log('loadConfigs called - app:', app);
    if (!app) {
      console.log('No app selected, clearing configs');
      this.configs.set([]);
      return;
    }

    // Prevent duplicate calls if already loading
    if (this.loading()) {
      console.log('Already loading configs, skipping duplicate call');
      return;
    }

    console.log('Loading configs for app:', app.name, 'page:', this.currentPage(), 'size:', this.pageSize());
    this.loading.set(true);
    const activeFilter = this.showActiveOnly() ? true : undefined;
    
    this.configService.getAllConfigs(
      app.id,
      this.selectedGroup(),
      activeFilter,
      this.currentPage(),
      this.pageSize()
    ).subscribe({
      next: (response) => {
        console.log('Configs API response:', response);
        // Handle both paginated and non-paginated responses
        if (response && typeof response === 'object' && 'content' in response) {
          // Paginated response
          this.configs.set(response.content || []);
          this.totalElements.set(response.totalElements || 0);
          this.totalPages.set(response.totalPages || 0);
        } else {
          // Non-paginated response (backward compatibility)
          this.configs.set(Array.isArray(response) ? response : []);
          this.totalElements.set(Array.isArray(response) ? response.length : 0);
          this.totalPages.set(1);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading configs:', err);
        this.loading.set(false);
      }
    });
  }

  loadGroups() {
    const app = this.selectedApp();
    if (!app) {
      this.groups.set([]);
      return;
    }

    // Prevent duplicate calls if already loading
    if (this.loadingGroups()) {
      console.log('Already loading groups, skipping duplicate call');
      return;
    }

    console.log('Loading groups for app:', app.name);
    this.loadingGroups.set(true);
    const activeFilter = this.showActiveOnly() ? true : undefined;
    
    this.configService.getAllGroups(
      app.id,
      activeFilter
    ).subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.loadingGroups.set(false);
      },
      error: (err) => {
        console.error('Error loading groups:', err);
        this.loadingGroups.set(false);
      }
    });
  }

  // ==================== Config CRUD ====================

  openConfigModal(config?: AppConfig) {
    const app = this.selectedApp();
    if (!app) return;

    if (config) {
      // Edit mode
      this.configId.set(config.id);
      this.configKey.set(config.configKey);
      this.configName.set(config.configName);
      this.configDescription.set(config.description || '');
      this.configType.set(config.configType);
      this.configValue.set(config.configValue || '');
      this.defaultValue.set(config.defaultValue || '');
      this.enumValues.set(config.enumValues || '');
      this.validationRules.set(config.validationRules || '');
      this.isPublic.set(config.isPublic);
      this.isRequired.set(config.isRequired);
      this.displayOrder.set(config.displayOrder);
      this.groupId.set(config.groupId);
      this.appName.set(app.name);
      this.active.set(config.active);
    } else {
      // Create mode
      this.resetConfigForm();
      this.appName.set(app.name);
    }
    this.showConfigModal.set(true);
  }

  saveConfig() {
    if (!this.configKey() || !this.configName() || !this.appName()) {
      alert('Please fill in required fields: Config Key, Config Name, and App Name');
      return;
    }

    this.saving.set(true);

    const request: AppConfigRequest = {
      configKey: this.configKey(),
      configName: this.configName(),
      description: this.configDescription() || undefined,
      configType: this.configType(),
      configValue: this.configValue() || undefined,
      defaultValue: this.defaultValue() || undefined,
      enumValues: this.enumValues() || undefined,
      validationRules: this.validationRules() || undefined,
      isPublic: this.isPublic(),
      isRequired: this.isRequired(),
      displayOrder: this.displayOrder(),
      groupId: this.groupId(),
      appName: this.appName(),
      active: this.active()
    };

    const operation = this.configId() 
      ? this.configService.updateConfig(this.configId()!, request)
      : this.configService.createConfig(request);

    operation.subscribe({
      next: () => {
        this.showConfigModal.set(false);
        this.saving.set(false);
        this.loadConfigs();
        this.resetConfigForm();
      },
      error: (err) => {
        console.error('Error saving config:', err);
        alert(err.error?.message || 'Error saving configuration');
        this.saving.set(false);
      }
    });
  }

  confirmDeleteConfig(config: AppConfig) {
    this.deleteId.set(config.id);
    this.deleteName.set(config.configName);
    this.deleteType.set('config');
    this.showDeleteModal.set(true);
  }

  deleteConfig() {
    const id = this.deleteId();
    if (!id) return;

    this.configService.deleteConfig(id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.loadConfigs();
      },
      error: (err) => {
        console.error('Error deleting config:', err);
        alert('Error deleting configuration');
      }
    });
  }

  // ==================== Group CRUD ====================

  openGroupModal(group?: AppConfigGroup) {
    const app = this.selectedApp();
    if (!app) return;

    if (group) {
      // Edit mode
      this.groupFormId.set(group.id);
      this.groupKey.set(group.groupKey);
      this.groupName.set(group.groupName);
      this.groupDescription.set(group.description || '');
      this.groupAppName.set(app.name);
      this.groupDisplayOrder.set(group.displayOrder);
      this.groupActive.set(group.active);
    } else {
      // Create mode
      this.resetGroupForm();
      this.groupAppName.set(app.name);
    }
    this.showGroupModal.set(true);
  }

  saveGroup() {
    console.log(this.groupKey());
    console.log(this.groupName());
    console.log(this.groupAppName());
    if (!this.groupKey() || !this.groupName() || !this.groupAppName()) {
      alert('Please fill in required fields: Group Key, Group Name, and App Name');
      return;
    }

    this.saving.set(true);

    const request: AppConfigGroupRequest = {
      groupKey: this.groupKey(),
      groupName: this.groupName(),
      description: this.groupDescription() || undefined,
      appName: this.groupAppName(),
      displayOrder: this.groupDisplayOrder(),
      active: this.groupActive()
    };

    const operation = this.groupFormId() 
      ? this.configService.updateGroup(this.groupFormId()!, request)
      : this.configService.createGroup(request);

    operation.subscribe({
      next: () => {
        this.showGroupModal.set(false);
        this.saving.set(false);
        this.loadGroups();
        this.resetGroupForm();
      },
      error: (err) => {
        console.error('Error saving group:', err);
        alert(err.error?.message || 'Error saving group');
        this.saving.set(false);
      }
    });
  }

  confirmDeleteGroup(group: AppConfigGroup) {
    this.deleteId.set(group.id);
    this.deleteName.set(group.groupName);
    this.deleteType.set('group');
    this.showDeleteModal.set(true);
  }

  deleteGroup() {
    const id = this.deleteId();
    if (!id) return;

    this.configService.deleteGroup(id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.loadGroups();
      },
      error: (err) => {
        console.error('Error deleting group:', err);
        alert(err.error?.message || 'Error deleting group');
      }
    });
  }

  // ==================== Details & History ====================

  viewDetails(config: AppConfig) {
    this.selectedConfig.set(config);
    this.activeTab.set('details');
    this.loadVersions(config.id);
    this.loadAudit(config.id);
    this.showDetailsModal.set(true);
  }

  loadVersions(configId: number) {
    this.configService.getConfigVersions(configId).subscribe({
      next: (versions) => this.versions.set(versions),
      error: (err) => console.error('Error loading versions:', err)
    });
  }

  loadAudit(configId: number) {
    this.configService.getConfigAudit(configId).subscribe({
      next: (audit) => this.auditLogs.set(audit),
      error: (err) => console.error('Error loading audit:', err)
    });
  }

  restoreVersion(versionId: number) {
    const config = this.selectedConfig();
    if (!config) return;

    if (confirm('Are you sure you want to restore this version?')) {
      this.configService.restoreVersion(config.id, versionId).subscribe({
        next: () => {
          this.loadConfigs();
          this.loadVersions(config.id);
          alert('Version restored successfully');
        },
        error: (err) => {
          console.error('Error restoring version:', err);
          alert('Error restoring version');
        }
      });
    }
  }

  // ==================== Filters ====================

  toggleGroupDropdown() {
    this.showGroupDropdown.update(v => !v);
    this.showTypeDropdown.set(false);
  }

  toggleTypeDropdown() {
    this.showTypeDropdown.update(v => !v);
    this.showGroupDropdown.set(false);
  }

  selectGroup(groupId: number | undefined) {
    this.selectedGroup.set(groupId);
    this.showGroupDropdown.set(false);
    this.currentPage.set(0); // Reset to first page when filter changes
    this.checkAndLoadData();
  }

  selectType(type: string) {
    this.selectedType.set(type);
    this.showTypeDropdown.set(false);
    this.currentPage.set(0); // Reset to first page when filter changes
    this.loadConfigs();
  }

  onSearch() {
    this.currentPage.set(0); // Reset to first page when searching
    this.loadConfigs();
  }

  clearFilters() {
    this.selectedGroup.set(undefined);
    this.selectedType.set('');
    this.searchQuery.set('');
    this.showActiveOnly.set(false);
    this.currentPage.set(0);
    this.loadConfigs();
  }

  // ==================== Pagination ====================

  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadConfigs();
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

  // ==================== Utility ====================

  getTypeIcon(type: string): string {
    return this.configService.getConfigTypeIcon(type);
  }

  getTypeColor(type: string): string {
    return this.configService.getConfigTypeColor(type);
  }

  getSelectedGroupName(): string {
    if (!this.selectedGroup()) return 'All Groups';
    const group = this.filteredGroups().find(g => g.id === this.selectedGroup());
    return group?.groupName || 'All Groups';
  }

  resetConfigForm() {
    this.configId.set(null);
    this.configKey.set('');
    this.configName.set('');
    this.configDescription.set('');
    this.configType.set(ConfigType.TEXT);
    this.configValue.set('');
    this.defaultValue.set('');
    this.enumValues.set('');
    this.validationRules.set('');
    this.isPublic.set(false);
    this.isRequired.set(false);
    this.displayOrder.set(0);
    this.groupId.set(undefined);
    this.appName.set('');
    this.active.set(true);
  }

  resetGroupForm() {
    this.groupFormId.set(null);
    this.groupKey.set('');
    this.groupName.set('');
    this.groupDescription.set('');
    this.groupAppName.set('');
    this.groupDisplayOrder.set(0);
    this.groupActive.set(true);
  }

  closeModal(modalName: string) {
    switch (modalName) {
      case 'config':
        this.showConfigModal.set(false);
        break;
      case 'group':
        this.showGroupModal.set(false);
        break;
      case 'delete':
        this.showDeleteModal.set(false);
        break;
      case 'details':
        this.showDetailsModal.set(false);
        break;
    }
  }

  duplicateConfig(config: AppConfig) {
    this.openConfigModal();
    this.configKey.set(config.configKey + '_COPY');
    this.configName.set(config.configName + ' (Copy)');
    this.configDescription.set(config.description || '');
    this.configType.set(config.configType);
    this.configValue.set(config.configValue || '');
    this.defaultValue.set(config.defaultValue || '');
    this.enumValues.set(config.enumValues || '');
    this.validationRules.set(config.validationRules || '');
    this.isPublic.set(config.isPublic);
    this.isRequired.set(config.isRequired);
    this.displayOrder.set(config.displayOrder);
    this.groupId.set(config.groupId);
    this.appName.set(config.appName);
    this.active.set(config.active);
  }

  exportConfigs() {
    // TODO: Implement export functionality
    console.log('Export configs');
  }

  invalidateCache() {
    this.configService.invalidateCache();
    alert('Cache invalidated successfully');
  }
}

import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslationService } from '../../../core/services/translation.service';
import { PermissionService } from '../../../core/services/permission.service';

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

interface PageResponse {
  content: Role[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, HasPermissionDirective],
  template: `
    <div class="roles-page">
      <div class="page-header">
        <div>
          <h1>{{ 'roles.title' | translate }}</h1>
          <p>{{ 'roles.subtitle' | translate }}</p>
        </div>
        <div class="header-actions">
          <button *hasPermission="'roles:create'" 
                  class="btn-primary" 
                  (click)="router.navigate(['/admin/roles/create'])">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ 'roles.createRole' | translate }}
          </button>
        </div>
      </div>

      <!-- System Roles Section -->
      <div class="section">
        <div class="section-header">
          <h2>{{ 'roles.systemRoles' | translate }}</h2>
          <p>{{ 'roles.systemRolesDesc' | translate }}</p>
        </div>
        
        @if (loadingSystemRoles()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ 'roles.loadingSystemRoles' | translate }}</p>
          </div>
        } @else {
          <div class="roles-grid">
            @for (role of systemRoles(); track role.id) {
              <div class="role-card system-role">
                <div class="role-header">
                  <div class="role-info">
                    <h3>{{ role.name }}</h3>
                    <p>{{ role.description }}</p>
                  </div>
                  <div class="role-badge system">
                    {{ 'roles.system' | translate }}
                  </div>
                </div>
                <div class="role-permissions">
                  <div class="permissions-count">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    {{ role.permissions.length }} {{ 'roles.permissions' | translate }}
                  </div>
                  <button class="btn-outline btn-sm" (click)="viewRoleDetails(role)">
                    {{ 'roles.viewDetails' | translate }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Custom Roles Section -->
      <div class="section">
        <div class="section-header">
          <div>
            <h2>{{ 'roles.customRoles' | translate }}</h2>
            <p>{{ 'roles.customRolesDesc' | translate }}</p>
          </div>
          <div class="section-actions">
            <!-- Search Bar -->
            <div class="search-bar">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" 
                     [placeholder]="('roles.searchPlaceholder' | translate)" 
                     [(ngModel)]="searchQuery"
                     (input)="onSearch()"
                     class="search-input"/>
              @if (searchQuery) {
                <button class="clear-btn" (click)="clearSearch()">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        </div>

        @if (loadingCustomRoles()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ 'roles.loadingCustomRoles' | translate }}</p>
          </div>
        } @else if (customRoles().length === 0) {
          <div class="empty-state">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h3>{{ 'roles.empty.title' | translate }}</h3>
            <p>{{ 'roles.empty.desc' | translate }}</p>
            <button *hasPermission="'roles:create'" 
                    class="btn-primary" 
                    (click)="router.navigate(['/admin/roles/create'])">
              {{ 'roles.createFirstRole' | translate }}
            </button>
          </div>
        } @else {
          <div class="roles-grid">
            @for (role of customRoles(); track role.id) {
              <div class="role-card custom-role">
                <div class="role-header">
                  <div class="role-info">
                    <h3>{{ role.name }}</h3>
                    <p>{{ role.description }}</p>
                  </div>
                  <div class="role-badge custom">
                    {{ 'roles.custom' | translate }}
                  </div>
                </div>
                <div class="role-permissions">
                  <div class="permissions-count">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    {{ role.permissions.length }} {{ 'roles.permissions' | translate }}
                  </div>
                  <div class="role-actions">
                    <button class="btn-outline btn-sm" (click)="viewRoleDetails(role)">
                      {{ 'roles.viewDetails' | translate }}
                    </button>
                    <button *hasPermission="'roles:update'" 
                            class="btn-outline btn-sm" 
                            (click)="editRole(role)">
                      {{ 'common.edit' | translate }}
                    </button>
                    <button *hasPermission="'roles:delete'" 
                            class="btn-danger btn-sm" 
                            (click)="deleteRole(role)">
                      {{ 'common.delete' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <button class="page-btn" 
                      [disabled]="currentPage() === 0" 
                      (click)="goToPage(currentPage() - 1)">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              @for (page of getPageNumbers(); track page) {
                @if (page === -1) {
                  <span class="page-ellipsis">...</span>
                } @else {
                  <button class="page-btn" 
                          [class.active]="page === currentPage()" 
                          (click)="goToPage(page)">
                    {{ page + 1 }}
                  </button>
                }
              }

              <button class="page-btn" 
                      [disabled]="currentPage() === totalPages() - 1" 
                      (click)="goToPage(currentPage() + 1)">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          }
        }
      </div>

      <!-- Role Details Modal -->
      @if (selectedRole()) {
        <div class="modal-overlay" (click)="closeRoleDetails()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ selectedRole()?.name }}</h2>
              <button class="modal-close" (click)="closeRoleDetails()">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="role-details">
                <div class="detail-item">
                  <label>{{ 'roles.name' | translate }}</label>
                  <span>{{ selectedRole()?.name }}</span>
                </div>
                <div class="detail-item">
                  <label>{{ 'roles.description' | translate }}</label>
                  <span>{{ selectedRole()?.description || ('common.noDescription' | translate) }}</span>
                </div>
                <div class="detail-item">
                  <label>{{ 'roles.type' | translate }}</label>
                  <span class="role-badge" [class.system]="selectedRole()?.isSystemRole" [class.custom]="!selectedRole()?.isSystemRole">
                    {{ selectedRole()?.isSystemRole ? ('roles.system' | translate) : ('roles.custom' | translate) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>{{ 'roles.permissions' | translate }} ({{ selectedRole()?.permissions?.length || 0 }})</label>
                  <div class="permissions-list">
                    @for (permission of selectedRole()?.permissions || []; track permission.id) {
                      <div class="permission-item">
                        <div class="permission-info">
                          <span class="permission-name">{{ permission.name }}</span>
                          <span class="permission-desc">{{ permission.description }}</span>
                        </div>
                        <div class="permission-meta">
                          <span class="resource-badge">{{ permission.resource }}</span>
                          <span class="action-badge">{{ permission.action }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .roles-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-secondary);
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .section {
      margin-bottom: 3rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      gap: 2rem;
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .section-header p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .section-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      min-width: 300px;
      transition: var(--transition);
    }

    .search-bar:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(42, 122, 228, 0.1);
    }

    .search-bar svg {
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 1rem;
      outline: none;
    }

    .search-input::placeholder {
      color: var(--text-secondary);
    }

    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: 50%;
      transition: var(--transition);
    }

    .clear-btn:hover {
      background: var(--surface-hover);
      color: var(--text);
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .role-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      transition: var(--transition);
    }

    .role-card:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .role-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .role-info h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .role-info p {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .role-badge.system {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }

    .role-badge.custom {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .role-permissions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .permissions-count {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .permissions-count svg {
      color: var(--primary);
    }

    .role-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-primary, .btn-outline, .btn-danger {
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .btn-primary:hover {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
    }

    .btn-outline {
      background: transparent;
      color: var(--text);
      border-color: var(--border);
    }

    .btn-outline:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
      color: var(--primary);
    }

    .btn-danger {
      background: transparent;
      color: #ef4444;
      border-color: #ef4444;
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state svg {
      margin-bottom: 1.5rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
    }

    .page-btn {
      min-width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
    }

    .page-btn:hover:not(:disabled):not(.active) {
      background: var(--surface-hover);
      border-color: var(--primary);
      color: var(--primary);
    }

    .page-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-ellipsis {
      padding: 0 0.5rem;
      color: var(--text-secondary);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-content {
      background: var(--surface);
      border-radius: var(--radius);
      max-width: 600px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .modal-close {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: var(--transition);
    }

    .modal-close:hover {
      background: var(--surface-hover);
      color: var(--text);
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }

    .role-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-item label {
      font-weight: 600;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-item span {
      color: var(--text);
    }

    .permissions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
      padding: 0.5rem;
      background: var(--background);
      border-radius: var(--radius-sm);
    }

    .permission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      gap: 1rem;
    }

    .permission-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .permission-name {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .permission-desc {
      color: var(--text-secondary);
      font-size: 0.8125rem;
    }

    .permission-meta {
      display: flex;
      gap: 0.5rem;
    }

    .resource-badge, .action-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .resource-badge {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }

    .action-badge {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    @media (max-width: 768px) {
      .roles-page {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .search-bar {
        min-width: auto;
      }

      .roles-grid {
        grid-template-columns: 1fr;
      }

      .role-permissions {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .role-actions {
        justify-content: center;
      }

      .modal-overlay {
        padding: 1rem;
      }

      .permission-item {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
      }

      .permission-meta {
        justify-content: flex-start;
      }
    }
  `]
})
export class RolesComponent implements OnInit {
  private http = inject(HttpClient);
  router = inject(Router);
  private apiUrl = `${environment.apiUrl}/roles`;
  private t = inject(TranslationService);
  private permissionService = inject(PermissionService);
  
  // System roles
  systemRoles = signal<Role[]>([]);
  loadingSystemRoles = signal(true);
  
  // Custom roles
  customRoles = signal<Role[]>([]);
  loadingCustomRoles = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  searchQuery = '';
  private searchTimeout: any;
  
  // Modal
  selectedRole = signal<Role | null>(null);
  
  // Permission checks
  canReadRoles = computed(() => this.permissionService.canRead('roles'));
  canCreateRoles = computed(() => this.permissionService.canCreate('roles'));
  canUpdateRoles = computed(() => this.permissionService.canUpdate('roles'));
  canDeleteRoles = computed(() => this.permissionService.canDelete('roles'));
  
  ngOnInit() {
    this.loadSystemRoles();
    this.loadCustomRoles();
  }
  
  loadSystemRoles() {
    this.loadingSystemRoles.set(true);
    this.http.get<Role[]>(`${this.apiUrl}/system`).subscribe({
      next: (data) => {
        this.systemRoles.set(data);
        this.loadingSystemRoles.set(false);
      },
      error: () => {
        this.loadingSystemRoles.set(false);
      }
    });
  }
  
  loadCustomRoles() {
    this.loadingCustomRoles.set(true);
    const params: any = {
      page: this.currentPage(),
      size: 20,
      customOnly: true
    };
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.http.get<PageResponse>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        this.customRoles.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.currentPage.set(data.number);
        this.loadingCustomRoles.set(false);
      },
      error: () => {
        this.loadingCustomRoles.set(false);
      }
    });
  }
  
  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadCustomRoles();
    }, 500);
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.currentPage.set(0);
    this.loadCustomRoles();
  }
  
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadCustomRoles();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  
  viewRoleDetails(role: Role) {
    this.selectedRole.set(role);
  }
  
  closeRoleDetails() {
    this.selectedRole.set(null);
  }
  
  editRole(role: Role) {
    this.router.navigate(['/admin/roles/edit', role.id]);
  }
  
  deleteRole(role: Role) {
    if (confirm(this.t.translate('roles.confirmDeletePrefix') + ` "${role.name}"? ` + this.t.translate('common.cannotUndo'))) {
      this.http.delete(`${this.apiUrl}/${role.id}`).subscribe({
        next: () => {
          this.loadCustomRoles();
        }
      });
    }
  }
}
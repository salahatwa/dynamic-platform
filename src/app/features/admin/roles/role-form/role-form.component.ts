import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { TranslationService } from '../../../../core/services/translation.service';

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
  permissions: Permission[];
}

interface PermissionGroup {
  resource: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="role-form-page">
      <div class="page-header">
        <div class="header-nav">
          <button class="back-btn" (click)="goBack()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            {{ 'common.back' | translate }}
          </button>
          <div class="breadcrumb">
            <span>{{ 'roles.title' | translate }}</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span>{{ isEditMode() ? ('roles.editRole' | translate) : ('roles.createRole' | translate) }}</span>
          </div>
        </div>
        <div>
          <h1>{{ isEditMode() ? ('roles.editRole' | translate) : ('roles.createRole' | translate) }}</h1>
          <p>{{ isEditMode() ? ('roles.editRoleDesc' | translate) : ('roles.createRoleDesc' | translate) }}</p>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'roles.loading' | translate }}</p>
        </div>
      } @else {
        <form [formGroup]="roleForm" (ngSubmit)="onSubmit()" class="role-form">
          <div class="form-sections">
            <!-- Basic Information -->
            <div class="form-section">
              <div class="section-header">
                <h2>{{ 'roles.basicInfo' | translate }}</h2>
                <p>{{ 'roles.basicInfoDesc' | translate }}</p>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="name">{{ 'roles.name' | translate }} *</label>
                  <input type="text" 
                         id="name" 
                         formControlName="name"
                         [placeholder]="('roles.namePlaceholder' | translate)"
                         class="form-input"
                         [class.error]="roleForm.get('name')?.invalid && roleForm.get('name')?.touched">
                  @if (roleForm.get('name')?.invalid && roleForm.get('name')?.touched) {
                    <div class="error-message">
                      @if (roleForm.get('name')?.errors?.['required']) {
                        {{ 'validation.required' | translate }}
                      }
                      @if (roleForm.get('name')?.errors?.['minlength']) {
                        {{ 'validation.nameMinLength' | translate }}
                      }
                    </div>
                  }
                </div>
                
                <div class="form-group full-width">
                  <label for="description">{{ 'roles.description' | translate }}</label>
                  <textarea id="description" 
                            formControlName="description"
                            [placeholder]="('roles.descriptionPlaceholder' | translate)"
                            class="form-textarea"
                            rows="3"></textarea>
                </div>
              </div>
            </div>

            <!-- Permissions -->
            <div class="form-section">
              <div class="section-header">
                <h2>{{ 'roles.permissions' | translate }}</h2>
                <p>{{ 'roles.permissionsDesc' | translate }}</p>
              </div>

              <div class="permissions-section">
                <div class="permissions-header">
                  <div class="permissions-summary">
                    <span class="selected-count">{{ selectedPermissions().size }}</span>
                    <span class="total-count">/ {{ totalPermissions() }} {{ 'roles.permissionsSelected' | translate }}</span>
                  </div>
                  <div class="permissions-actions">
                    <button type="button" class="btn-outline btn-sm" (click)="selectAllPermissions()">
                      {{ 'roles.selectAll' | translate }}
                    </button>
                    <button type="button" class="btn-outline btn-sm" (click)="clearAllPermissions()">
                      {{ 'roles.clearAll' | translate }}
                    </button>
                  </div>
                </div>

                <div class="permissions-groups">
                  @for (group of permissionGroups(); track group.resource) {
                    <div class="permission-group">
                      <div class="group-header">
                        <div class="group-info">
                          <h3>{{ group.resource | titlecase }}</h3>
                          <span class="group-count">{{ getSelectedInGroup(group.resource) }} / {{ group.permissions.length }}</span>
                        </div>
                        <div class="group-actions">
                          <button type="button" 
                                  class="btn-link btn-sm" 
                                  (click)="toggleGroupSelection(group.resource)">
                            {{ isGroupFullySelected(group.resource) ? ('roles.deselectGroup' | translate) : ('roles.selectGroup' | translate) }}
                          </button>
                        </div>
                      </div>
                      
                      <div class="permissions-grid">
                        @for (permission of group.permissions; track permission.id) {
                          <div class="permission-item">
                            <label class="permission-checkbox">
                              <input type="checkbox" 
                                     [checked]="selectedPermissions().has(permission.id)"
                                     (change)="togglePermission(permission.id)">
                              <div class="checkbox-custom"></div>
                              <div class="permission-info">
                                <div class="permission-name">{{ permission.name }}</div>
                                <div class="permission-desc">{{ permission.description }}</div>
                                <div class="permission-meta">
                                  <span class="action-badge">{{ permission.action }}</span>
                                </div>
                              </div>
                            </label>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn-outline" (click)="goBack()">
              {{ 'common.cancel' | translate }}
            </button>
            <button type="submit" 
                    class="btn-primary" 
                    [disabled]="roleForm.invalid || saving()">
              @if (saving()) {
                <div class="btn-spinner"></div>
              }
              {{ isEditMode() ? ('common.update' | translate) : ('common.create' | translate) }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .role-form-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      cursor: pointer;
      transition: var(--transition);
      font-size: 0.875rem;
    }

    .back-btn:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
      color: var(--primary);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .breadcrumb svg {
      width: 12px;
      height: 12px;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-secondary);
    }

    .loading-state {
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

    .role-form {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 2rem;
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .section-header p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 500;
      color: var(--text);
      font-size: 0.875rem;
    }

    .form-input, .form-textarea {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--background);
      color: var(--text);
      font-size: 1rem;
      transition: var(--transition);
    }

    .form-input:focus, .form-textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(42, 122, 228, 0.1);
    }

    .form-input.error, .form-textarea.error {
      border-color: #ef4444;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.8125rem;
    }

    .permissions-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .permissions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
    }

    .permissions-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .selected-count {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
    }

    .total-count {
      color: var(--text-secondary);
    }

    .permissions-actions {
      display: flex;
      gap: 0.5rem;
    }

    .permissions-groups {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .permission-group {
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--background);
      border-bottom: 1px solid var(--border);
    }

    .group-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .group-info h3 {
      font-size: 1rem;
      font-weight: 600;
    }

    .group-count {
      padding: 0.25rem 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 0;
    }

    .permission-item {
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
    }

    .permission-item:nth-child(even) {
      background: var(--background);
    }

    .permission-checkbox {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .permission-checkbox:hover {
      background: var(--surface-hover);
    }

    .permission-checkbox input[type="checkbox"] {
      display: none;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-radius: 4px;
      background: var(--background);
      position: relative;
      transition: var(--transition);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .permission-checkbox input[type="checkbox"]:checked + .checkbox-custom {
      background: var(--primary);
      border-color: var(--primary);
    }

    .permission-checkbox input[type="checkbox"]:checked + .checkbox-custom::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 6px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
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
      line-height: 1.4;
    }

    .permission-meta {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .action-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 2rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
    }

    .btn-primary, .btn-outline, .btn-link {
      padding: 0.75rem 1.5rem;
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

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .btn-link {
      background: transparent;
      color: var(--primary);
      border-color: transparent;
      padding: 0.5rem 1rem;
    }

    .btn-link:hover {
      background: rgba(42, 122, 228, 0.1);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @media (max-width: 768px) {
      .role-form-page {
        padding: 1rem;
      }

      .header-nav {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
      }

      .breadcrumb {
        justify-content: center;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .permissions-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .permissions-grid {
        grid-template-columns: 1fr;
      }

      .group-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class RoleFormComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private apiUrl = `${environment.apiUrl}/roles`;
  private t = inject(TranslationService);
  
  loading = signal(true);
  saving = signal(false);
  isEditMode = signal(false);
  roleId = signal<number | null>(null);
  
  allPermissions = signal<Permission[]>([]);
  selectedPermissions = signal<Set<number>>(new Set());
  
  permissionGroups = computed(() => {
    const permissions = this.allPermissions();
    const groups = new Map<string, Permission[]>();
    
    permissions.forEach(permission => {
      if (!groups.has(permission.resource)) {
        groups.set(permission.resource, []);
      }
      groups.get(permission.resource)!.push(permission);
    });
    
    return Array.from(groups.entries()).map(([resource, permissions]) => ({
      resource,
      permissions: permissions.sort((a, b) => a.action.localeCompare(b.action))
    })).sort((a, b) => a.resource.localeCompare(b.resource));
  });
  
  totalPermissions = computed(() => this.allPermissions().length);
  
  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });
  
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.roleId.set(parseInt(id));
    }
    
    this.loadPermissions();
    
    if (this.isEditMode()) {
      this.loadRole();
    } else {
      this.loading.set(false);
    }
  }
  
  loadPermissions() {
    this.http.get<Permission[]>(`${this.apiUrl}/permissions`).subscribe({
      next: (permissions) => {
        this.allPermissions.set(permissions);
      },
      error: (error) => {
        console.error('Failed to load permissions:', error);
      }
    });
  }
  
  loadRole() {
    if (!this.roleId()) return;
    
    this.http.get<Role>(`${this.apiUrl}/${this.roleId()}`).subscribe({
      next: (role) => {
        this.roleForm.patchValue({
          name: role.name,
          description: role.description
        });
        
        const permissionIds = new Set(role.permissions.map(p => p.id));
        this.selectedPermissions.set(permissionIds);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load role:', error);
        this.loading.set(false);
      }
    });
  }
  
  togglePermission(permissionId: number) {
    const selected = new Set(this.selectedPermissions());
    if (selected.has(permissionId)) {
      selected.delete(permissionId);
    } else {
      selected.add(permissionId);
    }
    this.selectedPermissions.set(selected);
  }
  
  toggleGroupSelection(resource: string) {
    const group = this.permissionGroups().find(g => g.resource === resource);
    if (!group) return;
    
    const selected = new Set(this.selectedPermissions());
    const groupPermissionIds = group.permissions.map(p => p.id);
    const isFullySelected = groupPermissionIds.every(id => selected.has(id));
    
    if (isFullySelected) {
      // Deselect all in group
      groupPermissionIds.forEach(id => selected.delete(id));
    } else {
      // Select all in group
      groupPermissionIds.forEach(id => selected.add(id));
    }
    
    this.selectedPermissions.set(selected);
  }
  
  isGroupFullySelected(resource: string): boolean {
    const group = this.permissionGroups().find(g => g.resource === resource);
    if (!group) return false;
    
    const selected = this.selectedPermissions();
    return group.permissions.every(p => selected.has(p.id));
  }
  
  getSelectedInGroup(resource: string): number {
    const group = this.permissionGroups().find(g => g.resource === resource);
    if (!group) return 0;
    
    const selected = this.selectedPermissions();
    return group.permissions.filter(p => selected.has(p.id)).length;
  }
  
  selectAllPermissions() {
    const allIds = new Set(this.allPermissions().map(p => p.id));
    this.selectedPermissions.set(allIds);
  }
  
  clearAllPermissions() {
    this.selectedPermissions.set(new Set());
  }
  
  onSubmit() {
    if (this.roleForm.invalid || this.saving()) return;
    
    this.saving.set(true);
    
    const formData = {
      name: this.roleForm.value.name,
      description: this.roleForm.value.description,
      permissionIds: Array.from(this.selectedPermissions())
    };
    
    const request = this.isEditMode() 
      ? this.http.put(`${this.apiUrl}/${this.roleId()}`, formData)
      : this.http.post(this.apiUrl, formData);
    
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/roles']);
      },
      error: (error) => {
        console.error('Failed to save role:', error);
        this.saving.set(false);
      }
    });
  }
  
  goBack() {
    this.router.navigate(['/admin/roles']);
  }
}
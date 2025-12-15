import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UserPermissions {
  permissions: string[];
  permissionsByResource: { [resource: string]: string[] };
  isSuperAdmin: boolean;
}

export interface Resource {
  key: string;
  name: string;
}

export interface Action {
  key: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/permissions`;
  
  private userPermissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  public userPermissions$ = this.userPermissionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPermissionsFromStorage();
  }

  /**
   * Load current user permissions from backend
   */
  loadCurrentUserPermissions(): Observable<UserPermissions> {
    return this.http.get<UserPermissions>(`${this.apiUrl}/current-user`).pipe(
      map(permissions => {
        this.userPermissionsSubject.next(permissions);
        return permissions;
      })
    );
  }

  /**
   * Check if current user has permission for a resource and action
   */
  hasPermission(resource: string, action: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    if (!permissions) return false;
    
    const permissionName = `${resource.toUpperCase()}_${action.toUpperCase()}`;
    return permissions.permissions.includes(permissionName) || permissions.isSuperAdmin;
  }

  /**
   * Check if current user has any permission for a resource
   */
  hasAnyPermissionForResource(resource: string): boolean {
    const permissions = this.userPermissionsSubject.value;
    if (!permissions) return false;
    
    if (permissions.isSuperAdmin) return true;
    
    return permissions.permissionsByResource[resource] && 
           permissions.permissionsByResource[resource].length > 0;
  }

  /**
   * Get permissions for a specific resource
   */
  getResourcePermissions(resource: string): string[] {
    const permissions = this.userPermissionsSubject.value;
    if (!permissions) return [];
    
    if (permissions.isSuperAdmin) {
      return ['create', 'read', 'update', 'delete'];
    }
    
    return permissions.permissionsByResource[resource] || [];
  }

  /**
   * Check if current user is super admin
   */
  isSuperAdmin(): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissions?.isSuperAdmin || false;
  }

  /**
   * Check if current user can create records for a resource
   */
  canCreate(resource: string): boolean {
    return this.hasPermission(resource, 'create');
  }

  /**
   * Check if current user can read records for a resource
   */
  canRead(resource: string): boolean {
    return this.hasPermission(resource, 'read');
  }

  /**
   * Check if current user can update records for a resource
   */
  canUpdate(resource: string): boolean {
    return this.hasPermission(resource, 'update');
  }

  /**
   * Check if current user can delete records for a resource
   */
  canDelete(resource: string): boolean {
    return this.hasPermission(resource, 'delete');
  }

  /**
   * Get all available resources
   */
  getResources(): Observable<Resource[]> {
    return this.http.get<Resource[]>(`${this.apiUrl}/resources`);
  }

  /**
   * Get all available actions
   */
  getActions(): Observable<Action[]> {
    return this.http.get<Action[]>(`${this.apiUrl}/actions`);
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/all`);
  }

  /**
   * Get all roles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  /**
   * Create new role
   */
  createRole(role: { name: string; description: string; permissionIds: number[] }): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role);
  }

  /**
   * Update role
   */
  updateRole(id: number, role: { name: string; description: string; permissionIds: number[] }): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, role);
  }

  /**
   * Delete role
   */
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }

  /**
   * Set permissions from login response
   */
  setPermissions(permissions: string[]): void {
    const userPermissions: UserPermissions = {
      permissions,
      permissionsByResource: this.groupPermissionsByResource(permissions),
      isSuperAdmin: this.checkIsSuperAdmin(permissions)
    };
    
    this.userPermissionsSubject.next(userPermissions);
    localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
  }

  /**
   * Load permissions from localStorage
   */
  private loadPermissionsFromStorage(): void {
    const stored = localStorage.getItem('userPermissions');
    if (stored) {
      try {
        const permissions = JSON.parse(stored);
        this.userPermissionsSubject.next(permissions);
      } catch (e) {
        console.error('Failed to parse stored permissions:', e);
        this.loadCurrentUserPermissions().subscribe();
      }
    } else {
      this.loadCurrentUserPermissions().subscribe();
    }
  }

  /**
   * Group permissions by resource
   */
  private groupPermissionsByResource(permissions: string[]): { [resource: string]: string[] } {
    const grouped: { [resource: string]: string[] } = {};
    
    permissions.forEach(permission => {
      const parts = permission.split('_');
      if (parts.length >= 2) {
        const action = parts.pop()!.toLowerCase();
        const resource = parts.join('_').toLowerCase();
        
        if (!grouped[resource]) {
          grouped[resource] = [];
        }
        grouped[resource].push(action);
      }
    });
    
    return grouped;
  }

  /**
   * Check if user is super admin based on permissions
   */
  private checkIsSuperAdmin(permissions: string[]): boolean {
    // Super admin typically has all permissions or specific super admin permissions
    return permissions.some(p => p.includes('SUPER_ADMIN') || p.includes('ALL'));
  }

  /**
   * Clear cached permissions (call when user logs out)
   */
  clearPermissions(): void {
    this.userPermissionsSubject.next(null);
    localStorage.removeItem('userPermissions');
  }

  /**
   * Refresh permissions (call after role changes)
   */
  refreshPermissions(): Observable<UserPermissions> {
    return this.loadCurrentUserPermissions();
  }
}
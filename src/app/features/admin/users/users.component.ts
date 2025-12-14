import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

interface User {
  id: number;
  name: string;
  email: string;
  enabled: boolean;
  createdAt: string;
  roles: any[];
}

interface PageResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="users-page">
      <div class="page-header">
        <div>
          <h1>{{ 'users.title' | translate }}</h1>
          <p>{{ 'users.subtitle' | translate }}</p>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-bar">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" 
               [placeholder]="('users.searchPlaceholder' | translate)" 
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

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>{{ 'users.loading' | translate }}</p>
        </div>
      } @else if (users().length === 0) {
        <div class="empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <h2>{{ 'users.empty.title' | translate }}</h2>
          <p>{{ 'users.empty.desc' | translate }}</p>
        </div>
      } @else {
        <div class="users-table">
          <table>
            <thead>
              <tr>
                <th>{{ 'users.table.name' | translate }}</th>
                <th>{{ 'users.table.email' | translate }}</th>
                <th>{{ 'users.table.status' | translate }}</th>
                <th>{{ 'users.table.joined' | translate }}</th>
                <th>{{ 'users.table.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr>
                  <td>
                    <div class="user-info">
                      <div class="user-avatar">{{ getInitials(user.name || user.email) }}</div>
                      <span class="user-name">{{ user.name || user.email }}</span>
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="status-badge" [class.active]="user.enabled" [class.inactive]="!user.enabled">
                      {{ user.enabled ? ('users.status.active' | translate) : ('users.status.inactive' | translate) }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      @if (user.enabled) {
                        <button class="btn-action btn-warning" (click)="deactivateUser(user)" [attr.title]="('users.actions.deactivate' | translate)">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                          </svg>
                        </button>
                      } @else {
                        <button class="btn-action btn-success" (click)="activateUser(user)" [attr.title]="('users.actions.activate' | translate)">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </button>
                      }
                      <button class="btn-action btn-danger" (click)="deleteUser(user)" [attr.title]="('users.actions.delete' | translate)">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
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
  `,
  styles: [`
    .users-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-secondary);
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
      margin-bottom: 2rem;
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

    .empty-state h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-secondary);
    }

    .users-table {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: var(--background);
      border-bottom: 1px solid var(--border);
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
    }

    td {
      padding: 1rem;
      border-top: 1px solid var(--border);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-name {
      font-weight: 500;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .status-badge.inactive {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-success {
      color: #22c55e;
      border-color: #22c55e;
    }

    .btn-success:hover {
      background: rgba(34, 197, 94, 0.1);
    }

    .btn-warning {
      color: #f59e0b;
      border-color: #f59e0b;
    }

    .btn-warning:hover {
      background: rgba(245, 158, 11, 0.1);
    }

    .btn-danger {
      color: #ef4444;
      border-color: #ef4444;
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.1);
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

    @media (max-width: 768px) {
      .users-page {
        padding: 1rem;
      }

      .users-table {
        overflow-x: auto;
      }

      table {
        min-width: 600px;
      }

      th, td {
        padding: 0.75rem 0.5rem;
      }
    }
  `]
})
export class UsersComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;
  private t = inject(TranslationService);
  
  users = signal<User[]>([]);
  loading = signal(true);
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);
  searchQuery = '';
  private searchTimeout: any;
  
  ngOnInit() {
    this.loadUsers();
  }
  
  loadUsers() {
    this.loading.set(true);
    const params: any = {
      page: this.currentPage(),
      size: 20
    };
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.http.get<PageResponse>(this.apiUrl, { params }).subscribe({
      next: (data) => {
        this.users.set(data.content);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
        this.currentPage.set(data.number);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
  
  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadUsers();
    }, 500);
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.currentPage.set(0);
    this.loadUsers();
  }
  
  goToPage(page: number) {
    this.currentPage.set(page);
    this.loadUsers();
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
  
  activateUser(user: User) {
    if (confirm(this.t.translate('users.confirmActivatePrefix') + ` "${user.name}"?`)) {
      this.http.put(`${this.apiUrl}/${user.id}/activate`, {}).subscribe({
        next: () => this.loadUsers()
      });
    }
  }
  
  deactivateUser(user: User) {
    if (confirm(this.t.translate('users.confirmDeactivatePrefix') + ` "${user.name}"?`)) {
      this.http.put(`${this.apiUrl}/${user.id}/deactivate`, {}).subscribe({
        next: () => this.loadUsers()
      });
    }
  }
  
  deleteUser(user: User) {
    if (confirm(this.t.translate('users.confirmDeletePrefix') + ` "${user.name}"? ` + this.t.translate('common.cannotUndo'))) {
      this.http.delete(`${this.apiUrl}/${user.id}`).subscribe({
        next: () => this.loadUsers()
      });
    }
  }
  
  getInitials(nameOrEmail: string): string {
    if (!nameOrEmail) return '?';
    return nameOrEmail
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return this.t.translate('users.date.today');
    if (days === 1) return this.t.translate('users.date.yesterday');
    if (days < 7) return `${days}` + this.t.translate('users.date.daysAgoSuffix');
    if (days < 30) return `${Math.floor(days / 7)}` + this.t.translate('users.date.weeksAgoSuffix');
    return d.toLocaleDateString();
  }
}

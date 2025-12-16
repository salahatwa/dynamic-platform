import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AppSelectorComponent } from '../../../shared/components/app-selector/app-selector.component';
import { AppContextService } from '../../../core/services/app-context.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, NavbarComponent, AppSelectorComponent],
  template: `
    <div class="admin-layout" [attr.dir]="currentLanguage() === 'ar' ? 'rtl' : 'ltr'">
      <!-- Mobile Overlay -->
      @if (sidebarOpen() && isMobile()) {
        <div class="sidebar-overlay" (click)="closeSidebar()"></div>
      }
      
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
           <div class="logo-area">
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="url(#gradient-logo)"/>
                <path d="M18 10L26 18L18 26L10 18L18 10Z" fill="white" opacity="0.9"/>
                <circle cx="18" cy="18" r="3" fill="white"/>
                <defs>
                  <linearGradient id="gradient-logo" x1="0" y1="0" x2="36" y2="36">
                    <stop offset="0%" stop-color="#6366f1"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
              @if (!sidebarCollapsed() || sidebarOpen()) {
                <h2 class="sidebar-title">{{ 'admin.dashboard' | translate }}</h2>
              }
           </div>
           
           <!-- Desktop Collapse Toggle -->
           <button class="sidebar-toggle" (click)="toggleSidebar()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <!-- Always Accessible -->
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>{{ 'admin.dashboard' | translate }}</span>
            }
          </a>
          
          <a routerLink="/admin/apps" routerLinkActive="active" class="nav-item">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>{{ 'apps.title' | translate }}</span>
            }
          </a>
          
          <div class="nav-divider"></div>
          
          <!-- App-Dependent Items (Disabled if no app selected) -->
          <a routerLink="/admin/translations" 
             routerLinkActive="active" 
             class="nav-item"
             [class.disabled]="!appContext.hasSelectedApp()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
            </svg>
             @if (!sidebarCollapsed()) {
              <span>{{ 'admin.translations' | translate }}</span>
            }
            @if (!appContext.hasSelectedApp() && !sidebarCollapsed()) {
              <svg class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
              </svg>
            }
          </a>
          
          <a routerLink="/admin/templates" 
             [class.active]="isTemplatesActive()" 
             class="nav-item"
             [class.disabled]="!appContext.hasSelectedApp()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>{{ 'admin.templates' | translate }}</span>
            }
            @if (!appContext.hasSelectedApp() && !sidebarCollapsed()) {
              <svg class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
              </svg>
            }
          </a>
          
          <a routerLink="/admin/lov" 
             routerLinkActive="active" 
             class="nav-item"
             [class.disabled]="!appContext.hasSelectedApp()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
             @if (!sidebarCollapsed()) {
              <span>{{ 'lov.title' | translate }}</span>
            }
            @if (!appContext.hasSelectedApp() && !sidebarCollapsed()) {
              <svg class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
              </svg>
            }
          </a>
          
          <a routerLink="/admin/config" 
             routerLinkActive="active" 
             class="nav-item"
             [class.disabled]="!appContext.hasSelectedApp()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
             @if (!sidebarCollapsed()) {
              <span>{{ 'appConfig.title' | translate }}</span>
            }
            @if (!appContext.hasSelectedApp() && !sidebarCollapsed()) {
              <svg class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
              </svg>
            }
          </a>
          
          <a routerLink="/admin/error-codes" 
             routerLinkActive="active" 
             class="nav-item"
             [class.disabled]="!appContext.hasSelectedApp()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
             @if (!sidebarCollapsed()) {
              <span>{{ 'errorCode.title' | translate }}</span>
            }
            @if (!appContext.hasSelectedApp() && !sidebarCollapsed()) {
              <svg class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
              </svg>
            }
          </a>
          
          <a routerLink="/admin/media" 
             routerLinkActive="active" 
             class="nav-item"
             [class.disabled]="!appContext.hasSelectedApp()">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
             @if (!sidebarCollapsed()) {
              <span>{{ 'media.title' | translate }}</span>
            }
            @if (!appContext.hasSelectedApp() && !sidebarCollapsed()) {
              <svg class="lock-icon" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7z"/>
              </svg>
            }
          </a>
          
          <div class="nav-divider"></div>
          
          <!-- Always Accessible -->
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>{{ 'admin.users' | translate }}</span>
            }
          </a>
          
          <a routerLink="/admin/api-keys" routerLinkActive="active" class="nav-item">
             <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1 7 21 9z"/>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>{{ 'admin.apiKeys' | translate }}</span>
            }
          </a>
          
          <a routerLink="/admin/api-documentation" routerLinkActive="active" class="nav-item">
             <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            @if (!sidebarCollapsed()) {
              <span>API Documentation</span>
            }
          </a>
          
          <a routerLink="/admin/invitations" routerLinkActive="active" class="nav-item">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
             @if (!sidebarCollapsed()) {
              <span>{{ 'admin.invitations' | translate }}</span>
            }
          </a>
        </nav>
      </aside>
      
      <main class="main-content" [class.expanded]="sidebarCollapsed()">
        <!-- Admin Navbar with App Selector -->
        <div class="admin-header">
          <app-navbar 
              [mode]="'admin'" 
              [fluid]="true" 
              [sidebarOpen]="sidebarOpen()"
              [showBrand]="isMobile()"
              (toggleSidebar)="toggleSidebar()">
          </app-navbar>
          
          <!-- App Selector Bar -->
          @if (appContext.hasApps()) {
            <div class="app-selector-bar">
              <div class="app-selector-container">
                <app-selector />
                
                <!-- @if (appContext.selectedApp(); as app) {
                  <div class="app-info-badge">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>{{ app.appKey }}</span>
                  </div>
                } -->
              </div>
            </div>
          }
        </div>

        <div class="content-wrapper">
          <!-- Empty State: No Apps (only show on dashboard route) -->
          @if (!appContext.hasApps() && !appContext.loading() && isDashboardRoute()) {
            <div class="empty-state">
              <div class="empty-state-icon">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                </svg>
              </div>
              <h2 class="empty-state-title">{{ 'apps.noApps' | translate }}</h2>
              <p class="empty-state-desc">{{ 'apps.noAppsDesc' | translate }}</p>
              <a routerLink="/admin/apps/create" class="btn btn-primary btn-lg">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>{{ 'apps.createFirst' | translate }}</span>
              </a>
            </div>
          } @else if (appContext.loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>{{ 'common.loading' | translate }}</p>
            </div>
          } @else {
            <router-outlet></router-outlet>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--background);
    }

    .sidebar {
      width: 280px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      overflow-y: auto;
      z-index: 100;
      display: flex;
      flex-direction: column;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 280px !important; /* Force full width on mobile when open */
        box-shadow: none;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
      }
      
      .sidebar.open {
        transform: translateX(0);
        box-shadow: 0 0 40px rgba(0, 0, 0, 0.25);
      }
    }

    .sidebar-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px; /* Match Navbar height */
      background: var(--surface);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    .logo-area {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
        overflow: hidden;
    }

    .sidebar-toggle {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .sidebar-toggle:hover {
      background: var(--surface-hover);
      color: var(--text);
    }
    
    .sidebar.collapsed .sidebar-toggle {
        transform: rotate(180deg);
        margin: 0 auto;
    }
    
    .sidebar.collapsed .logo-area {
        display: none;
    }
    
    /* On mobile, hide the desktop toggle */
    @media (max-width: 768px) {
        .sidebar-toggle { display: none; }
    }

    .sidebar-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text);
      margin: 0;
      white-space: nowrap;
    }

    .sidebar-nav {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.2s;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-item:hover {
      background: var(--surface-hover);
      color: var(--text);
    }

    .nav-item.active {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
    
    .nav-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
    
    .nav-divider {
      height: 1px;
      background: var(--border);
      margin: 0.5rem 0;
    }
    
    .lock-icon {
      margin-left: auto;
      color: var(--text-tertiary);
    }
    
    /* Icon alignment in collapsed mode */
    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem;
    }
    
    /* RTL Adjustments */
    [dir="rtl"] .sidebar {
      left: auto;
      right: 0;
      border-right: none;
      border-left: 1px solid var(--border);
    }
    
    [dir="rtl"] .sidebar-toggle {
        transform: scaleX(-1); /* Flip arrow icon */
    }
    [dir="rtl"] .sidebar.collapsed .sidebar-toggle {
        transform: scaleX(-1) rotate(180deg);
    }
    
    [dir="rtl"] .nav-item {
       /* gap handles spacing automatically, flex-direction is naturally reversed by dir=rtl */
    }

    .main-content {
      flex: 1;
      margin-left: 280px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      min-width: 0; /* Prevent overflow */
    }

    .main-content.expanded {
      margin-left: 80px;
    }

    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
      
      .main-content.expanded {
        margin-left: 0;
      }
    }

    .admin-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--background);
    }
    
    .app-selector-bar {
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      padding: 0.75rem 2rem;
      position: sticky;
      top: 72px;
      z-index: 40;
    }
    
    .app-selector-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 1600px;
      margin: 0 auto;
    }
    
    .app-info-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-family: 'Courier New', monospace;
    }
    
    @media (max-width: 768px) {
      .app-selector-bar {
        padding: 0.75rem 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .app-selector-bar {
        padding: 0.5rem 0.75rem;
      }
      
      .app-selector-container {
        gap: 0.5rem;
      }
    }

    .content-wrapper {
      padding: 2rem;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
      flex: 1;
      min-height: 0; /* Prevent flex overflow */
    }

    @media (max-width: 768px) {
      .content-wrapper {
        padding: 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .content-wrapper {
        padding: 0.75rem;
      }
    }
    
    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 2rem;
    }
    
    .empty-state-icon {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
      border-radius: 20px;
      margin-bottom: 1.5rem;
      color: var(--primary);
    }
    
    .empty-state-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }
    
    .empty-state-desc {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      max-width: 500px;
    }
    
    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 1rem;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }
    
    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1rem;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }

    /* RTL Main Content */
    [dir="rtl"] .main-content {
      margin-left: 0;
      margin-right: 280px;
    }

    [dir="rtl"] .main-content.expanded {
      margin-left: 0;
      margin-right: 80px;
    }
    
    @media (max-width: 768px) {
       [dir="rtl"] .sidebar {
         transform: translateX(100%);
       }
       [dir="rtl"] .sidebar.open {
         transform: translateX(0);
       }
       [dir="rtl"] .main-content {
         margin-right: 0;
       }
       [dir="rtl"] .main-content.expanded {
         margin-right: 0;
       }
    }
  `]
})
export class AdminLayoutComponent {
  appContext = inject(AppContextService);
  themeService = inject(ThemeService);
  sidebarCollapsed = signal(false);
  sidebarOpen = signal(false);
  isMobile = signal(window.innerWidth < 768);
  currentLanguage = signal(localStorage.getItem('language') || 'en');

  private router = inject(Router);
  currentUrl = signal('');
  isAppManagementRoute = computed(() => {
    const url = this.currentUrl();
    return url.includes('/admin/apps');
  });

  isDashboardRoute = computed(() => {
    const url = this.currentUrl();
    return url === '/admin/dashboard' || url === '/admin' || url === '/admin/';
  });

  constructor() {
    this.currentUrl.set(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });

    window.addEventListener('resize', () => {
      const mobile = window.innerWidth < 768;
      this.isMobile.set(mobile);
      if (!mobile) {
        this.sidebarOpen.set(false);
      }
    });

    window.addEventListener('languageChanged', ((e: CustomEvent) => {
      this.currentLanguage.set(e.detail || 'en');
      this.updateDocumentDirection();
    }) as EventListener);

    this.updateDocumentDirection();
  }

  isTemplatesActive(): boolean {
    const url = this.currentUrl();
    return url.includes('/admin/templates') || url.includes('/admin/template-editor');
  }

  updateDocumentDirection() {
    const dir = this.currentLanguage() === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.sidebarOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  /** Toggle theme between light and dark */
  toggleTheme() {
    this.themeService.toggleMode();
  }

  openSidebar() {
    this.sidebarOpen.set(true);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}

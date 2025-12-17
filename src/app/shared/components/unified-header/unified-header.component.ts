import { Component, EventEmitter, Input, Output, inject, ChangeDetectorRef, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslationService } from '../../../core/services/translation.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-unified-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <header class="unified-header" [class.rtl]="isRTL()">
      <div class="header-blur"></div>
      <div [class]="fluid ? 'container-fluid' : 'container'">
        <div class="header-content">
          <!-- Left Section: Sidebar Toggle, Brand & App Context -->
          <div class="header-left">
            <!-- Sidebar Toggle (Admin Mode Only) -->
            @if (mode === 'admin') {
              <button class="sidebar-toggle" (click)="onToggleSidebar()" aria-label="Toggle sidebar">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                </svg>
              </button>
            }

            <!-- Brand (Public Mode or Admin with showBrand) -->
            @if (mode === 'public' || (mode === 'admin' && showBrand)) {
              <a class="brand" routerLink="/">
                <div class="brand-logo">
                  <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                    <rect width="36" height="36" rx="10" fill="url(#gradient)"/>
                    <path d="M18 10L26 18L18 26L10 18L18 10Z" fill="white" opacity="0.9"/>
                    <circle cx="18" cy="18" r="3" fill="white"/>
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="36" y2="36">
                        <stop offset="0%" stop-color="#6366f1"/>
                        <stop offset="100%" stop-color="#8b5cf6"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div class="brand-text">
                  <span class="brand-name">{{ 'landing.title' | translate }}</span>
                </div>
              </a>
            }

            <!-- App Context (Admin Mode Only) -->
            @if (mode === 'admin') {
              <div class="app-context">
                @if (appContext.hasApps()) {
                  @if (appContext.selectedApp(); as app) {
                    <div class="selected-app">
                      <div class="app-icon">
                        @if (app.iconUrl) {
                          <img [src]="app.iconUrl" [alt]="app.name" />
                        } @else {
                          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 002 2zM9 9h6v6H9V9z"/>
                          </svg>
                        }
                      </div>
                      <div class="app-info">
                        <span class="app-name">{{ app.name }}</span>
                        <span class="app-key">{{ app.appKey }}</span>
                      </div>
                    </div>
                  } @else {
                    <a routerLink="/admin/apps" class="no-app-selected">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                      </svg>
                      <span>{{ 'apps.selectApp' | translate }}</span>
                    </a>
                  }
                } @else {
                  <a routerLink="/admin/apps/create" class="create-app">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    <span>{{ 'apps.createFirst' | translate }}</span>
                  </a>
                }
              </div>
            }
          </div>
          
          <!-- Right Section: Controls & User -->
          <div class="header-right">
            <!-- Mobile Menu Toggle -->
            <button class="mobile-toggle" 
                    (click)="toggleMobileMenu()" 
                    [class.active]="mobileMenuOpen"
                    [attr.aria-expanded]="mobileMenuOpen"
                    aria-label="Toggle menu">
              <span class="toggle-line"></span>
              <span class="toggle-line"></span>
              <span class="toggle-line"></span>
            </button>

            <!-- Desktop Controls -->
            <div class="header-controls" [class.mobile-open]="mobileMenuOpen">
              <!-- Language Selector -->
              <div class="control-item dropdown" #langDropdown>
                <button class="control-btn" 
                        (click)="toggleLangMenu($event)"
                        [class.active]="langMenuOpen"
                        aria-label="Select language">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                  </svg>
                  <span class="lang-code">{{ translationService.currentLang().toUpperCase() }}</span>
                  <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L2 4h8L6 8z"/>
                  </svg>
                </button>
                @if (langMenuOpen) {
                  <div class="dropdown-menu">
                    <button class="dropdown-item" 
                            [class.active]="translationService.currentLang() === 'en'"
                            (click)="setLanguage('en')">
                      <span class="flag">🇬🇧</span>
                      <span>English</span>
                      @if (translationService.currentLang() === 'en') {
                        <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.5 3.5L6 11L2.5 7.5"/>
                        </svg>
                      }
                    </button>
                    <button class="dropdown-item" 
                            [class.active]="translationService.currentLang() === 'ar'"
                            (click)="setLanguage('ar')">
                      <span class="flag">🇸🇦</span>
                      <span>العربية</span>
                      @if (translationService.currentLang() === 'ar') {
                        <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.5 3.5L6 11L2.5 7.5"/>
                        </svg>
                      }
                    </button>
                  </div>
                }
              </div>
              
              <!-- Theme Toggle -->
              <div class="control-item">
                <button class="control-btn theme-toggle" 
                        (click)="toggleTheme()"
                        [class.dark]="themeService.isDarkMode"
                        aria-label="Toggle theme">
                  <div class="theme-icon-wrapper">
                    <svg class="theme-icon sun-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="4" stroke-width="2"/>
                      <path stroke-linecap="round" stroke-width="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
                    </svg>
                    <svg class="theme-icon moon-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                    </svg>
                  </div>
                </button>
              </div>

              <!-- Public Navigation -->
              @if (mode === 'public') {
                @if (authService.isAuthenticated()) {
                  <div class="control-item">
                    <a routerLink="/admin" class="control-btn nav-link" routerLinkActive="active">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                      </svg>
                      <span>{{ 'admin.dashboard' | translate }}</span>
                    </a>
                  </div>
                  <div class="control-item">
                    <button class="control-btn logout-btn" (click)="logout()">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span>{{ 'common.logout' | translate }}</span>
                    </button>
                  </div>
                } @else {
                  <div class="control-item">
                    <a routerLink="/pricing" class="control-btn nav-link" routerLinkActive="active">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                      </svg>
                      <span>{{ 'common.pricing' | translate }}</span>
                    </a>
                  </div>
                  <div class="control-item">
                    <a routerLink="/login" class="control-btn nav-link" routerLinkActive="active">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                      </svg>
                      <span>{{ 'common.login' | translate }}</span>
                    </a>
                  </div>
                  <div class="control-item">
                    <a routerLink="/register" class="control-btn primary-btn">
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                      </svg>
                      <span>{{ 'common.register' | translate }}</span>
                    </a>
                  </div>
                }
              }

              <!-- Admin User Profile -->
              @if (mode === 'admin') {
                <div class="control-item user-profile dropdown" #userDropdown>
                  <button class="control-btn profile-btn" 
                          (click)="toggleUserMenu($event)"
                          [class.active]="userMenuOpen"
                          aria-label="User menu">
                    <div class="avatar">
                      <span class="avatar-initials">{{ userInitials }}</span>
                    </div>
                    <div class="user-info">
                      <span class="user-name">{{ userName }}</span>
                    </div>
                    <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 8L2 4h8L6 8z"/>
                    </svg>
                  </button>
                  @if (userMenuOpen) {
                    <div class="dropdown-menu user-dropdown-menu">
                      <div class="user-info-header">
                        <div class="avatar-large">
                          <span class="avatar-initials">{{ userInitials }}</span>
                        </div>
                        <div class="user-details">
                          <div class="user-name-large">{{ userName }}</div>
                          <div class="user-email-small">{{ currentUser?.email }}</div>
                        </div>
                      </div>
                      <div class="dropdown-divider"></div>
                      <button class="dropdown-item" (click)="logout()">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span>{{ 'common.logout' | translate }}</span>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Mobile Overlay -->
            <div class="mobile-overlay" [class.show]="mobileMenuOpen" (click)="closeMobileMenu()"></div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .unified-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 64px;
      background: var(--background);
      border-bottom: 1px solid var(--border);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .header-blur {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      background: rgba(255, 255, 255, 0.85);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    /* Dark mode */
    :host-context([data-theme="dark"]) .header-blur,
    [data-theme="dark"] .header-blur {
      background: rgba(15, 23, 42, 0.85) !important;
      border-bottom-color: rgba(255, 255, 255, 0.08) !important;
    }

    .unified-header {
      background: var(--background) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    .container, .container-fluid {
      position: relative;
      z-index: 1;
      padding: 0 1.5rem;
      height: 100%;
    }

    .container-fluid {
      max-width: 100%;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      gap: 1rem;
    }

    /* Left Section */
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      min-width: 0;
    }

    .sidebar-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .sidebar-toggle:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 0.5rem;
      margin-inline-start: -0.5rem;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .brand:hover {
      background: rgba(99, 102, 241, 0.08);
      transform: translateY(-1px);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    .brand:hover .brand-logo {
      transform: rotate(5deg) scale(1.05);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text);
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    /* App Context */
    .app-context {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      max-width: 400px;
    }

    .selected-app {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.1rem 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      min-width: 0;
      flex: 1;
    }

    .app-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--primary);
    }

    .app-icon img {
      width: 100%;
      height: 100%;
      border-radius: 6px;
      object-fit: cover;
    }

    .app-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
      flex: 1;
    }

    .app-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .app-key {
      font-size: 0.75rem;
      color: var(--text-secondary);
      font-family: 'Courier New', monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-app-selected,
    .create-app {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .no-app-selected:hover,
    .create-app:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
      color: var(--primary);
    }

    .create-app {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .create-app:hover {
      background: var(--primary-dark);
      color: white;
    }

    /* Right Section */
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
      position: relative;
    }

    .mobile-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      width: 44px;
      height: 44px;
      background: var(--surface);
      border: 2px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .mobile-toggle::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: 10px;
    }

    .mobile-toggle:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    }

    .mobile-toggle:hover::before {
      opacity: 1;
    }

    .mobile-toggle:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    }

    .toggle-line {
      width: 20px;
      height: 2.5px;
      background: var(--text);
      border-radius: 2px;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      position: relative;
    }

    .mobile-toggle:hover .toggle-line {
      background: var(--primary);
    }

    .mobile-toggle.active {
      background: var(--primary-light);
      border-color: var(--primary);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
    }

    .mobile-toggle.active::before {
      opacity: 1;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%);
    }

    .mobile-toggle.active .toggle-line {
      background: var(--primary);
    }

    .mobile-toggle.active .toggle-line:nth-child(1) { 
      transform: translateY(6.5px) rotate(45deg); 
    }
    .mobile-toggle.active .toggle-line:nth-child(2) { 
      opacity: 0;
      transform: scale(0);
    }
    .mobile-toggle.active .toggle-line:nth-child(3) { 
      transform: translateY(-6.5px) rotate(-45deg); 
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .control-item {
      position: relative;
    }

    .control-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 40px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem 0.75rem;
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .control-btn:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
    }

    .control-btn.active {
      background: var(--primary-light);
      border-color: var(--primary);
      color: var(--primary);
    }

    .primary-btn {
      background: var(--primary) !important;
      color: white !important;
      border-color: var(--primary) !important;
    }

    .primary-btn:hover {
      background: var(--primary-dark) !important;
      color: white !important;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1) !important;
      border-color: #ef4444 !important;
      color: #ef4444 !important;
    }

    /* Language Selector */
    .lang-code {
      font-weight: 600;
      font-size: 0.75rem;
    }

    .dropdown-arrow {
      transition: transform 0.2s;
    }

    .control-btn.active .dropdown-arrow {
      transform: rotate(180deg);
    }

    /* Theme Toggle */
    .theme-icon-wrapper {
      position: relative;
      width: 18px;
      height: 18px;
    }

    .theme-icon {
      position: absolute;
      inset: 0;
      transition: transform 0.3s, opacity 0.3s;
    }

    .sun-icon {
      opacity: 1;
      transform: rotate(0);
    }

    .moon-icon {
      opacity: 0;
      transform: rotate(90deg);
    }

    .theme-toggle.dark .sun-icon {
      opacity: 0;
      transform: rotate(-90deg);
    }

    .theme-toggle.dark .moon-icon {
      opacity: 1;
      transform: rotate(0);
    }

    /* User Profile */
    .profile-btn {
      gap: 0.75rem;
      padding: 0.375rem 0.75rem;
      max-width: 200px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
      flex: 1;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 120px;
    }

    /* Dropdown Menus */
    .dropdown-menu {
      display: block;
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 0.5rem;
      min-width: 160px;
      z-index: 1050;
      animation: fadeInDown 0.2s ease-out;
      opacity: 1;
      visibility: visible;
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .rtl .dropdown-menu {
      right: auto;
      left: 0;
    }

    /* Dark mode dropdown */
    :host-context([data-theme="dark"]) .dropdown-menu,
    [data-theme="dark"] .dropdown-menu {
      background: var(--surface-elevated);
      border-color: var(--border);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.75rem;
      border: none;
      background: transparent;
      color: var(--text);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      text-align: inherit;
      font-size: 0.875rem;
    }

    .dropdown-item:hover {
      background: var(--surface-hover);
      color: var(--primary);
    }

    .dropdown-item.active {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
    }

    /* User Dropdown */
    .user-dropdown-menu {
      min-width: 280px;
      padding: 0;
    }

    .user-info-header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1rem;
      background: var(--surface-hover);
      border-radius: 12px 12px 0 0;
    }

    .avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-weight: 700;
      font-size: 1.125rem;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name-large {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email-small {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border);
      margin: 0;
    }

    .user-dropdown-menu .dropdown-item {
      padding: 0.875rem 1rem;
      margin: 0;
      border-radius: 0;
    }

    .user-dropdown-menu .dropdown-item:last-child {
      border-radius: 0 0 12px 12px;
    }

    .mobile-overlay {
      display: none;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .header-content {
        gap: 0.5rem;
      }

      .header-left {
        gap: 0.5rem;
        flex: 1;
        min-width: 0;
      }

      .mobile-toggle {
        display: flex;
        margin-left: auto;
      }

      .rtl .mobile-toggle {
        margin-left: 0;
        margin-right: auto;
      }

      .header-controls {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 90vw;
        max-width: 400px;
        background: var(--surface);
        border-left: 1px solid var(--border);
        box-shadow: -20px 0 60px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 1001;
        padding: 6rem 2rem 2rem;
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        overflow-y: auto;
        border-radius: 24px 0 0 24px;
      }

      .header-controls.mobile-open {
        transform: translateX(0);
        opacity: 1;
        visibility: visible;
      }

      .rtl .header-controls {
        right: auto;
        left: 0;
        border-left: none;
        border-right: 1px solid var(--border);
        transform: translateX(-100%);
        border-radius: 0 24px 24px 0;
        box-shadow: 20px 0 60px rgba(0, 0, 0, 0.15);
      }

      .rtl .header-controls.mobile-open {
        transform: translateX(0);
      }

      .control-btn {
        width: 100%;
        justify-content: flex-start;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        font-weight: 600;
        gap: 1rem;
        min-height: 56px;
        background: var(--surface-elevated);
        border: 2px solid var(--border);
      }

      .control-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.15);
      }

      .primary-btn {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%) !important;
        color: white !important;
        border-color: transparent !important;
      }

      .dropdown-menu {
        position: static !important;
        width: 100% !important;
        margin-top: 0.75rem;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .mobile-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(8px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 999;
      }

      .mobile-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      /* Hide some elements on mobile */
      .brand-text {
        display: none;
      }

      .app-context {
        max-width: 200px;
      }

      .app-key {
        display: none;
      }

      .user-info {
        display: none;
      }

      .profile-btn .dropdown-arrow {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .container, .container-fluid {
        padding: 0 1rem;
      }

      .app-context {
        max-width: 150px;
      }

      .selected-app {
        padding: 0.375rem 0.5rem;
      }

      .app-icon {
        width: 28px;
        height: 28px;
      }
    }

    /* RTL Support */
    .rtl .header-left {
      flex-direction: row-reverse;
    }

    .rtl .header-right {
      flex-direction: row-reverse;
    }

    .rtl .selected-app {
      flex-direction: row-reverse;
    }

    .rtl .control-btn {
      flex-direction: row-reverse;
    }

    .rtl .user-info {
      align-items: flex-end;
    }

    /* Dark mode enhancements */
    :host-context([data-theme="dark"]) .header-controls,
    [data-theme="dark"] .header-controls {
      background: rgba(15, 23, 42, 0.95);
      border-left-color: rgba(255, 255, 255, 0.1);
      box-shadow: -20px 0 60px rgba(0, 0, 0, 0.4);
    }

    :host-context([data-theme="dark"]) .rtl .header-controls,
    [data-theme="dark"] .rtl .header-controls {
      border-right-color: rgba(255, 255, 255, 0.1);
      box-shadow: 20px 0 60px rgba(0, 0, 0, 0.4);
    }

    /* Dark mode mobile toggle */
    :host-context([data-theme="dark"]) .mobile-toggle,
    [data-theme="dark"] .mobile-toggle {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.1);
    }

    :host-context([data-theme="dark"]) .mobile-toggle:hover,
    [data-theme="dark"] .mobile-toggle:hover {
      background: rgba(51, 65, 85, 0.9);
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    :host-context([data-theme="dark"]) .mobile-toggle.active,
    [data-theme="dark"] .mobile-toggle.active {
      background: rgba(99, 102, 241, 0.2);
      border-color: var(--primary);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
    }
  `]
})
export class UnifiedHeaderComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  translationService = inject(TranslationService);
  appContext = inject(AppContextService);
  private subscriptionService = inject(SubscriptionService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  @Input() mode: 'public' | 'admin' = 'public';
  @Input() fluid = false;
  @Input() showBrand = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  mobileMenuOpen = false;
  langMenuOpen = false;
  userMenuOpen = false;
  isRTL = signal(document.documentElement.dir === 'rtl');

  // User info
  get currentUser() {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }
  
  get userInitials() {
    const user = this.currentUser;
    if (!user) return 'U';
    
    const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial || user.email?.charAt(0)?.toUpperCase() || 'U';
  }
  
  get userName() {
    const user = this.currentUser;
    if (!user) return 'User';
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || user.email || 'User';
  }

  constructor() {
    // Subscribe to theme changes
    this.themeService.currentMode$.subscribe(() => {
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  ngOnInit() {
    // Close dropdowns when clicking outside
    this.onDocumentClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const dropdown = target.closest('.dropdown');
      if (!dropdown) {
        if (this.langMenuOpen || this.userMenuOpen) {
          this.langMenuOpen = false;
          this.userMenuOpen = false;
          this.cdr.markForCheck();
        }
      }
    };
    document.addEventListener('click', this.onDocumentClick);

    // Close mobile menu on route change
    this.router.events.subscribe(() => {
      this.mobileMenuOpen = false;
      this.langMenuOpen = false;
      this.userMenuOpen = false;
    });

    // Close menus on escape key
    document.addEventListener('keydown', (e) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        this.mobileMenuOpen = false;
        this.langMenuOpen = false;
        this.userMenuOpen = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.onDocumentClick) {
      document.removeEventListener('click', this.onDocumentClick);
    }
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  toggleLangMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.langMenuOpen = !this.langMenuOpen;
    this.userMenuOpen = false;
    this.cdr.markForCheck();
  }
  
  toggleUserMenu(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
    this.langMenuOpen = false;
    this.cdr.markForCheck();
  }

  toggleTheme() {
    this.themeService.toggleMode();
  }

  setLanguage(lang: 'en' | 'ar') {
    this.translationService.setLanguage(lang);
    this.langMenuOpen = false;
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.body.setAttribute('dir', dir);
    this.isRTL.set(dir === 'rtl');
  }

  logout() {
    this.authService.logout();
    this.mobileMenuOpen = false;
  }

  private onDocumentClick?: (e: Event) => void;
}
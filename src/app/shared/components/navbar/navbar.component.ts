import { Component, EventEmitter, Input, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="navbar" [class.navbar-admin]="mode === 'admin'">
      <div class="navbar-blur"></div>
      <div [class]="fluid ? 'container-fluid' : 'container'">
        <div class="navbar-content">
          <!-- Left Section: Sidebar Toggle & Brand -->
          <div class="navbar-left">
            @if (mode === 'admin') {
              <button class="menu-toggle" (click)="onToggleSidebar()">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                </svg>
              </button>
            }

            <!-- Logo & Brand (Shown if public OR if explicitly enabled for admin) -->
            @if (mode === 'public' || (mode === 'admin' && showBrand)) {
              <a class="navbar-brand" routerLink="/">
                <div class="brand-logo">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
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
                  <span class="brand-tagline">Professional Templates</span>
                </div>
              </a>
            }
          </div>
          
          <!-- Right Section: Toggle + Actions -->
          <div class="navbar-right">
            <!-- Mobile Menu Toggle (Both Public and Admin) -->
            <button class="navbar-toggle" 
                    (click)="toggleMenu()" 
                    [class.active]="menuOpen"
                    [attr.aria-expanded]="menuOpen"
                    aria-label="Toggle menu"
                    aria-controls="primary-menu">
              <span class="toggle-line"></span>
              <span class="toggle-line"></span>
              <span class="toggle-line"></span>
            </button>

            <!-- Actions / Menu -->
            <div class="navbar-menu" [class.open]="menuOpen" [class.admin-menu]="mode === 'admin'" id="primary-menu">
              <!-- Mobile Menu Close Button -->
              <!-- <button class="mobile-close-btn" (click)="closeMenu()" aria-label="Close menu">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button> -->
              
              <div class="navbar-actions">
              <!-- Language Selector -->
              <div class="dropdown" #langDropdown>
                <button class="icon-btn" 
                        (click)="toggleLangMenu($event)"
                        [class.active]="langMenuOpen"
                        aria-label="Select language">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              
              <!-- Theme Switcher -->
              <button class="icon-btn theme-toggle" 
                      (click)="toggleTheme()"
                      [class.dark]="themeService.isDarkMode"
                      aria-label="Toggle theme">
                <div class="theme-icon-wrapper">
                  <svg class="theme-icon sun-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" stroke-width="2"/>
                    <path stroke-linecap="round" stroke-width="2" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
                  </svg>
                  <svg class="theme-icon moon-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                </div>
              </button>
              
              <!-- Public Navigation Links -->
              @if (mode === 'public') {
                @if (authService.isAuthenticated()) {
                  <a routerLink="/admin" class="nav-link" routerLinkActive="active">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    <span>{{ 'admin.dashboard' | translate }}</span>
                  </a>
                  <button class="btn btn-outline" (click)="logout()">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span>{{ 'common.logout' | translate }}</span>
                  </button>
                } @else {
                  <a routerLink="/pricing" class="nav-link" routerLinkActive="active">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                    <span>{{ 'common.pricing' | translate }}</span>
                  </a>
                  <a routerLink="/login" class="nav-link" routerLinkActive="active">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                    </svg>
                    <span>{{ 'common.login' | translate }}</span>
                  </a>
                  <a routerLink="/register" class="btn btn-primary">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    <span>{{ 'common.register' | translate }}</span>
                  </a>
                }
              }

              <!-- Admin Navigation Links -->
              @if (mode === 'admin') {
                <div class="user-profile dropdown" #userDropdown>
                  <button class="icon-btn profile-btn" 
                          (click)="toggleUserMenu($event)"
                          [class.active]="userMenuOpen"
                          aria-label="User menu">
                    <div class="avatar">
                      <span class="avatar-initials">{{ userInitials }}</span>
                    </div>
                    <div class="user-info">
                      <span class="user-name">{{ userName }}</span>
                      <!-- <span class="user-email">{{ currentUser?.email }}</span> -->
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
            </div>
            <div class="mobile-overlay" [class.show]="menuOpen" (click)="closeMenu()"></div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 72px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .navbar-admin {
      background: var(--background);
      border-bottom: 1px solid var(--border);
    }
    
    .navbar-blur {
      position: absolute;
      inset: 0;
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      background: rgba(255, 255, 255, 0.85);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }
    
    .navbar-admin .navbar-blur {
      display: none; /* Admin uses solid background */
    }

    /* Dark mode navbar blur - more specific selectors */
    :host-context([data-theme="dark"]) .navbar-blur,
    [data-theme="dark"] .navbar-blur {
      background: rgba(15, 23, 42, 0.85) !important;
      border-bottom-color: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
    }

    /* Ensure admin navbar adapts to dark mode */
    .navbar-admin {
      background: var(--background) !important;
      border-bottom: 1px solid var(--border) !important;
    }

    /* Dark mode admin navbar */
    :host-context([data-theme="dark"]) .navbar-admin,
    [data-theme="dark"] .navbar-admin {
      background: var(--background) !important;
      border-bottom-color: var(--border) !important;
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

    .navbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      position: relative;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      background: transparent;
      border: none;
      color: var(--text);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .menu-toggle:hover {
      background: var(--surface-hover);
    }

    /* Brand Styling */
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 0.5rem;
      margin-inline-start: -0.5rem; /* Logical margin for RTL/LTR */
      border-radius: 12px;
    }

    .navbar-brand:hover {
      background: rgba(99, 102, 241, 0.08);
      transform: translateY(-1px);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease;
    }

    .navbar-brand:hover .brand-logo {
      transform: rotate(5deg) scale(1.05);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .brand-name {
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--text);
      line-height: 1.2;
      letter-spacing: -0.02em;
    }

    .brand-tagline {
      font-size: 0.6875rem;
      color: var(--text-secondary);
      font-weight: 500;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    @media (max-width: 640px) {
      .brand-tagline {
        display: none;
      }
    }

    /* Mobile Menu Toggle */
    .navbar-toggle {
      display: none; /* Hidden by default, shown on mobile */
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s ease;
      position: relative;
    }
    
    @media (max-width: 767px) {
      .navbar-toggle {
        display: flex;
      }
    }

    /* Mobile Responsive Improvements */
    @media (max-width: 767px) {
      .navbar-content {
        padding: 0 0.5rem;
        position: relative !important;
      }

      .navbar .container, .navbar .container-fluid {
        padding-right: 0 !important;
        padding-left: 0.5rem !important;
      }
      
      .navbar-left {
        gap: 0.5rem;
        flex: 1 1 auto;
        min-width: 0;
        padding-inline-end: 100px; /* More space for both toggles in admin mode */
      }
      
      .navbar-right {
        gap: 0.25rem;
        flex: 0 0 auto;
        margin-left: auto;
        position: relative !important;
        height: 72px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
      }

      /* Mobile navbar menu toggle positioning */
      .navbar-toggle {
        position: absolute !important;
        right: 0.5rem !important;
        top: 14px !important;
        z-index: 1002 !important;
      }
      
      /* Admin sidebar toggle positioning */
      .menu-toggle {
        width: 40px;
        height: 40px;
        padding: 0.5rem;
        flex-shrink: 0;
        position: absolute !important;
        right: 50px !important; /* Position to the left of navbar toggle */
        top: 16px !important;
        z-index: 1002 !important;
      }
      
      /* RTL adjustments */
      [dir="rtl"] .navbar-toggle {
        right: auto !important;
        left: 0.5rem !important;
      }
      
      [dir="rtl"] .menu-toggle {
        right: auto !important;
        left: 50px !important;
      }
      
      .brand-text {
        .brand-name {
          font-size: 1rem;
        }
      }
      
      /* Modern Professional Mobile Drawer */
      .navbar-menu {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        left: auto !important;
        bottom: 0 !important;
        width: 90vw !important;
        max-width: 420px;
        background: var(--surface) !important;
        backdrop-filter: blur(24px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
        border-left: 1px solid var(--border) !important;
        box-shadow: -20px 0 60px rgba(0, 0, 0, 0.15), 
                    -8px 0 32px rgba(0, 0, 0, 0.1),
                    inset 1px 0 0 rgba(255, 255, 255, 0.1) !important;
        transform: translateX(100%) !important;
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        z-index: 1001;
        padding: 0 !important;
        border-radius: 24px 0 0 24px !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
      }
      
      .navbar-menu.open {
        transform: translateX(0) !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      /* Dark mode enhancements */
      :host-context([data-theme="dark"]) .navbar-menu,
      [data-theme="dark"] .navbar-menu {
        background: rgba(15, 23, 42, 0.95) !important;
        border-left-color: rgba(255, 255, 255, 0.1) !important;
        box-shadow: -20px 0 60px rgba(0, 0, 0, 0.4), 
                    -8px 0 32px rgba(0, 0, 0, 0.3),
                    inset 1px 0 0 rgba(255, 255, 255, 0.05) !important;
      }

      /* RTL: Professional drawer from left */
      [dir="rtl"] .navbar-menu {
        right: auto !important;
        left: 0 !important;
        border-left: none !important;
        border-right: 1px solid var(--border) !important;
        transform: translateX(-100%) !important;
        box-shadow: 20px 0 60px rgba(0, 0, 0, 0.15), 
                    8px 0 32px rgba(0, 0, 0, 0.1),
                    inset -1px 0 0 rgba(255, 255, 255, 0.1) !important;
        border-radius: 0 24px 24px 0 !important;
      }
      
      [dir="rtl"] .navbar-menu.open { 
        transform: translateX(0) !important; 
      }
      
      [dir="rtl"][data-theme="dark"] .navbar-menu {
        border-right-color: rgba(255, 255, 255, 0.1) !important;
        box-shadow: 20px 0 60px rgba(0, 0, 0, 0.4), 
                    8px 0 32px rgba(0, 0, 0, 0.3),
                    inset -1px 0 0 rgba(255, 255, 255, 0.05) !important;
      }

      /* Keep navbar-right anchored to the physical right even in RTL */
      [dir="rtl"] .navbar-right {
        right: 0 !important;
        left: auto !important;
      }

      [dir="rtl"] .navbar-left {
        padding-inline-start: 56px;
        padding-inline-end: 0;
      }
    
      .navbar-menu.admin-menu {
        position: static;
        background: transparent;
        border: none;
        box-shadow: none;
        transform: none;
        opacity: 1;
        visibility: visible;
        border-radius: 0;
        padding: 0;
        max-height: none;
        overflow: visible;
      }
      
      /* Mobile Menu Header */
      .navbar-menu::before {
        content: '';
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: linear-gradient(135deg, 
          rgba(99, 102, 241, 0.1) 0%, 
          rgba(168, 85, 247, 0.1) 100%);
        border-bottom: 1px solid var(--border);
        z-index: 10;
        display: block;
      }
      
      /* Mobile Menu Close Button */
      .mobile-close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 11;
      }
      
      .mobile-close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: var(--primary);
        transform: scale(1.05);
        color: var(--primary);
      }
      
      [dir="rtl"] .mobile-close-btn {
        right: auto;
        left: 20px;
      }
      
      /* Dark mode close button */
      :host-context([data-theme="dark"]) .mobile-close-btn,
      [data-theme="dark"] .mobile-close-btn {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
      }
      
      :host-context([data-theme="dark"]) .mobile-close-btn:hover,
      [data-theme="dark"] .mobile-close-btn:hover {
        background: rgba(0, 0, 0, 0.3);
      }
      
      .navbar-actions {
        flex-direction: column;
        padding: 6rem 2rem 2rem;
        gap: 1.5rem;
        align-items: stretch;
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Mobile menu section headers */
      .navbar-actions::before {
        content: 'Menu';
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--text-secondary);
        margin-bottom: -0.5rem;
        padding-left: 0.5rem;
      }
      
      .admin-menu .navbar-actions {
        flex-direction: row;
        padding: 0;
        gap: 0.25rem;
        align-items: center;
        flex: none;
        overflow: visible;
      }
      
      /* Professional Mobile Dropdown Menus */
      .dropdown-menu {
        position: static !important;
        right: auto !important;
        left: auto !important;
        width: 100% !important;
        max-width: none !important;
        z-index: 1002 !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 4px 16px rgba(0, 0, 0, 0.1) !important;
        border: 2px solid var(--border);
        border-radius: 16px;
        margin-top: 0.75rem;
        background: var(--surface-elevated);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        overflow: hidden;
        animation: slideDown 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      /* Dark mode dropdown */
      :host-context([data-theme="dark"]) .dropdown-menu,
      [data-theme="dark"] .dropdown-menu {
        background: rgba(30, 41, 59, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05),
                    0 4px 16px rgba(0, 0, 0, 0.3) !important;
      }
      
      /* Admin mode dropdown positioning */
      .admin-menu .dropdown-menu {
        position: absolute !important;
        top: calc(100% + 0.5rem) !important;
        right: 0 !important;
        left: auto !important;
        width: auto !important;
        min-width: 280px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
        margin-top: 0;
      }
      
      [dir="rtl"] .admin-menu .dropdown-menu {
        right: auto !important;
        left: 0 !important;
      }
      
      /* Professional Mobile Icon Buttons */
      .icon-btn {
        min-width: 56px;
        min-height: 56px;
        padding: 1rem;
        border: 2px solid var(--border);
        border-radius: 16px;
        background: var(--surface-elevated);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        overflow: hidden;
      }
      
      .icon-btn::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, 
          rgba(99, 102, 241, 0.05) 0%, 
          rgba(168, 85, 247, 0.05) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .icon-btn:hover::before,
      .icon-btn.active::before {
        opacity: 1;
      }
      
      .icon-btn:hover {
        border-color: var(--primary);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
      }
      
      .icon-btn.active {
        border-color: var(--primary);
        background: var(--primary-light);
        color: var(--primary);
      }
      
      /* Dark mode button enhancements */
      :host-context([data-theme="dark"]) .icon-btn,
      [data-theme="dark"] .icon-btn {
        background: rgba(30, 41, 59, 0.8);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
      
      :host-context([data-theme="dark"]) .icon-btn:hover,
      [data-theme="dark"] .icon-btn:hover {
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
      }
      
      /* Professional Mobile User Profile */
      .user-profile .profile-btn {
        padding: 1rem 1.25rem;
        gap: 1rem;
        min-width: auto;
        border-radius: 20px;
        background: linear-gradient(135deg, 
          var(--primary) 0%, 
          var(--secondary) 100%);
        border: 2px solid transparent;
        color: white;
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }
        
        .user-name {
          color: white;
          font-weight: 700;
          font-size: 1rem;
          max-width: none;
        }
        
        .dropdown-arrow {
          display: block;
          color: rgba(255, 255, 255, 0.8);
        }
      }
      
      .user-profile .profile-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        border-color: rgba(255, 255, 255, 0.2);
      }
      
      .user-profile .profile-btn.active {
        background: linear-gradient(135deg, 
          var(--secondary) 0%, 
          var(--primary) 100%);
        box-shadow: 0 8px 24px rgba(168, 85, 247, 0.4);
      }
      
      .admin-menu .user-profile .profile-btn {
        padding: 0.375rem 0.5rem;
        gap: 0.5rem;
        border-radius: 12px;
        background: transparent;
        border: 2px solid var(--border);
        color: var(--text);
        box-shadow: none;
        
        .user-info {
          display: none;
        }
        
        .dropdown-arrow {
          display: none;
        }
      }
    }
    
    /* Very small screens */
    @media (max-width: 480px) {
      .container, .container-fluid {
        padding-left: 1rem;
        padding-right: 1rem;
      }
      
      .navbar-left {
        gap: 0.25rem;
      }
      
      .brand-name {
        font-size: 0.875rem;
      }
    }
    
    .navbar-toggle {
      background: var(--surface-elevated);
      border: 2px solid var(--border);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .navbar-toggle:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }
    
    .navbar-toggle.active {
      background: var(--primary-light);
      border-color: var(--primary);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
    }
    
    .toggle-line {
      width: 20px;
      height: 2px;
      background: var(--text);
      border-radius: 2px;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .navbar-toggle.active .toggle-line {
      background: var(--primary);
    }
    
    .navbar-toggle.active .toggle-line:nth-child(1) { 
      transform: translateY(7px) rotate(45deg); 
    }
    .navbar-toggle.active .toggle-line:nth-child(2) { 
      opacity: 0; 
      transform: scale(0.8);
    }
    .navbar-toggle.active .toggle-line:nth-child(3) { 
      transform: translateY(-7px) rotate(-45deg); 
    }
    
    /* Dark mode toggle */
    :host-context([data-theme="dark"]) .navbar-toggle,
    [data-theme="dark"] .navbar-toggle {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    :host-context([data-theme="dark"]) .navbar-toggle:hover,
    [data-theme="dark"] .navbar-toggle:hover {
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }


    /* Navigation Menu */
    .navbar-menu {
      display: none; /* hidden until .open */
      position: absolute;
      top: calc(100% + 1px);
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      border-radius: 0 0 12px 12px;
    }
    
    /* Dark mode menu - more specific selectors */
    :host-context([data-theme="dark"]) .navbar-menu,
    [data-theme="dark"] .navbar-menu {
      background: rgba(15, 23, 42, 0.95) !important;
      border-bottom-color: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important;
    }

    .navbar-menu.open {
      display: block;
    }

    @media (min-width: 768px) {
      .navbar-menu {
        display: block;
        position: static;
        background: transparent;
        box-shadow: none;
        padding: 0;
        border: none;
        backdrop-filter: none;
      }
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-direction: column; /* Mobile stack */
      align-items: stretch;
    }

    @media (min-width: 768px) {
      .navbar-actions {
        flex-direction: row;
      }
    }

    /* Icon Buttons & Dropdowns */
    .icon-btn {
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
    }
    .navbar-actions .icon-btn { width: 100%; }

    .icon-btn:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
    }
    
    .lang-code { font-weight: 600; font-size: 0.85rem; }
    .dropdown { position: relative; }
    
    .dropdown-menu {
      display: block !important;
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      padding: 0.5rem;
      min-width: 160px;
      z-index: 1001;
      animation: fadeInDown 0.2s ease-out;
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

    /* RTL positioning */
    [dir="rtl"] .dropdown-menu {
      right: auto;
      left: 0;
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
    }
    
    .dropdown-item:hover { background: var(--surface-hover); color: var(--primary); }
    .dropdown-item.active { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

    /* User Profile & Avatar */
    .user-profile {
      position: relative;
    }
    
    .profile-btn {
      border: 1px solid var(--border);
      padding: 0.375rem 0.75rem;
      gap: 0.75rem;
      white-space: nowrap;
      min-width: 0;
      max-width: 280px;
    }
    
    .profile-btn:hover {
      border-color: var(--primary);
      background: var(--surface-hover);
    }
    
    .profile-btn.active {
      border-color: var(--primary);
      background: var(--primary-light);
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
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
    }
    
    .avatar-initials {
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.5px;
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
      max-width: 140px;
    }
    
    .user-email {
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px;
    }
    
    /* User Dropdown Menu */
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
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
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
    
    .logout-text {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }
    
    /* Theme Toggle */
    .theme-toggle .theme-icon-wrapper { position: relative; width: 20px; height: 20px; }
    .theme-icon { position: absolute; inset: 0; transition: transform 0.3s opacity 0.3s; }
    
    .sun-icon { opacity: 1; transform: rotate(0); }
    .moon-icon { opacity: 0; transform: rotate(90deg); }
    .theme-toggle.dark .sun-icon { opacity: 0; transform: rotate(-90deg); }
    .theme-toggle.dark .moon-icon { opacity: 1; transform: rotate(0); }
    
    /* Nav Links */
    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        transition: all 0.2s;
        white-space: nowrap;
    }
    .nav-link:hover { background: var(--surface-hover); color: var(--text); }
    
    /* Mobile nav links and buttons */
    @media (max-width: 767px) {
      .navbar-actions .nav-link,
      .navbar-actions .btn { 
        width: 100%; 
        justify-content: flex-start;
        padding: 1rem 1.25rem;
        border-radius: 16px;
        font-weight: 600;
        gap: 1rem;
        min-height: 56px;
        background: var(--surface-elevated);
        border: 2px solid var(--border);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .navbar-actions .nav-link:hover,
      .navbar-actions .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.15);
        border-color: var(--primary);
      }
      
      .navbar-actions .btn-primary {
        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        color: white;
        border-color: transparent;
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
      }
      
      .navbar-actions .btn-primary:hover {
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        transform: translateY(-3px);
      }
      
      .navbar-actions .btn-outline {
        background: transparent;
        color: var(--text);
        border-color: var(--border);
      }
    }

    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, 
        rgba(0, 0, 0, 0.4) 0%, 
        rgba(15, 23, 42, 0.6) 100%);
      backdrop-filter: blur(8px) saturate(120%);
      -webkit-backdrop-filter: blur(8px) saturate(120%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      z-index: 999;
    }
    
    .mobile-overlay.show { 
      opacity: 1; 
      visibility: visible; 
    }
    
    /* Dark mode overlay */
    :host-context([data-theme="dark"]) .mobile-overlay,
    [data-theme="dark"] .mobile-overlay {
      background: linear-gradient(135deg, 
        rgba(0, 0, 0, 0.6) 0%, 
        rgba(15, 23, 42, 0.8) 100%);
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  @Input() mode: 'public' | 'admin' = 'public';
  @Input() fluid = false;
  @Input() sidebarOpen = false;
  @Input() showBrand = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  menuOpen = false;
  langMenuOpen = false;
  userMenuOpen = false;
  
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
    console.log('NavbarComponent initialized');
    
    // Subscribe to theme changes to ensure navbar updates
    this.themeService.currentMode$.subscribe(mode => {
      console.log('Navbar: Theme mode changed to:', mode);
      // Force change detection to update navbar styling
      setTimeout(() => this.cdr.detectChanges(), 0);
    });
  }

  ngOnInit() {
    this.onDocumentClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const dropdown = target.closest('.dropdown');
      if (!dropdown) {
        this.langMenuOpen = false;
        this.userMenuOpen = false;
      }
    };
    document.addEventListener('click', this.onDocumentClick);

    this.router.events.subscribe(() => {
      this.menuOpen = false;
      this.langMenuOpen = false;
      this.userMenuOpen = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        this.menuOpen = false;
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

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  toggleLangMenu(event: Event) {
    event.stopPropagation();
    this.langMenuOpen = !this.langMenuOpen;
    this.userMenuOpen = false; // Close user menu when opening lang menu
    this.cdr.detectChanges();
  }
  
  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
    this.langMenuOpen = false; // Close lang menu when opening user menu
    this.cdr.detectChanges();
  }

  toggleTheme() {
    this.themeService.toggleMode();
  }

  setLanguage(lang: 'en' | 'ar') {
    console.log('setLanguage called with:', lang);
    this.translationService.setLanguage(lang);
    this.langMenuOpen = false;
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.body.setAttribute('dir', dir);
  }

  logout() {
    this.authService.logout();
    this.menuOpen = false;
  }

  private onDocumentClick?: (e: Event) => void;
}

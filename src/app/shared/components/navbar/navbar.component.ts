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
            <!-- Mobile Menu Toggle (Public Only) -->
            @if (mode === 'public') {
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
            }

            <!-- Actions / Menu -->
            <div class="navbar-menu" [class.open]="menuOpen" [class.admin-menu]="mode === 'admin'" id="primary-menu">
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
                <div class="user-profile">
                   <button class="icon-btn profile-btn" (click)="logout()">
                    <div class="avatar">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                     <span class="logout-text">{{ 'common.logout' | translate }}</span>
                  </button>
                </div>
              }
            </div>
            </div>
            @if (mode === 'public') {
              <div class="mobile-overlay" [class.show]="menuOpen" (click)="closeMenu()"></div>
            }
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
      display: flex;
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
    
    @media (min-width: 768px) {
      .navbar-toggle {
        display: none;
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
        padding-inline-end: 56px;
      }
      
      .navbar-right {
        gap: 0.5rem;
        flex: 0 0 auto;
        margin-left: auto;
        position: relative !important;
        height: 72px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
      }

      /* Place public hamburger toggle at the right edge */
      .navbar-toggle {
        position: static !important;
        z-index: 1002 !important;
      }
      
      .menu-toggle {
        width: 40px;
        height: 40px;
        padding: 0.5rem;
        flex-shrink: 0;
        position: absolute !important;
        right: 0.5rem !important;
        top: 16px !important;
        z-index: 1002 !important;
      }
      
      .brand-text {
        .brand-name {
          font-size: 1rem;
        }
      }
      
      /* Mobile drawer menu from right */
      .navbar-menu {
        position: fixed !important;
        top: 72px !important;
        right: 0 !important;
        left: auto !important;
        bottom: 0 !important;
        width: 82vw !important;
        max-width: 380px;
        background: var(--surface);
        border-left: 1px solid var(--border) !important;
        box-shadow: -12px 0 32px rgba(0, 0, 0, 0.2);
        transform: translateX(100%) !important;
        opacity: 1;
        visibility: visible;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        z-index: 1001;
        padding: 1rem;
        border-radius: 12px 0 0 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        max-height: calc(100vh - 72px);
      }
      
      .navbar-menu.open {
        transform: translateX(0) !important;
        display: block !important;
      }

      /* RTL: open drawer from left */
      [dir="rtl"] .navbar-menu {
        right: auto;
        left: 0;
        border-left: none;
        border-right: 1px solid var(--border);
        transform: translateX(-100%);
        box-shadow: 12px 0 32px rgba(0, 0, 0, 0.2);
      }
      [dir="rtl"] .navbar-menu.open { transform: translateX(0); }

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
      }
      
      .navbar-actions {
        flex-direction: column;
        padding: 1rem;
        gap: 0.75rem;
      }
      
      .admin-menu .navbar-actions {
        flex-direction: row;
        padding: 0;
        gap: 0.5rem;
      }
      
      /* Mobile dropdown adjustments inside drawer */
      .dropdown-menu {
        position: static !important;
        right: auto !important;
        left: auto !important;
        width: 100% !important;
        max-width: none !important;
        z-index: 1002 !important;
        box-shadow: none;
        border: 1px solid var(--border);
      }
      
      /* Mobile icon buttons */
      .icon-btn {
        min-width: 44px;
        min-height: 44px;
        padding: 0.75rem;
        border-width: 1px;
      }
      
      /* Mobile user profile */
      .user-profile {
        .profile-btn {
          .logout-text {
            display: none;
          }
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
    
    .toggle-line {
      width: 22px;
      height: 2.5px;
      background: var(--text);
      border-radius: 2px;
      transition: all 0.3s; 
    }
    
    .navbar-toggle.active .toggle-line:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
    .navbar-toggle.active .toggle-line:nth-child(2) { opacity: 0; }
    .navbar-toggle.active .toggle-line:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }


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

    /* Profile Button */
    .profile-btn {
      border: 1px solid var(--border);
      padding: 0.375rem 0.75rem;
      gap: 0.75rem;
      white-space: nowrap;
    }
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-light);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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
    .navbar-actions .nav-link,
    .navbar-actions .btn { width: 100%; justify-content: center; }

    .mobile-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      opacity: 0;
      visibility: hidden;
      transition: all 0.25s ease;
      z-index: 999;
    }
    .mobile-overlay.show { opacity: 1; visibility: visible; }
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
      if (!dropdown && this.langMenuOpen) {
        this.langMenuOpen = false;
      }
    };
    document.addEventListener('click', this.onDocumentClick);

    this.router.events.subscribe(() => {
      this.menuOpen = false;
      this.langMenuOpen = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        this.menuOpen = false;
        this.langMenuOpen = false;
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
    console.log('toggleLangMenu called, current state:', this.langMenuOpen);
    this.langMenuOpen = !this.langMenuOpen;
    console.log('toggleLangMenu new state:', this.langMenuOpen);
    this.cdr.detectChanges();
    
    // Debug: Check if dropdown menu exists in DOM
    setTimeout(() => {
      const dropdown = document.querySelector('.dropdown-menu');
      console.log('Dropdown menu element:', dropdown);
      console.log('Dropdown display:', dropdown ? window.getComputedStyle(dropdown).display : 'not found');
    }, 50);
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

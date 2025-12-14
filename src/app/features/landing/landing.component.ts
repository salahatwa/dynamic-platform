import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, CardComponent],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-background">
          <div class="gradient-orb orb-1"></div>
          <div class="gradient-orb orb-2"></div>
          <div class="gradient-orb orb-3"></div>
        </div>
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <div class="badge">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                {{ 'landing.hero.badge' | translate }}
              </div>
              <h1 class="hero-title">
                {{ 'landing.hero.titlePrefix' | translate }} & <span class="gradient-text">{{ 'landing.hero.titleEmphasis' | translate }}</span> {{ 'landing.hero.titleSuffix' | translate }}
              </h1>
              <p class="hero-subtitle">
                {{ 'landing.hero.subtitle' | translate }}
              </p>
              <div class="hero-actions">
                <a routerLink="/register" class="btn btn-primary btn-lg">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                  {{ 'landing.hero.getStarted' | translate }}
                </a>
                <a routerLink="/pricing" class="btn btn-outline btn-lg">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  {{ 'landing.hero.viewPricing' | translate }}
                </a>
              </div>
              <div class="hero-features">
                <div class="feature-badge">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ 'landing.hero.features.noCard' | translate }}</span>
                </div>
                <div class="feature-badge">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ 'landing.hero.features.freeForever' | translate }}</span>
                </div>
                <div class="feature-badge">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ 'landing.hero.features.apiIncluded' | translate }}</span>
                </div>
              </div>
            </div>
            <div class="hero-visual">
              <div class="template-preview">
                <div class="preview-window">
                  <div class="window-header">
                    <div class="window-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div class="window-title">{{ 'landing.hero.windowTitle' | translate }}</div>
                  </div>
                  <div class="window-content">
                    <div class="editor-tabs">
                      <div class="tab active">{{ 'landing.hero.tabs.visual' | translate }}</div>
                      <div class="tab">{{ 'landing.hero.tabs.html' | translate }}</div>
                      <div class="tab">{{ 'landing.hero.tabs.css' | translate }}</div>
                    </div>
                    <div class="editor-preview">
                      <div class="preview-doc">
                        <div class="doc-header"></div>
                        <div class="doc-line"></div>
                        <div class="doc-line short"></div>
                        <div class="doc-line"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="floating-badge badge-1">
                  <span class="badge-icon">🌍</span>
                  <span>{{ 'landing.hero.badges.translations' | translate }}</span>
                </div>
                <div class="floating-badge badge-2">
                  <span class="badge-icon">⚙️</span>
                  <span>{{ 'landing.hero.badges.config' | translate }}</span>
                </div>
                <div class="floating-badge badge-3">
                  <span class="badge-icon">📋</span>
                  <span>{{ 'landing.hero.badges.lov' | translate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features">
        <div class="container">
          <div class="section-header">
            <div class="section-badge">{{ 'landing.features.badge' | translate }}</div>
            <h2 class="section-title">{{ 'landing.features.title' | translate }}</h2>
            <p class="section-subtitle">{{ 'landing.features.subtitle' | translate }}</p>
          </div>
          
          <div class="features-grid">
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">🌍</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.translation.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.translation.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.translation.tags.multiLanguage' | translate }}</span>
                <span class="tag">{{ 'landing.cards.translation.tags.rtl' | translate }}</span>
                <span class="tag">{{ 'landing.cards.translation.tags.version' | translate }}</span>
              </div>
            </app-card>
            
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">📄</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.template.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.template.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.template.tags.visual' | translate }}</span>
                <span class="tag">{{ 'landing.cards.template.tags.pdf' | translate }}</span>
                <span class="tag">{{ 'landing.cards.template.tags.dynamic' | translate }}</span>
              </div>
            </app-card>
            
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">⚙️</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.config.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.config.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.config.tags.runtime' | translate }}</span>
                <span class="tag">{{ 'landing.cards.config.tags.version' | translate }}</span>
                <span class="tag">{{ 'landing.cards.config.tags.audit' | translate }}</span>
              </div>
            </app-card>
            
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">📋</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.lov.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.lov.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.lov.tags.centralized' | translate }}</span>
                <span class="tag">{{ 'landing.cards.lov.tags.translations' | translate }}</span>
                <span class="tag">{{ 'landing.cards.lov.tags.bulk' | translate }}</span>
              </div>
            </app-card>
            
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">⚠️</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.error.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.error.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.error.tags.standard' | translate }}</span>
                <span class="tag">{{ 'landing.cards.error.tags.multiLanguage' | translate }}</span>
                <span class="tag">{{ 'landing.cards.error.tags.categorized' | translate }}</span>
              </div>
            </app-card>
            
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">👥</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.users.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.users.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.users.tags.rbac' | translate }}</span>
                <span class="tag">{{ 'landing.cards.users.tags.multiTenant' | translate }}</span>
                <span class="tag">{{ 'landing.cards.users.tags.invitations' | translate }}</span>
              </div>
            </app-card>
            
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">🔑</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.apiKeys.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.apiKeys.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.apiKeys.tags.rest' | translate }}</span>
                <span class="tag">{{ 'landing.cards.apiKeys.tags.secure' | translate }}</span>
                <span class="tag">{{ 'landing.cards.apiKeys.tags.docs' | translate }}</span>
              </div>
            </app-card>
            
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">🎨</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.ui.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.ui.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.ui.tags.responsive' | translate }}</span>
                <span class="tag">{{ 'landing.cards.ui.tags.dark' | translate }}</span>
                <span class="tag">{{ 'landing.cards.ui.tags.rtl' | translate }}</span>
              </div>
            </app-card>
            
            <app-card [hoverable]="true" class="feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">🔒</div>
              </div>
              <h3 class="feature-title">{{ 'landing.cards.security.title' | translate }}</h3>
              <p class="feature-desc">{{ 'landing.cards.security.desc' | translate }}</p>
              <div class="feature-tags">
                <span class="tag">{{ 'landing.cards.security.tags.jwt' | translate }}</span>
                <span class="tag">{{ 'landing.cards.security.tags.isolation' | translate }}</span>
                <span class="tag">{{ 'landing.cards.security.tags.audit' | translate }}</span>
              </div>
            </app-card>
          </div>
        </div>
      </section>

      <!-- Use Cases Section -->
      <section class="use-cases">
        <div class="container">
          <div class="section-header">
            <div class="section-badge">{{ 'landing.useCases.badge' | translate }}</div>
            <h2 class="section-title">{{ 'landing.useCases.title' | translate }}</h2>
          </div>
          
          <div class="use-cases-grid">
            <div class="use-case">
              <div class="use-case-icon">🚀</div>
              <h3>{{ 'landing.useCases.saas.title' | translate }}</h3>
              <p>{{ 'landing.useCases.saas.desc' | translate }}</p>
            </div>
            <div class="use-case">
              <div class="use-case-icon">🌐</div>
              <h3>{{ 'landing.useCases.global.title' | translate }}</h3>
              <p>{{ 'landing.useCases.global.desc' | translate }}</p>
            </div>
            <div class="use-case">
              <div class="use-case-icon">📱</div>
              <h3>{{ 'landing.useCases.mobile.title' | translate }}</h3>
              <p>{{ 'landing.useCases.mobile.desc' | translate }}</p>
            </div>
            <div class="use-case">
              <div class="use-case-icon">🏢</div>
              <h3>{{ 'landing.useCases.enterprise.title' | translate }}</h3>
              <p>{{ 'landing.useCases.enterprise.desc' | translate }}</p>
            </div>
            <div class="use-case">
              <div class="use-case-icon">📧</div>
              <h3>{{ 'landing.useCases.email.title' | translate }}</h3>
              <p>{{ 'landing.useCases.email.desc' | translate }}</p>
            </div>
            <div class="use-case">
              <div class="use-case-icon">⚙️</div>
              <h3>{{ 'landing.useCases.config.title' | translate }}</h3>
              <p>{{ 'landing.useCases.config.desc' | translate }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">{{ 'landing.cta.title' | translate }}</h2>
            <p class="cta-subtitle">{{ 'landing.cta.subtitle' | translate }}</p>
            <div class="cta-actions">
              <a routerLink="/register" class="btn btn-white btn-lg">
                {{ 'landing.cta.button' | translate }}
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </a>
            </div>
            <p class="cta-note">{{ 'landing.cta.note' | translate }}</p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      overflow-x: hidden;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      overflow: hidden;
      padding: 6rem 0 4rem;
    }

    .hero-background {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%);
    }

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 20s ease-in-out infinite;
    }

    .orb-1 {
      width: 500px;
      height: 500px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      top: -10%;
      left: -10%;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      bottom: -10%;
      right: -10%;
      animation-delay: 7s;
    }

    .orb-3 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
      top: 50%;
      right: 20%;
      animation-delay: 14s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 4rem;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    @media (min-width: 1024px) {
      .hero-content {
        grid-template-columns: 1.2fr 1fr;
      }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 2rem;
      color: var(--primary);
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }

    .hero-title {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1.5rem;
      color: var(--text);
    }

    .gradient-text {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.7;
      max-width: 600px;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .hero-features {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .feature-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .feature-badge svg {
      color: #10b981;
    }

    .hero-visual {
      position: relative;
      display: none;
    }

    @media (min-width: 1024px) {
      .hero-visual {
        display: block;
      }
    }

    .template-preview {
      position: relative;
      animation: fadeInUp 1s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .preview-window {
      background: var(--surface);
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .window-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--background);
      border-bottom: 1px solid var(--border);
    }

    .window-dots {
      display: flex;
      gap: 0.5rem;
    }

    .window-dots span {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--border);
    }

    .window-dots span:nth-child(1) { background: #ef4444; }
    .window-dots span:nth-child(2) { background: #f59e0b; }
    .window-dots span:nth-child(3) { background: #10b981; }

    .window-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .editor-tabs {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1rem 0;
      background: var(--background);
    }

    .tab {
      padding: 0.5rem 1rem;
      border-radius: 8px 8px 0 0;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: transparent;
    }

    .tab.active {
      background: var(--surface);
      color: var(--primary);
    }

    .editor-preview {
      padding: 2rem;
      background: var(--background);
      min-height: 300px;
    }

    .preview-doc {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .doc-header {
      height: 40px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }

    .doc-line {
      height: 12px;
      background: #e5e7eb;
      border-radius: 4px;
      margin-bottom: 0.75rem;
    }

    .doc-line.short {
      width: 60%;
    }

    .floating-badge {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      font-size: 0.875rem;
      font-weight: 600;
      animation: float 3s ease-in-out infinite;
    }

    .badge-1 {
      top: -10%;
      right: -10%;
      animation-delay: 0s;
    }

    .badge-2 {
      bottom: 20%;
      left: -15%;
      animation-delay: 1s;
    }

    .badge-3 {
      bottom: -5%;
      right: 10%;
      animation-delay: 2s;
    }

    .badge-icon {
      font-size: 1.25rem;
    }

    .features {
      padding: 6rem 0;
      background: var(--background);
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 2rem;
      color: var(--primary);
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .section-title {
      font-size: clamp(2rem, 4vw, 2.5rem);
      font-weight: 700;
      margin-bottom: 1rem;
      color: var(--text);
    }

    .section-subtitle {
      font-size: 1.125rem;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      padding: 2rem;
    }

    .feature-icon-wrapper {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }

    .feature-icon {
      font-size: 2rem;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: var(--text);
    }

    .feature-desc {
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 1rem;
    }

    .feature-desc code {
      padding: 0.25rem 0.5rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.875em;
      color: var(--primary);
      white-space: nowrap;
    }

    .feature-tags {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag {
      padding: 0.25rem 0.75rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--primary);
    }

    .use-cases {
      padding: 6rem 0;
      background: var(--surface);
    }

    .use-cases-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .use-case {
      text-align: center;
      padding: 2rem;
    }

    .use-case-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .use-case h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text);
    }

    .use-case p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .cta {
      padding: 6rem 0;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      position: relative;
      overflow: hidden;
    }

    .cta::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>');
      opacity: 0.3;
    }

    .cta-content {
      text-align: center;
      color: white;
      position: relative;
      z-index: 1;
    }

    .cta-title {
      font-size: clamp(2rem, 4vw, 2.5rem);
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .cta-subtitle {
      font-size: 1.125rem;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .cta-actions {
      margin-bottom: 1rem;
    }

    .cta-note {
      font-size: 0.875rem;
      opacity: 0.8;
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

    .btn-outline {
      background: transparent;
      border-color: var(--border);
      color: var(--text);
    }

    .btn-outline:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
      color: var(--primary);
    }

    .btn-white {
      background: white;
      color: #6366f1;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .btn-white:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
      .hero {
        padding: 4rem 0 2rem;
      }

      .container {
        padding: 0 1rem;
      }

      .hero-actions {
        flex-direction: column;
        width: 100%;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .features-grid,
      .use-cases-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingComponent {}

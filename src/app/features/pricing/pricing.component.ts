import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card/card.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface PricingFeature {
  textKey: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: string;
  period: string;
  popular?: boolean;
  features: PricingFeature[];
  cta: string;
  ctaLink: string;
  badge?: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, TranslatePipe],
  template: `
    <div class="pricing-page">
      <!-- Hero Section -->
      <section class="pricing-hero">
        <div class="container">
          <div class="hero-content">
            <div class="badge">{{ 'pricing.badge' | translate }}</div>
            <h1 class="hero-title">{{ 'pricing.title' | translate }}</h1>
            <p class="hero-subtitle">{{ 'pricing.subtitle' | translate }}</p>
          </div>
        </div>
      </section>

      <!-- Pricing Cards -->
      <section class="pricing-section">
        <div class="container">
          <div class="pricing-grid">
            <!-- Free Tier -->
            <app-card class="pricing-card">
              <div class="card-header">
                <h3 class="tier-name">{{ 'pricing.free.name' | translate }}</h3>
                <p class="tier-description">{{ 'pricing.free.description' | translate }}</p>
              </div>
              <div class="card-price">
                <span class="price">$0</span>
                <span class="period">{{ 'pricing.period' | translate }}</span>
              </div>
              <div class="card-features">
                <div class="feature" *ngFor="let feature of freeTier.features">
                  <svg *ngIf="feature.included" class="icon check" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <svg *ngIf="!feature.included" class="icon cross" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  <span [class.disabled]="!feature.included">{{ feature.textKey | translate }}</span>
                </div>
              </div>
              <a [routerLink]="freeTier.ctaLink" class="btn btn-outline btn-block">
                {{ 'pricing.free.cta' | translate }}
              </a>
            </app-card>

            <!-- Pro Tier -->
            <app-card class="pricing-card popular">
              <div class="popular-badge">{{ 'pricing.pro.badge' | translate }}</div>
              <div class="card-header">
                <h3 class="tier-name">{{ 'pricing.pro.name' | translate }}</h3>
                <p class="tier-description">{{ 'pricing.pro.description' | translate }}</p>
              </div>
              <div class="card-price">
                <span class="price">$19</span>
                <span class="period">{{ 'pricing.period' | translate }}</span>
              </div>
              <div class="card-features">
                <div class="feature" *ngFor="let feature of proTier.features">
                  <svg *ngIf="feature.included" class="icon check" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span [class.highlight]="feature.highlight">{{ feature.textKey | translate }}</span>
                </div>
              </div>
              <a [routerLink]="proTier.ctaLink" class="btn btn-primary btn-block">
                {{ 'pricing.pro.cta' | translate }}
              </a>
            </app-card>

            <!-- Team Tier -->
            <app-card class="pricing-card">
              <div class="card-header">
                <h3 class="tier-name">{{ 'pricing.team.name' | translate }}</h3>
                <p class="tier-description">{{ 'pricing.team.description' | translate }}</p>
              </div>
              <div class="card-price">
                <span class="price">$99</span>
                <span class="period">{{ 'pricing.period' | translate }}</span>
              </div>
              <div class="card-features">
                <div class="feature" *ngFor="let feature of teamTier.features">
                  <svg *ngIf="feature.included" class="icon check" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span [class.highlight]="feature.highlight">{{ feature.textKey | translate }}</span>
                </div>
              </div>
              <a [routerLink]="teamTier.ctaLink" class="btn btn-outline btn-block">
                {{ 'pricing.team.cta' | translate }}
              </a>
            </app-card>

            <!-- Enterprise Tier -->
            <app-card class="pricing-card enterprise">
              <div class="card-header">
                <h3 class="tier-name">{{ 'pricing.enterprise.name' | translate }}</h3>
                <p class="tier-description">{{ 'pricing.enterprise.description' | translate }}</p>
              </div>
              <div class="card-price">
                <span class="price">{{ 'pricing.enterprisePriceLabel' | translate }}</span>
              </div>
              <div class="card-features">
                <div class="feature" *ngFor="let feature of enterpriseTier.features">
                  <svg class="icon check" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span [class.highlight]="feature.highlight">{{ feature.textKey | translate }}</span>
                </div>
              </div>
              <a href="mailto:sales@example.com" class="btn btn-outline btn-block">
                {{ 'pricing.enterprise.cta' | translate }}
              </a>
            </app-card>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">{{ 'pricing.faq.title' | translate }}</h2>
          </div>
          <div class="faq-grid">
            <div class="faq-item" *ngFor="let faq of faqs">
              <h3 class="faq-question">{{ faq.qKey | translate }}</h3>
              <p class="faq-answer">{{ faq.aKey | translate }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2 class="cta-title">{{ 'pricing.cta.title' | translate }}</h2>
            <p class="cta-subtitle">{{ 'pricing.cta.subtitle' | translate }}</p>
            <div class="cta-actions">
              <a routerLink="/register" class="btn btn-white btn-lg">
                {{ 'pricing.cta.button' | translate }}
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .pricing-page {
      min-height: 100vh;
      background: var(--background);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Hero Section */
    .pricing-hero {
      padding: 8rem 0 4rem;
      text-align: center;
      background: linear-gradient(180deg, var(--surface) 0%, var(--background) 100%);
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .badge {
      display: inline-block;
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
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: var(--text);
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    /* Pricing Section */
    .pricing-section {
      padding: 4rem 0;
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .pricing-card {
      position: relative;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .pricing-card:hover {
      transform: translateY(-8px);
    }

    .pricing-card.popular {
      border: 2px solid var(--primary);
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.2);
    }

    .pricing-card.enterprise {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    }

    .popular-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      padding: 0.375rem 1rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-header {
      margin-bottom: 1.5rem;
    }

    .tier-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .tier-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .card-price {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--border);
    }

    .price {
      font-size: 3rem;
      font-weight: 800;
      color: var(--text);
      line-height: 1;
    }

    .period {
      font-size: 1rem;
      color: var(--text-secondary);
    }

    .card-features {
      flex: 1;
      margin-bottom: 2rem;
    }

    .feature {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .feature .icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .feature .icon.check {
      color: #10b981;
    }

    .feature .icon.cross {
      color: var(--text-tertiary);
    }

    .feature span {
      color: var(--text);
    }

    .feature span.disabled {
      color: var(--text-tertiary);
      text-decoration: line-through;
    }

    .feature span.highlight {
      font-weight: 600;
      color: var(--primary);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
      font-size: 0.875rem;
    }

    .btn-block {
      width: 100%;
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

    /* FAQ Section */
    .faq-section {
      padding: 6rem 0;
      background: var(--surface);
    }

    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-title {
      font-size: clamp(2rem, 4vw, 2.5rem);
      font-weight: 700;
      color: var(--text);
    }

    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .faq-item {
      padding: 2rem;
      background: var(--background);
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .faq-question {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.75rem;
    }

    .faq-answer {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    /* CTA Section */
    .cta-section {
      padding: 6rem 0;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      position: relative;
      overflow: hidden;
    }

    .cta-section::before {
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
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .pricing-hero {
        padding: 6rem 0 3rem;
      }

      .container {
        padding: 0 1rem;
      }

      .pricing-grid {
        grid-template-columns: 1fr;
      }

      .faq-grid {
        grid-template-columns: 1fr;
      }

      .cta-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class PricingComponent {
  freeTier: PricingTier = {
    name: 'Free',
    description: 'Perfect for testing and personal projects',
    price: '$0',
    period: '/month',
    cta: 'Get Started Free',
    ctaLink: '/register',
    features: [
      { textKey: 'pricing.features.free.application', included: true },
      { textKey: 'pricing.features.free.users', included: true },
      { textKey: 'pricing.features.free.apiRequests', included: true },
      { textKey: 'pricing.features.free.basicTranslations', included: true },
      { textKey: 'pricing.features.free.basicTemplates', included: true },
      { textKey: 'pricing.features.free.communitySupport', included: true },
      { textKey: 'pricing.features.free.limitedExport', included: false },
      { textKey: 'pricing.features.free.noSSO', included: false },
      { textKey: 'pricing.features.free.noApiKeys', included: false }
    ]
  };

  proTier: PricingTier = {
    name: 'Pro',
    description: 'For growing teams and businesses',
    price: '$19',
    period: '/month',
    popular: true,
    cta: 'Start Pro Trial',
    ctaLink: '/register',
    features: [
      { textKey: 'pricing.features.pro.upToApplications', included: true, highlight: true },
      { textKey: 'pricing.features.pro.unlimitedLanguages', included: true },
      { textKey: 'pricing.features.pro.unlimitedTemplates', included: true },
      { textKey: 'pricing.features.pro.apiKeys', included: true, highlight: true },
      { textKey: 'pricing.features.pro.errorCodes', included: true },
      { textKey: 'pricing.features.pro.appConfig', included: true },
      { textKey: 'pricing.features.pro.lov', included: true },
      { textKey: 'pricing.features.pro.priorityEmailSupport', included: true },
      { textKey: 'pricing.features.pro.exportJson', included: true },
      { textKey: 'pricing.features.pro.apiRequests50k', included: true }
    ]
  };

  teamTier: PricingTier = {
    name: 'Team',
    description: 'Advanced features for larger teams',
    price: '$99',
    period: '/month',
    cta: 'Start Team Trial',
    ctaLink: '/register',
    features: [
      { textKey: 'pricing.features.team.everythingInPro', included: true },
      { textKey: 'pricing.features.team.users10to50', included: true, highlight: true },
      { textKey: 'pricing.features.team.rolesPermissions', included: true, highlight: true },
      { textKey: 'pricing.features.team.activityLogging', included: true },
      { textKey: 'pricing.features.team.customDomains', included: true },
      { textKey: 'pricing.features.team.multiEnvironment', included: true, highlight: true },
      { textKey: 'pricing.features.team.advancedAnalytics', included: true },
      { textKey: 'pricing.features.team.webhooks', included: true },
      { textKey: 'pricing.features.team.prioritySupport', included: true },
      { textKey: 'pricing.features.team.apiRequests500k', included: true }
    ]
  };

  enterpriseTier: PricingTier = {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: 'Custom',
    period: '',
    cta: 'Contact Sales',
    ctaLink: '/contact',
    features: [
      { textKey: 'pricing.features.enterprise.unlimitedEverything', included: true, highlight: true },
      { textKey: 'pricing.features.enterprise.ssoSaml', included: true, highlight: true },
      { textKey: 'pricing.features.enterprise.dedicatedManager', included: true },
      { textKey: 'pricing.features.enterprise.onPremise', included: true, highlight: true },
      { textKey: 'pricing.features.enterprise.enhancedSecurity', included: true },
      { textKey: 'pricing.features.enterprise.sla99', included: true, highlight: true },
      { textKey: 'pricing.features.enterprise.customIntegrations', included: true },
      { textKey: 'pricing.features.enterprise.trainingOnboarding', included: true },
      { textKey: 'pricing.features.enterprise.phoneSupport247', included: true },
      { textKey: 'pricing.features.enterprise.unlimitedApiRequests', included: true }
    ]
  };

  faqs = [
    { qKey: 'pricing.faq.q1', aKey: 'pricing.faq.a1' },
    { qKey: 'pricing.faq.q2', aKey: 'pricing.faq.a2' },
    { qKey: 'pricing.faq.q3', aKey: 'pricing.faq.a3' },
    { qKey: 'pricing.faq.q4', aKey: 'pricing.faq.a4' },
    { qKey: 'pricing.faq.q5', aKey: 'pricing.faq.a5' },
    { qKey: 'pricing.faq.q6', aKey: 'pricing.faq.a6' }
  ];
}

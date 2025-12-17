import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CorporateService } from '../../../core/services/corporate.service';
import { ToastService } from '../../../core/services/toast.service';
import { Corporate, CorporateUpdateRequest } from '../../../core/models/corporate.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="organization-management">
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">{{ 'organization.title' | translate }}</h1>
            <p class="page-description">{{ 'organization.description' | translate }}</p>
          </div>
          <div class="header-actions">
            <button 
              type="button" 
              class="btn btn-outline"
              (click)="resetForm()"
              [disabled]="loading()">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span>{{ 'common.reset' | translate }}</span>
            </button>
            <button 
              type="submit" 
              form="organizationForm"
              class="btn btn-primary"
              [disabled]="organizationForm.invalid || loading()">
              @if (loading()) {
                <div class="spinner"></div>
              } @else {
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              }
              <span>{{ 'common.save' | translate }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="content-container">
        @if (loadingData()) {
          <div class="loading-state">
            <div class="spinner-large"></div>
            <p>{{ 'common.loading' | translate }}</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <div class="error-icon">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3>{{ 'common.error' | translate }}</h3>
            <p>{{ error() }}</p>
            <button class="btn btn-primary" (click)="loadCorporateData()">
              {{ 'common.retry' | translate }}
            </button>
          </div>
        } @else {
          <div class="organization-card">
            <div class="card-header">
              <div class="card-title">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 3h10M12 7v8m-4-4h8"/>
                </svg>
                <span>{{ 'organization.details' | translate }}</span>
              </div>
              <div class="card-subtitle">
                {{ 'organization.manageInfo' | translate }}
              </div>
            </div>

            <form id="organizationForm" [formGroup]="organizationForm" (ngSubmit)="onSubmit()" class="organization-form">
              <!-- Organization Name -->
              <div class="form-group">
                <label for="name" class="form-label">
                  {{ 'organization.name' | translate }}
                  <span class="required">*</span>
                </label>
                <div class="input-group">
                  <input
                    id="name"
                    type="text"
                    class="form-control"
                    formControlName="name"
                    [class.error]="organizationForm.get('name')?.invalid && organizationForm.get('name')?.touched"
                    [class.success]="nameAvailable() && organizationForm.get('name')?.valid"
                    placeholder="{{ 'organization.namePlaceholder' | translate }}"
                  />
                  @if (checkingName()) {
                    <div class="input-icon">
                      <div class="spinner-small"></div>
                    </div>
                  } @else if (nameAvailable() && organizationForm.get('name')?.valid) {
                    <div class="input-icon success">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  } @else if (!nameAvailable() && organizationForm.get('name')?.value) {
                    <div class="input-icon error">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </div>
                  }
                </div>
                @if (organizationForm.get('name')?.invalid && organizationForm.get('name')?.touched) {
                  <div class="form-error">
                    @if (organizationForm.get('name')?.errors?.['required']) {
                      {{ 'validation.required' | translate }}
                    }
                    @if (organizationForm.get('name')?.errors?.['minlength']) {
                      {{ 'validation.nameMinLength' | translate }}
                    }
                    @if (organizationForm.get('name')?.errors?.['maxlength']) {
                      {{ 'validation.nameMaxLength' | translate }}
                    }
                  </div>
                } @else if (!nameAvailable() && organizationForm.get('name')?.value) {
                  <div class="form-error">
                    {{ 'organization.nameNotAvailable' | translate }}
                  </div>
                }
              </div>

              <!-- Organization Domain -->
              <div class="form-group">
                <label for="domain" class="form-label">
                  {{ 'organization.domain' | translate }}
                  <span class="required">*</span>
                </label>
                <div class="input-group">
                  <input
                    id="domain"
                    type="text"
                    class="form-control"
                    formControlName="domain"
                    [class.error]="organizationForm.get('domain')?.invalid && organizationForm.get('domain')?.touched"
                    [class.success]="domainAvailable() && organizationForm.get('domain')?.valid"
                    placeholder="{{ 'organization.domainPlaceholder' | translate }}"
                  />
                  @if (checkingDomain()) {
                    <div class="input-icon">
                      <div class="spinner-small"></div>
                    </div>
                  } @else if (domainAvailable() && organizationForm.get('domain')?.valid) {
                    <div class="input-icon success">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  } @else if (!domainAvailable() && organizationForm.get('domain')?.value) {
                    <div class="input-icon error">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </div>
                  }
                </div>
                @if (organizationForm.get('domain')?.invalid && organizationForm.get('domain')?.touched) {
                  <div class="form-error">
                    @if (organizationForm.get('domain')?.errors?.['required']) {
                      {{ 'validation.required' | translate }}
                    }
                    @if (organizationForm.get('domain')?.errors?.['minlength']) {
                      {{ 'validation.domainMinLength' | translate }}
                    }
                    @if (organizationForm.get('domain')?.errors?.['maxlength']) {
                      {{ 'validation.domainMaxLength' | translate }}
                    }
                    @if (organizationForm.get('domain')?.errors?.['pattern']) {
                      {{ 'organization.domainInvalid' | translate }}
                    }
                  </div>
                } @else if (!domainAvailable() && organizationForm.get('domain')?.value) {
                  <div class="form-error">
                    {{ 'organization.domainNotAvailable' | translate }}
                  </div>
                }
                <div class="form-help">
                  {{ 'organization.domainHelp' | translate }}
                </div>
              </div>

              <!-- Organization Description -->
              <div class="form-group">
                <label for="description" class="form-label">
                  {{ 'organization.description' | translate }}
                </label>
                <textarea
                  id="description"
                  class="form-control"
                  formControlName="description"
                  rows="4"
                  [class.error]="organizationForm.get('description')?.invalid && organizationForm.get('description')?.touched"
                  placeholder="{{ 'organization.descriptionPlaceholder' | translate }}"
                ></textarea>
                @if (organizationForm.get('description')?.invalid && organizationForm.get('description')?.touched) {
                  <div class="form-error">
                    @if (organizationForm.get('description')?.errors?.['maxlength']) {
                      {{ 'validation.descriptionMaxLength' | translate }}
                    }
                  </div>
                }
                <div class="form-help">
                  {{ 'organization.descriptionHelp' | translate }}
                </div>
              </div>

              <!-- Organization Info Display -->
              @if (currentCorporate()) {
                <div class="info-section">
                  <h3 class="info-title">{{ 'organization.additionalInfo' | translate }}</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">{{ 'common.createdAt' | translate }}</span>
                      <span class="info-value">{{ currentCorporate()?.createdAt | date:'medium' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ 'common.updatedAt' | translate }}</span>
                      <span class="info-value">{{ currentCorporate()?.updatedAt | date:'medium' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">{{ 'organization.id' | translate }}</span>
                      <span class="info-value">#{{ currentCorporate()?.id }}</span>
                    </div>
                  </div>
                </div>
              }
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .organization-management {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
    }

    .header-info {
      flex: 1;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text);
      margin: 0 0 0.5rem 0;
      line-height: 1.2;
    }

    .page-description {
      font-size: 1.125rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      flex-shrink: 0;
    }

    .content-container {
      background: var(--surface);
      border-radius: 16px;
      border: 1px solid var(--border);
      overflow: hidden;
    }

    .organization-card {
      padding: 0;
    }

    .card-header {
      padding: 2rem 2rem 1rem 2rem;
      border-bottom: 1px solid var(--border);
      background: var(--surface-hover);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .card-subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .organization-form {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 2rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .required {
      color: var(--error);
      margin-left: 0.25rem;
    }

    .input-group {
      position: relative;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-size: 1rem;
      background: var(--background);
      color: var(--text);
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .form-control.error {
      border-color: var(--error);
    }

    .form-control.success {
      border-color: var(--success);
    }

    .input-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .input-icon.success {
      color: var(--success);
    }

    .input-icon.error {
      color: var(--error);
    }

    .form-error {
      color: var(--error);
      font-size: 0.875rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .form-help {
      color: var(--text-secondary);
      font-size: 0.8125rem;
      margin-top: 0.5rem;
    }

    .info-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border);
    }

    .info-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .info-value {
      font-size: 0.875rem;
      color: var(--text);
      font-weight: 600;
    }

    /* Loading and Error States */
    .loading-state,
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .error-icon {
      width: 64px;
      height: 64px;
      color: var(--error);
      margin-bottom: 1rem;
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Button Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
      border: 2px solid transparent;
      font-size: 0.875rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: var(--text);
      border-color: var(--border);
    }

    .btn-outline:hover:not(:disabled) {
      background: var(--surface-hover);
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .organization-management {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .header-actions {
        justify-content: stretch;
      }

      .header-actions .btn {
        flex: 1;
        justify-content: center;
      }

      .card-header,
      .organization-form {
        padding: 1.5rem;
      }

      .page-title {
        font-size: 1.5rem;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    /* RTL Support */
    [dir="rtl"] .input-icon {
      right: auto;
      left: 1rem;
    }

    [dir="rtl"] .required {
      margin-left: 0;
      margin-right: 0.25rem;
    }
  `]
})
export class OrganizationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private corporateService = inject(CorporateService);
  private toastService = inject(ToastService);

  // Signals
  loading = signal(false);
  loadingData = signal(true);
  error = signal<string | null>(null);
  currentCorporate = signal<Corporate | null>(null);
  nameAvailable = signal(true);
  domainAvailable = signal(true);
  checkingName = signal(false);
  checkingDomain = signal(false);

  // Form
  organizationForm: FormGroup;

  constructor() {
    this.organizationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      domain: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*$/)]],
      description: ['', [Validators.maxLength(500)]]
    });

    // Setup name availability checking
    this.organizationForm.get('name')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(name => {
        if (!name || name.length < 2) {
          this.nameAvailable.set(true);
          return of(null);
        }
        this.checkingName.set(true);
        return this.corporateService.checkNameAvailability(name);
      })
    ).subscribe({
      next: (response) => {
        this.checkingName.set(false);
        if (response) {
          this.nameAvailable.set(response.available);
        }
      },
      error: () => {
        this.checkingName.set(false);
        this.nameAvailable.set(false);
      }
    });

    // Setup domain availability checking
    this.organizationForm.get('domain')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(domain => {
        if (!domain || domain.length < 2) {
          this.domainAvailable.set(true);
          return of(null);
        }
        this.checkingDomain.set(true);
        return this.corporateService.checkDomainAvailability(domain);
      })
    ).subscribe({
      next: (response) => {
        this.checkingDomain.set(false);
        if (response) {
          this.domainAvailable.set(response.available);
        }
      },
      error: () => {
        this.checkingDomain.set(false);
        this.domainAvailable.set(false);
      }
    });
  }

  ngOnInit() {
    this.loadCorporateData();
  }

  loadCorporateData() {
    this.loadingData.set(true);
    this.error.set(null);

    this.corporateService.getCurrentCorporate().subscribe({
      next: (corporate) => {
        this.currentCorporate.set(corporate);
        this.organizationForm.patchValue({
          name: corporate.name,
          domain: corporate.domain,
          description: corporate.description || ''
        });
        this.loadingData.set(false);
      },
      error: (error) => {
        console.error('Error loading corporate data:', error);
        this.error.set('Failed to load organization data');
        this.loadingData.set(false);
      }
    });
  }

  onSubmit() {
    if (this.organizationForm.valid && this.nameAvailable() && this.domainAvailable()) {
      this.loading.set(true);

      const updateRequest: CorporateUpdateRequest = {
        name: this.organizationForm.value.name,
        domain: this.organizationForm.value.domain,
        description: this.organizationForm.value.description || ''
      };

      this.corporateService.updateCorporate(updateRequest).subscribe({
        next: (updatedCorporate) => {
          this.currentCorporate.set(updatedCorporate);
          this.toastService.success('Organization updated successfully');
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error updating corporate:', error);
          this.toastService.error('Failed to update organization');
          this.loading.set(false);
        }
      });
    }
  }

  resetForm() {
    const corporate = this.currentCorporate();
    if (corporate) {
      this.organizationForm.patchValue({
        name: corporate.name,
        domain: corporate.domain,
        description: corporate.description || ''
      });
    }
  }
}
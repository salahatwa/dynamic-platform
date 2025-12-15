import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, ButtonComponent],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card fade-in">
          <div class="auth-header">
            <h1 class="auth-title">{{ 'auth.loginTitle' | translate }}</h1>
            <p class="auth-subtitle">Enter your credentials to continue</p>
          </div>
          
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label">{{ 'auth.email' | translate }}</label>
              <input 
                type="email" 
                class="form-control" 
                formControlName="email"
                [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" />
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <span class="form-error">Valid email is required</span>
              }
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ 'auth.password' | translate }}</label>
              <input 
                type="password" 
                class="form-control" 
                formControlName="password"
                [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" />
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <span class="form-error">Password is required</span>
              }
            </div>
            
            @if (errorMessage) {
              <div class="alert alert-danger">{{ errorMessage }}</div>
            }
            
            <app-button 
              type="submit" 
              variant="primary" 
              [fullWidth]="true"
              [loading]="loading"
              [disabled]="loginForm.invalid">
              {{ 'common.login' | translate }}
            </app-button>
          </form>
          
          <div class="auth-divider">
            <span>or</span>
          </div>
          
          <button class="btn-google">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
              <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
              <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
              <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
            </svg>
            {{ 'auth.loginWithGoogle' | translate }}
          </button>
          
          <div class="auth-footer">
            <p>
              {{ 'auth.dontHaveAccount' | translate }}
              <a routerLink="/register" class="auth-link">{{ 'common.register' | translate }}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 73px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    }

    .auth-container {
      width: 100%;
      max-width: 440px;
    }

    .auth-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
      box-shadow: var(--shadow-lg);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .auth-subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-control.error {
      border-color: var(--danger);
    }

    .form-error {
      color: var(--danger);
      font-size: 0.813rem;
    }

    .auth-divider {
      position: relative;
      text-align: center;
      margin: 1.5rem 0;
    }

    .auth-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--border);
    }

    .auth-divider span {
      position: relative;
      background: var(--surface);
      padding: 0 1rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .btn-google {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--background);
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
    }

    .btn-google:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .auth-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
      transition: var(--transition);
    }

    .auth-link:hover {
      color: var(--primary-hover);
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  loading = false;
  errorMessage = '';
  invitationToken: string | null = null;
  
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  ngOnInit() {
    // Check if there's an invitation token in query params
    this.route.queryParams.subscribe(params => {
      this.invitationToken = params['invitation'] || null;
      
      // Pre-fill email if provided
      if (params['email']) {
        this.loginForm.patchValue({
          email: params['email']
        });
      }
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value as any).subscribe({
        next: () => {
          // If there's an invitation token, redirect to accept invitation
          if (this.invitationToken) {
            this.router.navigate(['/accept-invitation', this.invitationToken]);
          } else {
            this.router.navigate(['/admin']);
          }
        },
        error: (error) => {
          this.errorMessage = 'Invalid credentials';
          this.loading = false;
        }
      });
    }
  }
}

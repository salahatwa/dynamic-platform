import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { environment } from '../../../../environments/environment';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe, ButtonComponent],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="auth-card fade-in">
          <div class="auth-header">
            <h1 class="auth-title">{{ 'auth.registerTitle' | translate }}</h1>
            @if (invitationInfo) {
              <div class="invitation-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <div>
                  <strong>You're invited to join {{ invitationInfo.corporateName }}</strong>
                  <p>Complete registration to accept your invitation</p>
                </div>
              </div>
            } @else {
              <p class="auth-subtitle">Create your account to get started</p>
            }
          </div>
          
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ 'auth.firstName' | translate }}</label>
                <input type="text" class="form-control" formControlName="firstName" />
              </div>
              
              <div class="form-group">
                <label class="form-label">{{ 'auth.lastName' | translate }}</label>
                <input type="text" class="form-control" formControlName="lastName" />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ 'auth.email' | translate }}</label>
              <input type="email" class="form-control" formControlName="email" />
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ 'auth.password' | translate }}</label>
              <input type="password" class="form-control" formControlName="password" />
              <small class="form-hint">{{ 'auth.minPassword' | translate }}</small>
            </div>
            
            @if (errorMessage) {
              <div class="alert alert-danger">{{ errorMessage }}</div>
            }
            @if (successMessage) {
              <div class="alert alert-success">{{ successMessage }}</div>
            }
            
            <app-button 
              type="submit" 
              variant="primary" 
              [fullWidth]="true"
              [loading]="loading"
              [disabled]="registerForm.invalid">
              {{ 'common.register' | translate }}
            </app-button>
          </form>
          
          <div class="auth-footer">
            <p>
              {{ 'auth.alreadyHaveAccount' | translate }}
              <a routerLink="/login" class="auth-link">{{ 'common.login' | translate }}</a>
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
      max-width: 500px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-hint {
      color: var(--text-secondary);
      font-size: 0.813rem;
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

    .invitation-banner {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .invitation-banner svg {
      color: var(--primary);
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .invitation-banner strong {
      display: block;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .invitation-banner p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private invitationService = inject(InvitationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  loading = false;
  errorMessage = '';
  successMessage = '';
  invitationToken: string | null = null;
  invitationInfo: any = null;
  
  registerForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['invitation'];
      if (token) {
        this.invitationToken = token;
        this.loading = true;
        this.errorMessage = '';
        
        this.invitationService.validateInvitation(token).subscribe({
          next: (response) => {
            if (response.valid) {
              this.invitationInfo = response;
              this.registerForm.patchValue({ email: response.email });
              this.registerForm.get('email')?.disable();
            } else {
              this.errorMessage = response.errorMessage || 'Invalid invitation';
            }
            this.loading = false;
          },
          error: (err) => {
            this.errorMessage = 'Failed to validate invitation';
            this.loading = false;
            console.error('Error validating invitation:', err);
          }
        });
      }
    });
  }
  
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      const formData = this.registerForm.getRawValue();
      
      const registerData: RegisterRequest = {
        email: formData.email!,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        password: formData.password!
      };
      
      this.authService.register(registerData).subscribe({
        next: (response) => {
          // If there's an invitation token, accept it after registration
          if (this.invitationToken) {
            this.authService.login({ 
              email: registerData.email, 
              password: registerData.password 
            }).subscribe({
              next: () => {
                this.invitationService.acceptInvitation(this.invitationToken!).subscribe({
                  next: () => {
                    this.successMessage = 'Registration successful! Invitation accepted. Redirecting...';
                    setTimeout(() => this.router.navigate(['/admin/dashboard']), 2000);
                  },
                  error: (err) => {
                    console.error('Error accepting invitation:', err);
                    this.successMessage = 'Registration successful! Redirecting to login...';
                    setTimeout(() => this.router.navigate(['/login']), 2000);
                  }
                });
              },
              error: (err) => {
                console.error('Auto-login error:', err);
                this.successMessage = 'Registration successful! Redirecting to login...';
                setTimeout(() => this.router.navigate(['/login']), 2000);
              }
            });
          } else {
            this.successMessage = 'Registration successful! Redirecting to login...';
            setTimeout(() => this.router.navigate(['/login']), 2000);
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = error.error?.message || error.error || error.message || 'Registration failed';
          this.loading = false;
        }
      });
    }
  }
}

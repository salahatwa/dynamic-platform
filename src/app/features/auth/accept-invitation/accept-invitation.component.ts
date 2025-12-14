import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '../../../core/services/invitation.service';
import { AuthService } from '../../../core/services/auth.service';
import { InvitationValidationResponse } from '../../../core/models/invitation.model';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="accept-invitation-container">
      <div class="accept-invitation-card">
        <!-- Loading State -->
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <h2>Validating invitation...</h2>
            <p>Please wait while we verify your invitation</p>
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="error-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2>Invalid Invitation</h2>
            <p>{{ error() }}</p>
            <button class="btn-primary" (click)="goToLogin()">Go to Login</button>
          </div>
        }

        <!-- Valid Invitation - User Not Logged In -->
        @if (validInvitation() && !isLoggedIn()) {
          <div class="invitation-info">
            <div class="icon-success">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h2>You're Invited!</h2>
            <p class="invitation-message">
              <strong>{{ validInvitation()?.inviterName }}</strong> has invited you to join 
              <strong>{{ validInvitation()?.corporateName }}</strong>
            </p>

            <div class="roles-info">
              <h3>Your Roles:</h3>
              <div class="roles-list">
                @for (role of validInvitation()?.roles; track role) {
                  <span class="role-badge">{{ role }}</span>
                }
              </div>
            </div>

            <div class="expiry-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Expires on {{ formatDate(validInvitation()?.expiresAt || '') }}
            </div>

            @if (validInvitation()?.userExists) {
              <div class="action-section">
                <p class="info-text">You already have an account. Please log in to accept this invitation.</p>
                <button class="btn-primary" (click)="goToLogin()">
                  Log In to Accept
                </button>
              </div>
            } @else {
              <div class="action-section">
                <p class="info-text">You need to create an account to accept this invitation.</p>
                <button class="btn-primary" (click)="goToRegister()">
                  Create Account
                </button>
                <p class="secondary-text">Already have an account? <a (click)="goToLogin()">Log in</a></p>
              </div>
            }
          </div>
        }

        <!-- Valid Invitation - User Logged In -->
        @if (validInvitation() && isLoggedIn() && !accepting()) {
          <div class="invitation-info">
            <div class="icon-success">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h2>Accept Invitation</h2>
            <p class="invitation-message">
              You've been invited to join <strong>{{ validInvitation()?.corporateName }}</strong>
            </p>

            <div class="roles-info">
              <h3>You will be assigned these roles:</h3>
              <div class="roles-list">
                @for (role of validInvitation()?.roles; track role) {
                  <span class="role-badge">{{ role }}</span>
                }
              </div>
            </div>

            @if (acceptError()) {
              <div class="error-message">
                {{ acceptError() }}
              </div>
            }

            <div class="action-section">
              <button class="btn-primary" (click)="acceptInvitation()">
                Accept Invitation
              </button>
              <button class="btn-secondary" (click)="goToDashboard()">
                Cancel
              </button>
            </div>
          </div>
        }

        <!-- Accepting State -->
        @if (accepting()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <h2>Accepting invitation...</h2>
            <p>Please wait while we set up your account</p>
          </div>
        }

        <!-- Success State -->
        @if (accepted()) {
          <div class="success-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h2>Welcome to {{ acceptedCorporateName() }}!</h2>
            <p>Your invitation has been accepted successfully.</p>
            <p class="redirect-text">Redirecting to dashboard...</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .accept-invitation-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .accept-invitation-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 100%;
      padding: 3rem;
    }

    .loading-state, .error-state, .success-state {
      text-align: center;
    }

    .loading-state svg, .error-state svg, .success-state svg {
      margin-bottom: 1.5rem;
    }

    .error-state svg {
      color: #dc2626;
    }

    .success-state svg {
      color: #16a34a;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    h2 {
      margin: 0 0 0.75rem 0;
      font-size: 1.75rem;
      color: #1a1a1a;
    }

    p {
      margin: 0 0 1rem 0;
      color: #666;
      line-height: 1.6;
    }

    .invitation-info {
      text-align: center;
    }

    .icon-success {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }

    .icon-success svg {
      color: white;
    }

    .invitation-message {
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .roles-info {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .roles-info h3 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #374151;
    }

    .roles-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }

    .role-badge {
      background: #6366f1;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .expiry-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }

    .action-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-text {
      color: #374151;
      font-size: 0.95rem;
    }

    .secondary-text {
      color: #666;
      font-size: 0.9rem;
    }

    .secondary-text a {
      color: #6366f1;
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }

    .secondary-text a:hover {
      text-decoration: underline;
    }

    .btn-primary, .btn-secondary {
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .error-message {
      background: #fee2e2;
      color: #991b1b;
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .redirect-text {
      color: #6366f1;
      font-weight: 500;
      margin-top: 1rem;
    }
  `]
})
export class AcceptInvitationComponent implements OnInit {
  token = signal<string>('');
  loading = signal(true);
  accepting = signal(false);
  accepted = signal(false);
  error = signal<string | null>(null);
  acceptError = signal<string | null>(null);
  validInvitation = signal<InvitationValidationResponse | null>(null);
  acceptedCorporateName = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: InvitationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.token.set(this.route.snapshot.paramMap.get('token') || '');
    
    if (!this.token()) {
      this.error.set('Invalid invitation link');
      this.loading.set(false);
      return;
    }

    this.validateInvitation();
  }

  validateInvitation() {
    this.loading.set(true);
    this.error.set(null);

    this.invitationService.validateInvitation(this.token()).subscribe({
      next: (response) => {
        if (response.valid) {
          this.validInvitation.set(response);
          this.loading.set(false);
        } else {
          this.error.set(response.errorMessage || 'Invalid invitation');
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.error.set('Failed to validate invitation. Please try again.');
        this.loading.set(false);
        console.error('Error validating invitation:', err);
      }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  acceptInvitation() {
    this.accepting.set(true);
    this.acceptError.set(null);

    this.invitationService.acceptInvitation(this.token()).subscribe({
      next: (response) => {
        this.acceptedCorporateName.set(response.corporateName);
        this.accepted.set(true);
        this.accepting.set(false);
        
        // Refresh user data to get updated corporate and roles
        this.authService.refreshUserData();
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.acceptError.set(err.error?.error || 'Failed to accept invitation');
        this.accepting.set(false);
        console.error('Error accepting invitation:', err);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login'], {
      queryParams: { invitation: this.token() }
    });
  }

  goToRegister() {
    this.router.navigate(['/register'], {
      queryParams: { invitation: this.token() }
    });
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  }
}

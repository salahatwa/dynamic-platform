import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { AppContextService } from './app-context.service';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  invitationToken?: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private appContextService = inject(AppContextService);
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor() {
    const token = this.getToken();
    if (token) {
      this.currentUserSubject.next({ token });
      
      // Initialize app context when token is available on page refresh
      setTimeout(() => {
        console.log('Initializing apps for authenticated user on page refresh');
        this.appContextService.initialize();
      }, 100);
    }
  }
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('User logged in successfully');
        localStorage.setItem('token', response.token);
        this.currentUserSubject.next({ token: response.token });
        
        // Reset and reload app context for the new user
        this.appContextService.reset();
        
        // Small delay to ensure token is set before loading apps
        setTimeout(() => {
          console.log('Initializing apps for newly logged in user');
          this.appContextService.initialize();
        }, 100);
      })
    );
  }
  
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }
  
  logout(): void {
    console.log('Logging out user...');
    
    // Log current storage state for debugging
    const storageSummary = this.storageService.getStorageSummary();
    console.log('Storage before logout:', storageSummary);
    
    // Reset app context to clear any cached app data
    this.appContextService.reset();
    
    // Clear user-specific data while preserving UI preferences
    this.storageService.clearUserData();
    
    // Update authentication state
    this.currentUserSubject.next(null);
    
    // Log storage state after clearing
    const storageAfter = this.storageService.getStorageSummary();
    console.log('Storage after logout:', storageAfter);
    
    // Navigate to landing page
    this.router.navigate(['/']);
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  refreshUserData(): void {
    // Refresh user data after accepting invitation
    // This could fetch updated user info from the backend if needed
    const token = this.getToken();
    if (token) {
      this.currentUserSubject.next({ token });
    }
  }
}

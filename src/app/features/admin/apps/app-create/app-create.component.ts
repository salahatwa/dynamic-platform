import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AppContextService } from '../../../../core/services/app-context.service';
import { AppService } from '../../../../core/services/app.service';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { AppRequest } from '../../../../core/models/app.model';

@Component({
  selector: 'app-app-create',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './app-create.component.html',
  styleUrls: ['./app-create.component.scss']
})
export class AppCreateComponent {
  private appContext = inject(AppContextService);
  private appService = inject(AppService);
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  // Form state
  formData = signal<AppRequest>({
    name: '',
    description: '',
    iconUrl: ''
  });

  loading = signal(false);
  error = signal<string | null>(null);
  limits = signal<any>(null);

  ngOnInit() {
    this.loadLimits();
  }

  loadLimits() {
    this.subscriptionService.getLimits().subscribe({
      next: (limits: any) => {
        this.limits.set(limits);
        
        // Check if user can create more apps
        if (!limits.canCreateApp) {
          this.error.set('You have reached your app limit. Please upgrade your plan.');
        }
      },
      error: (error: any) => {
        console.error('Error loading limits:', error);
        this.error.set('Failed to load subscription limits');
      }
    });
  }

  updateField(field: keyof AppRequest, value: string) {
    this.formData.update(data => ({
      ...data,
      [field]: value
    }));
  }

  canSubmit(): boolean {
    const data = this.formData();
    return data.name.trim().length > 0 && !this.loading();
  }

  onSubmit() {
    if (!this.canSubmit()) return;

    const limits = this.limits();
    if (limits && !limits.canCreateApp) {
      this.error.set('You have reached your app limit. Please upgrade your plan.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request: AppRequest = {
      name: this.formData().name.trim(),
      description: this.formData().description?.trim() || undefined,
      iconUrl: this.formData().iconUrl?.trim() || undefined
    };

    this.appService.createApp(request).subscribe({
      next: (app) => {
        this.appContext.addApp(app);
        this.router.navigate(['/admin/apps']);
      },
      error: (error) => {
        console.error('Error creating app:', error);
        this.error.set(error.error?.message || 'Failed to create application');
        this.loading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/apps']);
  }
}

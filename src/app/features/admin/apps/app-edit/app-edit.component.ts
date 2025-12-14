import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AppContextService } from '../../../../core/services/app-context.service';
import { AppService } from '../../../../core/services/app.service';
import { App, AppRequest } from '../../../../core/models/app.model';

@Component({
  selector: 'app-app-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './app-edit.component.html',
  styleUrls: ['./app-edit.component.scss']
})
export class AppEditComponent implements OnInit {
  private appContext = inject(AppContextService);
  private appService = inject(AppService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State
  app = signal<App | null>(null);
  formData = signal<AppRequest>({
    name: '',
    description: '',
    iconUrl: ''
  });

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const appId = this.route.snapshot.paramMap.get('id');
    if (appId) {
      this.loadApp(parseInt(appId));
    } else {
      this.error.set('Invalid app ID');
      this.loading.set(false);
    }
  }

  loadApp(id: number) {
    this.loading.set(true);
    this.error.set(null);

    this.appService.getAppById(id).subscribe({
      next: (app) => {
        this.app.set(app);
        this.formData.set({
          name: app.name,
          description: app.description || '',
          iconUrl: app.iconUrl || ''
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading app:', error);
        this.error.set('Failed to load application');
        this.loading.set(false);
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
    return data.name.trim().length > 0 && !this.saving();
  }

  onSubmit() {
    if (!this.canSubmit() || !this.app()) return;

    this.saving.set(true);
    this.error.set(null);

    const request: AppRequest = {
      name: this.formData().name.trim(),
      description: this.formData().description?.trim() || undefined,
      iconUrl: this.formData().iconUrl?.trim() || undefined
    };

    this.appService.updateApp(this.app()!.id, request).subscribe({
      next: (updatedApp) => {
        this.appContext.updateApp(updatedApp);
        this.router.navigate(['/admin/apps']);
      },
      error: (error) => {
        console.error('Error updating app:', error);
        this.error.set(error.error?.message || 'Failed to update application');
        this.saving.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/apps']);
  }
}

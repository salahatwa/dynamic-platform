import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AppContextService } from '../../../core/services/app-context.service';
import { AppService } from '../../../core/services/app.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { App, AppStatus } from '../../../core/models/app.model';

@Component({
  selector: 'app-apps',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslatePipe],
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent implements OnInit {
  private appContext = inject(AppContextService);
  private appService = inject(AppService);
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  // Signals
  apps = this.appContext.apps;
  selectedApp = this.appContext.selectedApp;
  loading = this.appContext.loading;
  searchQuery = signal('');
  viewMode = signal<'grid' | 'list'>('grid');
  showArchived = signal(false);
  
  // Subscription limits
  limits = signal<any>(null);
  canCreateMore = computed(() => {
    const lim = this.limits();
    if (!lim) return false;
    // Use the backend-calculated canCreateApp field
    return lim.canCreateApp;
  });

  // Filtered apps
  filteredApps = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const archived = this.showArchived();
    let filtered = this.apps();

    // Filter by status
    if (!archived) {
      filtered = filtered.filter(app => app.status === AppStatus.ACTIVE);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(query) ||
        app.description?.toLowerCase().includes(query) ||
        app.appKey.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  ngOnInit() {
    this.loadLimits();
  }

  loadLimits() {
    this.subscriptionService.getLimits().subscribe({
      next: (limits: any) => this.limits.set(limits),
      error: (error: any) => console.error('Error loading limits:', error)
    });
  }

  selectApp(app: App) {
    this.appContext.selectApp(app);
  }

  createApp() {
    if (!this.canCreateMore()) {
      alert('You have reached your app limit. Please upgrade your plan.');
      return;
    }
    this.router.navigate(['/admin/apps/create']);
  }

  editApp(app: App, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/admin/apps/edit', app.id]);
  }

  archiveApp(app: App, event: Event) {
    event.stopPropagation();
    
    if (!confirm(`Are you sure you want to archive "${app.name}"?`)) {
      return;
    }

    this.appService.archiveApp(app.id).subscribe({
      next: () => {
        this.appContext.removeApp(app.id);
        alert('App archived successfully');
      },
      error: (error) => {
        console.error('Error archiving app:', error);
        alert('Failed to archive app');
      }
    });
  }

  restoreApp(app: App, event: Event) {
    event.stopPropagation();

    this.appService.restoreApp(app.id).subscribe({
      next: (restoredApp) => {
        this.appContext.updateApp(restoredApp);
        alert('App restored successfully');
      },
      error: (error) => {
        console.error('Error restoring app:', error);
        alert('Failed to restore app');
      }
    });
  }

  deleteAppPermanently(app: App, event: Event) {
    event.stopPropagation();
    
    if (!confirm(`Are you sure you want to PERMANENTLY delete "${app.name}"? This action cannot be undone.`)) {
      return;
    }

    this.appService.deleteAppPermanently(app.id).subscribe({
      next: () => {
        this.appContext.removeApp(app.id);
        alert('App deleted permanently');
      },
      error: (error) => {
        console.error('Error deleting app:', error);
        alert('Failed to delete app');
      }
    });
  }

  toggleViewMode() {
    this.viewMode.update(mode => mode === 'grid' ? 'list' : 'grid');
  }

  getStatusBadgeClass(status: AppStatus): string {
    switch (status) {
      case AppStatus.ACTIVE: return 'badge-success';
      case AppStatus.INACTIVE: return 'badge-warning';
      case AppStatus.ARCHIVED: return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}

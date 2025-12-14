import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';
import { AppContextService } from '../../../core/services/app-context.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  protected appContextService = inject(AppContextService);

  protected isLoading = signal(false);
  protected stats = signal<DashboardStats | null>(null);

  ngOnInit() {
    this.loadDashboardData();
  }

  private async loadDashboardData() {
    this.isLoading.set(true);
    try {
      const statsData = await this.dashboardService.getStats().toPromise();
      this.stats.set(statsData || null);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}

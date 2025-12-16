import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { UnifiedHeaderComponent } from './shared/components/unified-header/unified-header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { trigger, transition, style, query, animate } from '@angular/animations';
import { ThemeService } from './core/services/theme.service';

const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px) scale(0.98)', filter: 'blur(4px)' }),
      animate('300ms cubic-bezier(0.2,0.8,0.2,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }))
    ], { optional: true })
  ])
]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UnifiedHeaderComponent, FooterComponent, ToastContainerComponent],
  animations: [routeAnimations],
  template: `
    @if (!isAdminRoute()) { <app-unified-header [mode]="'public'"></app-unified-header> }
    <div class="route-anim" [@routeAnimations]="getRouteAnimationState()">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
    @if (!isAdminRoute()) { <app-footer></app-footer> }
    <app-toast-container></app-toast-container>
  `
})
export class AppComponent implements OnInit {
  title = 'Dynamic Platform';
  private router = inject(Router);
  private themeService = inject(ThemeService);

  ngOnInit() {
    // Theme service will automatically initialize from constructor
  }

  isAdminRoute() { return this.router.url.startsWith('/admin'); }
  getRouteAnimationState() { return this.router.url; }
}

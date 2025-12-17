import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionService } from '../../core/services/permission.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private resource: string = '';
  private action: string = '';

  @Input() set hasPermission(value: string) {
    if (value) {
      const parts = value.split(':');
      if (parts.length === 2) {
        this.resource = parts[0].replace(/['"]/g, ''); // Remove quotes
        this.action = parts[1].replace(/['"]/g, ''); // Remove quotes
      } else {
        // Fallback for single value (assume it's resource and default to 'read')
        this.resource = value.replace(/['"]/g, '');
        this.action = 'read';
      }
      this.updateView();
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.permissionService.userPermissions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    if (this.resource && this.action) {
      const hasPermission = this.permissionService.hasPermission(this.resource, this.action);
      
      // Clear existing views first
      this.viewContainer.clear();
      
      if (hasPermission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    }
  }
}
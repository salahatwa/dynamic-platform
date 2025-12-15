import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionService } from '../../core/services/permission.service';

@Directive({
  selector: '[hasAnyPermission]',
  standalone: true
})
export class HasAnyPermissionDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private resource: string = '';

  @Input() set hasAnyPermission(resource: string) {
    this.resource = resource;
    this.updateView();
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
    if (this.resource) {
      const hasPermission = this.permissionService.hasAnyPermissionForResource(this.resource);
      
      if (hasPermission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    }
  }
}
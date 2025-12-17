import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { InvitationService } from '../../../core/services/invitation.service';
import { Invitation, InvitationRequest, InvitationStatus } from '../../../core/models/invitation.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { HasPermissionDirective } from '../../../shared/directives/has-permission.directive';
import { TranslationService } from '../../../core/services/translation.service';
import { PermissionService } from '../../../core/services/permission.service';

interface Role {
  id: number;
  name: string;
}

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, HasPermissionDirective],
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss']
})
export class InvitationsComponent implements OnInit {
  InvitationStatus = InvitationStatus; // Expose enum to template

  invitations = signal<Invitation[]>([]);
  availableRoles = signal<Role[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);
  formError = signal<string | null>(null);
  createDialog = signal(false);
  filterStatus = signal<'ALL' | InvitationStatus>('ALL');

  invitationForm = signal({
    email: '',
    roleIds: [] as number[]
  });

  private t = inject(TranslationService);
  private errorHandler = inject(ErrorHandlerService);
  private toastService = inject(ToastService);
  private permissionService = inject(PermissionService);

  // Permission checks
  canCreateInvitations = computed(() => this.permissionService.canCreate('invitations'));
  canUpdateInvitations = computed(() => this.permissionService.canUpdate('invitations'));
  canDeleteInvitations = computed(() => this.permissionService.canDelete('invitations'));
  canReadInvitations = computed(() => this.permissionService.canRead('invitations'));

  // Form validation
  isInvitationFormValid = computed(() => {
    const form = this.invitationForm();
    return form.email.trim().length > 0 && 
           form.email.includes('@') &&
           form.roleIds.length > 0;
  });
  
  constructor(
    private invitationService: InvitationService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadInvitations();
    this.loadRoles();
  }

  loadInvitations() {
    this.loading.set(true);
    this.error.set(null);

    this.invitationService.getCorporateInvitations().subscribe({
      next: (invitations) => {
        this.invitations.set(invitations);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(this.t.translate('invitations.error.loadFailed'));
        this.loading.set(false);
        this.errorHandler.handleError(err, 'load_invitations');
      }
    });
  }

  loadRoles() {
    this.http.get<Role[]>(`${environment.apiUrl}/roles`).subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
      },
      error: (err) => {
        this.errorHandler.handleError(err, 'load_roles');
      }
    });
  }

  filteredInvitations() {
    if (this.filterStatus() === 'ALL') {
      return this.invitations();
    }
    return this.invitations().filter(inv => inv.status === this.filterStatus());
  }

  countByStatus(status: InvitationStatus): number {
    return this.invitations().filter(inv => inv.status === status).length;
  }

  openCreateDialog() {
    this.createDialog.set(true);
    this.invitationForm.set({ email: '', roleIds: [] });
    this.formError.set(null);
  }

  closeCreateDialog() {
    this.createDialog.set(false);
    this.invitationForm.set({ email: '', roleIds: [] });
    this.formError.set(null);
  }

  toggleRole(roleId: number) {
    const currentForm = this.invitationForm();
    const index = currentForm.roleIds.indexOf(roleId);
    const newRoleIds = [...currentForm.roleIds];
    
    if (index > -1) {
      newRoleIds.splice(index, 1);
    } else {
      newRoleIds.push(roleId);
    }
    
    this.invitationForm.set({
      ...currentForm,
      roleIds: newRoleIds
    });
  }

  updateEmail(email: string) {
    const currentForm = this.invitationForm();
    this.invitationForm.set({
      ...currentForm,
      email: email
    });
  }

  submitInvitation(event: Event) {
    event.preventDefault();
    this.formError.set(null);

    if (!this.isInvitationFormValid()) {
      return;
    }

    this.submitting.set(true);

    this.invitationService.createInvitation(this.invitationForm()).subscribe({
      next: (invitation) => {
        this.invitations.update(invs => [invitation, ...invs]);
        this.closeCreateDialog();
        this.submitting.set(false);
        this.toastService.success('Invitation Sent', 'Invitation sent successfully');
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorHandler.handleError(err, 'create_invitation');
        
        // Also set form error for inline display
        let errorMessage = this.t.translate('invitations.alerts.createFailed');
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.error) {
          errorMessage = err.error.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.formError.set(errorMessage);
      }
    });
  }

  cancelInvitation(id: number) {
    if (!confirm(this.t.translate('invitations.confirm.cancel'))) {
      return;
    }

    this.invitationService.cancelInvitation(id).subscribe({
      next: () => {
        this.invitations.update(invs =>
          invs.map(inv => inv.id === id ? { ...inv, status: InvitationStatus.CANCELLED } : inv)
        );
        this.toastService.success('Invitation Cancelled', 'Invitation cancelled successfully');
      },
      error: (err) => {
        this.errorHandler.handleError(err, 'cancel_invitation');
      }
    });
  }

  resendInvitation(id: number) {
    this.invitationService.resendInvitation(id).subscribe({
      next: (newInvitation) => {
        this.invitations.update(invs =>
          invs.map(inv => inv.id === id ? { ...inv, status: InvitationStatus.CANCELLED } : inv)
        );
        this.invitations.update(invs => [newInvitation, ...invs]);
        this.toastService.success('Invitation Resent', 'Invitation resent successfully');
      },
      error: (err) => {
        this.errorHandler.handleError(err, 'resend_invitation');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

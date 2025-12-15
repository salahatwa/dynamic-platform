import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { InvitationService } from '../../../core/services/invitation.service';
import { Invitation, InvitationRequest, InvitationStatus } from '../../../core/models/invitation.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

interface Role {
  id: number;
  name: string;
}

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
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

  invitationForm = {
    email: '',
    roleIds: [] as number[]
  };

  private t = inject(TranslationService);
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
        console.error('Error loading invitations:', err);
      }
    });
  }

  loadRoles() {
    this.http.get<Role[]>(`${environment.apiUrl}/roles`).subscribe({
      next: (roles) => {
        this.availableRoles.set(roles);
      },
      error: (err) => {
        console.error('Error loading roles:', err);
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
    this.invitationForm = { email: '', roleIds: [] };
    this.formError.set(null);
  }

  closeCreateDialog() {
    this.createDialog.set(false);
    this.invitationForm = { email: '', roleIds: [] };
    this.formError.set(null);
  }

  toggleRole(roleId: number) {
    const index = this.invitationForm.roleIds.indexOf(roleId);
    if (index > -1) {
      this.invitationForm.roleIds.splice(index, 1);
    } else {
      this.invitationForm.roleIds.push(roleId);
    }
  }

  submitInvitation(event: Event) {
    event.preventDefault();
    this.formError.set(null);

    if (!this.invitationForm.email) {
      this.formError.set(this.t.translate('invitations.form.emailRequired'));
      return;
    }

    if (this.invitationForm.roleIds.length === 0) {
      this.formError.set(this.t.translate('invitations.form.rolesRequired'));
      return;
    }

    this.submitting.set(true);

    this.invitationService.createInvitation(this.invitationForm).subscribe({
      next: (invitation) => {
        this.invitations.update(invs => [invitation, ...invs]);
        this.closeCreateDialog();
        this.submitting.set(false);
      },
      error: (err) => {
        console.error('Error creating invitation:', err);
        
        // Extract user-friendly error message
        let errorMessage = this.t.translate('invitations.alerts.createFailed');
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.error) {
          errorMessage = err.error.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.formError.set(errorMessage);
        this.submitting.set(false);
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
      },
      error: (err) => {
        alert(this.t.translate('invitations.alerts.cancelFailed') + ': ' + (err.error?.error || 'Unknown error'));
        console.error('Error cancelling invitation:', err);
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
      },
      error: (err) => {
        alert(this.t.translate('invitations.alerts.resendFailed') + ': ' + (err.error?.error || 'Unknown error'));
        console.error('Error resending invitation:', err);
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

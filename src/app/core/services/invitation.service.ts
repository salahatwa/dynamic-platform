import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Invitation,
  InvitationRequest,
  InvitationValidationResponse,
  InvitationAcceptResponse
} from '../models/invitation.model';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = `${environment.apiUrl}/invitations`;

  constructor(private http: HttpClient) {}

  createInvitation(request: InvitationRequest): Observable<Invitation> {
    return this.http.post<Invitation>(this.apiUrl, request);
  }

  validateInvitation(token: string): Observable<InvitationValidationResponse> {
    return this.http.get<InvitationValidationResponse>(`${this.apiUrl}/validate/${token}`);
  }

  acceptInvitation(token: string): Observable<InvitationAcceptResponse> {
    return this.http.post<InvitationAcceptResponse>(`${this.apiUrl}/accept/${token}`, {});
  }

  getCorporateInvitations(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(this.apiUrl);
  }

  cancelInvitation(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}/cancel`, {});
  }

  resendInvitation(id: number): Observable<Invitation> {
    return this.http.post<Invitation>(`${this.apiUrl}/${id}/resend`, {});
  }
}

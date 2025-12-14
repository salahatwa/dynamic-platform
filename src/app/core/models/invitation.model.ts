export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export interface Invitation {
  id: number;
  email: string;
  corporateName: string;
  inviterName: string;
  roles: string[];
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  acceptedByName?: string;
  createdAt: string;
}

export interface InvitationRequest {
  email: string;
  roleIds: number[];
}

export interface InvitationValidationResponse {
  valid: boolean;
  email?: string;
  corporateName?: string;
  inviterName?: string;
  roles?: string[];
  userExists?: boolean;
  expiresAt?: string;
  errorMessage?: string;
}

export interface InvitationAcceptResponse {
  message: string;
  corporateName: string;
}

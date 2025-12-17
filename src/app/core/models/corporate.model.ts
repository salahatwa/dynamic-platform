export interface Corporate {
  id?: number;
  name: string;
  domain: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CorporateUpdateRequest {
  name: string;
  domain: string;
  description?: string;
}

export interface NameAvailabilityResponse {
  available: boolean;
}

export interface DomainAvailabilityResponse {
  available: boolean;
}
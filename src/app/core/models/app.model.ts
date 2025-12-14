export interface App {
  id: number;
  corporateId: number;
  name: string;
  description?: string;
  appKey: string;
  iconUrl?: string;
  status: AppStatus;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  
  // Optional statistics
  translationCount?: number;
  templateCount?: number;
  lovCount?: number;
  configCount?: number;
  errorCodeCount?: number;
}

export enum AppStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface AppRequest {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface AppStats {
  totalApps: number;
  activeApps: number;
  archivedApps: number;
}

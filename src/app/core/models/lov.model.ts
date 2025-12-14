export interface Lov {
  id: number;
  lovCode: string;
  lovType: string;
  lovValue?: string;
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  displayOrder: number;
  active: boolean;
  parentLovId?: number;
  translationApp?: string;
  translationKey?: string;
  appName?: string;
  descriptions?: Record<string, string>; // Language code -> Description
  metadata?: string | Record<string, any>;
  corporateId?: number;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface LovType {
  code: string;
  name: string;
  description: string;
  allowHierarchy: boolean;
  count: number;
}

export interface LovRequest {
  lovCode: string;
  lovType: string;
  lovValue?: string;
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  displayOrder: number;
  active: boolean;
  parentLovId?: number;
  translationApp?: string;
  translationKey?: string;
  appName?: string;
  metadata?: string; // JSON string for backend
}

export interface LovVersion {
  id: number;
  lovId: number;
  version: number;
  lovCode: string;
  lovType: string;
  value: string;
  displayOrder: number;
  active: boolean;
  translationKey: string;
  metadata?: Record<string, any>;
  changedBy: string;
  changedAt: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  changeDescription?: string;
}

export interface LovAudit {
  id: number;
  lovId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  userId: number;
  userName: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  changes?: Record<string, any>;
}

export interface LovPage {
  lovCode: string;
  name: string;
  description: string;
  translationApp: string;
  valueCount: number;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

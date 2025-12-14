export interface ErrorCode {
  id?: number;
  errorCode: string;
  categoryId?: number;
  categoryName?: string;
  appName: string;
  moduleName?: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  httpStatusCode?: number;
  isPublic: boolean;
  isRetryable: boolean;
  defaultMessage: string;
  technicalDetails?: string;
  resolutionSteps?: string;
  documentationUrl?: string;
  translations?: { [key: string]: ErrorCodeTranslation };
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ErrorCodeTranslation {
  id?: number;
  message: string;
  technicalDetails?: string;
  resolutionSteps?: string;
}

export interface ErrorCodeCategory {
  id?: number;
  categoryCode: string;
  categoryName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ErrorCodeVersion {
  id: number;
  errorCodeId: number;
  versionNumber: number;
  errorCode: string;
  categoryId?: number;
  appName: string;
  moduleName?: string;
  severity: string;
  status: string;
  httpStatusCode?: number;
  isPublic: boolean;
  isRetryable: boolean;
  defaultMessage: string;
  technicalDetails?: string;
  resolutionSteps?: string;
  documentationUrl?: string;
  changeDescription?: string;
  createdAt: string;
  createdBy: string;
}

export interface ErrorCodeAudit {
  id: number;
  errorCodeId: number;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum ErrorStatus {
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  REMOVED = 'REMOVED'
}

export interface ErrorCodeRequest {
  errorCode: string;
  categoryId?: number;
  appName: string;
  moduleName?: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  httpStatusCode?: number;
  isPublic: boolean;
  isRetryable: boolean;
  defaultMessage: string;
  technicalDetails?: string;
  resolutionSteps?: string;
  documentationUrl?: string;
  translations?: { [key: string]: ErrorCodeTranslation };
}

export enum ConfigType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
  JSON = 'JSON',
  TEMPLATE = 'TEMPLATE',
  LIST = 'LIST'
}

export interface AppConfig {
  id: number;
  configKey: string;
  configName: string;
  description?: string;
  configType: ConfigType;
  configValue?: string;
  defaultValue?: string;
  enumValues?: string; // JSON array
  validationRules?: string; // JSON object
  isPublic: boolean;
  isRequired: boolean;
  displayOrder: number;
  groupId?: number;
  groupName?: string;
  appName: string;
  active: boolean;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface AppConfigGroup {
  id: number;
  groupKey: string;
  groupName: string;
  description?: string;
  appName: string;
  displayOrder: number;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface AppConfigRequest {
  configKey: string;
  configName: string;
  description?: string;
  configType: ConfigType;
  configValue?: string;
  defaultValue?: string;
  enumValues?: string;
  validationRules?: string;
  isPublic?: boolean;
  isRequired?: boolean;
  displayOrder?: number;
  groupId?: number;
  appName: string;
  active?: boolean;
}

export interface AppConfigGroupRequest {
  groupKey: string;
  groupName: string;
  description?: string;
  appName: string;
  displayOrder?: number;
  active?: boolean;
}

export interface AppConfigVersion {
  id: number;
  configId: number;
  version: number;
  configValue?: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  changeDescription?: string;
  changedBy: string;
  changedAt: string;
  metadata?: string;
}

export interface AppConfigAudit {
  id: number;
  configId: number;
  action: 'VIEW' | 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  oldValue?: string;
  newValue?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  custom?: string;
}

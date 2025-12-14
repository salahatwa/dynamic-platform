export interface TranslationApp {
  id: number;
  name: string;
  description?: string;
  apiKey: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  active: boolean;
  keysCount: number;
  translationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationKey {
  id: number;
  appId: number;
  keyName: string;
  description?: string;
  context?: string;
  translations: { [language: string]: TranslationValue };
  createdAt: string;
  updatedAt: string;
}

export interface TranslationValue {
  id: number;
  language: string;
  value: string;
  status: TranslationStatus;
  updatedAt: string;
}

export interface Translation {
  id: number;
  keyId: number;
  language: string;
  value: string;
  status: TranslationStatus;
  createdAt: string;
  updatedAt: string;
}

export enum TranslationStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED'
}

export interface TranslationVersion {
  id: number;
  appId: number;
  version: number;
  changelog: string;
  snapshot: string;
  createdAt: string;
}

export interface TranslationAppRequest {
  name: string;
  description?: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  active: boolean;
}

export interface TranslationKeyRequest {
  appId: number;
  keyName: string;
  description?: string;
  context?: string;
}

export interface TranslationRequest {
  keyId: number;
  language: string;
  value: string;
  status: TranslationStatus;
}

export interface BulkTranslationRequest {
  items: TranslationRequest[];
}

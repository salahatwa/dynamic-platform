export interface TemplateFolder {
  id: number;
  name: string;
  parentId?: number;
  children?: TemplateFolder[];
  templatesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePage {
  id: number;
  templateId: number;
  name: string;
  content: string;
  pageOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateAttribute {
  id: number;
  templateId: number;
  attributeKey: string;
  attributeValue: string;
  attributeType: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: number;
  name: string;
  type: TemplateType;
  htmlContent: string;
  cssStyles?: string;
  subject?: string;
  folderId?: number;
  folder?: TemplateFolder;
  pages?: TemplatePage[];
  attributes?: TemplateAttribute[];
  pageOrientation?: PageOrientation;
  createdAt: string;
  updatedAt: string;
}

export enum TemplateType {
  HTML = 'HTML',
  TXT = 'TXT',
  FORM = 'FORM'
}

export enum PageOrientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE'
}

export const PageOrientationLabels = {
  [PageOrientation.PORTRAIT]: 'A4 Vertical (Portrait)',
  [PageOrientation.LANDSCAPE]: 'A4 Horizontal (Landscape)'
};

export const PageOrientationDescriptions = {
  [PageOrientation.PORTRAIT]: 'Suitable for: Account statements, invoices, letters, reports',
  [PageOrientation.LANDSCAPE]: 'Suitable for: Certificates, diplomas, charts, wide tables'
};

export interface TemplateFolderRequest {
  name: string;
  parentId?: number;
}

export interface TemplatePageRequest {
  name: string;
  content?: string;
  pageOrder?: number;
}

export interface TemplateAttributeRequest {
  attributeKey: string;
  attributeValue?: string;
  attributeType?: string;
  description?: string;
}

export interface TemplateRequest {
  name: string;
  type: TemplateType;
  htmlContent: string;
  cssStyles?: string;
  subject?: string;
  folderId?: number;
  pageOrientation?: PageOrientation;
}

export interface TemplatePreviewRequest {
  parameters?: { [key: string]: any };
  pageNumber?: number;
}

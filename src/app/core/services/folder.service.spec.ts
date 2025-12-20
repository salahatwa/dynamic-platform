import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FolderService, CreateFolderRequest, FolderTreeResponse } from './folder.service';
import { TemplateFolder } from '../models/template.model';
import { environment } from '../../../environments/environment';

describe('FolderService', () => {
  let service: FolderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FolderService]
    });
    service = TestBed.inject(FolderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a folder', () => {
    const mockRequest: CreateFolderRequest = {
      name: 'Test Folder',
      parentId: null,
      applicationId: 1
    };

    const mockResponse: TemplateFolder = {
      id: 1,
      name: 'Test Folder',
      parentId: undefined,
      applicationId: 1,
      templatesCount: 0,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    service.createFolder(mockRequest).subscribe(folder => {
      expect(folder).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/template-folders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });

  it('should get folder tree', () => {
    const applicationId = 1;
    const mockResponse: FolderTreeResponse = {
      rootFolder: {
        id: 1,
        name: 'Root',
        parentId: null,
        children: [],
        isExpanded: false,
        isLoading: false,
        hasChildren: false,
        permissions: {
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true
        },
        templateCount: 0,
        subfolderCount: 0,
        path: '/',
        level: 0
      },
      totalFolders: 1
    };

    service.getFolderTree(applicationId).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(service.isLoading()).toBe(false);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/template-folders/tree/${applicationId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should manage selection state', () => {
    const mockTemplate: any = { 
      id: 1, 
      name: 'Test Template', 
      htmlContent: '<p>Test</p>',
      type: 'HTML',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };
    
    expect(service.selectedItems()).toEqual([]);
    
    service.selectItem(mockTemplate);
    expect(service.selectedItems()).toContain(mockTemplate);
    
    service.deselectItem(mockTemplate);
    expect(service.selectedItems()).not.toContain(mockTemplate);
    
    service.toggleItemSelection(mockTemplate);
    expect(service.selectedItems()).toContain(mockTemplate);
    
    service.clearSelection();
    expect(service.selectedItems()).toEqual([]);
  });
});
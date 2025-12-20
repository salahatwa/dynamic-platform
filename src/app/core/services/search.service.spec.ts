import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SearchService, SearchResult } from './search.service';
import { AppContextService } from './app-context.service';
import { environment } from '../../../environments/environment';

describe('SearchService', () => {
  let service: SearchService;
  let httpMock: HttpTestingController;
  let appContextService: jasmine.SpyObj<AppContextService>;

  beforeEach(() => {
    const appContextSpy = jasmine.createSpyObj('AppContextService', [], {
      selectedApp: jasmine.createSpy().and.returnValue({ id: 1, name: 'Test App' })
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SearchService,
        { provide: AppContextService, useValue: appContextSpy }
      ]
    });

    service = TestBed.inject(SearchService);
    httpMock = TestBed.inject(HttpTestingController);
    appContextService = TestBed.inject(AppContextService) as jasmine.SpyObj<AppContextService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform comprehensive search', (done) => {
    const query = 'test query';
    const applicationId = 1;
    
    const mockTemplateResults = {
      content: [
        {
          id: 1,
          name: 'Test Template',
          type: 'HTML',
          folderPath: '/test-folder',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ],
      totalElements: 1
    };

    const mockFolderResults = [
      {
        id: 1,
        name: 'Test Folder',
        path: '/test-folder',
        templateCount: 5,
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ];

    service.searchImmediate(query, applicationId).subscribe(result => {
      expect(result).toBeDefined();
      expect(result.query).toBe(query);
      expect(result.templates.length).toBe(1);
      expect(result.folders.length).toBe(1);
      expect(result.totalResults).toBe(2);
      done();
    });

    // Mock the template search request
    const templateReq = httpMock.expectOne(
      `${environment.apiUrl}/template-folders/search/${applicationId}?query=${encodeURIComponent(query)}&page=0&size=50`
    );
    expect(templateReq.request.method).toBe('GET');
    templateReq.flush(mockTemplateResults);

    // Mock the folder search request
    const folderReq = httpMock.expectOne(
      `${environment.apiUrl}/template-folders/search?query=${encodeURIComponent(query)}&applicationId=${applicationId}`
    );
    expect(folderReq.request.method).toBe('GET');
    folderReq.flush(mockFolderResults);
  });

  it('should search folders specifically', () => {
    const query = 'folder query';
    const applicationId = 1;
    
    const mockFolders = [
      {
        id: 1,
        name: 'Test Folder',
        path: '/test-folder',
        templateCount: 3,
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ];

    service.searchFolders(query, applicationId).subscribe(folders => {
      expect(folders).toBeDefined();
      expect(folders.length).toBe(1);
      expect(folders[0].name).toBe('Test Folder');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/template-folders/search?query=${encodeURIComponent(query)}&applicationId=${applicationId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockFolders);
  });

  it('should search templates specifically', () => {
    const query = 'template query';
    const applicationId = 1;
    
    const mockTemplates = [
      {
        id: 1,
        name: 'Test Template',
        type: 'HTML',
        folderPath: '/test-folder',
        updatedAt: '2023-01-01T00:00:00Z'
      }
    ];

    service.searchTemplates(query, applicationId).subscribe(templates => {
      expect(templates).toBeDefined();
      expect(templates.length).toBe(1);
      expect(templates[0].name).toBe('Test Template');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/templates/search?query=${encodeURIComponent(query)}&applicationId=${applicationId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockTemplates);
  });

  it('should get search suggestions', () => {
    const query = 'test';
    const applicationId = 1;
    const mockSuggestions = ['test template', 'test folder', 'testing'];

    service.getSearchSuggestions(query, applicationId).subscribe(suggestions => {
      expect(suggestions).toEqual(mockSuggestions);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/template-folders/search/suggestions?query=${encodeURIComponent(query)}&applicationId=${applicationId}&limit=5`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockSuggestions);
  });

  it('should manage search history', () => {
    const query = 'test query';
    const resultCount = 5;

    // Initially no history
    expect(service.getSearchHistory().length).toBe(0);

    // Add to history (this would normally happen during search)
    service['addToHistory'](query, resultCount);

    const history = service.getSearchHistory();
    expect(history.length).toBe(1);
    expect(history[0].query).toBe(query);
    expect(history[0].resultCount).toBe(resultCount);
  });

  it('should clear search', () => {
    service.searchQuery.set('test query');
    service.searchResults.set({
      templates: [],
      folders: [],
      totalResults: 0,
      query: 'test',
      searchTime: 100
    });

    service.clearSearch();

    expect(service.searchQuery()).toBe('');
    expect(service.searchResults()).toBeNull();
  });

  it('should update search filters', () => {
    const newFilters = {
      includeTemplates: false,
      includeFolders: true,
      templateTypes: ['HTML', 'TXT']
    };

    service.updateSearchFilters(newFilters);

    const currentFilters = service.searchFilters();
    expect(currentFilters.includeTemplates).toBe(false);
    expect(currentFilters.includeFolders).toBe(true);
    expect(currentFilters.templateTypes).toEqual(['HTML', 'TXT']);
  });
});
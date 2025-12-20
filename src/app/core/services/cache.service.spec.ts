import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { TemplateFolder, Template } from '../models/template.model';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService]
    });
    service = TestBed.inject(CacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should cache and retrieve folder tree', (done) => {
    const applicationId = 1;
    const mockTree: any = {
      id: 1,
      name: 'Root',
      children: [],
      isExpanded: false,
      isLoading: false,
      hasChildren: false,
      permissions: { canView: true, canCreate: true, canEdit: true, canDelete: true },
      templateCount: 0,
      subfolderCount: 0,
      path: '/',
      level: 0
    };

    // Initially should return null (cache miss)
    service.getFolderTree(applicationId).subscribe(result => {
      expect(result).toBeNull();
      
      // Cache the tree
      service.cacheFolderTree(applicationId, mockTree);
      
      // Should now return cached data (cache hit)
      service.getFolderTree(applicationId).subscribe(cachedResult => {
        expect(cachedResult).toEqual(mockTree);
        done();
      });
    });
  });

  it('should cache and retrieve templates', (done) => {
    const mockTemplate: Template = {
      id: 1,
      name: 'Test Template',
      type: 'HTML' as any,
      htmlContent: '<p>Test</p>',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    // Initially should return null (cache miss)
    service.getTemplate(1).subscribe(result => {
      expect(result).toBeNull();
      
      // Cache the template
      service.cacheTemplate(mockTemplate);
      
      // Should now return cached data (cache hit)
      service.getTemplate(1).subscribe(cachedResult => {
        expect(cachedResult).toEqual(mockTemplate);
        done();
      });
    });
  });

  it('should invalidate cache entries', (done) => {
    const mockTemplate: Template = {
      id: 1,
      name: 'Test Template',
      type: 'HTML' as any,
      htmlContent: '<p>Test</p>',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    // Cache the template
    service.cacheTemplate(mockTemplate);
    
    // Verify it's cached
    service.getTemplate(1).subscribe(result => {
      expect(result).toEqual(mockTemplate);
      
      // Invalidate the cache
      service.invalidateTemplate(1);
      
      // Should now return null
      service.getTemplate(1).subscribe(invalidatedResult => {
        expect(invalidatedResult).toBeNull();
        done();
      });
    });
  });

  it('should provide cache statistics', () => {
    const stats = service.getStats();
    
    expect(stats).toBeDefined();
    expect(stats.totalEntries).toBe(0);
    expect(stats.totalSize).toBe(0);
    expect(stats.hitRate).toBe(0);
    expect(stats.missRate).toBe(0);
  });

  it('should clear all cache entries', (done) => {
    const mockTemplate: Template = {
      id: 1,
      name: 'Test Template',
      type: 'HTML' as any,
      htmlContent: '<p>Test</p>',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    // Cache some data
    service.cacheTemplate(mockTemplate);
    service.cacheFolderTree(1, {} as any);
    
    // Verify cache has entries
    let initialStats = service.getStats();
    expect(initialStats.totalEntries).toBeGreaterThan(0);
    
    // Clear all cache
    service.invalidateAll();
    
    // Verify cache is empty
    service.getTemplate(1).subscribe(result => {
      expect(result).toBeNull();
      
      const finalStats = service.getStats();
      expect(finalStats.totalEntries).toBe(0);
      done();
    });
  });
});
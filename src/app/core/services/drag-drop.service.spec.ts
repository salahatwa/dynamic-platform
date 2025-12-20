import { TestBed } from '@angular/core/testing';
import { DragDropService, DragDropOperation } from './drag-drop.service';
import { TemplateFolder, Template } from '../models/template.model';

describe('DragDropService', () => {
  let service: DragDropService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DragDropService]
    });
    service = TestBed.inject(DragDropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start and end drag operations', () => {
    const mockTemplate: Template = {
      id: 1,
      name: 'Test Template',
      type: 'HTML' as any,
      htmlContent: '<p>Test</p>',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    const mockFolder: TemplateFolder = {
      id: 1,
      name: 'Source Folder',
      templatesCount: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    expect(service.isDragging()).toBe(false);
    
    service.startDrag([mockTemplate], mockFolder, 'move');
    
    expect(service.isDragging()).toBe(true);
    expect(service.draggedItemsCount()).toBe(1);
    expect(service.currentOperation()).toBe('move');
    
    service.endDrag();
    
    expect(service.isDragging()).toBe(false);
    expect(service.draggedItemsCount()).toBe(0);
  });

  it('should validate drop operations', () => {
    const mockTemplate: Template = {
      id: 1,
      name: 'Test Template',
      type: 'HTML' as any,
      htmlContent: '<p>Test</p>',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    const sourceFolder: TemplateFolder = {
      id: 1,
      name: 'Source Folder',
      applicationId: 1,
      templatesCount: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    const targetFolder: TemplateFolder = {
      id: 2,
      name: 'Target Folder',
      applicationId: 1,
      templatesCount: 0,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    service.startDrag([mockTemplate], sourceFolder, 'move');
    
    const validation = service.validateDrop(targetFolder, service['dragStateSubject'].value, 1);
    
    expect(validation.isValid).toBe(true);
    expect(validation.canDrop).toBe(true);
  });

  it('should prevent cross-application drops', () => {
    const mockTemplate: Template = {
      id: 1,
      name: 'Test Template',
      type: 'HTML' as any,
      htmlContent: '<p>Test</p>',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    const sourceFolder: TemplateFolder = {
      id: 1,
      name: 'Source Folder',
      applicationId: 1,
      templatesCount: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    const targetFolder: TemplateFolder = {
      id: 2,
      name: 'Target Folder',
      applicationId: 2, // Different application
      templatesCount: 0,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    service.startDrag([mockTemplate], sourceFolder, 'move');
    
    const validation = service.validateDrop(targetFolder, service['dragStateSubject'].value, 1);
    
    expect(validation.isValid).toBe(false);
    expect(validation.errorMessage).toContain('different applications');
  });

  it('should generate appropriate drag preview text', () => {
    const mockTemplate: Template = {
      id: 1,
      name: 'Test Template',
      type: 'HTML' as any,
      htmlContent: '<p>Test</p>',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    const singleItemText = service.getDragPreviewText([mockTemplate]);
    expect(singleItemText).toBe('Moving "Test Template"');

    const multipleItemsText = service.getDragPreviewText([mockTemplate, mockTemplate]);
    expect(multipleItemsText).toBe('Moving 2 templates');
  });
});
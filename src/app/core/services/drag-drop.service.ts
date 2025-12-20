import { Injectable, signal } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { TemplateFolder, Template } from '../models/template.model';

export interface DragDropOperation {
  sourceItems: (Template | TemplateFolder)[];
  targetFolder: TemplateFolder;
  operation: 'move' | 'copy';
  applicationId: number;
}

export interface DropZoneValidation {
  isValid: boolean;
  errorMessage?: string;
  canDrop: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedItems: (Template | TemplateFolder)[];
  draggedItemType: 'template' | 'folder' | 'mixed' | null;
  sourceFolder: TemplateFolder | null;
  operation: 'move' | 'copy';
}

export interface DropZone {
  folderId: number;
  isValid: boolean;
  isHighlighted: boolean;
  canAcceptDrop: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DragDropService {
  // Drag state management
  private dragStateSubject = new BehaviorSubject<DragState>({
    isDragging: false,
    draggedItems: [],
    draggedItemType: null,
    sourceFolder: null,
    operation: 'move'
  });

  // Drop zone management
  private dropZonesSubject = new BehaviorSubject<Map<number, DropZone>>(new Map());
  
  // Event streams
  private dragStartSubject = new Subject<DragState>();
  private dragEndSubject = new Subject<void>();
  private dropSubject = new Subject<DragDropOperation>();
  private validationSubject = new Subject<DropZoneValidation>();

  // Public observables
  dragState$ = this.dragStateSubject.asObservable();
  dropZones$ = this.dropZonesSubject.asObservable();
  dragStart$ = this.dragStartSubject.asObservable();
  dragEnd$ = this.dragEndSubject.asObservable();
  drop$ = this.dropSubject.asObservable();
  validation$ = this.validationSubject.asObservable();

  // Signals for reactive UI
  isDragging = signal(false);
  draggedItemsCount = signal(0);
  currentOperation = signal<'move' | 'copy'>('move');

  constructor() {}

  // Drag Operations
  startDrag(
    items: (Template | TemplateFolder)[], 
    sourceFolder: TemplateFolder,
    operation: 'move' | 'copy' = 'move'
  ): void {
    const draggedItemType = this.determineDraggedItemType(items);
    
    const dragState: DragState = {
      isDragging: true,
      draggedItems: items,
      draggedItemType,
      sourceFolder,
      operation
    };

    this.dragStateSubject.next(dragState);
    this.isDragging.set(true);
    this.draggedItemsCount.set(items.length);
    this.currentOperation.set(operation);
    
    this.dragStartSubject.next(dragState);
    
    // Initialize drop zones
    this.initializeDropZones();
  }

  endDrag(): void {
    const resetState: DragState = {
      isDragging: false,
      draggedItems: [],
      draggedItemType: null,
      sourceFolder: null,
      operation: 'move'
    };

    this.dragStateSubject.next(resetState);
    this.isDragging.set(false);
    this.draggedItemsCount.set(0);
    
    this.dragEndSubject.next();
    
    // Clear drop zones
    this.clearDropZones();
  }

  // Drop Operations
  attemptDrop(targetFolder: TemplateFolder, applicationId: number): boolean {
    const currentState = this.dragStateSubject.value;
    
    if (!currentState.isDragging || currentState.draggedItems.length === 0) {
      return false;
    }

    const validation = this.validateDrop(targetFolder, currentState, applicationId);
    
    if (validation.isValid) {
      const operation: DragDropOperation = {
        sourceItems: currentState.draggedItems,
        targetFolder,
        operation: currentState.operation,
        applicationId
      };
      
      this.dropSubject.next(operation);
      this.endDrag();
      return true;
    } else {
      this.validationSubject.next(validation);
      return false;
    }
  }

  // Drop Zone Management
  registerDropZone(folderId: number, canAcceptDrop: boolean = true): void {
    const currentZones = this.dropZonesSubject.value;
    currentZones.set(folderId, {
      folderId,
      isValid: false,
      isHighlighted: false,
      canAcceptDrop
    });
    this.dropZonesSubject.next(currentZones);
  }

  unregisterDropZone(folderId: number): void {
    const currentZones = this.dropZonesSubject.value;
    currentZones.delete(folderId);
    this.dropZonesSubject.next(currentZones);
  }

  highlightDropZone(folderId: number): void {
    const currentState = this.dragStateSubject.value;
    if (!currentState.isDragging) return;

    const currentZones = this.dropZonesSubject.value;
    const zone = currentZones.get(folderId);
    
    if (zone) {
      zone.isHighlighted = true;
      zone.isValid = this.isValidDropTarget(folderId, currentState);
      currentZones.set(folderId, zone);
      this.dropZonesSubject.next(currentZones);
    }
  }

  unhighlightDropZone(folderId: number): void {
    const currentZones = this.dropZonesSubject.value;
    const zone = currentZones.get(folderId);
    
    if (zone) {
      zone.isHighlighted = false;
      zone.isValid = false;
      currentZones.set(folderId, zone);
      this.dropZonesSubject.next(currentZones);
    }
  }

  // Validation Methods
  validateDrop(
    targetFolder: TemplateFolder, 
    dragState: DragState, 
    applicationId: number
  ): DropZoneValidation {
    // Check if dragging
    if (!dragState.isDragging) {
      return {
        isValid: false,
        errorMessage: 'No active drag operation',
        canDrop: false
      };
    }

    // Check application context - prevent cross-application moves
    if (targetFolder.applicationId && targetFolder.applicationId !== applicationId) {
      return {
        isValid: false,
        errorMessage: 'Cannot move items between different applications',
        canDrop: false
      };
    }

    // Check if dropping on source folder
    if (dragState.sourceFolder && dragState.sourceFolder.id === targetFolder.id) {
      return {
        isValid: false,
        errorMessage: 'Cannot drop items on their source folder',
        canDrop: false
      };
    }

    // Check for circular references when moving folders
    if (dragState.draggedItemType === 'folder' || dragState.draggedItemType === 'mixed') {
      const folderItems = dragState.draggedItems.filter(item => 'parentId' in item) as TemplateFolder[];
      
      for (const folder of folderItems) {
        if (this.wouldCreateCircularReference(folder, targetFolder)) {
          return {
            isValid: false,
            errorMessage: 'Cannot move folder into its own subfolder',
            canDrop: false
          };
        }
      }
    }

    // Check permissions (placeholder - would integrate with permission service)
    if (!this.hasDropPermissions(targetFolder, dragState.operation)) {
      return {
        isValid: false,
        errorMessage: `Insufficient permissions to ${dragState.operation} items to this folder`,
        canDrop: false
      };
    }

    return {
      isValid: true,
      canDrop: true
    };
  }

  // Helper Methods
  private determineDraggedItemType(items: (Template | TemplateFolder)[]): 'template' | 'folder' | 'mixed' {
    const hasTemplates = items.some(item => 'htmlContent' in item);
    const hasFolders = items.some(item => 'parentId' in item);
    
    if (hasTemplates && hasFolders) {
      return 'mixed';
    } else if (hasFolders) {
      return 'folder';
    } else {
      return 'template';
    }
  }

  private isValidDropTarget(folderId: number, dragState: DragState): boolean {
    // Basic validation - would be enhanced with actual folder data
    if (!dragState.isDragging) return false;
    if (dragState.sourceFolder && dragState.sourceFolder.id === folderId) return false;
    
    return true;
  }

  private wouldCreateCircularReference(sourceFolder: TemplateFolder, targetFolder: TemplateFolder): boolean {
    // Check if target folder is a descendant of source folder
    // This would need to be enhanced with actual folder hierarchy data
    
    // Basic check: if target folder's path contains source folder's path
    if (targetFolder.path && sourceFolder.path) {
      return targetFolder.path.startsWith(sourceFolder.path + '/') || 
             targetFolder.path === sourceFolder.path;
    }
    
    return false;
  }

  private hasDropPermissions(targetFolder: TemplateFolder, operation: 'move' | 'copy'): boolean {
    // Placeholder for permission checking
    // Would integrate with actual permission service
    return true;
  }

  private initializeDropZones(): void {
    // Clear existing zones
    this.dropZonesSubject.next(new Map());
  }

  private clearDropZones(): void {
    this.dropZonesSubject.next(new Map());
  }

  // Utility Methods for Components
  getDragPreviewText(items: (Template | TemplateFolder)[]): string {
    const count = items.length;
    const type = this.determineDraggedItemType(items);
    
    if (count === 1) {
      return `Moving "${items[0].name}"`;
    }
    
    switch (type) {
      case 'template':
        return `Moving ${count} templates`;
      case 'folder':
        return `Moving ${count} folders`;
      case 'mixed':
        return `Moving ${count} items`;
      default:
        return `Moving ${count} items`;
    }
  }

  getDropZoneClass(folderId: number): string {
    const zones = this.dropZonesSubject.value;
    const zone = zones.get(folderId);
    
    if (!zone || !this.isDragging()) {
      return '';
    }
    
    let classes = 'drop-zone';
    
    if (zone.isHighlighted) {
      classes += zone.isValid ? ' drop-zone--valid' : ' drop-zone--invalid';
    }
    
    return classes;
  }

  // Keyboard Modifiers Support
  setOperationFromKeyboard(event: KeyboardEvent): void {
    const operation = event.ctrlKey || event.metaKey ? 'copy' : 'move';
    
    const currentState = this.dragStateSubject.value;
    if (currentState.isDragging && currentState.operation !== operation) {
      this.dragStateSubject.next({
        ...currentState,
        operation
      });
      this.currentOperation.set(operation);
    }
  }
}
import { Component, OnInit, signal, computed, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateManagementService } from '../../../../core/services/template-management.service';
import { AppContextService } from '../../../../core/services/app-context.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  TemplateType,
  TemplateFolder,
  TemplatePage,
  TemplateAttribute,
  TemplatePageRequest,
  TemplateAttributeRequest,
  PageOrientation,
  PageOrientationLabels,
  PageOrientationDescriptions
} from '../../../../core/models/template.model';
import { FreeMarkerInsertEvent } from '../../../../shared/components/freemarker-toolbar/freemarker-toolbar.component';
import { FreeMarkerService, FreeMarkerVariable } from '../../../../core/services/freemarker.service';
import { EditorContentComponent, ContentChangeEvent, TextSelectionEvent } from '../../../../shared/components/template-editor/editor-content/editor-content.component';
import { PdfParametersDialogComponent } from '../../../../shared/components/pdf-parameters-dialog/pdf-parameters-dialog.component';

@Component({
  selector: 'app-template-editor-enhanced',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorContentComponent, PdfParametersDialogComponent],
  templateUrl: './template-editor-enhanced.component.html',
  styleUrls: ['./template-editor-enhanced.component.css']
})
export class TemplateEditorEnhancedComponent implements OnInit {
  // Modals
  showTypeModal = signal(false);
  showFolderModal = signal(false);
  showPageModal = signal(false);
  showAttributeModal = signal(false);
  showDeleteModal = signal(false);

  // Template data
  templateId = signal<number | null>(null);
  templateName = signal('');
  templateType = signal<TemplateType>(TemplateType.HTML);
  pageOrientation = signal<PageOrientation>(PageOrientation.PORTRAIT);
  selectedFolder = signal<TemplateFolder | null>(null);
  newFolderName = signal('');

  // Folders
  folders = signal<TemplateFolder[]>([]);
  rootFolders = signal<TemplateFolder[]>([]);

  // Pages
  pages = signal<TemplatePage[]>([]);
  activePage = signal<TemplatePage | null>(null);
  pageContent = signal('');
  pageName = signal('');
  editingPageId = signal<number | null>(null);

  // Attributes
  attributes = signal<TemplateAttribute[]>([]);
  attributeKey = signal('');
  attributeValue = signal('');
  attributeType = signal('STRING');
  attributeDescription = signal('');
  editingAttributeId = signal<number | null>(null);

  // Editor state
  activeTab = signal<'html' | 'attributes'>('html');
  htmlContent = signal('');
  previewHtml = signal('');

  // Selection for FreeMarker
  currentSelection = signal('');
  selectionStart = signal(0);
  selectionEnd = signal(0);

  // Delete modal
  deleteType = signal<'page' | 'attribute' | null>(null);
  deleteId = signal<number | null>(null);
  deleteName = signal('');

  // Loading states
  loading = signal(false);
  saving = signal(false);

  // Sidebar toggle
  sidebarOpen = signal(true);
  sidebarActiveTab = signal<'pages' | 'attributes'>('pages');
  showHelp = false;

  // Variables panel
  showVariablesPanel = signal(false);

  // PDF options dropdown
  showPdfOptions = false;
  
  // PDF export loading state
  pdfExporting = signal(false);
  
  // PDF Parameters Dialog
  showPdfParametersDialog = signal(false);
  
  // PDF Parameters for standalone component
  templatePages = computed(() => this.pages());
  templateContent = computed(() => this.htmlContent());

  // FreeMarker
  @ViewChild(EditorContentComponent) editorContentComponent?: EditorContentComponent;

  detectedVariables = signal<FreeMarkerVariable[]>([]);
  allVariables = computed(() => {
    // Combine attributes and detected variables
    const attrVars: FreeMarkerVariable[] = this.attributes().map(attr => ({
      name: attr.attributeKey,
      type: 'attribute' as const,
      source: 'Template Attribute'
    }));
    return [...attrVars, ...this.detectedVariables()];
  });

  // Computed
  isHtmlType = computed(() => this.templateType() === TemplateType.HTML);
  isTxtType = computed(() => this.templateType() === TemplateType.TXT);
  hasPages = computed(() => this.pages().length > 0);

  // Form validation
  isPageFormValid = computed(() => {
    return this.pageName().trim().length > 0;
  });

  isAttributeFormValid = computed(() => {
    return this.attributeKey().trim().length > 0;
  });

  TemplateType = TemplateType;
  PageOrientation = PageOrientation;
  PageOrientationLabels = PageOrientationLabels;
  PageOrientationDescriptions = PageOrientationDescriptions;

  private errorHandler = inject(ErrorHandlerService);
  private toastService = inject(ToastService);

  constructor(
    private templateService: TemplateManagementService,
    private appContext: AppContextService,
    private route: ActivatedRoute,
    private router: Router,
    private freemarkerService: FreeMarkerService
  ) { }

  private getCurrentAppName(): string | undefined {
    const app = this.appContext.selectedApp();
    return app ? app.name : undefined;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.templateId.set(+id);
      this.loadTemplate();
    } else {
      this.showTypeModal.set(true);
    }
    this.loadFolders();

    // Set initial sidebar tab based on template type
    if (this.isHtmlType()) {
      this.sidebarActiveTab.set('pages');
    } else {
      this.sidebarActiveTab.set('attributes');
    }

    // Close sidebar on mobile when clicking outside
    this.setupSidebarClickOutside();
    
    // Close PDF options dropdown when clicking outside
    this.setupDropdownClickOutside();
  }

  // Type Selection
  selectType(type: TemplateType) {
    this.templateType.set(type);
    this.showTypeModal.set(false);
    if (type === TemplateType.HTML) {
      this.createFirstPage();
    }
  }

  updateTemplateName() {
    // This method is called when the input loses focus
    // The signal is already updated via ngModel
    // Auto-save template metadata when name changes
    if (this.templateId()) {
      this.saveTemplateMetadata();
    }
  }

  onPageOrientationChange() {
    // Auto-save template metadata when orientation changes
    if (this.templateId()) {
      this.saveTemplateMetadata();
    }
  }

  // Folder Management
  loadFolders() {
    this.templateService.getRootFolders().subscribe({
      next: (folders) => {
        this.rootFolders.set(folders);
        this.folders.set(folders);
      },
      error: (err) => this.errorHandler.handleError(err, 'load_template_folders')
    });
  }

  selectFolder(folder: TemplateFolder | null) {
    this.selectedFolder.set(folder);
  }

  openFolderModal() {
    this.newFolderName.set('');
    this.showFolderModal.set(true);
  }

  createFolder() {
    if (!this.newFolderName().trim()) return;

    this.templateService.createFolder({
      name: this.newFolderName(),
      parentId: this.selectedFolder()?.id
    }).subscribe({
      next: (folder) => {
        this.loadFolders();
        this.selectedFolder.set(folder);
        this.showFolderModal.set(false);
        this.toastService.success('Folder Created', 'Template folder created successfully');
      },
      error: (err) => this.errorHandler.handleError(err, 'create_template_folder')
    });
  }

  // Page Management
  loadPages() {
    const id = this.templateId();
    if (!id) return;

    this.templateService.getAllPages(id).subscribe({
      next: (pages) => {
        this.pages.set(pages);
        if (pages.length > 0 && !this.activePage()) {
          this.selectPage(pages[0]);
        } else if (pages.length === 0 && this.isHtmlType()) {
          // Create a default page for HTML templates if none exist
          this.createDefaultPageForExistingTemplate();
        }
      },
      error: (err) => this.errorHandler.handleError(err, 'load_template_pages')
    });
  }

  createDefaultPageForExistingTemplate() {
    const id = this.templateId();
    if (!id) return;

    // Create a default page via API
    this.templateService.createPage(id, {
      name: 'Page 1',
      content: '<h1>Welcome to your template</h1>\n<p>Start editing your content here...</p>',
      pageOrder: 0
    }).subscribe({
      next: (page) => {
        this.pages.set([page]);
        this.selectPage(page);
        this.htmlContent.set(page.content);
      },
      error: (err) => {
        this.errorHandler.handleError(err, 'create_default_template_page');
        // Fallback: create a temporary page
        const now = new Date().toISOString();
        const defaultPage: TemplatePage = {
          id: Date.now(),
          name: 'Page 1',
          content: '<h1>Welcome to your template</h1>\n<p>Start editing your content here...</p>',
          pageOrder: 0,
          templateId: id,
          createdAt: now,
          updatedAt: now
        };
        this.pages.set([defaultPage]);
        this.selectPage(defaultPage);
        this.htmlContent.set(defaultPage.content);
      }
    });
  }

  createFirstPage() {
    // Automatically create a default page for new HTML templates
    const now = new Date().toISOString();
    const defaultPage: TemplatePage = {
      id: Date.now(), // Temporary ID
      name: 'Page 1',
      content: '<h1>Welcome to your template</h1>\n<p>Start editing your content here...</p>',
      pageOrder: 0,
      templateId: this.templateId() || 0,
      createdAt: now,
      updatedAt: now
    };

    this.pages.set([defaultPage]);
    this.selectPage(defaultPage);
    this.htmlContent.set(defaultPage.content);
  }

  openPageModal() {
    this.pageName.set(`Page ${this.pages().length + 1}`);
    this.pageContent.set('');
    this.editingPageId.set(null);
    this.showPageModal.set(true);
  }

  editPage(page: TemplatePage) {
    this.pageName.set(page.name);
    this.pageContent.set(page.content);
    this.editingPageId.set(page.id);
    this.showPageModal.set(true);
  }

  savePage() {
    if (!this.isPageFormValid()) return;
    
    const id = this.templateId();
    if (!id) {
      // If no template ID, we need to create the template first
      this.createTemplateWithPage();
      return;
    }

    this.saving.set(true);
    const request: TemplatePageRequest = {
      name: this.pageName(),
      content: this.pageContent()
    };

    const editingId = this.editingPageId();
    if (editingId) {
      this.templateService.updatePage(id, editingId, request).subscribe({
        next: (updatedPage) => {
          // Update the page in the local array instead of reloading
          const currentPages = this.pages();
          const index = currentPages.findIndex(p => p.id === editingId);
          if (index !== -1) {
            currentPages[index] = { ...currentPages[index], ...updatedPage };
            this.pages.set([...currentPages]);
          }
          this.showPageModal.set(false);
          this.saving.set(false);
          this.toastService.success('Page Updated', 'Template page updated successfully');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorHandler.handleError(err, 'update_template_page');
        }
      });
    } else {
      this.templateService.createPage(id, request).subscribe({
        next: (page) => {
          // Add the new page to the local array instead of reloading
          this.pages.set([...this.pages(), page]);
          this.showPageModal.set(false);
          this.selectPage(page);
          this.saving.set(false);
          this.toastService.success('Page Created', 'Template page created successfully');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorHandler.handleError(err, 'create_template_page');
        }
      });
    }
  }

  createTemplateWithPage() {
    // Create template first, then add the page
    const templateName = this.templateName() || 'New Template';

    // We need to call the template creation endpoint
    // For now, just store the page data and close modal
    // The page will be created when the template is saved
    const pageData = {
      name: this.pageName(),
      content: this.pageContent()
    };

    // Store in pages array temporarily
    const tempPage: TemplatePage = {
      id: Date.now(), // temporary ID
      templateId: 0,
      name: pageData.name,
      content: pageData.content || '',
      pageOrder: this.pages().length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.pages.set([...this.pages(), tempPage]);
    this.selectPage(tempPage);
    this.showPageModal.set(false);
  }

  selectPage(page: TemplatePage) {
    this.activePage.set(page);
    this.htmlContent.set(page.content);
    this.detectFreeMarkerVariables();

    // Close sidebar on mobile after selecting page
    if (window.innerWidth <= 768) {
      this.sidebarOpen.set(false);
    }
  }

  confirmDeletePage(page: TemplatePage) {
    this.deleteType.set('page');
    this.deleteId.set(page.id);
    this.deleteName.set(page.name);
    this.showDeleteModal.set(true);
  }

  movePage(page: TemplatePage, direction: 'up' | 'down') {
    const currentPages = this.pages();
    const index = currentPages.findIndex(p => p.id === page.id);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentPages.length - 1) return;

    const newPages = [...currentPages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];

    const pageIds = newPages.map(p => p.id);
    const id = this.templateId();
    if (!id) return;

    this.templateService.reorderPages(id, pageIds).subscribe({
      next: () => {
        this.loadPages();
        this.toastService.success('Pages Reordered', 'Template pages reordered successfully');
      },
      error: (err) => this.errorHandler.handleError(err, 'reorder_template_pages')
    });
  }

  // Attribute Management
  loadAttributes() {
    const id = this.templateId();
    if (!id) return;

    this.templateService.getAllAttributes(id).subscribe({
      next: (attrs) => this.attributes.set(attrs),
      error: (err) => this.errorHandler.handleError(err, 'load_template_attributes')
    });
  }

  openAttributeModal() {
    this.attributeKey.set('');
    this.attributeValue.set('');
    this.attributeType.set('STRING');
    this.attributeDescription.set('');
    this.editingAttributeId.set(null);
    this.showAttributeModal.set(true);
  }

  editAttribute(attr: TemplateAttribute) {
    this.attributeKey.set(attr.attributeKey);
    this.attributeValue.set(attr.attributeValue);
    this.attributeType.set(attr.attributeType);
    this.attributeDescription.set(attr.description || '');
    this.editingAttributeId.set(attr.id);
    this.showAttributeModal.set(true);
  }

  saveAttribute() {
    if (!this.isAttributeFormValid()) return;

    const id = this.templateId();
    if (!id) {
      // Store attribute temporarily until template is created
      this.storeAttributeTemporarily();
      return;
    }

    this.saving.set(true);
    const request: TemplateAttributeRequest = {
      attributeKey: this.attributeKey(),
      attributeValue: this.attributeValue(),
      attributeType: this.attributeType(),
      description: this.attributeDescription()
    };

    const editingId = this.editingAttributeId();
    if (editingId) {
      this.templateService.updateAttribute(id, editingId, request).subscribe({
        next: (updatedAttr) => {
          // Update the attribute in the local array instead of reloading
          const currentAttrs = this.attributes();
          const index = currentAttrs.findIndex(a => a.id === editingId);
          if (index !== -1) {
            currentAttrs[index] = { ...currentAttrs[index], ...updatedAttr };
            this.attributes.set([...currentAttrs]);
          }
          this.showAttributeModal.set(false);
          this.saving.set(false);
          this.toastService.success('Attribute Updated', 'Template attribute updated successfully');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorHandler.handleError(err, 'update_template_attribute');
        }
      });
    } else {
      this.templateService.createAttribute(id, request).subscribe({
        next: (newAttr) => {
          // Add the new attribute to the local array instead of reloading
          this.attributes.set([...this.attributes(), newAttr]);
          this.showAttributeModal.set(false);
          this.saving.set(false);
          this.toastService.success('Attribute Created', 'Template attribute created successfully');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorHandler.handleError(err, 'create_template_attribute');
        }
      });
    }
  }

  storeAttributeTemporarily() {
    const tempAttr: TemplateAttribute = {
      id: Date.now(),
      templateId: 0,
      attributeKey: this.attributeKey(),
      attributeValue: this.attributeValue(),
      attributeType: this.attributeType(),
      description: this.attributeDescription(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.attributes.set([...this.attributes(), tempAttr]);
    this.showAttributeModal.set(false);
  }

  confirmDeleteAttribute(attr: TemplateAttribute) {
    this.deleteType.set('attribute');
    this.deleteId.set(attr.id);
    this.deleteName.set(attr.attributeKey);
    this.showDeleteModal.set(true);
  }

  // Delete Confirmation
  confirmDelete() {
    const type = this.deleteType();
    const id = this.deleteId();
    const templateId = this.templateId();

    if (!type || !id || !templateId) return;

    if (type === 'page') {
      this.templateService.deletePage(templateId, id).subscribe({
        next: () => {
          // Remove the page from local array instead of reloading
          this.pages.set(this.pages().filter(p => p.id !== id));
          this.showDeleteModal.set(false);
          // Select first page if current page was deleted
          if (this.activePage()?.id === id && this.pages().length > 0) {
            this.selectPage(this.pages()[0]);
          }
          this.toastService.success('Page Deleted', 'Template page deleted successfully');
        },
        error: (err) => this.errorHandler.handleError(err, 'delete_template_page')
      });
    } else if (type === 'attribute') {
      this.templateService.deleteAttribute(templateId, id).subscribe({
        next: () => {
          // Remove the attribute from local array instead of reloading
          this.attributes.set(this.attributes().filter(a => a.id !== id));
          this.showDeleteModal.set(false);
          this.toastService.success('Attribute Deleted', 'Template attribute deleted successfully');
        },
        error: (err) => this.errorHandler.handleError(err, 'delete_template_attribute')
      });
    }
  }

  // Editor Functions
  onContentChange(content: string) {
    this.htmlContent.set(content);
    const page = this.activePage();
    if (page) {
      page.content = content;
    }
    this.detectFreeMarkerVariables();
  }

  // New event handlers for standalone components
  onEditorContentChange(event: ContentChangeEvent) {
    this.onContentChange(event.content);
  }

  onEditorTextSelection(event: TextSelectionEvent) {
    this.currentSelection.set(event.selectedText);
    this.selectionStart.set(event.selectionStart);
    this.selectionEnd.set(event.selectionEnd);
  }

  onEditorFreeMarkerInsert(event: FreeMarkerInsertEvent) {
    // The editor component handles the insertion internally
    // We just need to detect variables and update preview
    this.detectFreeMarkerVariables();
  }



  private handleFreeMarkerInsertInEditor(event: FreeMarkerInsertEvent) {
    const selectedText = this.currentSelection();
    const start = this.selectionStart();
    const end = this.selectionEnd();
    const currentContent = this.htmlContent();

    let newContent: string;

    if (event.wrapSelection && selectedText) {
      // Wrap selected text with FreeMarker syntax
      const lines = event.code.split('\n');

      if (event.type === 'if' || event.type === 'if-else') {
        const openTag = lines[0];
        const closeTag = lines[lines.length - 1];
        const wrapped = `${openTag}\n  ${selectedText}\n${closeTag}`;

        const before = currentContent.substring(0, start);
        const after = currentContent.substring(end);
        newContent = before + wrapped + after;
      } else if (event.type === 'for') {
        const openTag = lines[0];
        const closeTag = lines[lines.length - 1];
        const wrapped = `${openTag}\n  ${selectedText}\n${closeTag}`;

        const before = currentContent.substring(0, start);
        const after = currentContent.substring(end);
        newContent = before + wrapped + after;
      } else if (event.type === 'variable') {
        const before = currentContent.substring(0, start);
        const after = currentContent.substring(end);
        newContent = before + event.code + after;
      } else {
        const before = currentContent.substring(0, start);
        const after = currentContent.substring(end);
        newContent = before + event.code + after;
      }
    } else {
      // Insert at end of content
      newContent = currentContent + '\n' + event.code;
    }

    this.htmlContent.set(newContent);
    this.onContentChange(newContent);
    this.currentSelection.set('');
  }



  // FreeMarker Functions
  detectFreeMarkerVariables() {
    const content = this.htmlContent();
    const detected = this.freemarkerService.extractVariables(content);
    this.detectedVariables.set(detected);
  }

  saveTemplate() {
    const id = this.templateId();

    if (!id) {
      // Create new template
      this.createNewTemplate();
    } else {
      // Update existing template - save both template metadata and current page content
      this.saving.set(true);
      
      // First update the template metadata (name, orientation, etc.)
      const templateUpdate = {
        name: this.templateName(),
        type: this.templateType(),
        htmlContent: this.htmlContent() || '',
        cssStyles: '',
        subject: '',
        pageOrientation: this.pageOrientation(),
        folderId: this.selectedFolder()?.id
      };

      this.templateService.updateTemplate(id, templateUpdate, this.getCurrentAppName()).subscribe({
        next: () => {
          // Then update the current page content if there's an active page
          const page = this.activePage();
          if (page) {
            this.templateService.updatePage(id, page.id, {
              name: page.name,
              content: this.htmlContent()
            }).subscribe({
              next: () => {
                this.saving.set(false);
                this.toastService.success('Template Saved', 'Template saved successfully!');
              },
              error: (err) => {
                this.saving.set(false);
                this.errorHandler.handleError(err, 'save_template_page_content');
              }
            });
          } else {
            this.saving.set(false);
            this.toastService.success('Template Saved', 'Template saved successfully!');
          }
        },
        error: (err) => {
          this.saving.set(false);
          this.errorHandler.handleError(err, 'save_template');
        }
      });
    }
  }

  createNewTemplate() {
    if (!this.templateName().trim()) {
      this.toastService.error('Validation Error', 'Please enter a template name');
      return;
    }

    this.saving.set(true);

    const request: any = {
      name: this.templateName(),
      type: this.templateType(),
      htmlContent: this.htmlContent() || '',
      cssStyles: '',
      folderId: this.selectedFolder()?.id,
      pageOrientation: this.pageOrientation()
    };

    // Pass the current app name to associate the template with the app
    this.templateService.createTemplate(request, this.getCurrentAppName()).subscribe({
      next: (template) => {
        this.templateId.set(template.id);
        this.saving.set(false);

        // Now create pages and attributes if any
        const tempPages = this.pages();
        const tempAttrs = this.attributes();

        if (tempPages.length > 0 || tempAttrs.length > 0) {
          this.createPagesAndAttributesForTemplate(template.id, tempPages, tempAttrs);
        } else {
          this.toastService.success('Template Created', 'Template created successfully!');
          this.router.navigate(['/admin/template-editor', template.id]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.errorHandler.handleError(err, 'create_template');
      }
    });
  }

  createPagesAndAttributesForTemplate(templateId: number, tempPages: TemplatePage[], tempAttrs: TemplateAttribute[]) {
    let pagesCreated = 0;
    let attrsCreated = 0;
    const totalPages = tempPages.length;
    const totalAttrs = tempAttrs.length;

    // Create pages
    if (totalPages > 0) {
      tempPages.forEach((page, index) => {
        this.templateService.createPage(templateId, {
          name: page.name,
          content: page.content,
          pageOrder: index
        }).subscribe({
          next: () => {
            pagesCreated++;
            this.checkCreationComplete(templateId, pagesCreated, totalPages, attrsCreated, totalAttrs);
          },
          error: (err) => console.error('Error creating page:', err)
        });
      });
    }

    // Create attributes
    if (totalAttrs > 0) {
      tempAttrs.forEach((attr) => {
        this.templateService.createAttribute(templateId, {
          attributeKey: attr.attributeKey,
          attributeValue: attr.attributeValue,
          attributeType: attr.attributeType,
          description: attr.description
        }).subscribe({
          next: () => {
            attrsCreated++;
            this.checkCreationComplete(templateId, pagesCreated, totalPages, attrsCreated, totalAttrs);
          },
          error: (err) => console.error('Error creating attribute:', err)
        });
      });
    }
  }

  checkCreationComplete(templateId: number, pagesCreated: number, totalPages: number, attrsCreated: number, totalAttrs: number) {
    if (pagesCreated === totalPages && attrsCreated === totalAttrs) {
      this.toastService.success('Template Created', 'Template created successfully with all pages and attributes!');
      this.router.navigate(['/admin/template-editor', templateId]);
    }
  }

  loadTemplate() {
    // Load existing template data
    const id = this.templateId();
    if (id) {
      this.loading.set(true);

      // Try loading without appName first to avoid 403 issues
      this.templateService.getTemplate(id).subscribe({
        next: (template) => {
          this.templateName.set(template.name);
          this.templateType.set(template.type);
          this.pageOrientation.set(template.pageOrientation || PageOrientation.PORTRAIT);
          this.htmlContent.set(template.htmlContent || '');
          this.selectedFolder.set(template.folder || null);
          this.loading.set(false);
          this.loadPages();
          this.loadAttributes();
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Error loading template:', err);

          if (err.status === 403) {
            this.toastService.error('Access Denied', 'You do not have permission to access this template. It may belong to another organization.');
            this.router.navigate(['/admin/templates']);
          } else if (err.status === 404) {
            this.toastService.error('Template Not Found', 'Template not found. It may have been deleted.');
            this.router.navigate(['/admin/templates']);
          } else {
            this.errorHandler.handleError(err, 'load_template');
          }
        }
      });
    }
  }

  closeModal(modalName: string) {
    switch (modalName) {
      case 'type':
        this.showTypeModal.set(false);
        break;
      case 'folder':
        this.showFolderModal.set(false);
        break;
      case 'page':
        this.showPageModal.set(false);
        break;
      case 'attribute':
        this.showAttributeModal.set(false);
        break;
      case 'delete':
        this.showDeleteModal.set(false);
        break;
    }
  }

  toggleSidebar() {
    console.log('Toggle clicked, current state:', this.sidebarOpen());
    const newState = !this.sidebarOpen();
    this.sidebarOpen.set(newState);
    console.log('New state:', this.sidebarOpen());

    // Manually toggle the class as a workaround
    const sidebar = document.querySelector('.editor-sidebar');
    if (sidebar) {
      if (newState) {
        sidebar.classList.add('open');
      } else {
        sidebar.classList.remove('open');
      }
      console.log('Sidebar classes after manual toggle:', sidebar.classList);
    }
  }

  setupSidebarClickOutside() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const sidebar = document.querySelector('.editor-sidebar');
      const toggleBtn = document.querySelector('.sidebar-toggle');

      // Only handle on mobile (when toggle button is visible)
      if (window.innerWidth <= 768 && this.sidebarOpen()) {
        if (sidebar && !sidebar.contains(target) && toggleBtn && !toggleBtn.contains(target)) {
          this.sidebarOpen.set(false);
        }
      }
    });
  }

  setupDropdownClickOutside() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const dropdown = document.querySelector('.btn-dropdown');

      if (this.showPdfOptions && dropdown && !dropdown.contains(target)) {
        this.showPdfOptions = false;
      }
    });
  }

  // Variables Panel Methods
  toggleVariablesPanel() {
    this.showVariablesPanel.set(!this.showVariablesPanel());
  }

  closeVariablesPanel() {
    this.showVariablesPanel.set(false);
  }

  // Help Panel Methods
  closeHelp() {
    this.showHelp = false;
  }

  // Page Navigation Methods
  getCurrentPageIndex(): number {
    const currentPage = this.activePage();
    if (!currentPage || this.pages().length === 0) return 0;
    const index = this.pages().findIndex(page => page.id === currentPage.id);
    return index >= 0 ? index : 0;
  }

  goToPreviousPage() {
    const currentIndex = this.getCurrentPageIndex();
    if (currentIndex > 0) {
      this.selectPage(this.pages()[currentIndex - 1]);
    }
  }

  goToNextPage() {
    const currentIndex = this.getCurrentPageIndex();
    if (currentIndex < this.pages().length - 1) {
      this.selectPage(this.pages()[currentIndex + 1]);
    }
  }

  // Save only template metadata (name, orientation, etc.) without updating pages
  saveTemplateMetadata() {
    const id = this.templateId();
    if (!id) {
      this.toastService.warning('Template Not Saved', 'Please save the template first');
      return;
    }

    this.saving.set(true);
    
    const templateUpdate = {
      name: this.templateName(),
      type: this.templateType(),
      htmlContent: this.htmlContent() || '',
      cssStyles: '',
      subject: '',
      pageOrientation: this.pageOrientation(),
      folderId: this.selectedFolder()?.id
    };

    this.templateService.updateTemplate(id, templateUpdate, this.getCurrentAppName()).subscribe({
      next: () => {
        this.saving.set(false);
        console.log('Template metadata saved successfully');
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Error saving template metadata:', err);
      }
    });
  }

  // Export Methods
  exportToPdf() {
    const id = this.templateId();
    if (!id) {
      this.toastService.warning('Template Not Saved', 'Please save the template first');
      return;
    }

    // Open parameters dialog
    this.openPdfParametersDialog();
  }

  // Open PDF Parameters Dialog
  openPdfParametersDialog() {
    this.showPdfParametersDialog.set(true);
  }

  // Close PDF Parameters Dialog
  closePdfParametersDialog() {
    this.showPdfParametersDialog.set(false);
  }

  // Handle PDF generation from dialog
  onGeneratePdf(parameters: { [key: string]: any }) {
    const id = this.templateId();
    if (!id) return;

    this.closePdfParametersDialog();
    this.pdfExporting.set(true);

    const request = {
      parameters: parameters,
      pageNumber: undefined
    };

    this.templateService.exportToPdf(id, request).subscribe({
      next: (blob) => {
        this.pdfExporting.set(false);
        this.openPdfInNewTab(blob, `${this.templateName()}.pdf`);
      },
      error: (err) => {
        this.pdfExporting.set(false);
        this.errorHandler.handleError(err, 'export_template_pdf_with_parameters');
      }
    });
  }

  // Handle skip parameters from dialog
  onSkipParameters() {
    const id = this.templateId();
    if (!id) return;

    this.closePdfParametersDialog();
    this.pdfExporting.set(true);

    const request = {
      parameters: {}, // Empty parameters
      pageNumber: undefined
    };

    this.templateService.exportToPdf(id, request).subscribe({
      next: (blob) => {
        this.pdfExporting.set(false);
        this.openPdfInNewTab(blob, `${this.templateName()}.pdf`);
      },
      error: (err) => {
        this.pdfExporting.set(false);
        this.errorHandler.handleError(err, 'export_template_pdf_skip_parameters');
      }
    });
  }

  downloadPdf() {
    const id = this.templateId();
    if (!id) {
      this.toastService.warning('Template Not Saved', 'Please save the template first');
      return;
    }

    // Set loading state
    this.pdfExporting.set(true);

    // Prepare parameters from attributes
    const parameters: { [key: string]: any } = {};
    this.attributes().forEach(attr => {
      parameters[attr.attributeKey] = attr.attributeValue || '';
    });

    const request = {
      parameters: parameters,
      pageNumber: undefined // Export all pages
    };

    this.templateService.exportToPdf(id, request).subscribe({
      next: (blob) => {
        this.pdfExporting.set(false);
        this.downloadFile(blob, `${this.templateName()}.pdf`, 'application/pdf');
      },
      error: (err) => {
        this.pdfExporting.set(false);
        this.errorHandler.handleError(err, 'download_template_pdf');
      }
    });
  }

  exportToWord() {
    const id = this.templateId();
    if (!id) {
      this.toastService.warning('Template Not Saved', 'Please save the template first');
      return;
    }

    // Prepare parameters from attributes
    const parameters: { [key: string]: any } = {};
    this.attributes().forEach(attr => {
      parameters[attr.attributeKey] = attr.attributeValue || '';
    });

    const request = {
      parameters: parameters
    };

    this.templateService.exportToWord(id, request).subscribe({
      next: (blob) => {
        this.downloadFile(blob, `${this.templateName()}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      },
      error: (err) => {
        this.errorHandler.handleError(err, 'export_template_word');
      }
    });
  }

  private downloadFile(blob: Blob, filename: string, mimeType: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private openPdfInNewTab(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const newTab = window.open(url, '_blank');
    
    if (newTab) {
      // Set the document title for the new tab
      newTab.document.title = filename;
      
      // Clean up the URL after a delay to allow the PDF to load
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } else {
      // Fallback: if popup is blocked, download the file instead
      console.warn('Popup blocked, falling back to download');
      this.downloadFile(blob, filename, 'application/pdf');
    }
  }
}

import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FreeMarkerToolbarComponent, FreeMarkerInsertEvent } from '../../freemarker-toolbar/freemarker-toolbar.component';
import { FreeMarkerVariable } from '../../../../core/services/freemarker.service';
import { TemplateAttribute } from '../../../../core/models/template.model';

export interface PreviewSelectionEvent {
  selectedText: string;
  selectionStart: number;
  selectionEnd: number;
}

@Component({
  selector: 'app-live-preview',
  standalone: true,
  imports: [CommonModule, FreeMarkerToolbarComponent],
  template: `
    <div class="live-preview-container">
      <!-- FreeMarker Toolbar for Preview -->
      <app-freemarker-toolbar 
        [availableVariables]="availableVariables"
        [selectedText]="currentSelection"
        (insertCode)="handleFreeMarkerInsert($event)">
      </app-freemarker-toolbar>
      
      <!-- Preview Controls -->
      <div class="preview-controls">
        <div class="preview-actions">
          <button class="btn btn-sm btn-outline" (click)="refreshPreview()" title="Refresh Preview">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
          
          <button class="btn btn-sm btn-outline" (click)="toggleDeviceView()" title="Toggle Device View">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (deviceView === 'desktop') {
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke-width="2"/>
                <line x1="8" y1="21" x2="16" y2="21" stroke-width="2"/>
                <line x1="12" y1="17" x2="12" y2="21" stroke-width="2"/>
              } @else if (deviceView === 'tablet') {
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2" stroke-width="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2"/>
              } @else {
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke-width="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2"/>
              }
            </svg>
            {{ deviceView | titlecase }}
          </button>
          
          <button class="btn btn-sm btn-outline" (click)="exportPreview()" title="Export Preview">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Export
          </button>
        </div>
        
        <div class="preview-info">
          <span class="preview-status" [class.processing]="isProcessing">
            @if (isProcessing) {
              <span class="spinner-sm"></span>
              Processing...
            } @else {
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              Ready
            }
          </span>
        </div>
      </div>
      
      <!-- Preview Area -->
      <div class="preview-scroll-container" [class]="'device-' + deviceView">
        <div class="preview-frame-wrapper">
          <iframe #previewFrame 
                  class="preview-iframe"
                  [class]="'device-' + deviceView"
                  (load)="onPreviewFrameLoad()"
                  sandbox="allow-same-origin allow-scripts"></iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .live-preview-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--background, #f8fafc);
    }

    .preview-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--surface, #ffffff);
      border-bottom: 1px solid var(--border, #e2e8f0);
      gap: 1rem;
    }

    .preview-actions {
      display: flex;
      gap: 0.5rem;
    }

    .preview-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .preview-status {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      color: var(--success, #10b981);
      font-weight: 500;
    }

    .preview-status.processing {
      color: var(--warning, #f59e0b);
    }

    .preview-scroll-container {
      flex: 1;
      overflow: auto;
      padding: 1rem;
      background: var(--background, #f8fafc);
    }

    .preview-frame-wrapper {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100%;
    }

    .preview-iframe {
      width: 100%;
      height: 600px;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    /* Device Views */
    .device-desktop .preview-iframe {
      width: 100%;
      max-width: 1200px;
      height: 700px;
    }

    .device-tablet .preview-iframe {
      width: 768px;
      height: 1024px;
      max-width: 90vw;
    }

    .device-mobile .preview-iframe {
      width: 375px;
      height: 667px;
      max-width: 90vw;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 6px;
      background: var(--surface, #ffffff);
      color: var(--text, #374151);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }

    .btn:hover {
      background: var(--surface-hover, #f9fafb);
      border-color: var(--primary, #3b82f6);
    }

    .btn-sm {
      padding: 0.375rem 0.625rem;
      font-size: 0.8125rem;
    }

    .btn-outline {
      background: transparent;
    }

    .spinner-sm {
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Dark mode support */
    [data-theme="dark"] .preview-controls {
      background: var(--surface, #1f2937);
      border-color: var(--border, #374151);
    }

    [data-theme="dark"] .preview-scroll-container {
      background: var(--background, #111827);
    }

    [data-theme="dark"] .preview-iframe {
      border-color: var(--border, #374151);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .preview-controls {
        flex-direction: column;
        gap: 0.75rem;
        align-items: stretch;
      }

      .preview-actions {
        justify-content: center;
      }

      .device-tablet .preview-iframe,
      .device-mobile .preview-iframe {
        width: 100%;
        max-width: none;
      }
    }
  `]
})
export class LivePreviewComponent implements OnInit, OnChanges {
  @Input() htmlContent = '';
  @Input() attributes: TemplateAttribute[] = [];
  @Input() availableVariables: FreeMarkerVariable[] = [];
  @Input() autoRefresh = true;

  @Output() selectionChange = new EventEmitter<PreviewSelectionEvent>();
  @Output() freemarkerInsert = new EventEmitter<FreeMarkerInsertEvent>();
  @Output() exportRequest = new EventEmitter<string>();

  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;

  currentSelection = signal('');
  selectionStart = 0;
  selectionEnd = 0;
  deviceView: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  isProcessing = false;
  processedHtml = '';

  ngOnInit() {
    // Initial preview update
    this.updatePreview();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['htmlContent'] || changes['attributes']) {
      if (this.autoRefresh) {
        this.updatePreview();
      }
    }
  }

  updatePreview() {
    this.isProcessing = true;
    
    // Small delay to show processing state
    setTimeout(() => {
      this.processContent();
      this.renderPreview();
      this.isProcessing = false;
    }, 100);
  }

  private processContent() {
    let html = this.htmlContent;
    
    // Process FreeMarker variables - replace with actual values
    html = html.replace(/\$\{([^}]+)\}/g, (_match, varName) => {
      const attr = this.attributes.find(a => a.attributeKey === varName.trim());
      const value = attr?.attributeValue || `[${varName}]`;
      return `<span class="fm-variable" title="Variable: ${varName}" data-variable="${varName}">${value}</span>`;
    });
    
    // Highlight FreeMarker tags
    html = html.replace(/(<#[^>]+>)/g, '<span class="fm-tag">$1</span>');
    html = html.replace(/(<\/#[^>]+>)/g, '<span class="fm-tag">$1</span>');
    
    // Highlight FreeMarker comments
    html = html.replace(/(<#--[\s\S]*?-->)/g, '<span class="fm-comment">$1</span>');
    
    this.processedHtml = html;
  }

  private renderPreview() {
    const iframe = this.previewFrame?.nativeElement;
    if (!iframe || !iframe.contentWindow) return;

    // Create a complete HTML document with proper styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
          }
          .preview-content {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .fm-variable {
            background: #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid #fbbf24;
            cursor: help;
            font-weight: 500;
            color: #92400e;
          }
          .fm-tag {
            color: #8b5cf6;
            font-weight: 600;
            background: #f3e8ff;
            padding: 1px 4px;
            border-radius: 3px;
          }
          .fm-comment {
            color: #6b7280;
            font-style: italic;
            background: #f3f4f6;
            padding: 1px 4px;
            border-radius: 3px;
          }
          * {
            box-sizing: border-box;
          }
          
          /* Responsive adjustments based on device view */
          @media (max-width: 768px) {
            body {
              padding: 1rem;
            }
            .preview-content {
              padding: 1rem;
            }
          }
          
          /* Print styles */
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .preview-content {
              box-shadow: none;
              padding: 0;
            }
            .fm-variable,
            .fm-tag,
            .fm-comment {
              background: transparent !important;
              border: none !important;
              color: inherit !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="preview-content">
          ${this.processedHtml}
        </div>
        
        <script>
          // Handle text selection for FreeMarker insertion
          document.addEventListener('mouseup', function() {
            const selection = window.getSelection();
            if (selection && selection.toString().trim()) {
              const selectedText = selection.toString();
              const range = selection.getRangeAt(0);
              
              // Send selection to parent
              window.parent.postMessage({
                type: 'textSelection',
                selectedText: selectedText,
                selectionStart: range.startOffset,
                selectionEnd: range.endOffset
              }, '*');
            }
          });
          
          // Handle variable clicks
          document.addEventListener('click', function(e) {
            if (e.target.classList.contains('fm-variable')) {
              const varName = e.target.getAttribute('data-variable');
              window.parent.postMessage({
                type: 'variableClick',
                variableName: varName
              }, '*');
            }
          });
        </script>
      </body>
      </html>
    `;
    
    // Write to iframe
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(fullHtml);
    doc.close();
  }

  onPreviewFrameLoad() {
    // Update preview when iframe loads
    this.updatePreview();
    
    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data.type === 'textSelection') {
        this.currentSelection.set(event.data.selectedText);
        this.selectionStart = event.data.selectionStart;
        this.selectionEnd = event.data.selectionEnd;
        
        this.selectionChange.emit({
          selectedText: event.data.selectedText,
          selectionStart: event.data.selectionStart,
          selectionEnd: event.data.selectionEnd
        });
      } else if (event.data.type === 'variableClick') {
        // Handle variable click - could show variable editor
        console.log('Variable clicked:', event.data.variableName);
      }
    });
  }

  handleFreeMarkerInsert(event: FreeMarkerInsertEvent) {
    // Emit the insert event for parent component to handle
    this.freemarkerInsert.emit(event);
  }

  refreshPreview() {
    this.updatePreview();
  }

  toggleDeviceView() {
    const views: Array<'desktop' | 'tablet' | 'mobile'> = ['desktop', 'tablet', 'mobile'];
    const currentIndex = views.indexOf(this.deviceView);
    const nextIndex = (currentIndex + 1) % views.length;
    this.deviceView = views[nextIndex];
  }

  exportPreview() {
    // Create exportable HTML without FreeMarker highlighting
    let exportHtml = this.htmlContent;
    
    // Replace variables with actual values for export
    exportHtml = exportHtml.replace(/\$\{([^}]+)\}/g, (_match, varName) => {
      const attr = this.attributes.find(a => a.attributeKey === varName.trim());
      return attr?.attributeValue || `[${varName}]`;
    });
    
    const fullExportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Template Preview Export</title>
        <style>
          body {
            margin: 0;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
          }
          .content {
            max-width: 800px;
            margin: 0 auto;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="content">
          ${exportHtml}
        </div>
      </body>
      </html>
    `;
    
    this.exportRequest.emit(fullExportHtml);
  }

  // Public methods for parent component
  getProcessedHtml(): string {
    return this.processedHtml;
  }

  setDeviceView(view: 'desktop' | 'tablet' | 'mobile') {
    this.deviceView = view;
  }

  getCurrentSelection(): { text: string; start: number; end: number } {
    return {
      text: this.currentSelection(),
      start: this.selectionStart,
      end: this.selectionEnd
    };
  }
}
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FreeMarkerToolbarComponent, FreeMarkerInsertEvent } from '../../freemarker-toolbar/freemarker-toolbar.component';
import { RichTextToolbarComponent, RichTextInsertEvent } from '../../rich-text-toolbar/rich-text-toolbar.component';
import { FreeMarkerVariable } from '../../../../core/services/freemarker.service';

export interface ContentChangeEvent {
  content: string;
  selectionStart?: number;
  selectionEnd?: number;
}

export interface TextSelectionEvent {
  selectedText: string;
  selectionStart: number;
  selectionEnd: number;
}

@Component({
  selector: 'app-editor-content',
  standalone: true,
  imports: [CommonModule, FormsModule, FreeMarkerToolbarComponent, RichTextToolbarComponent],
  template: `
    <div class="editor-content-container">
      <!-- Ribbon Toolbar Container -->
      <div class="ribbon-container">
        <div class="ribbon-scroll-area">
          <!-- Rich Text Group -->
          <div class="ribbon-group">
            <app-rich-text-toolbar
              [selectedText]="currentSelection"
              (insertHtml)="handleRichTextInsert($event)">
            </app-rich-text-toolbar>
          </div>

          <!-- Divider -->
          <div class="ribbon-divider"></div>

          <!-- FreeMarker Group -->
          <div class="ribbon-group">
            <app-freemarker-toolbar 
              [availableVariables]="availableVariables"
              [selectedText]="currentSelection"
              (insertCode)="handleFreeMarkerInsert($event)">
            </app-freemarker-toolbar>
          </div>
          
          <!-- View Mode Specific Controls -->
          @if (viewMode() === 'view') {
             <div class="ribbon-divider"></div>
             
             <!-- Device Toggles Group -->
             <div class="ribbon-group device-toggles">
               <button class="ribbon-btn" 
                       [class.active]="previewDevice() === 'desktop'"
                       (click)="setPreviewDevice('desktop')"
                       title="Desktop View">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
               </button>
               <button class="ribbon-btn" 
                       [class.active]="previewDevice() === 'tablet'"
                       (click)="setPreviewDevice('tablet')"
                       title="Tablet View">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
               </button>
               <button class="ribbon-btn" 
                       [class.active]="previewDevice() === 'mobile'"
                       (click)="setPreviewDevice('mobile')"
                       title="Mobile View">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
               </button>
             </div>
          }
          
           <!-- Spacer to push View Toggle to right -->
           <div class="ribbon-spacer"></div>

          <!-- View Mode Toggle -->
           <div class="ribbon-group view-toggle-group">
              <button class="toggle-btn" 
                      [class.active]="viewMode() === 'view'"
                      (click)="toggleViewMode()"
                      [title]="viewMode() === 'code' ? 'Switch to Preview HTML' : 'Switch to Source Code'">
                @if (viewMode() === 'code') {
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <span class="btn-label">Preview</span>
                } @else {
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l8 0M6 16l-4 0M14 4l-4 0M10 20l-4 0"/>
                  </svg>
                  <span class="btn-label">Code</span>
                }
              </button>
           </div>
        </div>
      </div>
      
      <!-- Editor Area -->
      <div class="editor-area" [class.visual-mode]="viewMode() === 'view'">
        @if (viewMode() === 'code') {
          @if (editorType === 'text') {
            <textarea #textEditor
                      class="txt-editor" 
                      [(ngModel)]="content"
                      (ngModelChange)="onContentChange($event)"
                      (mouseup)="onTextSelect()"
                      (keyup)="onTextSelect()"
                      [placeholder]="placeholder"></textarea>
          } @else {
            <textarea #htmlEditor
                      class="html-textarea" 
                      [(ngModel)]="content"
                      (ngModelChange)="onContentChange($event)"
                      (mouseup)="onTextSelect()"
                      (keyup)="onTextSelect()"
                      [placeholder]="placeholder"></textarea>
          }
        } @else {
          <!-- Preview Mode (Visual Editor) - Using Sandboxed Iframe -->
          <div class="preview-container">
             <iframe #previewFrame
                     class="preview-iframe" 
                     [class.device-desktop]="previewDevice() === 'desktop'"
                     [class.device-tablet]="previewDevice() === 'tablet'"
                     [class.device-mobile]="previewDevice() === 'mobile'"
                     sandbox="allow-same-origin allow-scripts"
                     (load)="onIframeLoad()"></iframe>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .editor-content-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface);
      position: relative;
    }

    /* Ribbon Container */
    .ribbon-container {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
    }

    .ribbon-scroll-area {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--border) transparent;
      white-space: nowrap; /* Prevent wrapping */
    }
    
    .ribbon-scroll-area::-webkit-scrollbar {
        height: 4px;
    }
    
    .ribbon-scroll-area::-webkit-scrollbar-thumb {
        background: var(--border);
        border-radius: 2px;
    }

    .ribbon-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
    }

    .ribbon-divider {
      width: 1px;
      height: 24px;
      background: var(--border);
      margin: 0 0.5rem;
      flex-shrink: 0;
      opacity: 0.6;
    }
    
    .ribbon-spacer {
       flex: 1;
       min-width: 1rem;
    }

    /* Standard Ribbon Button (used for devices etc) */
    .ribbon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
    }

    .ribbon-btn:hover {
      background: var(--surface-hover);
      color: var(--primary);
      transform: translateY(-1px);
    }
    
    .ribbon-btn.active {
      background: var(--primary-light, #e0e7ff);
      color: var(--primary);
      box-shadow: inset 0 0 0 1px rgba(var(--primary-rgb), 0.2);
    }

    /* View Mode Toggle */
    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      height: 36px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.8125rem;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .toggle-btn:hover {
      background: var(--surface-hover);
      border-color: var(--primary);
      color: var(--primary);
    }
    
    .toggle-btn.active {
       background: var(--primary);
       color: white;
       border-color: var(--primary);
       box-shadow: 0 4px 6px -1px rgba(var(--primary-rgb), 0.3);
    }

    .editor-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }

    .editor-area.visual-mode {
       background: #f3f4f6; /* Gray background for visual mode to contrast with device */
    }

    [data-theme="dark"] .editor-area.visual-mode {
       background: #111827;
    }

    .txt-editor,
    .html-textarea {
      flex: 1;
      width: 100%;
      padding: 2rem; /* More padding for editor */
      border: none;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
      background: var(--surface);
      color: var(--text);
      resize: none;
      outline: none;
      overflow-y: auto;
    }

    .preview-container {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      display: flex;
      justify-content: center; /* Center device */
      align-items: flex-start;
    }

    .preview-iframe {
      flex: 1; /* Default to full width for desktop if class not override */
      min-height: 500px;
      height: 100%;
      background: white;
      border: none;
      outline: none;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother transition */
    }

    /* Device Simulations for Iframe */
    .preview-iframe.device-desktop {
      width: 100%;
      max-width: 100%;
    }

    .preview-iframe.device-tablet {
      width: 768px;
      height: 1024px;
      flex: none; /* Disable flex growth */
      border: 8px solid #2d3748; /* Tablet Bezel */
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .preview-iframe.device-mobile {
      width: 375px;
      height: 667px;
      flex: none;
      border: 8px solid #1a202c; /* Phone Bezel */
      border-radius: 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    [data-theme="dark"] .preview-iframe {
      background: #1e1e1e;
    }
    
    [data-theme="dark"] .preview-iframe.device-tablet,
    [data-theme="dark"] .preview-iframe.device-mobile {
       border-color: #4b5563; /* Lighter bezel in dark mode */
    }

    .txt-editor::placeholder,
    .html-textarea::placeholder {
      color: var(--text-muted);
    }

    /* Responsive Media Queries */
    @media (max-width: 992px) {
       .ribbon-scroll-area {
          padding: 0.5rem;
       }
    }

    @media (max-width: 600px) {
        .btn-label {
          display: none; /* Hide toggle label on mobile */
        }
        .toggle-btn {
           padding: 0.5rem;
        }
    }
  `]
})
export class EditorContentComponent implements OnInit, OnChanges {
  @Input() content = '';
  @Input() editorType: 'text' | 'html' = 'html';
  @Input() placeholder = '';
  @Input() availableVariables: FreeMarkerVariable[] = [];

  @Output() contentChange = new EventEmitter<ContentChangeEvent>();
  @Output() textSelection = new EventEmitter<TextSelectionEvent>();
  @Output() freemarkerInsert = new EventEmitter<FreeMarkerInsertEvent>();

  @ViewChild('textEditor') textEditor?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('htmlEditor') htmlEditor?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;

  private sanitizer = inject(DomSanitizer);

  currentSelection = signal('');
  selectionStart = 0;
  selectionEnd = 0;

  // Store the actual range for View mode
  private savedRange: Range | null = null;

  viewMode = signal<'code' | 'view'>('code');
  previewDevice = signal<'desktop' | 'tablet' | 'mobile'>('desktop');

  ngOnInit() {
    // Set default placeholder based on editor type
    if (!this.placeholder) {
      this.placeholder = this.editorType === 'text'
        ? 'Enter your text content here...'
        : '<h1>Your HTML content here...</h1>';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content'] && !changes['content'].firstChange) {
      // Content changed from parent, update editor
      this.updateEditorContent();

      // If in view mode, also update the iframe if it differs
      if (this.viewMode() === 'view' && this.previewFrame) {
        this.updateIframeContent();
      }
    }
  }

  toggleViewMode() {
    this.viewMode.update(mode => {
      const newMode = mode === 'code' ? 'view' : 'code';

      if (newMode === 'view') {
        // Switching TO view mode: sync content to iframe
        // Need to wait for view to render
        setTimeout(() => {
          this.updateIframeContent();
        }, 0);
      } else {
        // Switching FROM view mode: Ensure savedRange is cleared
        this.savedRange = null;
      }

      return newMode;
    });
  }

  onIframeLoad() {
    // Initialize iframe content when it loads
    if (this.viewMode() === 'view') {
      this.updateIframeContent();
    }
  }

  private updateIframeContent() {
    if (!this.previewFrame) return;
    
    const iframe = this.previewFrame.nativeElement;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) return;

    // Check if content already has full HTML structure
    const hasHtmlTag = /<html[^>]*>/i.test(this.content);
    const hasBodyTag = /<body[^>]*>/i.test(this.content);
    
    let htmlContent: string;
    
    if (hasHtmlTag || hasBodyTag) {
      // Content already has structure, ensure it's complete and add contenteditable
      htmlContent = this.ensureCompleteHtmlWithEditable(this.content);
    } else {
      // Content is just body content, wrap it in our sandboxed HTML
      htmlContent = this.createSandboxedHtml(this.content);
    }
    
    // Write the content to the iframe
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Set up event listeners for editing
    this.setupIframeEventListeners(iframeDoc);
  }

  private createSandboxedHtml(content: string): string {
    // Check if content already has html/body tags
    const hasHtmlTag = /<html[^>]*>/i.test(content);
    const hasBodyTag = /<body[^>]*>/i.test(content);
    
    if (hasHtmlTag || hasBodyTag) {
      // Content already has structure, use as-is but ensure it's complete
      return this.ensureCompleteHtml(content);
    }
    
    // Wrap content in a complete HTML document with aggressive style isolation
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Preview</title>
    <style>
        /* CSS Reset to prevent style inheritance */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* Prevent any external styles from affecting content */
        html, body {
            all: initial;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            line-height: 1.6 !important;
            color: #333 !important;
            margin: 2rem !important;
            background: white !important;
            font-size: 16px !important;
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
        }
        
        /* Ensure contenteditable styling */
        body[contenteditable="true"] {
            outline: none !important;
            border: none !important;
            min-height: 200px !important;
        }
        
        /* Typography with !important to override any external styles */
        h1, h2, h3, h4, h5, h6 {
            font-weight: bold !important;
            margin: 1em 0 0.5em 0 !important;
            line-height: 1.2 !important;
            color: inherit !important;
        }
        
        h1 { font-size: 2em !important; }
        h2 { font-size: 1.5em !important; }
        h3 { font-size: 1.17em !important; }
        h4 { font-size: 1em !important; }
        h5 { font-size: 0.83em !important; }
        h6 { font-size: 0.67em !important; }
        
        p { 
            margin: 1em 0 !important; 
            line-height: inherit !important;
            color: inherit !important;
        }
        
        ul, ol { 
            margin: 1em 0 !important; 
            padding-left: 2em !important; 
            color: inherit !important;
        }
        
        li { 
            margin: 0.5em 0 !important; 
            color: inherit !important;
        }
        
        blockquote {
            margin: 1em 0 !important;
            padding: 0.5em 1em !important;
            border-left: 4px solid #ddd !important;
            background: #f9f9f9 !important;
            font-style: italic !important;
            color: inherit !important;
        }
        
        code {
            background: #f1f1f1 !important;
            padding: 0.2em 0.4em !important;
            border-radius: 3px !important;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            font-size: 0.9em !important;
            color: #c7254e !important;
        }
        
        pre {
            background: #f1f1f1 !important;
            padding: 1em !important;
            border-radius: 6px !important;
            overflow-x: auto !important;
            margin: 1em 0 !important;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
            color: inherit !important;
        }
        
        pre code {
            background: none !important;
            padding: 0 !important;
            color: inherit !important;
        }
        
        a {
            color: #0066cc !important;
            text-decoration: underline !important;
        }
        
        a:hover {
            color: #0052a3 !important;
        }
        
        img {
            max-width: 100% !important;
            height: auto !important;
            margin: 1em 0 !important;
        }
        
        table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin: 1em 0 !important;
            color: inherit !important;
        }
        
        th, td {
            border: 1px solid #ddd !important;
            padding: 0.5em !important;
            text-align: left !important;
            color: inherit !important;
        }
        
        th {
            background: #f5f5f5 !important;
            font-weight: bold !important;
        }
        
        hr {
            border: none !important;
            border-top: 1px solid #ddd !important;
            margin: 2em 0 !important;
        }
        
        /* Text formatting */
        strong, b { font-weight: bold !important; color: inherit !important; }
        em, i { font-style: italic !important; color: inherit !important; }
        u { text-decoration: underline !important; color: inherit !important; }
        s, strike { text-decoration: line-through !important; color: inherit !important; }
        
        /* Mobile responsive adjustments */
        @media (max-width: 480px) {
            body { 
                margin: 1rem !important; 
                font-size: 14px !important; 
            }
            h1 { font-size: 1.8em !important; }
            h2 { font-size: 1.4em !important; }
            h3 { font-size: 1.2em !important; }
            table { font-size: 12px !important; }
            th, td { padding: 0.3em !important; }
        }
        
        /* Prevent any external CSS from interfering */
        body * {
            font-family: inherit !important;
        }
    </style>
</head>
<body contenteditable="true">
${content || '<p>No content</p>'}
</body>
</html>`;
  }

  private ensureCompleteHtml(content: string): string {
    // If content has html/body tags, ensure it's a complete document
    if (!content.includes('<!DOCTYPE')) {
      content = '<!DOCTYPE html>\n' + content;
    }
    
    if (!content.includes('<html')) {
      content = '<html>\n' + content + '\n</html>';
    }
    
    return content;
  }

  private ensureCompleteHtmlWithEditable(content: string): string {
    // Ensure complete HTML structure
    let htmlContent = this.ensureCompleteHtml(content);
    
    // Add contenteditable to body if not present
    if (!htmlContent.includes('contenteditable')) {
      htmlContent = htmlContent.replace(/<body([^>]*)>/i, '<body$1 contenteditable="true">');
    }
    
    // If no body tag exists, add it
    if (!htmlContent.includes('<body')) {
      htmlContent = htmlContent.replace('</html>', '<body contenteditable="true">' + content + '</body></html>');
    }
    
    return htmlContent;
  }

  private setupIframeEventListeners(iframeDoc: Document) {
    // Set up input event listener for content changes
    iframeDoc.body.addEventListener('input', (event) => {
      const newContent = this.extractContentFromIframe(iframeDoc);
      if (this.content !== newContent) {
        this.content = newContent;
        this.onContentChange(newContent);
      }
    });

    // Set up selection event listeners
    iframeDoc.addEventListener('mouseup', () => this.handleIframeSelection(iframeDoc));
    iframeDoc.addEventListener('keyup', () => this.handleIframeSelection(iframeDoc));
  }

  private handleIframeSelection(iframeDoc: Document) {
    const selection = iframeDoc.getSelection();
    if (selection && selection.rangeCount > 0) {
      const text = selection.toString();
      this.currentSelection.set(text);
      
      if (text.trim()) {
        // Save the range for later use
        this.savedRange = selection.getRangeAt(0).cloneRange();
      }
    } else {
      this.currentSelection.set('');
      this.savedRange = null;
    }
  }

  setPreviewDevice(device: 'desktop' | 'tablet' | 'mobile') {
    this.previewDevice.set(device);
  }

  sanitizedContent(): SafeHtml {
    // Used only for initial if needed, but now we use Manual population
    return this.sanitizer.bypassSecurityTrustHtml(this.content || '<p>No content</p>');
  }

  onPreviewInput(event: Event) {
    const target = event.target as HTMLElement;
    const newContent = target.innerHTML;

    // Update local content signal ONLY, do not touch DOM
    if (this.content !== newContent) {
      this.content = newContent;
      this.onContentChange(newContent);
    }
  }

  private updateEditorContent() {
    const editor = this.getActiveEditor();
    if (editor && editor.value !== this.content) {
      const cursorPos = editor.selectionStart;
      editor.value = this.content;
      // Restore cursor position
      editor.setSelectionRange(cursorPos, cursorPos);
    }
  }

  private getActiveEditor(): HTMLTextAreaElement | undefined {
    return this.editorType === 'text'
      ? this.textEditor?.nativeElement
      : this.htmlEditor?.nativeElement;
  }

  onContentChange(newContent: string) {
    this.content = newContent;
    const editor = this.getActiveEditor();

    // Use current editor selection or fallback to current state
    const start = editor?.selectionStart ?? this.selectionStart;
    const end = editor?.selectionEnd ?? this.selectionEnd;

    this.contentChange.emit({
      content: newContent,
      selectionStart: start,
      selectionEnd: end
    });
  }

  onTextSelect() {
    if (this.viewMode() === 'view') {
      // Handle selection in iframe preview mode
      if (this.previewFrame) {
        const iframe = this.previewFrame.nativeElement;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          this.handleIframeSelection(iframeDoc);
        }
      }
      return;
    }

    const editor = this.getActiveEditor();
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);

    this.currentSelection.set(selectedText);
    this.selectionStart = start;
    this.selectionEnd = end;

    if (selectedText.trim()) {
      this.textSelection.emit({
        selectedText,
        selectionStart: start,
        selectionEnd: end
      });
    }
  }

  private restoreSelection() {
    if (this.savedRange && this.viewMode() === 'view' && this.previewFrame) {
      const iframe = this.previewFrame.nativeElement;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        const selection = iframeDoc.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(this.savedRange);
        }
      }
    }
  }

  handleRichTextInsert(event: RichTextInsertEvent) {
    if (this.viewMode() === 'view') {
      // Restore selection before executing command
      this.restoreSelection();
      this.executeVisualCommand(event);
      return;
    }

    const editor = this.getActiveEditor();
    if (!editor) return;

    const start = this.selectionStart;
    const end = this.selectionEnd;
    const selectedText = this.currentSelection();
    const currentContent = this.content;

    const before = currentContent.substring(0, start);
    const after = currentContent.substring(end);

    let newContent: string;
    let newCursorPos: number;

    if (event.hasAttributes) {
      newContent = before + event.startTag + (event.defaultText || selectedText) + event.endTag + after;
      newCursorPos = start + event.startTag.length + (event.defaultText || selectedText).length + event.endTag.length;
    } else if (selectedText) {
      newContent = before + event.startTag + selectedText + event.endTag + after;
      newCursorPos = start + event.startTag.length + selectedText.length + event.endTag.length;
    } else {
      const text = event.defaultText || '';
      newContent = before + event.startTag + text + event.endTag + after;
      newCursorPos = start + event.startTag.length + text.length;
    }

    this.updateContentAndCursor(newContent, newCursorPos);
  }

  handleFreeMarkerInsert(event: FreeMarkerInsertEvent) {
    if (this.viewMode() === 'view') {
      this.restoreSelection();
      
      if (this.previewFrame) {
        const iframe = this.previewFrame.nativeElement;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframe.contentWindow?.focus();
          
          // Use safe text insertion instead of execCommand
          const selection = iframeDoc.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const textNode = iframeDoc.createTextNode(event.code);
            range.deleteContents();
            range.insertNode(textNode);
            
            // Move cursor after inserted text
            selection.removeAllRanges();
            const newRange = iframeDoc.createRange();
            newRange.setStartAfter(textNode);
            newRange.collapse(true);
            selection.addRange(newRange);
          }
          
          // Update content after insertion - use the new method that preserves structure
          this.updateContentFromIframe(iframeDoc);
        }
      }
      return;
    }

    const editor = this.getActiveEditor();
    if (!editor) return;

    const start = this.selectionStart;
    const end = this.selectionEnd;
    const selectedText = this.currentSelection();
    const currentContent = this.content;

    let newContent: string;
    let newCursorPos: number;

    if (event.wrapSelection && selectedText) {
      const lines = event.code.split('\\n');
      if (event.type === 'if' || event.type === 'if-else') {
        const openTag = lines[0];
        const closeTag = lines[lines.length - 1];
        const wrapped = `${openTag}\\n  ${selectedText}\\n${closeTag}`;
        newContent = currentContent.substring(0, start) + wrapped + currentContent.substring(end);
        newCursorPos = start + wrapped.length;
      } else if (event.type === 'for') {
        const openTag = lines[0];
        const closeTag = lines[lines.length - 1];
        const wrapped = `${openTag}\\n  ${selectedText}\\n${closeTag}`;
        newContent = currentContent.substring(0, start) + wrapped + currentContent.substring(end);
        newCursorPos = start + wrapped.length;
      } else {
        const before = currentContent.substring(0, start);
        const after = currentContent.substring(end);
        newContent = before + event.code + after;
        newCursorPos = start + event.code.length;
      }
    } else {
      const cursorPos = editor.selectionStart;
      const before = currentContent.substring(0, cursorPos);
      const after = currentContent.substring(cursorPos);
      newContent = before + event.code + after;
      newCursorPos = cursorPos + event.code.length;
    }

    this.updateContentAndCursor(newContent, newCursorPos);
    this.freemarkerInsert.emit(event);
  }

  private executeVisualCommand(event: RichTextInsertEvent) {
    if (!this.previewFrame) return;
    
    const iframe = this.previewFrame.nativeElement;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Focus the iframe first
    iframe.contentWindow?.focus();
    
    const tag = event.startTag.toLowerCase();
    const selection = iframeDoc.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      // No selection, just insert the HTML
      this.insertVisualHtml(event, iframeDoc);
      this.updateContentFromIframe(iframeDoc);
      return;
    }

    const selectedText = selection.toString();
    
    // For formatting commands, wrap selected text instead of using execCommand
    if (tag.includes('<b>') || tag.includes('<strong>')) {
      this.wrapSelectionWithTag(iframeDoc, 'strong', selectedText);
    } else if (tag.includes('<i>') || tag.includes('<em>')) {
      this.wrapSelectionWithTag(iframeDoc, 'em', selectedText);
    } else if (tag.includes('<u>')) {
      this.wrapSelectionWithTag(iframeDoc, 'u', selectedText);
    } else if (tag.includes('<s>') || tag.includes('<strike>')) {
      this.wrapSelectionWithTag(iframeDoc, 's', selectedText);
    } else if (tag.includes('<code>')) {
      this.wrapSelectionWithTag(iframeDoc, 'code', selectedText);
    } else if (tag.includes('<h1>')) {
      this.wrapSelectionWithTag(iframeDoc, 'h1', selectedText);
    } else if (tag.includes('<h2>')) {
      this.wrapSelectionWithTag(iframeDoc, 'h2', selectedText);
    } else if (tag.includes('<h3>')) {
      this.wrapSelectionWithTag(iframeDoc, 'h3', selectedText);
    } else if (tag.includes('<ul>')) {
      this.createList(iframeDoc, 'ul', selectedText);
    } else if (tag.includes('<ol>')) {
      this.createList(iframeDoc, 'ol', selectedText);
    } else if (tag.includes('blockquote')) {
      this.wrapSelectionWithTag(iframeDoc, 'blockquote', selectedText);
    } else if (tag.includes('<hr>')) {
      this.insertHorizontalRule(iframeDoc);
    } else {
      // For complex HTML, use insertHTML
      this.insertVisualHtml(event, iframeDoc);
    }

    // Update content after command - use the new method that preserves structure
    this.updateContentFromIframe(iframeDoc);
  }

  private wrapSelectionWithTag(iframeDoc: Document, tagName: string, selectedText: string) {
    const selection = iframeDoc.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // Create the wrapper element
    const wrapper = iframeDoc.createElement(tagName);
    
    try {
      // Extract the selected content
      const contents = range.extractContents();
      
      // If no text was selected, add placeholder text
      if (!selectedText.trim()) {
        wrapper.textContent = this.getPlaceholderText(tagName);
      } else {
        wrapper.appendChild(contents);
      }
      
      // Insert the wrapped content
      range.insertNode(wrapper);
      
      // Clear selection and place cursor after the inserted element
      selection.removeAllRanges();
      const newRange = iframeDoc.createRange();
      newRange.setStartAfter(wrapper);
      newRange.collapse(true);
      selection.addRange(newRange);
      
    } catch (error) {
      console.warn('Error wrapping selection:', error);
      // Safe fallback: manual DOM insertion without execCommand
      this.safeInsertHtml(iframeDoc, `<${tagName}>${selectedText || this.getPlaceholderText(tagName)}</${tagName}>`);
    }
  }

  private createList(iframeDoc: Document, listType: 'ul' | 'ol', selectedText: string) {
    const selection = iframeDoc.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    try {
      // Create list structure
      const list = iframeDoc.createElement(listType);
      const listItem = iframeDoc.createElement('li');
      
      if (selectedText.trim()) {
        // Split selected text by lines to create multiple list items
        const lines = selectedText.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          lines.forEach(line => {
            const li = iframeDoc.createElement('li');
            li.textContent = line.trim();
            list.appendChild(li);
          });
        } else {
          listItem.textContent = selectedText;
          list.appendChild(listItem);
        }
      } else {
        listItem.textContent = 'List item';
        list.appendChild(listItem);
      }
      
      // Replace selection with list
      range.deleteContents();
      range.insertNode(list);
      
      // Place cursor in the first list item
      selection.removeAllRanges();
      const newRange = iframeDoc.createRange();
      newRange.selectNodeContents(list.firstElementChild as Element);
      newRange.collapse(false);
      selection.addRange(newRange);
      
    } catch (error) {
      console.warn('Error creating list:', error);
      // Safe fallback: manual DOM insertion without execCommand
      this.safeInsertHtml(iframeDoc, `<${listType}><li>${selectedText || 'List item'}</li></${listType}>`);
    }
  }

  private insertHorizontalRule(iframeDoc: Document) {
    const selection = iframeDoc.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const hr = iframeDoc.createElement('hr');
    
    try {
      range.deleteContents();
      range.insertNode(hr);
      
      // Place cursor after HR
      selection.removeAllRanges();
      const newRange = iframeDoc.createRange();
      newRange.setStartAfter(hr);
      newRange.collapse(true);
      selection.addRange(newRange);
      
    } catch (error) {
      console.warn('Error inserting HR:', error);
      // Safe fallback: manual DOM insertion without execCommand
      this.safeInsertHtml(iframeDoc, '<hr>');
    }
  }

  private getPlaceholderText(tagName: string): string {
    const placeholders: { [key: string]: string } = {
      'strong': 'Bold text',
      'em': 'Italic text',
      'u': 'Underlined text',
      's': 'Strikethrough text',
      'code': 'Code',
      'h1': 'Heading 1',
      'h2': 'Heading 2',
      'h3': 'Heading 3',
      'h4': 'Heading 4',
      'h5': 'Heading 5',
      'h6': 'Heading 6',
      'blockquote': 'Quote text'
    };
    return placeholders[tagName] || 'Text';
  }

  private insertVisualHtml(event: RichTextInsertEvent, iframeDoc: Document) {
    const selection = iframeDoc.getSelection();
    const text = event.defaultText || selection?.toString() || '';
    const html = event.startTag + text + event.endTag;
    this.safeInsertHtml(iframeDoc, html);
  }

  private safeInsertHtml(iframeDoc: Document, html: string) {
    const selection = iframeDoc.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    try {
      // Create a temporary container to parse the HTML
      const tempDiv = iframeDoc.createElement('div');
      tempDiv.innerHTML = html;
      
      // Extract all nodes from the temporary container
      const fragment = iframeDoc.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      // Replace the selection with the fragment
      range.deleteContents();
      range.insertNode(fragment);
      
      // Move cursor to the end of inserted content
      selection.removeAllRanges();
      const newRange = iframeDoc.createRange();
      newRange.setStartAfter(fragment.lastChild || range.startContainer);
      newRange.collapse(true);
      selection.addRange(newRange);
      
    } catch (error) {
      console.warn('Error inserting HTML safely:', error);
      // Last resort: direct text insertion to avoid corruption
      const textNode = iframeDoc.createTextNode(html);
      range.deleteContents();
      range.insertNode(textNode);
    }
  }

  private updateContentAndCursor(newContent: string, newCursorPos: number) {
    const editor = this.getActiveEditor();

    this.content = newContent;
    this.onContentChange(newContent);
    this.currentSelection.set('');

    setTimeout(() => {
      if (editor) {
        editor.focus();
        editor.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }

  insertText(text: string, position?: number) {
    const editor = this.getActiveEditor();
    if (!editor) return;

    const insertPos = position !== undefined ? position : editor.selectionStart;
    const before = this.content.substring(0, insertPos);
    const after = this.content.substring(insertPos);
    const newContent = before + text + after;

    this.updateContentAndCursor(newContent, insertPos + text.length);
  }

  getSelection(): { text: string; start: number; end: number } {
    return {
      text: this.currentSelection(),
      start: this.selectionStart,
      end: this.selectionEnd
    };
  }

  private updateContentFromIframe(iframeDoc: Document) {
    const newContent = this.extractContentFromIframe(iframeDoc);
    if (this.content !== newContent) {
      this.content = newContent;
      this.onContentChange(newContent);
    }
  }

  private extractContentFromIframe(iframeDoc: Document): string {
    // Check if the original content had html/body structure
    const hasHtmlTag = /<html[^>]*>/i.test(this.content);
    const hasBodyTag = /<body[^>]*>/i.test(this.content);
    
    if (hasHtmlTag || hasBodyTag) {
      // Original content had structure, return the full document
      return iframeDoc.documentElement.outerHTML;
    } else {
      // Original content was just body content, return only body innerHTML
      return iframeDoc.body.innerHTML;
    }
  }

  focus() {
    const editor = this.getActiveEditor();
    if (editor) {
      editor.focus();
    }
  }
}
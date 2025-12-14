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
          <!-- Preview Mode (Visual Editor) -->
          <div class="preview-container">
             <div #previewDiv
                  class="preview-area" 
                  [class.device-desktop]="previewDevice() === 'desktop'"
                  [class.device-tablet]="previewDevice() === 'tablet'"
                  [class.device-mobile]="previewDevice() === 'mobile'"
                  contenteditable="true"
                  (input)="onPreviewInput($event)"
                  (mouseup)="onTextSelect()"
                  (keyup)="onTextSelect()"></div>
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

    .preview-area {
      flex: 1; /* Default to full width for desktop if class not override */
      min-height: 100px;
      background: white;
      color: black;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      outline: none;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother transition */
    }

    /* Device Simulations */
    .preview-area.device-desktop {
      width: 100%;
      max-width: 100%;
      padding: 2rem; /* Normal padding */
    }

    .preview-area.device-tablet {
      width: 768px;
      flex: none; /* Disable flex growth */
      padding: 3rem 2rem; /* More vertical padding for tablet feel */
      border: 8px solid #2d3748; /* Tablet Bezel */
      border-radius: 24px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .preview-area.device-mobile {
      width: 375px;
      flex: none;
      padding: 2rem 1rem;
      border: 8px solid #1a202c; /* Phone Bezel */
      border-radius: 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    [data-theme="dark"] .preview-area {
      background: #1e1e1e;
      color: #e0e0e0;
    }
    
    [data-theme="dark"] .preview-area.device-tablet,
    [data-theme="dark"] .preview-area.device-mobile {
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
  @ViewChild('previewDiv') previewDiv?: ElementRef<HTMLDivElement>;

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

      // If in view mode, also update the preview div if it differs
      if (this.viewMode() === 'view' && this.previewDiv) {
        if (this.previewDiv.nativeElement.innerHTML !== this.content) {
          this.previewDiv.nativeElement.innerHTML = this.content || '<p>No content</p>';
        }
      }
    }
  }

  toggleViewMode() {
    this.viewMode.update(mode => {
      const newMode = mode === 'code' ? 'view' : 'code';

      if (newMode === 'view') {
        // Switching TO view mode: sync content to preview div
        // Need to wait for view to render
        setTimeout(() => {
          if (this.previewDiv) {
            this.previewDiv.nativeElement.innerHTML = this.content || '<p>No content</p>';
          }
        }, 0);
      } else {
        // Switching FROM view mode: Ensure savedRange is cleared
        this.savedRange = null;
      }

      return newMode;
    });
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
      // Handle selection in preview mode
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const text = selection.toString();
        this.currentSelection.set(text);

        // Save the actual range so we can restore it later
        // Only save if the selection is inside our preview div
        const range = selection.getRangeAt(0);
        if (this.previewDiv && this.previewDiv.nativeElement.contains(range.commonAncestorContainer)) {
          this.savedRange = range.cloneRange();
        }
      } else {
        this.currentSelection.set('');
        this.savedRange = null;
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
    if (this.savedRange && this.viewMode() === 'view') {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.savedRange);
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
      document.execCommand('insertText', false, event.code);

      if (this.previewDiv) {
        this.onPreviewInput({ target: this.previewDiv.nativeElement } as any);
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
    const tag = event.startTag.toLowerCase();

    if (tag.includes('<b>') || tag.includes('<strong>')) {
      document.execCommand('bold');
    } else if (tag.includes('<i>') || tag.includes('<em>')) {
      document.execCommand('italic');
    } else if (tag.includes('<u>')) {
      document.execCommand('underline');
    } else if (tag.includes('<s>') || tag.includes('<strike>')) {
      document.execCommand('strikeThrough');
    } else if (tag.includes('<h1>')) {
      document.execCommand('formatBlock', false, 'H1');
    } else if (tag.includes('<h2>')) {
      document.execCommand('formatBlock', false, 'H2');
    } else if (tag.includes('<h3>')) {
      document.execCommand('formatBlock', false, 'H3');
    } else if (tag.includes('<ul>')) {
      document.execCommand('insertUnorderedList');
    } else if (tag.includes('<ol>')) {
      document.execCommand('insertOrderedList');
    } else if (tag.includes('blockquote')) {
      document.execCommand('formatBlock', false, 'blockquote');
    } else if (tag.includes('<hr>')) {
      document.execCommand('insertHorizontalRule');
    } else if (tag.includes('<a')) {
      this.insertVisualHtml(event);
    } else if (tag.includes('<img')) {
      this.insertVisualHtml(event);
    } else if (tag.includes('<code>')) {
      this.insertVisualHtml(event);
    } else {
      this.insertVisualHtml(event);
    }

    if (this.previewDiv) {
      this.onPreviewInput({ target: this.previewDiv.nativeElement } as any);
    }
  }

  private insertVisualHtml(event: RichTextInsertEvent) {
    const text = event.defaultText || window.getSelection()?.toString() || '';
    const html = event.startTag + text + event.endTag;
    document.execCommand('insertHTML', false, html);
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

  focus() {
    const editor = this.getActiveEditor();
    if (editor) {
      editor.focus();
    }
  }
}
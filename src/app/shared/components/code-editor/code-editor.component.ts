import { Component, Input, Output, EventEmitter, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="code-editor-container" [class.dark-mode]="isDarkMode()">
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <span class="language-badge">{{ language | uppercase }}</span>
        </div>
        <div class="toolbar-right">
          <button class="tool-btn" (click)="formatCode()" title="Format Code">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
            </svg>
            Format
          </button>
          <button class="tool-btn" (click)="copyCode()" title="Copy to Clipboard">
            @if (copied()) {
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="success-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Copied!
            } @else {
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copy
            }
          </button>
        </div>
      </div>

      <div class="editor-area">
        <div class="gutter" #gutter>
          @for (line of lineNumbers(); track line) {
            <div class="line-number">{{ line }}</div>
          }
        </div>
        <textarea 
          #textarea
          class="code-input" 
          [ngModel]="code" 
          (ngModelChange)="onCodeChange($event)"
          (scroll)="syncScroll()"
          (keydown)="handleKeydown($event)"
          spellcheck="false"
          [placeholder]="placeholder">
        </textarea>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: hidden;
    }

    .code-editor-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 1px solid var(--border, #e2e8f0);
      border-radius: 8px; /* var(--radius) */
      overflow: hidden;
      background: var(--surface, white);
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    }

    /* Dark Mode Support via class or CSS vars logic */
    .code-editor-container.dark-mode {
      background: #1e293b; 
      border-color: #334155;
    }

    .editor-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1rem;
      background: var(--surface-elevated, #f8fafc);
      border-bottom: 1px solid var(--border, #e2e8f0);
    }
    
    .dark-mode .editor-toolbar {
      background: #0f172a;
      border-color: #334155;
    }

    .language-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.5rem;
      background: var(--primary-light, #e0e7ff);
      color: var(--primary, #6366f1);
      border-radius: 4px;
    }
    
    .dark-mode .language-badge {
      background: rgba(99, 102, 241, 0.2);
    }

    .toolbar-right {
      display: flex;
      gap: 0.5rem;
    }

    .tool-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      color: var(--text-secondary, #64748b);
      background: transparent;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tool-btn:hover {
      background: var(--surface-hover, #f1f5f9);
      color: var(--text, #334155);
    }
    
    .dark-mode .tool-btn { color: #94a3b8; }
    .dark-mode .tool-btn:hover { background: #334155; color: #f8fafc; }

    .success-icon {
      color: #10b981;
    }

    .editor-area {
      flex: 1;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    .gutter {
      width: 48px;
      flex-shrink: 0;
      background: var(--surface-elevated, #f8fafc);
      border-right: 1px solid var(--border, #e2e8f0);
      color: var(--text-tertiary, #94a3b8);
      font-size: 0.813rem; /* 13px */
      line-height: 1.5; /* Match textarea line-height */
      padding: 1rem 0;
      text-align: right;
      padding-right: 0.5rem;
      user-select: none;
      overflow: hidden; /* Scrolled via script */
    }
    
    .dark-mode .gutter {
      background: #0f172a;
      border-color: #334155;
      color: #475569;
    }

    .line-number {
      height: 1.5rem; /* Match textarea line-height */
      line-height: 1.5rem;
    }

    .code-input {
      flex: 1;
      border: none;
      resize: none;
      padding: 1rem;
      font-family: inherit;
      font-size: 0.813rem; /* 13px */
      line-height: 1.5rem; /* Fixed line height for sync */
      outline: none;
      background: transparent;
      color: var(--text, #334155);
      white-space: pre;
      overflow: auto;
      tab-size: 2;
    }
    
    .dark-mode .code-input {
      color: #f1f5f9;
    }

    /* Scrollbar styling */
    .code-input::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    
    .code-input::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .code-input::-webkit-scrollbar-thumb {
      background: var(--border, #cbd5e1);
      border-radius: 5px;
    }
    
    .code-input::-webkit-scrollbar-corner {
      background: transparent;
    }
  `]
})
export class CodeEditorComponent implements AfterViewInit {
  @Input() code = '';
  @Input() language = 'html';
  @Input() placeholder = 'Enter code here...';

  @Output() codeChange = new EventEmitter<string>();

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('gutter') gutter!: ElementRef<HTMLDivElement>;

  lineNumbers = signal<number[]>([1]);
  copied = signal(false);
  isDarkMode = signal(false); // Can be linked to a theme service later

  constructor() {
    // Check initial theme support if needed, for now defaulting to checking body class or signal
    // This is simple mode detection
    const theme = document.documentElement.getAttribute('data-theme');
    this.isDarkMode.set(theme === 'dark');

    // Listen for theme changes globally if possible, or use a ResizeObserver equivalent for attributes?
    // For now simplistic approach:
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!document.documentElement.getAttribute('data-theme')) {
        this.isDarkMode.set(e.matches);
      }
    });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          this.isDarkMode.set(newTheme === 'dark');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
  }

  ngAfterViewInit() {
    this.updateLineNumbers();
  }

  onCodeChange(newCode: string) {
    this.code = newCode;
    this.codeChange.emit(newCode);
    this.updateLineNumbers();
  }

  updateLineNumbers() {
    const lines = this.code.split('\n').length;
    // Only update if count changed significantly or at least ensure we have enough
    const currentCount = this.lineNumbers().length;
    if (lines !== currentCount) {
      this.lineNumbers.set(Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1));
    }
  }

  syncScroll() {
    if (this.textarea && this.gutter) {
      this.gutter.nativeElement.scrollTop = this.textarea.nativeElement.scrollTop;
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = this.textarea.nativeElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      this.code = this.code.substring(0, start) + '  ' + this.code.substring(end);
      this.codeChange.emit(this.code);

      // Move cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  }

  formatCode() {
    // Very basic formatting for HTML/CSS to avoid external libs
    // For a real app, I'd propose Prettier or a localized formatter.
    // Here we'll do simple indentation based on brackets/tags.

    let formatted = this.code;

    if (this.language === 'css') {
      formatted = this.formatCss(this.code);
    } else if (this.language === 'html') {
      formatted = this.formatHtml(this.code);
    }

    if (formatted !== this.code) {
      this.onCodeChange(formatted);
    }
  }

  private formatCss(css: string): string {
    // Simple naive CSS formatter
    return css
      .replace(/\s*\{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/\s*\}\s*/g, '\n}\n')
      .replace(/^\s+/gm, '') // trim start
      .replace(/\n\s*\n/g, '\n') // remove extra newlines
      .replace(/\{\n  \n/g, '{\n  ')
      .replace(/;\n  \}/g, ';\n}'); // fix end bracket
  }

  private formatHtml(html: string): string {
    // Extremely naive HTML formatter (tab indentation)
    // A regex-based approach is fragile but better than clear text
    // For this iteration, we might just assume basic structure
    let pad = 0;
    return html
      .replace(/>\s*</g, '>\n<')
      .split('\n')
      .map(line => {
        let indent = 0;
        if (line.match(/^<\/\w/)) pad -= 1;
        indent = pad;
        if (line.match(/^<\w[^>]*[^\/]>.*$/) && !line.match(/^<\w[^>]*>.*<\/\w>/)) pad += 1;

        return '  '.repeat(Math.max(0, indent)) + line;
      })
      .join('\n');
  }

  copyCode() {
    navigator.clipboard.writeText(this.code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}

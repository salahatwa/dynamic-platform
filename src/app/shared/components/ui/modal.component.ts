import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div 
          class="modal" 
          [class]="'modal-' + size"
          (click)="$event.stopPropagation()"
          role="dialog"
          [attr.aria-modal]="true"
          [attr.aria-labelledby]="titleId"
        >
          @if (showHeader) {
            <div class="modal-header">
              <h2 [id]="titleId" class="modal-title">{{ title }}</h2>
              @if (showCloseButton) {
                <button class="close-btn" (click)="close()" aria-label="Close">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              }
            </div>
          }
          
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          
          @if (showFooter) {
            <div class="modal-footer">
              <ng-content select="[slot=footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal {
      background: var(--surface-elevated);
      border-radius: var(--radius);
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-xl);
      animation: scaleIn 0.3s ease-out;
      position: relative;
    }

    .modal-sm {
      max-width: 400px;
    }

    .modal-md {
      max-width: 600px;
    }

    .modal-lg {
      max-width: 800px;
    }

    .modal-xl {
      max-width: 1200px;
    }

    .modal-full {
      max-width: 95%;
      max-height: 95vh;
    }

    @media (max-width: 768px) {
      .modal {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }
      
      .modal-overlay {
        padding: 0;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      margin: 0;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition);
    }

    .close-btn:hover {
      background: var(--surface-hover);
      color: var(--text);
    }

    .modal-body {
      padding: 1.5rem;
      color: var(--text);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid var(--border);
      background: var(--surface);
    }

    @media (max-width: 480px) {
      .modal-footer {
        flex-direction: column-reverse;
      }
      
      .modal-footer ::ng-deep button {
        width: 100%;
      }
    }
  `]
})
export class ModalComponent {
    @Input() isOpen: boolean = false;
    @Input() title: string = '';
    @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
    @Input() showHeader: boolean = true;
    @Input() showFooter: boolean = false;
    @Input() showCloseButton: boolean = true;
    @Input() closeOnOverlayClick: boolean = true;
    @Input() closeOnEscape: boolean = true;

    @Output() closed = new EventEmitter<void>();

    titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

    @HostListener('document:keydown.escape', ['$event'])
    handleEscape(event: KeyboardEvent) {
        if (this.isOpen && this.closeOnEscape) {
            this.close();
        }
    }

    onOverlayClick(event: MouseEvent) {
        if (this.closeOnOverlayClick) {
            this.close();
        }
    }

    close() {
        this.isOpen = false;
        this.closed.emit();
    }

    open() {
        this.isOpen = true;
    }
}

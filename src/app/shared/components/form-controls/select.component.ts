import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface SelectOption {
    label: string;
    value: any;
    disabled?: boolean;
}

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="form-group">
      @if (label) {
        <label [for]="selectId" class="form-label">
          {{ label }}
          @if (required) {
            <span class="text-danger">*</span>
          }
        </label>
      }
      
      <div class="select-wrapper" [class.has-error]="error && touched" [class.is-open]="isOpen">
        <div 
          class="select-control" 
          [class.disabled]="disabled"
          (click)="toggleDropdown()"
          tabindex="0"
          (keydown.enter)="toggleDropdown()"
          (keydown.space)="toggleDropdown()"
          (blur)="onTouched()"
        >
          <span class="select-value">
            @if (selectedOption) {
              {{ selectedOption.label }}
            } @else {
              <span class="placeholder">{{ placeholder }}</span>
            }
          </span>
          <svg class="select-arrow" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
        
        @if (isOpen && !disabled) {
          <div class="select-dropdown">
            @if (searchable) {
              <div class="select-search">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  [(ngModel)]="searchTerm"
                  (click)="$event.stopPropagation()"
                  class="search-input"
                />
              </div>
            }
            <div class="select-options">
              @for (option of filteredOptions; track option.value) {
                <div 
                  class="select-option"
                  [class.selected]="isSelected(option)"
                  [class.disabled]="option.disabled"
                  (click)="selectOption(option)"
                >
                  {{ option.label }}
                  @if (isSelected(option)) {
                    <svg class="check-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  }
                </div>
              } @empty {
                <div class="select-empty">No options found</div>
              }
            </div>
          </div>
        }
      </div>
      
      @if (helperText && !error) {
        <small class="helper-text">{{ helperText }}</small>
      }
      
      @if (error && touched) {
        <small class="error-text">{{ error }}</small>
      }
    </div>
  `,
    styles: [`
    .form-group {
      margin-bottom: 1rem;
      width: 100%;
      position: relative;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text);
      font-size: 0.875rem;
    }

    .text-danger {
      color: var(--danger);
      margin-left: 0.25rem;
    }

    .select-wrapper {
      position: relative;
    }

    .select-wrapper.has-error .select-control {
      border-color: var(--danger);
    }

    .select-control {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--background);
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-size: 0.875rem;
      transition: var(--transition);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .select-control:hover:not(.disabled) {
      border-color: var(--primary-light);
    }

    .select-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .select-control.disabled {
      background: var(--surface-hover);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .select-value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .placeholder {
      color: var(--text-tertiary);
    }

    .select-arrow {
      flex-shrink: 0;
      color: var(--text-secondary);
      transition: var(--transition);
    }

    .select-wrapper.is-open .select-arrow {
      transform: rotate(180deg);
    }

    .select-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      right: 0;
      background: var(--surface-elevated);
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      max-height: 300px;
      overflow: hidden;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .select-search {
      padding: 0.5rem;
      border-bottom: 1px solid var(--border);
    }

    .search-input {
      width: 100%;
      padding: 0.5rem;
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-size: 0.875rem;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary);
    }

    .select-options {
      max-height: 250px;
      overflow-y: auto;
    }

    .select-option {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text);
    }

    .select-option:hover:not(.disabled) {
      background: var(--surface-hover);
    }

    .select-option.selected {
      background: rgba(99, 102, 241, 0.1);
      color: var(--primary);
      font-weight: 500;
    }

    .select-option.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .check-icon {
      flex-shrink: 0;
      color: var(--primary);
    }

    .select-empty {
      padding: 1rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .helper-text {
      display: block;
      margin-top: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    .error-text {
      display: block;
      margin-top: 0.5rem;
      color: var(--danger);
      font-size: 0.75rem;
      font-weight: 500;
    }
  `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ],
    host: {
        '(document:click)': 'onDocumentClick($event)'
    }
})
export class SelectComponent implements ControlValueAccessor {
    @Input() label: string = '';
    @Input() options: SelectOption[] = [];
    @Input() placeholder: string = 'Select an option';
    @Input() helperText: string = '';
    @Input() error: string = '';
    @Input() disabled: boolean = false;
    @Input() required: boolean = false;
    @Input() searchable: boolean = false;
    @Input() selectId: string = `select-${Math.random().toString(36).substr(2, 9)}`;

    @Output() selectionChange = new EventEmitter<any>();

    value: any = null;
    touched: boolean = false;
    isOpen: boolean = false;
    searchTerm: string = '';

    onChange: any = () => { };
    onTouched: any = () => { };

    get selectedOption(): SelectOption | undefined {
        return this.options.find(opt => opt.value === this.value);
    }

    get filteredOptions(): SelectOption[] {
        if (!this.searchable || !this.searchTerm) {
            return this.options;
        }
        return this.options.filter(opt =>
            opt.label.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    toggleDropdown() {
        if (!this.disabled) {
            this.isOpen = !this.isOpen;
        }
    }

    selectOption(option: SelectOption) {
        if (!option.disabled) {
            this.value = option.value;
            this.onChange(this.value);
            this.selectionChange.emit(this.value);
            this.isOpen = false;
            this.searchTerm = '';
        }
    }

    isSelected(option: SelectOption): boolean {
        return this.value === option.value;
    }

    onDocumentClick(event: Event) {
        this.isOpen = false;
    }

    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = () => {
            this.touched = true;
            fn();
        };
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}

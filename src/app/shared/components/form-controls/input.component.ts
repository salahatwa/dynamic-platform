import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
    <div class="form-group">
      @if (label) {
        <label [for]="inputId" class="form-label">
          {{ label }}
          @if (required) {
            <span class="text-danger">*</span>
          }
        </label>
      }
      
      <div class="input-wrapper" [class.has-error]="error && touched">
        @if (prefixIcon) {
          <span class="input-prefix">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="prefixIcon"></svg>
          </span>
        }
        
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [(ngModel)]="value"
          (blur)="onTouched()"
          (input)="onChange($event)"
          class="form-control"
          [class.with-prefix]="prefixIcon"
          [class.with-suffix]="suffixIcon || loading"
        />
        
        @if (loading) {
          <span class="input-suffix">
            <span class="spinner"></span>
          </span>
        } @else if (suffixIcon) {
          <span class="input-suffix">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="suffixIcon"></svg>
          </span>
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

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-wrapper.has-error .form-control {
      border-color: var(--danger);
    }

    .input-wrapper.has-error .form-control:focus {
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--background);
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-size: 0.875rem;
      transition: var(--transition);
      font-family: inherit;
    }

    .form-control.with-prefix {
      padding-left: 2.75rem;
      padding-inline-start: 2.75rem;
    }

    .form-control.with-suffix {
      padding-right: 2.75rem;
      padding-inline-end: 2.75rem;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .form-control:hover:not(:focus):not(:disabled) {
      border-color: var(--primary-light);
    }

    .form-control:disabled {
      background: var(--surface-hover);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .form-control:readonly {
      background: var(--surface);
    }

    .form-control::placeholder {
      color: var(--text-tertiary);
    }

    .input-prefix,
    .input-suffix {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      pointer-events: none;
    }

    .input-prefix {
      left: 1rem;
      inset-inline-start: 1rem;
    }

    .input-suffix {
      right: 1rem;
      inset-inline-end: 1rem;
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

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* RTL Support */
    [dir="rtl"] .form-control.with-prefix {
      padding-left: 1rem;
      padding-right: 2.75rem;
    }

    [dir="rtl"] .form-control.with-suffix {
      padding-left: 2.75rem;
      padding-right: 1rem;
    }
  `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
    @Input() label: string = '';
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() helperText: string = '';
    @Input() error: string = '';
    @Input() prefixIcon: string = '';
    @Input() suffixIcon: string = '';
    @Input() disabled: boolean = false;
    @Input() readonly: boolean = false;
    @Input() required: boolean = false;
    @Input() loading: boolean = false;
    @Input() inputId: string = `input-${Math.random().toString(36).substr(2, 9)}`;

    value: any = '';
    touched: boolean = false;

    onChange: any = () => { };
    onTouched: any = () => { };

    writeValue(value: any): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = (event: any) => {
            fn(event.target.value);
        };
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

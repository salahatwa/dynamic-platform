import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-checkbox',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template: `
    <label class="checkbox-container" [class.disabled]="disabled">
      <input
        type="checkbox"
        [checked]="value"
        [disabled]="disabled"
        (change)="onCheckboxChange($event)"
        (blur)="onTouched()"
        class="checkbox-input"
      />
      <span class="checkbox-custom"></span>
      @if (label) {
        <span class="checkbox-label">{{ label }}</span>
      }
    </label>
  `,
    styles: [`
    .checkbox-container {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      user-select: none;
      position: relative;
    }

    .checkbox-container.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .checkbox-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-radius: var(--radius-xs);
      background: var(--background);
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    .checkbox-custom::after {
      content: '';
      position: absolute;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) scale(0);
      transition: var(--transition);
    }

    .checkbox-input:checked + .checkbox-custom {
      background: var(--gradient-primary);
      border-color: transparent;
    }

    .checkbox-input:checked + .checkbox-custom::after {
      transform: rotate(45deg) scale(1);
    }

    .checkbox-input:focus + .checkbox-custom {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .checkbox-container:hover .checkbox-custom {
      border-color: var(--primary);
    }

    .checkbox-container.disabled .checkbox-custom {
      background: var(--surface-hover);
    }

    .checkbox-label {
      color: var(--text);
      font-size: 0.875rem;
      font-weight: 500;
    }
  `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true
        }
    ]
})
export class CheckboxComponent implements ControlValueAccessor {
    @Input() label: string = '';
    @Input() disabled: boolean = false;

    value: boolean = false;

    onChange: any = () => { };
    onTouched: any = () => { };

    onCheckboxChange(event: Event) {
        const target = event.target as HTMLInputElement;
        this.value = target.checked;
        this.onChange(this.value);
    }

    writeValue(value: boolean): void {
        this.value = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}

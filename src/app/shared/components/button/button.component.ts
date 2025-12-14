import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [type]="type"
      [disabled]="disabled || loading"
      [class]="getClasses()"
      [attr.aria-busy]="loading">
      @if (loading) {
        <span class="spinner"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'outline' | 'danger' | 'success' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  
  getClasses(): string {
    const classes = ['btn'];
    
    if (this.variant === 'primary') classes.push('btn-primary');
    else if (this.variant === 'outline') classes.push('btn-outline');
    else if (this.variant === 'danger') classes.push('btn-danger');
    else if (this.variant === 'success') classes.push('btn-success');
    
    if (this.size === 'sm') classes.push('btn-sm');
    else if (this.size === 'lg') classes.push('btn-lg');
    
    if (this.fullWidth) classes.push('w-100');
    
    return classes.join(' ');
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AttributeDialogData {
  key: string;
  value: string;
  type: string;
  description: string;
}

@Component({
  selector: 'app-attribute-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attribute-dialog.component.html',
  styleUrls: ['./attribute-dialog.component.css']
})
export class AttributeDialogComponent {
  @Input() show = false;
  @Input() isEditing = false;
  @Input() saving = false;
  @Input() attributeKey = '';
  @Input() attributeValue = '';
  @Input() attributeType = 'STRING';
  @Input() attributeDescription = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AttributeDialogData>();

  get isFormValid(): boolean {
    return this.attributeKey.trim().length > 0;
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.isFormValid && !this.saving) {
      this.save.emit({
        key: this.attributeKey,
        value: this.attributeValue,
        type: this.attributeType,
        description: this.attributeDescription
      });
    }
  }
}
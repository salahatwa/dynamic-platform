import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateType } from '../../../../../core/models/template.model';

@Component({
  selector: 'app-type-selection-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './type-selection-dialog.component.html',
  styleUrls: ['./type-selection-dialog.component.css']
})
export class TypeSelectionDialogComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() typeSelected = new EventEmitter<TemplateType>();

  TemplateType = TemplateType;

  onClose() {
    this.close.emit();
  }

  onTypeSelect(type: TemplateType) {
    this.typeSelected.emit(type);
  }
}
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateAttribute } from '../../../../../core/models/template.model';

@Component({
  selector: 'app-variables-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './variables-panel.component.html',
  styleUrls: ['./variables-panel.component.css']
})
export class VariablesPanelComponent {
  @Input() show = false;
  @Input() attributes: TemplateAttribute[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() addAttribute = new EventEmitter<void>();
  @Output() editAttribute = new EventEmitter<TemplateAttribute>();
  @Output() deleteAttribute = new EventEmitter<TemplateAttribute>();

  onClose() {
    this.close.emit();
  }

  onAddAttribute() {
    this.addAttribute.emit();
  }

  onEditAttribute(attribute: TemplateAttribute) {
    this.editAttribute.emit(attribute);
  }

  onDeleteAttribute(attribute: TemplateAttribute) {
    this.deleteAttribute.emit(attribute);
  }
}
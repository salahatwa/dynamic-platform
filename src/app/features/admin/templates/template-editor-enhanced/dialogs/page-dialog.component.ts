import { Component, Input, Output, EventEmitter, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PageDialogData {
  name: string;
  content: string;
}

@Component({
  selector: 'app-page-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-dialog.component.html',
  styleUrls: ['./page-dialog.component.css']
})
export class PageDialogComponent implements OnChanges {
  @Input() show = false;
  @Input() isEditing = false;
  @Input() saving = false;
  @Input() pageName = '';
  @Input() pageContent = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<PageDialogData>();

  pageNameModel = signal('');
  pageContentModel = signal('');

  ngOnChanges() {
    this.pageNameModel.set(this.pageName);
    this.pageContentModel.set(this.pageContent);
  }

  isFormValid(): boolean {
    return this.pageNameModel().trim().length > 0;
  }

  onSave() {
    if (!this.isFormValid()) return;
    
    this.save.emit({
      name: this.pageNameModel(),
      content: this.pageContentModel()
    });
  }
}
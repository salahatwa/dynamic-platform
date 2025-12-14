import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FreeMarkerService, FreeMarkerVariable, FreeMarkerCondition } from '../../../core/services/freemarker.service';

export interface FreeMarkerInsertEvent {
  type: 'variable' | 'if' | 'if-else' | 'for' | 'assign' | 'comment';
  code: string;
  wrapSelection?: boolean;
}

@Component({
  selector: 'app-freemarker-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './freemarker-toolbar.component.html',
  styleUrls: ['./freemarker-toolbar.component.css']
})
export class FreeMarkerToolbarComponent {
  @Input() availableVariables: FreeMarkerVariable[] = [];
  @Input() selectedText = signal('');
  @Output() insertCode = new EventEmitter<FreeMarkerInsertEvent>();

  // Modal states
  showVariableDialog = signal(false);
  showIfDialog = signal(false);
  showForDialog = signal(false);
  showAssignDialog = signal(false);
  showCommentDialog = signal(false);

  // Variable dialog
  selectedVariable = signal('');
  customVariableName = signal('');
  useCustomVariable = signal(true); // Default to custom variable
  replaceWithVariable = signal(false);

  // If dialog
  ifConditionVariable = signal('');
  ifConditionOperator = signal('==');
  ifConditionValue = signal('');
  includeElse = signal(false);

  // For loop dialog
  forListVariable = signal('');
  forItemName = signal('item');

  // Assign dialog
  assignName = signal('');
  assignValue = signal('');

  // Comment dialog
  commentText = signal('');

  operators = this.freemarkerService.getOperators();

  constructor(private freemarkerService: FreeMarkerService) {}

  // Open dialogs
  openVariableDialog() {
    this.selectedVariable.set('');
    this.customVariableName.set('');
    this.useCustomVariable.set(true); // Default to custom
    this.replaceWithVariable.set(!!this.selectedText().trim());
    this.showVariableDialog.set(true);
  }

  openIfDialog() {
    this.ifConditionVariable.set('');
    this.ifConditionOperator.set('==');
    this.ifConditionValue.set('');
    this.includeElse.set(false);
    this.showIfDialog.set(true);
  }

  openForDialog() {
    this.forListVariable.set('');
    this.forItemName.set('item');
    this.showForDialog.set(true);
  }

  openAssignDialog() {
    this.assignName.set('');
    this.assignValue.set('');
    this.showAssignDialog.set(true);
  }

  openCommentDialog() {
    this.commentText.set('');
    this.showCommentDialog.set(true);
  }

  // Insert actions
  insertVariable() {
    const varName = this.useCustomVariable() 
      ? this.customVariableName() 
      : this.selectedVariable();
    
    if (!varName.trim()) return;

    const code = this.freemarkerService.generateVariable(varName);
    const shouldReplace = this.replaceWithVariable() && !!this.selectedText().trim();
    
    this.insertCode.emit({ 
      type: 'variable', 
      code,
      wrapSelection: shouldReplace
    });
    this.showVariableDialog.set(false);
  }

  insertIf() {
    if (!this.ifConditionVariable().trim()) return;

    const condition: FreeMarkerCondition = {
      variable: this.ifConditionVariable(),
      operator: this.ifConditionOperator(),
      value: this.ifConditionValue()
    };

    const code = this.freemarkerService.generateIf(condition, this.includeElse());
    this.insertCode.emit({ 
      type: this.includeElse() ? 'if-else' : 'if', 
      code,
      wrapSelection: true
    });
    this.showIfDialog.set(false);
  }

  insertFor() {
    if (!this.forListVariable().trim() || !this.forItemName().trim()) return;

    const code = this.freemarkerService.generateForLoop(
      this.forListVariable(),
      this.forItemName()
    );
    this.insertCode.emit({ type: 'for', code, wrapSelection: true });
    this.showForDialog.set(false);
  }

  insertAssign() {
    if (!this.assignName().trim()) return;

    const code = this.freemarkerService.generateAssign(
      this.assignName(),
      this.assignValue()
    );
    this.insertCode.emit({ type: 'assign', code });
    this.showAssignDialog.set(false);
  }

  insertComment() {
    if (!this.commentText().trim()) return;

    const code = this.freemarkerService.generateComment(this.commentText());
    this.insertCode.emit({ type: 'comment', code });
    this.showCommentDialog.set(false);
  }

  // Close dialogs
  closeDialog(type: string) {
    switch (type) {
      case 'variable':
        this.showVariableDialog.set(false);
        break;
      case 'if':
        this.showIfDialog.set(false);
        break;
      case 'for':
        this.showForDialog.set(false);
        break;
      case 'assign':
        this.showAssignDialog.set(false);
        break;
      case 'comment':
        this.showCommentDialog.set(false);
        break;
    }
  }
}

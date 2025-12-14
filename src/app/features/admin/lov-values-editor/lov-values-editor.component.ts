import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LovService } from '../../../core/services/lov.service';
import { AppContextService } from '../../../core/services/app-context.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Lov, LovRequest } from '../../../core/models/lov.model';

interface LovValueRow {
  id?: number;
  lovValue: string;
  attribute1: string;
  attribute2: string;
  attribute3: string;
  translationKey: string;
  displayOrder: number;
  active: boolean;
  isNew: boolean;
  isModified: boolean;
}

@Component({
  selector: 'app-lov-values-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './lov-values-editor.component.html',
  styleUrls: ['./lov-values-editor.component.scss']
})
export class LovValuesEditorComponent implements OnInit {
  // LOV Info
  lovType = signal('');
  lovCode = signal('');
  translationApp = signal('default');
  
  // Values
  values = signal<LovValueRow[]>([]);
  
  // UI State
  loading = signal(false);
  saving = signal(false);
  
  // Filter
  showInactiveOnly = signal(false);
  
  // Computed
  filteredValues = computed(() => {
    let filtered = this.values();
    if (this.showInactiveOnly()) {
      filtered = filtered.filter(v => !v.active);
    }
    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  });

  selectedAppName = computed(() => {
    const app = this.appContext.selectedApp();
    return app ? app.name : '';
  });

  hasSelectedApp = computed(() => !!this.appContext.selectedApp());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lovService: LovService,
    private appContext: AppContextService
  ) {}

  private translationService = inject(TranslationService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log('Query params received:', params);
      const lovCode = params['lovCode'];  // Read lovCode from query params
      const lovName = params['lovName'];
      const lovDescription = params['lovDescription'];
      
      if (lovCode) {
        console.log('Setting lovType to:', lovCode);
        this.lovType.set(lovCode);  // lovType = lovCode
        console.log('lovType signal value:', this.lovType());
        
        // If lovName is provided, it's a new LOV type
        if (lovName) {
          console.log('Creating new LOV type:', lovCode, lovName, lovDescription);
        }
        
        this.loadLovValues(lovCode);
      } else {
        console.error('No lovCode in query params!');
      }
    });
  }

  loadLovValues(lovCode: string) {
    this.loading.set(true);
    
    // Query by lovCode (which is also the lovType)
    const selectedApp = this.appContext.selectedApp();
    const appName = selectedApp ? selectedApp.name : undefined;
    this.lovService.getAllLovsWithTranslations(lovCode, undefined, appName).subscribe({
      next: (lovs) => {
        const rows: LovValueRow[] = lovs.map(lov => ({
          id: lov.id,
          lovValue: lov.lovValue || '',
          attribute1: lov.attribute1 || '',
          attribute2: lov.attribute2 || '',
          attribute3: lov.attribute3 || '',
          translationKey: lov.translationKey || '',
          displayOrder: lov.displayOrder,
          active: lov.active,
          isNew: false,
          isModified: false
        }));
        
        this.values.set(rows);
        
        if (lovs.length > 0) {
          this.translationApp.set(lovs[0].translationApp || 'default');
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading LOV values:', err);
        // If no values exist yet, that's okay for new LOV types
        this.loading.set(false);
      }
    });
  }

  addNewRow() {
    const maxOrder = this.values().reduce((max, v) => Math.max(max, v.displayOrder), 0);
    
    const newRow: LovValueRow = {
      lovValue: '',
      attribute1: '',
      attribute2: '',
      attribute3: '',
      translationKey: '',
      displayOrder: maxOrder + 10,
      active: true,
      isNew: true,
      isModified: false
    };
    
    this.values.update(vals => [...vals, newRow]);
  }

  removeRow(index: number) {
    const row = this.values()[index];
    
    if (row.isNew) {
      // Just remove from array if it's a new row
      this.values.update(vals => vals.filter((_, i) => i !== index));
    } else if (row.id) {
      // Delete from backend if it exists
      if (confirm(this.translationService.t('lovEditor.alerts.confirmDelete'))) {
        this.lovService.deleteLov(row.id).subscribe({
          next: () => {
            this.values.update(vals => vals.filter((_, i) => i !== index));
          },
          error: (err) => {
            console.error('Error deleting LOV:', err);
            alert(this.translationService.t('lovEditor.alerts.deleteFailed'));
          }
        });
      }
    }
  }

  markAsModified(index: number) {
    this.values.update(vals => {
      const updated = [...vals];
      if (!updated[index].isNew) {
        updated[index].isModified = true;
      }
      return updated;
    });
  }

  saveAll() {
    const valuesToSave = this.values().filter(v => v.isNew || v.isModified);
    
    if (valuesToSave.length === 0) {
      alert(this.translationService.t('lovEditor.alerts.noChanges'));
      return;
    }

    // Validate lovType is set
    const currentLovType = this.lovType();
    if (!currentLovType || currentLovType.trim() === '') {
      alert(this.translationService.t('lovEditor.alerts.lovTypeMissing'));
      console.error('lovType is empty:', currentLovType);
      return;
    }

    console.log('Saving with lovType:', currentLovType);
    this.saving.set(true);
    
    // Separate new and modified values
    const newValues = valuesToSave.filter(v => v.isNew);
    const modifiedValues = valuesToSave.filter(v => v.isModified && v.id);
    
    let completed = 0;
    let errors = 0;
    const totalOperations = (newValues.length > 0 ? 1 : 0) + (modifiedValues.length > 0 ? 1 : 0);
    
    // Bulk create new values
    if (newValues.length > 0) {
      const selectedApp = this.appContext.selectedApp();
      const appName = selectedApp ? selectedApp.name : undefined;
      if (!appName) {
        alert(this.translationService.t('lovEditor.alerts.selectAppBeforeCreate'));
        this.saving.set(false);
        return;
      }
      const createRequests: LovRequest[] = newValues.map((row, index) => ({
        lovCode: currentLovType, // LOV Code = LOV Type
        lovType: currentLovType,
        lovValue: row.lovValue,
        attribute1: row.attribute1,
        attribute2: row.attribute2,
        attribute3: row.attribute3,
        translationApp: this.translationApp(),
        translationKey: row.translationKey,
        displayOrder: row.displayOrder,
        active: row.active,
        appName,
        metadata: '{}'
      }));
      
      console.log('Bulk create requests:', createRequests);
      
      this.lovService.bulkCreate(createRequests).subscribe({
        next: (created) => {
          completed += created.length;
          if (++completed >= totalOperations) {
            this.finishSaving(completed, errors);
          }
        },
        error: (err) => {
          console.error('Error bulk creating LOVs:', err);
          errors += newValues.length;
          if (++completed >= totalOperations) {
            this.finishSaving(completed, errors);
          }
        }
      });
    }
    
    // Bulk update modified values
    if (modifiedValues.length > 0) {
      const currentLovType = this.lovType();
      const selectedApp = this.appContext.selectedApp();
      const appName = selectedApp ? selectedApp.name : undefined;
      if (!appName) {
        alert(this.translationService.t('lovEditor.alerts.selectAppBeforeUpdate'));
        this.saving.set(false);
        return;
      }
      const updateRequests = modifiedValues.map(row => ({
        id: row.id!,
        request: {
          lovCode: currentLovType, // LOV Code = LOV Type
          lovType: currentLovType,
          lovValue: row.lovValue,
          attribute1: row.attribute1,
          attribute2: row.attribute2,
          attribute3: row.attribute3,
          translationApp: this.translationApp(),
          translationKey: row.translationKey,
          displayOrder: row.displayOrder,
          active: row.active,
          appName,
          metadata: '{}'
        } as LovRequest
      }));
      
      this.lovService.bulkUpdate(updateRequests).subscribe({
        next: (updated) => {
          completed += updated.length;
          if (++completed >= totalOperations) {
            this.finishSaving(completed, errors);
          }
        },
        error: (err) => {
          console.error('Error bulk updating LOVs:', err);
          errors += modifiedValues.length;
          if (++completed >= totalOperations) {
            this.finishSaving(completed, errors);
          }
        }
      });
    }
  }

  finishSaving(completed: number, errors: number) {
    this.saving.set(false);
    
    if (errors > 0) {
      alert(`${this.translationService.t('lovEditor.alerts.savedPartialPrefix')} ${completed} ${this.translationService.t('lovEditor.alerts.valuesWord')}, ${errors} ${this.translationService.t('lovEditor.alerts.failedSuffix')}`);
    } else {
      alert(`${this.translationService.t('lovEditor.alerts.savedSuccessPrefix')} ${completed} ${this.translationService.t('lovEditor.alerts.valuesWord')}`);
    }
    
    // Reload data
    this.loadLovValues(this.lovType());
  }

  goBack() {
    this.router.navigate(['/admin/lov']);
  }

  exportToCSV() {
    const headers = [
      this.translationService.t('lovEditor.table.lovValue'),
      this.translationService.t('lovEditor.table.attr1'),
      this.translationService.t('lovEditor.table.attr2'),
      this.translationService.t('lovEditor.table.attr3'),
      this.translationService.t('lovEditor.table.translationKey'),
      this.translationService.t('lovEditor.table.displayOrder'),
      this.translationService.t('lovEditor.table.active')
    ];
    const rows = this.values().map(v => [
      v.lovValue,
      v.attribute1,
      v.attribute2,
      v.attribute3,
      v.translationKey,
      v.displayOrder.toString(),
      v.active ? this.translationService.t('lovEditor.csv.yes') : this.translationService.t('lovEditor.csv.no')
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.lovType()}_values.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
    key: string;
    header: string;
    sortable?: boolean;
    width?: string;
}

@Component({
    selector: 'app-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="table-wrapper">
      @if (responsive) {
        <!-- Mobile Card View -->
        <div class="mobile-cards hidden-desktop">
          @for (row of data; track trackByFn($index, row)) {
            <div class="mobile-card" (click)="onRowClick(row)">
              @for (col of columns; track col.key) {
                <div class="mobile-card-row">
                  <span class="mobile-card-label">{{ col.header }}</span>
                  <span class="mobile-card-value">
                    @if (cellTemplate) {
                      <ng-container *ngTemplateOutlet="cellTemplate; context: { $implicit: row, column: col }"></ng-container>
                    } @else {
                      {{ row[col.key] }}
                    }
                  </span>
                </div>
              }
            </div>
          }
        </div>
        
        <!-- Desktop Table View -->
        <div class="table-container hidden-mobile">
          <table class="table">
            <thead>
              <tr>
                @for (col of columns; track col.key) {
                  <th 
                    [style.width]="col.width"
                    [class.sortable]="col.sortable"
                    (click)="col.sortable ? onSort(col.key) : null"
                  >
                    {{ col.header }}
                    @if (col.sortable && sortKey === col.key) {
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="sort-icon">
                        @if (sortDirection === 'asc') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        } @else {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        }
                      </svg>
                    }
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @if (loading) {
                @for (i of [1,2,3]; track i) {
                  <tr>
                    @for (col of columns; track col.key) {
                      <td><div class="skeleton skeleton-text"></div></td>
                    }
                  </tr>
                }
              } @else if (data.length === 0) {
                <tr>
                  <td [attr.colspan]="columns.length" class="empty-cell">
                    <div class="empty-state-small">
                      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                      </svg>
                      <p>{{ emptyMessage }}</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (row of data; track trackByFn($index, row)) {
                  <tr [class.clickable]="clickableRows" (click)="onRowClick(row)">
                    @for (col of columns; track col.key) {
                      <td>
                        @if (cellTemplate) {
                          <ng-container *ngTemplateOutlet="cellTemplate; context: { $implicit: row, column: col }"></ng-container>
                        } @else {
                          {{ row[col.key] }}
                        }
                      </td>
                    }
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      } @else {
        <!-- Non-responsive table -->
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                @for (col of columns; track col.key) {
                  <th 
                    [style.width]="col.width"
                    [class.sortable]="col.sortable"
                    (click)="col.sortable ? onSort(col.key) : null"
                  >
                    {{ col.header }}
                    @if (col.sortable && sortKey === col.key) {
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" class="sort-icon">
                        @if (sortDirection === 'asc') {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                        } @else {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        }
                      </svg>
                    }
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @if (loading) {
                @for (i of [1,2,3]; track i) {
                  <tr>
                    @for (col of columns; track col.key) {
                      <td><div class="skeleton skeleton-text"></div></td>
                    }
                  </tr>
                }
              } @else if (data.length === 0) {
                <tr>
                  <td [attr.colspan]="columns.length" class="empty-cell">
                    <div class="empty-state-small">
                      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                      </svg>
                      <p>{{ emptyMessage }}</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (row of data; track trackByFn($index, row)) {
                  <tr [class.clickable]="clickableRows" (click)="onRowClick(row)">
                    @for (col of columns; track col.key) {
                      <td>
                        @if (cellTemplate) {
                          <ng-container *ngTemplateOutlet="cellTemplate; context: { $implicit: row, column: col }"></ng-container>
                        } @else {
                          {{ row[col.key] }}
                        }
                      </td>
                    }
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
    styles: [`
    .table-wrapper {
      background: var(--surface);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .table thead th {
      background: var(--surface-hover);
      color: var(--text);
      font-weight: 600;
      padding: 1rem;
      text-align: start;
      font-size: 0.813rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid var(--border);
      white-space: nowrap;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .table thead th.sortable {
      cursor: pointer;
      user-select: none;
    }

    .table thead th.sortable:hover {
      background: var(--surface);
    }

    .sort-icon {
      display: inline-block;
      margin-left: 0.5rem;
      vertical-align: middle;
    }

    .table tbody td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
      color: var(--text-secondary);
    }

    .table tbody tr {
      transition: var(--transition);
    }

    .table tbody tr:hover {
      background: var(--surface-hover);
    }

    .table tbody tr.clickable {
      cursor: pointer;
    }

    .table tbody tr:last-child td {
      border-bottom: none;
    }

    .empty-cell {
      text-align: center;
      padding: 3rem 1rem !important;
    }

    .empty-state-small {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-secondary);
    }

    /* Mobile Cards */
    .mobile-cards {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mobile-card {
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 1rem;
      transition: var(--transition);
    }

    .mobile-card:hover {
      box-shadow: var(--shadow);
      border-color: var(--primary);
    }

    .mobile-card-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
    }

    .mobile-card-row:last-child {
      border-bottom: none;
    }

    .mobile-card-label {
      font-weight: 600;
      color: var(--text);
      font-size: 0.875rem;
    }

    .mobile-card-value {
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-align: end;
    }

    @media (max-width: 768px) {
      .hidden-mobile {
        display: none !important;
      }
    }

    @media (min-width: 769px) {
      .hidden-desktop {
        display: none !important;
      }
    }
  `]
})
export class TableComponent {
    @Input() columns: TableColumn[] = [];
    @Input() data: any[] = [];
    @Input() loading: boolean = false;
    @Input() responsive: boolean = true;
    @Input() clickableRows: boolean = false;
    @Input() emptyMessage: string = 'No data available';
    @Input() trackByFn: (index: number, item: any) => any = (index, item) => item.id || index;

    @ContentChild('cellTemplate') cellTemplate!: TemplateRef<any>;

    @Output() rowClick = new EventEmitter<any>();
    @Output() sort = new EventEmitter<{ key: string, direction: 'asc' | 'desc' }>();

    sortKey: string = '';
    sortDirection: 'asc' | 'desc' = 'asc';

    onRowClick(row: any) {
        if (this.clickableRows) {
            this.rowClick.emit(row);
        }
    }

    onSort(key: string) {
        if (this.sortKey === key) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortKey = key;
            this.sortDirection = 'asc';
        }
        this.sort.emit({ key, direction: this.sortDirection });
    }
}

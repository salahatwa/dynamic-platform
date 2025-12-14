import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
}

@Component({
    selector: 'app-tabs',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="tabs-container">
      <div class="tabs-header" [class.scrollable]="scrollable">
        @for (tab of tabs; track tab.id) {
          <button
            class="tab-button"
            [class.active]="activeTab === tab.id"
            [class.disabled]="tab.disabled"
            (click)="selectTab(tab.id)"
            [disabled]="tab.disabled"
          >
            @if (tab.icon) {
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="tab.icon"></svg>
            }
            <span>{{ tab.label }}</span>
          </button>
        }
        <div class="tab-indicator" [style.transform]="indicatorStyle"></div>
      </div>
      
      <div class="tabs-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
    styles: [`
    .tabs-container {
      width: 100%;
    }

    .tabs-header {
      display: flex;
      gap: 0.5rem;
      border-bottom: 2px solid var(--border);
      position: relative;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .tabs-header::-webkit-scrollbar {
      display: none;
    }

    .tabs-header.scrollable {
      scroll-behavior: smooth;
    }

    .tab-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: var(--transition);
      white-space: nowrap;
      position: relative;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
    }

    .tab-button:hover:not(.disabled):not(.active) {
      color: var(--text);
      background: var(--surface-hover);
    }

    .tab-button.active {
      color: var(--primary);
      font-weight: 600;
    }

    .tab-button.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .tab-indicator {
      position: absolute;
      bottom: -2px;
      left: 0;
      height: 2px;
      background: var(--gradient-primary);
      transition: var(--transition);
      border-radius: 2px 2px 0 0;
    }

    .tabs-content {
      padding: 1.5rem 0;
    }

    @media (max-width: 768px) {
      .tab-button {
        padding: 0.75rem 1rem;
        font-size: 0.8125rem;
      }
      
      .tabs-content {
        padding: 1rem 0;
      }
    }
  `]
})
export class TabsComponent implements AfterContentInit {
    @Input() tabs: Tab[] = [];
    @Input() activeTab: string = '';
    @Input() scrollable: boolean = false;

    @Output() tabChange = new EventEmitter<string>();

    indicatorStyle: string = '';

    ngAfterContentInit() {
        if (!this.activeTab && this.tabs.length > 0) {
            this.activeTab = this.tabs[0].id;
        }
        this.updateIndicator();
    }

    selectTab(tabId: string) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (tab && !tab.disabled) {
            this.activeTab = tabId;
            this.tabChange.emit(tabId);
            this.updateIndicator();
        }
    }

    private updateIndicator() {
        const activeIndex = this.tabs.findIndex(t => t.id === this.activeTab);
        if (activeIndex >= 0) {
            // Simple calculation - in real implementation would measure actual button widths
            const tabWidth = 150; // approximate
            this.indicatorStyle = `translateX(${activeIndex * tabWidth}px) scaleX(1)`;
        }
    }
}

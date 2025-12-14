import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RichTextInsertEvent {
    tag: string; // e.g., 'b', 'h1', 'a'
    startTag: string;
    endTag: string;
    defaultText?: string;
    hasAttributes?: boolean;
}

@Component({
    selector: 'app-rich-text-toolbar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './rich-text-toolbar.component.html',
    styleUrls: ['./rich-text-toolbar.component.css']
})
export class RichTextToolbarComponent {
    @Input() selectedText = signal('');
    @Output() insertHtml = new EventEmitter<RichTextInsertEvent>();

    // Dialog states
    showLinkDialog = signal(false);
    showImageDialog = signal(false);

    // Link Dialog
    linkUrl = signal('');
    linkText = signal('');

    // Image Dialog
    imageUrl = signal('');
    imageAlt = signal('');

    // Formatting Actions
    formatText(type: string) {
        let event: RichTextInsertEvent;

        switch (type) {
            case 'bold':
                event = { tag: 'b', startTag: '<b>', endTag: '</b>' };
                break;
            case 'italic':
                event = { tag: 'i', startTag: '<i>', endTag: '</i>' };
                break;
            case 'underline':
                event = { tag: 'u', startTag: '<u>', endTag: '</u>' };
                break;
            case 'strike':
                event = { tag: 's', startTag: '<s>', endTag: '</s>' };
                break;
            case 'h1':
                event = { tag: 'h1', startTag: '<h1>', endTag: '</h1>' };
                break;
            case 'h2':
                event = { tag: 'h2', startTag: '<h2>', endTag: '</h2>' };
                break;
            case 'h3':
                event = { tag: 'h3', startTag: '<h3>', endTag: '</h3>' };
                break;
            case 'ul':
                event = { tag: 'ul', startTag: '<ul>\n  <li>', endTag: '</li>\n</ul>', defaultText: 'List item' };
                break;
            case 'ol':
                event = { tag: 'ol', startTag: '<ol>\n  <li>', endTag: '</li>\n</ol>', defaultText: 'List item' };
                break;
            case 'quote':
                event = { tag: 'blockquote', startTag: '<blockquote>', endTag: '</blockquote>' };
                break;
            case 'code':
                event = { tag: 'code', startTag: '<code>', endTag: '</code>' };
                break;
            case 'hr':
                event = { tag: 'hr', startTag: '<hr>', endTag: '' };
                break;
            default:
                return;
        }

        this.insertHtml.emit(event);
    }

    // Dialog Openers
    openLinkDialog() {
        this.linkUrl.set('');
        this.linkText.set(this.selectedText() || '');
        this.showLinkDialog.set(true);
    }

    openImageDialog() {
        this.imageUrl.set('');
        this.imageAlt.set('');
        this.showImageDialog.set(true);
    }

    // Insert from Dialogs
    insertLink() {
        if (!this.linkUrl()) return;

        const url = this.linkUrl();
        const text = this.linkText() || url;

        this.insertHtml.emit({
            tag: 'a',
            startTag: `<a href="${url}">`,
            endTag: '</a>',
            defaultText: text,
            hasAttributes: true // Special flag to indicate we handled the content/wrapping manually if needed, or just let parent handle simple wrap
        });

        this.showLinkDialog.set(false);
    }

    insertImage() {
        if (!this.imageUrl()) return;

        const url = this.imageUrl();
        const alt = this.imageAlt();

        this.insertHtml.emit({
            tag: 'img',
            startTag: `<img src="${url}" alt="${alt}" style="max-width: 100%;">`,
            endTag: '',
            hasAttributes: true
        });

        this.showImageDialog.set(false);
    }

    closeDialog(type: string) {
        if (type === 'link') this.showLinkDialog.set(false);
        if (type === 'image') this.showImageDialog.set(false);
    }
}

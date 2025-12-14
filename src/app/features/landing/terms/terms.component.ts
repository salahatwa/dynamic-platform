import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-hero">
      <div class="container">
        <h1>Terms & Conditions</h1>
        <p>Clear guidelines that help everyone use the platform responsibly</p>
      </div>
    </section>
    <section class="page-content">
      <div class="container">
        <div class="doc">
          <h2>Acceptance</h2>
          <p>By using the platform, you agree to these terms and the privacy policy.</p>
          <h2>Usage</h2>
          <ul>
            <li>Do not misuse or attempt to break security</li>
            <li>Respect intellectual property and content ownership</li>
            <li>Comply with applicable laws and regulations</li>
          </ul>
          <h2>Liability</h2>
          <p>We provide the platform as-is and are not liable for indirect losses.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, rgba(244, 114, 182, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%); border-bottom: 1px solid var(--border); }
    .page-hero .container { max-width: 1200px; margin: 0 auto; padding: 3rem 1rem; text-align: center; }
    .page-hero h1 { font-size: 2.25rem; font-weight: 800; margin: 0 0 0.5rem; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .page-hero p { color: var(--text-secondary); }
    .page-content .container { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }
    .doc { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); padding: 2rem; }
    .doc h2 { margin: 1rem 0; font-size: 1.25rem; font-weight: 700; }
    .doc p, .doc ul { color: var(--text-secondary); }
    .doc ul { padding-left: 1.25rem; display: grid; gap: 0.5rem; }
  `]
})
export class TermsComponent {}


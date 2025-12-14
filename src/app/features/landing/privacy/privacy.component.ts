import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-hero">
      <div class="container">
        <h1>Privacy Policy</h1>
        <p>Your data is handled with care, transparency, and security</p>
      </div>
    </section>
    <section class="page-content">
      <div class="container">
        <div class="doc">
          <h2>Overview</h2>
          <p>We collect only necessary information to provide and improve our services. We do not sell personal data.</p>
          <h2>Data We Collect</h2>
          <ul>
            <li>Account information such as name and email</li>
            <li>Usage data to improve reliability and performance</li>
            <li>Audit metadata for compliance</li>
          </ul>
          <h2>Your Rights</h2>
          <ul>
            <li>Access, update, or delete your data</li>
            <li>Export your information upon request</li>
            <li>Contact us for privacy questions</li>
          </ul>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%); border-bottom: 1px solid var(--border); }
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
export class PrivacyComponent {}


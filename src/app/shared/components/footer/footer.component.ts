import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="brand">
            <div class="logo">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#gradient)"/>
                <path d="M16 8L24 16L16 24L8 16L16 8Z" fill="white"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stop-color="var(--primary)"/>
                    <stop offset="100%" stop-color="var(--secondary)"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="brand-text">Dynamic Platform</div>
            <div class="brand-sub">Modern, multilingual content platform</div>
          </div>
          <div class="links">
            <h3>Company</h3>
            <a routerLink="/about">About</a>
            <a routerLink="/contact">Contact</a>
          </div>
          <div class="links">
            <h3>Legal</h3>
            <a routerLink="/privacy">Privacy</a>
            <a routerLink="/terms">Terms</a>
          </div>
          <div class="social">
            <h3>Follow</h3>
            <div class="social-row">
              <a href="#" aria-label="Twitter" class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016 3c-2.5 0-4.5 2.17-4.5 4.5v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" class="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© {{year}} Dynamic Platform</span>
          <div class="bottom-links">
            <a routerLink="/privacy">Privacy</a>
            <a routerLink="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { border-top: 1px solid var(--glass-border); background: var(--glass-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1rem; }
    @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 600px) { .footer-grid { grid-template-columns: 1fr; } }
    .brand { display: grid; gap: 0.5rem; }
    .brand-text { font-weight: 800; font-size: 1.125rem; }
    .brand-sub { color: var(--text-secondary); }
    .links { display: grid; gap: 0.5rem; }
    .links h3, .social h3 { font-weight: 700; font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 0.25rem; }
    .links a { color: var(--text); text-decoration: none; padding: 0.25rem 0; }
    .links a:hover { color: var(--primary); }
    .social-row { display: flex; gap: 0.5rem; }
    .icon { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-secondary); }
    .icon:hover { color: var(--primary); border-color: var(--primary); background: var(--surface-hover); }
    .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--text-secondary); }
    .bottom-links { display: flex; gap: 0.75rem; }
    .bottom-links a { color: var(--text-secondary); text-decoration: none; }
    .bottom-links a:hover { color: var(--primary); }
  `]
})
export class FooterComponent { year = new Date().getFullYear(); }


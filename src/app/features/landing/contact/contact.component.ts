import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-hero">
      <div class="container">
        <h1>Contact Us</h1>
        <p>We would love to hear from you</p>
      </div>
    </section>
    <section class="page-content">
      <div class="container">
        <div class="grid-2">
          <div class="card">
            <h2>Send a Message</h2>
            <form (submit)="submit($event)" class="form">
              <div class="form-group">
                <label>Name</label>
                <input class="form-input" type="text" [(ngModel)]="form.name" name="name" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input class="form-input" type="email" [(ngModel)]="form.email" name="email" required />
              </div>
              <div class="form-group">
                <label>Message</label>
                <textarea class="form-input" rows="5" [(ngModel)]="form.message" name="message" required></textarea>
              </div>
              <button class="btn-primary" type="submit">Send</button>
              <div class="hint" *ngIf="sent">Message prepared in your email client</div>
            </form>
          </div>
          <div class="card">
            <h2>Contact Details</h2>
            <div class="details">
              <div><strong>Email:</strong> support&#64;example.com</div>
              <div><strong>Phone:</strong> +1 (555) 123-4567</div>
              <div><strong>Address:</strong> 123 Innovation Way, Tech City</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-hero { background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%); border-bottom: 1px solid var(--border); }
    .page-hero .container { max-width: 1200px; margin: 0 auto; padding: 3rem 1rem; text-align: center; }
    .page-hero h1 { font-size: 2.25rem; font-weight: 800; margin: 0 0 0.5rem; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .page-hero p { color: var(--text-secondary); }
    .page-content .container { max-width: 1000px; margin: 0 auto; padding: 2rem 1rem; }
    .grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
    @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-sm); padding: 1.5rem; }
    .form { display: grid; gap: 1rem; }
    .form-group { display: grid; gap: 0.5rem; }
    .form-input { width: 100%; padding: 0.75rem; background: var(--background); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); }
    .form-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(42,122,228,0.1); }
    .btn-primary { background: var(--primary); color: #fff; border: none; border-radius: var(--radius); padding: 0.75rem 1rem; cursor: pointer; }
    .btn-primary:hover { background: var(--primary-hover); }
    .details { display: grid; gap: 0.5rem; color: var(--text-secondary); }
    .hint { margin-top: 0.5rem; color: var(--text-secondary); }
  `]
})
export class ContactComponent {
  form = { name: '', email: '', message: '' };
  sent = false;
  submit(e: Event) {
    e.preventDefault();
    const subject = encodeURIComponent('Contact Request');
    const body = encodeURIComponent(`Name: ${this.form.name}\nEmail: ${this.form.email}\n\n${this.form.message}`);
    window.location.href = `mailto:support&#64;example.com?subject=${subject}&body=${body}`;
    this.sent = true;
  }
}


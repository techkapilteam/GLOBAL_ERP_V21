import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('global-erp');

  constructor() {
    // ── Global Tooltip Logic ──
    // Automatically adds a 'title' attribute to dropdown labels on hover
    // so the full text is visible even if truncated.
    document.addEventListener('mouseover', (e: any) => {
      const target = e.target;
      if (!target || !target.classList) return;

      const isDropdownLabel = 
        target.classList.contains('ng-value-label') || 
        target.classList.contains('p-multiselect-token-label') ||
        target.classList.contains('p-dropdown-label') ||
        target.classList.contains('ng-option-label');

      if (isDropdownLabel && !target.hasAttribute('title')) {
        const text = target.innerText || target.textContent;
        if (text) target.setAttribute('title', text.trim());
      }
    }, true);
  }
}

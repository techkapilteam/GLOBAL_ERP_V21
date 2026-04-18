import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule],
  template: `<div *ngIf="messgae" class="invalid-feedback d-block">{{ messgae }}</div>`
})
export class ValidationMessageComponent {
  @Input() messgae?: string;
}

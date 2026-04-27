import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule],
  template: `<div *ngIf="messgae" class="erp-field-error invalid-feedback" role="alert">{{ messgae }}</div>`
})
export class ValidationMessageComponent {
  @Input() messgae?: string;
}


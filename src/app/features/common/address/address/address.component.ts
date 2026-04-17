import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule],
  template: `<div></div>`
})
export class AddressComponent {
  addressForm: { value: any } = { value: {} };

  editdata(_data: any, _label: string): void {
    // placeholder
  }

  clear(): void {
    // placeholder
  }
}

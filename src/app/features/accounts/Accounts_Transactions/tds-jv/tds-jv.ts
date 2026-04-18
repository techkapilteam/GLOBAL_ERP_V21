import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// ✅ REQUIRED MODULES
import { NgSelectModule } from '@ng-select/ng-select';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-tds-jv',
  standalone: true,
  imports: [
    CommonModule,            // ✅ needed for @if
    ReactiveFormsModule,
    NgSelectModule,          // ✅ ng-select fix
    TableModule,             // ✅ p-table fix
    CheckboxModule,          // ✅ checkbox fix
    BsDatepickerModule       // ✅ datepicker fix
  ],
  templateUrl: './tds-jv.html',
  styleUrls: ['./tds-jv.css'] // make sure file exists
})
export class TdsJv {

  private fb = inject(FormBuilder);

  // ✅ Signals
  loading = signal(false);
  showTable = signal(false);
  isEmpty = signal(false);

  grid = signal<any[]>([]);

  tdsForm = this.fb.group({
    debitLedger: [null, Validators.required],
    creditLedger: [null, Validators.required],
    year: [null, Validators.required],
    month: [null, Validators.required],
    date: [new Date()],
    narration: ['', Validators.required]
  });

  // Mock data
  tdsLedgerList: any[] = [];
  ledgerList: any[] = [];
  years: any[] = [];
  months: any[] = [];

  loadData() {

    if (this.tdsForm.invalid) {
      this.tdsForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.showTable.set(false);

    setTimeout(() => {

      const data: any[] = []; // API call

      if (data.length === 0) {
        this.isEmpty.set(true);
        this.showTable.set(false);
      } else {
        this.grid.set(data);
        this.showTable.set(true);
        this.isEmpty.set(false);
      }

      this.loading.set(false);

    }, 1000);
  }

  save() {
    if (this.tdsForm.invalid) return;

    const payload = {
      ...this.tdsForm.value,
      details: this.grid()
    };

    console.log(payload);
  }

  clear() {
    this.tdsForm.reset();
    this.grid.set([]);
    this.showTable.set(false);
  }

  export() {
    console.log('Exporting...');
  }
}
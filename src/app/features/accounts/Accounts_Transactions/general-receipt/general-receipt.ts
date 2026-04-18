import { Component, computed, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonService } from '../../../../core/services/Common/common.service';
import { AccountsTransactions } from '../../../../core/services/accounts/accounts-transactions';

@Component({
  selector: 'app-general-receipt',
  standalone: true,
  imports: [RouterModule, ButtonModule, TableModule, DecimalPipe],
  templateUrl: './general-receipt.html',
  styleUrl: './general-receipt.css',
})
export class GeneralReceipt implements OnInit {

  // ── DI via inject() ────────────────────────────────────────────────────────
  private readonly _commonService = inject(CommonService);
  private readonly _accountingTransactionsService = inject(AccountsTransactions);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  // ── Signals ────────────────────────────────────────────────────────────────
  private readonly _allGridView = signal<any[]>([]);
  private readonly _searchTerm = signal<string>('');

  readonly loading = signal(false);
  readonly currencySymbol = signal('₹');

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly filteredGridView = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const data = this._allGridView();
    if (!term) return data;
    return data.filter(d =>
      (d.receipt_date?.toLowerCase() ?? '').includes(term) ||
      (d.receipt_number?.toString().toLowerCase() ?? '').includes(term) ||
      (d.modeof_receipt?.toLowerCase() ?? '').includes(term) ||
      (d.narration?.toLowerCase() ?? '').includes(term) ||
      (d.ptypeofpayment?.toLowerCase() ?? '').includes(term)
    );
  });

  // ── Pagination ─────────────────────────────────────────────────────────────
  pageSize = 10;

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.currencySymbol.set(this._commonService.currencysymbol || '₹');
    this.loadData();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  loadData(): void {
    this.loading.set(true);
    this._accountingTransactionsService.GetGeneralReceiptsData(
      this._commonService.getschemaname(),
      this._commonService.getbranchname(),
      'taxes',
      this._commonService.getCompanyCode(),
      this._commonService.getBranchCode()
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (data: any[]) => {
          this.loading.set(false);
          if (!data || data.length === 0) { this._resetGrid(); return; }
          this._allGridView.set(data.map(item => ({
            ...item,
            preceiptdate: this._commonService.getFormatDateGlobal(item.preceiptdate) || '--',
            pmodofreceipt: item.pmodofreceipt || '--',
            ptypeofpayment: item.ptypeofpayment || '',
            pChequenumber: item.pChequenumber || '',
            ptotalreceivedamount: item.ptotalreceivedamount ?? 0,
            pnarration: item.pnarration || '',
          })));
        },
        error: (err) => {
          this.loading.set(false);
          this._resetGrid();
          this._commonService.showErrorMessage(err);
        },
      });
  }

  filterDatatable(event: Event): void {
    this._searchTerm.set((event.target as HTMLInputElement).value ?? '');
  }

  viewRow(row: any): void {
    if (!row?.receipt_number) { console.error('Invalid row data'); return; }
    const receipt = btoa(`${row.receipt_number},General Receipt`);
    window.open(
      this._router.serializeUrl(this._router.createUrlTree(['/GeneralReceiptReport', receipt])),
      '_blank'
    );
  }

  getPaymentDetails(row: any): string {
    let mode = row.modeof_receipt === 'C' ? 'Cash' : row.modeof_receipt === 'B' ? 'Bank' : (row.modeof_receipt || '--');
    if (row.ptypeofpayment) {
      mode += ` (${row.ptypeofpayment}`;
      if (row.pChequenumber) mode += ` - ${row.pChequenumber}`;
      mode += ')';
    }
    return mode;
  }

  private _resetGrid(): void {
    this._allGridView.set([]);
  }
}
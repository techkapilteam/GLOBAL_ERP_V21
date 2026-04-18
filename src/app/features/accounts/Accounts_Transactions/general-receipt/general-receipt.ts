import { Component, computed, OnInit, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonService } from "../../../../core/services/Common/common.service";
import { AccountsTransactions } from "../../../../core/services/accounts/accounts-transactions";

@Component({
  selector: "app-general-receipt",
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TableModule],
  templateUrl: "./general-receipt.html",
  styleUrl: "./general-receipt.css",
})

export class GeneralReceipt implements OnInit {

  private allGridView = signal<any[]>([]);
  private searchTerm = signal<string>('');

  filteredGridView = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.allGridView();

    if (!term) return data;

    return data.filter(d =>
      (d.receipt_date?.toLowerCase() ?? '').includes(term) ||
      (d.receipt_number?.toString().toLowerCase() ?? '').includes(term) ||
      (d.modeof_receipt?.toLowerCase() ?? '').includes(term) ||
      (d.narration?.toLowerCase() ?? '').includes(term) ||
      (d.ptypeofpayment?.toLowerCase() ?? '').includes(term)
    );
  });

  loading = signal<boolean>(false);
  currencySymbol = signal<string>('₹');

  pageCriteria = {
    pageSize: 10,
    pageNumber: 1,
    TotalPages: 1,
    totalrows: 0
  };

  constructor(
    private commonService: CommonService,
    private accountingTransactionsService: AccountsTransactions,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currencySymbol.set(this.commonService.currencysymbol || '₹');
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.accountingTransactionsService
      .GetGeneralReceiptsData(
        this.commonService.getschemaname(),
        this.commonService.getbranchname(),
        'taxes',
        this.commonService.getCompanyCode(),
        this.commonService.getBranchCode()
      )
      .subscribe({
        next: (data: any[]) => {
          this.loading.set(false);
          if (!data || data.length === 0) {
            this.resetGrid();
            return;
          }

          const mapped = data.map(item => ({
            ...item,
            preceiptdate: this.commonService.getFormatDateGlobal(item.preceiptdate) || '--',
            pmodofreceipt: item.pmodofreceipt || '--',
            ptypeofpayment: item.ptypeofpayment || '',
            pChequenumber: item.pChequenumber || '',
            ptotalreceivedamount: item.ptotalreceivedamount ?? 0,
            pnarration: item.pnarration || ''
          }));

          this.allGridView.set(mapped);
          this.pageCriteria.totalrows = mapped.length;
          this.pageCriteria.TotalPages = Math.ceil(mapped.length / this.pageCriteria.pageSize);
        },
        error: (error) => {
          this.loading.set(false);
          this.resetGrid();
          this.commonService.showErrorMessage(error);
        }
      });
  }

  filterDatatable(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchTerm.set(value);
    this.pageCriteria.totalrows = this.filteredGridView().length;
  }

  viewRow(row: any): void {
    if (!row?.receipt_number) {
      console.error('Invalid row data');
      return;
    }
    const receipt = btoa(`${row.receipt_number},General Receipt`);
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/GeneralReceiptReport', receipt])
    );
    window.open(url, '_blank');
  }

  getPaymentDetails(row: any): string {
    let mode = '';
    if (row.modeof_receipt === 'C') {
      mode = 'Cash';
    } else if (row.modeof_receipt === 'B') {
      mode = 'Bank';
    } else {
      mode = row.modeof_receipt || '--';
    }
    if (row.ptypeofpayment) {
      mode += ` (${row.ptypeofpayment}`;
      if (row.pChequenumber) mode += ` - ${row.pChequenumber}`;
      mode += ')';
    }
    return mode;
  }

  private resetGrid(): void {
    this.allGridView.set([]);
    this.pageCriteria.totalrows = 0;
    this.pageCriteria.TotalPages = 1;
  }
}

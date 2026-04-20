import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { TableModule } from 'primeng/table';

import { NgSelectModule } from '@ng-select/ng-select';
import { finalize } from 'rxjs';
import { Companydetails } from '../../../common/company-details/companydetails/companydetails';
import { CommonService } from '../../../../core/services/Common/common.service';
import { AccountsReports } from '../../../../core/services/accounts/accounts-reports';
import { AccountLedger } from '../account-ledger/account-ledger';
import { PageCriteria } from '../../../../core/models/pagecriteria';

@Component({
  selector: 'app-brs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    
    BsDatepickerModule,
    TableModule,
    Companydetails,
    NgSelectModule
  ],
  templateUrl: './brs.html',
  styleUrl: './brs.css',
  providers: [DatePipe]
})
export class Brs implements OnInit {

  // ── DI ──────────────────────────────────────────────────────────────────────
  private datePipe      = inject(DatePipe);
  private router        = inject(Router);
  private fb            = inject(FormBuilder);
  private commonService = inject(CommonService);
  private bankBookService = inject(AccountsReports);
  private brstatement   = inject(AccountsReports);

  @ViewChild('myTable') table: any;

  // ── Signals ──────────────────────────────────────────────────────────────────
  readonly loading    = signal(false);
  readonly isLoading  = signal(false);
  readonly showhide   = signal(true);
  readonly show       = signal(false);
  readonly chequesInfo = signal(false);
  readonly bankData   = signal<any[]>([]);
  readonly gridView   = signal<any[]>([]);

  // ── State ────────────────────────────────────────────────────────────────────
  submitted    = false;
  printedDate  = true;
  savebutton   = 'Generate Report';
  currencysymbol: any;
  bankname     = '';
  roleid       = '';
  dbdate: any;

  startDate!: Date;
  pBankBookBalance: any;
  chequesdepositedbutnotcredited = 0;
  CHEQUESISSUEDBUTNOTCLEARED     = 0;
  Balanceasperbankbook: any;

  ChequesInfoDetails: any[]  = [];
  imageResponse: any;
  kycFileName: any;

  pageCriteria = new PageCriteria();

  // ── Datepicker configs ───────────────────────────────────────────────────────
  dpConfig:  Partial<BsDatepickerConfig> = {};
  dpConfig1: Partial<BsDatepickerConfig> = {};

  // ── Form ─────────────────────────────────────────────────────────────────────
  BRStatmentForm!: FormGroup;

  get f(): { [key: string]: AbstractControl } {
    return this.BRStatmentForm.controls;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.dbdate = sessionStorage.getItem('Dbtime');
    this.roleid = sessionStorage.getItem('roleid') || '';

    this.setPageModel();

    this.BRStatmentForm = this.fb.group(
      {
        fromDate:      [this.dbdate ? new Date(this.dbdate) : new Date(), Validators.required],
        toDate:        [new Date()],
        bankAccountId: ['',  Validators.required],
        pbankbalance:  [0,   [Validators.required, Validators.min(0)]],
        pFilename:     ['']
      },
      { validators: this.dateRangeValidator }
    );

    this.initializeDatePicker();
    this.bankBookDetails();
  }

  // ── Validators ────────────────────────────────────────────────────────────────
  private dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const fromControl = group.get('fromDate');
    const toControl   = group.get('toDate');
    const from = fromControl?.value;
    const to   = toControl?.value;
    if (!fromControl?.touched && !toControl?.touched) return null;
    if (from && to && new Date(from) > new Date(to)) return { dateRangeInvalid: true };
    return null;
  }

  // ── Datepicker init ───────────────────────────────────────────────────────────
  private initializeDatePicker(): void {
    this.currencysymbol = this.commonService.datePickerPropertiesSetup('currencysymbol');

    this.dpConfig = {
      dateInputFormat: 'DD-MMM-YYYY',
      containerClass:  'theme-dark-blue',
      showWeekNumbers: false,
      maxDate:         new Date()
    };

    this.dpConfig1 = { ...this.dpConfig };

    if (!this.chequesInfo() && this.roleid !== '2') {
      this.dpConfig = {
        ...this.dpConfig,
        minDate: new Date(new Date(this.dbdate!).setDate(new Date(this.dbdate!).getDate() - 3))
      };
    }
  }

  // ── Datepicker handlers ───────────────────────────────────────────────────────
  onFromDateChange(event: Date): void {
    this.dpConfig1 = { ...this.dpConfig1, minDate: event };
  }

  onToDateChange(event: Date): void {
    this.dpConfig = { ...this.dpConfig, maxDate: event };
  }

  fromdateChange(event: Date): void {
    this.dpConfig1 = { ...this.dpConfig1, minDate: new Date(event) };
    this.BRStatmentForm.get('toDate')?.enable();
    this.BRStatmentForm.patchValue({ toDate: new Date() });
  }

  // ── Page model ────────────────────────────────────────────────────────────────
  private setPageModel(): void {
    this.pageCriteria.pageSize         = this.commonService.pageSize;
    this.pageCriteria.offset           = 0;
    this.pageCriteria.pageNumber       = 1;
    this.pageCriteria.footerPageHeight = 50;
  }

  // ── Cheques info toggle ───────────────────────────────────────────────────────
  onChequesInfoChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.chequesInfo.set(checked);
    this.gridView.set([]);
    this.showhide.set(true);

    this.BRStatmentForm.patchValue({ fromDate: new Date(), pbankbalance: 0, pFilename: '' });

    this.dpConfig = {
      ...this.dpConfig,
      minDate: checked
        ? undefined
        : new Date(new Date(this.dbdate!).setDate(new Date(this.dbdate!).getDate() - 3))
    };
  }

  onFooterPageChange(event: any): void {
    this.pageCriteria.offset = event.page - 1;
  }

  // ── Load banks ────────────────────────────────────────────────────────────────
  bankBookDetails(): void {
    this.bankBookService
      .GetBankNames(
        this.commonService.getschemaname(),
        this.commonService.getbranchname(),
        this.commonService.getCompanyCode(),
        this.commonService.getBranchCode()
      )
      .subscribe({
        next: (res) => this.bankData.set(res),
        error: (err) => this.commonService.showErrorMessage(err)
      });
  }

  // ── Generate report ───────────────────────────────────────────────────────────
  getBRStatmentReports(): void {
    this.submitted = true;
    if (this.BRStatmentForm.invalid) {
      this.BRStatmentForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.isLoading.set(true);
    this.showhide.set(false);
    this.savebutton = 'Processing';
    this.startDate  = new Date(this.BRStatmentForm.value.fromDate);

    const fromDate       = this.commonService.getFormatDateNormal(this.BRStatmentForm.value.fromDate) ?? '';
    const toDate         = this.commonService.getFormatDateNormal(this.BRStatmentForm.value.toDate)   ?? '';
    const _pBankAccountId = this.BRStatmentForm.value.bankAccountId;

    if (!this.chequesInfo()) {
      this.brstatement
        .GetBrStatementReportByDates(
          fromDate, _pBankAccountId,
          this.commonService.getbranchname(),
          this.commonService.getBranchCode(),
          this.commonService.getCompanyCode(),
          this.commonService.getschemaname()
        )
        .subscribe({
          next: (res: any[]) => {
            this.gridView.set(res ?? []);
            this.show.set(true);
            this.loading.set(false);
            this.isLoading.set(false);
            this.savebutton = 'Generate Report';

            const selectedBank = this.bankData().find(b => b.bankAccountId == _pBankAccountId);
            this.bankname = selectedBank?.bankName ?? '';

            this.pBankBookBalance = parseFloat(res[0]?.pbankbalance) || 0;

            this.chequesdepositedbutnotcredited = res
              .filter(r => r.pGroupType === 'CHEQUES DEPOSITED BUT NOT CREDITED')
              .reduce((sum, r) => sum + parseFloat(r.ptotalreceivedamount || 0), 0);

            this.CHEQUESISSUEDBUTNOTCLEARED = res
              .filter(r => r.pGroupType === 'CHEQUES ISSUED BUT NOT CLEARED')
              .reduce((sum, r) => sum + parseFloat(r.ptotalreceivedamount || 0), 0);

            this.Balanceasperbankbook = this.pBankBookBalance
              - this.chequesdepositedbutnotcredited
              + this.CHEQUESISSUEDBUTNOTCLEARED;

            this.BRStatmentForm.patchValue({ pbankbalance: this.Balanceasperbankbook });
          },
          error: (err: any) => {
            this.commonService.showErrorMessage(err);
            this.loading.set(false);
            this.isLoading.set(false);
          }
        });
    } else {
      const formattedFrom = new Date(this.BRStatmentForm.value.fromDate).toLocaleDateString('en-CA');
      const formattedTo   = new Date(this.BRStatmentForm.value.toDate).toLocaleDateString('en-CA');

      this.brstatement
        .GetBrStatementReportByDatesChequesInfo(
          formattedFrom, formattedTo, _pBankAccountId,
          this.commonService.getbranchname(),
          this.commonService.getschemaname(),
          this.commonService.getCompanyCode(),
          this.commonService.getBranchCode()
        )
        .pipe(finalize(() => {
          this.loading.set(false);
          this.isLoading.set(false);
          this.savebutton = 'Generate Report';
        }))
        .subscribe({
          next: (res: any[]) => {
            const from = new Date(this.BRStatmentForm.value.fromDate);
            const to   = new Date(this.BRStatmentForm.value.toDate);
            this.ChequesInfoDetails = (res ?? []).filter(item => {
              if (!item.depositeddate) return false;
              const dep = new Date(item.depositeddate);
              return dep >= from && dep <= to;
            });

            if (this.ChequesInfoDetails.length > 0) {
              this.export();
            } else {
              this.commonService.showWarningMessage('BRS Cheques Info No Data to Display.');
            }
          },
          error: (err: any) => this.commonService.showErrorMessage(err)
        });
    }
  }

  // ── Export ────────────────────────────────────────────────────────────────────
  export(): void {
    const rows = this.ChequesInfoDetails.map(element => ({
      'Branch Name':                      element.branch_name,
      'Contact Name':                     element.contact_name,
      'Self Cheque Status':               element.selfchequestatus ? 'True' : 'False',
      'Receipt ID':                       element.receiptid,
      'Receipt Date':                     this.datePipe.transform(element.receiptdate, 'dd-MMM-yyyy'),
      'Total Received Amount':            this.commonService.currencyformat(element.total_received_amount),
      'Mode of Receipt':                  element.modeof_receipt,
      'Reference Number':                 element.reference_number,
      'Reference Text':                   element.referencetext || '',
      'Cheque Date':                      this.datePipe.transform(element.chequedate, 'dd-MMM-yyyy'),
      'Deposit Status':                   element.deposit_status || '',
      'Cheque Bank':                      element.cheque_bank || '',
      'Receipt Branch Name':              element.receipt_branch_name || '',
      'Received From':                    element.received_from || '',
      'Transaction No':                   element.transaction_no,
      'Transaction Date':                 this.datePipe.transform(element.transaction_date, 'dd-MMM-yyyy'),
      'Chit Receipt Number':              element.comman_receipt_no || '',
      'Cleared / Cancel / Returned Date': this.datePipe.transform(element.clear_date, 'dd-MMM-yyyy'),
      'Deposited Date':                   this.datePipe.transform(element.depositeddate, 'dd-MMM-yyyy'),
      'DateTime':                         element.time || '',
      'BankName':                         element.bankname || '',
      'Cleared By':                       element.user || '--'
    }));

    this.commonService.exportAsExcelFile(rows, 'BRS Cheques Info');
  }

  // ── PDF / Print ───────────────────────────────────────────────────────────────
  pdfOrprint(type: string): void {
    if (!this.gridView().length) return;

    const fmt = (dateVal: any): string => {
      if (!dateVal) return '';
      const d = (dateVal?.year && dateVal?.month && dateVal?.day)
        ? new Date(dateVal.year, dateVal.month - 1, dateVal.day)
        : new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      return `${String(d.getDate()).padStart(2, '0')}-${d.toLocaleString('en-US', { month: 'short' })}-${d.getFullYear()}`;
    };

    const rows: any[]     = [];
    const gridheaders     = ['Transaction Date', 'Cheque No.', 'Particulars', 'Amount'];
    const groupOrder: string[] = [];
    const grouped: Record<string, any[]> = {};

    this.gridView().forEach((item: any) => {
      const key = item.pGroupType || 'OTHER';
      if (!grouped[key]) { grouped[key] = []; groupOrder.push(key); }
      grouped[key].push(item);
    });

    groupOrder.forEach(groupName => {
      rows.push([{ content: groupName, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [220, 220, 220], textColor: [0, 0, 0], halign: 'left' } }]);
      let groupTotal = 0;
      grouped[groupName].forEach((element: any) => {
        groupTotal += Number(element.ptotalreceivedamount || 0);
        rows.push([
          fmt(element.ptransactiondate),
          element.pChequeNumber || '',
          element.pparticulars  || '--NA--',
          this.commonService.convertAmountToPdfFormat(element.ptotalreceivedamount)
        ]);
      });
      rows.push([
        { content: 'Total :', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240] } },
        { content: this.commonService.convertAmountToPdfFormat(String(groupTotal.toFixed(2))), colSpan: 1, styles: { fontStyle: 'bold', halign: 'right', fillColor: [240, 240, 240], cellWidth: 30, minCellWidth: 20 } }
      ]);
    });

    this.commonService._downloadBRSReportsPdf(
      'BRS', rows, gridheaders, {}, 'a4', 'As On',
      fmt(this.BRStatmentForm.value.fromDate),
      new Date().toLocaleDateString(),
      String(this.pBankBookBalance),
      String(this.chequesdepositedbutnotcredited),
      String(this.CHEQUESISSUEDBUTNOTCLEARED),
      String(this.Balanceasperbankbook),
      type, this.bankname
    );
  }

  // ── File upload ───────────────────────────────────────────────────────────────
  private validateFile(fileName: string): boolean {
    if (!fileName) return true;
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'png', 'pdf'].includes(ext || '');
  }

  uploadAndProgress(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    if (!this.validateFile(input.value)) {
      this.commonService.showWarningMessage('Upload jpg, png or pdf files');
      return;
    }

    const formData = new FormData();
    Array.from(input.files).forEach(file => formData.append(file.name, file));

    this.commonService.fileUploadS3('BPO', formData).subscribe(data => {
      this.kycFileName = data[0];
      this.BRStatmentForm.patchValue({ pFilename: this.kycFileName });
    });
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  saveWithPrint(): void {
    if (!this.BRStatmentForm.value.pFilename) {
      this.commonService.showWarningMessage('Upload Document Required');
      return;
    }

    this.brstatement
      .SaveBrs(JSON.stringify({ '_BrsDTO': this.gridView() }))
      .subscribe(() => {
        this.commonService.showSuccessMsg('success');
        this.BRStatmentForm.patchValue({ pbankbalance: 0 });
      });
  }

  // ── Row group helpers ─────────────────────────────────────────────────────────
  toggleExpandGroup(group: any): void {
    this.table?.groupHeader?.toggleExpandGroup(group);
  }

  onDetailToggle(event: any): void {
    console.log('Detail Toggled', event);
  }
}

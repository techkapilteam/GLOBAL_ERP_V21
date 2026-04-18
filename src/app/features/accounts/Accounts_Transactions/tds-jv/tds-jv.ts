import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  NonNullableFormBuilder,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { NgSelectModule } from '@ng-select/ng-select';
// import { NgxDatatableModule, ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { TableModule } from 'primeng/table';

// import { PageCriteria } from '../../../Models/pageCriteria';
// import { CommonService } from '../../../services/common.service';
// import { SscagendsService } from '../../../services/HRMS/sscagends.service';
// import { HrmsemployeeattendanceService } from '../../../services/HRMS/hrmsemployeeattendance.service';
// import { AccountingTransactionsService } from '../../../services/Transactions/AccountingTransaction/accounting-transaction.service';
// import { HrmspayrollprocessService } from '../../../services/HRMS/hrmspayrollprocess.service';
import { ValidationMessageComponent } from '../../../common/validation-message/validation-message.component';
import { CommonService } from '../../../../core/services/Common/common.service';
import { AccountsTransactions } from '../../../../core/services/accounts/accounts-transactions';

@Component({
  selector: 'app-tds-jv',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    
    BsDatepickerModule,
    TableModule,
    ValidationMessageComponent,
  ],
  templateUrl: './tds-jv.component.html',
  styleUrls: ['./tds-jv.component.scss'],
  providers: [CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TdsJvComponent implements OnInit, OnDestroy {
  // ── Injected Services ────────────────────────────────────────────────────────
  private readonly fb = inject(FormBuilder);
  private readonly commonService = inject(CommonService);
  private readonly employeeAttendService = inject(AccountsTransactions);
  private readonly accountingTransactionsService = inject(AccountsTransactions);
  private readonly datePipe = inject(DatePipe);

  // ── Destroy Subject ──────────────────────────────────────────────────────────
  private readonly destroy$ = new Subject<void>();

  // ── Signals ──────────────────────────────────────────────────────────────────
  readonly isTableVisible = signal(false);
  readonly isDataEmpty = signal(false);
  readonly allRowsSelected = signal(false);
  readonly isExists = signal(false);
  readonly isShowProcessing = signal(false);
  readonly isSaveProcessing = signal(false);

  readonly tdsJvDetailsGrid = signal<any[]>([]);
  readonly selectedValues = signal<any[]>([]);
  readonly calendarYearData = signal<any[]>([]);
  readonly calendarMonthData = signal<any[]>([]);
  readonly employeeList = signal<any[]>([]);
  readonly tdsledgeraccountslist = signal<any[]>([]);
  readonly ledgeraccountslist = signal<any[]>([]);
  readonly jvdetailslist = signal<any[]>([]);

  // ── Computed ──────────────────────────────────────────────────────────────────
  readonly totalDebitAmount = computed(() =>
    this.selectedValues().reduce((sum, r) => sum + Number(r?.debit_amount || 0), 0)
  );
  readonly totalCreditAmount = computed(() =>
    this.selectedValues().reduce((sum, r) => sum + Number(r?.credit_amount || 0), 0)
  );
  readonly showButtonLabel = computed(() => (this.isShowProcessing() ? 'Processing...' : 'Show'));
  readonly saveButtonLabel = computed(() => (this.isSaveProcessing() ? 'Processing...' : 'Save'));

  // ── Form ─────────────────────────────────────────────────────────────────────
  tdsJvDetailsForm!: FormGroup;
  formValidationMessages: Record<string, string> = {};

  // ── Table / UI State ─────────────────────────────────────────────────────────
  readonly ColumnMode = ColumnMode;
  readonly SelectionType = SelectionType;
  readonly dpConfig: Partial<BsDatepickerConfig> = {
    maxDate: new Date(),
    containerClass: 'theme-dark-blue',
    dateInputFormat: 'DD-MMM-YYYY',
    showWeekNumbers: false,
  };

  pageCriteria = new PageCriteria();
  disableTransactionDate = false;
  currencySymbol = '';
  employeeCode = 'All';

  // Month tracking
  private monthName = '';
  private calendarYear = '';
  private calendarId: any;
  private monthId: any;

  // Button styles for current/previous month toggle
  readonly btnSelected = 'btn btn-primary text-white';
  readonly btnNotSelected = 'btn btn-default border';
  currentMonthBtnClass = this.btnSelected;
  previousMonthBtnClass = this.btnNotSelected;

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.initCompanyConfig();
    this.buildForm();
    this.setupPageModel();
    this.loadInitialData();
    this.setupFormBlurEvents();

    this.tdsJvDetailsForm.controls['preceiptdate'].setValue(new Date());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private Initialisation ───────────────────────────────────────────────────
  private initCompanyConfig(): void {
    const company = this.commonService.comapnydetails;
    this.currencySymbol = this.commonService.datePickerPropertiesSetup('currencysymbol');

    if (company != null) {
      this.disableTransactionDate =
        company.pdatepickerenablestatus || company.pfinclosingjvallowstatus;
    }
  }

  private buildForm(): void {
    this.tdsJvDetailsForm = this.fb.group({
      pPeriodType: [null, Validators.required],
      DebitLedger: [null, Validators.required],
      pCalendarMonth: [null, Validators.required],
      CreditLedger: [null, Validators.required],
      preceiptdate: [''],
      pnarration: [''],
    });
  }

  private setupPageModel(): void {
    this.pageCriteria.pageSize = this.commonService.pageSize;
    this.pageCriteria.offset = 0;
    this.pageCriteria.pageNumber = 1;
    this.pageCriteria.footerPageHeight = 50;
  }

  private loadInitialData(): void {
    const branchId = this.commonService.comapnydetails?.pbranchid;
    this.jvdetailslist.set(this.commonService.hrmsjvtypes ?? []);

    this.loadTdsLedgerAccounts();
    this.loadPaymentVoucherAccounts();
    this.loadCalendarYears();
    this.setCurrentMonth();
  }

  // ── Data Loading ─────────────────────────────────────────────────────────────
  private loadTdsLedgerAccounts(): void {
    this.accountingTransactionsService
      .GettdsLedgerAccountsList1(
        'TDS JV',
        this.commonService.getbranchname(),
        this.commonService.getCompanyCode(),
        this.commonService.getBranchCode(),
        this.commonService.getschemaname()
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data) this.tdsledgeraccountslist.set(data);
        },
        error: (err: any) => this.commonService.showErrorMessage(err),
      });
  }

  private loadPaymentVoucherAccounts(): void {
    this.accountingTransactionsService
      .GettdsLedgerAccountsList1(
        'PAYMENT VOUCHER',
        this.commonService.getbranchname(),
        this.commonService.getCompanyCode(),
        this.commonService.getBranchCode(),
        this.commonService.getschemaname()
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data) this.ledgeraccountslist.set(data);
        },
        error: (err: any) => this.commonService.showErrorMessage(err),
      });
  }

  private loadCalendarYears(): void {
    this.employeeAttendService
      .GetCalendarYear(this.commonService.getschemaname())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data) this.calendarYearData.set(data);
        },
      });
  }

  private loadCalendarMonths(): void {
    this.calendarMonthData.set([]);

    this.employeeAttendService
      .GetTDSJVCalendarYearMonth(this.calendarId, this.commonService.getschemaname())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (data) this.calendarMonthData.set(data);
        },
      });
  }

  // ── Month Selection ──────────────────────────────────────────────────────────
  setCurrentMonth(): void {
    this.formValidationMessages = {};
    this.currentMonthBtnClass = this.btnSelected;
    this.previousMonthBtnClass = this.btnNotSelected;

    const today = this.datePipe.transform(new Date(), 'dd-MMM-yyyy')!;
    this.applyMonthDate(today);

    this.tdsJvDetailsForm.controls['pPeriodType'].setValue(null);
    this.tdsJvDetailsForm.controls['pCalendarMonth'].setValue(null);
  }

  setPreviousMonth(): void {
    this.formValidationMessages = {};
    this.previousMonthBtnClass = this.btnSelected;
    this.currentMonthBtnClass = this.btnNotSelected;

    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);
    const formatted = this.datePipe.transform(prev, 'dd-MMM-yyyy') ?? '';
    this.applyMonthDate(formatted);

    this.tdsJvDetailsForm.controls['pPeriodType'].setValue(null);
    this.tdsJvDetailsForm.controls['pCalendarMonth'].setValue(null);

    this.tdsJvDetailsForm.controls['pPeriodType'].clearValidators();
    this.tdsJvDetailsForm.controls['pCalendarMonth'].clearValidators();
  }

  private applyMonthDate(dateStr: string): void {
    const parts = dateStr.split('-');
    this.monthName = `${parts[1]}-${parts[2]}`;
    const year = parseInt(parts[2]) - 1;
    this.calendarYear = `${year}-${parts[2]}`;
  }

  // ── Dropdown Event Handlers ───────────────────────────────────────────────────
  onJvTypeChange(event: any): void {
    if (!event) {
      this.tdsJvDetailsGrid.set([]);
    }
  }

  onCalendarYearChange(event: any): void {
    this.previousMonthBtnClass = this.btnNotSelected;
    this.currentMonthBtnClass = this.btnNotSelected;
    this.monthName = '';
    this.tdsJvDetailsForm.controls['pCalendarMonth'].setValue(null);

    if (event) {
      this.calendarId = event.calendarPeriodId;
      this.calendarYear = event.periodType;
      this.loadCalendarMonths();

      const monthCtrl = this.tdsJvDetailsForm.controls['pCalendarMonth'];
      monthCtrl.setValidators([Validators.required]);
      monthCtrl.updateValueAndValidity();

      this.formValidationMessages = {};
    } else {
      this.calendarMonthData.set([]);
      this.tdsJvDetailsGrid.set([]);
      this.formValidationMessages = {};
    }
  }

  onCalendarMonthChange(event: any): void {
    if (event) {
      this.monthId = event.calendarPeriodDetailsId;
      this.monthName = event.calendarMonth;
    }
  }

  // ── Grid Data Loading ─────────────────────────────────────────────────────────
  loadTdsJvDetails(): void {
    this.selectedValues.set([]);
    this.isTableVisible.set(false);
    this.isDataEmpty.set(false);
    this.tdsJvDetailsGrid.set([]);

    const creditLedger = this.tdsJvDetailsForm.controls['CreditLedger'].value;
    const debitLedger = this.tdsJvDetailsForm.controls['DebitLedger'].value;
    const selectedMonth = this.tdsJvDetailsForm.controls['pCalendarMonth'].value;
    const monthYear = (this.monthName || selectedMonth || '').toString().toUpperCase();

    if (!debitLedger) {
      this.commonService.showWarningMessage('Please select Debit Ledger');
      this.tdsJvDetailsForm.controls['DebitLedger'].markAsTouched();
      return;
    }
    if (!creditLedger) {
      this.commonService.showWarningMessage('Please select Credit Ledger');
      this.tdsJvDetailsForm.controls['CreditLedger'].markAsTouched();
      return;
    }
    if (!monthYear) {
      this.commonService.showWarningMessage('Please select Year and Month');
      return;
    }

    this.isShowProcessing.set(true);

    this.accountingTransactionsService
      .GettdsJVDetails(
        this.commonService.getbranchname(),
        creditLedger,
        monthYear,
        debitLedger,
        this.commonService.getschemaname(),
        this.commonService.getBranchCode(),
        this.commonService.getCompanyCode()
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any[]) => {
          const validRecords = (res ?? []).filter(
            (item: any) =>
              (item.particulars && item.particulars.trim() !== '') ||
              Number(item.debit_amount) > 0 ||
              Number(item.credit_amount) > 0
          );

          if (validRecords.length > 0) {
            const mapped = validRecords.map((item: any) => ({
              ...item,
              debit_amount: Number(item.debit_amount) || 0,
              credit_amount: Number(item.credit_amount) || 0,
            }));

            this.tdsJvDetailsGrid.set(mapped);
            this.isTableVisible.set(true);
            this.isDataEmpty.set(false);

            this.pageCriteria.totalrows = mapped.length;
            this.pageCriteria.TotalPages = Math.ceil(mapped.length / this.pageCriteria.pageSize);
            this.pageCriteria.currentPageRows = Math.min(mapped.length, this.pageCriteria.pageSize);

            this.checkDuplicates(debitLedger, monthYear);
          } else {
            this.tdsJvDetailsGrid.set([]);
            this.isTableVisible.set(false);
            this.isDataEmpty.set(true);
            this.isExists.set(false);
          }

          this.isShowProcessing.set(false);
        },
        error: (err: any) => {
          this.tdsJvDetailsGrid.set([]);
          this.isTableVisible.set(false);
          this.isDataEmpty.set(true);
          this.isExists.set(false);
          this.isShowProcessing.set(false);
          this.commonService.showErrorMessage(err);
        },
      });
  }

  private checkDuplicates(debitLedger: string, monthYear: string): void {
    this.accountingTransactionsService
      .GetTDSJVDetailsDuplicateCheck(
        this.commonService.getbranchname(),
        debitLedger,
        monthYear,
        this.commonService.getschemaname(),
        this.commonService.getCompanyCode(),
        this.commonService.getBranchCode()
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        this.isExists.set(!(result > 0));
      });
  }

  // ── Selection ────────────────────────────────────────────────────────────────
  onSelectionChange(event: any): void {
    this.selectedValues.set(event ?? []);
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  saveJVDetails(): void {
    try {
      const selected = this.selectedValues();

      if (selected.length === 0) {
        this.commonService.showWarningMessage('No rows selected');
        return;
      }

      const creditRows = selected.filter((r) => r.account_trans_type === 'C');
      const debitRows = selected.filter((r) => r.account_trans_type === 'D');

      if (creditRows.length === 0 || debitRows.length === 0) {
        this.commonService.showWarningMessage(
          'Please select at least one Debit and one Credit row'
        );
        return;
      }

      const totalDebit = debitRows.reduce((sum, r) => sum + Number(r.debit_amount || 0), 0);
      const totalCredit = creditRows.reduce((sum, r) => sum + Number(r.credit_amount || 0), 0);

      if (totalDebit !== totalCredit) {
        this.commonService.showWarningMessage('Debit and Credit amounts must be equal');
        return;
      }

      if (!confirm('Do you want to save?')) return;

      this.isSaveProcessing.set(true);

      const payload = {
        model: 'JOURNAL VOUCHER',
        global_schema: this.commonService.getschemaname(),
        branch_schema: this.commonService.getbranchname(),
        company_code: this.commonService.getCompanyCode(),
        branch_code: this.commonService.getBranchCode(),
        createdby: Number(this.commonService.getCreatedBy()) || 0,
        ipaddress: this.commonService.getIpAddress() || '',
        transaction_date: this.commonService.getFormatDateNormal(
          this.tdsJvDetailsForm.controls['preceiptdate'].value
        ),
        payroll_month: this.monthName,
        jv_type: this.tdsJvDetailsForm.controls['DebitLedger'].value,
        narration: this.tdsJvDetailsForm.controls['pnarration']?.value || '',
        jv_details: selected.map((row) => ({
          account_id: String(row.account_id),
          account_trans_type: row.account_trans_type,
          particulars: row.particulars || '',
          debit_amount: String(row.account_trans_type === 'D' ? row.debit_amount || 0 : 0),
          credit_amount: String(row.account_trans_type === 'C' ? row.credit_amount || 0 : 0),
        })),
      };

      this.accountingTransactionsService
        .saveTDSjvdetails(JSON.stringify(payload))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.commonService.showSuccessMessage();
            this.clearAll();
            this.isSaveProcessing.set(false);
          },
          error: (err: any) => {
            this.isSaveProcessing.set(false);
            this.commonService.showErrorMessage(err);
          },
        });
    } catch (err: any) {
      this.isSaveProcessing.set(false);
      this.commonService.exceptionHandlingMessages('JVDetails', 'saveJVDetails', err);
    }
  }

  // ── Clear / Reset ─────────────────────────────────────────────────────────────
  clearAll(): void {
    this.buildForm();
    this.tdsJvDetailsGrid.set([]);
    this.selectedValues.set([]);
    this.calendarMonthData.set([]);
    this.formValidationMessages = {};
    this.monthName = '';
    this.calendarYear = '';
    this.employeeList.set([]);
    this.employeeCode = 'All';
    this.allRowsSelected.set(false);
    this.isTableVisible.set(false);
    this.isDataEmpty.set(false);

    this.tdsJvDetailsForm.controls['preceiptdate'].setValue(new Date());
    this.setCurrentMonth();
  }

  // ── Export ────────────────────────────────────────────────────────────────────
  export(): void {
    const rows = this.tdsJvDetailsGrid().map((item: any) => ({
      Particulars: item.particulars,
      'Debit Amount': item.debit_amount !== 0 ? item.debit_amount : 0,
      'Credit Amount': item.credit_amount !== 0 ? item.credit_amount : 0,
    }));

    this.commonService.exportAsExcelFile(rows, 'TDS-Jv');
  }

  // ── Pagination ────────────────────────────────────────────────────────────────
  onFooterPageChange(event: any): void {
    this.pageCriteria.offset = event.page - 1;
    if (this.pageCriteria.totalrows < event.page * this.pageCriteria.pageSize) {
      this.pageCriteria.currentPageRows =
        this.pageCriteria.totalrows % this.pageCriteria.pageSize;
    } else {
      this.pageCriteria.currentPageRows = this.pageCriteria.pageSize;
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  private setupFormBlurEvents(): void {
    Object.keys(this.tdsJvDetailsForm.controls).forEach((key) => {
      const ctrl = this.tdsJvDetailsForm.get(key);
      if (ctrl?.validator) {
        ctrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.validateControl(this.tdsJvDetailsForm, key);
        });
      }
    });
  }

  private validateControl(group: FormGroup, key: string): void {
    const ctrl = group.get(key);
    if (!ctrl || !ctrl.validator) return;

    this.formValidationMessages[key] = '';

    if (ctrl.errors && (ctrl.touched || ctrl.dirty)) {
      const el = document.getElementById(key) as HTMLInputElement;
      const labelName = el?.title || key;

      for (const errKey in ctrl.errors) {
        if (errKey) {
          const msg = this.commonService.getValidationMessage(ctrl, errKey, labelName, key, '');
          this.formValidationMessages[key] += msg + ' ';
        }
      }
    }
  }

  checkValidations(group: FormGroup): boolean {
    let isValid = true;
    Object.keys(group.controls).forEach((key) => {
      const ctrl = group.get(key);
      if (ctrl instanceof FormGroup) {
        if (!this.checkValidations(ctrl)) isValid = false;
      } else if (ctrl?.validator) {
        this.validateControl(group, key);
        if (ctrl.invalid) isValid = false;
      }
    });
    return isValid;
  }

  // ── Utility ────────────────────────────────────────────────────────────────────
  formatAmount(amount: any): string {
    const num = Number(amount);
    return isNaN(num) || num === 0 ? '' : num.toFixed(2);
  }

  getNarrationLength(): number {
    return this.tdsJvDetailsForm.get('pnarration')?.value?.length || 0;
  }

  isNarrationNearLimit(): boolean {
    return this.getNarrationLength() >= 250;
  }
}
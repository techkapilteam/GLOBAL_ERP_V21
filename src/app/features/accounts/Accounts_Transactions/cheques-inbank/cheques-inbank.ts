import { Component, OnInit, ViewChild, Input, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder
} from '@angular/forms';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { ValidationMessageComponent } from '../../../common/validation-message/validation-message.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent } from 'primeng/table';
import { NgSelectModule } from '@ng-select/ng-select';
import { NumberToWordsPipe } from '../../../../shared/pipes/number-to-words-pipe';
import { AccountsTransactions } from '../../../../core/services/accounts/accounts-transactions';
import { CommonService } from '../../../../core/services/Common/common.service';
import { PageCriteria } from '../../../../core/models/pagecriteria';

declare var $: any;
type AOA = any[][];

@Component({
  selector: 'app-cheques-in-bank',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    NgSelectModule,
    BsDatepickerModule,
    ReactiveFormsModule,
    PaginatorModule,
    ValidationMessageComponent,
    TableModule,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './cheques-inbank.html',
  styleUrls: ['./cheques-inbank.css'],
  providers: [DatePipe, NumberToWordsPipe, CurrencyPipe],
})
export class ChequesInbank implements OnInit {

  // ── Injected services ──────────────────────────────────────────────────────
  private readonly _accountingtransaction = inject(AccountsTransactions);
  private readonly fb = inject(FormBuilder);
  private readonly datepipe = inject(DatePipe);
  private readonly _commonService = inject(CommonService);
  private readonly _noticeservice = inject(AccountsTransactions);
  private readonly numbertowords = inject(NumberToWordsPipe);

  // ── Inputs ─────────────────────────────────────────────────────────────────
  @Input() fromFormName: any;

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly gridData = signal<any[]>([]);
  readonly gridLoading = signal(false);
  readonly searchloading = signal(false);
  readonly preferdrows = signal(false);
  readonly banknameshowhide = signal(false);
  readonly saveshowhide = signal(false);
  readonly showhidegridcolumns = signal(false);
  readonly showhidegridcolumns2 = signal(false);
  readonly hiddendate = signal(true);
  readonly brsdateshowhidecleared = signal(false);
  readonly brsdateshowhidereturned = signal(false);
  readonly disablesavebutton = signal(false);
  readonly returnChargesError = signal(false);
  readonly validatebrsdateclear = signal(false);
  readonly validatebrsdatereturn = signal(false);

  // ── Plain properties ───────────────────────────────────────────────────────
  currencyCode = 'INR';
  readonly printedOn: string = new Date().toISOString();
  rowHeight: number | 'auto' = 50;
  selectedBankName: any;
  fromdate1: any;
  todate1: any;

  totalElements: number | undefined;
  startindex: any;
  public today: number = Date.now();
  public todayDate: any;
  endindex: any;
  selectedTab = 'all';
  tabsShowOrHideBasedOnfromFormName = false;
  BanksList: any[] = [];
  previewdetails: any = [];
  chequerwturnvoucherdetails: any = [];
  ChequesInBankData: any[] = [];
  _countData: any = [];
  gridDatatemp: any[] = [];
  gridExcel: any = [];
  ChequesClearReturnData: any[] = [];
  DataForSaving: any[] = [];

  all: any;
  chequesdeposited: any;
  amounttotal: any;
  Totlaamount: any;
  onlinereceipts: any;
  bankbalancetype: any;
  cleared: any;
  returned: any;
  currencySymbol: any;
  PopupData: any;
  bankdetails: any;
  bankid: any;
  datetitle: any;
  validate: any;
  bankname = '';
  brsdate: any;
  bankbalancedetails: any;
  bankbalance: any;
  userBranchType: any;
  ChequesClearReturnDataBasedOnBrs: any;

  status = '';
  pdfstatus = 'All';
  buttonname = 'Save';
  chequenumber: any;
  showicons = true;

  ChequesInBankForm!: FormGroup;
  BrsDateForm!: FormGroup;
  ChequesInBankValidation: any = {};
  schemaname: any;
  pageCriteria: PageCriteria;
  pageCriteria2: PageCriteria;
  public pageSize = 10;
  public checkbox = false;
  disabletransactiondate = false;
  displayGridBasedOnFormName: boolean | undefined;
  displayGridDataBasedOnForm: any;
  displayGridDataBasedOnFormTemp: any;
  chequereturncharges: any;

  public ptransactiondateConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public pchequecleardateConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public brsfromConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();
  public brstoConfig: Partial<BsDatepickerConfig> = new BsDatepickerConfig();

  modeofreceipt = '';
  _searchText = '';
  fromdate: any = '';
  todate: any = '';
  receiptmode: any = 'CH';
  data: AOA = [['Date', 'UTR Number', 'amount', 'referencetext', 'UTR type', 'Receipt type']];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName = 'AutoBrs.xlsx';
  Exceldata: any = [];
  PreDefinedAutoBrsArrayData: any = [];
  saveAutoBrsBool = false;
  boolforAutoBrs = false;
  companydetails: any;
  roleid: any;
  selectedamt = 0;
  auto_brs_type_name = 'Upload';
  autoBsrGridData: any = [];
  autoBrsDuplicates: any = [];
  autoBrsData: any = [];
  page: any = {};
  activeTab = '';
  pbankname!: string;
  returnChargesInputValue = 250;
  minimumReturnCharge = 250;

  dpConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD-MMM-YYYY',
    containerClass: 'theme-dark-blue',
    showWeekNumbers: false,
  };
  dpConfig1: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD-MMM-YYYY',
    containerClass: 'theme-dark-blue',
    showWeekNumbers: false,
  };

  constructor() {
    this.ptransactiondateConfig.maxDate = new Date();
    this.ptransactiondateConfig.containerClass = 'theme-dark-blue';
    this.ptransactiondateConfig.dateInputFormat = 'DD-MMM-YYYY';
    this.ptransactiondateConfig.showWeekNumbers = false;

    this.pchequecleardateConfig.maxDate = new Date();
    this.pchequecleardateConfig.containerClass = 'theme-dark-blue';
    this.pchequecleardateConfig.dateInputFormat = 'DD-MMM-YYYY';
    this.pchequecleardateConfig.showWeekNumbers = false;

    this.brsfromConfig.maxDate = new Date();
    this.brsfromConfig.containerClass = 'theme-dark-blue';
    this.brsfromConfig.dateInputFormat = 'DD-MMM-YYYY';
    this.brsfromConfig.showWeekNumbers = false;

    this.brstoConfig.maxDate = new Date();
    this.brstoConfig.containerClass = 'theme-dark-blue';
    this.brstoConfig.dateInputFormat = 'DD-MMM-YYYY';
    this.brstoConfig.showWeekNumbers = false;

    this.pageCriteria = new PageCriteria();
    this.pageCriteria2 = new PageCriteria();

    const cs = inject(CommonService);
    if (cs.comapnydetails != null) {
      this.disabletransactiondate = cs.comapnydetails.pdatepickerenablestatus;
    }
  }

  ngOnInit(): void {
    this.GetBankList();
    this.showicons = true;
    this.rowHeight = Number(this.page?.rowHeight) || 50;
    this.pageSetUp();
    this.setPageModel2();
    this.userBranchType = sessionStorage.getItem('userBranchType');
    this.roleid = sessionStorage.getItem('roleid');
    this.companydetails = this._commonService.comapnydetails;
    this.boolforAutoBrs = this.companydetails?.pisautobrsimpsapplicable || false;
    this.currencySymbol = this._commonService.currencysymbol;

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    this.ChequesInBankForm = this.fb.group({
      ptransactiondate: [today, Validators.required],
      pchequecleardate: [today, Validators.required],
      bankname: [null],
      pfrombrsdate: [yesterday],
      ptobrsdate: [today],
      pchequesOnHandlist: [],
      SearchClear: [''],
      schemaname: [this._commonService.getschemaname()],
      searchtext: [''],
      receipttype: ['Adjusted'],
      auto_brs_type: ['Upload'],
    });

    this.BrsDateForm = this.fb.group({
      frombrsdate: [yesterday],
      tobrsdate: [today],
    });

    this.bankid = 0;
    this.banknameshowhide.set(false);
    this.ChequesInBankValidation = {};

    if (this.fromFormName === 'fromChequesStatusInformationForm') {
      this.tabsShowOrHideBasedOnfromFormName = false;
      this.displayGridBasedOnFormName = false;
      this.activeTab = 'cheques';
      this.modeofreceipt = 'ALL';
      this.status = 'all';
    } else {
      this.tabsShowOrHideBasedOnfromFormName = true;
      this.displayGridBasedOnFormName = true;
      this.activeTab = 'onlinereceipts';
      this.status = 'onlinereceipts';
      this.modeofreceipt = 'ALL';
      this.selectedTab = 'onlinereceipts';
    }

    this.GetBankBalance(this.bankid);
    this.getChequeReturnCharges();
    this.BlurEventAllControll(this.ChequesInBankForm);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  onFooterPageChange(event: { page?: number }): void {
    let currentPage = event.page ?? 1;
    this.pageCriteria.offset = currentPage - 1;
    this.pageCriteria.CurrentPage = currentPage;
    if (this.pageCriteria.totalrows < currentPage * this.pageCriteria.pageSize) {
      this.pageCriteria.currentPageRows = this.pageCriteria.totalrows % this.pageCriteria.pageSize;
    } else {
      this.pageCriteria.currentPageRows = this.pageCriteria.pageSize;
    }
    this.loadData(currentPage, this.pageCriteria.pageSize);
  }

  loadData(pageNumber: number, pageSize: number) {
    console.log(`Fetching data for page ${pageNumber}, page size ${pageSize}`);
  }

  change_date(event: any) {
    this.gridData.update(rows =>
      rows.map(r => ({ ...r, pdepositstatus: false, pcancelstatus: false, pchequestatus: 'N' }))
    );
  }

  pageSetUp() {
    this.page.offset = 0;
    this.page.pageNumber = 1;
    this.page.size = this._commonService.pageSize || 10;
    this.startindex = 0;
    this.endindex = this.page.size;
    this.page.totalElements = 0;
    this.page.totalPages = 1;
    this.pageCriteria.pageSize = this.page.size;
    this.pageCriteria.offset = 0;
  }

  setPage(event: TableLazyLoadEvent) {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.page.size ?? 10;
    const page = Math.floor(first / rows);
    this.page.offset = page;
    this.page.size = rows;
    this.page.pageNumber = page + 1;
    this.pageCriteria.pageSize = rows;
    this.pageCriteria.offset = page;
    this.startindex = first;
    this.endindex = this.startindex + rows;
    this.preferdrows.set(false);
    if (this.fromdate !== '' && this.todate !== '') {
      this.GetDataOnBrsDates1(this.fromdate, this.todate, this.bankid);
    } else {
      this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, this._searchText || '');
    }
  }

  // ── Data fetching ──────────────────────────────────────────────────────────

  GetBankList() {
    const BranchSchema = this._commonService.getbranchname();
    const GlobalSchema = this._commonService.getschemaname();
    const CompanyCode = this._commonService.getCompanyCode();
    const BranchCode = this._commonService.getBranchCode();
    this._accountingtransaction.GetBankntList(BranchSchema, GlobalSchema, CompanyCode, BranchCode).subscribe({
      next: (res: any) => {
        this.BanksList = res?.banklist || [];
        this.GetBankBalance(this.bankid);
      },
      error: (err: any) => {
        this._commonService.showErrorMessage(err);
        this.BanksList = [];
      },
    });
  }

  GetBankBalance(bankid: any) {
    try {
      const brsToDate = this._commonService.getFormatDateNormal(new Date());
      const BranchSchema = this._commonService.getbranchname();
      const branchCode = this._commonService.getBranchCode();
      const companyCode = this._commonService.getCompanyCode();
      this._accountingtransaction.GetBankBalance(brsToDate, bankid, BranchSchema, branchCode, companyCode).subscribe({
        next: (res: any) => {
          if (res) {
            this.bankbalancedetails = res;
            this.fromdate1 = res.pfrombrsdate;
            this.todate1 = res.ptobrsdate;

            if (bankid === 0) {
              this.banknameshowhide.set(false);
              this.bankname = '';
              const totalBalance = (this.BanksList ?? []).reduce(
                (sum: number, bank: any) => sum + (bank.pbankbalance ?? 0), 0
              );
              if (totalBalance < 0) { this.bankbalance = Math.abs(totalBalance); this.bankbalancetype = 'Cr'; }
              else if (totalBalance === 0) { this.bankbalance = 0; this.bankbalancetype = ''; }
              else { this.bankbalance = totalBalance; this.bankbalancetype = 'Dr'; }
            } else {
              const selectedBank = this.BanksList.find((bank: any) => bank.pbankid === bankid);
              const balance = selectedBank?.pbankbalance ?? res?.pbankbalance ?? 0;
              if (balance < 0) { this.bankbalance = Math.abs(balance); this.bankbalancetype = 'Cr'; }
              else if (balance === 0) { this.bankbalance = 0; this.bankbalancetype = ''; }
              else { this.bankbalance = balance; this.bankbalancetype = 'Dr'; }
            }

            const todayDate = new Date();
            this.brsdate =
              todayDate.getDate().toString().padStart(2, '0') + '-' +
              todayDate.toLocaleString('en-US', { month: 'short' }) + '-' +
              todayDate.getFullYear();

            this.pageSetUp();
            this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, '');
          } else {
            this.bankbalancedetails = {};
            this.bankbalance = 0;
            this.bankbalancetype = '';
            this.brsdate = '';
          }
        },
        error: (err: any) => this._commonService.showErrorMessage(err),
      });
    } catch (e: any) {
      this._commonService.showErrorMessage(e?.message || e);
    }
  }

  GetChequesInBank_load(bankid: any, modeofreceipt: string = this.modeofreceipt) {
    this.modeofreceipt = modeofreceipt;
    this.gridLoading.set(true);
    this.brsdateshowhidecleared.set(false);

    const apiMode =
      modeofreceipt === 'CLEAR' || modeofreceipt === 'RETURN' || modeofreceipt === 'ONLINE-AUTO'
        ? modeofreceipt
        : 'ALL';

    this._accountingtransaction.GetChequesInBankData(
      bankid, this._commonService.getschemaname(), this._commonService.getbranchname(),
      0, 99999, apiMode, '', this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    ).subscribe({
      next: (data: any) => {
        this.gridLoading.set(false);
        this.ChequesInBankData = data?.pchequesOnHandlist || [];
        const rawList = data?.pchequesclearreturnlist;
        this.ChequesClearReturnData = Array.isArray(rawList)
          ? (Array.isArray(rawList[0]) ? rawList[0] : rawList)
          : [];
        this._applyTabFilter();
      },
      error: (err: any) => { this.gridLoading.set(false); this._commonService.showErrorMessage(err); },
    });
  }

  private _applyTabFilter() {
    if (this.status === 'all') this.All1();
    else if (this.status === 'chequesdeposited') this.ChequesDeposited1();
    else if (this.status === 'onlinereceipts') this.OnlineReceipts1();
    else if (this.status === 'cleared') this.Cleared1();
    else if (this.status === 'returned') this.Returned1();
    if (this.fromFormName === 'fromChequesStatusInformationForm') {
      this.chequesStatusInfoGrid();
    }
  }

  GetChequesInBank(bankid: any, startindex: any, endindex: any, searchText: string) {
    this.gridLoading.set(true);
    const apiMode =
      this.modeofreceipt === 'CLEAR' || this.modeofreceipt === 'RETURN' || this.modeofreceipt === 'ONLINE-AUTO'
        ? this.modeofreceipt
        : 'ALL';

    this._accountingtransaction.GetChequesInBankData(
      bankid, this._commonService.getschemaname(), this._commonService.getbranchname(),
      0, 99999, apiMode, searchText || '', this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    ).subscribe({
      next: (data: any) => {
        this.gridLoading.set(false);
        this.ChequesInBankData = data?.pchequesOnHandlist || [];
        const rawList = data?.pchequesclearreturnlist;
        this.ChequesClearReturnData = Array.isArray(rawList)
          ? (Array.isArray(rawList[0]) ? rawList[0] : rawList)
          : [];
        this._applyTabFilter();
        this.PreDefinedAutoBrsArrayData = [...this.gridData()];
      },
      error: (err: any) => { this.gridLoading.set(false); this._commonService.showErrorMessage(err); },
    });
  }

  GetChequesInBankforSearchDeposit(bankid: any, startindex: any, endindex: any, searchText: any) {
    this.gridLoading.set(true);

    const apiMode =
      ['CLEAR', 'RETURN', 'ONLINE-AUTO', 'CHEQUE', 'ONLINE'].includes(this.modeofreceipt)
        ? this.modeofreceipt
        : 'ALL';

    const GetChequesInBankData = this._accountingtransaction.GetChequesInBankData(
      bankid, this._commonService.getschemaname(), this._commonService.getbranchname(),
      0, 99999, apiMode, searchText || '', this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    );
    const getchequescount = this._accountingtransaction.GetChequesRowCount(
      bankid, this._commonService.getschemaname(), this._commonService.getbranchname(),
      '', 'CHEQUESINBANK', apiMode, this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    );

    forkJoin([GetChequesInBankData, getchequescount]).subscribe({
      next: (data: any) => {
        this.gridLoading.set(false);
        this.ChequesInBankData = data[0]?.pchequesOnHandlist || [];
        const rawList = data[0]?.pchequesclearreturnlist;
        this.ChequesClearReturnData = Array.isArray(rawList)
          ? (Array.isArray(rawList[0]) ? rawList[0] : rawList)
          : [];
        this._countData = data[1];
        this.CountOfRecords();
        this.page.totalElements = this._countData?.total_count || 0;
        this.page.totalPages = Math.ceil(this.page.totalElements / (this.page.size || 10));
        this._applyTabFilter();
      },
      error: (err: any) => { this.gridLoading.set(false); this._commonService.showErrorMessage(err); },
    });
  }

  // ── Tab handlers ───────────────────────────────────────────────────────────

  All() {
    this.gridData.set([]);
    this.gridDatatemp = [];
    this.amounttotal = 0;
    this.fromdate = '';
    this.todate = '';
    if (this.fromFormName === 'fromChequesStatusInformationForm') this.GridColumnsHide();
    else this.GridColumnsShow();
    this.status = 'all';
    this.pdfstatus = 'All';
    this.modeofreceipt = 'ALL';
    this.pageSetUp();
    this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, '');
  }

  All1() {
    this.gridData.set([]);
    this.gridDatatemp = [];
    if (this.fromFormName === ' fromChequesStatusInformationForm') this.GridColumnsHide();
    else this.GridColumnsShow();
    this.status = 'all';
    this.pdfstatus = 'All';
    this.modeofreceipt = 'ALL';

    let grid: any[] =
      this.bankid === 0
        ? [...this.ChequesInBankData]
        : this.ChequesInBankData.filter((d: any) => d?.pdepositbankid === this.bankid);

    const copy = JSON.parse(JSON.stringify(grid));
    this.gridData.set(copy);
    this.gridDatatemp = [...copy];
    this.showicons = copy.length > 0;
    this.amounttotal = copy.reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
    this.page.totalElements = copy.length;
    this.page.totalPages = Math.ceil(copy.length / (this.page.size || 10));
  }

  ChequesDeposited() {
    this.amounttotal = 0;
    this.fromdate = '';
    this.todate = '';
    this.modeofreceipt = 'CHEQUE';
    this.status = 'chequesdeposited';
    this.pdfstatus = 'Cheques Deposited';
    if (this.fromFormName === 'fromChequesStatusInformationForm') this.GridColumnsHide();
    else this.GridColumnsShow();
    this.pageSetUp();
    this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, this._searchText);
  }

  ChequesDeposited1() {
    this.modeofreceipt = 'CHEQUE';
    this.gridData.set([]);
    this.gridDatatemp = [];
    if (this.fromFormName === 'fromChequesStatusInformationForm') this.GridColumnsHide();
    else this.GridColumnsShow();
    this.status = 'chequesdeposited';
    this.pdfstatus = 'Cheques Deposited';

    let grid: any[] =
      this.bankid === 0
        ? this.ChequesInBankData.filter((d: any) => d.ptypeofpayment === 'CHEQUE')
        : this.ChequesInBankData.filter((d: any) => d.ptypeofpayment === 'CHEQUE' && d.pdepositbankid === this.bankid);

    const copy = JSON.parse(JSON.stringify(grid));
    this.gridData.set(copy);
    this.gridDatatemp = [...copy];
    this.showicons = copy.length > 0;
    this.amounttotal = copy.reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
    this.page.totalElements = copy.length;
    this.page.totalPages = Math.ceil(copy.length / (this.page.size || 10));
  }

  OnlineReceipts() {
    this.amounttotal = 0;
    this.fromdate = '';
    this.todate = '';
    this.pageSetUp();
    this.gridData.set([]);
    this.gridDatatemp = [];
    if (this.fromFormName === 'fromChequesStatusInformationForm') this.GridColumnsHide();
    else this.GridColumnsShow();
    this.status = 'onlinereceipts';
    this.pdfstatus = 'Online Receipts';
    this.modeofreceipt = 'ONLINE';
    this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, this._searchText);
  }

  OnlineReceipts1() {
    this.gridData.set([]);
    this.gridDatatemp = [];
    if (this.fromFormName === 'fromChequesStatusInformationForm') this.GridColumnsHide();
    else this.GridColumnsShow();
    this.status = 'onlinereceipts';
    this.pdfstatus = 'Online Receipts';
    this.modeofreceipt = 'ONLINE';

    let grid: any[] =
      this.bankid === 0
        ? this.ChequesInBankData.filter((j: any) => j.ptypeofpayment !== 'CHEQUE')
        : this.ChequesInBankData.filter((j: any) => j.ptypeofpayment !== 'CHEQUE' && j.pdepositbankid === this.bankid);

    const copy = JSON.parse(JSON.stringify(grid));
    this.gridData.set(copy);
    this.gridDatatemp = [...copy];
    this.showicons = copy.length > 0;
    this.amounttotal = copy.reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);

    if (this._countData && +this._countData['others_count'] > 0) {
      this.page.totalElements = +this._countData['others_count'];
      this.page.totalPages = Math.ceil(this.page.totalElements / (this.page.size || 10));
    } else {
      this.page.totalElements = copy.length;
      this.page.totalPages = Math.ceil(copy.length / (this.page.size || 10));
    }
  }

  Cleared() {
    this.amounttotal = 0;
    this.fromdate = '';
    this.todate = '';
    this.datetitle = 'Cleared Date';
    this.gridData.set([]);
    this.gridDatatemp = [];
    this.GridColumnsHide();
    this.brsdateshowhidecleared.set(true);
    this.brsdateshowhidereturned.set(false);
    this.status = 'cleared';
    this.pdfstatus = 'Cleared';
    this.modeofreceipt = 'CLEAR';
    this.pageSetUp();
    this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, this._searchText);
  }

  Cleared1() {
    this.datetitle = 'Cleared Date';
    this.gridData.set([]);
    this.gridDatatemp = [];
    this.GridColumnsHide();
    this.brsdateshowhidecleared.set(true);
    this.brsdateshowhidereturned.set(false);
    this.status = 'cleared';
    this.pdfstatus = 'Cleared';
    this.modeofreceipt = 'CLEAR';

    let grid: any[] =
      this.bankid === 0
        ? this.ChequesClearReturnData.filter((i: any) => i.pchequestatus === 'Y')
        : this.ChequesClearReturnData.filter((i: any) => i.pchequestatus === 'Y' && i.pdepositbankid === this.bankid);

    const copy = JSON.parse(JSON.stringify(grid));
    this.gridData.set(copy);
    this.gridDatatemp = [...copy];
    this.showicons = copy.length > 0;
    this.amounttotal = copy.reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);

    if (this._countData && +this._countData['clear_count'] > 0) {
      this.page.totalElements = +this._countData['clear_count'];
      this.page.totalPages = Math.ceil(this.page.totalElements / (this.page.size || 10));
    } else {
      this.page.totalElements = copy.length;
      this.page.totalPages = Math.ceil(copy.length / (this.page.size || 10));
    }
  }

  Returned() {
    this.amounttotal = 0;
    this.fromdate = '';
    this.todate = '';
    this.datetitle = 'Returned Date';
    this.gridData.set([]);
    this.gridDatatemp = [];
    this.GridColumnsHide();
    this.brsdateshowhidecleared.set(false);
    this.brsdateshowhidereturned.set(true);
    this.status = 'returned';
    this.pdfstatus = 'Returned';
    this.modeofreceipt = 'RETURN';
    this.pageSetUp();
    this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, '');
  }

  Returned1() {
    this.datetitle = 'Returned Date';
    this.gridData.set([]);
    this.gridDatatemp = [];
    this.GridColumnsHide();
    this.brsdateshowhidecleared.set(false);
    this.brsdateshowhidereturned.set(true);
    this.status = 'returned';
    this.pdfstatus = 'Returned';
    this.modeofreceipt = 'RETURN';

    let grid: any[] =
      this.bankid === 0
        ? this.ChequesClearReturnData.filter((i: any) => i.pchequestatus === 'R')
        : this.ChequesClearReturnData.filter((i: any) => i.pchequestatus === 'R' && i.pdepositbankid === this.bankid);

    const copy = JSON.parse(JSON.stringify(grid));
    this.gridData.set(copy);
    this.gridDatatemp = [...copy];
    this.showicons = copy.length > 0;
    this.amounttotal = copy.reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);

    if (this._countData && +this._countData['return_count'] > 0) {
      this.page.totalElements = +this._countData['return_count'];
      this.page.totalPages = Math.ceil(this.page.totalElements / (this.page.size || 10));
    } else {
      this.page.totalElements = copy.length;
      this.page.totalPages = Math.ceil(copy.length / (this.page.size || 10));
    }
  }

  // ── Column visibility helpers ──────────────────────────────────────────────

  GridColumnsShow() {
    this.showhidegridcolumns.set(false);
    this.showhidegridcolumns2.set(false);
    this.saveshowhide.set(true);
    this.brsdateshowhidecleared.set(false);
    this.brsdateshowhidereturned.set(false);
    this.hiddendate.set(true);
  }

  GridColumnsHide() {
    this.showhidegridcolumns.set(true);
    this.showhidegridcolumns2.set(true);
    this.saveshowhide.set(false);
    this.hiddendate.set(false);
  }

  CountOfRecords() {
    this.all = 0;
    this.chequesdeposited = 0;
    this.onlinereceipts = 0;
    this.cleared = 0;
    this.returned = 0;
    this.all = this._countData['total_count'];
    this.onlinereceipts = this._countData['others_count'];
    this.chequesdeposited = this._countData['cheques_count'];
    this.cleared = this._countData['clear_count'];
    this.returned = this._countData['return_count'];
  }

  // ── Bank selection ─────────────────────────────────────────────────────────

  SelectBank(event: any) {
    if (!event) {
      this.bankid = 0;
      this.bankname = '';
      this.banknameshowhide.set(false);
      this.ChequesInBankValidation['bankname'] = 'Select Bank Name';
      this.bankbalance = 0;
      this.bankbalancetype = '';
      const todayDate = new Date();
      this.brsdate =
        todayDate.getDate().toString().padStart(2, '0') + '-' +
        todayDate.toLocaleString('en-US', { month: 'short' }) + '-' +
        todayDate.getFullYear();
    } else {
      this.banknameshowhide.set(true);
      this.bankdetails = event;
      this.bankid = event.pbankid;
      this.bankname = event.pbankname;
      this.ChequesInBankValidation['bankname'] = '';

      const todayDate = new Date();
      this.brsdate =
        todayDate.getDate().toString().padStart(2, '0') + '-' +
        todayDate.toLocaleString('en-US', { month: 'short' }) + '-' +
        todayDate.getFullYear();

      if (event.pbankbalance < 0) { this.bankbalance = Math.abs(event.pbankbalance); this.bankbalancetype = 'Cr'; }
      else if (event.pbankbalance === 0) { this.bankbalance = 0; this.bankbalancetype = ''; }
      else { this.bankbalance = event.pbankbalance; this.bankbalancetype = 'Dr'; }
    }

    this.pageSetUp();
    this.ChequesInBankForm?.get('SearchClear')?.setValue('');
    this._searchText = '';
    this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, '');
  }

  // ── Row actions ────────────────────────────────────────────────────────────

  CheckedClear(event: any, data: any) {
    const rows = this.gridData();
    const gridtemp = rows.filter(a => a?.['preceiptid'] === data.preceiptid);

    if (event.target.checked) {
      const depositedDateStr = gridtemp[0]?.['pdepositeddate'];
      const receiptdate = depositedDateStr
        ? this._commonService.getDateObjectFromDataBase(depositedDateStr)
        : null;
      const chequecleardate = this.ChequesInBankForm?.get('pchequecleardate')?.value;

      if (receiptdate && chequecleardate && new Date(chequecleardate).getTime() < new Date(receiptdate).getTime()) {
        event.target.checked = false;
        this._commonService.showWarningMessage('Cheque Clear Date Should be Greater than or Equal to Deposited Date');
      } else {
        if (parseInt(this.roleid, 10) !== 2) {
          data.pdepositstatus = true;
          data.pchequestatus = 'Y';
          data.preturnstatus = false;
          this.gridData.update(r =>
            r.map(el =>
              el?.['pChequenumber'] === data.pChequenumber &&
              data.cheque_bank === el.cheque_bank &&
              data.receipt_branch_name === el.receipt_branch_name
                ? { ...el, pdepositstatus: true, preturnstatus: false, pchequestatus: 'Y' }
                : el
            )
          );
        } else {
          data.pdepositstatus = true;
          data.preturnstatus = false;
          data.pchequestatus = 'Y';
        }
      }
    } else {
      data.pdepositstatus = false;
      data.pchequestatus = 'N';
      this.gridData.update(r =>
        r.map(el =>
          el?.['pChequenumber'] === data.pChequenumber && data.cheque_bank === el.cheque_bank
            ? { ...el, pdepositstatus: false, preturnstatus: false, pchequestatus: 'N', ...(this.status !== 'autobrs' ? { preferencetext: '' } : {}) }
            : el
        )
      );
      data.preturnstatus = '';
      const index = rows.indexOf(data);
      if (this.status !== 'autobrs') {
        const el = document.getElementById('preferencetext' + index) as HTMLInputElement;
        if (el) el.value = '';
      }
    }

    this.gridData.update(r =>
      r.map((row, _) => (row?.['preceiptid'] === data.preceiptid ? data : row))
    );

    this.selectedamt = this.gridData()
      .filter((el: any) => el?.pdepositstatus)
      .reduce((sum: number, el: any) => sum + (el?.ptotalreceivedamount || 0), 0);
  }

  CheckedReturn(event: any, data: any) {
    const rows = this.gridData();
    const gridtemp = rows.filter(a => a?.['preceiptid'] === data.preceiptid);
    this.PopupData = data;

    if (event.target.checked) {
      const depositedDateStr = gridtemp[0]?.['pdepositeddate'];
      const receiptdate = depositedDateStr
        ? this._commonService.getDateObjectFromDataBase(depositedDateStr)
        : null;
      const chequecleardate = this.ChequesInBankForm?.get('pchequecleardate')?.value;

      if (!receiptdate || (chequecleardate && receiptdate && new Date(chequecleardate).getTime() >= new Date(receiptdate).getTime())) {
        data.preturnstatus = true;
        data.pdepositstatus = false;
        data.pchequestatus = 'R';
        this.returnChargesError.set(false);
        this.chequenumber = data.pChequenumber;

        const modal = document.getElementById('add-detail');
        if (modal) { modal.classList.add('show'); modal.setAttribute('style', 'display:block'); }

        setTimeout(() => {
          const cancelcharges = document.getElementById('cancelcharges') as HTMLInputElement;
          if (cancelcharges) cancelcharges.value = String(this.minimumReturnCharge || 250);
        }, 50);
      } else {
        data.preturnstatus = false;
        data.pchequestatus = 'N';
        event.target.checked = false;
        this._commonService.showWarningMessage('Cheque Clear Date Should be Greater than or Equal Deposited Date');
      }
    } else {
      data.preturnstatus = false;
      data.pchequestatus = 'N';
    }

    this.gridData.update(r =>
      r.map(row => (row?.['preceiptid'] === data.preceiptid ? data : row))
    );
  }

  onRowClearCheck(event: any, row: any) {
    if (event.target.checked) {
      row.pdepositstatus = true;
      row.pchequestatus = 'Y';
      row.preturnstatus = false;
    } else {
      row.pdepositstatus = false;
      row.pchequestatus = 'N';
      row.preturnstatus = false;
      row.preferencetext = '';
    }
    this.selectedamt = this.gridData()
      .filter((r: any) => r.pdepositstatus)
      .reduce((sum: number, r: any) => sum + (r.ptotalreceivedamount || 0), 0);
    this.gridData.update(r => [...r]);
  }

  selectAllClear(eve: any) {
    this.preferdrows.set(eve.target.checked);
    this.gridData.update(rows =>
      rows.map(row =>
        eve.target.checked
          ? { ...row, pdepositstatus: true, pchequestatus: 'Y' }
          : { ...row, pdepositstatus: false, pchequestatus: 'N', preferencetext: '' }
      )
    );
    this.selectedamt = this.gridData()
      .filter((r: any) => r.pdepositstatus)
      .reduce((sum: number, r: any) => sum + (r.ptotalreceivedamount || 0), 0);
  }

  // ── Save & Clear ───────────────────────────────────────────────────────────

  validateSave(): boolean {
    let isvalid = true;
    isvalid = this.checkValidations(this.ChequesInBankForm, isvalid);
    const chequecleardate = this.ChequesInBankForm?.get('pchequecleardate')?.value;
    const transactiondate = this.ChequesInBankForm?.get('ptransactiondate')?.value;
    if (new Date(transactiondate).getTime() < new Date(chequecleardate).getTime()) {
      this._commonService.showWarningMessage('Transaction Date Should be Greater than or Equal to Cheque Clear Date');
      isvalid = false;
    }
    let isvalidbool: any;
    if (this.modeofreceipt !== 'ONLINE-AUTO') isvalidbool = this.validateDuplicates();
    else isvalidbool = 0;

    const isemptyvalues = this.emptyValuesFound();
    const rows = this.gridData();

    if (this.DataForSaving.length > 0) {
      isvalid = true;
    } else {
      const selectrecords = rows.filter(el => el.pchequestatus === 'Y' || el.pchequestatus === 'R');
      if (!this.showhidegridcolumns()) {
        if (isvalidbool > 0) { this._commonService.showWarningMessage('Duplicates Found please enter unique values'); isvalid = false; }
        else if (isemptyvalues) { this._commonService.showWarningMessage('Please enter all input fields!'); isvalid = false; }
        else if (selectrecords.length === 0) { this._commonService.showWarningMessage('Please Select records'); isvalid = false; }
      }
    }
    if (isvalid && !confirm('Do You Want To Save ?')) isvalid = false;
    return isvalid;
  }

  Save() {
    this.DataForSaving = [];
    if (this.status === 'autobrs') {
      this.DataForSaving = this.autoBrsData;
      if (this.DataForSaving.length !== 0) {
        if (confirm('Do you want to save ?')) {
          this.gridLoading.set(true);
          for (let i = 0; i < this.DataForSaving.length; i++) {
            this.DataForSaving[i].pCreatedby = '1';
            this.DataForSaving[i].pdepositeddate = this._commonService.getFormatDateNormal(this._commonService.getDateObjectFromDataBase(this.DataForSaving[i].pdepositeddate));
            this.DataForSaving[i].preceiptdate = this._commonService.getFormatDateNormal(this._commonService.getDateObjectFromDataBase(this.DataForSaving[i].preceiptdate));
            this.DataForSaving[i].pchequedate = this._commonService.getFormatDateNormal(this._commonService.getDateObjectFromDataBase(this.DataForSaving[i].pchequedate));
            this.DataForSaving[i].pipaddress = this._commonService.getIpAddress();
            this.DataForSaving[i].pchequestatus = 'Y';
            this.DataForSaving[i].preferencetext = this.DataForSaving[i].preferencetext + '-' + new Date().getFullYear().toString();
            this.DataForSaving[i].pactualcancelcharges = this.DataForSaving[i].pactualcancelcharges ?? 0;
          }
          this.ChequesInBankForm.controls['pchequesOnHandlist'].setValue(this.DataForSaving);
          let chequesinbankdata = this.ChequesInBankForm.value;
          chequesinbankdata.pchequecleardate = this._commonService.getFormatDateNormal(chequesinbankdata.pchequecleardate);
          chequesinbankdata.ptransactiondate = this._commonService.getFormatDateNormal(chequesinbankdata.ptransactiondate);
          chequesinbankdata.global_schema = this._commonService.getschemaname();
          chequesinbankdata.branch_schema = this._commonService.getbranchname();
          chequesinbankdata.company_code = this._commonService.getCompanyCode();
          chequesinbankdata.branch_code = this._commonService.getBranchCode();
          chequesinbankdata.schemaname = this._commonService.getschemaname();
          this._accountingtransaction.SaveChequesInBank(JSON.stringify(chequesinbankdata)).subscribe({
            next: (res: any) => {
              if (res[0] === true) { this.gridLoading.set(false); this._commonService.showSuccessMessage(); this.Clear(); this.autoBrsData = []; }
              this.disablesavebutton.set(false); this.buttonname = 'Save';
            },
            error: (error: any) => { this.gridLoading.set(false); this._commonService.showErrorMessage(error); this.disablesavebutton.set(false); this.buttonname = 'Save'; },
          });
        } else { this.gridLoading.set(false); }
      } else { this.disablesavebutton.set(false); this.buttonname = 'Save'; this._commonService.showWarningMessage('Select atleast one record '); }
    } else {
      if (this.validateSave()) {
        this.disablesavebutton.set(true);
        this.buttonname = 'Processing';
        const rows = this.gridData();
        for (const row of rows) {
          if (row.pchequestatus === 'Y' || row.pchequestatus === 'R') this.DataForSaving.push(row);
        }
        if (this.DataForSaving.length !== 0) {
          for (let i = 0; i < this.DataForSaving.length; i++) {
            this.DataForSaving[i].pCreatedby = '1';
            this.DataForSaving[i].pdepositeddate = this._commonService.getFormatDateNormal(this._commonService.getDateObjectFromDataBase(this.DataForSaving[i].pdepositeddate));
            this.DataForSaving[i].preceiptdate = this._commonService.getFormatDateNormal(this._commonService.getDateObjectFromDataBase(this.DataForSaving[i].preceiptdate));
            this.DataForSaving[i].pchequedate = this._commonService.getFormatDateNormal(this._commonService.getDateObjectFromDataBase(this.DataForSaving[i].pchequedate));
            this.DataForSaving[i].pipaddress = this._commonService.getIpAddress();
            this.DataForSaving[i].preferencetext = this.DataForSaving[i].preferencetext + '-' + new Date().getFullYear().toString();
            this.DataForSaving[i].pactualcancelcharges = this.DataForSaving[i].pactualcancelcharges ?? 0;
          }
          this.ChequesInBankForm.get('pchequesOnHandlist')?.setValue(this.DataForSaving);
          let chequesinbankdata = this.ChequesInBankForm.value;
          chequesinbankdata.pchequecleardate = this._commonService.getFormatDateNormal(chequesinbankdata.pchequecleardate);
          chequesinbankdata.ptransactiondate = this._commonService.getFormatDateNormal(chequesinbankdata.ptransactiondate);
          chequesinbankdata.global_schema = this._commonService.getschemaname();
          chequesinbankdata.branch_schema = this._commonService.getbranchname();
          chequesinbankdata.company_code = this._commonService.getCompanyCode();
          chequesinbankdata.branch_code = this._commonService.getBranchCode();
          chequesinbankdata.schemaname = this._commonService.getschemaname();

          this._accountingtransaction.SaveChequesInBank(JSON.stringify(chequesinbankdata)).subscribe({
            next: (data: any) => {
              if (data) {
                const receipt = data.o_common_receipt_no;
                if (receipt && receipt.split('$')[0] === 'R') {
                  const mo = data.o_return_receipts;
                  const encodedMo = encodeURIComponent(mo);
                  this._noticeservice.GetChequeReturnInvoice(
                    this._commonService.getschemaname(), this._commonService.getbranchname(),
                    this._commonService.getCompanyCode(), this._commonService.getBranchCode(), encodedMo
                  ).subscribe((res: any) => {
                    if (res && res.length > 0) {
                      this.previewdetails = res;
                      for (let i = 0; i < this.previewdetails.length; i++) {
                        this.previewdetails[i].paddress = this.previewdetails[i]['paddress'].split(',');
                        const incidentalcharges = JSON.stringify(this.previewdetails[i].incidentalcharges);
                        if (incidentalcharges === '{}' || 
                          this._commonService.isNullOrEmptyString(this.previewdetails[i].incidentalcharges)) {
                          this.previewdetails[i].incidentalcharges = 0;
                        }
                      }
                      this.pdfContentData();
                    }
                  });
                  this._noticeservice.GetChequeReturnVoucher(
                    this._commonService.getschemaname(), this._commonService.getbranchname(),
                    this._commonService.getCompanyCode(), this._commonService.getBranchCode(), encodedMo
                  ).subscribe({
                    next: (res: any) => { if (res && res.length > 0) { this.chequerwturnvoucherdetails = res; this.chequereturnvoucherpdf(); } },
                    error: (err: any) => this._commonService.showErrorMessage(err),
                  });
                }
                this._commonService.showSuccessMessage();
                this.Clear();
                this.status = 'returned';
                this.selectedTab = 'returned';
                this.modeofreceipt = 'RETURN';
                this.Returned();
              }
              this.disablesavebutton.set(false);
              this.buttonname = 'Save';
            },
            error: (error: any) => { this._commonService.showErrorMessage(error); this.disablesavebutton.set(false); this.buttonname = 'Save'; },
          });
        } else { this.disablesavebutton.set(false); this.buttonname = 'Save'; this._commonService.showWarningMessage('Select atleast one record '); }
      }
    }
  }

  Clear() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    this.ChequesInBankForm.reset({
      ptransactiondate: today, pchequecleardate: today, bankname: null,
      pfrombrsdate: yesterday, ptobrsdate: today,
      schemaname: this._commonService.getschemaname(), searchtext: '',
      receipttype: 'Adjusted', auto_brs_type: 'Upload',
    });
    this.BrsDateForm.reset({ frombrsdate: yesterday, tobrsdate: today });

    this.bankid = 0;
    this.bankname = '';
    this.bankbalance = 0;
    this.bankbalancetype = '';
    this.brsdate = '';
    this.banknameshowhide.set(false);
    this.gridData.set([]);
    this.gridDatatemp = [];
    this.ChequesInBankData = [];
    this.ChequesClearReturnData = [];
    this.modeofreceipt = 'ALL';
    this.status = 'onlinereceipts';
    this.selectedTab = 'onlinereceipts';
    this._searchText = '';
    this.fromdate = '';
    this.todate = '';
    this.preferdrows.set(false);
    this.ChequesInBankValidation = {};
    this.amounttotal = 0;
    this.selectedamt = 0;
    this.pageSetUp();
    this.GetBankBalance(this.bankid);
  }

  // ── BRS date filters ───────────────────────────────────────────────────────

  ShowBrsClear() {
    this._searchText = '';
    this.gridData.set([]);
    this.cleared = 0;
    const fromdate = this.ChequesInBankForm.controls['pfrombrsdate'].value;
    const todate = this.ChequesInBankForm.controls['ptobrsdate'].value;
    if (fromdate != null && todate != null) {
      this.OnBrsDateChanges(fromdate, todate);
      if (!this.validate) {
        const fd = this._commonService.getFormatDateNormal(fromdate);
        const td = this._commonService.getFormatDateNormal(todate);
        this.fromdate = fd; this.todate = td;
        this.validatebrsdateclear.set(false);
        this.pageSetUp();
        this.GetDataOnBrsDates(fd, td, this.bankid);
      } else { this.validatebrsdateclear.set(true); }
    } else { this._commonService.showWarningMessage('select fromdate and todate'); }
  }

  ShowBrsReturn() {
    this._searchText = '';
    this.gridData.set([]);
    this.returned = 0;
    const fromdate = this.BrsDateForm.controls['frombrsdate'].value;
    const todate = this.BrsDateForm.controls['tobrsdate'].value;
    if (fromdate != null && todate != null) {
      this.OnBrsDateChanges(fromdate, todate);
      if (!this.validate) {
        const fd = this._commonService.getFormatDateNormal(fromdate);
        const td = this._commonService.getFormatDateNormal(todate);
        this.fromdate = fd; this.todate = td;
        this.validatebrsdatereturn.set(false);
        this.pageSetUp();
        this.GetDataOnBrsDates(fd, td, this.bankid);
      } else { this.validatebrsdatereturn.set(true); }
    } else { this._commonService.showWarningMessage('select fromdate and todate'); }
  }

  GetDataOnBrsDates(frombrsdate: any, tobrsdate: any, bankid: any) {
    const DataFromBrsDatesChequesInBank = this._accountingtransaction.DataFromBrsDatesChequesInBank(
      frombrsdate, tobrsdate, bankid, this.modeofreceipt, '0',
      this.startindex, this.endindex,
      this._commonService.getCompanyCode(), this._commonService.getBranchCode(), this._commonService.getschemaname()
    );
    const GetChequesRowCount = this._accountingtransaction.GetChequesRowCount(
      this.bankid, this._commonService.getschemaname(), this._commonService.getbranchname(),
      this._searchText, 'CHEQUESINBANK', this.modeofreceipt,
      this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    );

    forkJoin(DataFromBrsDatesChequesInBank, GetChequesRowCount).subscribe({
      next: (clearreturndata: any) => {
        const kk: any[] = [];
        this.ChequesClearReturnDataBasedOnBrs = clearreturndata[0]['pchequesclearreturnlist'];
        for (const row of this.ChequesClearReturnDataBasedOnBrs) {
          if (this.status === 'cleared' && row.pchequestatus === 'Y') kk.push(row);
          if (this.status === 'returned' && row.pchequestatus === 'R') kk.push(row);
        }
        this._countData = clearreturndata[1];
        this.CountOfRecords();
        this.gridData.set(kk.map(d => ({
          ...d,
          preceiptdate: this._commonService.getFormatDateGlobal(d?.['preceiptdate']),
          pdepositeddate: this._commonService.getFormatDateGlobal(d?.['pdepositeddate']),
          pCleardate: this._commonService.getFormatDateGlobal(d?.['pCleardate']),
        })));
        this.amounttotal = this.gridData().reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
        if (this.status === 'cleared') { this.totalElements = this._countData['clear_count']; this.page.totalElements = this._countData['clear_count']; }
        else { this.totalElements = this._countData['return_count']; this.page.totalElements = this._countData['return_count']; }
        if (this.page.totalElements > 10) this.page.totalPages = parseInt((this.page.totalElements / 10).toString()) + 1;
      },
      error: (err: any) => this._commonService.showErrorMessage(err),
    });
  }

  GetDataOnBrsDates1(frombrsdate: any, tobrsdate: any, bankid: any) {
    this._accountingtransaction.DataFromBrsDatesChequesInBank(
      frombrsdate, tobrsdate, bankid, this.modeofreceipt, '0',
      this.startindex, this.endindex,
      this._commonService.getCompanyCode(), this._commonService.getBranchCode(), this._commonService.getschemaname()
    ).subscribe({
      next: (clearreturndata: any) => {
        const kk: any[] = [];
        this.ChequesClearReturnDataBasedOnBrs = clearreturndata['pchequesclearreturnlist'];
        for (const row of this.ChequesClearReturnDataBasedOnBrs) {
          if (this.status === 'cleared' && row.pchequestatus === 'Y') kk.push(row);
          if (this.status === 'returned' && row.pchequestatus === 'R') kk.push(row);
        }
        this.gridData.set(kk.map(d => ({
          ...d,
          preceiptdate: this._commonService.getFormatDateGlobal(d.preceiptdate),
          pdepositeddate: this._commonService.getFormatDateGlobal(d.pdepositeddate),
          pCleardate: this._commonService.getFormatDateGlobal(d.pCleardate),
        })));
        this.amounttotal = this.gridData().reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
      },
      error: (err: any) => this._commonService.showErrorMessage(err),
    });
  }

  // ── Return modal ───────────────────────────────────────────────────────────

  CancelChargesOk(event: any) {
    const inputEl = document.getElementById('cancelcharges') as HTMLInputElement;
    const rawValue = inputEl?.value.replace(/,/g, '').trim() || '0';
    const value = parseFloat(rawValue);
    const minimum = Number(this.minimumReturnCharge || 250);

    if (!rawValue || value < minimum) {
      this.returnChargesError.set(true);
      this._commonService.showWarningMessage('Minimum Amount Should Be ' + minimum);
      return;
    }
    this.returnChargesError.set(false);
    this.gridData.update(rows =>
      rows.map(r => (r.preceiptid === this.PopupData.preceiptid ? { ...r, pactualcancelcharges: value } : r))
    );
    const modal = document.getElementById('add-detail');
    if (modal) { modal.classList.remove('show'); modal.setAttribute('style', 'display:none'); }
  }

  closeReturnModal() {
    if (this.PopupData) {
      this.PopupData.preturnstatus = false;
      this.PopupData.pchequestatus = 'N';
      this.gridData.update(rows =>
        rows.map(r =>
          r.preceiptid === this.PopupData.preceiptid
            ? { ...r, preturnstatus: false, pchequestatus: 'N' }
            : r
        )
      );
    }
    this.returnChargesError.set(false);
    const modal = document.getElementById('add-detail');
    if (modal) { modal.classList.remove('show'); modal.setAttribute('style', 'display:none'); }
  }

  returnCharges_Change(event: Event) {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/,/g, '').trim();
    const value = parseFloat(rawValue || '0');
    this.returnChargesError.set(!rawValue || value < Number(this.minimumReturnCharge || 250));
  }

  getChequeReturnCharges() {
    this._accountingtransaction.getChequeReturnCharges(
      this._commonService.getschemaname(), this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    ).subscribe({
      next: (res: any[]) => {
        const charge = Array.isArray(res) && res.length > 0 ? res[0].chargeAmount : 250;
        this.chequereturncharges = charge;
        this.minimumReturnCharge = charge;
        this.returnChargesInputValue = charge;
      },
      error: (error: any) => { this.chequereturncharges = 250; this.minimumReturnCharge = 250; this.returnChargesInputValue = 250; this._commonService.showErrorMessage(error); },
    });
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  onPaste(event: ClipboardEvent) {
    setTimeout(() => {
      const input = event.target as HTMLInputElement;
      let value = (input.value || '').trim().replace(/\s+/g, '');
      input.value = value;
      this.onSearch(value);
      input.setSelectionRange(value.length, value.length);
    }, 0);
  }

  onSearch(event: any) {
    let searchText = (event || '').toString().trim().replace(/\s+/g, '');
    this._searchText = searchText;

    if (this.fromFormName === 'fromChequesStatusInformationForm') {
      if (searchText !== '') {
        const lastChar = searchText.substr(searchText.length - 1);
        const asciivalue = lastChar.charCodeAt(0);
        const columnName = asciivalue > 47 && asciivalue < 58 ? 'pChequenumber' : '';
        this.displayGridDataBasedOnForm = this._commonService.transform(
          this.displayGridDataBasedOnFormTemp.map((x: any) => ({ ...x, pChequenumber: x.pChequenumber?.toString().replace(/\s+/g, '') })),
          searchText, columnName
        );
      } else { this.displayGridDataBasedOnForm = this.displayGridDataBasedOnFormTemp; }

      this.pageCriteria.totalrows = this.displayGridDataBasedOnForm.length;
      this.pageCriteria.TotalPages = this.pageCriteria.totalrows > 10 ? Math.ceil(this.pageCriteria.totalrows / 10) : 1;
      this.pageCriteria.currentPageRows = Math.min(this.displayGridDataBasedOnForm.length, this.pageCriteria.pageSize);
    } else {
      const SearchLength: any = this._commonService.searchfilterlength;
      if (searchText !== '' && searchText.length > SearchLength) {
        this.pageSetUp();
        if (this.status === 'cleared') this.Cleared();
        else if (this.status === 'returned') this.Returned();
        else if (this.status === 'onlinereceipts') this.OnlineReceipts();
        else if (this.status === 'chequesdeposited') this.ChequesDeposited();
        else if (this.status === 'all') this.All();
        else this.GetChequesInBank_load(this.bankid);
      } else {
        if (searchText === '') { this.pageSetUp(); this.modeofreceipt = 'ALL'; this.status = 'onlinereceipts'; this.selectedTab = 'onlinereceipts'; this.GetChequesInBank_load(this.bankid); }
        this.gridData.set([...this.gridDatatemp]);
      }
      this.amounttotal = parseFloat(this.gridData().reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0));
    }
  }

  showSearchText($event: any) {
    const searchText = this.ChequesInBankForm.controls['searchtext'].value?.toString().trim() || '';
    this._searchText = searchText;

    if (this.fromFormName === 'fromChequesStatusInformationForm') {
      if (searchText !== '') {
        const lastChar = searchText.substr(searchText.length - 1);
        const asciivalue = lastChar.charCodeAt(0);
        const columnName = asciivalue > 47 && asciivalue < 58 ? 'pChequenumber' : '';
        this.displayGridDataBasedOnForm = this._commonService.transform(this.displayGridDataBasedOnFormTemp, searchText, columnName);
      } else { this.displayGridDataBasedOnForm = this.displayGridDataBasedOnFormTemp; }

      this.pageCriteria.totalrows = this.displayGridDataBasedOnForm.length;
      this.pageCriteria.TotalPages = this.pageCriteria.totalrows > 10 ? Math.ceil(this.pageCriteria.totalrows / 10) : 1;
      this.pageCriteria.currentPageRows = Math.min(this.displayGridDataBasedOnForm.length, this.pageCriteria.pageSize);
    } else {
      if (searchText !== '') {
        const filterFn = (item: any) => item.pChequenumber?.toString().toLowerCase().includes(searchText.toLowerCase());
        const filteredOnHand = this.ChequesInBankData.filter(filterFn);
        const filteredClearReturn = this.ChequesClearReturnData.filter(filterFn);

        this.all = filteredOnHand.length;
        this.chequesdeposited = filteredOnHand.filter((d: any) => d.ptypeofpayment === 'CHEQUE').length;
        this.onlinereceipts = filteredOnHand.filter((d: any) => d.ptypeofpayment !== 'CHEQUE').length;
        this.cleared = filteredClearReturn.filter((d: any) => d.pchequestatus === 'Y').length;
        this.returned = filteredClearReturn.filter((d: any) => d.pchequestatus === 'R').length;

        let filtered: any[] = [];
        if (this.status === 'all') filtered = filteredOnHand;
        else if (this.status === 'chequesdeposited') filtered = filteredOnHand.filter((d: any) => d.ptypeofpayment === 'CHEQUE');
        else if (this.status === 'onlinereceipts') filtered = filteredOnHand.filter((d: any) => d.ptypeofpayment !== 'CHEQUE');
        else if (this.status === 'cleared') filtered = filteredClearReturn.filter((d: any) => d.pchequestatus === 'Y');
        else if (this.status === 'returned') filtered = filteredClearReturn.filter((d: any) => d.pchequestatus === 'R');

        this.gridData.set(JSON.parse(JSON.stringify(filtered)));
        this.gridDatatemp = [...this.gridData()];
        this.amounttotal = this.gridData().reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
      } else {
        this.pageSetUp();
        this.modeofreceipt = 'ALL';
        this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, '');
      }
    }
  }

  loadingDataonClearSearch($event: any) {
    if ($event.target.value === '') {
      this._searchText = '';
      this.modeofreceipt = 'ALL';
      this.GridColumnsHide();
      this.GetChequesInBank_load(this.bankid);
    }
  }

  // ── Reference text duplicate check ────────────────────────────────────────

  checkDuplicateValueslatest($event: any, rowIndex: any, row: any) {
    const value = $event.target.value.trim();
    if (!value) { row.preferencetext = ''; this.gridData.update(r => [...r]); return; }

    let isDuplicate = false;
    this.gridData().forEach(element => {
      if (element.pChequenumber === row.pChequenumber && element.cheque_bank === row.cheque_bank && element.receipt_branch_name === row.receipt_branch_name) {
        if (element.pdepositstatus === true) element.preferencetext = value;
        return;
      }
      if ((element.pdepositstatus === true || element.preturnstatus === true) && element.preferencetext?.toString().trim() !== '' && element.preferencetext.toString().toLowerCase() === value.toLowerCase()) {
        isDuplicate = true;
      }
    });

    if (isDuplicate) {
      this._commonService.showWarningMessage('Already Exist');
      row.preferencetext = '';
      const el = document.getElementById('preferencetext' + rowIndex) as HTMLInputElement;
      if (el) el.value = '';
    } else { row.preferencetext = value; }
    this.gridData.update(r => [...r]);
  }

  validateDuplicates() {
    const arraynew = this.gridData().filter(el => el.pchequestatus === 'Y' || el.pchequestatus === 'R');
    let count = 0;
    for (let i = 0; i < arraynew.length; i++) {
      for (let k = 0; k < arraynew.length; k++) {
        if (arraynew[i].pChequenumber !== arraynew[k].pChequenumber &&
          !this._commonService.isNullOrEmptyString(arraynew[i].preferencetext) &&
          !this._commonService.isNullOrEmptyString(arraynew[k].preferencetext) &&
          arraynew[i].preferencetext === arraynew[k].preferencetext) {
          count += 1;
        }
      }
    }
    return count;
  }

  emptyValuesFound() {
    return this.gridData()
      .filter(el => el.pdepositstatus === true || el.preturnstatus === true)
      .some(item => item.preferencetext === '');
  }

  // ── Grid footer total ──────────────────────────────────────────────────────

  getCurrentPageTotal(dt: any): number {
    if (!dt || !dt._value) return 0;
    const first = dt.first ?? 0;
    const rows = dt.rows ?? 10;
    return (dt._value as any[]).slice(first, first + rows).reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  pdfOrprint(printorpdf: any) {
    if (!this.gridData() || this.gridData().length === 0) { this._commonService.showWarningMessage('No data available'); return; }
    this.Totlaamount = 0;
    const isCleared = this.pdfstatus === 'Cleared';
    const isReturned = this.pdfstatus === 'Returned';
    const hasDateCol = isCleared || isReturned;
    const dateColTitle = isCleared ? 'Cleared Date' : 'Returned Date';

    const headers: string[] = [
      'Cheque/\nReference No.', 'Branch Name', 'Amount', 'Receipt ID', 'Receipt Date', 'Deposited Date',
      ...(hasDateCol ? [dateColTitle] : []), 'Transaction Mode', 'Cheque Bank Name', 'Cheque Branch Name', 'Party',
    ];

    const baseColStyles: Record<number, any> = {
      0: { cellWidth: 30, halign: 'center' }, 1: { cellWidth: 35, halign: 'left' }, 2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 18, halign: 'center' }, 4: { cellWidth: 20, halign: 'center' }, 5: { cellWidth: 20, halign: 'center' },
    };
    if (hasDateCol) {
      baseColStyles[6] = { cellWidth: 20, halign: 'center' }; baseColStyles[7] = { cellWidth: 22, halign: 'center' };
      baseColStyles[8] = { cellWidth: 28, halign: 'left' }; baseColStyles[9] = { cellWidth: 24, halign: 'left' }; baseColStyles[10] = { cellWidth: 38, halign: 'left' };
    } else {
      baseColStyles[6] = { cellWidth: 24, halign: 'center' }; baseColStyles[7] = { cellWidth: 32, halign: 'left' };
      baseColStyles[8] = { cellWidth: 28, halign: 'left' }; baseColStyles[9] = { cellWidth: 46, halign: 'left' };
    }

    const data: any[][] = [];
    this.gridData().forEach((e: any) => {
      const amt = Number(e?.ptotalreceivedamount || 0);
      this.Totlaamount += amt;
      data.push([
        e?.pChequenumber || '', e?.pbranchname || '', this._commonService.convertAmountToPdfFormat(amt),
        e?.preceiptid || '', e?.preceiptdate ? this._commonService.getFormatDateGlobal(e.preceiptdate) : '',
        e?.pdepositeddate ? this._commonService.getFormatDateGlobal(e.pdepositeddate) : '',
        ...(hasDateCol ? [e?.pCleardate ? this._commonService.getFormatDateGlobal(e.pCleardate) : ''] : []),
        e?.ptypeofpayment || '', e?.cheque_bank && e.cheque_bank !== '--NA--' ? e.cheque_bank : '',
        e?.receipt_branch_name && e.receipt_branch_name !== '--NA--' ? e.receipt_branch_name : '', e?.ppartyname || '',
      ]);
    });

    const totalRow: any[] = [
      { content: 'Total', colSpan: 2, styles: { halign: 'right', fontSize: 12, fontStyle: 'bold', textColor: [0, 0, 0] } },
      { content: this._commonService.convertAmountToPdfFormat(this.Totlaamount), styles: { halign: 'right', fontSize: 12, fontStyle: 'bold', textColor: [0, 0, 0], cellWidth: 30 } },
    ];
    for (let i = 0; i < headers.length - 3; i++) totalRow.push('');
    data.push(totalRow);

    this._commonService._downloadchequesReportsPdf('Cheques In Bank', data, headers, baseColStyles, 'landscape', this.bankname || '', this.brsdate || '', this.pdfstatus || '', printorpdf, ' ');
  }

  export(): void {
    this.Totlaamount = 0;
    const isCleared = this.pdfstatus === 'Cleared';
    const isReturned = this.pdfstatus === 'Returned';
    const hasDateCol = isCleared || isReturned;

    const buildRows = (gridDataArr: any[]): any[] =>
      gridDataArr.map((e: any) => {
        const row: Record<string, any> = {
          'Cheque/ Reference No.': e?.pChequenumber || '',
          'Branch Name': e?.pbranchname || '',
          'Amount': e?.ptotalreceivedamount ? this._commonService.removeCommasInAmount(e.ptotalreceivedamount) : '',
          'Receipt Id': e?.preceiptid || '',
          'Receipt Date': e?.preceiptdate ? this._commonService.getFormatDateGlobal(e.preceiptdate) : '',
          'Deposited Date': e?.pdepositeddate ? this._commonService.getFormatDateGlobal(e.pdepositeddate) : '',
        };
        if (isCleared) row['Cleared Date'] = e?.pCleardate ? this._commonService.getFormatDateGlobal(e.pCleardate) : '';
        if (isReturned) row['Returned Date'] = e?.pCleardate ? this._commonService.getFormatDateGlobal(e.pCleardate) : '';
        row['Transaction Mode'] = e?.ptypeofpayment || '';
        row['Cheque Bank Name'] = e?.cheque_bank && e.cheque_bank !== '--NA--' ? e.cheque_bank : '';
        row['Cheque Branch Name'] = e?.receipt_branch_name && e.receipt_branch_name !== '--NA--' ? e.receipt_branch_name : '';
        row['Party'] = e?.ppartyname || '';
        return row;
      });

    if (hasDateCol) { this._commonService.exportAsExcelFile(buildRows(this.gridData()), 'Cheques in Bank'); return; }

    this._accountingtransaction.GetChequesInBankData(this.bankid, this._commonService.getschemaname(), this._commonService.getbranchname(), 0, 99999, 'ALL', '', this._commonService.getCompanyCode(), this._commonService.getBranchCode()).subscribe({
      next: (data: any) => {
        let allRows: any[] = data?.pchequesOnHandlist || [];
        if (this.pdfstatus === 'Cheques Deposited') allRows = allRows.filter((r: any) => this.bankid === 0 ? r.ptypeofpayment === 'CHEQUE' : r.ptypeofpayment === 'CHEQUE' && r.pdepositbankid === this.bankid);
        else if (this.pdfstatus === 'Online Receipts') allRows = allRows.filter((r: any) => this.bankid === 0 ? r.ptypeofpayment !== 'CHEQUE' : r.ptypeofpayment !== 'CHEQUE' && r.pdepositbankid === this.bankid);
        this._commonService.exportAsExcelFile(buildRows(allRows), 'Cheques in Bank');
      },
      error: (err: any) => this._commonService.showErrorMessage(err),
    });
  }

  exportautobrs(gridData: any, type: any) {
    const brstype = type === 'Y' ? 'Cleared' : type === 'N' ? 'Pending' : 'Cleared and Pending';
    const rows: any[] = gridData.map((element: any) => ({
      'Cheque No.': element.pChequenumber,
      'Transaction Date': element.transactiondate ? this._commonService.getFormatDateGlobal(element.transactiondate) : 'NA',
      'Upload Date': element.puploadeddate ? this._commonService.getFormatDateGlobal(element.puploadeddate) : 'NA',
      'Received Amt': element.ptotalreceivedamount ? this._commonService.convertAmountToPdfFormat(element.ptotalreceivedamount) : 'NA',
      'Mode of Receipt': element.pmodofreceipt,
      'Receipt Type': element.preceiptype,
      'Reference Text': element.preferencetext,
    }));
    this._commonService.exportAsExcelFile(rows, 'Auto BRS (' + brstype + ' )');
  }

  // ── PDF generation ─────────────────────────────────────────────────────────

  pdfContentData() {
    const lMargin = 15, rMargin = 15;
    let count = 0;
    if (this.previewdetails.length !== 0) {
      const doc = new jsPDF('p', 'mm', 'a4');
      this.previewdetails.forEach((obj: any) => {
        count++;
        const ExportRightSideData: any[] = [obj.psubscribername?.trim() + ', '];
        const Companyreportdetails = this._commonService._getCompanyDetails();
        const today = this._commonService.getFormatDateGlobal(new Date());
        const DateandLetterNo = ['Date  : ' + today];
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFont('times', 'normal'); doc.setFontSize(12); doc.setTextColor(0, 0, 0);
        doc.text('Dear Sir / Madam', 15, 90);
        doc.text('SUB : NOTICE REGARDING RETURN OF YOUR CHEQUE.', 55, 97);
        const chitno = doc.splitTextToSize(obj.pchitno ?? '', 120);
        doc.text('Ref : Chit No. : ', 55, 104); doc.text(chitno, 85, 104);
        let Content = 'We regret to inform you that your cheque No : ' + obj.preferencenumber +
          ' dated : ' + this._commonService.getFormatDateGlobal(obj.pchequedate) +
          ' for Rs. ' + this._commonService.convertAmountToPdfFormat(obj.ptotalreceivedamount) +
          ' drawn on : ' + obj.pbankname +
          '  towards subscription to the above Chit : ' + obj.pchitno +
          ' has been returned by your bank unpaid.\n\n';
        Content += 'Kindly arrange payment of the amount of the cheque in cash or demand draft together with penality of Rs. ' +
          this._commonService.convertAmountToPdfFormat(obj.pchequereturnchargesamount) +
          ' and Bank Charges immediately on receipt of this letter.\n\n';
        Content += 'Please note that our Official Receipt No. ' + obj.preceiptid +
          ' Date : ' + this._commonService.getFormatDateGlobal(obj.pchequedate) +
          ' issued in this regard stands cancelled. Henceforth payment may be made either in cash or by D.D only.\n\n';
        Content += 'Please note that under the provision of Section 138B of Negotiable Instruments Act we can/will initiate legal proceeding against you if you fail to pay within Fifteen days from the date of this notice.\n\n';
        Content += 'We hope you will not allow us to initiate the above proceedings.\n\n';
        Content += 'We request your immediate response.\n\n';
        doc.text('Yours faithfully,', 165, 200); doc.text('For ' + Companyreportdetails.pCompanyName, 115, 207); doc.text('Manager', 165, 220);
        const kapil_logo = this._commonService.getKapilGroupLogo();
        if (kapil_logo) doc.addImage(kapil_logo, 'JPEG', 10, 5, 30, 20);
        doc.setFont('times', 'normal'); doc.setFontSize(12);
        const address = this._commonService.getcompanyaddress();
        doc.text(Companyreportdetails.pCompanyName, 72, 10); doc.setFontSize(8);
        doc.text(address?.substr(0, 115) ?? '', 110, 15, { align: 'center' });
        doc.text(address?.substring(115) ?? '', 110, 18);
        if (Companyreportdetails?.pCinNo) doc.text('CIN : ' + Companyreportdetails.pCinNo, 90, 22);
        doc.setFontSize(14); doc.text('Cheque Return Invoice', pageWidth / 2, 30, { align: 'center' });
        doc.setFontSize(12); doc.text('To,', 30, 55);
        ExportRightSideData.push((obj.paddress ?? '') + '.');
        this._commonService.addWrappedText({ text: ExportRightSideData, textWidth: 100, doc, fontSize: 10, fontType: 'normal', lineSpacing: 5, xPosition: 30, initialYPosition: 60, pageWrapInitialYPosition: 10 });
        doc.text(DateandLetterNo, 160, 45);
        const P1Lines = doc.splitTextToSize(Content, pageWidth - lMargin - rMargin);
        doc.setFontSize(12); doc.text(P1Lines, 15, 115 + (chitno.length ? 3 : 0));
        if (count !== this.previewdetails.length) doc.addPage();
        else doc.save('Cheque Return Invoice.pdf');
      });
    }
  }

  chequereturnvoucherpdf() {
    const lMargin = 15, rMargin = 15, pdfInMM = 235;
    let count = 0;
    if (this.chequerwturnvoucherdetails.length !== 0) {
      const doc = new jsPDF();
      this.chequerwturnvoucherdetails.forEach((obj: any) => {
        count++;
        const Companyreportdetails = this._commonService._getCompanyDetails();
        const today = this._commonService.getFormatDateGlobal(new Date());
        const DateandLetterNo = ['Date  : ' + today];
        this.todayDate = this.datepipe.transform(this.today, 'dd-MMM-yyyy h:mm:ss a');
        doc.line(15, 42, pdfInMM - lMargin - rMargin, 42);
        doc.setFontSize(12); doc.setFont('times', 'normal'); doc.setTextColor(0, 0, 0);
        const kapil_logo = this._commonService.getKapilGroupLogo();
        doc.addImage(kapil_logo, 'JPEG', 10, 5, 30, 20);
        doc.setFont('times', 'normal'); doc.setFontSize(12);
        const address = this._commonService.getcompanyaddress();
        doc.text(Companyreportdetails.pCompanyName, 72, 10); doc.setFontSize(8); doc.setTextColor(0, 0, 0);
        doc.text(address.substr(0, 115), 110, 15, { align: 'center' });
        doc.text('' + address.substring(115), 110, 18);
        if (!this._commonService.isNullOrEmptyString(Companyreportdetails.pCinNo)) doc.text('CIN : ' + Companyreportdetails.pCinNo, 90, 22);
        doc.setFontSize(14); doc.text('Cheque Return Voucher', 92, 30);
        doc.setFontSize(12); doc.text(DateandLetterNo, 160, 48);
        doc.text('Printed On  :  ' + this.todayDate, 15, 40);
        doc.text('Voucher No. : ' + obj.pvoucherno, 15, 48);
        doc.text('Debit To       : ' + obj.pdebitaccountname, 15, 55);
        doc.text('Bank             : ' + obj.pcreditaccountname, 15, 62);
        doc.rect(15, 135, 30, 12, 'S');
        doc.text('Manager', 55, 145); doc.text('Accounts Officer', 110, 145); doc.text('Cashier', 180, 145);
        doc.text('Amount In Words :  Rupees ' + this.titleCase(this.numbertowords.transform(obj.ptotalreceivedamount)) + ' Only.', 15, 125);
        const bodygrid: any[] = [
          ['Cheque No.', obj.preferencenumber],
          ['Cheque Date', this._commonService.getFormatDateGlobal(obj.pchequedate)],
          ['Bank', obj.pbankname], ['Branch', obj.pbranchname],
          ['Receipt No.', obj.preceiptid],
          ['Receipt Date', this._commonService.getFormatDateGlobal(obj.pchequedate)],
          [{ content: 'Amount', colSpan: 1, styles: { halign: 'right', fontSize: 8, fontStyle: 'bold' } }, this._commonService.currencyFormat(obj.ptotalreceivedamount)],
        ];
        autoTable(doc, {
          tableLineColor: [0, 0, 0], tableLineWidth: 0.1,
          columns: ['PARTICULARS', ''], body: bodygrid, theme: 'grid',
          headStyles: { fillColor: this._commonService.pdfProperties('Header Color1'), halign: this._commonService.pdfProperties('Header Alignment') as any, fontSize: 9, textColor: 0 },
          styles: { cellPadding: 1, fontSize: 10, cellWidth: 'wrap', overflow: 'linebreak', textColor: 0 },
          columnStyles: { 0: { cellWidth: 'wrap', halign: 'left' }, 1: { cellWidth: 'wrap', halign: 'right' } },
          startY: 69, margin: { right: 35, left: 35 },
        });
        doc.setFontSize(12); doc.setTextColor(0, 0, 0);
        if (count !== this.chequerwturnvoucherdetails.length) doc.addPage();
        else doc.save('Cheque Return Voucher.pdf');
      });
    }
  }

  titleCase(str: any) {
    return str.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.substring(1)).join(' ');
  }

  // ── Validation helpers ─────────────────────────────────────────────────────

  checkValidations(group: FormGroup, isValid: boolean): boolean {
    try {
      Object.keys(group.controls).forEach(key => { isValid = this.GetValidationByControl(group, key, isValid); });
    } catch (e) { this.showErrorMessage('e'); return false; }
    return isValid;
  }

  GetValidationByControl(formGroup: FormGroup, key: string, isValid: boolean): boolean {
    try {
      const formcontrol = formGroup.get(key);
      if (formcontrol) {
        if (formcontrol instanceof FormGroup) { this.checkValidations(formcontrol, isValid); }
        else if (formcontrol.validator) {
          this.ChequesInBankValidation[key] = '';
          if (formcontrol.errors || formcontrol.invalid || formcontrol.touched || formcontrol.dirty) {
            const lablename = (document.getElementById(key) as HTMLInputElement)?.title || key;
            for (const errorkey in formcontrol.errors) {
              const errormessage = this._commonService.getValidationMessage(formcontrol, errorkey, lablename, key, '');
              this.ChequesInBankValidation[key] += errormessage + ' ';
              isValid = false;
            }
          }
        }
      }
    } catch (e) { this.showErrorMessage('e'); return false; }
    return isValid;
  }

  showErrorMessage(errormsg: string) { this._commonService.showErrorMessage(errormsg); }

  BlurEventAllControll(fromgroup: FormGroup): any {
    try {
      Object.keys(fromgroup.controls).forEach(key => this.setBlurEvent(fromgroup, key));
    } catch (e) { this.showErrorMessage('e'); return false; }
  }

  setBlurEvent(fromgroup: FormGroup, key: string): any {
    try {
      const formcontrol = fromgroup.get(key);
      if (formcontrol) {
        if (formcontrol instanceof FormGroup) this.BlurEventAllControll(formcontrol);
        else if (formcontrol.validator) fromgroup.get(key)?.valueChanges.subscribe(() => this.GetValidationByControl(fromgroup, key, true));
      }
    } catch (e) { this.showErrorMessage('e'); return false; }
  }

  // ── Cheques status info grid ───────────────────────────────────────────────

  chequesStatusInfoGrid() {
    const el = document.getElementById('chequescss');
    if (el) el.classList.add('active');
    const allEl = document.getElementById('allcss');
    if (allEl) allEl.classList.remove('active');

    const grid: any[] = [];
    for (const row of this.ChequesInBankData) {
      if (row['ptypeofpayment'] === 'CHEQUE') { row['chequeStatus'] = 'Deposited'; grid.push(row); }
    }
    for (const row of this.ChequesClearReturnData) {
      if (row['pchequestatus'] === 'Y') { row['chequeStatus'] = 'Cleared'; grid.push(row); }
    }
    for (const row of this.ChequesClearReturnData) {
      if (row['pchequestatus'] === 'R') { row['chequeStatus'] = 'Returned'; grid.push(row); }
    }

    this.displayGridDataBasedOnForm = grid;
    this.displayGridDataBasedOnFormTemp = JSON.parse(JSON.stringify(grid));
    this.setPageModel2();
    this.pageCriteria.totalrows = grid.length;
    this.pageCriteria.TotalPages = 1;
    if (this.pageCriteria.totalrows > this.pageCriteria.pageSize)
      this.pageCriteria.TotalPages = parseInt((this.pageCriteria.totalrows / this.pageCriteria.pageSize).toString()) + 1;
    this.pageCriteria.currentPageRows = Math.min(grid.length, this.pageCriteria.pageSize);
  }

  // ── Auto BRS ───────────────────────────────────────────────────────────────

  onFileChange(evt: any) {
    this.PreDefinedAutoBrsArrayData = [];
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: false });
      const ws: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[0]];
      this.Exceldata = (<AOA>XLSX.utils.sheet_to_json(ws, { header: 1 })).slice(1);
      this.PreDefinedAutoBrsArrayData = this.Exceldata.map((arr: any) => ({
        transactiondate: new Date((arr[0] - 25569) * 86400000),
        chqueno: arr[1], chequeamount: arr[2], preferencetext: arr[3], preceiptype: arr[4], uploadtype: arr[5],
      }));
      this.PreDefinedAutoBrsArrayData = [...this.PreDefinedAutoBrsArrayData];
      this.saveshowhide.set(false);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  DownloadExcelforPreDefinedBidAmount(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AutoBrs');
    XLSX.writeFile(wb, this.fileName);
  }

  BankUploadExcel() { this.saveshowhide.set(false); this.PreDefinedAutoBrsArrayData = []; }

  AutoBrs() {
    if (this.ChequesInBankForm.controls['bankname'].value) {
      this.status = 'autobrs'; this.modeofreceipt = 'ONLINE-AUTO';
      this.brsdateshowhidereturned.set(false); this.saveshowhide.set(true);
      this.GetChequesInBank_load(this.bankid);
    } else { this._commonService.showWarningMessage('Please Select Bank'); this.gridData.set([]); }
  }

  saveAutoBrs() {
    let valid = false;
    let PreDefinedAutoBrsArrayData: any = [];
    if (this.auto_brs_type_name === 'Upload') {
      valid = Array.isArray(this.PreDefinedAutoBrsArrayData) && this.PreDefinedAutoBrsArrayData.length !== 0;
      PreDefinedAutoBrsArrayData = JSON.parse(JSON.stringify(this.PreDefinedAutoBrsArrayData));
    } else if (this.auto_brs_type_name === 'Pending') {
      valid = this.PreDefinedAutoBrsArrayData.filter((x: any) => x.check).length > 0;
      PreDefinedAutoBrsArrayData = JSON.parse(JSON.stringify(this.PreDefinedAutoBrsArrayData.filter((x: any) => x.check)));
    }
    if (valid) {
      if (confirm('Do you want to save ?')) {
        PreDefinedAutoBrsArrayData.forEach((element: any) => {
          element.transactiondate = this._commonService.getFormatDateNormal(element.transactiondate);
          element['ptranstype'] = element.preceiptype; element['preceiptype'] = element.uploadtype;
        });
        this.saveAutoBrsBool = true;
        this._accountingtransaction.SaveAutoBrsdataupload(JSON.stringify({ pchequesOnHandlist: PreDefinedAutoBrsArrayData, schemaname: this._commonService.getschemaname(), auto_brs_type_name: this.auto_brs_type_name })).subscribe({
          next: (res: any) => { this.saveAutoBrsBool = false; if (res) { this._commonService.showSuccessMessage(); this.PreDefinedAutoBrsArrayData = []; } else this._commonService.showWarningMessage('Not Saved!!'); },
          error: (error: any) => { this._commonService.showErrorMessage(error); this.saveAutoBrsBool = false; },
        });
      }
    } else { this._commonService.showWarningMessage('No Data to Save'); }
  }

  autoBrsCheckedClear($event: any, row: any) {
    this.selectedamt = 0;
    if ($event.target.checked) {
      const chequecleardate = this.ChequesInBankForm.controls['pchequecleardate'].value;
      if (new Date(chequecleardate).getTime() >= new Date().getTime()) {
        this._searchText = row.pChequenumber?.toString() || '';
        this.gridLoading.set(true);
        this._accountingtransaction.GetChequesInBankData(
          this.bankid, this._commonService.getschemaname(), this._commonService.getbranchname(),
          0, 99999, this.modeofreceipt, this._searchText, this._commonService.getCompanyCode(), this._commonService.getBranchCode()
        ).subscribe((res: any) => {
          this.autoBrsDuplicates = res?.pchequesOnHandlist || [];
          for (const r of this.autoBrsDuplicates) {
            if (r.pChequenumber === row.pChequenumber && r.pchequedate === row.pchequedate) this.autoBrsData = [...this.autoBrsData, r];
          }
          this.selectedamt = this.autoBrsData.reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
          this.gridLoading.set(false);
        });
      } else {
        this._commonService.showWarningMessage('Cheque Clear Date Should be Greater than or Equal to Deposited Date');
        this.gridLoading.set(false); $event.target.checked = false; row.pdepositstatus = false;
        this.selectedamt = this.autoBrsData.reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
      }
    } else {
      this.autoBrsData = this.autoBrsData.filter((x: any) => x.pChequenumber !== row.pChequenumber);
      this.selectedamt = this.autoBrsData.reduce((sum: number, c: any) => sum + (c.ptotalreceivedamount || 0), 0);
    }
  }

  checkbox_pending_data(row: any, $event: any) { this.PreDefinedAutoBrsArrayData[row.index]['check'] = $event.target.checked; }

  getAutoBrs(type: any) {
    this.PreDefinedAutoBrsArrayData = [];
    this._accountingtransaction.GetPendingautoBRSDetails(
      this._commonService.getbranchname(), type, this._commonService.getschemaname(),
      this._commonService.getBranchCode(), this._commonService.getCompanyCode()
    ).subscribe({
      next: (res: any) => {
        this.PreDefinedAutoBrsArrayData = (res || []).map((x: any, i: number) => ({
          ...x, chqueno: x?.pChequenumber, chequeamount: x?.ptotalreceivedamount,
          uploadtype: x?.preceiptype, preceiptype: x?.pmodofreceipt, index: i, check: false,
        }));
        this.PreDefinedAutoBrsArrayData = [...this.PreDefinedAutoBrsArrayData];
      },
      error: (error: any) => this._commonService.showErrorMessage(error),
    });
  }

  auto_brs_typeChange(event: any) { this.PreDefinedAutoBrsArrayData = []; this.auto_brs_type_name = event; }
  receipttypeChange(event: any) { if (event != undefined) this.receiptmode = event.value === 'Adjusted' ? 'CH' : 'I'; }

  loadPage(event: any) {
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    this.page.size = rows;
    this.page.offset = Math.floor(first / rows);
    this.startindex = first;
    this.endindex = first + rows;
    this.preferdrows.set(false);
    if (this.fromdate !== '' && this.todate !== '') this.GetDataOnBrsDates1(this.fromdate, this.todate, this.bankid);
    else this.GetChequesInBankforSearchDeposit(this.bankid, this.startindex, this.endindex, this._searchText || '');
  }

  // ── Date config helpers ────────────────────────────────────────────────────

  ToDateChange(event: Date): void { if (event) this.dpConfig1 = { ...this.dpConfig1, minDate: event }; }
  FromDateChange(event: Date): void { if (event) this.dpConfig = { ...this.dpConfig, maxDate: event }; }
  onBrsFromDateChange(event: Date): void { if (event) this.brstoConfig = { ...this.brstoConfig, minDate: event }; }
  onBrsToDateChange(event: Date): void { if (event) this.brsfromConfig = { ...this.brsfromConfig, maxDate: event }; }
  OnBrsDateChanges(fromdate: any, todate: any) { this.validate = fromdate > todate; }
  setPageModel2() { this.pageCriteria2.pageSize = this._commonService.pageSize; this.pageCriteria2.offset = 0; this.pageCriteria2.pageNumber = 1; this.pageCriteria2.footerPageHeight = 50; }
  generatePdf() { console.log('Printed on:', this.printedOn); }
  public group: any[] = [{ field: 'preceiptdate' }, { field: 'pChequenumber' }];
}
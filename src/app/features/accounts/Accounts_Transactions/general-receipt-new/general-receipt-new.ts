import { Component, OnInit, signal, computed, inject, DestroyRef} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonService } from '../../../../core/services/Common/common.service';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors} from '@angular/forms';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { SharedModule } from 'primeng/api';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AccountsTransactions } from '../../../../core/services/accounts/accounts-transactions';
import { ValidationMessageComponent } from '../../../common/validation-message/validation-message.component';
import { AccountsConfig } from '../../../../core/services/accounts/accounts-config';

function alphabetsOnlyValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^[a-zA-Z\s]+$/.test(control.value.toString().trim()) ? null : { alphabetsOnly: true };
}

function digitsOnlyValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^[0-9]+$/.test(control.value.toString().replace(/,/g, '')) ? null : { digitsOnly: true };
}

function alphanumericValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^[a-zA-Z0-9]+$/.test(control.value.toString().trim()) ? null : { alphanumeric: true };
}

function cardNumberValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  return /^\d{16}$/.test(control.value.toString().replace(/\s/g, '')) ? null : { cardNumber: true };
}

function positiveAmountValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const val = parseFloat(control.value.toString().replace(/,/g, ''));
  if (isNaN(val)) return { positiveAmount: true };
  return val > 0 ? null : { positiveAmount: true };
}

function percentageValidator(control: AbstractControl): ValidationErrors | null {
  if (control.value === null || control.value === '') return null;
  const val = parseFloat(control.value.toString());
  if (isNaN(val)) return { percentage: true };
  return val >= 0 && val <= 100 ? null : { percentage: true };
}

@Component({
  selector: 'app-general-receipt-new',
  standalone: true,
  imports: [
    MessageModule, FormsModule, ReactiveFormsModule,
    SharedModule, NgSelectModule, ButtonModule, TableModule,
    ValidationMessageComponent, BsDatepickerModule,
    CurrencyPipe, DecimalPipe, RouterModule
  ],
  templateUrl: './general-receipt-new.html',
  styleUrl: './general-receipt-new.css',
})
export class GeneralReceiptNew implements OnInit {

  // ── DI via inject() ────────────────────────────────────────────────────────
  private readonly _commonService = inject(CommonService);
  private readonly _fb = inject(FormBuilder);
  private readonly _accountservice = inject(AccountsTransactions);
  private readonly _accountingMasterService = inject(AccountsConfig);
  private readonly _router = inject(Router);
  private readonly _datepipe = inject(DatePipe);
  private readonly _destroyRef = inject(DestroyRef);

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly loading = signal(false);
  readonly showCashWarning = signal(false);
  readonly cashWarningMessage = signal('');
  readonly disableSaveButton = signal(false);
  readonly saveButtonLabel = signal('Save');
  readonly gridShowHide = signal(false);
  readonly paymentsList = signal<any[]>([]);
  readonly partyJournalEntryList = signal<any[]>([]);

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly totalTdsAmount = computed(() =>
    this.paymentsList().reduce((sum, c) => sum + (Number(c.ptdsamountindividual) || 0), 0)
  );

  readonly paymentColumnTotals = computed(() => {
    const list = this.paymentsList();
    return {
      ptotalamount: parseFloat(list.reduce((s, c) => s + (Number(c.ptotalamount) || 0), 0).toFixed(2)),
      pamount: parseFloat(list.reduce((s, c) => s + (Number(c.pamount) || 0), 0).toFixed(2)),
      pgstamount: parseFloat(list.reduce((s, c) => s + (Number(c.pgstamount) || 0), 0).toFixed(2)),
    };
  });

  // ── Form ───────────────────────────────────────────────────────────────────
  generalReceiptForm!: FormGroup;

  // ── Date Config ────────────────────────────────────────────────────────────
  dpConfig: Partial<BsDatepickerConfig> = {
    containerClass: 'theme-dark-blue',
    dateInputFormat: 'DD-MMM-YYYY',
    showWeekNumbers: false,
    isAnimated: true,
  };
  dpConfig1: Partial<BsDatepickerConfig> = {
    maxDate: new Date(),
    containerClass: 'theme-dark-blue',
    dateInputFormat: 'DD-MMM-YYYY',
    showWeekNumbers: false,
    isAnimated: true,
  };
  readonly maxDate = new Date();
  readonly today = new Date();

  // ── UI State ───────────────────────────────────────────────────────────────
  submitted = false;
  bankshowhide = false;
  walletshowhide = false;
  chequeshowhide = false;
  onlineshowhide = false;
  debitShowhide = false;
  creditShowhide = false;
  showgst = false;
  showtds = false;
  showigst = false;
  showcgst = false;
  showsgst = false;
  showutgst = false;
  showgstno = false;
  showgstamount = false;
  showsubledger = true;
  showupi = false;
  depositBankDisable = false;
  disableTransactionDate = false;
  gstPercentageSelected = false;

  // ── Data Lists ─────────────────────────────────────────────────────────────
  banklist: any[] = [];
  banklist1: any[] = [];
  modeoftransactionslist: any;
  typeofpaymentlist: any;
  ledgeraccountslist: any;
  partylist: any;
  gstlist: any;
  debitcardlist: any;
  tdssectionlist: any;
  tdspercentagelist: any;
  tdslist: any;
  statelist: any;
  upinameslist: any;
  subledgeraccountslist: any;

  // ── Balances ───────────────────────────────────────────────────────────────
  cashBalance = '';
  bankBalance = '';
  bankbookBalance = '';
  bankpassbookBalance = '';
  ledgerBalance = '';
  subledgerBalance = '';
  partyBalance = '';
  walletBalance = 0;
  availableAmount: any;
  cashRestrictAmount: any;

  // ── Misc ───────────────────────────────────────────────────────────────────
  currencySymbol: any;
  modeofpayment: any;
  transtype: any;
  tempGSTtype: any = '';
  tempModeofReceipt: any = '';
  temporaryamount = 0;
  imageResponse: any;
  tempState: any = '';
  tempgstno: any = '';
  formValidationMessages: any = {};
  private _selectedPartyStateName = '';
  private readonly CASH_TRANSACTION_LIMIT = 200000;

  gstnopattern = '^(0[1-9]|[1-2][0-9]|3[0-9])([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([a-zA-Z0-9]){1}([a-zA-Z]){1}([a-zA-Z0-9]){1}?';

  readonly bankButtonData = [
    { id: 1, type: 'Cheque', chequeshowhide: true, onlineshowhide: false, debitShowhide: false, creditShowhide: false },
    { id: 2, type: 'Online', chequeshowhide: false, onlineshowhide: true, debitShowhide: false, creditShowhide: false },
    { id: 3, type: 'Debit Card', chequeshowhide: false, onlineshowhide: false, debitShowhide: true, creditShowhide: false },
    { id: 4, type: 'Credit Card', chequeshowhide: false, onlineshowhide: false, debitShowhide: false, creditShowhide: true },
  ];

  readonly paymentButtonData = [
    { id: 1, type: 'Cash', bankshowhide: false, walletshowhide: false },
    { id: 2, type: 'Bank', bankshowhide: true, walletshowhide: false },
    { id: 3, type: 'Wallet', bankshowhide: false, walletshowhide: true },
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.currencySymbol = this._commonService.currencysymbol;
    this.partyBalance = `${this.currencySymbol} 0 Dr`;
    this.ledgerBalance = `${this.currencySymbol} 0 Dr`;
    this.subledgerBalance = `${this.currencySymbol} 0 Dr`;
    this.bankpassbookBalance = `${this.currencySymbol} 0 Dr`;
    this.bankbookBalance = `${this.currencySymbol} 0 Dr`;

    if (this._commonService.comapnydetails != null) {
      this.disableTransactionDate = this._commonService.comapnydetails.pdatepickerenablestatus;
    }

    this._buildForm();
    this._setupValueChangeListeners();
    this._loadBankLists();

    this.bankntlist();
    this.generalReceiptForm.controls['preceiptdate'].setValue(new Date());
    this.paymenttype('Cash');
    this.generalReceiptForm.get('ptypeofpayment')?.setValue('Cash');
    this.checkDepositBankEnable();
    this.getLoadData();
    this.blurEventAllControls(this.generalReceiptForm);
    sessionStorage.removeItem('schemaNameForReportCall');
  }

  private _buildForm(): void {
    this.generalReceiptForm = this._fb.group({
      preceiptid: [''],
      preceiptdate: [{ value: this.today, disabled: true }, [Validators.required]],
      pmodofreceipt: ['CASH', [Validators.required]],
      ptotalreceivedamount: [0],
      pnarration: ['', [Validators.required, Validators.maxLength(250)]],
      ppartyname: [''],
      ppartyid: [null, [Validators.required]],
      pistdsapplicable: [false],
      pTdsSection: [''],
      pTdsPercentage: [0, [percentageValidator]],
      ptdsamount: [0],
      ptdscalculationtype: [''],
      ppartypannumber: [''],
      pbankname: ['', [alphabetsOnlyValidator]],
      pbranchname: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/), Validators.maxLength(30)]],
      schemaname: [this._commonService.getschemaname()],
      ptranstype: [''],
      ptypeofpayment: [null],
      pAccountnumber: [''],
      pChequenumber: [''],
      pchequedate: [{ value: this.today, disabled: false }],
      pbankid: [null],
      pCardNumber: ['', [cardNumberValidator]],
      pdepositbankid: ['', Validators.required],
      pdepositbankid1: [null, Validators.required],
      pdepositbankname: [''],
      pRecordid: [0],
      pUpiname: [''],
      pUpiid: [''],
      pstatename: [''],
      pCreatedby: [this._commonService.getCreatedBy()],
      pModifiedby: [0],
      pStatusid: [''],
      pStatusname: [this._commonService.pStatusname],
      pEffectfromdate: [''],
      pEffecttodate: [''],
      ptypeofoperation: [this._commonService.ptypeofoperation],
      ppartyreferenceid: [''],
      ppartyreftype: [''],
      preceiptslist: this._buildReceiptsListGroup(),
      pFilename: [''],
      pFilepath: [''],
      pFileformat: [''],
      pipaddress: [this._commonService.getIpAddress()],
      pDocStorePath: [''],
      pchequestatus: [false],
    });
  }

  private _buildReceiptsListGroup(): FormGroup {
    return this._fb.group({
      pisgstapplicable: [false],
      pState: [''],
      pStateId: [''],
      pgstpercentage: [''],
      pamount: [''],
      pgsttype: [''],
      pgstcalculationtype: ['INCLUDE'],
      pigstamount: [''],
      pcgstamount: [''],
      psgstamount: [''],
      putgstamount: [''],
      psubledgerid: [null],
      psubledgername: [''],
      pledgerid: [null],
      pledgername: [''],
      pCreatedby: [this._commonService.pCreatedby],
      pStatusname: [this._commonService.pStatusname],
      pModifiedby: [''],
      pStatusid: [''],
      pEffectfromdate: [''],
      pEffecttodate: [''],
      ptypeofoperation: [this._commonService.ptypeofoperation],
      pgstamount: [''],
      pgstno: new FormControl('', [Validators.pattern(this.gstnopattern)]),
      pigstpercentage: [''],
      pcgstpercentage: [''],
      psgstpercentage: [''],
      putgstpercentage: [''],
      pactualpaidamount: ['', [
        Validators.required,
        positiveAmountValidator,
        Validators.pattern(/^[0-9,]+(\.[0-9]{1,2})?$/),
      ]],
      ptotalamount: [''],
    });
  }

  private _setupValueChangeListeners(): void {
    this.generalReceiptForm.get('pbankid')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(val => {
        if (this.generalReceiptForm.get('ptranstype')?.value === 'Online') this.toggleReferenceNo(val);
        this.checkDepositBankEnable();
      });

    this.generalReceiptForm.get('pbankname')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(val => {
        const type = this.generalReceiptForm.get('ptranstype')?.value;
        if (type === 'Debit Card' || type === 'Credit Card') this.toggleReferenceNo(val);
      });

    this.generalReceiptForm.get('ptypeofpayment')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.checkDepositBankEnable());

    this.generalReceiptForm.get('preceiptslist.pactualpaidamount')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.recalculateAll());

    this.generalReceiptForm.get('pTdsPercentage')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.recalculateAll());

    this.generalReceiptForm.get('preceiptslist.pgstpercentage')?.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.recalculateAll());
  }

  private _loadBankLists(): void {
    this._accountservice.GetGlobalBanks('global')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({ next: (res) => { this.banklist = res; }, error: (err) => this._commonService.showErrorMessage(err) });

    this._accountservice.GetBanksntList(
      this._commonService.getbranchname(), this._commonService.getschemaname(),
      this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({ next: (res) => { this.banklist1 = res.banklist; }, error: (err) => this._commonService.showErrorMessage(err) });
  }

  paymenttype(type: string): void {
    const btn = this.paymentButtonData.find(b => b.type === type);
    if (btn) { this.bankshowhide = btn.bankshowhide; this.walletshowhide = btn.walletshowhide; }

    ['pbankname', 'pChequenumber', 'pchequedate', 'pdepositbankname',
      'ptypeofpayment', 'pbranchname', 'pCardNumber', 'pAccountnumber'].forEach(f => {
        this.generalReceiptForm.controls[f].setValue(f === 'pchequedate' ? this.today : '');
      });

    this.setBalances('BANKBOOK', 0);
    this.setBalances('PASSBOOK', 0);
    this.showCashWarning.set(false);
    this.cashWarningMessage.set('');

    if (type === 'Bank') {
      this.generalReceiptForm.controls['ptranstype'].setValue('Cheque');
      this.banktype('Cheque');
      this.modeofpayment = type;
    } else {
      this.generalReceiptForm.controls['ptranstype'].setValue('');
      ['pdepositbankname', 'pbankid', 'pChequenumber', 'ptypeofpayment',
        'pbranchname', 'pCardNumber', 'pchequedate', 'pAccountnumber'].forEach(f => {
          this.generalReceiptForm.controls[f].clearValidators();
          this.generalReceiptForm.controls[f].updateValueAndValidity();
        });
      this.chequeshowhide = false;
      this.onlineshowhide = false;
      this.creditShowhide = false;
      this.debitShowhide = false;
      this.modeofpayment = type;
      this.transtype = '';
      this.depositBankDisable = false;
      ['pChequenumber', 'pdepositbankid', 'ptypeofpayment', 'pbranchname', 'pAccountnumber', 'pbankname']
        .forEach(f => this.generalReceiptForm.get(f)?.enable());
    }
  }

  banktype(type: string): void {
    this.validation(type);
    ['pbankid', 'ptypeofpayment', 'pbranchname', 'pCardNumber', 'pAccountnumber', 'pbankname'].forEach(f => {
      const ctrl = this.generalReceiptForm.controls[f];
      ctrl.setValue(f === 'pbankid' || f === 'ptypeofpayment' ? null : '');
    });
    this.generalReceiptForm.controls['pChequenumber'].setValue('');
    this.generalReceiptForm.controls['pchequedate'].setValue(this.today);
    this.generalReceiptForm.controls['pdepositbankid'].setValue(null);
    this.generalReceiptForm.controls['pchequestatus'].setValue(type === 'Cheque');
    this.formValidationMessages['pdepositbankid'] = '';
    this.transtype = type;

    this.typeofpaymentlist = type === 'Online'
      ? (this.modeoftransactionslist || []).filter((p: any) => p.ptranstype === 'Online' && p.ptypeofpayment !== 'Online')
      : this.gettypeofpaymentdata();

    const btn = this.bankButtonData.find(b => b.type === type);
    if (btn) {
      this.chequeshowhide = btn.chequeshowhide;
      this.onlineshowhide = btn.onlineshowhide;
      this.creditShowhide = btn.creditShowhide;
      this.debitShowhide = btn.debitShowhide;
    }

    this.generalReceiptForm.controls['pdepositbankid'].setValue(null);
    this.generalReceiptForm.controls['pdepositbankname'].setValue('');
    this.setBalances('BANKBOOK', 0);
    this.setBalances('PASSBOOK', 0);

    if (type === 'Online') {
      this.generalReceiptForm.controls['ptypeofpayment'].setValue('');
      this.generalReceiptForm.get('pChequenumber')?.disable();
    } else {
      this.generalReceiptForm.controls['ptypeofpayment'].setValue(type);
      this.generalReceiptForm.get('pChequenumber')?.enable();
      if (type === 'Debit Card' || type === 'Credit Card') {
        this.generalReceiptForm.get('pChequenumber')?.disable();
        const modeofpayment = this.generalReceiptForm.controls['pmodofreceipt'].value?.toUpperCase();
        let depositBankDisable = false;
        if (this.modeoftransactionslist) {
          this.modeoftransactionslist.filter((d: any) => {
            if (d.ptypeofpayment === type.toUpperCase() && d.pmodofPayment === modeofpayment && d.ptranstype === type.toUpperCase()) {
              depositBankDisable = d.pchqonhandstatus === 'Y';
            }
          });
        }
        const ctrl = this.generalReceiptForm.controls['pdepositbankid'];
        if (depositBankDisable) ctrl.clearValidators(); else ctrl.setValidators(Validators.required);
        ctrl.updateValueAndValidity();
      }
    }
    this.generalReceiptForm.controls['ptranstype'].setValue(type);
    this.checkDepositBankEnable();
  }

  checkDepositBankEnable(): void {
    const transtype = this.generalReceiptForm.get('ptranstype')?.value;
    const control = this.generalReceiptForm.get('pdepositbankid');
    if (transtype === 'Debit Card' || transtype === 'Credit Card') { control?.enable(); return; }
    const bank = this.generalReceiptForm.get('pbankid')?.value;
    const payment = this.generalReceiptForm.get('ptypeofpayment')?.value;
    if (bank && payment) control?.enable();
    else { control?.setValue(null); control?.disable(); }
  }

  toggleReferenceNo(value: any): void {
    const refCtrl = this.generalReceiptForm.get('pChequenumber');
    if (value && value.toString().trim() !== '') refCtrl?.enable();
    else { refCtrl?.reset(); refCtrl?.disable(); }
  }

  isDepositBankEnabled(): boolean {
    const transtype = this.generalReceiptForm.get('ptranstype')?.value;
    if (transtype === 'Debit Card' || transtype === 'Credit Card') return true;
    return !!this.generalReceiptForm.get('pbankid')?.value && !!this.generalReceiptForm.get('ptypeofpayment')?.value;
  }

  bankIdChange($event: any): void {
    this.bankntlist();
    this.generalReceiptForm.get('pbankid')?.markAsTouched();
    this.getValidationByControl(this.generalReceiptForm, 'pbankid', true);
    if (!$event && $event !== 0) {
      this.generalReceiptForm.controls['pbranchname'].setValue('');
      this.setBalances('BANKBOOK', 0); this.setBalances('PASSBOOK', 0); return;
    }
    let pbankid: any;
    let bankObj: any = null;
    if (typeof $event === 'object' && $event !== null) { pbankid = $event.pbankid ?? $event.pBankId ?? $event.id; bankObj = $event; }
    else pbankid = $event;
    if (!bankObj) bankObj = (this.banklist1 || []).find((b: any) => b.pbankid == pbankid || b.pBankId == pbankid || b.id == pbankid);
    if (bankObj) { this.setBalances('BANKBOOK', Number(bankObj.pbankbalance) || 0); this.setBalances('PASSBOOK', Number(bankObj.pbankpassbookbalance) || 0); }
    this.getBankBranchName(pbankid);
    this.generalReceiptForm.get('pbranchname')?.reset();
    this.checkDepositBankEnable();
  }

  getBankBranchName(pbankid: any): void {
    if (!pbankid) { this.generalReceiptForm.controls['pbranchname'].setValue(''); this.setBalances('BANKBOOK', 0); this.setBalances('PASSBOOK', 0); return; }
    const bank = (this.banklist || []).find((b: any) => b.pbankid == pbankid || b.id == pbankid);
    if (!bank) { this.generalReceiptForm.controls['pbranchname'].setValue(''); this.setBalances('BANKBOOK', 0); this.setBalances('PASSBOOK', 0); return; }
    this.generalReceiptForm.controls['pbranchname'].setValue(bank.pbranchname || bank.pBranchName || '');
    this.setBalances('BANKBOOK', Math.round(Number(bank.pbankbalance) || 0));
    this.setBalances('PASSBOOK', Math.round(Number(bank.pbankpassbookbalance) || 0));
  }

  bankntlist(): void {
    this._accountservice.GetBanksntList(
      this._commonService.getbranchname(), this._commonService.getschemaname(),
      this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({ next: (res) => { this.banklist1 = res.banklist; }, error: (err) => this._commonService.showErrorMessage(err) });
  }

  typeofDepositBank($event: any): void {
    if (!$event) { this.formValidationMessages['pdepositbankid'] = ''; return; }
    let pbankId: any;
    let bankObj: any = null;
    if (typeof $event === 'object' && $event !== null) { pbankId = $event.pbankId ?? $event.pbankid ?? $event.id; bankObj = $event; }
    else pbankId = $event;
    if (!bankObj && pbankId) {
      bankObj = (this.banklist1 || []).find((b: any) => b.pbankId == pbankId || b.pbankid == pbankId || b.id == pbankId)
        || (this.banklist || []).find((b: any) => b.pbankid == pbankId || b.id == pbankId);
    }
    if (bankObj) {
      this.generalReceiptForm.controls['pdepositbankname'].setValue(bankObj.pbankname || bankObj.pBankName || '');
      this.setBalances('BANKBOOK', Math.round(Number(bankObj.pbankbalance) || 0));
      this.setBalances('PASSBOOK', Math.round(Number(bankObj.pbankpassbookbalance) || 0));
    }
    this.formValidationMessages['pdepositbankid'] = '';
    this.generalReceiptForm.get('pdepositbankid')?.markAsTouched();
  }

  onDepositBankClose(): void {
    const rawValue = this.generalReceiptForm.getRawValue().pdepositbankid;
    if (rawValue !== null && rawValue !== undefined && rawValue !== '') this.formValidationMessages['pdepositbankid'] = '';
    else { this.generalReceiptForm.get('pdepositbankid')?.markAsTouched(); this.getValidationByControl(this.generalReceiptForm, 'pdepositbankid', true); }
  }

  setBalances(balancetype: string, balanceamount: string | number): void {
    const amount = Number(balanceamount) || 0;
    const rounded = Math.round(Math.abs(amount));
    const formattedAmount = this._commonService.currencyFormat(rounded.toString());
    const balanceDetails = amount < 0 ? `${formattedAmount} Cr` : `${formattedAmount} Dr`;
    switch (balancetype) {
      case 'CASH': this.cashBalance = balanceDetails; break;
      case 'BANK': this.bankBalance = balanceDetails; break;
      case 'BANKBOOK': this.bankbookBalance = `${this.currencySymbol} ${balanceDetails}`; break;
      case 'PASSBOOK': this.bankpassbookBalance = `${this.currencySymbol} ${balanceDetails}`; break;
      case 'LEDGER': this.ledgerBalance = `${this.currencySymbol} ${balanceDetails}`; break;
      case 'SUBLEDGER': this.subledgerBalance = `${this.currencySymbol} ${balanceDetails}`; break;
      case 'PARTY': this.partyBalance = `${this.currencySymbol} ${balanceDetails}`; break;
    }
  }

  getSafeBalance(balance: string, fallback?: string): string {
    const fb = fallback || `${this.currencySymbol} 0 Dr`;
    if (!balance) return fb;
    if (balance.includes('NaN') || balance.includes('undefined')) return fb;
    return balance;
  }

  partyNameChange($event: any): void {
    this.availableAmount = 0; this.tempState = ''; this.tempgstno = ''; this.tempGSTtype = ''; this.tempModeofReceipt = '';
    this.showtds = false;
    this.generalReceiptForm.controls['pistdsapplicable'].setValue(false);
    this.generalReceiptForm.get('preceiptslist.pisgstapplicable')?.setValue(false);
    this.showgst = false;
    this._resetGstDisplayFlags();
    this.gstvalidation(false);
    this.statelist = [];
    this.generalReceiptForm.get('preceiptslist.pStateId')?.setValue('');
    this.generalReceiptForm.get('preceiptslist.pState')?.setValue('');
    this.tdssectionlist = []; this.tdspercentagelist = [];
    this.clearPaymentDetails();
    this.paymentsList.set([]); this.partyJournalEntryList.set([]);
    this.generalReceiptForm.controls['pTdsSection'].setValue('');
    this.generalReceiptForm.controls['pTdsPercentage'].setValue(0);
    this.generalReceiptForm.controls['ppartyreferenceid'].setValue('');
    this.generalReceiptForm.controls['ppartyreftype'].setValue('');
    this.generalReceiptForm.controls['ppartypannumber'].setValue('');
    this.partyBalance = `${this.currencySymbol} 0 Dr`;
    this.showCashWarning.set(false); this.cashWarningMessage.set('');

    const trans_date = this._commonService.getFormatDateNormal(this.generalReceiptForm.controls['preceiptdate'].value);
    const ppartyid = $event?.ppartyid;

    this._accountservice.GetCashRestrictAmountpercontact1(
      'GENERAL RECEIPT', 'KGMS', this._commonService.getbranchname(), ppartyid, trans_date,
      this._commonService.getCompanyCode(), this._commonService.getschemaname(), this._commonService.getBranchCode()
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({ next: (res: any) => { this.availableAmount = (Number(this.cashRestrictAmount) || 0) - (Number(res) || 0); }, error: (err) => this._commonService.showErrorMessage(err) });

    if (ppartyid && ppartyid !== '') {
      this._selectedPartyStateName = $event.state_name || '';
      this.getPartyDetailsbyid(ppartyid);
      this.generalReceiptForm.controls['ppartyname'].setValue($event.ppartyname);
      this.generalReceiptForm.controls['pstatename'].setValue($event.state_name || '');
      const selectedParty = this.partylist?.find((x: any) => x.ppartyid == ppartyid);
      if (selectedParty) {
        this.generalReceiptForm.controls['ppartyreferenceid'].setValue(selectedParty.ppartyreferenceid);
        this.generalReceiptForm.controls['ppartyreftype'].setValue(selectedParty.ppartyreftype);
        this.generalReceiptForm.controls['ppartypannumber'].setValue(selectedParty.pan_no || '');
      }
    } else {
      this.setBalances('PARTY', 0);
      this.generalReceiptForm.controls['ppartyname'].setValue('');
      this._selectedPartyStateName = '';
    }
  }

  getPartyDetailsbyid(ppartyid: any): void {
    this._accountservice.getPartyDetailsbyid(
      ppartyid, this._commonService.getbranchname(), this._commonService.getBranchCode(),
      this._commonService.getCompanyCode(), this._commonService.getschemaname(), 'taxes'
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (json: any) => {
          if (json != null) {
            this.tdslist = json.lstTdsSectionDetails || [];
            const newdata = [...new Set(this.tdslist.map((item: any) => item.pTdsSection))];
            this.tdssectionlist = newdata.map((s: any) => ({ pTdsSection: s }));
            const partyStateName = (this._selectedPartyStateName || '').toLowerCase().trim();
            if (partyStateName && json.statelist?.length) {
              this.statelist = json.statelist.filter((state: any) => {
                const s = (state.pState || state.pStatename || '').toLowerCase().trim();
                return s === partyStateName || s.includes(partyStateName) || partyStateName.includes(s);
              });
              if (this.statelist.length === 1) {
                const matchedState = this.statelist[0];
                setTimeout(() => {
                  this.generalReceiptForm.get('preceiptslist.pStateId')?.setValue(matchedState.pStateId);
                  this.generalReceiptForm.get('preceiptslist.pState')?.setValue(matchedState.pState || matchedState.pStatename);
                  this.stateChange(matchedState);
                });
              }
            } else { this.statelist = []; }
            this.recalculateAll();
            this.setBalances('PARTY', json.accountbalance);
          }
        },
        error: (err) => this._commonService.showErrorMessage(err),
      });
  }

  ledgerNameChange($event: any): void {
    const pledgerid = $event?.pledgerid;
    this.subledgeraccountslist = [];
    this.generalReceiptForm.get('preceiptslist.psubledgerid')?.setValue(null);
    this.generalReceiptForm.get('preceiptslist.psubledgername')?.setValue('');
    this.ledgerBalance = `${this.currencySymbol} 0 Dr`;
    this.subledgerBalance = `${this.currencySymbol} 0 Dr`;
    if (pledgerid && pledgerid !== '') {
      const data = this.ledgeraccountslist?.find((l: any) => l.pledgerid === pledgerid);
      if (data) this.setBalances('LEDGER', data.accountbalance);
      const subLedgerControl = this.generalReceiptForm.get('preceiptslist.psubledgerid') as FormControl;
      subLedgerControl.clearValidators(); subLedgerControl.updateValueAndValidity();
      this.getSubLedgerData(pledgerid);
      this.generalReceiptForm.get('preceiptslist.pledgername')?.setValue($event.pledgername);
    } else { this.setBalances('LEDGER', 0); this.generalReceiptForm.get('preceiptslist.pledgername')?.setValue(''); }
  }

  subledgerChange($event: any): void {
    const psubledgerid = $event?.psubledgerid;
    this.subledgerBalance = `${this.currencySymbol} 0 Dr`;
    if (psubledgerid && psubledgerid !== '') {
      this.generalReceiptForm.get('preceiptslist.psubledgername')?.setValue($event.psubledgername);
      const data = this.subledgeraccountslist?.find((l: any) => l.psubledgerid == psubledgerid);
      if (data) this.setBalances('SUBLEDGER', data.accountbalance);
    } else { this.generalReceiptForm.get('preceiptslist.psubledgername')?.setValue(''); this.setBalances('SUBLEDGER', 0); }
  }

  getSubLedgerData(pledgerid: any): void {
    this._accountservice.GetSubLedgerData(
      pledgerid, this._commonService.getbranchname(), this._commonService.getCompanyCode(),
      this._commonService.getbranchname(), this._commonService.getBranchCode(), this._commonService.getschemaname()
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (json: any) => {
          if (json != null) {
            this.subledgeraccountslist = json;
            const subLedgerControl = this.generalReceiptForm.get('preceiptslist.psubledgerid') as FormControl;
            if (this.subledgeraccountslist.length > 0) { this.showsubledger = true; subLedgerControl.setValidators(Validators.required); }
            else {
              this.showsubledger = false; subLedgerControl.clearValidators();
              this.generalReceiptForm.get('preceiptslist.psubledgerid')?.setValue(pledgerid);
              this.generalReceiptForm.get('preceiptslist.psubledgername')?.setValue(this.generalReceiptForm.get('preceiptslist.pledgername')?.value);
            }
            subLedgerControl.updateValueAndValidity();
          }
        },
        error: (err) => this._commonService.showErrorMessage(err),
      });
  }

  istdsapplicableChange(): void {
    const data = this.generalReceiptForm.get('pistdsapplicable')?.value;
    if (data) { this.showtds = true; this.generalReceiptForm.controls['ptdscalculationtype'].setValue('EXCLUDE'); }
    else {
      this.showtds = false;
      this.generalReceiptForm.controls['ptdscalculationtype'].setValue('');
      this.generalReceiptForm.controls['pTdsSection'].setValue('');
      this.generalReceiptForm.controls['pTdsPercentage'].setValue('');
      this.generalReceiptForm.controls['ptdsamount'].setValue(0);
    }
    this.recalculateAll(); this.tdsvalidation(data);
  }

  tdsSectionChange(event: any): void {
    const pTdsSection = event?.pTdsSection;
    this.tdspercentagelist = [];
    this.generalReceiptForm.controls['pTdsPercentage'].setValue('');
    this.generalReceiptForm.controls['ptdsamount'].setValue(0);
    if (pTdsSection) this.gettdsPercentage(pTdsSection);
    this.getValidationByControl(this.generalReceiptForm, 'pTdsSection', true);
  }

  gettdsPercentage(ptdssection: any): void {
    this.generalReceiptForm.controls['ptdsamount'].setValue(0);
    this.tdspercentagelist = this.tdslist.filter((res: any) => res.pTdsSection == ptdssection);
    this.recalculateAll();
  }

  tdsPercentageChange(): void {
    this.recalculateAll(); this.getValidationByControl(this.generalReceiptForm, 'pTdsPercentage', true);
  }

  tdsvalidation(data: any): void {
    this.formValidationMessages = {};
    const tdsSectionCtrl = this.generalReceiptForm.controls['pTdsSection'];
    const tdsPercentCtrl = this.generalReceiptForm.controls['pTdsPercentage'];
    if (data) { tdsSectionCtrl.setValidators([Validators.required]); tdsPercentCtrl.setValidators([Validators.required, percentageValidator]); }
    else { tdsSectionCtrl.clearValidators(); tdsPercentCtrl.clearValidators(); }
    tdsSectionCtrl.updateValueAndValidity(); tdsPercentCtrl.updateValueAndValidity();
  }

  isgstapplicableChange(): void {
    const data = this.generalReceiptForm.get('preceiptslist.pisgstapplicable')?.value;
    if (!data) {
      this.showgst = false; this._resetGstDisplayFlags();
      this.generalReceiptForm.get('preceiptslist.pgstcalculationtype')?.setValue('INCLUDE');
      this.generalReceiptForm.get('preceiptslist.pgstpercentage')?.setValue('');
      this.generalReceiptForm.get('preceiptslist.pgsttype')?.setValue('');
      ['pgstamount', 'pigstamount', 'pcgstamount', 'psgstamount', 'putgstamount'].forEach(k => this.generalReceiptForm.get(`preceiptslist.${k}`)?.setValue(0));
      this.generalReceiptForm.get('preceiptslist.pamount')?.setValue(this.generalReceiptForm.get('preceiptslist.pactualpaidamount')?.value || 0);
      this.gstvalidation(false); this.gstPercentageSelected = false; this.recalculateAll(); return;
    }
    this.showgst = true; this.gstPercentageSelected = false;
    this.generalReceiptForm.get('preceiptslist.pgstcalculationtype')?.setValue('INCLUDE');
    if (this.tempGSTtype !== '') {
      this.generalReceiptForm.get('preceiptslist.pStateId')?.setValue(this.tempState);
      this.generalReceiptForm.get('preceiptslist.pgstno')?.setValue(this.tempgstno);
      const stateData = this.getStatedetailsbyId(this.tempState);
      if (stateData) this._applyGstTypeFlags(stateData.pgsttype);
    } else {
      const existingStateId = this.generalReceiptForm.get('preceiptslist.pStateId')?.value;
      if (existingStateId) {
        const existingState = (this.statelist || []).find((x: any) => x.pStateId == existingStateId);
        if (existingState) { this.generalReceiptForm.get('preceiptslist.pgsttype')?.setValue(existingState.pgsttype); this.generalReceiptForm.get('preceiptslist.pgstno')?.setValue(existingState.gstnumber); this.showgstno = !existingState.gstnumber; this._applyGstTypeFlags(existingState.pgsttype); }
      } else if (this.statelist?.length === 1) {
        const singleState = this.statelist[0];
        setTimeout(() => { this.generalReceiptForm.get('preceiptslist.pStateId')?.setValue(singleState.pStateId); this.stateChange(singleState); });
      }
    }
    this.recalculateAll(); this.gstvalidation(data);
  }

  gstChange($event: any): void {
    if (!$event) {
      this.generalReceiptForm.get('preceiptslist.pgstpercentage')?.setValue('');
      ['pigstpercentage', 'pcgstpercentage', 'psgstpercentage', 'putgstpercentage', 'pgstamount', 'pigstamount', 'pcgstamount', 'psgstamount', 'putgstamount'].forEach(k => this.generalReceiptForm.get(`preceiptslist.${k}`)?.setValue(0));
      this.recalculateAll(); return;
    }
    const gstpercentage = $event.pgstpercentage ?? $event;
    ['pigstpercentage', 'pcgstpercentage', 'psgstpercentage', 'putgstpercentage'].forEach(k => this.generalReceiptForm.get(`preceiptslist.${k}`)?.setValue(''));
    ['pgstamount', 'pigstamount', 'pcgstamount', 'psgstamount', 'putgstamount'].forEach(k => this.generalReceiptForm.get(`preceiptslist.${k}`)?.setValue(0));
    if (gstpercentage && gstpercentage !== '') this.getgstPercentage(gstpercentage);
    const currentGstType = this.generalReceiptForm.get('preceiptslist.pgsttype')?.value;
    if (!currentGstType) {
      const selectedStateId = this.generalReceiptForm.get('preceiptslist.pStateId')?.value;
      if (selectedStateId && this.statelist?.length) {
        const selectedState = this.statelist.find((x: any) => x.pStateId == selectedStateId);
        if (selectedState) { this.generalReceiptForm.get('preceiptslist.pgsttype')?.setValue(selectedState.pgsttype); this._applyGstTypeFlags(selectedState.pgsttype); }
      } else if (this.statelist?.length === 1) { const s = this.statelist[0]; this.generalReceiptForm.get('preceiptslist.pStateId')?.setValue(s.pStateId); this.stateChange(s); return; }
    }
    this.gstPercentageSelected = true; this.recalculateAll();
  }

  getgstPercentage(gstpercentage: any): void {
    const data = this.gstlist?.filter((tds: any) => tds.pgstpercentage == gstpercentage);
    if (data?.[0]) {
      this.generalReceiptForm.get('preceiptslist.pigstpercentage')?.setValue(data[0].pigstpercentage);
      this.generalReceiptForm.get('preceiptslist.pcgstpercentage')?.setValue(data[0].pcgstpercentage);
      this.generalReceiptForm.get('preceiptslist.psgstpercentage')?.setValue(data[0].psgstpercentage);
      this.generalReceiptForm.get('preceiptslist.putgstpercentage')?.setValue(data[0].putgstpercentage);
    }
    this.recalculateAll();
  }

  gstvalidation(data: any): void {
    this.formValidationMessages = {};
    const gstpctCtrl = this.generalReceiptForm.get('preceiptslist.pgstpercentage') as FormControl;
    const stateCtrl = this.generalReceiptForm.get('preceiptslist.pStateId') as FormControl;
    if (data) {
      if (this.statelist?.length !== 1) stateCtrl.setValidators([Validators.required]); else stateCtrl.clearValidators();
      gstpctCtrl.setValidators([Validators.required, percentageValidator]);
      this.generalReceiptForm.get('preceiptslist.pgstpercentage')?.setValue('');
    } else { stateCtrl.clearValidators(); gstpctCtrl.clearValidators(); this.generalReceiptForm.get('preceiptslist.pgstpercentage')?.setValue(''); }
    stateCtrl.updateValueAndValidity(); gstpctCtrl.updateValueAndValidity(); this.formValidationMessages = {};
  }

  gstnoChange(): void { this.getValidationByControl(this.generalReceiptForm, 'pgstno', true); }

  gstClear(): void {
    ['pigstpercentage', 'pcgstpercentage', 'psgstpercentage', 'putgstpercentage', 'pgstpercentage', 'pgstno']
      .forEach(k => this.generalReceiptForm.get(`preceiptslist.${k}`)?.setValue(''));
  }

  stateChange($event: any): void {
    if (!$event) {
      this.gstClear();
      this.generalReceiptForm.get('preceiptslist.pStateId')?.setValue(null);
      this.generalReceiptForm.get('preceiptslist.pState')?.setValue('');
      this.generalReceiptForm.get('preceiptslist.pgstno')?.setValue('');
      this.generalReceiptForm.get('preceiptslist.pgstpercentage')?.setValue(null);
      this.showgstamount = this.showigst = this.showcgst = this.showsgst = this.showutgst = this.showgstno = false; return;
    }
    const selectedStateId = $event.pStateId || $event.pstateid || $event.stateId;
    this.gstClear();
    this.showgstamount = this.showigst = this.showcgst = this.showsgst = this.showutgst = this.showgstno = false;
    if (selectedStateId) {
      const selectedState = this.statelist?.find((x: any) => x.pStateId == selectedStateId);
      if (!selectedState) return;
      this.generalReceiptForm.get('preceiptslist.pState')?.setValue(selectedState.pState);
      this.showgstno = !selectedState.gstnumber;
      this.generalReceiptForm.get('preceiptslist.pgsttype')?.setValue(selectedState.pgsttype);
      this.generalReceiptForm.get('preceiptslist.pgstno')?.setValue(selectedState.gstnumber);
      this._applyGstTypeFlags(selectedState.pgsttype); this.recalculateAll();
    }
  }

  getStatedetailsbyId(pstateid: any): any { return (this.statelist || []).find((tds: any) => tds.pStateId == pstateid); }
  getStateName(state: any): string { return state?.pState || state?.pStatename || state?.stateName || ''; }

  private _applyGstTypeFlags(gsttype: string): void {
    this.showgstamount = true;
    this.showigst = gsttype === 'IGST';
    this.showcgst = gsttype === 'CGST,SGST' || gsttype === 'CGST,UTGST';
    this.showsgst = gsttype === 'CGST,SGST';
    this.showutgst = gsttype === 'CGST,UTGST';
  }

  private _resetGstDisplayFlags(): void {
    this.showgstamount = false; this.showigst = false; this.showcgst = false;
    this.showsgst = false; this.showutgst = false; this.showgstno = false;
  }

  recalculateAll(): void {
    try {
      const receiptGroup = this.generalReceiptForm.get('preceiptslist') as FormGroup;
      const rawAmount = receiptGroup.get('pactualpaidamount')?.value;
      const amountReceived = Number(typeof rawAmount === 'string' ? rawAmount.replace(/,/g, '') : rawAmount) || 0;
      const isgstapplicable = receiptGroup.get('pisgstapplicable')?.value;
      const gsttype = receiptGroup.get('pgsttype')?.value;
      const gstCalcType = receiptGroup.get('pgstcalculationtype')?.value || 'INCLUDE';
      const igstpct = Number(receiptGroup.get('pigstpercentage')?.value) || 0;
      const cgstpct = Number(receiptGroup.get('pcgstpercentage')?.value) || 0;
      const sgstpct = Number(receiptGroup.get('psgstpercentage')?.value) || 0;
      const utgstpct = Number(receiptGroup.get('putgstpercentage')?.value) || 0;
      const isTdsApplicable = this.generalReceiptForm.get('pistdsapplicable')?.value;
      const tdsRate = this._getTdsPercentageValue();
      let gstRate = 0;
      if (isgstapplicable && gsttype) {
        if (gsttype === 'IGST') gstRate = igstpct;
        else if (gsttype === 'CGST,SGST') gstRate = cgstpct + sgstpct;
        else if (gsttype === 'CGST,UTGST') gstRate = cgstpct + utgstpct;
      }
      this.showgstamount = !!(isgstapplicable && gsttype);
      this.showigst = gsttype === 'IGST';
      this.showcgst = gsttype === 'CGST,SGST' || gsttype === 'CGST,UTGST';
      this.showsgst = gsttype === 'CGST,SGST';
      this.showutgst = gsttype === 'CGST,UTGST';
      let taxableAmount = amountReceived, igstamt = 0, cgstamt = 0, sgstamt = 0, utgstamt = 0, totalGstAmt = 0, tdsAmount = 0;
      if (amountReceived > 0) {
        if (isgstapplicable && gstRate > 0) {
          if (gstCalcType === 'INCLUDE') { taxableAmount = parseFloat(((amountReceived * 100) / (100 + gstRate)).toFixed(2)); totalGstAmt = this._roundToHalf(parseFloat((amountReceived - taxableAmount).toFixed(2))); }
          else { taxableAmount = amountReceived; totalGstAmt = this._roundToHalf(parseFloat(((taxableAmount * gstRate) / 100).toFixed(2))); }
          if (gsttype === 'IGST') igstamt = totalGstAmt;
          else if (gsttype === 'CGST,SGST') { cgstamt = this._roundToHalf(totalGstAmt / 2); sgstamt = this._roundToHalf(totalGstAmt / 2); }
          else if (gsttype === 'CGST,UTGST') { cgstamt = this._roundToHalf(totalGstAmt / 2); utgstamt = this._roundToHalf(totalGstAmt / 2); }
        }
        if (isTdsApplicable && tdsRate > 0) tdsAmount = this._roundToHalf(parseFloat((taxableAmount * tdsRate / 100).toFixed(2)));
      }
      const totalAmount = (isgstapplicable && gstRate > 0 && gstCalcType === 'INCLUDE')
        ? parseFloat((amountReceived - tdsAmount).toFixed(2))
        : parseFloat((taxableAmount + totalGstAmt - tdsAmount).toFixed(2));
      receiptGroup.patchValue({ pamount: taxableAmount || 0, pgstamount: totalGstAmt, pigstamount: igstamt, pcgstamount: cgstamt, psgstamount: sgstamt, putgstamount: utgstamt, ptotalamount: totalAmount }, { emitEvent: false });
      this.generalReceiptForm.get('ptdsamount')?.setValue(tdsAmount, { emitEvent: false });
    } catch (e) { this._commonService.showErrorMessage(e); }
  }

  private _getTdsPercentageValue(): number {
    const raw = this.generalReceiptForm.get('pTdsPercentage')?.value;
    if (raw === null || raw === undefined || raw === '') return 0;
    if (typeof raw === 'object' && raw !== null && 'pTdsPercentage' in raw) return Number(raw.pTdsPercentage) || 0;
    return Number(raw) || 0;
  }

  private _roundToHalf(value: number): number { return Math.round(value * 2) / 2; }

  addPaymentDetails(): void {
    const ledgerControl = this.generalReceiptForm.get('preceiptslist.pledgerid');
    const actualAmountControl = this.generalReceiptForm.get('preceiptslist.pactualpaidamount');
    ledgerControl?.setValidators(Validators.required);
    actualAmountControl?.setValidators([Validators.required, positiveAmountValidator, Validators.pattern(/^[0-9,]+(\.[0-9]{1,2})?$/)]);
    ledgerControl?.updateValueAndValidity(); actualAmountControl?.updateValueAndValidity();
    if (!this.addvalidations()) return;
    const accountHeadId = ledgerControl?.value;
    const subCategoryId = this.generalReceiptForm.get('preceiptslist.psubledgerid')?.value;
    const paidAmount = parseFloat((this._commonService.removeCommasInAmount(actualAmountControl?.value) || 0).toString());
    this._accountservice.GetdebitchitCheckbalance(
      this._commonService.getbranchname(), accountHeadId, 36, subCategoryId,
      this._commonService.getschemaname(), this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (result: any) => {
          const balanceCheckStatus = result?.balancecheckstatus === true || result?.balancecheckstatus === 'true';
          if (balanceCheckStatus || paidAmount >= 0) {
            const control = this.generalReceiptForm.get('preceiptslist') as FormGroup;
            control.patchValue({ pCreatedby: this._commonService.pCreatedby, pModifiedby: this._commonService.pCreatedby });
            const formValue = control.value;
            const amount = parseFloat((Number(this._commonService.removeCommasInAmount(formValue.pamount?.toString() || '0'))).toFixed(2));
            const gst = parseFloat((Number(this._commonService.removeCommasInAmount(formValue.pgstamount?.toString() || '0'))).toFixed(2));
            const total = parseFloat((amount + gst).toFixed(2));
            const cleanedData = { ...formValue, pamount: amount, pgstamount: gst, ptotalamount: total, pgstpercentage: Number(formValue.pgstpercentage) || 0, pisgstapplicable: formValue.pisgstapplicable === true, pistdsapplicable: this.generalReceiptForm.get('pistdsapplicable')?.value, pTdsSection: this.generalReceiptForm.get('pTdsSection')?.value || '', pTdsPercentage: this._getTdsPercentageValue(), ptdsamountindividual: parseFloat((Number(this.generalReceiptForm.get('ptdsamount')?.value) || 0).toFixed(2)) };
            this.temporaryamount = parseFloat((this.temporaryamount + cleanedData.ptotalamount).toFixed(2));
            this.paymentsList.update(list => [...list, cleanedData]);
            this.gridShowHide.set(true);
            this.recalculateAll(); this.getpartyJournalEntryData(); this.clearPaymentDetails1();
            this.formValidationMessages = {};
          } else { this._commonService.showWarningMessage('Insufficient balance'); }
        },
        error: (err:any) => this._commonService.showErrorMessage(err),
      });
  }

  deleteRow(index: number): void {
    if (index === undefined || index === null) return;
    this.paymentsList.update(list => { const updated = [...list]; updated.splice(index, 1); return updated; });
    if (this.paymentsList().length === 0) this.gridShowHide.set(false);
    this.getpartyJournalEntryData();
  }

  getpartyJournalEntryData(): void {
    try {
      const list = this.paymentsList();
      if (!list || list.length === 0) { this.partyJournalEntryList.set([]); return; }
      const result: any[] = [];
      const uniqueLedgers = [...new Set(list.map((item: any) => item.pledgername).filter(Boolean))];
      uniqueLedgers.forEach(ledger => {
        const journalentryamount = list.filter((c: any) => c.pledgername === ledger).reduce((sum: number, c: any) => sum + Number(this._commonService.removeCommasInAmount(c.pamount || 0)), 0);
        if (journalentryamount > 0) result.push({ type: 'General Receipt', accountname: ledger, debitamount: parseFloat(journalentryamount.toFixed(2)), creditamount: '' });
      });
      const taxAccounts = [{ f: 'pigstamount', n: 'C-IGST' }, { f: 'pcgstamount', n: 'C-CGST' }, { f: 'psgstamount', n: 'C-SGST' }, { f: 'putgstamount', n: 'C-UTGST' }];
      taxAccounts.forEach(({ f, n }) => {
        const amt = list.reduce((sum: number, c: any) => sum + Number(this._commonService.removeCommasInAmount(c[f] || 0)), 0);
        if (amt > 0) result.push({ type: 'General Receipt', accountname: n, debitamount: parseFloat(amt.toFixed(2)), creditamount: '' });
      });
      const totalamt = list.reduce((sum: number, c: any) => sum + Number(this._commonService.removeCommasInAmount(c.ptotalamount || 0)), 0);
      if (totalamt > 0) {
        this.generalReceiptForm.controls['ptotalreceivedamount'].setValue(parseFloat(totalamt.toFixed(2)));
        const accountname = this.generalReceiptForm.controls['pmodofreceipt']?.value === 'CASH' ? 'CASH ON HAND' : 'BANK';
        result.push({ type: 'General Receipt', accountname, debitamount: '', creditamount: parseFloat(totalamt.toFixed(2)) });
      }
      this.partyJournalEntryList.set(result);
    } catch (e) { this._commonService.showErrorMessage(e); }
  }

  addvalidations(): boolean {
    this.formValidationMessages = {};
    let isValid = true;
    isValid = this.getValidationByControl(this.generalReceiptForm, 'ppartyid', isValid);
    if (isValid) {
      const formControl = this.generalReceiptForm.controls['preceiptslist'] as FormGroup;
      const ledgerid = formControl.controls['pledgerid'].value;
      const pactualpaidamount = formControl.controls['pactualpaidamount'].value;
      if (!ledgerid) { this.formValidationMessages['pledgerid'] = 'Ledger Is Required'; formControl.controls['pledgerid'].markAsTouched(); isValid = false; }
      if (!pactualpaidamount || pactualpaidamount === '' || Number(pactualpaidamount) <= 0) { this.formValidationMessages['pactualpaidamount'] = 'Amount Received Is Required And Must Be Greater Than 0'; formControl.controls['pactualpaidamount'].markAsTouched(); isValid = false; }
      if (isValid) {
        const subledgerid = formControl.controls['psubledgerid'].value;
        const griddata = this.paymentsList();
        let count = 0, bank_count = 0;
        for (const item of griddata) {
          if (item.pledgerid == ledgerid && item.psubledgerid == subledgerid) { count = 1; break; }
          for (const bank of this.banklist) { if (bank.paccountid == item.psubledgerid || bank.paccountid == subledgerid) { count = 1; bank_count = 1; break; } }
        }
        if (count === 1) { this._commonService.showWarningMessage(bank_count === 1 ? 'Bank Accounts only one record in the grid' : 'Ledger & Sub Ledger is already exists'); isValid = false; }
      }
    }
    return isValid;
  }

  clearPaymentDetails(): void {
    const control = this.generalReceiptForm.get('preceiptslist') as FormGroup;
    control.reset();
    control.patchValue({ pisgstapplicable: false, pStatusname: this._commonService.pStatusname, pgstcalculationtype: 'INCLUDE' });
    this.showgst = false; this._resetGstDisplayFlags();
    this.showtds = false;
    this.generalReceiptForm.controls['pistdsapplicable'].setValue(false);
    this.generalReceiptForm.controls['pTdsSection'].setValue('');
    this.generalReceiptForm.controls['pTdsPercentage'].setValue(0);
    this.generalReceiptForm.controls['ptdsamount'].setValue(0);
    this.tdsvalidation(false);
    this.showsubledger = true; this.showgstno = false; this.subledgeraccountslist = [];
    this.ledgerBalance = `${this.currencySymbol} 0 Dr`;
    this.subledgerBalance = `${this.currencySymbol} 0 Dr`;
    this.formValidationMessages = {}; this.gstPercentageSelected = false;
  }

  clearPaymentDetails1(): void {
    const control = this.generalReceiptForm.get('preceiptslist') as FormGroup;
    const currentLedger = control.get('pledgerid')?.value;
    const currentLedgerName = control.get('pledgername')?.value;
    control.reset();
    if (this.showsubledger) control.patchValue({ pledgerid: currentLedger, pledgername: currentLedgerName });
    control.patchValue({ pisgstapplicable: false, pStatusname: this._commonService.pStatusname, pgstcalculationtype: 'INCLUDE' });
    this.generalReceiptForm.patchValue({ pistdsapplicable: false, pTdsSection: null, pTdsPercentage: null, ptdsamount: 0 });
    this.showtds = false; this.showgst = false; this._resetGstDisplayFlags(); this.showgstno = false;
    this.ledgerBalance = `${this.currencySymbol} 0 Dr`;
    this.subledgerBalance = `${this.currencySymbol} 0 Dr`;
    this.formValidationMessages = {}; this.gstPercentageSelected = false;
  }

  saveGeneralReceipt(): void {
    this.submitted = true;
    this.showCashWarning.set(false); this.cashWarningMessage.set('');
    const narrationControl = this.generalReceiptForm.get('pnarration');
    if (!narrationControl?.value || narrationControl.value.trim() === '') { narrationControl?.markAsTouched(); this._commonService.showWarningMessage('Please enter narration'); return; }
    const modeOfReceipt = this.generalReceiptForm.get('pmodofreceipt')?.value?.toString().toUpperCase();
    if (modeOfReceipt === 'CASH') {
      const totalReceiptAmount = this.paymentsList().reduce((sum: number, item: any) => sum + (parseFloat(item.ptotalamount?.toString() || '0') || 0), 0);
      if (totalReceiptAmount >= this.CASH_TRANSACTION_LIMIT) {
        this.cashWarningMessage.set(`Cash transactions limit below ₹2,00,000.00. Available Amount ₹2,00,000.00 only for this Party`);
        this.showCashWarning.set(true);
        setTimeout(() => { this.showCashWarning.set(false); this.cashWarningMessage.set(''); }, 5000);
        window.scrollTo({ top: 0, behavior: 'smooth' }); return;
      }
    }
    const chequeDate = this._datepipe.transform(this.generalReceiptForm.controls['pchequedate'].value, 'dd-MM-yyyy');
    this.disableSaveButton.set(true); this.saveButtonLabel.set('Processing');
    const accountIds = this.paymentsList().map((x: any) => x.psubledgerid).filter(Boolean).join(',');
    const trans_date = this._commonService.getFormatDateNormal(this.generalReceiptForm.controls['preceiptdate'].value);
    this._accountservice.GetCashAmountAccountWise(
      'GENERAL RECEIPT', this._commonService.getbranchname(), accountIds, trans_date,
      this._commonService.getschemaname(), this._commonService.getCompanyCode(), this._commonService.getBranchCode()
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (result: any[]) => {
          let count = 0;
          if (this.generalReceiptForm.controls['pmodofreceipt'].value === 'C') {
            for (const payment of this.paymentsList()) {
              const amount = parseFloat((this._commonService.removeCommasInAmount(payment.ptotalamount || 0)).toString());
              for (const res of result) {
                if (payment.psubledgerid == res.psubledgerid) {
                  if (parseFloat((this.cashRestrictAmount || 0).toString()) <= parseFloat((Number(res.accountbalance || 0) + amount).toFixed(2))) { count = 1; break; }
                }
              }
              if (count === 1) break;
            }
          }
          if (count !== 0) { this._commonService.showWarningMessage(`Subledger per day Cash transactions limit below ${this._commonService.currencysymbol}${this._commonService.currencyformat(this.cashRestrictAmount)}`); this.disableSaveButton.set(false); this.saveButtonLabel.set('Save'); return; }
          if (!confirm('Do You Want to Save ?')) { this.disableSaveButton.set(false); this.saveButtonLabel.set('Save'); return; }
          const totalamount = parseFloat((this._commonService.removeCommasInAmount(this.paymentColumnTotals().ptotalamount || 0)).toString());
          const payload: any = {
            preceiptid: '', preceiptno: 'string', pRecordid: 0, ptypeofoperation: 'CREATE', formname: 'General Receipt',
            preceiptdate: trans_date, pmodofreceipt: this.generalReceiptForm.value.pmodofreceipt || '',
            ptranstype: this.generalReceiptForm.value.ptranstype || '', ptypeofpayment: this.generalReceiptForm.value.ptypeofpayment || '',
            pbankid: this.generalReceiptForm.value.pbankid || 0, pBankName: this.generalReceiptForm.value.pbankname || '',
            pbranchname: this.generalReceiptForm.value.pbranchname || '', pAccountnumber: this.generalReceiptForm.value.pAccountnumber || '',
            pChequenumber: this.generalReceiptForm.getRawValue().pChequenumber || '', pchequedate: chequeDate,
            pchequedepositdate: '', pchequecleardate: '', pCardNumber: this.generalReceiptForm.value.pCardNumber || '',
            pdepositbankid: this.generalReceiptForm.getRawValue().pdepositbankid ?? 0, pdepositbankname: this.generalReceiptForm.value.pdepositbankname || '',
            pUpiname: this.generalReceiptForm.value.pUpiname || '', pUpiid: this.generalReceiptForm.value.pUpiid || '',
            ppartyid: this.generalReceiptForm.value.ppartyid || 0, ppartyname: this.generalReceiptForm.value.ppartyname || '',
            ppartypannumber: this.generalReceiptForm.value.ppartypannumber || '', ppartyreftype: this.generalReceiptForm.value.ppartyreftype || '',
            ppartyreferenceid: this.generalReceiptForm.value.ppartyreferenceid || '', ptotalreceivedamount: totalamount || 0,
            pistdsapplicable: this.paymentsList().some((x: any) => x.pistdsapplicable === true) || false,
            pTdsSection: this.paymentsList()[0]?.pTdsSection || 0, pTdsSectionId: this.paymentsList()[0]?.pTdsSection || 0,
            pTdsPercentage: this.paymentsList()[0]?.pTdsPercentage || 0, ptdsamount: this.paymentsList()[0]?.ptdsamountindividual || 0,
            ptdscalculationtype: '', pnarration: this.generalReceiptForm.value.pnarration || '',
            pFilename: this.generalReceiptForm.value.pFilename || '', pFilepath: this.generalReceiptForm.value.pFilepath || '',
            pFileformat: this.generalReceiptForm.value.pFileformat || '', pDocStorePath: '',
            global_schema: this._commonService.getschemaname(), branch_schema: this._commonService.getbranchname(),
            companycode: this._commonService.getCompanyCode(), branchcode: this._commonService.getBranchCode(),
            branchid: this._commonService.getbrachid() || 1, schemaname: this._commonService.getschemaname(),
            pCreatedby: this._commonService.getCreatedBy() || 0, pModifiedby: 0, pStatusid: '', pStatusname: '',
            pEffectfromdate: '', pEffecttodate: '', pipaddress: '', pdepositeddate: '', pCleardate: '',
            preceiptrecordid: 0, groupcode: '', pchequestatus: this.generalReceiptForm.value.pchequestatus || '',
            preferencetext: '', chitpaymentid: 0, adjustmentid: 0, challanaNo: '',
            preceiptslist: this.paymentsList().map((x: any) => ({
              pledgerid: x.pledgerid || 0, pledgername: x.pledgername || '', psubledgerid: x.psubledgerid || 0, psubledgername: x.psubledgername || '',
              pactualpaidamount: parseFloat((Number(x.pactualpaidamount) || 0).toFixed(2)),
              pamount: parseFloat((Number(this._commonService.removeCommasInAmount(x.pamount?.toString() || '0'))).toFixed(2)),
              pisgstapplicable: x.pisgstapplicable || false, pgstcalculationtype: x.pgstcalculationtype || 'INCLUDE',
              pgsttype: x.pgsttype || '', pgstpercentage: x.pgstpercentage || 0,
              pgstamount: parseFloat((Number(x.pgstamount) || 0).toFixed(2)),
              pigstpercentage: x.pigstpercentage || 0, pigstamount: parseFloat((Number(x.pigstamount) || 0).toFixed(2)),
              pcgstpercentage: x.pcgstpercentage || 0, pcgstamount: parseFloat((Number(x.pcgstamount) || 0).toFixed(2)),
              psgstpercentage: x.psgstpercentage || 0, psgstamount: parseFloat((Number(x.psgstamount) || 0).toFixed(2)),
              putgstpercentage: x.putgstpercentage || 0, putgstamount: parseFloat((Number(x.putgstamount) || 0).toFixed(2)),
              pState: x.pState || '', pStateId: x.pStateId || 0, pgstno: x.pgstno || '',
              pistdsapplicable: x.pistdsapplicable || false, pTdsSection: x.pTdsSection || '', pTdsPercentage: Number(x.pTdsPercentage) || 0,
              ptdsamountindividual: parseFloat(((Math.round(Number(x.pamount)) * (Number(x.pTdsPercentage) || 0)) / 100).toFixed(2)),
              ptotalamount: parseFloat((Number(x.ptotalamount) || 0).toFixed(2)),
              id: '', text: '', ptranstype: '', accountbalance: '', pAccounttype: '',
            })),
          };
          this._accountservice.saveGeneralReceipt(payload)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: (res: any) => {
                if (res?.success) { this._commonService.showInfoMessage('Saved successfully'); this.clearGeneralReceipt(); const receipt = btoa(`${res.receipt_number},General Receipt`); this._router.navigate(['/GeneralReceiptReport', receipt]); }
                this.disableSaveButton.set(false); this.saveButtonLabel.set('Save');
              },
              error: (err) => { this._commonService.showErrorMessage(err); this.disableSaveButton.set(false); this.saveButtonLabel.set('Save'); },
            });
        },
        error: (err) => { this._commonService.showErrorMessage(err); this.disableSaveButton.set(false); this.saveButtonLabel.set('Save'); },
      });
  }

  clearGeneralReceipt(): void {
    this.generalReceiptForm.controls['pmodofreceipt'].setValue('CASH');
    this.paymenttype('Cash');
    this.generalReceiptForm.controls['ppartyid'].setValue(null);
    this.generalReceiptForm.controls['ppartyname'].setValue('');
    this.generalReceiptForm.controls['pistdsapplicable'].setValue(false);
    this.istdsapplicableChange();
    this.generalReceiptForm.get('preceiptslist.pisgstapplicable')?.setValue(false);
    this.isgstapplicableChange();
    this.paymentsList.set([]); this.partyJournalEntryList.set([]); this.gridShowHide.set(false);
    this.tempState = ''; this.tempgstno = ''; this.tempGSTtype = ''; this.temporaryamount = 0;
    this.gstPercentageSelected = false;
    this.partyBalance = `${this.currencySymbol} 0 Dr`;
    this.tempModeofReceipt = false; this._selectedPartyStateName = '';
    this.statelist = []; this.tdssectionlist = []; this.tdspercentagelist = [];
    this.showCashWarning.set(false); this.cashWarningMessage.set('');
    this.clearPaymentDetails();
    this.generalReceiptForm.controls['pnarration'].setValue('');
    this.generalReceiptForm.controls['preceiptdate'].setValue(new Date());
    this.generalReceiptForm.controls['pFilename'].setValue('');
    this.generalReceiptForm.controls['pFileformat'].setValue('');
    this.generalReceiptForm.controls['pFilepath'].setValue('');
    this.formValidationMessages = {}; this.submitted = false;
    this.getpartyJournalEntryData();
    this.imageResponse = { name: '', fileType: 'imageResponse', contentType: '', size: 0 };
  }

  dismissCashWarning(): void { this.showCashWarning.set(false); this.cashWarningMessage.set(''); }

  getLoadData(): void {
    this._accountservice.GetReceiptsandPaymentsLoadingData2(
      'GENERAL RECEIPT', this._commonService.getbranchname(), this._commonService.getschemaname(),
      this._commonService.getCompanyCode(), this._commonService.getBranchCode(), 'taxes'
    ).pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (json: any) => {
          if (json != null) {
            this.modeoftransactionslist = json.modeofTransactionslist;
            this.typeofpaymentlist = this.gettypeofpaymentdata();
            this.ledgeraccountslist = json.accountslist;
            this.partylist = json.partylist;
            this.gstlist = json.gstlist;
            this.debitcardlist = json.bankdebitcardslist;
            this.setBalances('CASH', json.cashbalance);
            this.setBalances('BANK', json.bankbalance);
            this.cashRestrictAmount = json.cashRestrictAmount;
          }
        },
        error: (err) => this._commonService.showErrorMessage(err),
      });
  }

  gettypeofpaymentdata(): any {
    return (this.modeoftransactionslist || []).filter((payment: any) => payment.ptranstype != payment.ptypeofpayment);
  }

  GetGlobalBanks(): Observable<any[]> {
    const params = new HttpParams().set('GlobalSchema', 'global');
    return this._commonService.getAPI('/Accounts/GetGlobalBanks', params, 'YES');
  }

  numberOnly(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) { event.preventDefault(); return false; }
    return true;
  }

  allowDigitsOnly(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || [8, 9, 37, 39, 46].includes(charCode)) return true;
    event.preventDefault(); return false;
  }

  allowAlphabetsOnly(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || [32, 8, 9, 37, 39].includes(charCode)) return true;
    event.preventDefault(); return false;
  }

  blockInvalidAmountKeys(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'F5'];
    if (allowedKeys.includes(event.key)) return;
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return;
    if (/^[0-9]$/.test(event.key)) return;
    event.preventDefault();
  }

  focusNext(controlName: string): void {
    setTimeout(() => { const el = document.querySelector(`[formControlName="${controlName}"]`) as HTMLElement; el?.focus(); }, 100);
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let raw = input.value.replace(/,/g, '').replace(/\D/g, '');
    const maxAmount = 9999999999999;
    if (raw === '') {
      input.value = '';
      const control = this.generalReceiptForm.get('preceiptslist.pactualpaidamount');
      if (control) { control.setValue('', { emitEvent: true }); control.markAsTouched(); }
      this.recalculateAll(); return;
    }
    let numVal = Number(raw);
    if (numVal > maxAmount) { numVal = maxAmount; raw = maxAmount.toString(); }
    input.value = numVal.toLocaleString('en-IN');
    try { input.setSelectionRange(input.value.length, input.value.length); } catch { }
    const control = this.generalReceiptForm.get('preceiptslist.pactualpaidamount');
    if (control) { control.setValue(raw, { emitEvent: true }); control.markAsTouched(); }
    this.recalculateAll();
  }

  getFormattedAmountDisplay(): string {
    const raw = this.generalReceiptForm.get('preceiptslist.pactualpaidamount')?.value;
    if (!raw || raw === '') return '';
    const num = Number(raw.toString().replace(/,/g, ''));
    if (isNaN(num)) return raw;
    return num.toLocaleString('en-IN');
  }

  pamountChange(event: Event): void {
    const input = event?.target as HTMLInputElement;
    if (input) {
      const rawVal = this.generalReceiptForm.get('preceiptslist.pactualpaidamount')?.value;
      if (rawVal && rawVal !== '') { const num = Number(rawVal.toString().replace(/,/g, '')); if (!isNaN(num) && num > 0) input.value = num.toLocaleString('en-IN'); }
    }
    this.recalculateAll();
  }

  branchNameChange(event: Event): void {
    let value = (event.target as HTMLInputElement).value;
    value = value.replace(/[^a-zA-Z ]/g, '');
    if (value.length > 40) value = value.substring(0, 40);
    value = value.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase());
    this.generalReceiptForm.get('pbranchname')?.setValue(value, { emitEvent: false });
    this.generalReceiptForm.get('pbranchname')?.markAsTouched();
  }

  pAccountnumberChange(): void {
    const control = this.generalReceiptForm.get('pAccountnumber');
    if (control?.value) { let value = control.value.toString().replace(/\D/g, ''); if (value.length > 40) value = value.substring(0, 40); control.setValue(value, { emitEvent: false }); }
    control?.markAsTouched(); this.getValidationByControl(this.generalReceiptForm, 'pAccountnumber', true);
  }

  chequeNoChange(): void {
    const control = this.generalReceiptForm.get('pChequenumber');
    if (control?.value) { let value = control.value.toString().replace(/\D/g, ''); if (value.length > 40) value = value.substring(0, 40); control.setValue(value, { emitEvent: false }); }
    control?.markAsTouched(); this.getValidationByControl(this.generalReceiptForm, 'pChequenumber', true);
  }

  chequeDateChange(): void { this.generalReceiptForm.get('pchequedate')?.markAsTouched(); this.getValidationByControl(this.generalReceiptForm, 'pchequedate', true); }

  cardNoChange(): void {
    const control = this.generalReceiptForm.get('pCardNumber');
    if (control?.value) { let value = control.value.toString().replace(/\D/g, ''); if (value.length > 16) value = value.substring(0, 16); control.setValue(value, { emitEvent: false }); }
    control?.markAsTouched(); this.getValidationByControl(this.generalReceiptForm, 'pCardNumber', true);
  }

  bankNameChange(): void {
    const control = this.generalReceiptForm.get('pbankname');
    if (control?.value) { let value = control.value.toString().replace(/[^a-zA-Z\s]/g, ''); if (value.length > 40) value = value.substring(0, 40); control.setValue(value, { emitEvent: false }); }
    control?.markAsTouched(); this.getValidationByControl(this.generalReceiptForm, 'pbankname', true);
  }

  typeofPaymentChange(args: any): void {
    this.getValidationByControl(this.generalReceiptForm, 'ptypeofpayment', true);
    const type = (typeof args === 'object' && args !== null && args.ptypeofpayment) ? args.ptypeofpayment : (typeof args === 'string' ? args : '');
    if (this.transtype !== '') {
      this.generalReceiptForm.controls['pdepositbankid'].setValue(null);
      this.generalReceiptForm.controls['pdepositbankname'].setValue('');
      this.formValidationMessages['pdepositbankid'] = '';
      this.showupi = false; this.upinameslist = [];
      this.generalReceiptForm.get('pUpiname')?.setValue(''); this.generalReceiptForm.get('pUpiid')?.setValue('');
      const pUpinameControl = this.generalReceiptForm.controls['pUpiname'];
      pUpinameControl.clearValidators(); pUpinameControl.updateValueAndValidity();
      if (this.transtype.toUpperCase() === 'ONLINE') this.toggleReferenceNo(type);
      if (this.transtype.toUpperCase() === 'ONLINE' && type.toUpperCase() === 'UPI') {
        this.showupi = true;
        this._accountservice.GetBankUPIDetails(this._commonService.getschemaname(), this._commonService.getBranchCode(), this._commonService.getCompanyCode())
          .pipe(takeUntilDestroyed(this._destroyRef)).subscribe({ next: (json: any) => { if (json != null) this.upinameslist = json; }, error: (err) => this._commonService.showErrorMessage(err) });
        pUpinameControl.setValidators(Validators.required); pUpinameControl.updateValueAndValidity();
      }
      this.validation(this.transtype);
    }
    this.checkDepositBankEnable();
  }

  uploadAndProgress(event: Event): void {
    const input = event.target as HTMLInputElement;
    const extention = input.value.substring(input.value.lastIndexOf('.') + 1);
    if (!this.validateFile(input.value)) { this._commonService.showWarningMessage('Upload jpg, png or pdf files'); }
    else {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => { this.imageResponse = { name: file.name, fileType: 'imageResponse', contentType: file.type, size: file.size }; };
        const formData = new FormData();
        formData.append(file.name, file);
        formData.append('NewFileName', `General Receipt.${file.name.split('.').pop()}`);
        this._commonService.fileUploadS3('Account', formData).pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe((data: any) => { this.imageResponse.name = data[0]; this.generalReceiptForm.controls['pFilename'].setValue(data[0]); });
      }
    }
  }

  validateFile(fileName: string | null | undefined): boolean {
    try { if (!fileName) return true; const ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(); return ext === 'jpg' || ext === 'png' || ext === 'pdf'; }
    catch { return false; }
  }

  validation(type: string): void {
    this.formValidationMessages = {};
    const chequeCtrl = this.generalReceiptForm.controls['pChequenumber'];
    const chequeDateCtrl = this.generalReceiptForm.controls['pchequedate'];
    const typeofPaymentCtrl = this.generalReceiptForm.controls['ptypeofpayment'];
    const bankCtrl = this.generalReceiptForm.controls['pbankid'];
    const cardNumberCtrl = this.generalReceiptForm.controls['pCardNumber'];
    const depositBankCtrl = this.generalReceiptForm.controls['pdepositbankid'];
    const accountCtrl = this.generalReceiptForm.controls['pAccountnumber'];
    const branchCtrl = this.generalReceiptForm.controls['pbranchname'];
    depositBankCtrl.clearValidators();
    chequeCtrl.setValidators([Validators.required, alphanumericValidator]);
    typeofPaymentCtrl.setValidators([Validators.required]);
    if (type === 'Online' || type === 'Cheque') { chequeDateCtrl.setValidators([Validators.required]); bankCtrl.setValidators([Validators.required]); cardNumberCtrl.clearValidators(); }
    else { chequeDateCtrl.clearValidators(); bankCtrl.clearValidators(); cardNumberCtrl.setValidators([Validators.required, cardNumberValidator]); }
    if (type === 'Cheque') { accountCtrl.setValidators([Validators.required, digitsOnlyValidator, Validators.minLength(9), Validators.maxLength(20)]); branchCtrl.setValidators([Validators.required, Validators.pattern(/^[A-Za-z ]+$/), Validators.maxLength(30)]); }
    else { accountCtrl.clearValidators(); branchCtrl.clearValidators(); }
    const refValue = chequeCtrl.value;
    if (refValue && refValue.toString().trim() !== '') depositBankCtrl.setValidators([Validators.required]); else depositBankCtrl.clearValidators();
    [accountCtrl, chequeDateCtrl, chequeCtrl, typeofPaymentCtrl, bankCtrl, cardNumberCtrl, depositBankCtrl, branchCtrl].forEach(c => c.updateValueAndValidity());
  }

  checkValidations(group: FormGroup, isValid: boolean): boolean {
    try { Object.keys(group.controls).forEach((key: string) => { group.get(key)?.markAsTouched(); isValid = this.getValidationByControl(group, key, isValid); }); }
    catch (e) { return false; }
    return isValid;
  }

  getValidationByControl(formGroup: FormGroup, key: string, isValid: boolean): boolean {
    try {
      const formcontrol = formGroup.get(key);
      if (formcontrol) {
        if (formcontrol instanceof FormGroup) { if (key !== 'preceiptslist') this.checkValidations(formcontrol, isValid); }
        else if (formcontrol.validator) {
          this.formValidationMessages[key] = '';
          if ((formcontrol.touched || formcontrol.dirty) && (formcontrol.errors || formcontrol.invalid)) {
            for (const errorkey in formcontrol.errors) {
              if (errorkey) {
                let lablename: string;
                try { lablename = (document.getElementById(key) as HTMLInputElement).title; } catch { lablename = key; }
                const errormessage = this._commonService.getValidationMessage(formcontrol, errorkey, lablename, key, '');
                this.formValidationMessages[key] += errormessage + ' ';
                isValid = false;
              }
            }
          }
        }
      }
    } catch (e) { return false; }
    return isValid;
  }

  blurEventAllControls(formGroup: FormGroup): void {
    try { Object.keys(formGroup.controls).forEach((key: string) => this._setBlurEvent(formGroup, key)); }
    catch (error) { console.error(error); }
  }

  private _setBlurEvent(formGroup: FormGroup, key: string): void {
    try {
      const control = formGroup.get(key);
      if (!control) return;
      if (control instanceof FormGroup) this.blurEventAllControls(control);
      else if (control.validator) {
        control.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
          if (control.touched || control.dirty) this.getValidationByControl(formGroup, key, true);
        });
      }
    } catch (error) { console.error(error); }
  }

  trackByFn(index: number, item: any): any { return item?.pBankId || index; }
  get pgstno() { return this.generalReceiptForm.get('pgstno'); }
  showErrorMessage(errorMsg: string): void { this._commonService.showErrorMessage(errorMsg); }
  upiNameChange(_$event: any): void { }
  upiIdChange(): void { }
}
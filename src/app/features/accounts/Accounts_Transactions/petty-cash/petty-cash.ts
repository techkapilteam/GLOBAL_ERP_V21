import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  BsDatepickerConfig,
  BsDatepickerModule,
} from 'ngx-bootstrap/datepicker';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { NgSelectModule } from '@ng-select/ng-select';

import { ValidationMessageComponent } from '../../../common/validation-message/validation-message.component';
import { PaginatorModule } from 'primeng/paginator';
import { CommonService } from '../../../../core/services/Common/common.service';
import { AccountsTransactions } from '../../../../core/services/accounts/accounts-transactions';

@Component({
  selector: 'app-petty-cash',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    BsDatepickerModule,
    ButtonModule,
    InputTextModule,
    NgSelectModule,
    ValidationMessageComponent,
    RouterModule,
  ],
  templateUrl: './petty-cash.html',
  styleUrl: './petty-cash.css',
  providers: [DatePipe],
})
export class PettyCash implements OnInit {
  showModeofPayment = false;
  showTypeofPayment = false;
  showtranstype = false;
  showbankcard = true;
  showbranch = true;
  showfinancial = true;
  showupi = false;
  showchequno = true;
  showgst = true;
  showtds = true;
  showgstamount = false;
  showigst = false;
  showcgst = false;
  showsgst = false;
  showutgst = false;
  showgstno = false;
  showsubledger = true;

  parties: any[] = [];
  ledgers: any[] = [];
  subLedgers: any[] = [];
  selectedLedger: number | string | null = null;
  selectedSubLedger: number | string | null = null;
  selectedParty: number | string | null = null;

  currencyCode = '₹';
  amountPaid = 0;
  gstEnabled = false;
  tdsEnabled = false;
  displayCardName = 'Debit Card';
  displaychequeno = 'Cheque No';
  currencySymbol = '';

  banklist: any[] = [];
  modeoftransactionslist: any[] = [];
  typeofpaymentlist: any[] = [];
  ledgeraccountslist: any[] = [];
  subledgeraccountslist: any[] = [];
  partylist: any[] = [];
  gstlist: any[] = [];
  tdslist: any[] = [];
  tdssectionlist: any[] = [];
  tdspercentagelist: any[] = [];
  debitcardlist: any[] = [];
  statelist: any[] = [];
  chequenumberslist: any[] = [];
  upinameslist: any[] = [];
  upiidlist: any[] = [];
  paymentslist: any[] = [];
  paymentslist1: any[] = [];
  partyjournalentrylist: any[] = [];

  cashBalance = '';
  bankBalance = '';
  bankbookBalance = '';
  bankpassbookBalance = '';
  ledgerBalance = '';
  subledgerBalance = '';
  partyBalance = '';

  formValidationMessages: any = {};
  paymentlistcolumnwiselist: any = {};
  imageResponse: any = null;
  disablegst = false;
  disabletds = false;
  disableaddbutton = false;
  disablesavebutton = false;
  disabletransactiondate = false;
  addbutton = 'Add';
  savebutton = 'Save';
  kycFileName = '';
  JSONdataItem: any[] = [];
  private _selectedPartyStateName: string = '';

  gstnopattern =
    '^(0[1-9]|[1-2][0-9]|3[0-9])([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([a-zA-Z0-9]){1}([a-zA-Z]){1}([a-zA-Z0-9]){1}?';

  public ppaymentdateConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: 'DD-MMM-YYYY',
    containerClass: 'theme-dark-blue',
    showWeekNumbers: false,
  };

  BranchSchema = 'accounts';
  CompanyCode = '';
  LocalSchema = 'accounts';
  BranchCode = '';
  GlobalSchema = 'global';

  paymentVoucherForm!: FormGroup;
  BranchId: number | undefined;
  receiptid: string | undefined;
  groupcode: string | undefined;

  constructor(
    private _FormBuilder: FormBuilder,
    private datepipe: DatePipe,
    private zone: NgZone,
    private _commonService: CommonService,
    private router: Router,
    private _AccountingTransactionsService: AccountsTransactions
  ) {
    this.ppaymentdateConfig.maxDate = new Date();
  }

  ngOnInit(): void {
    this.getLoadData();
    this.currencySymbol = this._commonService.currencysymbol || '';
    if (this._commonService.comapnydetails != null)
      this.disabletransactiondate =
        this._commonService.comapnydetails.pdatepickerenablestatus;

    this.paymentVoucherForm = this._FormBuilder.group({
      ppaymentid: [''],
      schemaname: [this._commonService.getschemaname()],
      ppaymentdate: [new Date(), Validators.required],
      ptotalpaidamount: [''],
      pnarration: ['', Validators.required],
      pmodofPayment: ['CASH'],
      pbankname: [''],
      pbranchname: [''],
      ptranstype: ['CHEQUE', Validators.required],
      pCardNumber: [''],
      pUpiname: [''],
      pUpiid: [''],
      ptypeofpayment: [''],
      pChequenumber: [''],
      pchequedate: [''],
      pbankid: [''],
      pCreatedby: [this._commonService.getCreatedBy()],
      pStatusname: [this._commonService.pStatusname],
      ptypeofoperation: [this._commonService.ptypeofoperation],
      pipaddress: [this._commonService.getIpAddress()],
      ppaymentsslistcontrols: this.addppaymentsslistcontrols(),
      pDocStorePath: [''],
    });

    this.paymentVoucherForm.get('ppaymentdate')?.setValue(new Date());
    this.BlurEventAllControll(this.paymentVoucherForm);
  }

  addppaymentsslistcontrols(): FormGroup {
    return this._FormBuilder.group({
      psubledgerid: [null],
      psubledgername: [''],
      pledgerid: [null],
      pledgername: ['', Validators.required],
      pamount: [''],
      pactualpaidamount: ['', Validators.required],
      pgsttype: [''],
      pisgstapplicable: [false],
      pgstcalculationtype: ['EXCLUDE'],
      pgstpercentage: [''],
      pgstamount: [''],
      pigstamount: [''],
      pcgstamount: [''],
      psgstamount: [''],
      putgstamount: [''],
      ppartyname: ['', Validators.required],
      ppartyid: [null],
      pistdsapplicable: [false],
      pgstno: new FormControl('', Validators.pattern(this.gstnopattern)),
      pTdsSection: [''],
      pTdsPercentage: [''],
      ptdsamount: [''],
      ptdscalculationtype: ['INCLUDE'],
      ppannumber: [''],
      pState: [''],
      pStateId: [''],
      pigstpercentage: [''],
      pcgstpercentage: [''],
      psgstpercentage: [''],
      putgstpercentage: [''],
      ptotalamount: [''],
    });
  }

  BlurEventAllControll(fromgroup: FormGroup) {
    Object.keys(fromgroup.controls).forEach((key: string) => {
      const control = fromgroup.get(key);
      if (control instanceof FormGroup) {
        this.BlurEventAllControll(control);
      } else if (control?.validator) {
        control.valueChanges.subscribe(() => {
          this.GetValidationByControl(fromgroup, key);
        });
      }
    });
  }

  GetValidationByControl(formGroup: FormGroup, key: string) {
    const control = formGroup.get(key);
    if (!control) return;
    this.formValidationMessages[key] = '';
    if (control.invalid && (control.dirty || control.touched)) {
      for (const errorkey in control.errors) {
        const message = this._commonService.getValidationMessage(
          control,
          errorkey,
          key,
          key,
          ''
        );
        this.formValidationMessages[key] += message + ' ';
      }
    }
  }

  checkValidations(group: FormGroup, isValid: boolean): boolean {
    Object.keys(group.controls).forEach((key) => {
      const control = group.get(key);
      if (control instanceof FormGroup) {
        isValid = this.checkValidations(control, isValid);
      } else {
        control?.markAsTouched();
        if (control?.invalid) {
          isValid = false;
          this.GetValidationByControl(group, key);
        }
      }
    });
    return isValid;
  }

  setBalances(balancetype: string, balanceamount: any): void {
    if (
      balanceamount === null ||
      balanceamount === undefined ||
      balanceamount === ''
    ) {
      balanceamount = 0;
    }
    const numericAmount = Number(balanceamount) || 0;
    const formattedAmount = this._commonService.currencyFormat(
      Math.abs(numericAmount).toFixed(2)
    );
    const balancedetails =
      numericAmount < 0
        ? formattedAmount + ' Cr'
        : formattedAmount + ' Dr';

    switch (balancetype) {
      case 'CASH':
        this.cashBalance = balancedetails;
        break;
      case 'BANK':
        this.bankBalance = balancedetails;
        break;
      case 'BANKBOOK':
        this.bankbookBalance = balancedetails;
        break;
      case 'PASSBOOK':
        this.bankpassbookBalance = balancedetails;
        break;
      case 'LEDGER':
        this.ledgerBalance = balancedetails;
        break;
      case 'SUBLEDGER':
        this.subledgerBalance = balancedetails;
        break;
      case 'PARTY':
        this.partyBalance = balancedetails;
        break;
    }
  }

  modeofPaymentChange() {
    if (
      this.paymentVoucherForm.controls['pmodofPayment'].value === 'CASH'
    ) {
      this.paymentVoucherForm.controls['pbankid'].setValue(0);
      this.showModeofPayment = false;
      this.showtranstype = false;
    } else if (
      this.paymentVoucherForm.controls['pmodofPayment'].value === 'BANK'
    ) {
      this.paymentVoucherForm.controls['ptranstype'].setValue('CHEQUE');
      this.showModeofPayment = true;
      this.showtranstype = true;
    } else {
      this.showModeofPayment = true;
      this.showtranstype = false;
    }
    this.transofPaymentChange();
    this.getpartyJournalEntryData();
  }

  addModeofpaymentValidations() {
    const modeofpaymentControl = this.paymentVoucherForm.controls[
      'pmodofPayment'
    ] as FormGroup;
    const transtypeControl = this.paymentVoucherForm.controls[
      'ptranstype'
    ] as FormGroup;
    const bankControl = this.paymentVoucherForm.controls[
      'pbankname'
    ] as FormGroup;
    const chequeControl = this.paymentVoucherForm.controls[
      'pChequenumber'
    ] as FormGroup;
    const cardControl = this.paymentVoucherForm.controls[
      'pCardNumber'
    ] as FormGroup;
    const typeofpaymentControl = this.paymentVoucherForm.controls[
      'ptypeofpayment'
    ] as FormGroup;
    const UpinameControl = this.paymentVoucherForm.controls[
      'pUpiname'
    ] as FormGroup;
    const UpiidControl = this.paymentVoucherForm.controls[
      'pUpiid'
    ] as FormGroup;

    if (this.showModeofPayment) {
      modeofpaymentControl.setValidators(Validators.required);
      bankControl.setValidators(Validators.required);
      chequeControl.setValidators(Validators.required);
      transtypeControl.setValidators(
        this.showtranstype ? Validators.required : null!
      );
      cardControl.setValidators(
        this.showbankcard ? null! : Validators.required
      );
      typeofpaymentControl.setValidators(
        this.showTypeofPayment ? Validators.required : null!
      );
      if (this.showupi) {
        UpinameControl.setValidators(Validators.required);
        UpiidControl.setValidators(Validators.required);
      } else {
        UpinameControl.clearValidators();
        UpiidControl.clearValidators();
      }
    } else {
      [
        modeofpaymentControl,
        bankControl,
        chequeControl,
        UpinameControl,
        UpiidControl,
        typeofpaymentControl,
      ].forEach((c) => c.clearValidators());
    }
    [
      modeofpaymentControl,
      transtypeControl,
      cardControl,
      bankControl,
      chequeControl,
      typeofpaymentControl,
      UpinameControl,
      UpiidControl,
    ].forEach((c) => c.updateValueAndValidity());
  }

  transofPaymentChange() {
    this.displayCardName = 'Debit Card';
    this.showTypeofPayment = false;
    this.showbranch = false;
    this.showfinancial = false;
    this.showchequno = false;
    this.showbankcard = true;
    this.showupi = false;
    this.displaychequeno = 'Reference No.';

    switch (this.paymentVoucherForm.controls['ptranstype'].value) {
      case 'CHEQUE':
        this.showbankcard = true;
        this.displaychequeno = 'Cheque No.';
        this.showbranch = true;
        this.showchequno = true;
        break;
      case 'ONLINE':
        this.showbankcard = true;
        this.showTypeofPayment = true;
        break;
      case 'DEBIT CARD':
        this.showbankcard = false;
        this.showfinancial = true;
        break;
      default:
        this.displayCardName = 'Credit Card';
        this.showbankcard = false;
        this.showfinancial = true;
    }
    this.addModeofpaymentValidations();
    this.cleartranstypeDetails();
  }

  typeofPaymentChange() {
    const UpinameControl = this.paymentVoucherForm.controls[
      'pUpiname'
    ] as FormGroup;
    const UpiidControl = this.paymentVoucherForm.controls[
      'pUpiid'
    ] as FormGroup;
    if (
      this.paymentVoucherForm.controls['ptypeofpayment'].value === 'UPI'
    ) {
      this.showupi = true;
      UpinameControl.setValidators(Validators.required);
      UpiidControl.setValidators(Validators.required);
    } else {
      this.showupi = false;
      UpinameControl.clearValidators();
      UpiidControl.clearValidators();
    }
    UpinameControl.updateValueAndValidity();
    UpiidControl.updateValueAndValidity();
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'ptypeofpayment'
    );
  }

  isgstapplicable_Checked(): void {
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    const isOn = subForm.get('pisgstapplicable')?.value;

    if (!isOn) {
      subForm.get('pStateId')?.setValue('');
      this.gst_clear();
      this.showgst = true;
    } else {
      this.showgst = false;
      if (
        this.statelist.length === 1 &&
        !subForm.get('pStateId')?.value
      ) {
        const matchedState = this.statelist[0];
        subForm.get('pStateId')?.setValue(matchedState.pStateId);
        subForm
          .get('pState')
          ?.setValue(matchedState.pState || '');
        subForm
          .get('pgsttype')
          ?.setValue(matchedState.pgsttype || '');
        this.showgstamount = true;
        this.showigst = false;
        this.showcgst = false;
        this.showsgst = false;
        this.showutgst = false;
        switch (matchedState.pgsttype) {
          case 'IGST':
            this.showigst = true;
            break;
          case 'CGST,SGST':
            this.showcgst = true;
            this.showsgst = true;
            break;
          case 'CGST,UTGST':
            this.showcgst = true;
            this.showutgst = true;
            break;
          default:
            if (matchedState.pgsttype) this.showcgst = true;
            break;
        }
      }
    }
    this.isgstapplicableChange();
  }

  istdsapplicable_Checked(): void {
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    const ppartyname = subForm.get('ppartyname')?.value;
    const griddata = (this.paymentslist || []).filter(
      (x: any) => x.ppartyname === ppartyname
    );
    if (griddata.length > 0)
      subForm
        .get('pistdsapplicable')
        ?.setValue(griddata[0].pistdsapplicable);
    this.istdsapplicableChange();
  }

  isgstapplicableChange(): void {
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    const data = subForm.get('pisgstapplicable')?.value;
    const gstCalculationControl = subForm.get('pgstcalculationtype');
    const gstpercentageControl = subForm.get('pgstpercentage');
    const stateControl = subForm.get('pStateId');
    const gstamountControl = subForm.get('pgstamount');

    if (data) {
      this.showgst = false;
      if (!this.disablegst) {
        gstCalculationControl?.setValue('EXCLUDE');
      }
      gstCalculationControl?.setValidators(Validators.required);
      gstpercentageControl?.setValidators(Validators.required);
      stateControl?.setValidators(Validators.required);
      gstamountControl?.setValidators(Validators.required);

      gstCalculationControl?.markAsUntouched();
      gstpercentageControl?.markAsUntouched();
      stateControl?.markAsUntouched();
      gstamountControl?.markAsUntouched();

      const gstType = subForm.get('pgsttype')?.value;
      if (gstType) {
        this.showgstamount = true;
        this.showigst = false;
        this.showcgst = false;
        this.showsgst = false;
        this.showutgst = false;
        switch (gstType) {
          case 'IGST':
            this.showigst = true;
            break;
          case 'CGST,SGST':
            this.showcgst = true;
            this.showsgst = true;
            break;
          case 'CGST,UTGST':
            this.showcgst = true;
            this.showutgst = true;
            break;
          default:
            if (gstType) this.showcgst = true;
            break;
        }
      }
    } else {
      this.showgst = true;
      if (!this.disablegst) gstCalculationControl?.setValue('EXCLUDE');
      gstCalculationControl?.clearValidators();
      gstpercentageControl?.clearValidators();
      stateControl?.clearValidators();
      gstamountControl?.clearValidators();

      this.formValidationMessages['pgstpercentage'] = '';
      this.formValidationMessages['pStateId'] = '';

      this.showgstamount = false;
      this.showigst = false;
      this.showcgst = false;
      this.showsgst = false;
      this.showutgst = false;
    }
    [
      gstCalculationControl,
      gstpercentageControl,
      stateControl,
      gstamountControl,
    ].forEach((c) => c?.updateValueAndValidity());
    this.claculategsttdsamounts();
  }

  istdsapplicableChange(): void {
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    const data = subForm.get('pistdsapplicable')?.value;
    const tdsCalculationControl = subForm.get('ptdscalculationtype');
    const tdspercentageControl = subForm.get('pTdsPercentage');
    const sectionControl = subForm.get('pTdsSection');
    const tdsamountControl = subForm.get('ptdsamount');

    if (data) {
      this.showtds = false;
      if (!this.disabletds) {
        tdsCalculationControl?.setValue('INCLUDE');
      }
      tdsCalculationControl?.setValidators(Validators.required);
      tdspercentageControl?.setValidators(Validators.required);
      sectionControl?.setValidators(Validators.required);
      tdsamountControl?.setValidators(Validators.required);

      tdsCalculationControl?.markAsUntouched();
      tdspercentageControl?.markAsUntouched();
      sectionControl?.markAsUntouched();
      tdsamountControl?.markAsUntouched();
    } else {
      this.showtds = true;
      if (!this.disabletds) tdsCalculationControl?.setValue('INCLUDE');
      tdsCalculationControl?.clearValidators();
      tdspercentageControl?.clearValidators();
      sectionControl?.clearValidators();
      tdsamountControl?.clearValidators();

      this.formValidationMessages['pTdsSection'] = '';
      this.formValidationMessages['pTdsPercentage'] = '';
    }
    [
      tdsCalculationControl,
      tdspercentageControl,
      sectionControl,
      tdsamountControl,
    ].forEach((c) => c?.updateValueAndValidity());
    this.claculategsttdsamounts();
  }

  getLoadData() {
    this._AccountingTransactionsService.GetReceiptsandPaymentsLoadingDatapettycash(
      'PETTYCASH',
      this._commonService.getbranchname(),
      this._commonService.getCompanyCode(),
      this._commonService.getBranchCode(),
      this._commonService.getschemaname(),
      'taxes'
    ).subscribe(
      (json: any) => {
        if (json) {
          this.banklist = json.banklist;
          this.modeoftransactionslist = json.modeofTransactionslist;
          this.typeofpaymentlist = this.gettypeofpaymentdata();
          this.ledgeraccountslist = json.accountslist;
          this.partylist = json.partylist;
          this.gstlist = json.gstlist;
          this.debitcardlist = json.bankdebitcardslist;
          this.setBalances('CASH', json.cashbalance);
          this.setBalances('BANK', json.bankbalance);
        }
      },
      (error: any) => this._commonService.showErrorMessage(error)
    );
  }

  gettypeofpaymentdata(): any {
    return (this.modeoftransactionslist || []).filter(
      (p: any) => p.ptranstype !== p.ptypeofpayment
    );
  }

  trackByFn(index: number, _item: any) {
    return index;
  }

  bankName_Change($event: any): void {
    const pbankid = $event?.target?.value;
    this.upinameslist = [];
    this.chequenumberslist = [];
    this.paymentVoucherForm.get('pChequenumber')?.setValue('');
    this.paymentVoucherForm.get('pUpiname')?.setValue('');
    this.paymentVoucherForm.get('pUpiid')?.setValue('');
    if (pbankid && pbankid !== '') {
      const bankname =
        $event?.target?.options?.[$event.target.selectedIndex]?.text ||
        '';
      this.GetBankDetailsbyId(pbankid);
      this.getBankBranchName(pbankid);
      this.paymentVoucherForm.get('pbankname')?.setValue(bankname);
    } else {
      this.paymentVoucherForm.get('pbankname')?.setValue('');
    }
    this.GetValidationByControl(this.paymentVoucherForm, 'pbankname');
    this.formValidationMessages['pChequenumber'] = '';
  }

  chequenumber_Change(): void {
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'pChequenumber'
    );
  }

  debitCard_Change(): void {
    const cardNumber =
      this.paymentVoucherForm.get('pCardNumber')?.value;
    const data = this.getbankname(cardNumber);
    if (data) {
      this.paymentVoucherForm
        .get('pbankname')
        ?.setValue(data.pbankname);
      this.paymentVoucherForm
        .get('pbankid')
        ?.setValue(data.pbankid);
    }
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'pCardNumber'
    );
  }

  getbankname(cardnumber: any) {
    try {
      const data = (this.debitcardlist || []).find(
        (d: any) => d.pCardNumber === cardnumber
      );
      if (data) this.getBankBranchName(data.pbankid);
      return data;
    } catch (e) {
      this._commonService.showErrorMessage(e);
      return null;
    }
  }

  GetBankDetailsbyId(pbankid: any): void {
    this._AccountingTransactionsService
      .GetBankDetailsbyId(pbankid)
      .subscribe(
        (json: any) => {
          if (json) {
            this.upinameslist = json.bankupilist || [];
            this.chequenumberslist = json.chequeslist || [];
          }
        },
        (error: any) => this._commonService.showErrorMessage(error)
      );
  }

  getBankBranchName(pbankid: any): void {
    const data = (this.banklist || []).find(
      (b: any) => b.pbankid === pbankid
    );
    if (!data) return;
    this.paymentVoucherForm
      .get('pbranchname')
      ?.setValue(data.pbranchname);
    this.setBalances('BANKBOOK', data.pbankbalance);
    this.setBalances('PASSBOOK', data.pbankpassbookbalance);
  }

  upiName_Change($event: any): void {
    const upiname = $event?.target?.value;
    this.upiidlist = (this.upinameslist || []).filter(
      (r: any) => r.pUpiname === upiname
    );
    this.GetValidationByControl(this.paymentVoucherForm, 'pUpiname');
  }

  upid_change(): void {
    this.GetValidationByControl(this.paymentVoucherForm, 'pUpiid');
  }

  ledgerName_Change($event: any): void {
    const pledgerid = $event?.pledgerid;
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;

    this.subledgeraccountslist = [];
    subForm.get('psubledgerid')?.setValue(null);
    subForm.get('psubledgername')?.setValue('');
    this.subledgerBalance = '';

    if (pledgerid) {
      const selectedLedger = this.ledgeraccountslist.find(
        (ledger: any) => ledger.pledgerid === pledgerid
      );
      if (selectedLedger) {
        subForm
          .get('pledgername')
          ?.setValue(selectedLedger.pledgername);
        let balance =
          selectedLedger.accountbalance ??
          selectedLedger.ledgeramount ??
          selectedLedger.balance ??
          selectedLedger.pbalance ??
          0;
        this.setBalances('LEDGER', balance);
        this.GetSubLedgerData(pledgerid);
      } else {
        this.setBalances('LEDGER', 0);
        subForm.get('pledgername')?.setValue('');
      }
    } else {
      this.setBalances('LEDGER', 0);
      subForm.get('pledgername')?.setValue('');
    }
  }

  GetSubLedgerData(pledgerid: any): void {
    this._AccountingTransactionsService
      .GetSubLedgerData(
        pledgerid,
        this._commonService.getbranchname(),
        this._commonService.getCompanyCode(),
        this._commonService.getbranchname(),
        this._commonService.getBranchCode(),
        this._commonService.getschemaname()
      )
      .subscribe(
        (json: any) => {
          if (!json) return;
          this.subledgeraccountslist = json;
          const subForm = this.paymentVoucherForm.get(
            'ppaymentsslistcontrols'
          ) as FormGroup;
          if (!subForm) return;
          const subLedgerControl = subForm.get('psubledgername');
          if (this.subledgeraccountslist.length > 0) {
            this.showsubledger = true;
            subLedgerControl?.setValidators(Validators.required);
          } else {
            subLedgerControl?.clearValidators();
            this.showsubledger = false;
            subForm
              .get('psubledgerid')
              ?.setValue(pledgerid);
            subForm
              .get('psubledgername')
              ?.setValue(subForm.get('pledgername')?.value);
            this.formValidationMessages['psubledgername'] = '';
          }
          subLedgerControl?.updateValueAndValidity();
        },
        (error: any) => this._commonService.showErrorMessage(error)
      );
  }

  subledger_Change($event: any): void {
    const psubledgerid = $event?.psubledgerid;
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    this.subledgerBalance = '';
    if (psubledgerid) {
      subForm
        .get('psubledgername')
        ?.setValue($event.psubledgername);
      const bal =
        $event?.accountbalance ?? $event?.ledgeramount ?? $event?.balance ?? 0;
      this.setBalances('SUBLEDGER', bal);
    } else {
      subForm.get('psubledgername')?.setValue('');
      this.setBalances('SUBLEDGER', '');
    }
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'psubledgername'
    );
  }

  partyName_Change($event: any): void {
    const ppartyid = $event?.ppartyid;
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;

    this.statelist = [];
    this.tdssectionlist = [];
    this.tdspercentagelist = [];
    this._selectedPartyStateName = '';

    subForm.patchValue({
      pStateId: '',
      pState: '',
      pTdsSection: '',
      pTdsPercentage: '',
      ppartyreferenceid: '',
      ppartyreftype: '',
      ppartypannumber: '',
    });

    this.showgstamount = false;
    this.showigst = false;
    this.showcgst = false;
    this.showsgst = false;
    this.showutgst = false;
    this.showgstno = false;

    subForm.get('pgsttype')?.setValue('');
    subForm.get('pgstpercentage')?.setValue('');
    subForm.get('pgstamount')?.setValue(0);
    subForm.get('pigstamount')?.setValue(0);
    subForm.get('pcgstamount')?.setValue(0);
    subForm.get('psgstamount')?.setValue(0);
    subForm.get('putgstamount')?.setValue(0);
    this.partyBalance = '';

    subForm.get('pisgstapplicable')?.setValue(false);
    subForm.get('pistdsapplicable')?.setValue(false);

    this.showgst = true;
    this.showtds = true;

    if (ppartyid) {
      const partynamename = $event.ppartyname;
      subForm.get('ppartyname')?.setValue(partynamename);

      const data = (this.partylist || []).find(
        (x: any) => x.ppartyid === ppartyid
      );
      if (!data) return;

      subForm.patchValue({
        ppartyreferenceid: data.ppartyreferenceid || '',
        ppartyreftype: data.ppartyreftype || '',
        ppartypannumber: data.pan_no || '',
      });

      this._selectedPartyStateName = $event.state_name || '';
      this.getPartyDetailsbyid(ppartyid);
      this.setenableordisabletdsgst(partynamename, 'PARTYCHANGE');
    } else {
      this.setBalances('PARTY', '');
      subForm.get('ppartyname')?.setValue('');
      this.statelist = [];
      this._selectedPartyStateName = '';
    }
  }

  getPartyDetailsbyid(ppartyid: any) {
    this._AccountingTransactionsService
      .getPartyDetailsbyid(
        ppartyid,
        this._commonService.getbranchname(),
        this._commonService.getBranchCode(),
        this._commonService.getCompanyCode(),
        this._commonService.getschemaname(),
        'taxes'
      )
      .subscribe(
        (json: any) => {
          if (!json) return;

          this.tdslist = json.lstTdsSectionDetails || [];
          const newdata = this.tdslist
            .map((item: any) => item.pTdsSection)
            .filter(
              (value: any, index: number, self: any[]) =>
                self.indexOf(value) === index
            );
          this.tdssectionlist = newdata.map((s: any) => ({
            pTdsSection: s,
          }));

          const partyStateName = (
            this._selectedPartyStateName || ''
          )
            .toLowerCase()
            .trim();
          if (partyStateName && json.statelist?.length) {
            this.statelist = json.statelist.filter((state: any) => {
              const s = (
                state.pState ||
                state.pStatename ||
                ''
              )
                .toLowerCase()
                .trim();
              return (
                s === partyStateName ||
                s.includes(partyStateName) ||
                partyStateName.includes(s)
              );
            });
          } else {
            this.statelist = [];
          }

          this.claculategsttdsamounts();
          this.setBalances('PARTY', json.accountbalance);

          const subForm = this.paymentVoucherForm.get(
            'ppaymentsslistcontrols'
          ) as FormGroup;
          if (!subForm) return;
          subForm.get('pStateId')?.setValue('');
          subForm.get('pState')?.setValue('');
          subForm.get('pgsttype')?.setValue('');
          subForm.get('pisgstapplicable')?.setValue(false);

          this.showgstamount = false;
          this.showigst = false;
          this.showcgst = false;
          this.showsgst = false;
          this.showutgst = false;
          this.showgstno = false;
          this.showgst = true;
        },
        (error: any) => this._commonService.showErrorMessage(error)
      );
  }

  setenableordisabletdsgst(ppartyname: any, changetype: any): void {
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    subForm.get('pistdsapplicable')?.setValue(false);
    subForm.get('pisgstapplicable')?.setValue(false);

    const data = (this.paymentslist || []).filter(
      (x: any) => x.ppartyname === ppartyname
    );
    if (data && data.length > 0) {
      this.disablegst = true;
      this.disabletds = true;
      subForm
        .get('pistdsapplicable')
        ?.setValue(data[0].pistdsapplicable);
      subForm
        .get('pisgstapplicable')
        ?.setValue(data[0].pisgstapplicable);
      if (subForm.get('pisgstapplicable')?.value) {
        subForm.get('pgstcalculationtype')?.setValue('EXCLUDE');
      }
      if (subForm.get('pistdsapplicable')?.value) {
        subForm.get('ptdscalculationtype')?.setValue('INCLUDE');
      }
    } else {
      this.disablegst = false;
      this.disabletds = false;
      subForm.get('pgstcalculationtype')?.setValue('EXCLUDE');
      subForm.get('ptdscalculationtype')?.setValue('INCLUDE');
    }
  }

  gsno_change(): void {
    this.GetValidationByControl(this.paymentVoucherForm, 'pgstno');
  }

  gst_clear(): void {
    this.showgstamount = false;
    this.showigst = false;
    this.showcgst = false;
    this.showsgst = false;
    this.showutgst = false;
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    [
      'pigstpercentage',
      'pigstamount',
      'pcgstpercentage',
      'pcgstamount',
      'psgstpercentage',
      'psgstamount',
      'putgstpercentage',
      'putgstamount',
      'pgstamount',
    ].forEach((f) => subForm.get(f)?.setValue(0));
    subForm.get('pgsttype')?.setValue('');
  }

  gst_Change($event: any): void {
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    const gstpercentage =
      $event && typeof $event === 'object' && $event.pgstpercentage !== undefined
        ? $event.pgstpercentage
        : $event;
    [
      'pigstpercentage',
      'pcgstpercentage',
      'psgstpercentage',
      'putgstpercentage',
      'pigstamount',
      'pcgstamount',
      'psgstamount',
      'putgstamount',
      'pgstamount',
    ].forEach((f) => subForm.get(f)?.setValue(0));
    if (
      gstpercentage !== null &&
      gstpercentage !== undefined &&
      gstpercentage !== ''
    ) {
      this.getgstPercentage(gstpercentage);
    }
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'pgstpercentage'
    );
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'pgstamount'
    );
  }

  getgstPercentage(gstpercentage: any): void {
    const data = (this.gstlist || []).find(
      (g: any) => String(g.pgstpercentage) === String(gstpercentage)
    );
    if (!data) return;
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    subForm.get('pigstpercentage')?.setValue(data.pigstpercentage || 0);
    subForm.get('pcgstpercentage')?.setValue(data.pcgstpercentage || 0);
    subForm.get('psgstpercentage')?.setValue(data.psgstpercentage || 0);
    subForm.get('putgstpercentage')?.setValue(data.putgstpercentage || 0);
    const gstType = subForm.get('pgsttype')?.value;
    this.showgstamount = true;
    this.showigst = this.showcgst = this.showsgst = this.showutgst = false;
    switch (gstType) {
      case 'IGST':
        this.showigst = true;
        break;
      case 'CGST,SGST':
        this.showcgst = true;
        this.showsgst = true;
        break;
      case 'CGST,UTGST':
        this.showcgst = true;
        this.showutgst = true;
        break;
      default:
        if (gstType) this.showcgst = true;
        break;
    }
    this.claculategsttdsamounts();
  }

  state_change($event: any, currentPartyId?: any): void {
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    const pstateid = $event?.target?.value || '';
    const statename =
      $event?.target?.options?.[$event?.target?.selectedIndex]?.text || '';
    this.gst_clear();

    if (!pstateid || pstateid === '') {
      subForm.get('pState')?.setValue('');
      subForm.get('pStateId')?.setValue('');
      this.GetValidationByControl(this.paymentVoucherForm, 'pState');
      this.formValidationMessages['pigstpercentage'] = '';
      this.claculategsttdsamounts();
      return;
    }

    subForm.get('pState')?.setValue(statename);
    subForm.get('pStateId')?.setValue(pstateid);
    this.showgstno = !statename.split('-')[1];

    const data = this.GetStatedetailsbyId(pstateid);
    if (!data) {
      this.GetValidationByControl(this.paymentVoucherForm, 'pState');
      return;
    }

    subForm.get('pgsttype')?.setValue(data.pgsttype);
    this.showgstamount = true;
    this.showigst = this.showcgst = this.showsgst = this.showutgst = false;
    switch (data.pgsttype) {
      case 'IGST':
        this.showigst = true;
        break;
      case 'CGST,SGST':
        this.showcgst = true;
        this.showsgst = true;
        break;
      case 'CGST,UTGST':
        this.showcgst = true;
        this.showutgst = true;
        break;
      default:
        this.showcgst = true;
        break;
    }
    this.GetValidationByControl(this.paymentVoucherForm, 'pState');
    this.formValidationMessages['pigstpercentage'] = '';
    this.claculategsttdsamounts();
  }

  GetStatedetailsbyId(pstateid: any): any {
    return (this.statelist || []).find(
      (s: any) => String(s.pStateId) === String(pstateid)
    );
  }

  tdsSection_Change($event: any): void {
    const ptdssection = $event?.target?.value;
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return;
    this.tdspercentagelist = [];
    subForm.get('pTdsPercentage')?.setValue('');
    if (ptdssection && ptdssection !== '')
      this.gettdsPercentage(ptdssection);
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'pTdsSection'
    );
  }

  gettdsPercentage(ptdssection: any): void {
    this.tdspercentagelist = (this.tdslist || []).filter(
      (t: any) => t.pTdsSection === ptdssection
    );
    this.claculategsttdsamounts();
  }

  tds_Change(_$event: any): void {
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'pTdsPercentage'
    );
    this.GetValidationByControl(
      this.paymentVoucherForm,
      'ptdsamount'
    );
    this.claculategsttdsamounts();
  }

  pamount_change(): void {
    this.claculategsttdsamounts();
  }

  blockInvalidAmountKeys(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'F5',
    ];
    if (allowedKeys.includes(event.key)) return;
    if (
      (event.ctrlKey || event.metaKey) &&
      ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())
    )
      return;
    if (/^[0-9]$/.test(event.key)) return;
    if (event.key === '.') {
      const input = event.target as HTMLInputElement;
      const val = input.value.replace(/,/g, '');
      if (val.includes('.')) {
        event.preventDefault();
        return;
      }
      return;
    }
    event.preventDefault();
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');
    let parts = value.split('.');
    if (parts.length > 2) {
      parts = [parts[0], parts[1]];
    }
    if (parts[0].length > 13) {
      parts[0] = parts[0].substring(0, 13);
    }
    if (parts[1]) {
      parts[1] = parts[1].substring(0, 2);
    }
    let intPart = parts[0] ? this.formatIndian(parts[0]) : '';
    let formatted =
      parts.length > 1 ? intPart + '.' + parts[1] : intPart;
    input.value = formatted;
    let rawValue = formatted.replace(/,/g, '');
    this.paymentVoucherForm
      .get('pactualpaidamount')
      ?.setValue(rawValue, { emitEvent: false });
  }

  formatIndian(value: string): string {
    if (value.length <= 3) return value;
    let last3 = value.slice(-3);
    let rest = value.slice(0, -3);
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return rest + ',' + last3;
  }

  formatAmountOnBlur(): void {
    const control = this.paymentVoucherForm.get('pactualpaidamount');
    if (!control) return;
    let value = control.value;
    if (value) {
      let parts = value.toString().split('.');
      let intPart = this.formatIndian(parts[0]);
      let formatted =
        parts.length > 1 ? intPart + '.' + parts[1] : intPart;
      const input = document.getElementById(
        'pactualpaidamount'
      ) as HTMLInputElement;
      if (input) input.value = formatted;
    }
  }

  claculategsttdsamounts(): void {
    try {
      const subForm = this.paymentVoucherForm.get(
        'ppaymentsslistcontrols'
      ) as FormGroup;
      if (!subForm) return;

      let paidAmount = subForm.get('pactualpaidamount')?.value;
      if (!paidAmount) paidAmount = 0;
      else
        paidAmount = parseFloat(
          this._commonService.removeCommasInAmount(
            paidAmount.toString()
          )
        );
      if (isNaN(paidAmount)) paidAmount = 0;

      const isGstApplicable =
        subForm.get('pisgstapplicable')?.value;
      const gstType = subForm.get('pgsttype')?.value;
      const gstCalculationType =
        subForm.get('pgstcalculationtype')?.value || 'EXCLUDE';
      const igstPercentage =
        parseFloat(subForm.get('pigstpercentage')?.value) || 0;
      const cgstPercentage =
        parseFloat(subForm.get('pcgstpercentage')?.value) || 0;
      const sgstPercentage =
        parseFloat(subForm.get('psgstpercentage')?.value) || 0;
      const utgstPercentage =
        parseFloat(subForm.get('putgstpercentage')?.value) || 0;

      let igstAmount = 0,
        cgstAmount = 0,
        sgstAmount = 0,
        utgstAmount = 0;
      let taxableAmount = paidAmount;

      if (isGstApplicable && gstType && paidAmount > 0) {
        if (gstCalculationType === 'EXCLUDE') {
          taxableAmount = paidAmount;
          if (gstType === 'IGST') {
            igstAmount = Math.round(
              parseFloat(
                ((paidAmount * igstPercentage) / 100).toFixed(2)
              )
            );
          } else if (gstType === 'CGST,SGST') {
            const totalGst = Math.round(
              parseFloat(
                (
                  (paidAmount * (cgstPercentage + sgstPercentage)) /
                  100
                ).toFixed(2)
              )
            );
            cgstAmount = Math.round(totalGst / 2);
            sgstAmount = totalGst - cgstAmount;
          } else if (gstType === 'CGST,UTGST') {
            const totalGst = Math.round(
              parseFloat(
                (
                  (paidAmount * (cgstPercentage + utgstPercentage)) /
                  100
                ).toFixed(2)
              )
            );
            cgstAmount = Math.round(totalGst / 2);
            utgstAmount = totalGst - cgstAmount;
          }
        } else {
          if (gstType === 'IGST') {
            igstAmount = Math.round(
              parseFloat(
                (
                  (paidAmount * igstPercentage) /
                  (100 + igstPercentage)
                ).toFixed(2)
              )
            );
            taxableAmount = paidAmount - igstAmount;
          } else if (gstType === 'CGST,SGST') {
            const totalRate = cgstPercentage + sgstPercentage;
            const totalGst = Math.round(
              parseFloat(
                (
                  (paidAmount * totalRate) /
                  (100 + totalRate)
                ).toFixed(2)
              )
            );
            cgstAmount = Math.round(totalGst / 2);
            sgstAmount = totalGst - cgstAmount;
            taxableAmount = paidAmount - cgstAmount - sgstAmount;
          } else if (gstType === 'CGST,UTGST') {
            const totalRate = cgstPercentage + utgstPercentage;
            const totalGst = Math.round(
              parseFloat(
                (
                  (paidAmount * totalRate) /
                  (100 + totalRate)
                ).toFixed(2)
              )
            );
            cgstAmount = Math.round(totalGst / 2);
            utgstAmount = totalGst - cgstAmount;
            taxableAmount = paidAmount - cgstAmount - utgstAmount;
          }
        }
      }

      const gstAmount =
        igstAmount + cgstAmount + sgstAmount + utgstAmount;

      const isTdsApplicable =
        subForm.get('pistdsapplicable')?.value;
      const tdsCalculationType =
        subForm.get('ptdscalculationtype')?.value || 'INCLUDE';
      const tdsPercentage =
        parseFloat(subForm.get('pTdsPercentage')?.value) || 0;
      let tdsAmount = 0;

      if (isTdsApplicable && tdsPercentage > 0 && paidAmount > 0) {
        const baseForTds = taxableAmount;
        if (tdsCalculationType === 'INCLUDE') {
          tdsAmount = Math.round(
            (baseForTds * tdsPercentage) / (100 + tdsPercentage)
          );
        } else {
          tdsAmount = Math.round(
            (baseForTds * tdsPercentage) / 100
          );
        }
      }

      const totalAmount = parseFloat(
        (taxableAmount + gstAmount - tdsAmount).toFixed(2)
      );

      subForm
        .get('pamount')
        ?.setValue(taxableAmount > 0 ? taxableAmount : '');
      subForm.get('pgstamount')?.setValue(gstAmount);
      subForm.get('pigstamount')?.setValue(igstAmount);
      subForm.get('pcgstamount')?.setValue(cgstAmount);
      subForm.get('psgstamount')?.setValue(sgstAmount);
      subForm.get('putgstamount')?.setValue(utgstAmount);
      subForm.get('ptdsamount')?.setValue(tdsAmount);
      subForm.get('ptotalamount')?.setValue(totalAmount);
      this.formValidationMessages['pamount'] = '';
    } catch (e) {
      this._commonService.showErrorMessage(e);
    }
  }

  validateaddPaymentDetails(): boolean {
    let isValid = true;
    const subForm = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!subForm) return false;

    try {
      this.formValidationMessages = {};

      const verifyAmount = subForm.get('pactualpaidamount')?.value;
      if (!verifyAmount || verifyAmount === 0 || verifyAmount === '') {
        subForm.get('pactualpaidamount')?.markAsTouched();
        this.formValidationMessages['pactualpaidamount'] =
          'Enter Amount Paid';
        isValid = false;
      } else {
        subForm.get('pactualpaidamount')?.markAsUntouched();
      }

      const partyId = subForm.get('ppartyid')?.value;
      if (!partyId) {
        subForm.get('ppartyid')?.markAsTouched();
        this.formValidationMessages['ppartyid'] = 'Select Party';
        isValid = false;
      } else {
        subForm.get('ppartyid')?.markAsUntouched();
      }

      const ledgerId = subForm.get('pledgerid')?.value;
      if (!ledgerId) {
        subForm.get('pledgerid')?.markAsTouched();
        this.formValidationMessages['pledgerid'] = 'Select Ledger';
        isValid = false;
      } else {
        subForm.get('pledgerid')?.markAsUntouched();
      }

      if (this.showsubledger) {
        const subLedgerId = subForm.get('psubledgerid')?.value;
        if (!subLedgerId) {
          subForm.get('psubledgerid')?.markAsTouched();
          this.formValidationMessages['psubledgername'] =
            'Select Sub Ledger';
          isValid = false;
        } else {
          subForm.get('psubledgerid')?.markAsUntouched();
        }
      }

      const isGstEnabled =
        subForm.get('pisgstapplicable')?.value;
      if (isGstEnabled) {
        const stateId = subForm.get('pStateId')?.value;
        const gstPercentage = subForm.get('pgstpercentage')?.value;
        if (!stateId) {
          subForm.get('pStateId')?.markAsTouched();
          this.formValidationMessages['pStateId'] = 'Select State';
          isValid = false;
        } else {
          subForm.get('pStateId')?.markAsUntouched();
        }
        if (!gstPercentage) {
          subForm.get('pgstpercentage')?.markAsTouched();
          this.formValidationMessages['pgstpercentage'] =
            'Select GST %';
          isValid = false;
        } else {
          subForm.get('pgstpercentage')?.markAsUntouched();
        }
      }

      const isTdsEnabled = subForm.get('pistdsapplicable')?.value;
      if (isTdsEnabled) {
        const tdsSection = subForm.get('pTdsSection')?.value;
        const tdsPercentage = subForm.get('pTdsPercentage')?.value;
        if (!tdsSection) {
          subForm.get('pTdsSection')?.markAsTouched();
          this.formValidationMessages['pTdsSection'] =
            'Select Section';
          isValid = false;
        } else {
          subForm.get('pTdsSection')?.markAsUntouched();
        }
        if (!tdsPercentage) {
          subForm.get('pTdsPercentage')?.markAsTouched();
          this.formValidationMessages['pTdsPercentage'] =
            'Select Percentage';
          isValid = false;
        } else {
          subForm.get('pTdsPercentage')?.markAsUntouched();
        }
      }

      if (isValid) {
        const ledgerName = subForm.get('pledgername')?.value;
        const subledgerName = subForm.get('psubledgername')?.value;
        const partyIdValue = subForm.get('ppartyid')?.value;
        const gridData = this.paymentslist || [];
        let count = 0;
        for (let i = 0; i < gridData.length; i++) {
          if (
            gridData[i].pledgername === ledgerName &&
            gridData[i].psubledgername === subledgerName &&
            gridData[i].ppartyid === partyIdValue
          ) {
            count = 1;
            break;
          }
        }
        if (count === 1) {
          this._commonService.showWarningMessage(
            'Ledger, subledger and party already exists in the grid.'
          );
          isValid = false;
        }
      }
    } catch (e) {
      this._commonService.showErrorMessage(e);
      isValid = false;
    }

    if (
      !isValid &&
      Object.values(this.formValidationMessages).some(
        (v: any) => v && v !== ''
      )
    ) {
      this._commonService.showWarningMessage(
        'Please fill all required fields for this record'
      );
    }
    return isValid;
  }

  addPaymentDetails(): void {
    if (this.disableaddbutton) return;
    this.disableaddbutton = true;
    this.addbutton = 'Processing';
    const control = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;

    if (!this.validateaddPaymentDetails()) {
      this.disableaddbutton = false;
      this.addbutton = 'Add';
      return;
    }

    control.get('pStateId')?.setValue(control.get('pStateId')?.value || 0);
    control
      .get('pTdsPercentage')
      ?.setValue(control.get('pTdsPercentage')?.value || 0);
    const gstPercentage = control.get('pgstpercentage')?.value || 0;
    control.get('pgstpercentage')?.setValue(gstPercentage);

    const data = {
      ppartyname: control.get('ppartyname')?.value,
      pledgername: control.get('pledgername')?.value,
      psubledgername: control.get('psubledgername')?.value,
      ptotalamount: this._commonService.removeCommasInAmount(
        control.get('ptotalamount')?.value
      ),
      pamount: this._commonService.removeCommasInAmount(
        control.get('pamount')?.value
      ),
      pgstcalculationtype:
        control.get('pgstcalculationtype')?.value || 'EXCLUDE',
      pTdsSection: control.get('pTdsSection')?.value,
      pgstpercentage: gstPercentage,
      ptdsamount: this._commonService.removeCommasInAmount(
        control.get('ptdsamount')?.value
      ),
      ptdscalculationtype:
        control.get('ptdscalculationtype')?.value || 'INCLUDE',
      pTdsPercentage: control.get('pTdsPercentage')?.value || 0,
    };

    this.paymentslist1 = [...this.paymentslist1, data];
    this.paymentslist.push(control.value);
    this.getpartyJournalEntryData();
    this.clearPaymentDetailsparticular();

    const ledgerId = control.get('pledgerid')?.value;
    const ledgerName = control.get('pledgername')?.value;
    const subLedgerId = control.get('psubledgerid')?.value;
    const subLedgerName = control.get('psubledgername')?.value;

    control.patchValue({
      ppartyid: null,
      ppartyname: '',
      pactualpaidamount: '',
      ptdsamount: 0,
      pamount: '',
      ptotalamount: '',
      pgstamount: 0,
      pigstamount: 0,
      pcgstamount: 0,
      psgstamount: 0,
      putgstamount: 0,
      pisgstapplicable: false,
      pistdsapplicable: false,
      pStateId: '',
      pgstpercentage: '',
      pTdsSection: '',
      pTdsPercentage: '',
      pgsttype: '',
      pState: '',
      pgstno: '',
      pigstpercentage: 0,
      pcgstpercentage: 0,
      psgstpercentage: 0,
      putgstpercentage: 0,
    });
    control.get('pledgerid')?.setValue(ledgerId);
    control.get('pledgername')?.setValue(ledgerName);
    if (subLedgerId) {
      control.get('psubledgerid')?.setValue(subLedgerId);
      control.get('psubledgername')?.setValue(subLedgerName);
    }

    this.formValidationMessages = {};
    Object.keys(control.controls).forEach((key) => {
      const fieldControl = control.get(key);
      if (fieldControl) {
        fieldControl.markAsUntouched();
        fieldControl.markAsPristine();
      }
    });
    this.getPaymentListColumnWisetotals();
    this.disableaddbutton = false;
    this.addbutton = 'Add';
  }

  removeHandler(rowIndex: number) {
    if (
      !this.paymentslist1 ||
      rowIndex < 0 ||
      rowIndex >= this.paymentslist1.length
    )
      return;
    this.paymentslist1.splice(rowIndex, 1);
    this.paymentslist1 = [...this.paymentslist1];
    if (this.paymentslist.length > rowIndex) {
      this.paymentslist.splice(rowIndex, 1);
    }
    const totalPaid = this.paymentslist1.reduce(
      (sum: number, p: any) => sum + Number(p.ptotalamount || 0),
      0
    );
    this.paymentVoucherForm
      .get('ptotalpaidamount')
      ?.setValue(totalPaid);
    this.getpartyJournalEntryData();
    this.clearPaymentDetails();
    this.getPaymentListColumnWisetotals();
  }

  clearPaymentDetailsparticular() {
    const control = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    if (!control) return;
    control.patchValue({
      ppartyid: null,
      ppartyname: '',
      pactualpaidamount: '',
      ptdsamount: 0,
      pamount: '',
      ptotalamount: '',
      pgstamount: 0,
      pigstamount: 0,
      pcgstamount: 0,
      psgstamount: 0,
      putgstamount: 0,
      pisgstapplicable: false,
      pistdsapplicable: false,
      pStateId: '',
      pgstpercentage: '',
      pTdsSection: '',
      pTdsPercentage: '',
      pgsttype: '',
      pState: '',
      pgstno: '',
      pigstpercentage: 0,
      pcgstpercentage: 0,
      psgstpercentage: 0,
      putgstpercentage: 0,
      pgstcalculationtype: 'EXCLUDE',
      ptdscalculationtype: 'INCLUDE',
    });

    this.formValidationMessages = {};
    Object.keys(control.controls).forEach((key) => {
      const fieldControl = control.get(key);
      if (fieldControl) {
        fieldControl.markAsUntouched();
        fieldControl.markAsPristine();
        fieldControl.updateValueAndValidity();
      }
    });

    this.showgst = true;
    this.showtds = true;
    this.disablegst = false;
    this.disabletds = false;
    this.showgstno = false;
    this.showgstamount = false;
    this.showigst = false;
    this.showcgst = false;
    this.showsgst = false;
    this.showutgst = false;
    this.partyBalance = '';
    this.ledgerBalance = '';
    this.subledgerBalance = '';
    this.statelist = [];
    this.tdssectionlist = [];
    this.tdspercentagelist = [];
    this.isgstapplicableChange();
    this.istdsapplicableChange();
  }

  clearPaymentDetails() {
    const control = this.paymentVoucherForm.get(
      'ppaymentsslistcontrols'
    ) as FormGroup;
    control.reset();
    this.showsubledger = true;
    control.get('pistdsapplicable')?.setValue(false);
    control.get('pisgstapplicable')?.setValue(false);
    control.get('pledgerid')?.setValue(null);
    control.get('psubledgerid')?.setValue(null);
    control.get('ppartyid')?.setValue(null);
    control.get('pStateId')?.setValue('');
    control.get('pgstpercentage')?.setValue('');
    control.get('pTdsSection')?.setValue('');
    control.get('pTdsPercentage')?.setValue('');
    control.get('pgstcalculationtype')?.setValue('EXCLUDE');
    control.get('ptdscalculationtype')?.setValue('INCLUDE');
    this.setBalances('LEDGER', 0);
    this.setBalances('SUBLEDGER', 0);
    this.setBalances('PARTY', 0);
    this.showgstamount =
      this.showigst =
      this.showcgst =
      this.showsgst =
      this.showutgst =
        false;
    this.istdsapplicable_Checked();
    this.isgstapplicable_Checked();
    this.formValidationMessages = {};
  }

  cleartranstypeDetails() {
    this.chequenumberslist = [];
    [
      'pbankid',
      'pbankname',
      'pCardNumber',
      'ptypeofpayment',
      'pbranchname',
      'pUpiname',
      'pUpiid',
      'pChequenumber',
    ].forEach((f) =>
      this.paymentVoucherForm.get(f)?.setValue('')
    );
    this.formValidationMessages = {};
    this.setBalances('BANKBOOK', 0);
    this.setBalances('PASSBOOK', 0);
  }

  clearPaymentVoucher() {
    try {
      this.paymentslist = [];
      this.paymentslist1 = [];
      this.paymentVoucherForm.reset();
      this.cleartranstypeDetails();
      this.clearPaymentDetails();
      this.paymentVoucherForm.get('pmodofPayment')?.setValue('CASH');
      this.showModeofPayment = false;
      this.modeofPaymentChange();
      this.paymentVoucherForm
        .get('ppaymentdate')
        ?.setValue(new Date());
      this.showgstamount =
        this.showigst =
        this.showcgst =
        this.showsgst =
        this.showutgst =
          false;
      this.formValidationMessages = {};
      this.paymentlistcolumnwiselist = {};
      this.bankbookBalance = this.bankpassbookBalance = '';
      this.ledgerBalance = this.subledgerBalance = this.partyBalance = '';
      this.partyjournalentrylist = [];
      this.imageResponse = {
        name: '',
        fileType: 'imageResponse',
        contentType: '',
        size: 0,
      };
    } catch (e: any) {
      this._commonService.showErrorMessage(e.message || e);
    }
  }

  getPaymentListColumnWisetotals() {
    this.paymentlistcolumnwiselist['ptotalamount'] =
      this.paymentslist1.reduce(
        (s: number, c: any) => s + parseFloat(c.ptotalamount || 0),
        0
      );
    this.paymentlistcolumnwiselist['pamount'] =
      this.paymentslist1.reduce(
        (s: number, c: any) => s + parseFloat(c.pamount || 0),
        0
      );
    this.paymentlistcolumnwiselist['pgstamount'] =
      this.paymentslist.reduce(
        (s: number, c: any) => s + parseFloat(c.pgstamount || 0),
        0
      );
    this.paymentlistcolumnwiselist['ptdsamount'] =
      this.paymentslist1.reduce(
        (s: number, c: any) => s + parseFloat(c.ptdsamount || 0),
        0
      );
  }

  getpartyJournalEntryData() {
    try {
      const ledgerNames = [
        ...new Set(
          this.paymentslist.map((p: any) => p.pledgername)
        ),
      ];
      const tdsJournalEntries: any[] = [];
      this.partyjournalentrylist = [];

      ledgerNames.forEach((ledger: any, index: number) => {
        const ledgerRows = this.paymentslist.filter(
          (p: any) => p.pledgername === ledger
        );

        const ledgerDebitAmount = ledgerRows.reduce(
          (sum: number, p: any) => {
            const pamount =
              parseFloat(
                this._commonService.removeCommasInAmount(
                  (p.pamount || '0').toString()
                )
              ) || 0;
            const tds =
              parseFloat(
                this._commonService.removeCommasInAmount(
                  (p.ptdsamount || '0').toString()
                )
              ) || 0;
            return sum + (pamount - tds);
          },
          0
        );

        if (ledgerDebitAmount > 0) {
          this.partyjournalentrylist.push({
            type: 'Payment Voucher',
            accountname: ledger,
            debitamount: parseFloat(ledgerDebitAmount.toFixed(2)),
            creditamount: '',
          });
        }

        const tdsSections = [
          ...new Set(
            ledgerRows
              .filter(
                (p: any) =>
                  p.pistdsapplicable &&
                  parseFloat(p.ptdsamount || 0) > 0
              )
              .map((p: any) => p.pTdsSection)
          ),
        ];

        tdsSections.forEach((section: any) => {
          const sectionRows = ledgerRows.filter(
            (p: any) => p.pTdsSection === section
          );
          const tdsAmount = sectionRows.reduce(
            (sum: number, p: any) => {
              const tds =
                parseFloat(
                  this._commonService.removeCommasInAmount(
                    (p.ptdsamount || '0').toString()
                  )
                ) || 0;
              return sum + tds;
            },
            0
          );

          if (tdsAmount > 0) {
            tdsJournalEntries.push({
              type: `Journal Voucher${index + 1}`,
              accountname: `TDS-${section} RECEIVABLE`,
              debitamount: parseFloat(tdsAmount.toFixed(2)),
              creditamount: '',
            });
            tdsJournalEntries.push({
              type: `Journal Voucher${index + 1}`,
              accountname: ledger,
              debitamount: '',
              creditamount: parseFloat(tdsAmount.toFixed(2)),
            });
          }
        });
      });

      const gstFields: { field: string; label: string }[] = [
        { field: 'pigstamount', label: 'P-IGST' },
        { field: 'pcgstamount', label: 'P-CGST' },
        { field: 'psgstamount', label: 'P-SGST' },
        { field: 'putgstamount', label: 'P-UTGST' },
      ];

      gstFields.forEach(({ field, label }) => {
        const amount = this.paymentslist.reduce(
          (sum: number, p: any) => {
            const val =
              parseFloat(
                this._commonService.removeCommasInAmount(
                  (p[field] || '0').toString()
                )
              ) || 0;
            return sum + val;
          },
          0
        );

        if (amount > 0) {
          this.partyjournalentrylist.push({
            type: 'Payment Voucher',
            accountname: label,
            debitamount: parseFloat(amount.toFixed(2)),
            creditamount: '',
          });
        }
      });

      const totalCashPaid = this.paymentslist1.reduce(
        (sum: number, p: any) => {
          const amt =
            parseFloat((p.ptotalamount || '0').toString()) || 0;
          return sum + amt;
        },
        0
      );

      if (totalCashPaid > 0) {
        this.paymentVoucherForm
          .get('ptotalpaidamount')
          ?.setValue(parseFloat(totalCashPaid.toFixed(2)));

        const accountName =
          this.paymentVoucherForm.get('pmodofPayment')?.value ===
          'CASH'
            ? 'PETTY CASH'
            : 'BANK';

        this.partyjournalentrylist.push({
          type: 'Payment Voucher',
          accountname: accountName,
          debitamount: '',
          creditamount: parseFloat(totalCashPaid.toFixed(2)),
        });
      }

      this.partyjournalentrylist = [
        ...this.partyjournalentrylist,
        ...tdsJournalEntries,
      ];

      this.loadgrid();
    } catch (e) {
      this._commonService.showErrorMessage(e);
    }
  }

  loadgrid() {}

  getTotalDebit(): number {
    return this.partyjournalentrylist.reduce(
      (sum: number, row: any) => {
        return sum + (parseFloat(row.debitamount) || 0);
      },
      0
    );
  }

  getTotalCredit(): number {
    return this.partyjournalentrylist.reduce(
      (sum: number, row: any) => {
        return sum + (parseFloat(row.creditamount) || 0);
      },
      0
    );
  }

  validatesavePaymentVoucher(): boolean {
    this.formValidationMessages = {};

    try {
      if (!this.paymentslist || this.paymentslist.length === 0) {
        this._commonService.showWarningMessage(
          'Please add at least one record to the grid before saving!'
        );
        return false;
      }

      let isValid = true;

      const paymentDate =
        this.paymentVoucherForm.get('ppaymentdate')?.value;
      if (!paymentDate) {
        this.paymentVoucherForm
          .get('ppaymentdate')
          ?.markAsTouched();
        this.formValidationMessages['ppaymentdate'] = 'Select Date';
        isValid = false;
      }

      const narration =
        this.paymentVoucherForm.get('pnarration')?.value;
      if (!narration) {
        this.paymentVoucherForm.get('pnarration')?.markAsTouched();
        this.formValidationMessages['pnarration'] =
          'Enter Narration';
        isValid = false;
      }

      const modeOfPayment =
        this.paymentVoucherForm.get('pmodofPayment')?.value;
      if (!modeOfPayment) {
        this.paymentVoucherForm
          .get('pmodofPayment')
          ?.markAsTouched();
        this.formValidationMessages['pmodofPayment'] =
          'Select Mode of Payment';
        isValid = false;
      }

      if (modeOfPayment === 'BANK') {
        const bankId =
          this.paymentVoucherForm.get('pbankid')?.value;
        const chequeNumber =
          this.paymentVoucherForm.get('pChequenumber')?.value;
        if (!bankId) {
          this.paymentVoucherForm.get('pbankid')?.markAsTouched();
          this.formValidationMessages['pbankid'] =
            'Select Bank Name';
          isValid = false;
        }
        if (!chequeNumber) {
          this.paymentVoucherForm
            .get('pChequenumber')
            ?.markAsTouched();
          this.formValidationMessages['pChequenumber'] =
            'Enter ' + this.displaychequeno;
          isValid = false;
        }
      }

      if (!isValid) {
        this._commonService.showWarningMessage(
          'Please fill all required fields'
        );
        return false;
      }

      if (modeOfPayment === 'CASH') {
        const rawBalance = (this.cashBalance || '0')
          .toString()
          .trim()
          .replace(/[^\d.-]/g, '');
        const numericCashBalance =
          Number(
            this._commonService.removeCommasInAmount(rawBalance)
          ) || 0;
        const paidvalue = this.paymentslist1.reduce(
          (sum: number, item: any) =>
            sum + Number(item.ptotalamount || 0),
          0
        );
        if (paidvalue > numericCashBalance) {
          this._commonService.showWarningMessage(
            'Insufficient Cash Balance'
          );
          return false;
        }
      }

      return true;
    } catch (e: any) {
      this._commonService.showErrorMessage(e.message || e);
      return false;
    }
  }

  savePaymentVoucher() {
    if (!this.validatesavePaymentVoucher()) {
      this.disablesavebutton = false;
      this.savebutton = 'Save';
      return;
    }

    this.disablesavebutton = true;
    this.savebutton = 'Processing';

    try {
      if (!confirm('Do You Want To Save ?')) {
        this.disablesavebutton = false;
        this.savebutton = 'Save';
        return;
      }

      const totalPaid = this.paymentslist1.reduce(
        (sum: number, item: any) =>
          sum + Number(item.ptotalamount || 0),
        0
      );
      const paymentDate =
        this._commonService.getFormatDateNormal(
          this.paymentVoucherForm.get('ppaymentdate')?.value
        ) || new Date().toISOString().split('T')[0];
      const chequeDate =
        this._commonService.getFormatDateNormal(
          this.paymentVoucherForm.get('pchequedate')?.value
        ) || '';

      const payload = {
        pRecordid: '',
        pUpiname:
          this.paymentVoucherForm.get('pUpiname')?.value || '',
        pUpiid: this.paymentVoucherForm.get('pUpiid')?.value || '',
        pBankconfigurationId: '',
        pBankName:
          this.paymentVoucherForm.get('pbankname')?.value || '',
        pbranchname:
          this.paymentVoucherForm.get('pbranchname')?.value || '',
        ptranstype:
          this.paymentVoucherForm.get('ptranstype')?.value ||
          'PAYMENT',
        ptypeofpayment:
          this.paymentVoucherForm.get('ptypeofpayment')?.value ||
          'PETTYCASH',
        pChequenumber:
          this.paymentVoucherForm.get('pChequenumber')?.value || '',
        pchequedate: chequeDate,
        pchequedepositdate: '',
        pchequecleardate: '',
        pbankid: Number(
          this.paymentVoucherForm.get('pbankid')?.value || 0
        ),
        branchid: this.BranchCode || '',
        pCardNumber:
          this.paymentVoucherForm.get('pCardNumber')?.value || '',
        pdepositbankid: '',
        pdepositbankname: '',
        pAccountnumber: '',
        global_schema: this._commonService.getschemaname() || '',
        branch_schema:
          this._commonService.getbranchname() || '',
        company_code:
          this._commonService.getCompanyCode() || '',
        branch_code: this._commonService.getBranchCode() || '',
        pCreatedby: 9,
        pipaddress: this._commonService.getIpAddress() || '',
        pjvdate: paymentDate,
        pmodofPayment:
          this.paymentVoucherForm.get('pmodofPayment')?.value || '',
        bank_id: Number(
          this.paymentVoucherForm.get('pbankid')?.value || 0
        ),
        ptotalpaidamount: Number(totalPaid || 0),
        pnarration:
          this.paymentVoucherForm.get('pnarration')?.value || '',
        subscriberjoinedbranchid: 0,
        formname: 'PETTYCASH',
        ppaymentid:
          this.paymentVoucherForm.get('ppaymentid')?.value || '',
        ppaymentdate: paymentDate,
        ppaymentsslistcontrols: this.paymentslist.map(
          (item: any) => ({
            ppartyid: Number(item.ppartyid || 0),
            psubledgerid: Number(item.psubledgerid || 0),
            pamount: Number(item.pamount || 0),
            pistdsapplicable:
              item.pistdsapplicable === true ||
              item.pistdsapplicable === 'true',
            pTdsSection: item.pTdsSection || '',
            ptdsamount: Number(item.ptdsamount || 0),
            pisgstapplicable:
              item.pisgstapplicable === true ||
              item.pisgstapplicable === 'true',
            ptdscalculationtype:
              item.ptdscalculationtype || 'INCLUDE',
            pgstcalculationtype:
              item.pgstcalculationtype || 'EXCLUDE',
            ppartyreferenceid: item.ppartyreferenceid || '',
            ppartyname: item.ppartyname || '',
          })
        ),
        ppaymentslist: this.paymentslist.map((item: any) => ({
          psubledgerid: String(item.psubledgerid || ''),
          psubledgername: item.psubledgername || '',
          pledgerid: String(item.pledgerid || ''),
          pledgername: item.pledgername || '',
          id: String(item.psubledgerid || ''),
          text: item.psubledgername || '',
          ptranstype: 'PAYMENT',
          accountbalance: String(item.ledgeramount || '0'),
          pAccounttype: item.pAccounttype || '',
          legalcellReceipt: item.legalcellReceipt || '',
          pbranchcode: this.BranchCode || '',
          pbranchtype: 'MAIN',
          groupcode: item.groupcode || '',
          pamount: String(item.pamount || '0'),
          pgsttype: item.pgsttype || '',
          pgstcalculationtype:
            item.pgstcalculationtype || 'EXCLUDE',
          pgstpercentage: String(item.pgstpercentage || '0'),
          pigstamount: String(item.pigstamount || '0'),
          pcgstamount: String(item.pcgstamount || '0'),
          psgstamount: String(item.psgstamount || '0'),
          putgstamount: String(item.putgstamount || '0'),
          pState: item.pState || '',
          pStateId: String(item.pStateId || ''),
          pgstno: item.pgstno || '',
          pgstamount: String(item.pgstamount || '0'),
          pigstpercentage: String(item.pigstpercentage || '0'),
          pcgstpercentage: String(item.pcgstpercentage || '0'),
          psgstpercentage: String(item.psgstpercentage || '0'),
          putgstpercentage: String(item.putgstpercentage || '0'),
          pactualpaidamount: String(item.pactualpaidamount || '0'),
          ptotalamount: String(item.ptotalamount || '0'),
          pisgstapplicable: item.pisgstapplicable
            ? 'true'
            : 'false',
          ptdsamountindividual: String(item.ptdsamount || '0'),
          pTdsSection: item.pTdsSection || '',
          pTdsPercentage: String(item.pTdsPercentage || '0'),
          preferencetext: item.ppartyreferenceid || '',
          pgstnumber: item.pgstno || '',
          ppartyname: item.ppartyname || '',
          ppartyid: String(item.ppartyid || ''),
          ppartyreferenceid: item.ppartyreferenceid || '',
          ppartyreftype: item.ppartyreftype || '',
          pistdsapplicable: item.pistdsapplicable
            ? 'true'
            : 'false',
          ptdsamount: String(item.ptdsamount || '0'),
          ptdscalculationtype:
            item.ptdscalculationtype || 'INCLUDE',
          ptdsaccountId: String(item.ptdsaccountId || ''),
          ppartypannumber: item.ppartypannumber || '',
          ptdsrefjvnumber: item.ptdsrefjvnumber || '',
          ledgeramount: String(item.ledgeramount || '0'),
          totalreceivedamount: String(
            item.pactualpaidamount || '0'
          ),
          pFilename: this.imageResponse?.name || '',
          agentcode: item.agentcode || '',
          ticketno: item.ticketno || '',
          chitgroupid: item.chitgroupid || '',
          schemesubscriberid: item.schemesubscriberid || '',
          interbranchsubledgerid:
            item.interbranchsubledgerid || '',
          interbranchid: item.interbranchid || '',
          pformname: 'PETTYCASH',
          paccountname: item.paccountname || '',
          pgstvoucherno: item.pgstvoucherno || '',
          pChequenumber:
            this.paymentVoucherForm.get('pChequenumber')?.value ||
            '',
        })),
        pFilename: this.imageResponse?.name || '',
        pFilepath: '/uploads/receipts/',
        pFileformat:
          this.imageResponse?.contentType?.split('/')[1] || '',
        totalreceivedamount: String(totalPaid || 0),
        receiptid: this.receiptid || '',
        parentaccountname:
          this.paymentslist[0]?.paccountname || '',
        contactid: String(
          this.paymentslist[0]?.ppartyid || ''
        ),
        contactname: this.paymentslist[0]?.ppartyname || '',
        chitgroupid: this.paymentslist[0]?.chitgroupid || '',
        groupcode: this.paymentslist[0]?.groupcode || '',
        ticketno: this.paymentslist[0]?.ticketno || '',
        challanaNo: '',
        pparentid: String(
          this.paymentslist[0]?.pledgerid || ''
        ),
        pAccountName: this.paymentslist[0]?.pledgername || '',
        pContactReferenceId:
          this.paymentslist[0]?.ppartyreferenceid || '',
        pPanNumber: this.paymentslist[0]?.ppartypannumber || '',
        radioButtonValue:
          this.paymentVoucherForm.get('pmodofPayment')?.value || '',
        checkedChitScheme: 'false',
        toChitNo: '',
        payableValue: String(totalPaid || 0),
        pinstallment_no: '',
        pchequeno_scheme: '',
        pchequedate_scheme: '',
        bank_name:
          this.paymentVoucherForm.get('pbankname')?.value || '',
        pchequeEntryid: '',
        contactpaytype:
          this.paymentVoucherForm.get('pmodofPayment')?.value || '',
        contactbankname: '',
        contactbankaccno: '',
        contactbankbranch: '',
        contactbankifsc: '',
      };

      this._AccountingTransactionsService
        .SavePettyCash(payload)
        .subscribe(
          (res: any) => {
            if (res?.success) {
              this._commonService.showInfoMessage(
                'Saved Successfully'
              );
              this.router.navigate([
                'dashboard/accounts/accounts-transactions/petty-cash-view',
              ]);
            } else {
              this._commonService.showErrorMessage(
                res?.message || 'Save failed'
              );
            }
            this.disablesavebutton = false;
            this.savebutton = 'Save';
          },
          (error: any) => {
            this._commonService.showErrorMessage(error);
            this.disablesavebutton = false;
            this.savebutton = 'Save';
          }
        );
    } catch (e: any) {
      this._commonService.showErrorMessage(e.message || e);
      this.disablesavebutton = false;
      this.savebutton = 'Save';
    }
  }

  uploadAndProgress(event: Event) {
    try {
      const target = event.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (!file || !this.validateFile(file.name)) {
        this._commonService.showWarningMessage(
          'Upload jpg, png, or pdf files only'
        );
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageResponse = {
          name: file.name,
          fileType: 'imageResponse',
          contentType: file.type,
          size: file.size,
        };
      };
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'NewFileName',
        `Payment Voucher.${file.name.split('.').pop()}`
      );
      this._commonService
        .fileUploadS3('Account', formData)
        .subscribe(
          (data: any) => {
            if (!data?.length) return;
            this.kycFileName = data[0];
            this.imageResponse.name = data[0];
            this.paymentVoucherForm
              .get('pFilename')
              ?.setValue(this.kycFileName);
          },
          (error: any) =>
            this._commonService.showErrorMessage(error)
        );
    } catch (e: any) {
      this._commonService.showErrorMessage(e.message || e);
    }
  }

  validateFile(fileName: string): boolean {
    if (!fileName) return true;
    return ['jpg', 'png', 'pdf'].includes(
      fileName.split('.').pop()?.toLowerCase() || ''
    );
  }

  showErrorMessage(errormsg: string) {
    this._commonService.showErrorMessage(errormsg);
  }
  showWarningMessage(errormsg: string) {
    this._commonService.showWarningMessage(errormsg);
  }

  get pgstno() {
    return this.paymentVoucherForm.get('pgstno');
  }

  saveJournalVoucher(): void {}

  get isPartySelected(): boolean {
    return !!this.paymentVoucherForm.get(
      'ppaymentsslistcontrols.ppartyname'
    )?.value;
  }

  getStateName(state: any): string {
    return state?.pState || state?.pStatename || '';
  }
}
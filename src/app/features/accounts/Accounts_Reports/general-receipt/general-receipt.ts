
import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { take } from 'rxjs';
import { NumberToWordsPipe } from '../../../../shared/pipes/number-to-words-pipe';
import { CommonService } from '../../../../core/services/Common/common.service';
import { AccountsReports } from '../../../../core/services/accounts/accounts-reports';
import { CompanyDetailsService } from '../../../../core/services/Common/company-details-service';

@Component({
  selector: "app-general-receipt",
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, TitleCasePipe, NumberToWordsPipe],
  templateUrl: "./general-receipt.html",
  styleUrl: "./general-receipt.css",
  providers: [NumberToWordsPipe, DatePipe]
})

export class GeneralReceipt implements OnInit {

  // ── DI via inject() ─────────────────────────────────────────────────────────
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly commonService = inject(CommonService);
  private readonly receiptService = inject(AccountsReports);
  private readonly companyService = inject(CompanyDetailsService);
  private readonly datePipe = inject(DatePipe);
  private readonly numberToWords = inject(NumberToWordsPipe);
  private readonly destroyRef = inject(DestroyRef);

  // ── Signals ──────────────────────────────────────────────────────────────────
  receiptData = signal<any[]>([]);
  cancelled = signal<boolean>(false);
  duplicate = signal<string>('');
  receiptName = signal<string>('');
  companyName = signal<string>('');
  cinNumber = signal<string>('');
  branchName = signal<string>('');
  registrationAddress = signal<string>('');
  printedon = signal<Date>(new Date());

  // ── Plain fields ─────────────────────────────────────────────────────────────
  currencySymbol: string = '₹';
  username: string = sessionStorage.getItem('username') ?? '';
  printFileName: string = '';

  private generalreceiptID: string = '';
  private schemaName: string = '';

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.printedon.set(new Date());
    this.loadCompanyDetails();
    this.readRouteParams();
  }

  // ── Route params ──────────────────────────────────────────────────────────────
  private readRouteParams(): void {
    this.activatedRoute.paramMap.pipe(take(1)).subscribe(params => {
      const encodedId = params.get('id') ?? '';

      if (!encodedId) {
        console.warn('No ID found in params');
        return;
      }

      try {
        const decoded = atob(decodeURIComponent(encodedId));
        const split = decoded.split(',');

        this.generalreceiptID = split[0] ?? '';
        this.receiptName.set(split[1] ?? '');
        this.schemaName = split[3] ?? '';

        if (split[2]) {
          this.duplicate.set(split[2]);
        }

        if (this.generalreceiptID) {
          this.fetchReceiptById(this.generalreceiptID);
        }
      } catch (err) {
        console.error('Invalid Base64 ID:', err);
      }
    });
  }

  // ── Company data ───────────────────────────────────────────────────────────────
  private loadCompanyDetails(): void {
    this.companyService.GetCompanyData().subscribe({
      next: (res: any) => {
        const company = res[0];
        this.companyName.set(company?.companyName ?? '');
        this.cinNumber.set(company?.cinNumber ?? '');
        this.branchName.set(company?.branchName ?? '');
        this.registrationAddress.set(company?.registrationAddress ?? '');
      },
      error: err => this.commonService.showErrorMessage(err)
    });
  }

  // ── API call ───────────────────────────────────────────────────────────────────
  private fetchReceiptById(id: string): void {
    this.receiptService
      .GetGeneralReceiptbyId(
        id,
        this.commonService.getbranchname(),
        this.commonService.getCompanyCode(),
        this.commonService.getBranchCode(),
        this.commonService.getschemaname()
      )
      .subscribe({
        next: (res: any) => {
          if (!res?.length) return;
          this.receiptData.set(res);

          const first = res[0];
          const receiptDate = this.datePipe.transform(first.receipt_date, 'ddMMyyyy');
          const today = this.datePipe.transform(new Date(), 'ddMMyyyyhmmssa');
          this.printFileName = `GR_${first.receiptid}_RD_${receiptDate}_PD_${today}`;
        },
        error: err => this.commonService.showErrorMessage(err)
      });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────────
  getTotalAmount(list: any[]): number {
    if (!list?.length) return 0;
    return list.reduce((total: number, item: any) => total + (Number(item?.pLedgeramount) || 0), 0);
  }

  getNarration(narration: any): string {
    if (typeof narration === 'string') return narration;
    return narration?.narration ?? '';
  }

  getPaymentModeLabel(code: string): string {
    const map: Record<string, string> = {
      CH: 'Chq',
      U: 'UPI',
      DC: 'Debit Card',
      NEFT: 'NEFT',
      RTGS: 'RTGS'
    };
    return map[code] ?? code;
  }

  isCash(mode: string): boolean {
    return mode === 'C' || mode === 'CASH';
  }

  isCheque(type: string): boolean {
    return type === 'CH';
  }

  hasStringRef(ref: any): boolean {
    return typeof ref === 'string' && !!ref;
  }

  getBankName(bank: any): string {
    return typeof bank === 'string' ? bank : '';
  }

  // ── PDF / Print ────────────────────────────────────────────────────────────────
  pdfOrprint(type: 'Pdf' | 'Print'): void {
    const gridheaders = ['S.No.', 'Particulars', 'Amount'];
    const columnStyles = {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 40, halign: 'right' }
    };
    this.createPdf(this.receiptName(), gridheaders, columnStyles, type);
  }

  private createPdf(
    reportname: string,
    gridheaders: any[],
    columnStyles: any,
    type: 'Pdf' | 'Print'
  ): void {
    const data = this.receiptData();
    if (!data.length) return;

    const kapilLogo = this.getKapilGroupLogo();
    const doc = new jsPDF('p', 'mm', 'a4');
    const companyDetails = this.commonService._getCompanyDetails();
    const companyName = companyDetails?.companyName ?? '';
    const companyAddress = companyDetails?.registrationAddress ?? '';
    const companyCIN = companyDetails?.cinNumber ?? '';
    const pageWidth = doc.internal.pageSize.getWidth();

    data.forEach((row, index) => {
      doc.addImage(kapilLogo, 'JPEG', 10, 5, 20, 20);

      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(companyName, pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(companyAddress, pageWidth / 2, 21, { align: 'center' });
      doc.text(`CIN : ${companyCIN}`, pageWidth / 2, 26, { align: 'center' });

      doc.setFontSize(12);
      doc.text(reportname, 105, 35, { align: 'center' });

      doc.setFontSize(9);
      doc.text(`Receipt No : ${row.receiptid}`, 15, 38);
      doc.text(
        `Date : ${this.datePipe.transform(row.receipt_date, 'dd-MMM-yyyy')}`,
        150, 38
      );

      const subList: any[] = row.pGeneralReceiptSubDetailsList ?? [];
      const tableRows: any[] = subList.map((item: any, i: number) => [
        i + 1,
        item.pAccountname,
        this.commonService.currencyFormat(item.pLedgeramount)
      ]);

      const total = subList.reduce((s: number, x: any) => s + x.pLedgeramount, 0);
      tableRows.push([
        { content: 'Total', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
        this.commonService.currencyFormat(total)
      ]);

      autoTable(doc, {
        head: [gridheaders],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: {
          fillColor: this.commonService.pdfProperties('Header Color'),
          halign: this.commonService.pdfProperties('Header Alignment') as any,
          fontSize: Number(this.commonService.pdfProperties('Header Fontsize'))
        },
        styles: { fontSize: 9 },
        columnStyles
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const amountWords = `Rupees ${this.titleCase(this.numberToWords.transform(total))} Only.`;

      const narration = this.getNarration(row.narration);
      const modeLabel = row.modeof_receipt === 'CASH'
        ? 'CASH'
        : this.getPaymentModeLabel(row.typeofpayment ?? '');

      const refLabel = row.typeofpayment === 'CH' ? 'Chq Reference' : 'Ref No';
      const bankName = this.getBankName(row.cheque_bank);
      const refInfo = this.hasStringRef(row.reference_number)
        ? ` (${refLabel} : ${row.reference_number}, Bank : ${bankName})`
        : '';

      const content = [
        `Received With Thanks From : ${row.account_name}`,
        `Amount In Words : ${amountWords}`,
        `Narration : ${narration}`,
        `Mode Of Payment : ${modeLabel}${refInfo}`,
        `GST (Include) : ${subList[0]?.pcgstamount ?? ''}`,
        `TDS (Exclude) : ${subList[0]?.ptdsamount ?? ''}`
      ].join('\n');

      const textLines = doc.splitTextToSize(content, 180);
      doc.text(textLines, 15, finalY);

      const afterY = finalY + textLines.length * 5;
      const pageHeight = doc.internal.pageSize.height;
      const signY = Math.min(afterY + 25, pageHeight - 20);

      doc.text('(Approved By)', 25, signY);
      doc.text('(Verified By)', 90, signY);
      doc.text(this.username, 160, signY - 6);
      doc.text('(Posted By)', 160, signY);

      if (index < data.length - 1) doc.addPage();
    });

    if (type === 'Pdf') {
      doc.save(`${reportname}.pdf`);
    } else {
      this.commonService.setiFrameForPrint(doc);
    }
  }

  titleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  private getKapilGroupLogo(): string {
    return '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';
  }
}


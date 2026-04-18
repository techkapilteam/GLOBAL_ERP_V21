import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountingMasterService {
  newstatus(): any {
    return null;
  }

  editbankdetails(): any {
    return null;
  }

  editbankdetails1(): any {
    return null;
  }

  newformstatus(_status: string): void {
    // noop
  }

  GetBankUPIDetails(_schema: string, _branchCode: any, _companyCode: any): Observable<any[]> {
    return of([]);
  }

  GetGlobalBanks(_schema: string): Observable<any[]> {
    return of([]);
  }

  viewbank(_data: any, _schema: string, _branchName: any, _companyCode: any, _branchCode: any): Observable<any> {
    return of([]);
  }

  GetCheckDuplicateDebitCardNo(_payload: string): Observable<any> {
    return of({ status: 'B' });
  }

  savebankinformation(_payload: string): Observable<any> {
    return of({ success: true });
  }
}

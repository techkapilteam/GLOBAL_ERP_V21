
import { Component, inject, input, signal, computed, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { CommonService } from '../../../../core/services/Common/common.service';
import { CompanyDetailsService } from '../../../../core/services/Common/company-details-service';

@Component({
  selector: "app-companydetails",
  imports: [TitleCasePipe],
  templateUrl: "./companydetails.html",
  styleUrl: "./companydetails.css",
})

export class Companydetails implements OnInit {

  private commonService = inject(CommonService);
  private companyDetailsService = inject(CompanyDetailsService);

  // Input signal (Angular 17+ input() function, stable in v21)
  printedDateShowhide = input<boolean>(false);

  // Writable signals for company data
  companyName = signal<string>('');
  registrationAddress = signal<string>('');
  cinNumber = signal<string>('');
  branchName = signal<string>('');

  // Computed signal - only show CIN section if cinNumber is non-empty
  hasCinNumber = computed(() => this.cinNumber().trim() !== '');

  ngOnInit(): void {
    this.getCompanyName();
  }

  private getCompanyName(): void {
    this.companyDetailsService.GetCompanyData().subscribe({
      next: (data: any) => {
        if (data?.length > 0) {
          const company = data[0];
          this.companyName.set(company.companyName ?? '');
          this.registrationAddress.set(company.registrationAddress ?? '');
          this.cinNumber.set(company.cinNumber ?? '');
          this.branchName.set(company.branchName ?? '');
        }
      },
      error: (error) => {
        this.commonService.showErrorMessage(error);
      }
    });
  }
}

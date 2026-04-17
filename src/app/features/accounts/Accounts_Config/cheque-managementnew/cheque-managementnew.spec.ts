import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChequeManagementnew } from "./cheque-managementnew";

describe("ChequeManagementnew", () => {
  let component: ChequeManagementnew;
  let fixture: ComponentFixture<ChequeManagementnew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChequeManagementnew],
    }).compileComponents();

    fixture = TestBed.createComponent(ChequeManagementnew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

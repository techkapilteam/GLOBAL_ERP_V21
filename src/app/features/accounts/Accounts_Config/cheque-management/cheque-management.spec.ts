import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChequeManagement } from "./cheque-management";

describe("ChequeManagement", () => {
  let component: ChequeManagement;
  let fixture: ComponentFixture<ChequeManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChequeManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(ChequeManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

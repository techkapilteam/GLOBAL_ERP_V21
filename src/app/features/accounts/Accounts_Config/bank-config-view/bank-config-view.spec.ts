import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BankConfigView } from "./bank-config-view";

describe("BankConfigView", () => {
  let component: BankConfigView;
  let fixture: ComponentFixture<BankConfigView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankConfigView],
    }).compileComponents();

    fixture = TestBed.createComponent(BankConfigView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

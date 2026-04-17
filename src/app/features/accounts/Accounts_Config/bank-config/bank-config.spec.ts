import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BankConfig } from "./bank-config";

describe("BankConfig", () => {
  let component: BankConfig;
  let fixture: ComponentFixture<BankConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankConfig],
    }).compileComponents();

    fixture = TestBed.createComponent(BankConfig);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

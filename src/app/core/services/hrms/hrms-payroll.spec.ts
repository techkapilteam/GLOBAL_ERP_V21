import { TestBed } from "@angular/core/testing";

import { HrmsPayroll } from "./hrms-payroll";

describe("HrmsPayroll", () => {
  let service: HrmsPayroll;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrmsPayroll);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

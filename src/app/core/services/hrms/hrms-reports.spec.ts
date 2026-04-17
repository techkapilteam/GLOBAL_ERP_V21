import { TestBed } from "@angular/core/testing";

import { HrmsReports } from "./hrms-reports";

describe("HrmsReports", () => {
  let service: HrmsReports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HrmsReports);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

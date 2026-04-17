import { TestBed } from "@angular/core/testing";

import { AccountsReports } from "./accounts-reports";

describe("AccountsReports", () => {
  let service: AccountsReports;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsReports);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

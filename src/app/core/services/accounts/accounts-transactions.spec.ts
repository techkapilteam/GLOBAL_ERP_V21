import { TestBed } from "@angular/core/testing";

import { AccountsTransactions } from "./accounts-transactions";

describe("AccountsTransactions", () => {
  let service: AccountsTransactions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsTransactions);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

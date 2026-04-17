import { TestBed } from "@angular/core/testing";

import { AccountsConfig } from "./accounts-config";

describe("AccountsConfig", () => {
  let service: AccountsConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountsConfig);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});

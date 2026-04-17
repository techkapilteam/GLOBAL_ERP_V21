import { TestBed } from '@angular/core/testing';

import { N } from './n';

describe('N', () => {
  let service: N;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(N);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { Ndjson } from './ndjson.service';

describe('Ndjson', () => {
  let service: Ndjson;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ndjson);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

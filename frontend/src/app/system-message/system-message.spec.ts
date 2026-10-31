import { TestBed } from '@angular/core/testing';
import { SystemMessage } from './system-message';

describe('SystemMessage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemMessage],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SystemMessage);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});

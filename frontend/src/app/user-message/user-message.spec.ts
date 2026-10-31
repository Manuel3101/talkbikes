import { TestBed } from '@angular/core/testing';
import { UserMessage } from './user-message';

describe('UserMessage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMessage],
    }).compileComponents();
  });

  it('should create', async () => {
    const fixture = TestBed.createComponent(UserMessage);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });
});

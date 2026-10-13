import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMessage } from './user-message';

describe('UserMessage', () => {
  let component: UserMessage;
  let fixture: ComponentFixture<UserMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMessage]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserMessage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

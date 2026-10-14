import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserQuestion } from './user-question';

describe('UserQuestion', () => {
  let component: UserQuestion;
  let fixture: ComponentFixture<UserQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserQuestion]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserQuestion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

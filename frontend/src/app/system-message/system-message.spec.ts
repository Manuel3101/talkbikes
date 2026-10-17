import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemMessage } from './system-message';

describe('SystemMessage', () => {
  let component: SystemMessage;
  let fixture: ComponentFixture<SystemMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemMessage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

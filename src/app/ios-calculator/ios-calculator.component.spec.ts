import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IosCalculatorComponent } from './ios-calculator.component';

describe('IosCalculatorComponent', () => {
  let component: IosCalculatorComponent;
  let fixture: ComponentFixture<IosCalculatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IosCalculatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IosCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

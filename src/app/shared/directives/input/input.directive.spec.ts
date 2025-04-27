import { InputDirective } from './input.directive';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  template: `
    <input appInput [formControl]="inputControl" id="test-input" [label]="'Test Label'" [showError]="showError" [errorMessage]="errorMessage">
    <input appInput [formControl]="numberControl" type="number" id="number-input">
    <input appInput [formControl]="dateControl" type="date" id="date-input">
    <input appInput [formControl]="readonlyControl" [readonly]="true" id="readonly-input">
  `,
  standalone: true,
  imports: [ReactiveFormsModule, InputDirective]
})
class TestComponent {
  inputControl = new FormControl('');
  numberControl = new FormControl('');
  dateControl = new FormControl('');
  readonlyControl = new FormControl('');
  showError = false;
  errorMessage = 'Test error message';
}

describe('InputDirective (shared)', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let inputEl: DebugElement;
  let numberInputEl: DebugElement;
  let dateInputEl: DebugElement;
  let readonlyInputEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, InputDirective, TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();

    const inputElements = fixture.debugElement.queryAll(By.directive(InputDirective));
    inputEl = inputElements[0];
    numberInputEl = inputElements[1];
    dateInputEl = inputElements[2];
    readonlyInputEl = inputElements[3];
  });

  it('should create an instance', () => {
    const directive = new InputDirective(inputEl, {
      addClass: () => {},
      setProperty: () => {},
      appendChild: () => {},
      createElement: () => ({}),
      insertBefore: () => {},
      removeClass: () => {}
    } as any);
    expect(directive).toBeTruthy();
  });

  it('should add app-input class to the input element', () => {
    expect(inputEl.nativeElement.classList.contains('app-input')).toBeTruthy();
  });

  it('should create a label element when label is provided', () => {
    const parentElement = fixture.nativeElement.querySelector('#test-input').parentNode;
    const label = parentElement.querySelector('label');
    
    expect(label).toBeTruthy();
    expect(label.getAttribute('for')).toBe('test-input');
    expect(label.textContent).toBe('Test Label');
  });

  it('should create an error container', () => {
    const parentElement = fixture.nativeElement.querySelector('#test-input').parentNode;
    const errorContainer = parentElement.querySelector('.error-message');
    
    expect(errorContainer).toBeTruthy();
    expect(errorContainer.classList.contains('hidden')).toBeTruthy();
  });

  it('should display error message when showError is true', () => {
    component.showError = true;
    fixture.detectChanges();
    
    const parentElement = fixture.nativeElement.querySelector('#test-input').parentNode;
    const errorContainer = parentElement.querySelector('.error-message');
    
    expect(errorContainer.classList.contains('hidden')).toBeFalsy();
    expect(errorContainer.textContent.trim()).toBe('Test error message');
  });

  it('should add readonly class when readonly is true', () => {
    const readonlyInput = fixture.nativeElement.querySelector('#readonly-input');
    
    expect(readonlyInput.readOnly).toBeTruthy();
    expect(readonlyInput.classList.contains('readonly')).toBeTruthy();
  });

  it('should convert string value to number for number inputs', () => {
    const event = new Event('input');
    numberInputEl.nativeElement.value = '123';
    numberInputEl.nativeElement.dispatchEvent(event);
    
    expect(component.numberControl.value).toBe(123);
  });
  
  it('should handle date inputs', () => {
    const event = new Event('input');
    dateInputEl.nativeElement.value = '2023-01-15';
    dateInputEl.nativeElement.dispatchEvent(event);
    
    expect(component.dateControl.value).toBe('2023-01-15');
  });
  
  it('should handle empty inputs', () => {
    component.numberControl.setValue(123 as any);
    
    const event = new Event('input');
    numberInputEl.nativeElement.value = '';
    numberInputEl.nativeElement.dispatchEvent(event);
    
    expect(component.numberControl.value).toBeNull();
  });
  
  it('should call onTouched when blur event happens', () => {
    const directive = fixture.debugElement
      .queryAll(By.directive(InputDirective))[0]
      .injector.get(InputDirective);
    
    const spy = jest.spyOn(directive as any, 'onTouched');
    
    inputEl.triggerEventHandler('blur', {});
    
    expect(spy).toHaveBeenCalled();
  });
  
  it('should clean up on destroy', () => {
    const labelElement = document.createElement('label');
    const errorElement = document.createElement('div');
    const parentElement = document.createElement('div');
    
    parentElement.appendChild(labelElement);
    parentElement.appendChild(errorElement);
    
    const directive = new InputDirective(inputEl, {
      addClass: () => {},
      setProperty: () => {},
      appendChild: () => {},
      createElement: () => ({}),
      insertBefore: () => {},
      removeClass: () => {}
    } as any);
    
    (directive as any).labelElement = labelElement;
    (directive as any).errorElement = errorElement;
    
    const removeChildSpy = jest.spyOn(parentElement, 'removeChild');
    
    directive.ngOnDestroy();
    
    expect(removeChildSpy).toHaveBeenCalled();
  });
  
  it('should implement writeValue', () => {
    const directive = fixture.debugElement
      .queryAll(By.directive(InputDirective))[0]
      .injector.get(InputDirective);
    
    const rendererSpy = jest.spyOn((directive as any).renderer, 'setProperty');
    
    directive.writeValue('test');
    
    expect((directive as any).value).toBe('test');
  });
  
  it('should implement setDisabledState', () => {
    const directive = fixture.debugElement
      .queryAll(By.directive(InputDirective))[0]
      .injector.get(InputDirective);
    
    const rendererSpy = jest.spyOn((directive as any).renderer, 'setProperty');
    
    directive.setDisabledState(true);
    
    expect((directive as any).disabled).toBe(true);
  });
}); 
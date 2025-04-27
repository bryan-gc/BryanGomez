import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DateInputComponent } from './date-input.component';

describe('DateInputComponent', () => {
  let component: DateInputComponent;
  let fixture: ComponentFixture<DateInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        DateInputComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty value', () => {
    expect(component.dateControl.value).toBe('');
  });

  it('should update value when writeValue is called', () => {
    const testDate = '2023-01-15';
    component.writeValue(testDate);
    expect(component.dateControl.value).toBe(testDate);
  });

  it('should call onChange when value changes', () => {
    const spy = jest.fn();
    component.registerOnChange(spy);
    
    const newDate = '2023-02-20';
    component.dateControl.setValue(newDate);
    
    expect(spy).toHaveBeenCalledWith(newDate);
  });

  it('should call onTouched when blur event happens', () => {
    const spy = jest.fn();
    component.registerOnTouched(spy);
    
    component.onBlur();
    
    expect(spy).toHaveBeenCalled();
  });

  it('should disable control when setDisabledState is called with true', () => {
    component.setDisabledState?.(true);
    expect(component.dateControl.disabled).toBe(true);
    
    component.setDisabledState?.(false);
    expect(component.dateControl.disabled).toBe(false);
  });

  it('should display error message when showError is true', () => {
    component.showError = true;
    component.errorMessage = 'Test error message';
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement.textContent.trim()).toBe('Test error message');
  });

  it('should not display error message when showError is false', () => {
    component.showError = false;
    component.errorMessage = 'Test error message';
    fixture.detectChanges();
    
    const errorElement = fixture.nativeElement.querySelector('.error-message');
    expect(errorElement).toBeFalsy();
  });

  it('should set label text correctly', () => {
    component.label = 'Test Label';
    fixture.detectChanges();
    
    const labelElement = fixture.nativeElement.querySelector('label');
    expect(labelElement.textContent.trim()).toBe('Test Label');
  });

  it('should apply readonly attribute when readonly is true', () => {
    component.readonly = true;
    fixture.detectChanges();
    
    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement.readOnly).toBe(true);
  });

  it('should set min attribute when min is provided', () => {
    const minDate = '2023-01-01';
    component.min = minDate;
    fixture.detectChanges();
    
    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement.getAttribute('min')).toBe(minDate);
  });
  
  it('should handle empty value in writeValue', () => {
    component.writeValue('');
    expect(component.dateControl.value).toBe('');
  });
  
  it('should handle null value in writeValue', () => {
    component.writeValue(null as unknown as string);
    expect(component.dateControl.value).toBe('');
  });

  it('should handle undefined value in writeValue', () => {
    component.writeValue(undefined as unknown as string);
    expect(component.dateControl.value).toBe('');
  });

  it('should not add event listener if no onChange is registered', () => {
    component.ngOnDestroy();
    component.ngOnInit();
    
    component.dateControl.setValue('2023-01-01');
    expect(component.dateControl.value).toBe('2023-01-01');
  });

  it('should not add event listener if no onTouched is registered', () => {
    component.ngOnDestroy();
    component.ngOnInit();
    
    component.onBlur();
  });

  it('should have proper id when provided', () => {
    component.id = 'custom-id';
    fixture.detectChanges();
    
    const inputElement = fixture.nativeElement.querySelector('input');
    expect(inputElement.id).toBe('custom-id');
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    const spy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
}); 
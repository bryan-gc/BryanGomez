import { ButtonDirective } from './button.directive';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <button appButton="primary">Primary Button</button>
    <button appButton="secondary">Secondary Button</button>
    <button appButton="add">Add Button</button>
    <button appButton>Default Button</button>
  `,
  standalone: true,
  imports: [ButtonDirective]
})
class TestComponent {}

describe('ButtonDirective (shared)', () => {
  let fixture: ComponentFixture<TestComponent>;
  let primaryButtonEl: DebugElement;
  let secondaryButtonEl: DebugElement;
  let addButtonEl: DebugElement;
  let defaultButtonEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonDirective, TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    const buttonElements = fixture.debugElement.queryAll(By.directive(ButtonDirective));
    primaryButtonEl = buttonElements[0];
    secondaryButtonEl = buttonElements[1];
    addButtonEl = buttonElements[2];
    defaultButtonEl = buttonElements[3];
  });

  it('should create an instance', () => {
    const directive = new ButtonDirective(primaryButtonEl, {
      addClass: () => {},
      removeClass: () => {}
    } as any);
    expect(directive).toBeTruthy();
  });

  it('should add primary button class', () => {
    expect(primaryButtonEl.nativeElement.classList.contains('btn-primary')).toBeTruthy();
  });

  it('should add secondary button class', () => {
    expect(secondaryButtonEl.nativeElement.classList.contains('btn-secondary')).toBeTruthy();
  });

  it('should add add button class', () => {
    expect(addButtonEl.nativeElement.classList.contains('add-button')).toBeTruthy();
  });

  it('should use primary as default', () => {
    expect(defaultButtonEl.nativeElement.classList.contains('btn-primary')).toBeTruthy();
  });
  
  it('should remove previous classes when changing type', () => {
    const directive = new ButtonDirective(primaryButtonEl, {
      addClass: jest.fn(),
      removeClass: jest.fn(),
    } as any);
    
    directive.ngOnInit();
    
    expect((directive as any).renderer.removeClass).toHaveBeenCalledWith(
      primaryButtonEl.nativeElement, 'btn-primary'
    );
    expect((directive as any).renderer.removeClass).toHaveBeenCalledWith(
      primaryButtonEl.nativeElement, 'btn-secondary'
    );
    expect((directive as any).renderer.removeClass).toHaveBeenCalledWith(
      primaryButtonEl.nativeElement, 'add-button'
    );
  });
}); 
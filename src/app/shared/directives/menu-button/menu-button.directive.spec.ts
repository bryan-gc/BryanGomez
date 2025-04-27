import { MenuButtonDirective } from './menu-button.directive';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <button appMenuButton (clickEvent)="handleClick($event)">Menu Button</button>
    <div appMenuButton (clickEvent)="handleClick($event)">Div with Menu Button</div>
  `,
  standalone: true,
  imports: [MenuButtonDirective]
})
class TestComponent {
  handleClick(event: Event): void {
  }
}

describe('MenuButtonDirective (shared)', () => {
  let fixture: ComponentFixture<TestComponent>;
  let buttonEl: DebugElement;
  let divEl: DebugElement;
  let component: TestComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuButtonDirective, TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();

    const elements = fixture.debugElement.queryAll(By.directive(MenuButtonDirective));
    buttonEl = elements[0];
    divEl = elements[1];
  });

  it('should create an instance', () => {
    const directive = new MenuButtonDirective(buttonEl, {
      addClass: () => {},
      setProperty: () => {},
      setAttribute: () => {}
    } as any);
    expect(directive).toBeTruthy();
  });

  it('should add menu-button class to elements', () => {
    expect(buttonEl.nativeElement.classList.contains('menu-button')).toBeTruthy();
    expect(divEl.nativeElement.classList.contains('menu-button')).toBeTruthy();
  });

  it('should set textContent to "⋮"', () => {
    expect(buttonEl.nativeElement.textContent).toBe('⋮');
    expect(divEl.nativeElement.textContent).toBe('⋮');
  });

  it('should add role and type attributes to non-button elements', () => {
    expect(divEl.nativeElement.getAttribute('role')).toBe('button');
    expect(divEl.nativeElement.getAttribute('type')).toBe('button');
  });

  it('should emit clickEvent when clicked', () => {
    const spy = jest.spyOn(component, 'handleClick');
    const event = new Event('click');
    
    buttonEl.nativeElement.dispatchEvent(event);
    fixture.detectChanges();
    
    expect(spy).toHaveBeenCalled();
  });

  it('should stop propagation when clicked', () => {
    const event = new Event('click');
    jest.spyOn(event, 'stopPropagation');
    
    buttonEl.triggerEventHandler('click', event);
    
    expect(event.stopPropagation).toHaveBeenCalled();
  });
}); 
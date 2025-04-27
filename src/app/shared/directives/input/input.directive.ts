import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  HostListener,
  forwardRef,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appInput]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDirective),
      multi: true,
    },
  ],
})
export class InputDirective<T = string>
  implements ControlValueAccessor, OnInit, OnDestroy, OnChanges
{
  @Input() label?: string;
  @Input() errorMessage?: string;
  @Input() showError?: boolean;
  @Input() min?: string;

  private labelElement?: HTMLLabelElement;
  private errorElement?: HTMLDivElement;

  private value: T | null = null;
  private disabled = false;

  onChange: (value: T) => void = () => {};
  onTouched: () => void = () => {};

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.renderer.addClass(this.el.nativeElement, 'app-input');

    if (this.label) {
      this.createLabel();
    }

    this.createErrorContainer();

    this.updateErrorState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showError'] || changes['errorMessage']) {
      this.updateErrorState();
    }
  }

  ngOnDestroy(): void {
    if (this.labelElement?.parentNode) {
      this.labelElement.parentNode.removeChild(this.labelElement);
    }

    if (this.errorElement?.parentNode) {
      this.errorElement.parentNode.removeChild(this.errorElement);
    }
  }

  writeValue(value: T): void {
    this.value = value;
    this.renderer.setProperty(this.el.nativeElement, 'value', value ?? '');
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    let newValue: any;

    switch (this.el.nativeElement.type) {
      case 'number':
        newValue = target.value !== '' ? Number(target.value) : null;
        break;
      case 'date':
        newValue = target.value !== '' ? target.value : null;
        break;
      default:
        newValue = target.value;
    }

    this.value = newValue as T;
    this.onChange(this.value);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  @Input() set appInput(value: string) {}

  @Input() set readonly(value: boolean) {
    this.renderer.setProperty(this.el.nativeElement, 'readOnly', value);
    if (value) {
      this.renderer.addClass(this.el.nativeElement, 'readonly');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'readonly');
    }
  }

  private updateErrorState(): void {
    if (this.showError) {
      this.renderer.addClass(this.el.nativeElement, 'error');

      if (this.errorElement && this.errorMessage) {
        this.renderer.setProperty(
          this.errorElement,
          'textContent',
          this.errorMessage
        );
        this.renderer.removeClass(this.errorElement, 'hidden');
      }
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'error');

      if (this.errorElement) {
        this.renderer.addClass(this.errorElement, 'hidden');
      }
    }
  }

  private createLabel(): void {
    const parent = this.el.nativeElement.parentNode;

    if (parent && this.label) {
      this.labelElement = this.renderer.createElement('label');

      this.renderer.setAttribute(
        this.labelElement,
        'for',
        this.el.nativeElement.id || ''
      );
      this.renderer.setProperty(this.labelElement, 'textContent', this.label);

      this.renderer.insertBefore(
        parent,
        this.labelElement,
        this.el.nativeElement
      );
    }
  }

  private createErrorContainer(): void {
    const parent = this.el.nativeElement.parentNode;

    if (parent) {
      this.errorElement = this.renderer.createElement('div');

      this.renderer.addClass(this.errorElement, 'error-message');
      this.renderer.addClass(this.errorElement, 'hidden');

      this.renderer.appendChild(parent, this.errorElement);
    }
  }
}

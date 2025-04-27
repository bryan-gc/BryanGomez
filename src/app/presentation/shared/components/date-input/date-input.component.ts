import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true,
    },
  ],
})
export class DateInputComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() label: string = '';
  @Input() min: string = '';
  @Input() readonly: boolean = false;
  @Input() showError: boolean = false;
  @Input() errorMessage: string = '';
  @Input() id: string = '';

  dateControl = new FormControl('');
  private subscriptions = new Subscription();

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

  ngOnInit(): void {
    const valueChanges = this.dateControl.valueChanges.subscribe((value) => {
      this.onChange(value);
    });

    this.subscriptions.add(valueChanges);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  writeValue(value: string): void {
    if (value) {
      this.dateControl.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.dateControl.disable();
    } else {
      this.dateControl.enable();
    }
  }

  onBlur(): void {
    this.onTouched();
  }
} 
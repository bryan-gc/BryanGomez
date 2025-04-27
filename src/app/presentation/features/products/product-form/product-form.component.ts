import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  map,
  Observable,
  of,
  Subscription,
} from 'rxjs';

import { ProductService } from '../../../../core/services/product.service';
import { ButtonDirective } from '../../../shared/directives';
import { DateInputComponent } from '../../../shared/components/date-input/date-input.component';

@Injectable({
  providedIn: 'root',
})
export class IdExistsValidator implements AsyncValidator {
  constructor(private productService: ProductService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const value = control.value;
    if (!value || typeof value !== 'string' || value.length < 3) {
      return of(null);
    }

    return this.productService.verifyIdExists(value).pipe(
      debounceTime(300),
      map((exists) => (exists ? { idExists: true } : null)),
      catchError(() => of(null))
    );
  }
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ButtonDirective,
    DateInputComponent,
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  today = new Date();

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private idExistsValidator: IdExistsValidator
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [
        '',
        {
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(10),
          ],
          asyncValidators: [
            this.idExistsValidator.validate.bind(this.idExistsValidator),
          ],
          updateOn: 'blur',
        },
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      logo: ['', [Validators.required]],
      date_release: ['', [Validators.required]],
      date_revision: [{ value: '', disabled: true }, [Validators.required]],
    });

    const dateReleaseSub = this.productForm
      .get('date_release')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          const releaseDate = new Date(value);
          const revisionDate = new Date(releaseDate);
          revisionDate.setFullYear(revisionDate.getFullYear() + 1);
          this.productForm
            .get('date_revision')
            ?.setValue(this.formatDate(revisionDate));
        }
      });

    if (dateReleaseSub) {
      this.subscriptions.add(dateReleaseSub);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.getRawValue();
    formValue.date_revision = this.productForm.get('date_revision')?.value;

    const createProductSub = this.productService
      .createProduct(formValue)
      .subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error creating product', err);
        },
      });

    this.subscriptions.add(createProductSub);
  }

  resetForm(): void {
    this.productForm.reset();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
} 
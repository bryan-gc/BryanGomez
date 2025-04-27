import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { ProductService } from '../../../../core/services/product.service';
import { ButtonDirective } from '../../../shared/directives';
import { DateInputComponent } from '../../../shared/components/date-input/date-input.component';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    ButtonDirective,
    DateInputComponent,
  ],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
})
export class ProductEditComponent implements OnInit, OnDestroy {
  productForm!: FormGroup;
  today = new Date();
  productId: string = '';
  isLoading: boolean = true;

  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    const routeSub = this.route.params.subscribe((params) => {
      this.productId = params['id'];
      if (this.productId) {
        this.loadProduct(this.productId);
      }
    });

    this.subscriptions.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      id: [{ value: '', disabled: true }],
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

  loadProduct(id: string): void {
    this.isLoading = true;
    const loadProductSub = this.productService.getProduct(id).subscribe({
      next: (product) => {
        const formattedProduct = {
          ...product,
          date_release: this.formatDate(new Date(product.date_release)),
          date_revision: this.formatDate(new Date(product.date_revision)),
        };

        this.productForm.patchValue(formattedProduct);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando el producto', err);
        this.router.navigate(['/products']);
        this.isLoading = false;
      },
    });

    this.subscriptions.add(loadProductSub);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.getRawValue();
    formValue.date_revision = this.productForm.get('date_revision')?.value;

    const updateProductSub = this.productService
      .updateProduct(this.productId, formValue)
      .subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          console.error('Error al actualizar el producto', err);
        },
      });

    this.subscriptions.add(updateProductSub);
  }

  resetForm(): void {
    this.loadProduct(this.productId);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
} 
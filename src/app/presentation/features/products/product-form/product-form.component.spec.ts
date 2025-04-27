import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductFormComponent, IdExistsValidator } from './product-form.component';
import { ProductService } from '../../../../core/services/product.service';
import { of } from 'rxjs';
import { PRODUCT_REPOSITORY } from '../../../../core/services/product.service';
import { Product } from '../../../../core/domain/models/product.model';
import { ButtonDirective } from '../../../shared/directives';
import { DateInputComponent } from '../../../shared/components/date-input/date-input.component';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let productService: ProductService;
  let router: Router;
  let idExistsValidator: IdExistsValidator;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'Test Logo',
    date_release: new Date(),
    date_revision: new Date(),
  };

  const mockProductService = {
    createProduct: jest.fn().mockReturnValue(of({ 
      message: 'Product created successfully',
      data: mockProduct
    })),
    verifyIdExists: jest.fn().mockReturnValue(of(false))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ProductFormComponent
      ],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: PRODUCT_REPOSITORY, useValue: {} },
        IdExistsValidator
      ]
    })
    .overrideComponent(ProductFormComponent, {
      remove: {
        imports: [ButtonDirective, DateInputComponent]
      },
      add: {
        imports: [],
        providers: []
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    router = TestBed.inject(Router);
    idExistsValidator = TestBed.inject(IdExistsValidator);
    
    jest.spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();
    
    expect(component.productForm.get('id')?.value).toBe('');
    expect(component.productForm.get('name')?.value).toBe('');
    expect(component.productForm.get('description')?.value).toBe('');
    expect(component.productForm.get('logo')?.value).toBe('');
    expect(component.productForm.get('date_release')?.value).toBe('');
    expect(component.productForm.get('date_revision')?.value).toBe('');
    expect(component.productForm.get('date_revision')?.disabled).toBe(true);
  });

  it('should validate form fields correctly', () => {
    component.ngOnInit();
    const form = component.productForm;
    
    expect(form.valid).toBeFalsy();
    
    form.get('id')?.setValue('12345');
    form.get('name')?.setValue('Test Product Name');
    form.get('description')?.setValue('Test Product Description');
    form.get('logo')?.setValue('Test Logo');
    
    const today = new Date();
    form.get('date_release')?.setValue(component.formatDate(today));
    
    const revisionDate = new Date(today);
    revisionDate.setFullYear(revisionDate.getFullYear() + 1);
    
    const actualRevisionDate = new Date(form.get('date_revision')?.value);
    const expectedRevisionDate = new Date(component.formatDate(revisionDate));
    
    expect(actualRevisionDate.getFullYear()).toEqual(expectedRevisionDate.getFullYear());
    expect(actualRevisionDate.getMonth()).toEqual(expectedRevisionDate.getMonth());
    
    expect(form.valid).toBeTruthy();
  });

  it('should submit form when valid', () => {
    component.ngOnInit();
    const form = component.productForm;
    
    form.get('id')?.setValue('12345');
    form.get('name')?.setValue('Test Product Name');
    form.get('description')?.setValue('Test Product Description');
    form.get('logo')?.setValue('Test Logo');
    
    const today = new Date();
    form.get('date_release')?.setValue(component.formatDate(today));
    
    component.onSubmit();
    
    expect(mockProductService.createProduct).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should not submit form when invalid', () => {
    component.ngOnInit();
    const form = component.productForm;
    
    form.reset();
    
    form.get('id')?.setErrors({ required: true });
    
    expect(form.valid).toBeFalsy();
    
    mockProductService.createProduct.mockClear();
    jest.spyOn(router, 'navigate').mockClear();
    
    component.onSubmit();
    
    expect(mockProductService.createProduct).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should reset form', () => {
    component.ngOnInit();
    const form = component.productForm;
    
    form.get('id')?.setValue('12345');
    form.get('name')?.setValue('Test Product Name');
    
    component.resetForm();
    
    expect(form.get('id')?.value).toBe(null);
    expect(form.get('name')?.value).toBe(null);
  });

  it('should format date correctly', () => {
    const date = new Date(2023, 0, 15);
    const formattedDate = component.formatDate(date);
    
    expect(formattedDate).toBe('2023-01-15');
  });
}); 
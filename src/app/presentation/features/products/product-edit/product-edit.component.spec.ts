import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductEditComponent } from './product-edit.component';
import { ProductService } from '../../../../core/services/product.service';
import { of } from 'rxjs';
import { PRODUCT_REPOSITORY } from '../../../../core/services/product.service';
import { Product } from '../../../../core/domain/models/product.model';
import { ButtonDirective } from '../../../shared/directives';
import { DateInputComponent } from '../../../shared/components/date-input/date-input.component';

describe('ProductEditComponent', () => {
  let component: ProductEditComponent;
  let fixture: ComponentFixture<ProductEditComponent>;
  let productService: ProductService;
  let router: Router;
  let activatedRoute: ActivatedRoute;

  const mockProduct: Product = {
    id: '12345',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'Test Logo',
    date_release: new Date('2023-01-01'),
    date_revision: new Date('2024-01-01'),
  };

  const mockProductService = {
    getProduct: jest.fn().mockReturnValue(of(mockProduct)),
    updateProduct: jest.fn().mockReturnValue(of({ 
      message: 'Product updated successfully',
      data: mockProduct
    }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ProductEditComponent
      ],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: PRODUCT_REPOSITORY, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '12345' })
          }
        }
      ]
    })
    .overrideComponent(ProductEditComponent, {
      remove: {
        imports: [ButtonDirective, DateInputComponent]
      },
      add: {
        imports: [],
        providers: []
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    
    jest.spyOn(router, 'navigate');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load product on init', () => {
    component.ngOnInit();
    
    expect(mockProductService.getProduct).toHaveBeenCalledWith('12345');
    expect(component.productId).toBe('12345');
    
    setTimeout(() => {
      expect(component.productForm.get('id')?.value).toBe('12345');
      expect(component.productForm.get('name')?.value).toBe('Test Product');
      expect(component.productForm.get('description')?.value).toBe('Test Description');
      expect(component.productForm.get('logo')?.value).toBe('Test Logo');
      expect(component.productForm.get('date_release')?.value).toBe('2023-01-01');
      expect(component.productForm.get('date_revision')?.value).toBe('2024-01-01');
      expect(component.isLoading).toBe(false);
    }, 0);
  });

  it('should initialize form with disabled id field', () => {
    component.ngOnInit();
    
    expect(component.productForm.get('id')?.disabled).toBe(true);
  });

  it('should submit form when valid', () => {
    component.ngOnInit();
    component.productId = '12345';
    
    setTimeout(() => {
      component.onSubmit();
      
      expect(mockProductService.updateProduct).toHaveBeenCalledWith('12345', {
        id: '12345',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'Test Logo',
        date_release: '2023-01-01',
        date_revision: '2024-01-01'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    }, 0);
  });

  it('should not submit form when invalid', () => {
    component.ngOnInit();
    
    setTimeout(() => {
      component.productForm.get('name')?.setValue('');
      component.onSubmit();
      
      expect(mockProductService.updateProduct).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    }, 0);
  });

  it('should reset form to original values', () => {
    component.ngOnInit();
    component.productId = '12345';
    
    setTimeout(() => {
      component.productForm.get('name')?.setValue('Modified Name');
      
      component.resetForm();
      
      expect(mockProductService.getProduct).toHaveBeenCalledTimes(2);
    }, 0);
  });

  it('should format date correctly', () => {
    const date = new Date(2023, 0, 15);
    const formattedDate = component.formatDate(date);
    
    expect(formattedDate).toBe('2023-01-15');
  });
  
  it('should handle product not found error', () => {
    mockProductService.getProduct.mockRejectedValueOnce(new Error('Product not found'));
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    component.ngOnInit();
    
    setTimeout(() => {
      expect(console.error).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/products']);
    }, 10);
  });
  
  it('should handle update error', () => {
    component.ngOnInit();
    component.productId = '12345';
    
    mockProductService.updateProduct.mockRejectedValueOnce(new Error('Update failed'));
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    setTimeout(() => {
      component.onSubmit();
      
      setTimeout(() => {
        expect(console.error).toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalledWith(['/products']);
      }, 10);
    }, 0);
  });
  
  it('should handle form group creation', () => {
    component.initForm();
    
    expect(component.productForm).toBeDefined();
    expect(component.productForm.get('id')).toBeDefined();
    expect(component.productForm.get('name')).toBeDefined();
    expect(component.productForm.get('description')).toBeDefined();
    expect(component.productForm.get('logo')).toBeDefined();
    expect(component.productForm.get('date_release')).toBeDefined();
    expect(component.productForm.get('date_revision')).toBeDefined();
    
    expect(component.productForm.get('id')?.disabled).toBe(true);
  });
  
  it('should cleanup subscriptions on destroy', () => {
    const subscriptionSpy = jest.spyOn((component as any).subscriptions, 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(subscriptionSpy).toHaveBeenCalled();
  });
}); 
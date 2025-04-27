import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../core/services/product.service';
import { of, BehaviorSubject } from 'rxjs';
import { PRODUCT_REPOSITORY } from '../../../../core/services/product.service';
import { Product } from '../../../../core/domain/models/product.model';
import { ButtonDirective } from '../../../shared/directives';
import { MenuButtonDirective } from '../../../shared/directives';
import { NgZone } from '@angular/core';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: ProductService;
  let router: Router;

  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      logo: 'Logo1',
      date_release: new Date(),
      date_revision: new Date(),
    },
    {
      id: '2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      logo: 'Logo2',
      date_release: new Date(),
      date_revision: new Date(),
    }
  ];

  const mockProductService = {
    getAllProducts: jest.fn().mockReturnValue(of({ data: mockProducts })),
    deleteProduct: jest.fn().mockReturnValue(of({ message: 'Product deleted successfully' }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ProductListComponent
      ],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: PRODUCT_REPOSITORY, useValue: {} }
      ]
    })
    .overrideComponent(ProductListComponent, {
      remove: {
        imports: [ButtonDirective, MenuButtonDirective]
      },
      add: {
        imports: [],
        providers: []
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    router = TestBed.inject(Router);
    
    jest.spyOn(router, 'navigate');
    
    mockProductService.getAllProducts.mockClear();
    mockProductService.deleteProduct.mockClear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAllProducts on triggerReload', () => {
    mockProductService.getAllProducts.mockClear();
    
    const triggerReloadSpy = jest.spyOn(component, 'triggerReload');
    const reloadSubject = (component as any)['reloadSubject'];
    const reloadSubjectSpy = jest.spyOn(reloadSubject, 'next');
    
    component.triggerReload();
    
    expect(triggerReloadSpy).toHaveBeenCalled();
    expect(reloadSubjectSpy).toHaveBeenCalled();
  });

  it('should toggle dropdown', () => {
    const productId = '1';
    component.toggleDropdown(productId);
    expect(component.activeDropdown).toBe(productId);
    
    component.toggleDropdown(productId);
    expect(component.activeDropdown).toBeNull();
  });

  it('should toggle dropdown with event', () => {
    const productId = '1';
    const mockEvent = new MouseEvent('click');
    jest.spyOn(mockEvent, 'stopPropagation');
    
    component.toggleDropdown(productId, mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.activeDropdown).toBe(productId);
  });

  it('should close all dropdowns', () => {
    component.activeDropdown = '1';
    component.closeDropdowns();
    expect(component.activeDropdown).toBeNull();
  });

  it('should navigate to add product page', () => {
    component.goToAddProduct();
    expect(router.navigate).toHaveBeenCalledWith(['/products/new']);
  });

  it('should navigate to edit product page', () => {
    const mockEvent = new Event('click');
    const product = mockProducts[0];
    
    jest.spyOn(mockEvent, 'stopPropagation');
    component.editProduct(product, mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/products/edit', product.id]);
  });

  it('should confirm delete modal setup', () => {
    const product = mockProducts[0];
    const mockEvent = new Event('click');
    jest.spyOn(mockEvent, 'stopPropagation');
    
    component.confirmDelete(product, mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.productToDelete).toBe(product);
    expect(component.showDeleteModal).toBe(true);
  });
  
  it('should cancel product deletion', () => {
    component.productToDelete = mockProducts[0];
    component.showDeleteModal = true;
    
    component.cancelDelete();
    
    expect(component.productToDelete).toBeNull();
    expect(component.showDeleteModal).toBe(false);
  });

  it('should delete product', () => {
    component.productToDelete = mockProducts[0];
    component.showDeleteModal = true;
    
    component.deleteProduct();
    
    expect(mockProductService.deleteProduct).toHaveBeenCalledWith(mockProducts[0].id);
  });

  it('should trigger reload when requested', () => {
    const reloadSubject = (component as any)['reloadSubject'];
    const spy = jest.spyOn(reloadSubject, 'next');
    
    component.triggerReload();
    
    expect(spy).toHaveBeenCalled();
  });

  it('should update search text', () => {
    component.searchText = 'Test';
    expect(component.searchText).toBe('Test');
  });

  it('should update results per page', () => {
    component.resultsPerPage = 10;
    expect(component.resultsPerPage).toBe(10);
  });

  it('should handle document click outside', () => {
    component.activeDropdown = '1';
    
    const mockEvent = new MouseEvent('click');
    const mockElementRef = { nativeElement: { contains: jest.fn().mockReturnValue(false) } };
    (component as any).elementRef = mockElementRef;
    
    component.onDocumentClick(mockEvent);
    
    expect(component.activeDropdown).toBeNull();
  });

  it('should handle click on menu button', () => {
    component.activeDropdown = null;
    
    const mockTarget = document.createElement('div');
    mockTarget.classList.add('menu-button');
    const mockEvent = new MouseEvent('click', { 
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    Object.defineProperty(mockEvent, 'target', {
      get: () => mockTarget
    });
    
    const mockElementRef = { nativeElement: { contains: jest.fn().mockReturnValue(true) } };
    (component as any).elementRef = mockElementRef;
    
    component.onDocumentClick(mockEvent);
    
    expect(component.activeDropdown).toBeNull();
  });

  it('should handle dropdown item click', () => {
    component.activeDropdown = '1';
    
    const mockTarget = document.createElement('div');
    mockTarget.classList.add('dropdown-item');
    const mockEvent = new MouseEvent('click', { 
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    Object.defineProperty(mockEvent, 'target', {
      get: () => mockTarget
    });
    
    const mockElementRef = { nativeElement: { contains: jest.fn().mockReturnValue(true) } };
    (component as any).elementRef = mockElementRef;
    
    component.onDocumentClick(mockEvent);
    
    expect(component.activeDropdown).toBe('1');
  });

  it('should clean up subscriptions on destroy', () => {
    const subscriptionSpy = jest.spyOn((component as any).subscriptions, 'unsubscribe');
    component.ngOnDestroy();
    expect(subscriptionSpy).toHaveBeenCalled();
  });
}); 
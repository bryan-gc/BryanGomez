import { TestBed } from '@angular/core/testing';
import { ProductService, PRODUCT_REPOSITORY } from './product.service';
import { of } from 'rxjs';
import { Product, ProductCreateResponse, ProductResponse } from '../domain/models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let mockProductRepository: any;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'Test Logo',
    date_release: new Date(),
    date_revision: new Date(),
  };

  const mockProductResponse: ProductResponse = {
    data: [mockProduct]
  };

  const mockProductCreateResponse: ProductCreateResponse = {
    message: 'Product created successfully',
    data: mockProduct
  };

  beforeEach(() => {
    mockProductRepository = {
      getAll: jest.fn().mockReturnValue(of(mockProductResponse)),
      getById: jest.fn().mockReturnValue(of(mockProduct)),
      create: jest.fn().mockReturnValue(of(mockProductCreateResponse)),
      update: jest.fn().mockReturnValue(of(mockProductCreateResponse)),
      delete: jest.fn().mockReturnValue(of({ message: 'Product deleted successfully' })),
      verifyIdExists: jest.fn().mockReturnValue(of(false))
    };

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: PRODUCT_REPOSITORY, useValue: mockProductRepository }
      ]
    });
    
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all products', (done) => {
    service.getAllProducts().subscribe(response => {
      expect(response).toEqual(mockProductResponse);
      expect(mockProductRepository.getAll).toHaveBeenCalled();
      done();
    });
  });

  it('should get a product by id', (done) => {
    service.getProduct('1').subscribe(product => {
      expect(product).toEqual(mockProduct);
      expect(mockProductRepository.getById).toHaveBeenCalledWith('1');
      done();
    });
  });

  it('should create a product', (done) => {
    service.createProduct(mockProduct).subscribe(response => {
      expect(response).toEqual(mockProductCreateResponse);
      expect(mockProductRepository.create).toHaveBeenCalledWith(mockProduct);
      done();
    });
  });

  it('should update a product', (done) => {
    service.updateProduct('1', mockProduct).subscribe(response => {
      expect(response).toEqual(mockProductCreateResponse);
      expect(mockProductRepository.update).toHaveBeenCalledWith('1', mockProduct);
      done();
    });
  });

  it('should delete a product', (done) => {
    service.deleteProduct('1').subscribe(response => {
      expect(response).toEqual({ message: 'Product deleted successfully' });
      expect(mockProductRepository.delete).toHaveBeenCalledWith('1');
      done();
    });
  });

  it('should verify if id exists', (done) => {
    service.verifyIdExists('1').subscribe(exists => {
      expect(exists).toBe(false);
      expect(mockProductRepository.verifyIdExists).toHaveBeenCalledWith('1');
      done();
    });
  });
}); 
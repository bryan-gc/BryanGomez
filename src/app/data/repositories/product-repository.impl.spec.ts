import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductRepositoryImpl } from './product-repository.impl';
import { Product, ProductCreateResponse, ProductResponse } from '../../core/domain/models/product.model';

describe('ProductRepositoryImpl', () => {
  let repository: ProductRepositoryImpl;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3002/bp/products';

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
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductRepositoryImpl]
    });

    repository = TestBed.inject(ProductRepositoryImpl);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('should get all products', () => {
    repository.getAll().subscribe(response => {
      expect(response).toEqual(mockProductResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockProductResponse);
  });

  it('should get a product by id', () => {
    const id = '1';
    repository.getById(id).subscribe(product => {
      expect(product).toEqual(mockProduct);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProduct);
  });

  it('should create a product', () => {
    repository.create(mockProduct).subscribe(response => {
      expect(response).toEqual(mockProductCreateResponse);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProduct);
    req.flush(mockProductCreateResponse);
  });

  it('should update a product', () => {
    const id = '1';
    repository.update(id, mockProduct).subscribe(response => {
      expect(response).toEqual(mockProductCreateResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockProduct);
    req.flush(mockProductCreateResponse);
  });

  it('should delete a product', () => {
    const id = '1';
    const mockDeleteResponse = { message: 'Product deleted successfully' };
    
    repository.delete(id).subscribe(response => {
      expect(response).toEqual(mockDeleteResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockDeleteResponse);
  });

  it('should verify if id exists', () => {
    const id = '1';
    
    repository.verifyIdExists(id).subscribe(exists => {
      expect(exists).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/verification/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });
}); 
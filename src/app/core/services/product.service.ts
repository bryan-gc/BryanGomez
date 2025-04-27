import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductResponse, ProductCreateResponse } from '../domain/models/product.model';
import { ProductRepository } from '../repositories/product.repository';

export const PRODUCT_REPOSITORY = 'ProductRepository';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(@Inject(PRODUCT_REPOSITORY) private productRepository: ProductRepository) {}

  getAllProducts(): Observable<ProductResponse> {
    return this.productRepository.getAll();
  }

  getProduct(id: string): Observable<Product> {
    return this.productRepository.getById(id);
  }

  createProduct(product: Product): Observable<ProductCreateResponse> {
    return this.productRepository.create(product);
  }

  updateProduct(id: string, product: Product): Observable<ProductCreateResponse> {
    return this.productRepository.update(id, product);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.productRepository.delete(id);
  }

  verifyIdExists(id: string): Observable<boolean> {
    return this.productRepository.verifyIdExists(id);
  }
} 
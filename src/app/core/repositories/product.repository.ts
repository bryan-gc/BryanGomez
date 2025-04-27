import { Observable } from 'rxjs';
import { Product, ProductResponse, ProductCreateResponse } from '../domain/models/product.model';

export interface ProductRepository {
  getAll(): Observable<ProductResponse>;
  getById(id: string): Observable<Product>;
  create(product: Product): Observable<ProductCreateResponse>;
  update(id: string, product: Product): Observable<ProductCreateResponse>;
  delete(id: string): Observable<{ message: string }>;
  verifyIdExists(id: string): Observable<boolean>;
} 
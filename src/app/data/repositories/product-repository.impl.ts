import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductResponse, ProductCreateResponse } from '../../core/domain/models/product.model';
import { ProductRepository } from '../../core/repositories/product.repository';

@Injectable({
  providedIn: 'root'
})
export class ProductRepositoryImpl implements ProductRepository {
  private apiUrl = 'http://localhost:3002/bp/products';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.apiUrl);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: Product): Observable<ProductCreateResponse> {
    return this.http.post<ProductCreateResponse>(this.apiUrl, product);
  }

  update(id: string, product: Product): Observable<ProductCreateResponse> {
    return this.http.put<ProductCreateResponse>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  verifyIdExists(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verification/${id}`);
  }
} 
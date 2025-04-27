import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductInterface,
  ProductResponse,
  ProductCreateResponse,
} from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private apiUrl = 'http://localhost:3002/bp/products';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.apiUrl);
  }

  getProduct(id: string): Observable<ProductInterface> {
    return this.http.get<ProductInterface>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: ProductInterface): Observable<ProductCreateResponse> {
    return this.http.post<ProductCreateResponse>(this.apiUrl, product);
  }

  updateProduct(
    id: string,
    product: ProductInterface
  ): Observable<ProductCreateResponse> {
    return this.http.put<ProductCreateResponse>(
      `${this.apiUrl}/${id}`,
      product
    );
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  verifyIdExists(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verification/${id}`);
  }
}

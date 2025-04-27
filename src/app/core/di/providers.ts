import { Provider } from '@angular/core';
import { ProductRepositoryImpl } from '../../data/repositories/product-repository.impl';
import { PRODUCT_REPOSITORY } from '../services/product.service';

export const CORE_PROVIDERS: Provider[] = [
  {
    provide: PRODUCT_REPOSITORY,
    useClass: ProductRepositoryImpl
  }
]; 
import { Routes } from '@angular/router';
import { ProductListComponent } from './presentation/features/products/product-list/product-list.component';
import { ProductFormComponent } from './presentation/features/products/product-form/product-form.component';
import { ProductEditComponent } from './presentation/features/products/product-edit/product-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductEditComponent },
  { path: '**', redirectTo: 'products' }
];

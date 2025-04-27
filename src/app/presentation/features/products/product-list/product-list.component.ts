import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  delay,
  finalize,
  map,
  Observable,
  shareReplay,
  Subscription,
  switchMap,
} from 'rxjs';

import { Product } from '../../../../core/domain/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { ButtonDirective, MenuButtonDirective } from '../../../shared/directives';

interface FilterState {
  searchText: string;
  resultsPerPage: number;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ButtonDirective,
    MenuButtonDirective,
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  private filterSubject = new BehaviorSubject<FilterState>({
    searchText: '',
    resultsPerPage: 5,
  });

  private reloadSubject = new BehaviorSubject<number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  isLoading$ = this.loadingSubject.asObservable();

  products$: Observable<Product[]> = this.reloadSubject.pipe(
    switchMap(() => {
      this.loadingSubject.next(true);

      return this.productService.getAllProducts().pipe(
        delay(2000),
        finalize(() => {
          this.loadingSubject.next(false);
        })
      );
    }),
    map((response) => response.data),
    shareReplay(1)
  );

  filteredProducts$: Observable<Product[]> = combineLatest([
    this.products$,
    this.filterSubject,
  ]).pipe(
    map(([products, filter]) => {
      if (!filter.searchText.trim()) {
        return products;
      }

      const searchTerm = filter.searchText.toLowerCase();
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );
    }),
    shareReplay(1)
  );

  totalResults$: Observable<number> = this.filteredProducts$.pipe(
    map((products) => products.length)
  );

  get searchText(): string {
    return this.filterSubject.getValue().searchText;
  }
  set searchText(value: string) {
    this.updateFilter({ searchText: value });
  }

  get resultsPerPage(): number {
    return this.filterSubject.getValue().resultsPerPage;
  }
  set resultsPerPage(value: number) {
    this.updateFilter({ resultsPerPage: value });
  }

  resultsOptions = [5, 10, 20];

  activeDropdown: string | null = null;

  showDeleteModal: boolean = false;
  productToDelete: Product | null = null;

  private subscriptions = new Subscription();

  constructor(
    private productService: ProductService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdowns();
    } else {
      const target = event.target as HTMLElement;

      const isMenuButtonClick = this.isMenuButtonClick(target);
      const isDropdownItemClick = this.isDropdownItemClick(target);

      if (!isMenuButtonClick && !isDropdownItemClick) {
        this.closeDropdowns();
      }
    }
  }

  private isMenuButtonClick(element: HTMLElement): boolean {
    return (
      element.classList.contains('menu-button') ||
      !!element.closest('[appMenuButton]')
    );
  }

  private isDropdownItemClick(element: HTMLElement): boolean {
    return (
      element.classList.contains('dropdown-item') ||
      !!element.closest('.dropdown-item')
    );
  }

  ngOnInit(): void {
    this.triggerReload();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateFilter(changes: Partial<FilterState>): void {
    this.filterSubject.next({
      ...this.filterSubject.getValue(),
      ...changes,
    });
  }

  triggerReload(): void {
    this.reloadSubject.next(Date.now());
  }

  goToAddProduct(): void {
    this.router.navigate(['/products/new']);
  }

  toggleDropdown(productId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (this.activeDropdown === productId) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = productId;
    }
  }

  closeDropdowns(): void {
    this.activeDropdown = null;
  }

  editProduct(product: Product, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/products/edit', product.id]);
    this.closeDropdowns();
  }

  confirmDelete(product: Product, event: Event): void {
    event.stopPropagation();
    this.productToDelete = product;
    this.showDeleteModal = true;
    this.closeDropdowns();
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  deleteProduct(): void {
    if (this.productToDelete) {
      this.loadingSubject.next(true);
      this.productService.deleteProduct(this.productToDelete.id)
        .pipe(finalize(() => this.loadingSubject.next(false)))
        .subscribe(() => {
          this.showDeleteModal = false;
          this.productToDelete = null;
          this.triggerReload();
        });
    }
  }
} 
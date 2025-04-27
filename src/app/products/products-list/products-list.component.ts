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

import { ProductInterface } from '../../interfaces/product.interface';
import { ProductsService } from '../../services/products.service';
import { ButtonDirective, MenuButtonDirective } from '../../shared';

interface FilterState {
  searchText: string;
  resultsPerPage: number;
}

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ButtonDirective,
    MenuButtonDirective,
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit, OnDestroy {
  private filterSubject = new BehaviorSubject<FilterState>({
    searchText: '',
    resultsPerPage: 5,
  });

  private reloadSubject = new BehaviorSubject<number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  isLoading$ = this.loadingSubject.asObservable();

  products$: Observable<ProductInterface[]> = this.reloadSubject.pipe(
    switchMap(() => {
      this.loadingSubject.next(true);

      return this.productsService.getAllProducts().pipe(
        delay(2000),
        finalize(() => {
          this.loadingSubject.next(false);
        })
      );
    }),
    map((response) => response.data),
    shareReplay(1)
  );

  filteredProducts$: Observable<ProductInterface[]> = combineLatest([
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
  productToDelete: ProductInterface | null = null;

  private subscriptions = new Subscription();

  constructor(
    private productsService: ProductsService,
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

  editProduct(product: ProductInterface, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/products/edit', product.id]);
    this.closeDropdowns();
  }

  confirmDelete(product: ProductInterface, event: Event): void {
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
      const subscription = this.productsService
        .deleteProduct(this.productToDelete.id)
        .subscribe({
          next: () => {
            this.triggerReload();
            this.showDeleteModal = false;
            this.productToDelete = null;
          },
          error: (err) => {
            console.error('Error al eliminar el producto', err);
            this.showDeleteModal = false;
            this.productToDelete = null;
          },
        });

      this.subscriptions.add(subscription);
    }
  }
}

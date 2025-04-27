export interface ProductInterface {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: Date;
  date_revision: Date;
}

export interface ProductResponse {
  data: ProductInterface[];
}

export interface ProductCreateResponse {
  message: string;
  data: ProductInterface;
} 
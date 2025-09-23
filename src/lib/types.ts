
export type Category = {
  id: string;
  name: string;
};

export type StockItem = {
  size: string;
  color: string;
  quantity: number;
};

export type Product = {
  id: string;
  name:string;
  description: string;
  price: number;
  imageUrls: string[];
  categoryId: string;
  category?: Category;
  sizes?: string[];
  colors?: string[];
  stock?: StockItem[];
};

export type CartItem = {
  id: string; // productId + size + color
  productId: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  imageUrls: string[];
};

export type HeroData = {
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string;
};

export type Order = {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    items: CartItem[];
    total: number;
    createdAt: Date;
    status?: 'Completado' | 'Pendiente' | 'Cancelado';
}

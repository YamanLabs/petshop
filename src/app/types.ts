export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductVariation {
  name: string; // e.g., "1.5 kg", "12 kg", "S", "L"
  priceModifier: number; // e.g., 0, 450, -50 (added or subtracted from base price)
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  categoryId: string; // category link
  brand: string;
  stock: number;
  rating: number;
  reviews: Review[];
  variations?: ProductVariation[];
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string | null; // For hierarchical multi-level structure (e.g. Kedi -> Mama -> Kuru Mama)
  slug: string;
  description?: string;
  iconType?: 'svg' | 'image';
  iconSvgPreset?: 'cat' | 'dog' | 'bird' | 'fish' | 'rabbit' | 'none';
  iconImageUrl?: string;
  isPromo?: boolean;
}

export interface Coupon {
  code: string; // Coupon code (e.g. "PATI20")
  type: 'percentage' | 'fixed';
  value: number; // Discount rate or direct currency amount
  active: boolean;
  usageCount: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  variation?: string;
}

export interface Order {
  id: string;
  trackingCode: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Hazırlanıyor' | 'Kargoya Verildi' | 'Teslim Edildi';
  date: string;
}

export interface CustomerReview {
  id: string;
  text: string;
  rating: number;
  userName: string;
  productName: string;
  imageUrl?: string | null;
}

export interface NavbarLink {
  id: string;
  title: string;
  url: string;
  parentId: string | null;
  sortOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

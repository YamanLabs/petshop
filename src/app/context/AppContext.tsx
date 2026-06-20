'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Order, Coupon, Review, ProductVariation, CustomerReview, NavbarLink, Brand, ProductReview } from '../types';
import { playSound } from '../utils/sound';
import { supabase } from '../utils/supabase';

interface CartItem {
  product: Product;
  quantity: number;
  variation?: string;
}

interface AppContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  cart: CartItem[];
  wishlist: Product[];
  customerReviews: CustomerReview[];
  navbarLinks: NavbarLink[];
  brands: Brand[];
  productReviews: ProductReview[];
  isMounted: boolean;
  addToCart: (product: Product, quantity?: number, variation?: string) => void;
  removeFromCart: (productId: string, variation?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variation?: string) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  // Admin Methods
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  addCustomerReview: (review: Omit<CustomerReview, 'id'>) => void;
  updateCustomerReview: (review: CustomerReview) => void;
  deleteCustomerReview: (reviewId: string) => void;
  addNavbarLink: (link: Omit<NavbarLink, 'id'>) => void;
  updateNavbarLink: (link: NavbarLink) => void;
  deleteNavbarLink: (linkId: string) => void;
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (brandId: string) => void;
  addProductReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
  deleteProductReview: (reviewId: string) => void;
  addOrder: (orderData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    items: { productId: string; title: string; price: number; quantity: number; variation?: string }[];
    subtotal: number;
    discount: number;
    total: number;
  }) => string; // returns tracking code
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Categories (Turkish hierarchy)
const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Kedi', parentId: null, slug: 'kedi' },
  { id: 'cat-2', name: 'Köpek', parentId: null, slug: 'kopek' },
  { id: 'cat-3', name: 'Kuş', parentId: null, slug: 'kus' },
  { id: 'cat-4', name: 'Akvaryum', parentId: null, slug: 'akvaryum' },
  { id: 'cat-5', name: 'Kemirgen', parentId: null, slug: 'kemirgen' },
  // Subcategories
  { id: 'cat-1-1', name: 'Kuru Mama', parentId: 'cat-1', slug: 'kedi-kuru-mama' },
  { id: 'cat-1-2', name: 'Yaş Mama', parentId: 'cat-1', slug: 'kedi-yas-mama' },
  { id: 'cat-1-3', name: 'Kedi Kumu', parentId: 'cat-1', slug: 'kedi-kumu' },
  { id: 'cat-2-1', name: 'Kuru Mama', parentId: 'cat-2', slug: 'kopek-kuru-mama' },
  { id: 'cat-2-2', name: 'Köpek Tasması', parentId: 'cat-2', slug: 'kopek-tasmasi' },
  { id: 'cat-2-3', name: 'Köpek Oyuncağı', parentId: 'cat-2', slug: 'kopek-oyuncagi' },
];

// Initial Coupons
const initialCoupons: Coupon[] = [
  { code: 'ZUZU20', type: 'percentage', value: 20, active: true, usageCount: 5 },
  { code: 'YENI10', type: 'percentage', value: 10, active: true, usageCount: 12 },
  { code: 'MAMA50', type: 'fixed', value: 50, active: true, usageCount: 2 },
];

// Initial Products
const initialProducts: Product[] = [
  {
    id: 'prod-1',
    title: 'N&D Prime Kuzu Etli Yetişkin Kedi Maması',
    description: 'Yetişkin kediler için tahılsız, kuzu etli ve yaban mersinli yüksek kaliteli kedi maması. Kedinizin tüylerini canlandırır ve sağlıklı sindirim sağlar.',
    price: 649,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1608454367599-c1139e64e9a0?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1-1',
    brand: 'N&D',
    stock: 12,
    rating: 4.8,
    reviews: [
      { id: 'rev-1', customerName: 'Ahmet Y.', rating: 5, comment: 'Kedim bayılarak yiyor. Kesinlikle premium kalite.', date: '2026-06-10' },
      { id: 'rev-2', customerName: 'Selin K.', rating: 4, comment: 'Kargo biraz geç geldi ama mama çok kaliteli.', date: '2026-06-12' }
    ],
    variations: [
      { name: '1.5 kg', priceModifier: 0 },
      { name: '5 kg', priceModifier: 1100 },
      { name: '10 kg', priceModifier: 2200 }
    ],
    metaTitle: 'N&D Prime Kuzu Etli Yetişkin Kedi Maması | Zuzu Pet Co.',
    metaDescription: 'Tahılsız kuzu etli N&D kedi maması en uygun fiyatlarla Zuzu Pet Co.\'da! Kediniz için en sağlıklı besin değerleri.',
    metaKeywords: 'n&d kedi maması, kuzu etli kedi maması, tahılsız kedi maması'
  },
  {
    id: 'prod-2',
    title: 'GimCat Superfood Yaş Kedi Maması 85gr',
    description: 'Kediler için vitamin ve taurin katkılı, sos içinde tavuklu ve ıspanaklı nefis konserve yaş mama.',
    price: 49,
    originalPrice: 59,
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1-2',
    brand: 'GimCat',
    stock: 2, // Low stock alert will trigger in admin
    rating: 4.5,
    reviews: [
      { id: 'rev-3', customerName: 'Merve B.', rating: 5, comment: 'Sosunu çok sevdi, tabakta hiç bırakmıyor.', date: '2026-06-15' }
    ],
    variations: [
      { name: 'Tekli Paket', priceModifier: 0 },
      { name: '6\'lı Paket', priceModifier: 220 }
    ],
    metaTitle: 'GimCat Superfood Yaş Kedi Maması 85gr | Zuzu Pet Co.',
    metaDescription: 'Kediniz için vitamin deposu GimCat yaş mama en iyi fiyatla Zuzu Pet Co.\'da. Tavuklu ve ıspanaklı.',
    metaKeywords: 'gimcat yaş mama, kedi konservesi, yaş kedi maması'
  },
  {
    id: 'prod-3',
    title: 'Pro Plan Medium Puppy Tavuklu Yavru Köpek Maması',
    description: 'Orta ırk yavru köpekler için anne sütündeki antikorları içeren, bağışıklık sistemini destekleyici yavru köpek maması.',
    price: 899,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1589723900644-d8869c3a373b?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-2-1',
    brand: 'Pro Plan',
    stock: 15,
    rating: 4.9,
    reviews: [
      { id: 'rev-4', customerName: 'Barış A.', rating: 5, comment: 'Yavru golden köpeğim için aldım, gelişimi çok iyi gidiyor.', date: '2026-06-08' }
    ],
    variations: [
      { name: '3 kg', priceModifier: 0 },
      { name: '12 kg', priceModifier: 1800 }
    ],
    metaTitle: 'Pro Plan Yavru Köpek Maması | Zuzu Pet Co.',
    metaDescription: 'Pro Plan orta ırk yavru köpek maması ile köpeğinizin gelişimini destekleyin. Taze tavuk etli formül Zuzu Pet Co.\'da.',
    metaKeywords: 'pro plan köpek maması, yavru köpek maması, tavuklu köpek maması'
  },
  {
    id: 'prod-4',
    title: 'Premium Deri Köpek Göğüs Tasması',
    description: 'Yumuşak dolgulu, hakiki deriden üretilmiş, ayarlanabilir ve dayanıklı köpek göğüs tasması. Metal tokaları paslanmazdır.',
    price: 349,
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-2-2',
    brand: 'DeriSan',
    stock: 5,
    rating: 4.2,
    reviews: [
      { id: 'rev-5', customerName: 'Zeynep H.', rating: 4, comment: 'Çok şık durdu ama biraz sert bir deri. Zamanla yumuşar umarım.', date: '2026-06-14' }
    ],
    variations: [
      { name: 'S', priceModifier: 0 },
      { name: 'M', priceModifier: 50 },
      { name: 'L', priceModifier: 100 }
    ],
    metaTitle: 'Deri Köpek Göğüs Tasması | Zuzu Pet Co.',
    metaDescription: 'Hakiki deriden üretilmiş sağlam göğüs tasması köpekleriniz için konforlu ve şık Zuzu Pet Co.\'da.',
    metaKeywords: 'köpek tasması, göğüs tasması, deri köpek tasması'
  },
  {
    id: 'prod-5',
    title: 'Doğal Bentonit Bentonit Kokusuz Kedi Kumu 10L',
    description: 'Ultra topaklaşan, tozutma yapmayan, kokuları hapseden %100 doğal beyaz bentonit kedi kumu.',
    price: 189,
    originalPrice: 229,
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-1-3',
    brand: 'CleanPaws',
    stock: 25,
    rating: 4.4,
    reviews: [],
    metaTitle: 'Doğal Bentonit Kedi Kumu 10L | Zuzu Pet Co.',
    metaDescription: 'Tozsuz ve süper topaklanan doğal kedi kumu en iyi fiyatla Zuzu Pet Co.\'da.',
    metaKeywords: 'kedi kumu, bentonit kedi kumu, tozsuz kedi kumu'
  },
  {
    id: 'prod-6',
    title: 'Doğal Ahşap Kuş Kafesi & Salıncak Seti',
    description: 'Kanarya, muhabbet kuşu ve finch gibi küçük kafes kuşları için el yapımı ahşap tünekli lüks kafes ve salıncak set.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-3',
    brand: 'WoodyPet',
    stock: 3, // Low stock alert
    rating: 4.6,
    reviews: [
      { id: 'rev-6', customerName: 'Can P.', rating: 5, comment: 'Çok estetik ve kaliteli malzeme. Kuşum hemen alıştı.', date: '2026-06-11' }
    ],
    metaTitle: 'Ahşap Kuş Kafesi Seti | Zuzu Pet Co.',
    metaDescription: 'Doğal ahşaptan üretilmiş sağlıklı muhabbet kuşu kafesi ve salıncak takımı Zuzu Pet Co.\'da.',
    metaKeywords: 'kuş kafesi, ahşap kafes, muhabbet kuşu kafesi'
  },
  {
    id: 'prod-7',
    title: 'Cam Akvaryum & Şelale Filtre Başlangıç Seti 20L',
    description: 'Balık beslemeye yeni başlayanlar için şelale filtre, LED aydınlatma ve dekoratif kum içeren 20 litrelik cam akvaryum seti.',
    price: 799,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-4',
    brand: 'AquaClear',
    stock: 8,
    rating: 4.7,
    reviews: [],
    metaTitle: 'Cam Akvaryum Başlangıç Seti 20L | Zuzu Pet Co.',
    metaDescription: 'Şelale filtreli ve led ışıklı başlangıç akvaryumu Zuzu Pet Co.\'da. Kurulumu kolay, şık tasarım.',
    metaKeywords: 'akvaryum seti, 20l akvaryum, balık akvaryumu'
  },
  {
    id: 'prod-8',
    title: 'Kemirgen & Hamster Oyun Parklı Kafes',
    description: 'Hamster ve guinea pigler için çok katlı, tünelli, çarklı ve beslenme üniteli eğlenceli yaşam alanı kafesi.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1559214369-a6b1d7919865?w=600&auto=format&fit=crop&q=80',
    categoryId: 'cat-5',
    brand: 'Hammy',
    stock: 1, // Low stock alert
    rating: 4.3,
    reviews: [],
    metaTitle: 'Tünelli Hamster Kafesi | Zuzu Pet Co.',
    metaDescription: 'Hamsterınız için kaydıraklı ve oyun parklı konforlu kafes seçeneği Zuzu Pet Co.\'da.',
    metaKeywords: 'hamster kafesi, guinea pig kafesi, kemirgen kafesi'
  }
];

// Initial Orders
const initialOrders: Order[] = [
  {
    id: 'order-1',
    trackingCode: 'PK-98218-XYZ',
    customerName: 'Fatma Demir',
    email: 'fatma@example.com',
    phone: '0555 123 4567',
    address: 'Atatürk Mh. İstiklal Cd. No:45 D:2 Kadıköy / İstanbul',
    items: [
      { productId: 'prod-1', title: 'N&D Prime Kuzu Etli Yetişkin Kedi Maması', price: 649, quantity: 1, variation: '1.5 kg' },
      { productId: 'prod-2', title: 'GimCat Superfood Yaş Kedi Maması 85gr', price: 49, quantity: 3, variation: 'Tekli Paket' }
    ],
    subtotal: 796,
    discount: 159.2, // 20% applied
    total: 636.8,
    status: 'Kargoya Verildi',
    date: '2026-06-18'
  },
  {
    id: 'order-2',
    trackingCode: 'PK-10293-ABC',
    customerName: 'Kaan Kaya',
    email: 'kaan@example.com',
    phone: '0532 987 6543',
    address: 'Çankaya Mh. Kennedy Cd. No:12 D:5 Çankaya / Ankara',
    items: [
      { productId: 'prod-3', title: 'Pro Plan Medium Puppy Tavuklu Yavru Köpek Maması', price: 899, quantity: 1, variation: '3 kg' }
    ],
    subtotal: 899,
    discount: 0,
    total: 899,
    status: 'Hazırlanıyor',
    date: '2026-06-19'
  }
];

// Initial Customer Reviews Showcase
const initialCustomerReviews: CustomerReview[] = [
  {
    id: 'rev-show-1',
    text: "10 kg'lık kızım için 4 beden aldım. Rengi çok tatlı. Kargo da hemen ve sorunsuz geldi. Tavsiye...",
    rating: 5,
    userName: "Ecesu Altın",
    productName: "Zuzu Signature Köpek Yağmurluğu"
  },
  {
    id: 'rev-show-2',
    text: "Bedeni tam oldu kumaşın kalitesi inanılmaz indirimden aldığım için fiyat çok iyi...",
    rating: 5,
    userName: "BETÜL BİLİR DİDİN",
    productName: "Zuzu Flow Köpek Hoodie"
  },
  {
    id: 'rev-show-3',
    text: "Bedenden kaynaklı düşük verdim kalite güzel ama diğer ürünle aynı beden almamıza...",
    rating: 3,
    userName: "BETÜL BİLİR DİDİN",
    productName: "Zuzu Cozy Köpek Polar Hırka"
  },
  {
    id: 'rev-show-4',
    text: "çok pratik ve tarz bir yağmurluk tüm arkadaşlarıma önerdim",
    rating: 5,
    userName: "nisan",
    productName: "Zuzu Active Köpek Tasması"
  },
  {
    id: 'rev-show-5',
    text: "Kumaşı kalınlığı çok iyi tam kışlık, tüyleri hiç rahatsız etmiyor.",
    rating: 5,
    userName: "Hakan U.",
    productName: "Zuzu Flow Köpek Hoodie"
  },
  {
    id: 'rev-show-6',
    text: "Köpeğim giyince çok rahat hareket ediyor, kalıpları gayet düzgün.",
    rating: 4,
    userName: "Ayşe T.",
    productName: "Zuzu Cozy Köpek Polar Hırka"
  }
];

const initialBrands: Brand[] = [
  { id: 'brand-1', name: 'N&D', slug: 'n-and-d' },
  { id: 'brand-2', name: 'GimCat', slug: 'gimcat' },
  { id: 'brand-3', name: 'Pro Plan', slug: 'pro-plan' },
  { id: 'brand-4', name: 'DeriSan', slug: 'derisan' },
  { id: 'brand-5', name: 'CleanPaws', slug: 'cleanpaws' },
  { id: 'brand-6', name: 'WoodyPet', slug: 'woodypet' },
  { id: 'brand-7', name: 'AquaClear', slug: 'aquaclear' },
  { id: 'brand-8', name: 'Hammy', slug: 'hammy' }
];

const initialNavbarLinks: NavbarLink[] = [
  { id: 'nav-1', title: 'Tüm Ürünler', url: '/shop', parentId: null, sortOrder: 1 },
  { id: 'nav-2', title: 'Kedi', url: '/shop?category=cat-1', parentId: null, sortOrder: 2 },
  { id: 'nav-2-1', title: 'Kuru Mama', url: '/shop?category=cat-1-1', parentId: 'nav-2', sortOrder: 1 },
  { id: 'nav-2-2', title: 'Yaş Mama', url: '/shop?category=cat-1-2', parentId: 'nav-2', sortOrder: 2 },
  { id: 'nav-2-3', title: 'Kedi Kumu', url: '/shop?category=cat-1-3', parentId: 'nav-2', sortOrder: 3 },
  { id: 'nav-3', title: 'Köpek', url: '/shop?category=cat-2', parentId: null, sortOrder: 3 },
  { id: 'nav-3-1', title: 'Kuru Mama', url: '/shop?category=cat-2-1', parentId: 'nav-3', sortOrder: 1 },
  { id: 'nav-3-2', title: 'Köpek Tasması', url: '/shop?category=cat-2-2', parentId: 'nav-3', sortOrder: 2 },
  { id: 'nav-3-3', title: 'Köpek Oyuncağı', url: '/shop?category=cat-2-3', parentId: 'nav-3', sortOrder: 3 },
  { id: 'nav-4', title: 'Kuş', url: '/shop?category=cat-3', parentId: null, sortOrder: 4 },
  { id: 'nav-5', title: 'Akvaryum', url: '/shop?category=cat-4', parentId: null, sortOrder: 5 },
  { id: 'nav-6', title: 'Kemirgen', url: '/shop?category=cat-5', parentId: null, sortOrder: 6 },
  { id: 'nav-7', title: 'Biz Kimiz?', url: '/about-us', parentId: null, sortOrder: 7 },
  { id: 'nav-8', title: 'Konumumuz', url: '/location', parentId: null, sortOrder: 8 }
];

const initialProductReviews: ProductReview[] = [
  { id: 'prev-1', productId: 'prod-1', customerName: 'Ahmet Y.', rating: 5, comment: 'Kedim bayılarak yiyor. Kesinlikle premium kalite.', date: '2026-06-10' },
  { id: 'prev-2', productId: 'prod-1', customerName: 'Selin K.', rating: 4, comment: 'Kargo biraz geç geldi ama mama çok kaliteli.', date: '2026-06-12' },
  { id: 'prev-3', productId: 'prod-2', customerName: 'Merve B.', rating: 5, comment: 'Sosunu çok sevdi, tabakta hiç bırakmıyor.', date: '2026-06-15' },
  { id: 'prev-4', productId: 'prod-3', customerName: 'Barış A.', rating: 5, comment: 'Yavru golden köpeğim için aldım, gelişimi çok iyi gidiyor.', date: '2026-06-08' },
  { id: 'prev-5', productId: 'prod-4', customerName: 'Zeynep H.', rating: 4, comment: 'Çok şık durdu ama biraz sert bir deri. Zamanla yumuşar umarım.', date: '2026-06-14' },
  { id: 'prev-6', productId: 'prod-6', customerName: 'Can P.', rating: 5, comment: 'Çok estetik ve kaliteli malzeme. Kuşum hemen alıştı.', date: '2026-06-11' }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);
  const [navbarLinks, setNavbarLinks] = useState<NavbarLink[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localstorage & Supabase on mount
  useEffect(() => {
    async function loadInitialData() {
      const localCategories = localStorage.getItem('pt_categories');
      const localOrders = localStorage.getItem('pt_orders');
      const localCoupons = localStorage.getItem('pt_coupons');
      const localCart = localStorage.getItem('pt_cart');
      const localWishlist = localStorage.getItem('pt_wishlist');
      const localReviews = localStorage.getItem('pt_customer_reviews');

      setCart(localCart ? JSON.parse(localCart) : []);
      setWishlist(localWishlist ? JSON.parse(localWishlist) : []);

      const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // Load products from Supabase
      let loadedProducts: Product[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            loadedProducts = data.map((dbProduct: any) => ({
              id: dbProduct.id,
              title: dbProduct.title,
              description: dbProduct.description || '',
              price: Number(dbProduct.price),
              originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
              image: dbProduct.image || '',
              categoryId: dbProduct.category_id || '',
              brand: dbProduct.brand || '',
              stock: Number(dbProduct.stock ?? 0),
              rating: Number(dbProduct.rating ?? 5),
              reviews: Array.isArray(dbProduct.reviews) ? dbProduct.reviews : [],
              variations: Array.isArray(dbProduct.variations) ? dbProduct.variations : [],
              metaTitle: dbProduct.meta_title || '',
              metaDescription: dbProduct.meta_description || '',
              metaKeywords: dbProduct.meta_keywords || ''
            }));
          } else {
            console.log("Supabase products table is empty. Seeding initial products...");
            const dbSeed = initialProducts.map(p => ({
              id: p.id,
              title: p.title,
              description: p.description,
              price: p.price,
              original_price: p.originalPrice || null,
              image: p.image,
              category_id: p.categoryId,
              brand: p.brand,
              stock: p.stock,
              rating: p.rating,
              reviews: p.reviews,
              variations: p.variations || [],
              meta_title: p.metaTitle || null,
              meta_description: p.metaDescription || null,
              meta_keywords: p.metaKeywords || null
            }));
            const { error: seedError } = await supabase.from('products').insert(dbSeed);
            if (seedError) console.error("Failed to seed Supabase products:", seedError);
            loadedProducts = initialProducts;
          }
        } catch (err) {
          console.error("Failed to load products from Supabase, falling back to LocalStorage:", err);
          const localProducts = localStorage.getItem('pt_products');
          loadedProducts = localProducts ? JSON.parse(localProducts) : initialProducts;
        }
      } else {
        const localProducts = localStorage.getItem('pt_products');
        loadedProducts = localProducts ? JSON.parse(localProducts) : initialProducts;
      }

      // Load coupons from Supabase
      let loadedCoupons: Coupon[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('coupons').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            loadedCoupons = data.map((dbCoupon: any) => ({
              code: dbCoupon.code,
              type: dbCoupon.type as 'percentage' | 'fixed',
              value: Number(dbCoupon.value),
              active: Boolean(dbCoupon.active),
              usageCount: Number(dbCoupon.usage_count ?? 0)
            }));
          } else {
            console.log("Supabase coupons table is empty. Seeding initial coupons...");
            const dbSeed = initialCoupons.map(c => ({
              code: c.code,
              type: c.type,
              value: c.value,
              active: c.active,
              usage_count: c.usageCount
            }));
            const { error: seedError } = await supabase.from('coupons').insert(dbSeed);
            if (seedError) console.error("Failed to seed Supabase coupons:", seedError);
            loadedCoupons = initialCoupons;
          }
        } catch (err) {
          console.error("Failed to load coupons from Supabase, falling back to LocalStorage:", err);
          loadedCoupons = localCoupons ? JSON.parse(localCoupons) : initialCoupons;
        }
      } else {
        loadedCoupons = localCoupons ? JSON.parse(localCoupons) : initialCoupons;
      }

      // Load categories from Supabase
      let loadedCategories: Category[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('categories').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            loadedCategories = data.map((c: any) => ({
              id: c.id,
              name: c.name,
              parentId: c.parent_id || null,
              slug: c.slug
            }));
          } else {
            console.log("Supabase categories table is empty. Seeding initial categories...");
            const dbSeed = initialCategories.map(c => ({
              id: c.id,
              name: c.name,
              parent_id: c.parentId || null,
              slug: c.slug
            }));
            const { error: seedError } = await supabase.from('categories').insert(dbSeed);
            if (seedError) console.error("Failed to seed Supabase categories:", seedError);
            loadedCategories = initialCategories;
          }
        } catch (err) {
          console.error("Failed to load categories from Supabase, falling back to LocalStorage:", err);
          loadedCategories = localCategories ? JSON.parse(localCategories) : initialCategories;
        }
      } else {
        loadedCategories = localCategories ? JSON.parse(localCategories) : initialCategories;
      }

      // Load orders from Supabase
      let loadedOrders: Order[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) {
            loadedOrders = data.map((o: any) => ({
              id: o.id,
              trackingCode: o.tracking_code,
              customerName: o.customer_name,
              email: o.email,
              phone: o.phone,
              address: o.address,
              items: Array.isArray(o.items) ? o.items : [],
              subtotal: Number(o.subtotal),
              discount: Number(o.discount),
              total: Number(o.total),
              status: o.status as any,
              date: o.date
            }));
          } else {
            console.log("Supabase orders table is empty. Seeding initial orders...");
            const dbSeed = initialOrders.map(o => ({
              id: o.id,
              tracking_code: o.trackingCode,
              customer_name: o.customerName,
              email: o.email,
              phone: o.phone,
              address: o.address,
              items: o.items,
              subtotal: o.subtotal,
              discount: o.discount,
              total: o.total,
              status: o.status,
              date: o.date
            }));
            const { error: seedError } = await supabase.from('orders').insert(dbSeed);
            if (seedError) console.error("Failed to seed Supabase orders:", seedError);
            loadedOrders = initialOrders;
          }
        } catch (err) {
          console.error("Failed to load orders from Supabase, falling back to LocalStorage:", err);
          loadedOrders = localOrders ? JSON.parse(localOrders) : initialOrders;
        }
      } else {
        loadedOrders = localOrders ? JSON.parse(localOrders) : initialOrders;
      }

      // Load customer reviews from Supabase
      let loadedCustomerReviews: CustomerReview[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('customer_reviews').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            loadedCustomerReviews = data.map((r: any) => ({
              id: r.id,
              text: r.text,
              rating: Number(r.rating),
              userName: r.user_name,
              productName: r.product_name,
              imageUrl: r.image_url || null
            }));
          } else {
            console.log("Supabase customer reviews table is empty. Seeding initial customer reviews...");
            const dbSeed = initialCustomerReviews.map(r => ({
              id: r.id,
              text: r.text,
              rating: r.rating,
              user_name: r.userName,
              product_name: r.productName,
              image_url: r.imageUrl || null
            }));
            const { error: seedError } = await supabase.from('customer_reviews').insert(dbSeed);
            if (seedError) console.error("Failed to seed Supabase customer reviews:", seedError);
            loadedCustomerReviews = initialCustomerReviews;
          }
        } catch (err) {
          console.error("Failed to load customer reviews from Supabase, falling back to LocalStorage:", err);
          loadedCustomerReviews = localReviews ? JSON.parse(localReviews) : initialCustomerReviews;
        }
      } else {
        loadedCustomerReviews = localReviews ? JSON.parse(localReviews) : initialCustomerReviews;
      }

      // Load navbar links from Supabase
      let loadedNavbarLinks: NavbarLink[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('navbar_links').select('*').order('sort_order', { ascending: true });
          if (error) throw error;
          if (data && data.length > 0) {
            loadedNavbarLinks = data.map((n: any) => ({
              id: n.id,
              title: n.title,
              url: n.url,
              parentId: n.parent_id || null,
              sortOrder: Number(n.sort_order ?? 0)
            }));
          } else {
            console.log("Supabase navbar_links table is empty. Seeding initial links...");
            const dbSeed = initialNavbarLinks.map(n => ({
              id: n.id,
              title: n.title,
              url: n.url,
              parent_id: n.parentId,
              sort_order: n.sortOrder
            }));
            const { error: seedError } = await supabase.from('navbar_links').insert(dbSeed);
            if (seedError) console.error("Failed to seed Supabase navbar links:", seedError);
            loadedNavbarLinks = initialNavbarLinks;
          }
        } catch (err) {
          console.error("Failed to load navbar links from Supabase, falling back to LocalStorage:", err);
          const localNavbar = localStorage.getItem('pt_navbar_links');
          loadedNavbarLinks = localNavbar ? JSON.parse(localNavbar) : initialNavbarLinks;
        }
      } else {
        const localNavbar = localStorage.getItem('pt_navbar_links');
        loadedNavbarLinks = localNavbar ? JSON.parse(localNavbar) : initialNavbarLinks;
      }

      // Load brands from Supabase
      let loadedBrands: Brand[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('brands').select('*');
          if (error) throw error;
          if (data && data.length > 0) {
            loadedBrands = data.map((b: any) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              logoUrl: b.logo_url || null
            }));
          } else {
            console.log("Supabase brands table is empty. Seeding initial brands...");
            const dbSeed = initialBrands.map(b => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              logo_url: b.logoUrl || null
            }));
            const { error: seedError } = await supabase.from('brands').insert(dbSeed);
            if (seedError) console.error("Failed to seed Supabase brands:", seedError);
            loadedBrands = initialBrands;
          }
        } catch (err) {
          console.error("Failed to load brands from Supabase, falling back to LocalStorage:", err);
          const localBrands = localStorage.getItem('pt_brands');
          loadedBrands = localBrands ? JSON.parse(localBrands) : initialBrands;
        }
      } else {
        const localBrands = localStorage.getItem('pt_brands');
        loadedBrands = localBrands ? JSON.parse(localBrands) : initialBrands;
      }

      // Load product reviews from Supabase
      let loadedProductReviews: ProductReview[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('product_reviews').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (data && data.length > 0) {
            loadedProductReviews = data.map((pr: any) => ({
              id: pr.id,
              productId: pr.product_id,
              customerName: pr.customer_name,
              rating: Number(pr.rating),
              comment: pr.comment,
              date: pr.date
            }));
          } else {
            console.log("Supabase product_reviews table is empty. Seeding initial product reviews...");
            const dbSeed = initialProductReviews.map(pr => ({
              id: pr.id,
              product_id: pr.productId,
              customer_name: pr.customerName,
              rating: pr.rating,
              comment: pr.comment,
              date: pr.date
            }));
            const { error: seedError } = await supabase.from('product_reviews').insert(dbSeed);
            if (seedError) console.error("Failed to seed Supabase product reviews:", seedError);
            loadedProductReviews = initialProductReviews;
          }
        } catch (err) {
          console.error("Failed to load product reviews from Supabase, falling back to LocalStorage:", err);
          const localProdReviews = localStorage.getItem('pt_product_reviews');
          loadedProductReviews = localProdReviews ? JSON.parse(localProdReviews) : initialProductReviews;
        }
      } else {
        const localProdReviews = localStorage.getItem('pt_product_reviews');
        loadedProductReviews = localProdReviews ? JSON.parse(localProdReviews) : initialProductReviews;
      }

      // Assign product reviews to their respective products for backward compatibility
      const productsWithReviews = loadedProducts.map(p => ({
        ...p,
        reviews: loadedProductReviews.filter(pr => pr.productId === p.id).map(pr => ({
          id: pr.id,
          customerName: pr.customerName,
          rating: pr.rating,
          comment: pr.comment,
          date: pr.date
        }))
      }));

      setProducts(productsWithReviews);
      setCoupons(loadedCoupons);
      setCategories(loadedCategories);
      setOrders(loadedOrders);
      setCustomerReviews(loadedCustomerReviews);
      setNavbarLinks(loadedNavbarLinks);
      setBrands(loadedBrands);
      setProductReviews(loadedProductReviews);
      setIsMounted(true);
    }

    loadInitialData();
  }, []);

  // Save changes to localStorage when state changes (as backup cache)
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_products', JSON.stringify(products));
  }, [products, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_categories', JSON.stringify(categories));
  }, [categories, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_orders', JSON.stringify(orders));
  }, [orders, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_coupons', JSON.stringify(coupons));
  }, [coupons, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_cart', JSON.stringify(cart));
  }, [cart, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_wishlist', JSON.stringify(wishlist));
  }, [wishlist, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_customer_reviews', JSON.stringify(customerReviews));
  }, [customerReviews, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_navbar_links', JSON.stringify(navbarLinks));
  }, [navbarLinks, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_brands', JSON.stringify(brands));
  }, [brands, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pt_product_reviews', JSON.stringify(productReviews));
  }, [productReviews, isMounted]);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variation?: string) => {
    playSound.playSuccess();
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.variation === variation
      );
      if (existingIdx > -1) {
        const newCart = [...prev];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      }
      return [...prev, { product, quantity, variation }];
    });
  };

  const removeFromCart = (productId: string, variation?: string) => {
    playSound.playDelete();
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.variation === variation)));
  };

  const updateCartQuantity = (productId: string, quantity: number, variation?: string) => {
    playSound.playClick();
    if (quantity <= 0) {
      removeFromCart(productId, variation);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variation === variation
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const addToWishlist = (product: Product) => {
    playSound.playPop();
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    playSound.playDelete();
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  // Admin CRUD for Products
  const addProduct = async (prodData: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      rating: 5,
      reviews: []
    };
    setProducts((prev) => [newProduct, ...prev]);

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('products').insert({
          id: newProduct.id,
          title: newProduct.title,
          description: newProduct.description,
          price: newProduct.price,
          original_price: newProduct.originalPrice || null,
          image: newProduct.image,
          category_id: newProduct.categoryId,
          brand: newProduct.brand,
          stock: newProduct.stock,
          rating: newProduct.rating,
          reviews: newProduct.reviews,
          variations: newProduct.variations || [],
          meta_title: newProduct.metaTitle || null,
          meta_description: newProduct.metaDescription || null,
          meta_keywords: newProduct.metaKeywords || null
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add product to Supabase:", err);
      }
    }
  };

  const updateProduct = async (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    // also update details inside the cart if it matches
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updatedProd.id ? { ...item, product: updatedProd } : item
      )
    );

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('products').update({
          title: updatedProd.title,
          description: updatedProd.description,
          price: updatedProd.price,
          original_price: updatedProd.originalPrice || null,
          image: updatedProd.image,
          category_id: updatedProd.categoryId,
          brand: updatedProd.brand,
          stock: updatedProd.stock,
          rating: updatedProd.rating,
          reviews: updatedProd.reviews,
          variations: updatedProd.variations || [],
          meta_title: updatedProd.metaTitle || null,
          meta_description: updatedProd.metaDescription || null,
          meta_keywords: updatedProd.metaKeywords || null
        }).eq('id', updatedProd.id);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update product in Supabase:", err);
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    removeFromCart(productId);
    removeFromWishlist(productId);

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete product from Supabase:", err);
      }
    }
  };

  // Admin CRUD for Categories
  const addCategory = async (catData: Omit<Category, 'id' | 'slug'>) => {
    const slug = catData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const newCategory: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      slug
    };
    setCategories((prev) => [...prev, newCategory]);

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('categories').insert({
          id: newCategory.id,
          name: newCategory.name,
          parent_id: newCategory.parentId || null,
          slug: newCategory.slug
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add category to Supabase:", err);
      }
    }
  };

  const updateCategory = async (updatedCat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('categories').update({
          name: updatedCat.name,
          parent_id: updatedCat.parentId || null,
          slug: updatedCat.slug
        }).eq('id', updatedCat.id);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update category in Supabase:", err);
      }
    }
  };

  const deleteCategory = async (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId && c.parentId !== categoryId));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', categoryId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete category from Supabase:", err);
      }
    }
  };

  // Admin CRUD for Coupons
  const addCoupon = async (coupon: Coupon) => {
    const uppercaseCode = coupon.code.toUpperCase().trim();
    setCoupons((prev) => {
      if (prev.some((c) => c.code.toUpperCase() === uppercaseCode)) return prev;
      return [...prev, { ...coupon, code: uppercaseCode }];
    });

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('coupons').insert({
          code: uppercaseCode,
          type: coupon.type,
          value: coupon.value,
          active: coupon.active,
          usage_count: coupon.usageCount || 0
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add coupon to Supabase:", err);
      }
    }
  };

  const updateCoupon = async (updatedCoupon: Coupon) => {
    const uppercaseCode = updatedCoupon.code.toUpperCase().trim();
    setCoupons((prev) =>
      prev.map((c) => (c.code.toUpperCase() === uppercaseCode ? { ...updatedCoupon, code: uppercaseCode } : c))
    );

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('coupons').update({
          type: updatedCoupon.type,
          value: updatedCoupon.value,
          active: updatedCoupon.active,
          usage_count: updatedCoupon.usageCount
        }).eq('code', uppercaseCode);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update coupon in Supabase:", err);
      }
    }
  };

  const deleteCoupon = async (code: string) => {
    const uppercaseCode = code.toUpperCase().trim();
    setCoupons((prev) => prev.filter((c) => c.code.toUpperCase() !== uppercaseCode));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('coupons').delete().eq('code', uppercaseCode);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete coupon from Supabase:", err);
      }
    }
  };

  // Order Flow
  const addOrder = (orderData: {
    customerName: string;
    email: string;
    phone: string;
    address: string;
    items: { productId: string; title: string; price: number; quantity: number; variation?: string }[];
    subtotal: number;
    discount: number;
    total: number;
  }) => {
    playSound.playSuccess();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingCode = `PK-${randomSuffix}-${new Date().getFullYear()}`;
    const newOrder: Order = {
      ...orderData,
      id: `order-${Date.now()}`,
      trackingCode,
      status: 'Hazırlanıyor',
      date: new Date().toISOString().split('T')[0]
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Reduce stock of products locally and in Supabase
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const orderItem = orderData.items.find((item) => item.productId === p.id);
        if (orderItem) {
          const newStock = Math.max(0, p.stock - orderItem.quantity);
          if (hasSupabase) {
            supabase.from('products').update({ stock: newStock }).eq('id', p.id).then(({ error }) => {
              if (error) console.error("Failed to update stock in Supabase:", error);
            });
          }
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    // Save order in Supabase
    if (hasSupabase) {
      supabase.from('orders').insert({
        id: newOrder.id,
        tracking_code: newOrder.trackingCode,
        customer_name: newOrder.customerName,
        email: newOrder.email,
        phone: newOrder.phone,
        address: newOrder.address,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount,
        total: newOrder.total,
        status: newOrder.status,
        date: newOrder.date
      }).then(({ error }) => {
        if (error) console.error("Failed to insert order in Supabase:", error);
      });
    }

    // Increment coupon usage count if a coupon was applied
    if (typeof window !== 'undefined') {
      const couponStr = sessionStorage.getItem('applied_coupon');
      if (couponStr) {
        try {
          const applied = JSON.parse(couponStr);
          if (applied && applied.code) {
            const codeUpper = applied.code.toUpperCase().trim();
            setCoupons((prevCoupons) =>
              prevCoupons.map((c) => {
                if (c.code.toUpperCase() === codeUpper) {
                  const newCount = (c.usageCount || 0) + 1;
                  if (hasSupabase) {
                    supabase.from('coupons').update({ usage_count: newCount }).eq('code', codeUpper).then(({ error }) => {
                      if (error) console.error("Failed to update coupon usage count in Supabase:", error);
                    });
                  }
                  return { ...c, usageCount: newCount };
                }
                return c;
              })
            );
          }
        } catch (e) {
          console.error("Failed to parse applied coupon from session storage:", e);
        }
      }
    }

    return trackingCode;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update order status in Supabase:", err);
      }
    }
  };

  // Customer Reviews Showcase CRUD
  const addCustomerReview = async (reviewData: Omit<CustomerReview, 'id'>) => {
    const newReview: CustomerReview = {
      ...reviewData,
      id: `rev-show-${Date.now()}`
    };
    setCustomerReviews((prev) => [newReview, ...prev]);

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('customer_reviews').insert({
          id: newReview.id,
          text: newReview.text,
          rating: newReview.rating,
          user_name: newReview.userName,
          product_name: newReview.productName,
          image_url: newReview.imageUrl || null
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add customer review to Supabase:", err);
      }
    }
  };

  const updateCustomerReview = async (updatedReview: CustomerReview) => {
    setCustomerReviews((prev) => prev.map((r) => (r.id === updatedReview.id ? updatedReview : r)));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('customer_reviews').update({
          text: updatedReview.text,
          rating: updatedReview.rating,
          user_name: updatedReview.userName,
          product_name: updatedReview.productName,
          image_url: updatedReview.imageUrl || null
        }).eq('id', updatedReview.id);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update customer review in Supabase:", err);
      }
    }
  };

  const deleteCustomerReview = async (reviewId: string) => {
    setCustomerReviews((prev) => prev.filter((r) => r.id !== reviewId));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('customer_reviews').delete().eq('id', reviewId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete customer review from Supabase:", err);
      }
    }
  };

  // Navbar Links CRUD
  const addNavbarLink = async (linkData: Omit<NavbarLink, 'id'>) => {
    const newLink: NavbarLink = {
      ...linkData,
      id: `nav-${Date.now()}`
    };
    setNavbarLinks((prev) => [...prev, newLink].sort((a, b) => a.sortOrder - b.sortOrder));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('navbar_links').insert({
          id: newLink.id,
          title: newLink.title,
          url: newLink.url,
          parent_id: newLink.parentId || null,
          sort_order: newLink.sortOrder
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add navbar link to Supabase:", err);
      }
    }
  };

  const updateNavbarLink = async (updatedLink: NavbarLink) => {
    setNavbarLinks((prev) => 
      prev.map((l) => l.id === updatedLink.id ? updatedLink : l).sort((a, b) => a.sortOrder - b.sortOrder)
    );

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('navbar_links').update({
          title: updatedLink.title,
          url: updatedLink.url,
          parent_id: updatedLink.parentId || null,
          sort_order: updatedLink.sortOrder
        }).eq('id', updatedLink.id);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update navbar link in Supabase:", err);
      }
    }
  };

  const deleteNavbarLink = async (linkId: string) => {
    setNavbarLinks((prev) => prev.filter((l) => l.id !== linkId && l.parentId !== linkId));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('navbar_links').delete().eq('id', linkId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete navbar link from Supabase:", err);
      }
    }
  };

  // Brands CRUD
  const addBrand = async (brandData: Omit<Brand, 'id'>) => {
    const newBrand: Brand = {
      ...brandData,
      id: `brand-${Date.now()}`
    };
    setBrands((prev) => [...prev, newBrand]);

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('brands').insert({
          id: newBrand.id,
          name: newBrand.name,
          slug: newBrand.slug,
          logo_url: newBrand.logoUrl || null
        });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to add brand to Supabase:", err);
      }
    }
  };

  const updateBrand = async (updatedBrand: Brand) => {
    setBrands((prev) => prev.map((b) => b.id === updatedBrand.id ? updatedBrand : b));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('brands').update({
          name: updatedBrand.name,
          slug: updatedBrand.slug,
          logo_url: updatedBrand.logoUrl || null
        }).eq('id', updatedBrand.id);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update brand in Supabase:", err);
      }
    }
  };

  const deleteBrand = async (brandId: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== brandId));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('brands').delete().eq('id', brandId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete brand from Supabase:", err);
      }
    }
  };

  // Product Reviews CRUD
  const addProductReview = async (reviewData: Omit<ProductReview, 'id' | 'date'>) => {
    const newReview: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Add to productReviews state
    setProductReviews((prev) => [newReview, ...prev]);

    // Recalculate product rating and update products state
    const product = products.find(p => p.id === reviewData.productId);
    if (product) {
      const currentReviews = productReviews.filter(pr => pr.productId === product.id);
      const nextReviews = [newReview, ...currentReviews];
      const totalRatingSum = nextReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Number((totalRatingSum / nextReviews.length).toFixed(1));

      const updatedProduct = {
        ...product,
        reviews: nextReviews.map(r => ({
          id: r.id,
          customerName: r.customerName,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        })),
        rating: averageRating
      };

      // Update locally
      setProducts((prev) => prev.map(p => p.id === product.id ? updatedProduct : p));

      // Update in Supabase
      const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (hasSupabase) {
        try {
          // 1. Insert review
          await supabase.from('product_reviews').insert({
            id: newReview.id,
            product_id: newReview.productId,
            customer_name: newReview.customerName,
            rating: newReview.rating,
            comment: newReview.comment,
            date: newReview.date
          });

          // 2. Update product rating
          await supabase.from('products').update({
            rating: averageRating
          }).eq('id', product.id);
        } catch (err) {
          console.error("Failed to add product review to Supabase:", err);
        }
      }
    }
  };

  const deleteProductReview = async (reviewId: string) => {
    setProductReviews((prev) => prev.filter((r) => r.id !== reviewId));

    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase.from('product_reviews').delete().eq('id', reviewId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to delete product review from Supabase:", err);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        categories,
        orders,
        coupons,
        cart,
        wishlist,
        customerReviews,
        navbarLinks,
        brands,
        productReviews,
        isMounted,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        addCustomerReview,
        updateCustomerReview,
        deleteCustomerReview,
        addNavbarLink,
        updateNavbarLink,
        deleteNavbarLink,
        addBrand,
        updateBrand,
        deleteBrand,
        addProductReview,
        deleteProductReview,
        addOrder,
        updateOrderStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

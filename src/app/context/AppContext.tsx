'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Order, Coupon, Review, ProductVariation } from '../types';
import { playSound } from '../utils/sound';

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localstorage on mount
  useEffect(() => {
    const localProducts = localStorage.getItem('pt_products');
    const localCategories = localStorage.getItem('pt_categories');
    const localOrders = localStorage.getItem('pt_orders');
    const localCoupons = localStorage.getItem('pt_coupons');
    const localCart = localStorage.getItem('pt_cart');
    const localWishlist = localStorage.getItem('pt_wishlist');

    setProducts(localProducts ? JSON.parse(localProducts) : initialProducts);
    setCategories(localCategories ? JSON.parse(localCategories) : initialCategories);
    setOrders(localOrders ? JSON.parse(localOrders) : initialOrders);
    setCoupons(localCoupons ? JSON.parse(localCoupons) : initialCoupons);
    setCart(localCart ? JSON.parse(localCart) : []);
    setWishlist(localWishlist ? JSON.parse(localWishlist) : []);
    
    setIsMounted(true);
  }, []);

  // Save changes to localStorage when state changes
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
  const addProduct = (prodData: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      rating: 5,
      reviews: []
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    // also update details inside the cart if it matches
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updatedProd.id ? { ...item, product: updatedProd } : item
      )
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    removeFromCart(productId);
    removeFromWishlist(productId);
  };

  // Admin CRUD for Categories
  const addCategory = (catData: Omit<Category, 'id' | 'slug'>) => {
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
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  };

  const deleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId && c.parentId !== categoryId));
  };

  // Admin CRUD for Coupons
  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => {
      if (prev.some((c) => c.code.toUpperCase() === coupon.code.toUpperCase())) return prev;
      return [...prev, { ...coupon, code: coupon.code.toUpperCase() }];
    });
  };

  const updateCoupon = (updatedCoupon: Coupon) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code.toUpperCase() === updatedCoupon.code.toUpperCase() ? updatedCoupon : c))
    );
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code.toUpperCase() !== code.toUpperCase()));
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

    // Reduce stock of products
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const orderItem = orderData.items.find((item) => item.productId === p.id);
        if (orderItem) {
          return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) };
        }
        return p;
      })
    );

    return trackingCode;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
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

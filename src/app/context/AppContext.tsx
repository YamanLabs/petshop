'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, Order, Coupon, Review, ProductVariation, CustomerReview, NavbarLink, Brand, ProductReview } from '../types';
import { playSound } from '../utils/sound';
import { supabase } from '../utils/supabase';
import ActionAuthModal from '../components/ActionAuthModal';

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
  requireActionAuth: (onSuccess: () => void) => void;
  settings: { [key: string]: string };
  updateSetting: (key: string, value: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const initialCategories: Category[] = [];
const initialCoupons: Coupon[] = [];
const initialProducts: Product[] = [];
const initialOrders: Order[] = [];
const initialCustomerReviews: CustomerReview[] = [];
const initialBrands: Brand[] = [];
const initialNavbarLinks: NavbarLink[] = [];
const initialProductReviews: ProductReview[] = [];

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
  const [settings, setSettings] = useState<{ [key: string]: string }>({
    customer_reviews_rating: '4.97',
    customer_reviews_count: '875',
    coupon_banner_visible: 'true',
    contact_address: 'İnönü mah. Hürriyet cad. No 236/A bornova, izmir',
    contact_phone: '+90 530 470 05 43',
    contact_email: 'destek@zuzupet.co',
    contact_hours: 'Hafta İçi & Hafta Sonu: 09:00 - 20:00',
    contact_map_iframe: 'https://maps.google.com/maps?q=Inonu%20Mahallesi%20Hurriyet%20Caddesi%20No%20236/A%20Bornova%20Izmir&t=&z=15&ie=UTF8&iwloc=&output=embed',
  });

  // Load from localstorage & Supabase on mount
  useEffect(() => {
    async function loadInitialData() {
      const localCategories = localStorage.getItem('pt_categories');
      // NOTE: pt_orders is intentionally NOT read from localStorage (PII risk - H-4)
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
          if (data) {
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
          if (data) {
            loadedCoupons = data.map((dbCoupon: any) => ({
              code: dbCoupon.code,
              type: dbCoupon.type as 'percentage' | 'fixed',
              value: Number(dbCoupon.value),
              active: Boolean(dbCoupon.active),
              usageCount: Number(dbCoupon.usage_count ?? 0)
            }));
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
          if (data) {
            loadedCategories = data.map((c: any) => ({
              id: c.id,
              name: c.name,
              parentId: c.parent_id || null,
              slug: c.slug,
              description: c.description || '',
              iconType: c.icon_type || 'svg',
              iconSvgPreset: c.icon_svg_preset || 'none',
              iconImageUrl: c.icon_image_url || '',
              isPromo: Boolean(c.is_promo)
            }));
          }
        } catch (err) {
          console.error("Failed to load categories from Supabase, falling back to LocalStorage:", err);
          loadedCategories = localCategories ? JSON.parse(localCategories) : initialCategories;
        }
      } else {
        loadedCategories = localCategories ? JSON.parse(localCategories) : initialCategories;
      }

      // Load settings from Supabase
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('admin_settings').select('*');
          if (!error && data) {
            setSettings((prev) => {
              const newSettings = { ...prev };
              data.forEach((row: any) => {
                newSettings[row.key] = row.value;
              });
              return newSettings;
            });
          }
        } catch (err) {
          console.error("Failed to load settings from Supabase:", err);
        }
      }

      // Load orders from Supabase
      let loadedOrders: Order[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (data) {
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
          }
        } catch (err) {
          console.error("Failed to load orders from Supabase:", err);
          loadedOrders = initialOrders; // No localStorage fallback for orders (PII risk - H-4)
        }
      } else {
        loadedOrders = initialOrders; // No localStorage fallback for orders (PII risk - H-4)
      }


      // Load customer reviews from Supabase
      let loadedCustomerReviews: CustomerReview[] = [];
      if (hasSupabase) {
        try {
          const { data, error } = await supabase.from('customer_reviews').select('*');
          if (error) throw error;
          if (data) {
            loadedCustomerReviews = data.map((r: any) => ({
              id: r.id,
              text: r.text,
              rating: Number(r.rating),
              userName: r.user_name,
              productName: r.product_name,
              imageUrl: r.image_url || null
            }));
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
          if (data) {
            loadedNavbarLinks = data.map((n: any) => ({
              id: n.id,
              title: n.title,
              url: n.url,
              parentId: n.parent_id || null,
              sortOrder: Number(n.sort_order ?? 0)
            }));
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
          if (data) {
            loadedBrands = data.map((b: any) => ({
              id: b.id,
              name: b.name,
              slug: b.slug,
              logoUrl: b.logo_url || null
            }));
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
          if (data) {
            loadedProductReviews = data.map((pr: any) => ({
              id: pr.id,
              productId: pr.product_id,
              customerName: pr.customer_name,
              rating: Number(pr.rating),
              comment: pr.comment,
              date: pr.date
            }));
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

  // NOTE: Orders are intentionally NOT cached in localStorage.
  // They contain PII (name, phone, address, email) and are persisted in Supabase.
  // Caching them in the browser would be a KVKK/GDPR risk. (H-4)


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
          slug: newCategory.slug,
          description: newCategory.description || '',
          icon_type: newCategory.iconType || 'svg',
          icon_svg_preset: newCategory.iconSvgPreset || 'none',
          icon_image_url: newCategory.iconImageUrl || '',
          is_promo: !!newCategory.isPromo
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
          slug: updatedCat.slug,
          description: updatedCat.description || '',
          icon_type: updatedCat.iconType || 'svg',
          icon_svg_preset: updatedCat.iconSvgPreset || 'none',
          icon_image_url: updatedCat.iconImageUrl || '',
          is_promo: !!updatedCat.isPromo
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

  const updateSetting = async (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      try {
        const { error } = await supabase
          .from('admin_settings')
          .upsert({ key, value });
        if (error) throw error;
      } catch (err) {
        console.error(`Failed to update setting ${key} in Supabase:`, err);
      }
    }
  };

  // Action Auth States
  const [isActionAuthModalOpen, setIsActionAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireActionAuth = (onSuccess: () => void) => {
    const savedTime = sessionStorage.getItem('last_action_auth_time');
    const lastAuth = savedTime ? Number(savedTime) : 0;
    
    if (Date.now() - lastAuth < 10 * 60 * 1000) {
      onSuccess();
    } else {
      setPendingAction(() => onSuccess);
      setIsActionAuthModalOpen(true);
    }
  };

  const handleActionAuthSuccess = () => {
    sessionStorage.setItem('last_action_auth_time', Date.now().toString());
    setIsActionAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
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
        updateOrderStatus,
        requireActionAuth,
        settings,
        updateSetting
      }}
    >
      {children}
      {isActionAuthModalOpen && (
        <ActionAuthModal
          onSuccess={handleActionAuthSuccess}
          onClose={() => setIsActionAuthModalOpen(false)}
        />
      )}
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

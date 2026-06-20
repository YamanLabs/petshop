'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  ShoppingBag, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  MessageCircle, 
  Send, 
  ChevronDown, 
  Menu, 
  PawPrint,
  CheckCircle2,
  Ticket,
  Package,
  Settings,
  Truck,
  Home,
  ChevronRight
} from 'lucide-react';
import { Category, Product } from '../types';
import { playSound } from '../utils/sound';
import Logo from '../components/Logo';

function ShopLayoutContent({ children }: { children: React.ReactNode }) {
  const { 
    products,
    cart, 
    wishlist, 
    categories, 
    removeFromCart, 
    updateCartQuantity, 
    addToCart, 
    removeFromWishlist,
    coupons,
    isMounted,
    navbarLinks,
    settings
  } = useApp();

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Cart / Wishlist Drawers and Mobile Menu States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // WhatsApp Widget States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([
    { sender: 'bot', text: 'Merhaba! Zuzu Pet Co. Destek hattına hoş geldiniz. Size nasıl yardımcı olabilirim?', time: 'Şimdi' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Coupon application state in cart
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percentage' | 'fixed'; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Sync search bar query with URL
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/shop');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    const code = couponCode.toUpperCase().trim();
    if (!code) return;

    const coupon = coupons.find(c => c.code.toUpperCase() === code);
    if (!coupon) {
      playSound.playDelete();
      setCouponError('Geçersiz indirim kuponu.');
      setAppliedCoupon(null);
      return;
    }
    if (!coupon.active) {
      playSound.playDelete();
      setCouponError('Bu kupon artık aktif değil.');
      setAppliedCoupon(null);
      return;
    }

    playSound.playNotice();
    setAppliedCoupon(coupon);
    setCouponSuccess(`"${coupon.code}" başarıyla uygulandı!`);
  };

  const cartSubtotal = cart.reduce((sum, item) => {
    const priceWithModifier = item.product.price + (
      item.variation && item.product.variations 
        ? (item.product.variations.find(v => v.name === item.variation)?.priceModifier || 0)
        : 0
    );
    return sum + (priceWithModifier * item.quantity);
  }, 0);

  const cartDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? cartSubtotal * (appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;

  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // WhatsApp chat send simulation
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    playSound.playClick();
    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg, time: 'Şimdi' }]);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      playSound.playNotice();
      setChatLog(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: 'Mesajınız uzman destek ekibimize iletildi. En kısa sürede size WhatsApp üzerinden geri dönüş yapacağız! Sevgiler.', 
          time: 'Şimdi' 
        }
      ]);
    }, 1200);
  };

  // Build root/nested navbar links
  const rootNavLinks = navbarLinks.filter(n => !n.parentId);
  const getSubLinks = (parentId: string) => navbarLinks.filter(n => n.parentId === parentId);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <PawPrint className="w-10 h-10 animate-bounce text-black" />
          <span className="text-zinc-500 text-sm font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
      {/* Top Banner */}
      <div className="bg-black text-white text-xs py-2 px-4 flex items-center justify-center gap-1.5 font-medium tracking-wide">
        <Truck className="w-3.5 h-3.5" /> 500 TL VE ÜZERİ SİPARİŞLERDE ÜCRETSİZ KARGO!
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo and Mobile Custom Links */}
            <div className="flex items-center gap-3 mr-auto lg:mr-0">
              <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                <Logo className="h-10 sm:h-12 w-auto" />
              </Link>
              
              {/* Mobile Top Nav Custom Links */}
              <div className="lg:hidden flex items-center gap-3 border-l border-zinc-200 pl-3 ml-1 select-none">
                <Link 
                  href="/about-us"
                  onClick={() => playSound.playClick()}
                  className="text-xs font-bold text-zinc-700 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                >
                  Biz Kimiz?
                </Link>
                <Link 
                  href="/location"
                  onClick={() => playSound.playClick()}
                  className="text-xs font-bold text-zinc-700 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                >
                  Konumumuz
                </Link>
              </div>
            </div>

            {/* Desktop Navbar Category Links */}
            <nav className="hidden lg:flex items-center space-x-6">
              {rootNavLinks.map(link => {
                const subs = getSubLinks(link.id);
                return (
                  <div key={link.id} className="relative group py-2">
                    <Link 
                      href={link.url}
                      className="flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-black transition-colors duration-200 cursor-pointer"
                    >
                      {link.title}
                      {subs.length > 0 && <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" />}
                    </Link>
                    {/* Hover Dropdown */}
                    {subs.length > 0 && (
                      <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-zinc-200 rounded-md shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        {subs.map(subLink => (
                          <Link
                            key={subLink.id}
                            href={subLink.url}
                            className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-black transition-colors cursor-pointer"
                          >
                            {subLink.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-sm relative">
              <input
                type="text"
                placeholder="Evcil hayvanınız için ürün arayın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-hidden focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-zinc-400 hover:text-black cursor-pointer">
                <Search className="w-4.5 h-4.5" />
              </button>
            </form>

            {/* Cart, Wishlist, Mobile menu toggles */}
            <div className="hidden lg:flex items-center gap-1.5 sm:gap-3">
              {/* Wishlist */}
              <button 
                onClick={() => { playSound.playClick(); setIsWishlistOpen(true); }}
                className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full relative transition-colors cursor-pointer"
                aria-label="Favorilerim"
              >
                <Heart className="w-5 sm:w-6 h-5 sm:h-6" />
                {wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button 
                onClick={() => { playSound.playClick(); setIsCartOpen(true); }}
                className="p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full relative transition-colors cursor-pointer"
                aria-label="Sepetim"
              >
                <ShoppingBag className="w-5 sm:w-6 h-5 sm:h-6" />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => { playSound.playClick(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
                className="lg:hidden p-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                <Menu className="w-5 sm:w-6 h-5 sm:h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-white py-4 px-4 shadow-inner space-y-4 animate-fadeIn">
            {/* Search for mobile */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Ürün arayın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-hidden focus:border-black"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-zinc-400 cursor-pointer">
                <Search className="w-4.5 h-4.5" />
              </button>
            </form>
            <nav className="flex flex-col space-y-2">
              {rootNavLinks.map(link => {
                const subs = getSubLinks(link.id);
                return (
                  <div key={link.id} className="space-y-1">
                    <Link
                      href={link.url}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm font-semibold py-2 px-3 bg-zinc-50/50 hover:bg-zinc-50 rounded-md flex items-center justify-between cursor-pointer animate-fadeIn"
                    >
                      {link.title}
                    </Link>
                    {subs.length > 0 && (
                      <div className="pl-6 flex flex-col space-y-1">
                        {subs.map(subLink => (
                          <Link
                            key={subLink.id}
                            href={subLink.url}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-xs font-medium py-1.5 px-3 text-zinc-600 hover:text-black block cursor-pointer"
                          >
                            {subLink.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pb-20 lg:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Logo className="h-10 w-auto" />
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Premium evcil hayvan malzemeleri markası. Kaliteli mama, aksesuar ve konfor sunan tasarımlarla can dostlarınızın yanındayız.
              </p>
              <div className="space-y-1.5 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-700">Telefon:</span>
                  <a href={`tel:${(settings?.contact_phone || '+90 530 470 05 43').replace(/\s+/g, '')}`} className="hover:text-black font-semibold">
                    {settings?.contact_phone || '+90 530 470 05 43'}
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-700">E-Posta:</span>
                  <a href={`mailto:${settings?.contact_email || 'destek@zuzupet.co'}`} className="hover:text-black font-semibold">
                    {settings?.contact_email || 'destek@zuzupet.co'}
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-700">Çalışma:</span>
                  <span>{settings?.contact_hours || 'Hafta İçi & Hafta Sonu: 09:00 - 20:00'}</span>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-zinc-900 tracking-wider uppercase mb-4">Hızlı Menü</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/shop" className="text-sm text-zinc-500 hover:text-black cursor-pointer">Tüm Ürünler</Link>
                </li>
                <li>
                  <Link href="/shop?category=cat-1" className="text-sm text-zinc-500 hover:text-black cursor-pointer">Kedi Ürünleri</Link>
                </li>
                <li>
                  <Link href="/shop?category=cat-2" className="text-sm text-zinc-500 hover:text-black cursor-pointer">Köpek Ürünleri</Link>
                </li>
                <li>
                  <Link href="/order-tracking" className="text-sm text-zinc-500 hover:text-black cursor-pointer">Sipariş Takibi</Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900 tracking-wider uppercase mb-4">Destek & Sözleşmeler</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-sm text-zinc-500 hover:text-black cursor-pointer">İade ve Değişim Koşulları</span>
                </li>
                <li>
                  <span className="text-sm text-zinc-500 hover:text-black cursor-pointer">Gizlilik Politikası</span>
                </li>
                <li>
                  <span className="text-sm text-zinc-500 hover:text-black cursor-pointer">Mesafeli Satış Sözleşmesi</span>
                </li>
                <li>
                  <Link href="/order-tracking" className="text-sm text-zinc-500 hover:text-black font-semibold cursor-pointer flex items-center gap-1">
                    Siparişimi Takip Et <Package className="w-3.5 h-3.5" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900 tracking-wider uppercase mb-4">Kabul Edilen Ödeme Yöntemleri</h3>
              <p className="text-xs text-zinc-500 mb-4">Kart bilgileriniz 256-bit SSL sertifikası ile tamamen güvendedir.</p>
              <div className="flex gap-2 opacity-60">
                <span className="text-xs font-mono border border-zinc-200 rounded-sm px-2 py-1 bg-zinc-50">VISA</span>
                <span className="text-xs font-mono border border-zinc-200 rounded-sm px-2 py-1 bg-zinc-50">MASTERCARD</span>
                <span className="text-xs font-mono border border-zinc-200 rounded-sm px-2 py-1 bg-zinc-50">TROY</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-150 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-400">
              © {new Date().getFullYear()} Zuzu Pet Co. Tüm Hakları Saklıdır.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 lg:inset-y-0 lg:right-0 lg:left-auto max-w-full flex">
            <div className="w-full lg:w-screen lg:max-w-md bg-white rounded-t-2xl lg:rounded-t-none shadow-2xl flex flex-col max-h-[85vh] lg:max-h-full h-[85vh] lg:h-full animate-slideUp lg:animate-slideLeft">
              {/* Drag Handle for Mobile Bottom Sheet */}
              <div className="lg:hidden flex justify-center py-2.5 bg-zinc-50 border-b border-zinc-150 rounded-t-2xl">
                <div className="w-12 h-1 bg-zinc-300 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-black" />
                  Alışveriş Sepetim
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-black cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <ShoppingBag className="w-12 h-12 text-zinc-300 stroke-[1.5]" />
                    <p className="text-zinc-500 font-medium">Sepetiniz henüz boş.</p>
                    <Link 
                      href="/shop" 
                      onClick={() => setIsCartOpen(false)}
                      className="text-xs font-bold underline text-black hover:opacity-85 cursor-pointer"
                    >
                      Alışverişe Başla
                    </Link>
                  </div>
                ) : (
                  cart.map((item, index) => {
                    const priceModifier = item.variation && item.product.variations
                      ? (item.product.variations.find(v => v.name === item.variation)?.priceModifier || 0)
                      : 0;
                    const finalItemPrice = item.product.price + priceModifier;

                    return (
                      <div key={`${item.product.id}-${item.variation || index}`} className="flex gap-4 border-b border-zinc-100 pb-4">
                        <div className="w-20 h-20 bg-zinc-900 rounded-md border border-zinc-200 flex flex-col items-center justify-center flex-shrink-0 gap-1 select-none">
                          <PawPrint className="w-5 h-5 text-white/50" />
                          <span className="text-[7px] font-bold text-white/50 tracking-wider">YOK</span>
                        </div>
                        <div className="flex-1">
                          <Link 
                            href={`/product/${item.product.id}`}
                            onClick={() => setIsCartOpen(false)}
                            className="font-bold text-sm text-zinc-900 hover:underline line-clamp-1 cursor-pointer"
                          >
                            {item.product.title}
                          </Link>
                          {item.variation && (
                            <p className="text-xs text-zinc-400 mt-0.5">Seçenek: {item.variation}</p>
                          )}
                          <div className="flex items-center justify-between mt-2.5">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-zinc-200 rounded-md">
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.variation)}
                                className="px-2.5 py-1 text-zinc-500 hover:text-black cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 py-0.5 text-xs font-semibold">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.variation)}
                                className="px-2.5 py-1 text-zinc-500 hover:text-black cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-black">{finalItemPrice * item.quantity} TL</span>
                              <button 
                                onClick={() => removeFromCart(item.product.id, item.variation)}
                                className="text-zinc-400 hover:text-black cursor-pointer"
                                title="Ürünü sepetten çıkar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Checkout Section */}
              {cart.length > 0 && (
                <div className="px-6 py-6 border-t border-zinc-100 bg-zinc-50 space-y-4">
                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder="İNDİRİM KODU"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-md py-2 px-3 text-xs font-semibold focus:outline-hidden focus:border-black uppercase tracking-wider"
                      />
                      <Ticket className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                    </div>
                    <button 
                      type="submit"
                      className="bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-md px-4 transition-colors cursor-pointer"
                    >
                      Uygula
                    </button>
                  </form>
                  {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
                  {couponSuccess && <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {couponSuccess}
                  </p>}

                  {/* Calculations */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Ara Toplam</span>
                      <span>{cartSubtotal.toFixed(2)} TL</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>İndirim ({appliedCoupon?.code})</span>
                        <span>-{cartDiscount.toFixed(2)} TL</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Kargo</span>
                      <span>{cartSubtotal >= 500 ? 'Ücretsiz' : '49.00 TL'}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-black border-t border-zinc-200/60 pt-2.5 mt-2">
                      <span>Genel Toplam</span>
                      <span>{(cartTotal + (cartSubtotal >= 500 ? 0 : 49)).toFixed(2)} TL</span>
                    </div>
                  </div>

                  <Link 
                    href="/checkout"
                    onClick={() => {
                      setIsCartOpen(false);
                      // pass coupon code to state or handle checkout query
                      if (appliedCoupon) {
                        sessionStorage.setItem('applied_coupon', JSON.stringify(appliedCoupon));
                      } else {
                        sessionStorage.removeItem('applied_coupon');
                      }
                    }}
                    className="w-full text-center block bg-black text-white font-bold py-3 px-4 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer text-sm"
                  >
                    Ödemeye Geç
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsWishlistOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 lg:inset-y-0 lg:right-0 lg:left-auto max-w-full flex">
            <div className="w-full lg:w-screen lg:max-w-md bg-white rounded-t-2xl lg:rounded-t-none shadow-2xl flex flex-col max-h-[85vh] lg:max-h-full h-[85vh] lg:h-full animate-slideUp lg:animate-slideLeft">
              {/* Drag Handle for Mobile Bottom Sheet */}
              <div className="lg:hidden flex justify-center py-2.5 bg-zinc-50 border-b border-zinc-150 rounded-t-2xl">
                <div className="w-12 h-1 bg-zinc-300 rounded-full" />
              </div>
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-black text-black" />
                  Favori Ürünlerim
                </h2>
                <button 
                  onClick={() => setIsWishlistOpen(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-black cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
                {wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <Heart className="w-12 h-12 text-zinc-300 stroke-[1.5]" />
                    <p className="text-zinc-500 font-medium">Favori listeniz henüz boş.</p>
                  </div>
                ) : (
                  wishlist.map((product) => (
                    <div key={product.id} className="flex gap-4 border-b border-zinc-100 pb-4">
                      <div className="w-16 h-16 bg-zinc-900 rounded-md border border-zinc-200 flex flex-col items-center justify-center flex-shrink-0 gap-1 select-none">
                        <PawPrint className="w-4 h-4 text-white/50" />
                        <span className="text-[6px] font-bold text-white/50 tracking-wider">YOK</span>
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/product/${product.id}`}
                          onClick={() => setIsWishlistOpen(false)}
                          className="font-bold text-sm text-zinc-900 hover:underline line-clamp-1 cursor-pointer"
                        >
                          {product.title}
                        </Link>
                        <p className="text-sm font-bold text-black mt-1">{product.price} TL</p>
                        
                        <div className="flex items-center justify-between mt-2.5">
                          <button
                            onClick={() => {
                              addToCart(product, 1);
                              setIsWishlistOpen(false);
                              setIsCartOpen(true);
                            }}
                            className="bg-black hover:bg-zinc-800 text-white text-xs font-bold py-1 px-3 rounded-sm transition-colors cursor-pointer"
                          >
                            Sepete Ekle
                          </button>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="text-xs text-zinc-400 hover:text-black flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Live Chat Widget */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-black text-white hover:bg-zinc-950 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center relative group"
            title="Canlı Destek"
          >
            <MessageCircle className="w-6 h-6 animate-pulse" />
            <span className="absolute right-full mr-3 bg-black text-white text-xs font-bold py-1 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:inline">
              Canlı Destek
            </span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
            {/* Chat Header */}
            <div className="bg-black text-white py-4 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-zinc-850 p-1.5 rounded-full relative">
                  <PawPrint className="w-4 h-4 text-white" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">Zuzu Canlı Destek</h4>
                  <p className="text-[10px] text-zinc-300">Uzman Ekibimiz Çevrimiçi</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Logs */}
            <div className="flex-1 h-60 overflow-y-auto p-4 bg-zinc-50 space-y-3 scroll-smooth">
              {chatLog.map((log, index) => (
                <div 
                  key={index}
                  className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                      log.sender === 'user' 
                        ? 'bg-black text-white rounded-br-none' 
                        : 'bg-white text-zinc-850 border border-zinc-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p>{log.text}</p>
                    <span className="block text-[8px] text-right mt-1 opacity-60">{log.time}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-zinc-200 rounded-lg rounded-bl-none p-3 text-xs text-zinc-500 shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-zinc-200 flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Mesajınızı yazın..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-1.5 text-xs focus:outline-hidden focus:border-black"
              />
              <button 
                type="submit"
                className="bg-black hover:bg-zinc-850 text-white p-2 rounded-md transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-[#faf8f6]/95 backdrop-blur-md border-t border-zinc-200 px-2 py-2 flex justify-around items-center shadow-lg pb-safe">
        {/* Home Tab */}
        <button
          onClick={() => {
            playSound.playClick();
            setIsMobileSearchOpen(false);
            setIsCartOpen(false);
            setIsWishlistOpen(false);
            router.push('/');
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors ${
            !isMobileSearchOpen && !isCartOpen && !isWishlistOpen ? 'text-[#2b221a]' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Anasayfa</span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => {
            playSound.playClick();
            setIsMobileSearchOpen(true);
            setIsCartOpen(false);
            setIsWishlistOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors ${
            isMobileSearchOpen ? 'text-[#2b221a]' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Arama</span>
        </button>

        {/* Favorites Tab */}
        <button
          onClick={() => {
            playSound.playClick();
            setIsWishlistOpen(true);
            setIsCartOpen(false);
            setIsMobileSearchOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors relative ${
            isWishlistOpen ? 'text-[#2b221a]' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Heart className="w-5 h-5" />
          {wishlist.length > 0 && (
            <span className="absolute top-0 right-2.5 bg-[#2b221a] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
              {wishlist.length}
            </span>
          )}
          <span className="text-[10px] font-bold tracking-tight">Favoriler</span>
        </button>

        {/* Cart Tab */}
        <button
          onClick={() => {
            playSound.playClick();
            setIsCartOpen(true);
            setIsWishlistOpen(false);
            setIsMobileSearchOpen(false);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer transition-colors relative ${
            isCartOpen ? 'text-[#2b221a]' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          {cart.length > 0 && (
            <span className="absolute top-0 right-2 bg-[#2b221a] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
          <span className="text-[10px] font-bold tracking-tight">Sepetim</span>
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#faf8f6] flex flex-col animate-fadeIn">
          {/* Search Header */}
          <div className="px-4 py-4 border-b border-zinc-200 flex items-center gap-3 bg-white">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                placeholder="Evcil dostunuz için ürün arayın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-hidden focus:border-[#2b221a] transition-all"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-2.5 text-zinc-400 hover:text-[#2b221a] cursor-pointer">
                <Search className="w-4.5 h-4.5" />
              </button>
            </form>
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs font-bold text-zinc-650 hover:text-[#2b221a] border border-zinc-200 rounded-md px-3 py-2 bg-zinc-50/50 cursor-pointer"
            >
              İptal
            </button>
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {searchQuery.trim() !== '' ? (
              /* Live Search Results */
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-zinc-200 pb-2">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-semibold">Arama Sonuçları</h3>
                  <span className="text-xs text-zinc-550 font-bold">
                    {
                      products.filter(p => 
                        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      ).length
                    } Ürün Bulundu
                  </span>
                </div>
                
                {(() => {
                  const results = products.filter(p => 
                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  );

                  if (results.length === 0) {
                    return (
                      <div className="py-12 text-center space-y-2 animate-fadeIn">
                        <p className="text-sm font-medium text-zinc-500">Aramanıza uygun ürün bulunamadı.</p>
                        <p className="text-xs text-zinc-400">Lütfen farklı kelimelerle tekrar deneyin.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4 animate-fadeIn">
                      {results.slice(0, 10).map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => setIsMobileSearchOpen(false)}
                          className="flex gap-4 p-3 bg-white border border-zinc-200 hover:border-black rounded-lg transition-colors cursor-pointer shadow-2xs"
                        >
                          <div className="w-16 h-16 bg-zinc-900 rounded-md border border-zinc-150 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                            {product.image ? (
                              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <PawPrint className="w-6 h-6 text-white/50" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-0.5">
                            <div>
                              <span className="text-[9px] text-[#c29f72] uppercase tracking-wider font-bold">{product.brand}</span>
                              <h4 className="font-bold text-xs text-zinc-900 line-clamp-1 mt-0.5">{product.title}</h4>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-1.5">
                              {product.originalPrice && (
                                <span className="text-zinc-400 text-[10px] line-through">{product.originalPrice} TL</span>
                              )}
                              <span className="text-xs font-bold text-black font-mono">{product.price} TL</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {results.length > 10 && (
                        <button
                          onClick={() => {
                            setIsMobileSearchOpen(false);
                            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                          }}
                          className="w-full text-center py-2.5 bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
                        >
                          Tüm Sonuçları Gör ({results.length})
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Suggestions (plain text style, no button boxes) */
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-semibold">Popüler Aramalar</h3>
                  <div className="flex flex-col">
                    {['Kedi Maması', 'Köpek Tasması', 'Premium Konserve', 'Kuş Kafesi', 'Kum Kabı'].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => {
                          setSearchQuery(kw);
                          setIsMobileSearchOpen(false);
                          router.push(`/shop?search=${encodeURIComponent(kw)}`);
                        }}
                        className="flex items-center gap-3 w-full text-left py-3 border-b border-zinc-200/60 text-sm font-semibold text-zinc-800 hover:text-black cursor-pointer transition-colors"
                      >
                        <Search className="w-4 h-4 text-zinc-400" />
                        <span>{kw}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-semibold">Kategorilere Göz Atın</h3>
                  <div className="flex flex-col">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setIsMobileSearchOpen(false);
                          router.push(`/shop?category=${cat.id}`);
                        }}
                        className="flex items-center justify-between w-full text-left py-3 border-b border-zinc-200/60 text-sm font-semibold text-zinc-800 hover:text-black cursor-pointer transition-colors"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-sm text-zinc-950">{cat.name}</span>
                          <span className="text-[10px] text-zinc-400 font-normal leading-normal">{cat.description}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <PawPrint className="w-10 h-10 animate-bounce text-black" />
          <span className="text-zinc-500 text-sm font-medium">Yükleniyor...</span>
        </div>
      </div>
    }>
      <ShopLayoutContent>{children}</ShopLayoutContent>
    </Suspense>
  );
}

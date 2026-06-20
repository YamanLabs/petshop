'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Headphones, 
  Sparkles,
  Heart,
  ShoppingBag,
  Star,
  Cat,
  Dog,
  Bird,
  Fish,
  Rabbit,
  PawPrint,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { playSound } from '../utils/sound';

export default function ShopHomePage() {
  const { products, addToCart, addToWishlist, wishlist } = useApp();

  // Pick first 4 products as featured items
  const featuredProducts = products.slice(0, 4);

  // Customer showcase / "Sizden Gelenler" data
  const customerReviews = [
    {
      id: 1,
      text: "10 kg'lık kızım için 4 beden aldım. Rengi çok tatlı. Kargo da hemen ve sorunsuz geldi. Tavsiye...",
      rating: 5,
      userName: "Ecesu Altın",
      productName: "Zuzu Signature Köpek Yağmurluğu"
    },
    {
      id: 2,
      text: "Bedeni tam oldu kumaşın kalitesi inanılmaz indirimden aldığım için fiyat çok iyi...",
      rating: 5,
      userName: "BETÜL BİLİR DİDİN",
      productName: "Zuzu Flow Köpek Hoodie"
    },
    {
      id: 3,
      text: "Bedenden kaynaklı düşük verdim kalite güzel ama diğer ürünle aynı beden almamıza...",
      rating: 3,
      userName: "BETÜL BİLİR DİDİN",
      productName: "Zuzu Cozy Köpek Polar Hırka"
    },
    {
      id: 4,
      text: "çok pratik ve tarz bir yağmurluk tüm arkadaşlarıma önerdim",
      rating: 5,
      userName: "nisan",
      productName: "Zuzu Active Köpek Tasması"
    },
    {
      id: 5,
      text: "Kumaşı kalınlığı çok iyi tam kışlık, tüyleri hiç rahatsız etmiyor.",
      rating: 5,
      userName: "Hakan U.",
      productName: "Zuzu Flow Köpek Hoodie"
    },
    {
      id: 6,
      text: "Köpeğim giyince çok rahat hareket ediyor, kalıpları gayet düzgün.",
      rating: 4,
      userName: "Ayşe T.",
      productName: "Zuzu Cozy Köpek Polar Hırka"
    }
  ];

  const reviewsScrollRef = useRef<HTMLDivElement>(null);

  const handlePrevReview = () => {
    playSound.playClick();
    if (reviewsScrollRef.current) {
      const containerWidth = reviewsScrollRef.current.clientWidth;
      // Scroll by 1 card width or client width depending on screen size
      reviewsScrollRef.current.scrollBy({ left: -containerWidth / 2, behavior: 'smooth' });
    }
  };

  const handleNextReview = () => {
    playSound.playClick();
    if (reviewsScrollRef.current) {
      const containerWidth = reviewsScrollRef.current.clientWidth;
      reviewsScrollRef.current.scrollBy({ left: containerWidth / 2, behavior: 'smooth' });
    }
  };

  // Quick categories list with icon details
  const promoCategories = [
    { id: 'cat-1', name: 'Kedi', icon: Cat, description: 'Mama, Kum & Oyuncaklar' },
    { id: 'cat-2', name: 'Köpek', icon: Dog, description: 'Tasma, Mama & Aksesuar' },
    { id: 'cat-3', name: 'Kuş', icon: Bird, description: 'Kafes, Yem & Salıncak' },
    { id: 'cat-4', name: 'Akvaryum', icon: Fish, description: 'Yem, Akvaryum & Filtre' },
    { id: 'cat-5', name: 'Kemirgen', icon: Rabbit, description: 'Tünel, Çark & Kafes' }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-zinc-950 text-white overflow-hidden py-24 sm:py-32">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-heading font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-white">
            Evcil Dostunuzun Hak Ettiği Premium Kalite
          </h1>
          <p className="text-zinc-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Seçkin markaların en taze mamaları, en sağlam tasmaları ve konforlu aksesuarları, özel fiyatlar ve hızlı teslimat avantajıyla kapınızda.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/shop" 
              className="w-full sm:w-auto bg-white text-black hover:bg-zinc-150 font-bold px-8 py-3.5 rounded-md flex items-center justify-center gap-2 text-sm transition-all duration-200 cursor-pointer shadow-md"
            >
              Alışverişe Başla
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/order-tracking"
              className="w-full sm:w-auto border border-white/30 text-white hover:bg-white/10 font-bold px-8 py-3.5 rounded-md text-sm transition-all duration-200 cursor-pointer text-center"
            >
              Siparişimi Takip Et
            </Link>
          </div>
        </div>
      </section>

      {/* Category Shortcut Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black">
            Dostunuza Özel Kategorileri Keşfedin
          </h2>
          <p className="text-sm text-zinc-500">Evcil hayvanınızın tüm temel ihtiyaçlarına hızlıca göz atın.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {promoCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link 
                key={cat.id} 
                href={`/shop?category=${cat.id}`}
                className="bg-white border border-zinc-200 hover:border-black rounded-lg p-6 text-center transition-all duration-250 cursor-pointer hover:shadow-md flex flex-col items-center justify-center group"
              >
                <IconComponent className="w-10 h-10 mb-3 text-zinc-800 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="font-bold text-base text-zinc-900 mb-1">{cat.name}</h3>
                <p className="text-[11px] text-zinc-400 leading-tight">{cat.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Coupon Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-black text-white rounded-xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg">
          <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800 rounded-full blur-3xl opacity-20 -mr-20 -mt-20" />
          <div className="space-y-3 relative z-10 text-center md:text-left">
            <span className="text-zinc-400 text-xs uppercase font-bold tracking-wider">
              Yeni Üyelere Özel Fırsat
            </span>
            <h3 className="text-2xl sm:text-4xl font-heading font-bold">İlk Siparişinizde %20 İndirim Kazanın!</h3>
            <p className="text-sm text-zinc-400 max-w-lg">
              Sepet adımında indirim kodu alanına <strong className="text-white">PATI20</strong> yazarak anında indirimden yararlanın.
            </p>
          </div>
          <div className="relative z-10 flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-lg p-5 text-center flex flex-col items-center w-full md:w-auto">
            <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-1">Kupon Kodu</span>
            <span className="text-2xl font-bold font-mono tracking-widest text-white border-2 border-dashed border-white/30 rounded-md px-6 py-2.5 bg-black">
              PATI20
            </span>
            <span className="text-[10px] text-zinc-500 mt-2">Son gün geçerlilik: Sınırsız</span>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 border-b border-zinc-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-black">Öne Çıkan Popüler Ürünler</h2>
            <p className="text-sm text-zinc-500">Müşterilerimizin en çok tercih ettiği, can dostlarımızın favorileri.</p>
          </div>
          <Link 
            href="/shop" 
            className="text-xs font-bold underline hover:opacity-80 flex items-center gap-1 group cursor-pointer text-black"
          >
            Tüm Ürünleri Gör
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const isFav = wishlist.some(item => item.id === product.id);
            return (
              <div 
                key={product.id}
                className="bg-white border border-zinc-200 hover:border-black rounded-lg overflow-hidden flex flex-col group relative transition-all duration-200"
              >
                {/* Wishlist Button */}
                <button
                  onClick={() => isFav ? null : addToWishlist(product)}
                  className={`absolute top-3 right-3 z-10 p-1.5 rounded-full shadow-xs border cursor-pointer transition-colors ${
                    isFav 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-zinc-400 hover:text-black border-zinc-150'
                  }`}
                  title={isFav ? 'Favorilerinizde' : 'Favorilere Ekle'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-white text-white' : ''}`} />
                </button>

                {/* Product Image Link */}
                <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden cursor-pointer border-b border-zinc-150">
                  <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-1.5 p-4 text-center group-hover:bg-zinc-800 transition-colors">
                    <PawPrint className="w-7 h-7 text-white/50" />
                    <span className="text-[9px] font-bold text-white/60 tracking-wider">GÖRSEL YOK</span>
                  </div>
                  {product.originalPrice && (
                    <span className="absolute bottom-3 left-3 bg-red-650 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      İndirim
                    </span>
                  )}
                  {product.stock <= 3 && (
                    <span className="absolute top-3 left-3 bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase">
                      Son {product.stock} Ürün!
                    </span>
                  )}
                </Link>

                {/* Info Container */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">{product.brand}</span>
                    <Link 
                      href={`/product/${product.id}`}
                      className="font-bold text-sm text-zinc-900 hover:underline line-clamp-2 leading-snug cursor-pointer block min-h-[40px]"
                    >
                      {product.title}
                    </Link>
                    
                    {/* Stars */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(product.rating) 
                                ? 'fill-amber-400' 
                                : 'text-zinc-200'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">({product.reviews.length || 0})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3 mt-auto">
                    <div>
                      {product.originalPrice && (
                        <span className="text-zinc-400 text-xs line-through block leading-none mb-0.5">
                          {product.originalPrice} TL
                        </span>
                      )}
                      <span className="text-base font-bold text-black font-mono">
                        {product.price} TL
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product, 1)}
                      className="bg-black hover:bg-zinc-800 text-white p-2 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* Sizden Gelenler Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Section Header */}
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-black uppercase tracking-wider">
            Sizden Gelenler
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            <div className="flex text-black">
              <Star className="w-4 h-4 fill-black text-black" />
              <Star className="w-4 h-4 fill-black text-black" />
              <Star className="w-4 h-4 fill-black text-black" />
              <Star className="w-4 h-4 fill-black text-black" />
              <Star className="w-4 h-4 fill-black text-black" />
            </div>
            <span className="text-xs text-zinc-605 font-bold">
              4.97 ★ (875)
            </span>
          </div>
        </div>

        {/* Carousel Slider Controls & Viewport */}
        <div className="relative flex items-center gap-2 sm:gap-4">
          {/* Left Arrow */}
          <button
            onClick={handlePrevReview}
            className="p-2 border border-zinc-200 rounded-full bg-white text-black hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs z-10 flex-shrink-0"
            aria-label="Önceki Yorumlar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Slider Cards Container */}
          <div 
            ref={reviewsScrollRef}
            className="flex-1 flex overflow-x-auto gap-6 snap-x snap-mandatory scroll-smooth no-scrollbar py-2"
          >
            {customerReviews.map((review) => {
              // Assign a pet icon based on index or ID
              const IconComponent = 
                review.id % 4 === 1 ? Dog :
                review.id % 4 === 2 ? Cat :
                review.id % 4 === 3 ? Rabbit : Bird;

              return (
                <div 
                  key={review.id}
                  className="w-full md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start bg-white border border-zinc-200 hover:border-black rounded-lg overflow-hidden flex flex-col transition-all duration-250 hover:shadow-md"
                >
                  {/* Premium Monochrome Customer Photo Placeholder */}
                  <div className="w-full aspect-square bg-zinc-900 flex flex-col items-center justify-center gap-1.5 p-4 text-center select-none border-b border-zinc-150">
                    <IconComponent className="w-8 h-8 text-white/50" />
                    <span className="text-[9px] font-bold text-white/40 tracking-wider">MÜŞTERİ GÖRSELİ</span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex flex-col items-center flex-grow justify-between text-center">
                    {/* Review text */}
                    <p className="text-xs text-zinc-700 font-medium italic line-clamp-3 min-h-[48px] mb-4 flex items-center justify-center leading-relaxed">
                      "{review.text}"
                    </p>

                    {/* Star Rating */}
                    <div className="flex gap-0.5 text-black mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < review.rating 
                              ? 'fill-black text-black' 
                              : 'text-zinc-200'
                          }`} 
                        />
                      ))}
                    </div>

                    {/* Verified Customer Info */}
                    <div className="w-full">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-black uppercase">
                        <span>{review.userName}</span>
                        <div className="bg-black text-white rounded-full p-0.5 flex items-center justify-center" title="Onaylı Alıcı">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-semibold block truncate mt-0.5 max-w-full">
                        {review.productName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNextReview}
            className="p-2 border border-zinc-200 rounded-full bg-white text-black hover:bg-zinc-50 cursor-pointer transition-colors shadow-xs z-10 flex-shrink-0"
            aria-label="Sonraki Yorumlar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Brand Value Propositions */}
      <section className="bg-white border-y border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-zinc-100 p-3 rounded-lg flex-shrink-0 text-black">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-zinc-900">Aynı Gün Hızlı Teslimat</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Saat 14:00\'e kadar verilen siparişleri aynı gün hazırlayıp kargoya veriyoruz. Can dostunuz beklemesin.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-zinc-100 p-3 rounded-lg flex-shrink-0 text-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-zinc-900">%100 Orijinal Ürün Garantisi</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Sitemizde satılan tüm mamalar, vitaminler ve aksesuarlar yetkili distribütörlerden tedarik edilen orijinal faturalı ürünlerdir.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-zinc-100 p-3 rounded-lg flex-shrink-0 text-black">
                <Headphones className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-zinc-900">7/24 Canlı WhatsApp Desteği</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Mama seçiminden sipariş takibine kadar her adımda WhatsApp hattımız üzerinden uzman ekibimizden destek alabilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

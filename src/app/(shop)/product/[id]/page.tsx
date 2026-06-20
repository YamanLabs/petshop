'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  PawPrint
} from 'lucide-react';
import { Review } from '../../../types';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products, addToCart, addToWishlist, wishlist, addProductReview } = useApp();

  const productId = params.id as string;
  const product = products.find(p => p.id === productId);

  // States
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [newReviewName, setNewReviewName] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Set default variation on load
  useEffect(() => {
    if (product?.variations && product.variations.length > 0) {
      setSelectedVariation(product.variations[0].name);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-black">Ürün Bulunamadı</h2>
        <p className="text-sm text-zinc-500">Aradığınız ürün mağazamızda mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/shop" className="btn-primary inline-block text-xs font-bold mt-4 cursor-pointer">
          Tüm Ürünlere Dön
        </Link>
      </div>
    );
  }

  // Calculate price based on selected variation
  const priceModifier = product.variations && selectedVariation
    ? (product.variations.find(v => v.name === selectedVariation)?.priceModifier || 0)
    : 0;
  const finalPrice = product.price + priceModifier;

  // Add review handler
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    addProductReview({
      productId: product.id,
      customerName: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim()
    });

    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const isFav = wishlist.some(item => item.id === product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back navigation */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-500 hover:text-black font-semibold text-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4.5 h-4.5" /> Geri Dön
      </button>

      {/* Main product box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Image */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden relative flex items-center justify-center">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-2 p-8 text-center min-h-[300px] sm:min-h-[400px]">
                <PawPrint className="w-12 h-12 text-white/50" />
                <span className="text-xs font-bold text-white/60 tracking-wider">GÖRSEL YOK</span>
              </div>
            )}
            {product.originalPrice && (
              <span className="absolute bottom-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                Kampanyalı
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Buy Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{product.brand}</span>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-black leading-tight">
              {product.title}
            </h1>

            {/* Stars & Reviews */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) 
                        ? 'fill-amber-400' 
                        : 'text-zinc-200'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-black">{product.rating} / 5</span>
              <span className="text-zinc-300">|</span>
              <span className="text-xs text-zinc-500 font-semibold">{product.reviews.length} Müşteri Yorumu</span>
            </div>
          </div>

          <hr className="border-zinc-200" />

          {/* Pricing Panel */}
          <div className="flex items-baseline gap-3">
            {product.originalPrice && (
              <span className="text-zinc-400 text-sm sm:text-base line-through font-mono">
                {product.originalPrice + priceModifier} TL
              </span>
            )}
            <span className="text-2xl sm:text-3xl font-extrabold text-black font-mono">
              {finalPrice} TL
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-zinc-650 leading-relaxed">
            {product.description}
          </p>

          {/* Variations Selector */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Paket Seçenekleri / Ölçüler:</span>
              <div className="flex flex-wrap gap-2.5">
                {product.variations.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariation(v.name)}
                    className={`px-4 py-2 border rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedVariation === v.name
                        ? 'border-black bg-black text-white'
                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    {v.name} {v.priceModifier > 0 ? `(+${v.priceModifier} TL)` : v.priceModifier < 0 ? `(${v.priceModifier} TL)` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Warnings */}
          <div className="space-y-2">
            {product.stock === 0 ? (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 flex items-center gap-2 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Bu ürünün stoğu geçici olarak tükenmiştir.</span>
              </div>
            ) : product.stock <= 3 ? (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-md p-3 flex items-center gap-2 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>Kritik Stok Uyarısı: Mağazamızda sadece son {product.stock} adet kaldı!</span>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-3 flex items-center gap-2 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Stokta Var (Aynı gün hızlı kargo)</span>
              </div>
            )}
          </div>

          {/* Cart & Wishlist Actions */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quantity Select */}
              <div className="flex items-center border border-zinc-200 rounded-md h-12 bg-white justify-between w-full sm:w-32">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 text-zinc-500 hover:text-black cursor-pointer font-bold"
                >
                  -
                </button>
                <span className="font-bold text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 text-zinc-500 hover:text-black cursor-pointer font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={() => addToCart(product, quantity, selectedVariation || undefined)}
                className="bg-black hover:bg-zinc-800 text-white font-bold h-12 px-8 rounded-md transition-colors cursor-pointer flex-1 flex items-center justify-center gap-2 text-sm shadow-md"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                Sepete Ekle
              </button>

              {/* Add to Wishlist */}
              <button
                onClick={() => isFav ? null : addToWishlist(product)}
                className={`h-12 w-12 border rounded-md flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${
                  isFav 
                    ? 'bg-black text-white border-black' 
                    : 'border-zinc-250 hover:border-black text-zinc-400 hover:text-black bg-white'
                }`}
                title={isFav ? 'Favorilerinizde' : 'Favorilere Ekle'}
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-white text-white' : ''}`} />
              </button>
            </div>
          )}

          {/* Value badging list */}
          <div className="grid grid-cols-3 gap-3 border-t border-zinc-200 pt-6">
            <div className="text-center space-y-1">
              <Truck className="w-5 h-5 mx-auto text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-900 block leading-tight">Hızlı Gönderi</span>
            </div>
            <div className="text-center space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-900 block leading-tight">Orijinal Ürün</span>
            </div>
            <div className="text-center space-y-1">
              <RotateCcw className="w-5 h-5 mx-auto text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-900 block leading-tight">Kolay İade</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table Section */}
      <section className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-black border-b border-zinc-150 pb-2">Teknik Özellikler</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-250 text-sm">
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="py-3 pr-4 font-bold text-zinc-500 w-1/4">Marka</td>
                <td className="py-3 px-4 text-zinc-800 font-semibold">{product.brand}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-zinc-500">Ürün Grubu</td>
                <td className="py-3 px-4 text-zinc-800">Premium Evcil Hayvan Malzemesi</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-zinc-500">Menşei Ülke</td>
                <td className="py-3 px-4 text-zinc-800">İtalya / Türkiye</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-zinc-500">Stok Adedi</td>
                <td className="py-3 px-4 text-zinc-800 font-mono font-semibold">{product.stock} adet mevcut</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Review list */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-lg font-bold text-black border-b border-zinc-150 pb-2">
            Müşteri Yorumları ({product.reviews.length})
          </h3>
          
          {product.reviews.length === 0 ? (
            <p className="text-zinc-500 text-sm font-medium py-4">Bu ürün için henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-zinc-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-zinc-900">{rev.customerName}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400' : 'text-zinc-200'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Review Form */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4">
          <h4 className="font-bold text-sm text-black">Değerlendirme Yazın</h4>
          {reviewSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-3 text-xs font-semibold">
              Yorumunuz başarıyla eklendi ve puan ortalaması güncellendi!
            </div>
          )}
          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Adınız Soyadınız</label>
              <input
                type="text"
                required
                placeholder="Örn: Mehmet Can"
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 block">Değerlendirme Puanı</label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className="text-amber-400 focus:outline-hidden cursor-pointer"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        star <= newReviewRating ? 'fill-amber-400' : 'text-zinc-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500">Yorumunuz</label>
              <textarea
                required
                rows={4}
                placeholder="Ürün hakkındaki görüşlerinizi yazın..."
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-md transition-colors cursor-pointer"
            >
              Gönder
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

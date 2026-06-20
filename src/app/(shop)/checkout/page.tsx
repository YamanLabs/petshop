'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CreditCard, 
  ShoppingBag, 
  ChevronRight, 
  CheckCircle,
  Truck,
  ArrowRight,
  ClipboardCheck,
  Clipboard,
  PawPrint
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, addOrder, clearCart, isMounted } = useApp();

  // Checkout inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Card inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Coupon read from session storage (applied in cart drawer)
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percentage' | 'fixed'; value: number } | null>(null);

  // States for flows
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const couponStr = sessionStorage.getItem('applied_coupon');
    if (couponStr) {
      setAppliedCoupon(JSON.parse(couponStr));
    }
  }, []);

  if (!isMounted) return null;

  const cartSubtotal = cart.reduce((sum, item) => {
    const priceModifier = item.variation && item.product.variations
      ? (item.product.variations.find(v => v.name === item.variation)?.priceModifier || 0)
      : 0;
    return sum + ((item.product.price + priceModifier) * item.quantity);
  }, 0);

  const cartDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? cartSubtotal * (appliedCoupon.value / 100)
      : appliedCoupon.value
    : 0;

  const shippingCost = cartSubtotal >= 500 ? 0 : 49;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount) + shippingCost;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      const orderItems = cart.map(item => {
        const pMod = item.variation && item.product.variations
          ? (item.product.variations.find(v => v.name === item.variation)?.priceModifier || 0)
          : 0;
        return {
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price + pMod,
          quantity: item.quantity,
          variation: item.variation
        };
      });

      const generatedCode = addOrder({
        customerName: name,
        email,
        phone,
        address,
        items: orderItems,
        subtotal: cartSubtotal,
        discount: cartDiscount,
        total: cartTotal
      });

      setTrackingCode(generatedCode);
      clearCart();
      sessionStorage.removeItem('applied_coupon');
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success view
  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-black">Siparişiniz Alındı!</h2>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
            Harika! Can dostunuz için hazırlıklara başlıyoruz. Sipariş detayları ve faturanız <strong>{email}</strong> adresinize gönderildi.
          </p>
        </div>

        {/* Tracking code container */}
        <div className="bg-zinc-100 border border-zinc-200 rounded-lg p-5 max-w-sm mx-auto space-y-2.5">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block">Sipariş Takip Kodu</span>
          <div className="flex items-center justify-center gap-2 bg-white border border-zinc-200 rounded-md py-2 px-3 shadow-xs">
            <span className="font-mono font-bold text-sm text-black select-all">{trackingCode}</span>
            <button 
              onClick={handleCopyCode}
              className="text-zinc-400 hover:text-black cursor-pointer"
              title="Kodu kopyala"
            >
              {copied ? <ClipboardCheck className="w-4.5 h-4.5 text-green-600" /> : <Clipboard className="w-4.5 h-4.5" />}
            </button>
          </div>
          {copied && <span className="text-[10px] text-green-600 font-semibold">Kod kopyalandı!</span>}
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3 max-w-sm mx-auto">
          <Link 
            href={`/order-tracking?code=${trackingCode}`}
            className="btn-primary w-full text-xs font-bold text-center block"
          >
            Siparişi Takip Et
          </Link>
          <Link 
            href="/shop"
            className="btn-secondary w-full text-xs font-bold text-center block"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/" className="hover:text-black">Anasayfa</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-black">Katalog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black font-semibold">Güvenli Ödeme</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Checkout Form */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-6">
          {/* Guest Shipping Details */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-black border-b border-zinc-100 pb-2">
              1. Teslimat ve Fatura Bilgileri (Misafir Alışverişi)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500">Adınız Soyadınız</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">E-Posta Adresiniz</label>
                <input
                  type="email"
                  required
                  placeholder="ahmet@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Telefon Numaranız</label>
                <input
                  type="tel"
                  required
                  placeholder="0555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500">Açık Adresiniz</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Mahalle, sokak, bina no, daire no ve ilçe/il belirtiniz..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black resize-none"
                />
              </div>
            </div>
          </div>

          {/* Simulated Payment */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-black border-b border-zinc-100 pb-2">
              2. Ödeme Bilgileri (Kart ile Güvenli Ödeme)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1 sm:col-span-3">
                <label className="text-xs font-bold text-zinc-500">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="space-y-1 sm:col-span-3 relative">
                <label className="text-xs font-bold text-zinc-500">Kart Numarası</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 pl-10 text-xs focus:outline-hidden focus:border-black"
                  />
                  <CreditCard className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500">Son Kullanma Tarihi</label>
                <input
                  type="text"
                  required
                  placeholder="AA/YY"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black text-center"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500">Güvenlik Kodu (CVC)</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  maxLength={3}
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black text-center"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className={`w-full font-bold h-12 rounded-md transition-colors flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer ${
              loading 
                ? 'bg-zinc-800 text-zinc-300 cursor-not-allowed'
                : 'bg-black hover:bg-zinc-800 text-white'
            }`}
          >
            {loading ? 'Siparişiniz İşleniyor...' : `${cartTotal.toFixed(2)} TL Öde ve Tamamla`}
          </button>
        </form>

        {/* Order Recap Panel */}
        <aside className="lg:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-6 shadow-xs sticky top-24">
          <h3 className="text-base font-bold text-black border-b border-zinc-150 pb-2 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            Sipariş Özeti
          </h3>

          <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-zinc-400 font-semibold">Sepetinizde ürün bulunmuyor.</p>
                <Link href="/shop" className="text-xs font-bold underline mt-2 block text-black">Mağazaya Git</Link>
              </div>
            ) : (
              cart.map((item, index) => {
                const modifier = item.variation && item.product.variations
                  ? (item.product.variations.find(v => v.name === item.variation)?.priceModifier || 0)
                  : 0;
                const finalItemPrice = item.product.price + modifier;

                return (
                  <div key={index} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="w-12 h-12 bg-zinc-900 rounded-md border border-zinc-200 flex flex-col items-center justify-center flex-shrink-0 gap-0.5 select-none">
                      <PawPrint className="w-4 h-4 text-white/50" />
                      <span className="text-[5px] font-bold text-white/50 tracking-wider">YOK</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-xs text-zinc-900 line-clamp-1 leading-snug">{item.product.title}</h4>
                      {item.variation && <p className="text-[10px] text-zinc-400 mt-0.5">Seçenek: {item.variation}</p>}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-zinc-500 font-semibold">Adet: {item.quantity}</span>
                        <span className="text-xs font-bold text-black font-mono">{finalItemPrice * item.quantity} TL</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-zinc-100 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-zinc-500 font-semibold">
              <span>Ara Toplam</span>
              <span className="font-mono">{cartSubtotal.toFixed(2)} TL</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-bold">
                <span>İndirim ({appliedCoupon?.code})</span>
                <span className="font-mono">-{cartDiscount.toFixed(2)} TL</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-zinc-500 font-semibold">
              <span>Kargo</span>
              <span>{shippingCost === 0 ? 'Ücretsiz' : '49.00 TL'}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-black border-t border-zinc-200/60 pt-3 mt-3">
              <span>Toplam Tutar</span>
              <span className="font-mono text-base">{cartTotal.toFixed(2)} TL</span>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-150 rounded-md p-3 flex gap-2 text-[10px] text-zinc-500 leading-normal">
            <Truck className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>Siparişleriniz 24 saat içinde kargoya verilir ve takip kodunuz SMS ile gönderilir.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Link from 'next/link';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  MapPin, 
  Calendar,
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const { orders } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [searchedCode, setSearchedCode] = useState('');

  // Auto-search if code is present in URL
  useEffect(() => {
    const code = searchParams.get('code') || '';
    if (code) {
      setInputCode(code);
      setSearchedCode(code.trim().toUpperCase());
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedCode(inputCode.trim().toUpperCase());
  };

  // Find order in state
  const order = orders.find(
    o => o.trackingCode.toUpperCase() === searchedCode || o.id.toUpperCase() === searchedCode
  );

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Hazırlanıyor':
        return 1;
      case 'Kargoya Verildi':
        return 2;
      case 'Teslim Edildi':
        return 3;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Sipariş Alındı', icon: ClipboardList, desc: 'Siparişiniz sistemimize kaydedildi.' },
    { title: 'Hazırlanıyor', icon: Package, desc: 'Ürünleriniz özenle paketleniyor.' },
    { title: 'Kargoya Verildi', icon: Truck, desc: 'Paketiniz kargo firmasına teslim edildi.' },
    { title: 'Teslim Edildi', icon: CheckCircle, desc: 'Siparişiniz size ulaştırıldı.' }
  ];

  const currentStep = order ? getStatusStep(order.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Search Header */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <h1 className="text-3xl font-heading font-extrabold text-black">Sipariş Takibi</h1>
        <p className="text-sm text-zinc-500">
          Siparişinizin durumunu öğrenmek için size verilen <strong className="text-black font-semibold">PK-XXXXX-YYYY</strong> formatındaki takip kodunu girin.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto pt-2">
          <input
            type="text"
            required
            placeholder="PK-12345-XYZ"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="flex-1 bg-white border border-zinc-200 rounded-md py-2.5 px-4 text-xs font-semibold uppercase tracking-wider focus:outline-hidden focus:border-black"
          />
          <button
            type="submit"
            className="bg-black hover:bg-zinc-800 text-white text-xs font-bold py-2.5 px-5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            Sorgula
          </button>
        </form>
      </div>

      {searchedCode && (
        <div className="animate-fadeIn">
          {!order ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center space-y-3 max-w-md mx-auto">
              <div className="bg-red-50 text-red-700 w-10 h-10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-black">Sipariş Bulunamadı</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Girdiğiniz <strong>{searchedCode}</strong> kodlu sipariş bulunamadı. Lütfen kodu kontrol edip tekrar deneyin.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stepper Status Box */}
              <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 pb-4">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Takip Kodu: {order.trackingCode}</span>
                    <h3 className="font-bold text-base text-black mt-0.5">Alıcı: {order.customerName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Sipariş Tarihi</span>
                    <span className="text-xs text-zinc-700 font-semibold flex items-center gap-1 mt-0.5 justify-end">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.date}
                    </span>
                  </div>
                </div>

                {/* Progress Line */}
                <div className="relative">
                  {/* Background line */}
                  <div className="absolute top-5 left-8 right-8 h-1 bg-zinc-200 -z-10 hidden sm:block" />
                  {/* Filled line */}
                  <div 
                    className="absolute top-5 left-8 h-1 bg-black -z-10 transition-all duration-500 hidden sm:block" 
                    style={{ width: `${(currentStep / (steps.length - 1)) * 90}%` }}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4">
                    {steps.map((step, idx) => {
                      const Icon = step.icon;
                      const isActive = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2 text-center relative z-10">
                          {/* Circle Icon */}
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
                              isActive 
                                ? 'bg-black text-white border-black' 
                                : 'bg-white text-zinc-400 border-zinc-200'
                            } ${isCurrent ? 'ring-4 ring-zinc-200 scale-105' : ''}`}
                          >
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          
                          {/* Text */}
                          <div className="text-left sm:text-center space-y-0.5 flex-1 sm:flex-initial">
                            <h4 className={`font-bold text-xs ${isActive ? 'text-black' : 'text-zinc-400'}`}>
                              {step.title}
                            </h4>
                            <p className="text-[10px] text-zinc-450 leading-tight hidden sm:block">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Items & Shipping Address */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Items */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 md:col-span-7 space-y-4 shadow-xs">
                  <h4 className="font-bold text-sm text-black border-b border-zinc-100 pb-2">Sipariş İçeriği</h4>
                  <div className="divide-y divide-zinc-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="flex-1">
                          <h5 className="font-bold text-xs text-zinc-900 leading-snug">{item.title}</h5>
                          {item.variation && <p className="text-[9px] text-zinc-400 mt-0.5">Seçenek: {item.variation}</p>}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-zinc-500 font-semibold">Adet: {item.quantity}</span>
                            <span className="text-xs font-bold text-black font-mono">{item.price * item.quantity} TL</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-100 pt-3 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-semibold">Toplam Tutar</span>
                    <span className="font-bold text-sm text-black font-mono">{order.total.toFixed(2)} TL</span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 md:col-span-5 space-y-4 shadow-xs">
                  <h4 className="font-bold text-sm text-black border-b border-zinc-100 pb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    Teslimat Adresi
                  </h4>
                  <div className="space-y-3 text-xs leading-relaxed text-zinc-700">
                    <div>
                      <span className="font-bold text-zinc-450 block text-[10px] uppercase">Alıcı Telefon</span>
                      <span className="font-semibold">{order.phone}</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-450 block text-[10px] uppercase">Adres</span>
                      <span>{order.address}</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-450 block text-[10px] uppercase">Kargo Firması</span>
                      <span className="font-semibold">Zuzu Express</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center bg-zinc-50">
        <span className="text-zinc-500 text-sm font-semibold">Yükleniyor...</span>
      </div>
    }>
      <OrderTrackingContent />
    </Suspense>
  );
}

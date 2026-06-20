'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Tag, 
  X, 
  CheckCircle, 
  XCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Coupon } from '../../../types';

export default function AdminCouponsPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useApp();

  // Add Coupon form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const formattedCode = code.toUpperCase().trim();
    if (!formattedCode) return;

    if (coupons.some(c => c.code.toUpperCase() === formattedCode)) {
      setErrorMsg('Bu kupon kodu zaten mevcut.');
      return;
    }

    addCoupon({
      code: formattedCode,
      type,
      value: Number(value),
      active: true,
      usageCount: 0
    });

    setCode('');
    setValue('');
    setIsAdding(false);
  };

  const handleToggleActive = (coupon: Coupon) => {
    updateCoupon({
      ...coupon,
      active: !coupon.active
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-black">Kupon Yönetimi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Müşterilerinizin ödeme adımında kullanabileceği özel indirim kuponlarını tanımlayın.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-1.5 text-xs font-bold w-full sm:w-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Yeni Kupon Tanımla
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of coupons */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-black">Aktif ve Pasif Kupon Kodları</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-xs">
              <thead>
                <tr className="text-left text-zinc-400 uppercase tracking-widest font-bold border-b border-zinc-200">
                  <th className="py-3 pr-3">Kupon Kodu</th>
                  <th className="py-3 px-3">İndirim Türü</th>
                  <th className="py-3 px-3">Değer</th>
                  <th className="py-3 px-3 text-center">Kullanım Sayısı</th>
                  <th className="py-3 px-3 text-center">Durum</th>
                  <th className="py-3 pl-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 pr-3 font-mono font-bold text-black select-all tracking-wider">{coupon.code}</td>
                    <td className="py-4 px-3 text-zinc-500 font-semibold">
                      {coupon.type === 'percentage' ? 'Yüzdelik (%)' : 'Sabit Tutar (TL)'}
                    </td>
                    <td className="py-4 px-3 font-bold font-mono text-black">
                      {coupon.type === 'percentage' ? `%${coupon.value}` : `${coupon.value} TL`}
                    </td>
                    <td className="py-4 px-3 text-center font-bold text-zinc-600 font-mono">{coupon.usageCount} kez</td>
                    <td className="py-4 px-3 text-center">
                      <button 
                        onClick={() => handleToggleActive(coupon)}
                        className="cursor-pointer"
                        title={coupon.active ? 'Pasifleştir' : 'Aktifleştir'}
                      >
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          coupon.active 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                        }`}>
                          {coupon.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </button>
                    </td>
                    <td className="py-4 pl-3 text-right space-x-2.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className="text-zinc-400 hover:text-black cursor-pointer inline-flex items-center"
                        title={coupon.active ? 'Pasif Yap' : 'Aktif Yap'}
                      >
                        {coupon.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 text-zinc-300" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${coupon.code}" kuponunu silmek istediğinize emin misiniz?`)) {
                            deleteCoupon(coupon.code);
                          }
                        }}
                        className="text-zinc-400 hover:text-red-650 cursor-pointer inline-flex items-center"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side form */}
        <div className="lg:col-span-4 space-y-6">
          {isAdding && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="font-bold text-xs text-black uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-4 h-4 text-zinc-500" />
                  Yeni İndirim Kuponu
                </h4>
                <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-black cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}

              <form onSubmit={handleAddCouponSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Kupon Kodu</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: YAZ15, CAN200"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black uppercase font-mono font-bold tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 uppercase block">İndirim Tipi</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black cursor-pointer font-semibold"
                    >
                      <option value="percentage">Yüzdelik (%)</option>
                      <option value="fixed">Sabit (TL)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 uppercase block">İndirim Tutarı / Oranı</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder={type === 'percentage' ? '20' : '50'}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="btn-secondary text-[10px] font-bold py-1.5 px-3 rounded-md"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-[10px] font-bold py-1.5 px-4 rounded-md"
                  >
                    Kuponu Kaydet
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick tips list */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 text-xs leading-relaxed text-zinc-500 shadow-xs">
            <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Kupon Kullanım Kuralları</h4>
            <p>
              • <strong>Yüzdelik:</strong> Sepet ara toplamından girilen yüzde kadar indirim yapar (Örn: %20).
            </p>
            <p>
              • <strong>Sabit Tutar:</strong> Sepet ara toplamından girilen miktar kadar indirim yapar (Örn: 50 TL).
            </p>
            <p>
              • Pasif durumdaki kupon kodları ödeme sayfasında uygulanamaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  MessageSquare, 
  X, 
  Star 
} from 'lucide-react';
import { CustomerReview } from '../../../types';

export default function AdminReviewsPage() {
  const { customerReviews, addCustomerReview, updateCustomerReview, deleteCustomerReview } = useApp();

  // Form states
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState('');
  const [userName, setUserName] = useState('');
  const [productName, setProductName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setFormMode('add');
    setEditingId('');
    setUserName('');
    setProductName('');
    setRating(5);
    setText('');
    setErrorMsg('');
  };

  const handleOpenEdit = (review: CustomerReview) => {
    setFormMode('edit');
    setEditingId(review.id);
    setUserName(review.userName);
    setProductName(review.productName);
    setRating(review.rating);
    setText(review.text);
    setErrorMsg('');
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setEditingId('');
    setUserName('');
    setProductName('');
    setRating(5);
    setText('');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userName.trim() || !productName.trim() || !text.trim()) {
      setErrorMsg('Lütfen tüm alanları doldurun.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setErrorMsg('Değerlendirme puanı 1 ile 5 arasında olmalıdır.');
      return;
    }

    if (formMode === 'add') {
      addCustomerReview({
        userName: userName.trim(),
        productName: productName.trim(),
        rating,
        text: text.trim()
      });
    } else if (formMode === 'edit') {
      updateCustomerReview({
        id: editingId,
        userName: userName.trim(),
        productName: productName.trim(),
        rating,
        text: text.trim()
      });
    }

    handleCloseForm();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-black">Sizden Gelenler Yönetimi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Anasayfada yer alan "Sizden Gelenler" müşteri yorumlarını ve ürün değerlendirmelerini yönetin.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-1.5 text-xs font-bold w-full sm:w-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Yeni Yorum Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of reviews */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-black">Yayındaki Müşteri Değerlendirmeleri ({customerReviews.length})</h3>
          
          {customerReviews.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-xl space-y-2">
              <MessageSquare className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-sm font-semibold text-zinc-500">Henüz müşteri yorumu bulunmuyor.</p>
              <button onClick={handleOpenAdd} className="text-xs font-bold underline hover:opacity-85 text-black">
                İlk yorumu ekleyin
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-xs">
                <thead>
                  <tr className="text-left text-zinc-400 uppercase tracking-widest font-bold border-b border-zinc-200">
                    <th className="py-3 pr-3">Müşteri</th>
                    <th className="py-3 px-3">Değerlendirilen Ürün</th>
                    <th className="py-3 px-3">Yorum Detayı</th>
                    <th className="py-3 px-3 text-center">Puan</th>
                    <th className="py-3 pl-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {customerReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-4 pr-3 font-bold text-black whitespace-nowrap">{review.userName}</td>
                      <td className="py-4 px-3 text-zinc-500 font-semibold max-w-[150px] truncate" title={review.productName}>
                        {review.productName}
                      </td>
                      <td className="py-4 px-3 text-zinc-650 max-w-[240px] truncate" title={review.text}>
                        "{review.text}"
                      </td>
                      <td className="py-4 px-3 text-center">
                        <div className="flex items-center justify-center gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < review.rating 
                                  ? 'fill-amber-500 text-amber-500' 
                                  : 'text-zinc-200'
                              }`} 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 pl-3 text-right space-x-2.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(review)}
                          className="text-zinc-400 hover:text-black cursor-pointer inline-flex items-center"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${review.userName}" isimli kullanıcının yorumunu silmek istediğinize emin misiniz?`)) {
                              deleteCustomerReview(review.id);
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
          )}
        </div>

        {/* Right Side Form Panel */}
        <div className="lg:col-span-4 space-y-6">
          {formMode && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="font-bold text-xs text-black uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-zinc-500" />
                  {formMode === 'add' ? 'Yeni Yorum Ekle' : 'Yorum Düzenle'}
                </h4>
                <button onClick={handleCloseForm} className="text-zinc-400 hover:text-black cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Müşteri Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ecesu Altın"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Ürün Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Zuzu Signature Köpek Yağmurluğu"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Değerlendirme Puanı</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-zinc-200 hover:text-amber-500 cursor-pointer transition-colors"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= rating 
                              ? 'fill-amber-500 text-amber-500' 
                              : 'text-zinc-200'
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs text-zinc-500 font-bold ml-2">({rating} / 5)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Yorum Detayı</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Müşterinin yorumunu yazın..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black leading-relaxed"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="btn-secondary text-[10px] font-bold py-1.5 px-3 rounded-md"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-[10px] font-bold py-1.5 px-4 rounded-md"
                  >
                    {formMode === 'add' ? 'Yorumu Kaydet' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 text-xs leading-relaxed text-zinc-500 shadow-xs">
            <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Yorum Yönetim Rehberi</h4>
            <p>
              • Eklediğiniz veya düzenlediğiniz tüm yorumlar, anasayfada yer alan <strong>"Sizden Gelenler"</strong> kaydırıcısında anında yayına alınır.
            </p>
            <p>
              • Her yoruma uygun bir pet simgesi (Kedi, Köpek, Tavşan, Kuş) yorum kimliğine göre otomatik olarak atanacaktır.
            </p>
            <p>
              • İdeal bir görünüm için müşteri yorumunu 2-3 satırı geçmeyecek şekilde özetleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

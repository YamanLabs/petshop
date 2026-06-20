'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Shield, 
  X, 
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Brand } from '../../../types';
import { optimizeAndUploadImage } from '../../../utils/supabase';

export default function AdminBrandsPage() {
  const { brands, addBrand, updateBrand, deleteBrand, requireActionAuth } = useApp();

  // Form States
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setFormMode('add');
    setEditingId('');
    setName('');
    setSlug('');
    setLogoUrl('');
    setErrorMsg('');
  };

  const handleOpenEdit = (brand: Brand) => {
    setFormMode('edit');
    setEditingId(brand.id);
    setName(brand.name);
    setSlug(brand.slug);
    setLogoUrl(brand.logoUrl || '');
    setErrorMsg('');
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setEditingId('');
    setName('');
    setSlug('');
    setLogoUrl('');
    setErrorMsg('');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(generatedSlug);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');
    try {
      const uploadedUrl = await optimizeAndUploadImage(file);
      if (uploadedUrl) {
        setLogoUrl(uploadedUrl);
      } else {
        setErrorMsg('Görsel yüklenemedi, lütfen tekrar deneyin.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Görsel optimizasyonu/yüklemesi başarısız oldu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !slug.trim()) {
      setErrorMsg('Lütfen ad ve slug alanlarını doldurun.');
      return;
    }

    requireActionAuth(() => {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        logoUrl: logoUrl.trim() || null
      };

      if (formMode === 'add') {
        addBrand(payload);
      } else if (formMode === 'edit') {
        updateBrand({
          id: editingId,
          ...payload
        });
      }

      handleCloseForm();
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-black">Marka Yönetimi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Ürünlerinizin bağlı olduğu üretici veya distribütör markaları tanımlayın ve düzenleyin.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-1.5 text-xs font-bold w-full sm:w-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Yeni Marka Tanımla
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Brands list */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-black">Tanımlı Markalar ({brands.length})</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-xs">
              <thead>
                <tr className="text-left text-zinc-400 uppercase tracking-widest font-bold border-b border-zinc-200">
                  <th className="py-3 pr-3">Logo</th>
                  <th className="py-3 px-3">Marka Adı</th>
                  <th className="py-3 px-3">Slug</th>
                  <th className="py-3 pl-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 pr-3">
                      {brand.logoUrl ? (
                        <img 
                          src={brand.logoUrl} 
                          alt={brand.name} 
                          className="w-10 h-10 object-contain rounded-md border border-zinc-200 bg-zinc-50 p-1"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-black text-sm">{brand.name}</td>
                    <td className="py-3 px-3 font-mono text-zinc-500">{brand.slug}</td>
                    <td className="py-3 pl-3 text-right space-x-2.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(brand)}
                        className="text-zinc-400 hover:text-black cursor-pointer inline-flex items-center"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                       <button
                        onClick={() => {
                          if (confirm(`"${brand.name}" markasını silmek istediğinize emin misiniz?`)) {
                            requireActionAuth(() => {
                              deleteBrand(brand.id);
                            });
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

        {/* Right Side Form Panel */}
        <div className="lg:col-span-4 space-y-6">
          {formMode && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="font-bold text-xs text-black uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-4 h-4 text-zinc-500" />
                  {formMode === 'add' ? 'Yeni Marka Tanımla' : 'Marka Düzenle'}
                </h4>
                <button onClick={handleCloseForm} className="text-zinc-400 hover:text-black cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Marka Logosu</label>
                  
                  {logoUrl && (
                    <div className="relative w-20 h-20 rounded-md border border-zinc-200 overflow-hidden bg-zinc-50 p-1">
                      <img src={logoUrl} alt="Logo Önizleme" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="absolute top-1 right-1 p-0.5 bg-black/60 text-white hover:bg-black rounded-full cursor-pointer"
                        title="Logoyu Kaldır"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-zinc-200 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100/50 hover:border-black transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-zinc-450 mb-1" />
                        <p className="text-[10px] text-zinc-450 font-bold uppercase">
                          {isUploading ? 'Yükleniyor...' : 'Logo Yükle'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Brand Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Marka Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: N&D, Pro Plan"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black font-semibold"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Slug (URL Dostu Ad)</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: n-and-d, pro-plan"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black font-mono font-bold"
                  />
                </div>

                {/* Actions */}
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
                    {formMode === 'add' ? 'Markayı Kaydet' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tips card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 text-xs leading-relaxed text-zinc-500 shadow-xs">
            <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Marka Yönetim Kuralları</h4>
            <p>
              • Marka logoları yüklenirken arka planda otomatik olarak <strong>WebP</strong> formatına dönüştürülür ve optimize edilir.
            </p>
            <p>
              • Bir markayı silmeniz ürünleri silmez, ancak ürünlerin teknik detaylarında marka adı gösterilmeye devam eder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

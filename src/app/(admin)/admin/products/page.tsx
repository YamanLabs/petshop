'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '../../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  Globe, 
  SlidersHorizontal,
  ChevronDown,
  PawPrint,
  Upload
} from 'lucide-react';
import { Category, Product, ProductVariation } from '../../../types';
import { optimizeAndUploadImage } from '../../../utils/supabase';

function AdminProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, categories, brands, addProduct, updateProduct, deleteProduct, requireActionAuth } = useApp();

  // Search state in products table
  const [tableSearch, setTableSearch] = useState('');

  // Image Upload State
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await optimizeAndUploadImage(file);
      if (url) {
        setImage(url);
      }
    } catch (err) {
      console.error("Failed to upload product image:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // SEO Form states
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [showSeoPanel, setShowSeoPanel] = useState(false);

  // Variations form states
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [newVarName, setNewVarName] = useState('');
  const [newVarModifier, setNewVarModifier] = useState('');

  // Sync editing id from URL search parameter (if e.g. clicked from dashboard stock warning)
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const prod = products.find(p => p.id === editId);
      if (prod) {
        handleStartEdit(prod);
      }
    }
  }, [searchParams, products]);

  const handleStartEdit = (prod: Product) => {
    setEditingId(prod.id);
    setTitle(prod.title);
    setBrand(prod.brand);
    setCategoryId(prod.categoryId);
    setPrice(prod.price.toString());
    setOriginalPrice(prod.originalPrice ? prod.originalPrice.toString() : '');
    setStock(prod.stock.toString());
    setImage(prod.image);
    setDescription(prod.description);
    setMetaTitle(prod.metaTitle || '');
    setMetaDescription(prod.metaDescription || '');
    setMetaKeywords(prod.metaKeywords || '');
    setVariations(prod.variations || []);
    setIsFormOpen(true);
  };

  const handleOpenNewForm = () => {
    setEditingId(null);
    setTitle('');
    setBrand('');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setOriginalPrice('');
    setStock('');
    setImage('');
    setDescription('');
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setVariations([]);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    // clear query param
    router.push('/admin/products');
  };

  // Variations list ops
  const handleAddVariation = () => {
    if (!newVarName.trim()) return;
    const modifier = newVarModifier ? Number(newVarModifier) : 0;
    setVariations([...variations, { name: newVarName.trim(), priceModifier: modifier }]);
    setNewVarName('');
    setNewVarModifier('');
  };

  const handleRemoveVariation = (idx: number) => {
    setVariations(variations.filter((_, i) => i !== idx));
  };

  // Submit add/edit form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !brand || !categoryId || !price || !stock || !image) return;

    requireActionAuth(() => {
      const baseData = {
        title,
        brand,
        categoryId,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        stock: Number(stock),
        image,
        description,
        variations: variations.length > 0 ? variations : undefined,
        metaTitle: metaTitle || `${title} | Zuzu Pet Co.`,
        metaDescription: metaDescription || description.slice(0, 150),
        metaKeywords: metaKeywords || `${brand}, ${title.toLowerCase()}`
      };

      if (editingId) {
        // Edit
        const existingProduct = products.find(p => p.id === editingId);
        if (existingProduct) {
          updateProduct({
            ...existingProduct,
            ...baseData
          });
        }
      } else {
        // Add
        addProduct(baseData);
      }

      handleCloseForm();
    });
  };

  // Filter products by search text in data table
  const filteredProducts = products.filter(p => {
    const q = tableSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-black">Ürün Yönetimi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Ürün katalog listesini görüntüleyin, yeni ürünler ekleyin veya SEO ayarlarını yapılandırın.
          </p>
        </div>

        <button
          onClick={handleOpenNewForm}
          className="btn-primary flex items-center gap-1.5 text-xs font-bold w-full sm:w-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Yeni Ürün Ekle
        </button>
      </div>

      {/* Main Grid: Forms & Data Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Add/Edit Product (Appears as slide/box dynamically) */}
        {isFormOpen && (
          <div className="lg:col-span-12 bg-white border border-zinc-200 rounded-xl p-5 sm:p-8 space-y-6 shadow-md animate-fadeIn">
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-black">
                {editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Kaydı'}
              </h3>
              <button 
                onClick={handleCloseForm}
                className="text-zinc-400 hover:text-black cursor-pointer p-1 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product Info Fields */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Ürün Başlığı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: N&D Yavru Kedi Maması 1.5kg"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Marka</label>
                    <select
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black cursor-pointer font-semibold"
                    >
                      <option value="">-- Marka Seçin --</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Kategori</label>
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black cursor-pointer font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.parentId 
                            ? `${categories.find(p => p.id === c.parentId)?.name} > ${c.name}`
                            : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Satış Fiyatı (TL)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="349"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Üstü Çizili Fiyat</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="399"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500">Stok Adedi</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="15"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Ürün Görseli</label>
                  
                  {image && (
                    <div className="relative w-24 h-24 rounded-md border border-zinc-200 overflow-hidden bg-zinc-50">
                      <img src={image} alt="Ürün Önizleme" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute top-1 right-1 p-0.5 bg-black/60 text-white hover:bg-black rounded-full cursor-pointer"
                        title="Görseli Kaldır"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-zinc-200 border-dashed rounded-lg cursor-pointer bg-zinc-50 hover:bg-zinc-100/50 hover:border-black transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-5 h-5 text-zinc-450 mb-1" />
                          <p className="text-[10px] text-zinc-450 font-bold uppercase">
                            {isUploadingImage ? 'Yükleniyor...' : 'Görsel Yükle (WebP)'}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProductImageUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase">Veya Görsel URL'si</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500">Zengin Açıklama Metni</label>
                  <textarea
                    rows={4}
                    placeholder="Ürün ayrıntılarını, besin değerlerini yazın..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black resize-none"
                  />
                </div>
              </div>

              {/* Variations and SEO Tabs */}
              <div className="space-y-6">
                {/* Variations config */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">Paket Ağırlığı / Boyut Varyasyonları</span>
                  
                  {/* Current vars list */}
                  <div className="flex flex-wrap gap-2">
                    {variations.map((v, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-black text-white text-[10px] font-bold py-1 px-2.5 rounded-sm">
                        {v.name} ({v.priceModifier >= 0 ? '+' : ''}{v.priceModifier} TL)
                        <button type="button" onClick={() => handleRemoveVariation(idx)} className="hover:text-red-400 cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add variant input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Örn: 10 kg, S, M"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      className="bg-white border border-zinc-200 rounded-md p-2 text-xs flex-1 focus:outline-hidden"
                    />
                    <input
                      type="number"
                      placeholder="+ Fiyat Farkı"
                      value={newVarModifier}
                      onChange={(e) => setNewVarModifier(e.target.value)}
                      className="bg-white border border-zinc-200 rounded-md p-2 text-xs w-28 focus:outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariation}
                      className="bg-black hover:bg-zinc-800 text-white text-xs font-bold py-2 px-3 rounded-md cursor-pointer flex-shrink-0"
                    >
                      Ekle
                    </button>
                  </div>
                </div>

                {/* Collapsible Dynamic SEO Panel */}
                <div className="bg-zinc-550 border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setShowSeoPanel(!showSeoPanel)}
                    className="w-full bg-zinc-100 hover:bg-zinc-150 py-3.5 px-4 flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-zinc-500" />
                      Dinamik SEO Paneli (Arama Motoru Ayarları)
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showSeoPanel ? 'rotate-180' : ''}`} />
                  </button>

                  {showSeoPanel && (
                    <div className="p-4 bg-white border-t border-zinc-150 space-y-4 animate-fadeIn">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">Meta Başlık (Title Tag)</label>
                        <input
                          type="text"
                          placeholder="Örn: N&D Tahılsız Kedi Maması Fiyatı - Zuzu Pet Co."
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black font-semibold"
                        />
                        <p className="text-[10px] text-zinc-400">Google sonuç başlığı. Maksimum 60 karakter tavsiye edilir.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">Meta Açıklaması (Meta Description)</label>
                        <textarea
                          rows={3}
                          placeholder="Ürün sayfasının kısa arama motoru açıklaması..."
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black resize-none"
                        />
                        <p className="text-[10px] text-zinc-400">Arama sonuç kartlarında başlığın altında görünür. Maksimum 160 karakter.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-zinc-500">Meta Anahtar Kelimeler (Keywords)</label>
                        <input
                          type="text"
                          placeholder="Örn: n&d, kedi maması, premium kedi maması"
                          value={metaKeywords}
                          onChange={(e) => setMetaKeywords(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs focus:outline-hidden focus:border-black"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="btn-secondary text-xs font-bold py-2.5 px-6"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs font-bold py-2.5 px-8"
                  >
                    {editingId ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="lg:col-span-12 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-sm text-black">Ürün Veritabanı Listesi ({filteredProducts.length} adet)</h3>
            
            {/* Table Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Kod, başlık veya marka ara..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md py-2 pl-8 pr-3 text-xs focus:outline-hidden focus:border-black"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-xs">
              <thead>
                <tr className="text-left text-zinc-400 uppercase tracking-widest font-bold border-b border-zinc-200">
                  <th className="py-3 pr-3">Görsel</th>
                  <th className="py-3 px-3">Marka & Başlık</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Fiyat</th>
                  <th className="py-3 px-3">Stok Durumu</th>
                  <th className="py-3 pl-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {filteredProducts.map((p) => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 pr-3">
                        {p.image ? (
                          <img 
                            src={p.image} 
                            alt={p.title} 
                            className="w-10 h-10 object-cover rounded-md border border-zinc-200 bg-zinc-50"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-900 rounded-md border border-zinc-200 flex flex-col items-center justify-center flex-shrink-0 gap-0.5 select-none">
                            <PawPrint className="w-3.5 h-3.5 text-white/50" />
                            <span className="text-[4px] font-bold text-white/50 tracking-wider font-mono">YOK</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-zinc-950 line-clamp-1">{p.title}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider font-mono">{p.brand} (ID: {p.id})</div>
                      </td>
                      <td className="py-3 px-3 text-zinc-500 font-semibold">
                        {cat ? (
                          cat.parentId 
                            ? `${categories.find(parent => parent.id === cat.parentId)?.name} > ${cat.name}`
                            : cat.name
                        ) : 'Bilinmeyen'}
                      </td>
                      <td className="py-3 px-3 font-bold font-mono text-black">{p.price} TL</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.stock === 0 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : p.stock <= 3 
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          Stok: {p.stock}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleStartEdit(p)}
                          className="border border-zinc-200 hover:border-black text-zinc-500 hover:text-black p-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center"
                          title="Düzenle"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${p.title}" ürününü silmek istediğinize emin misiniz?`)) {
                              requireActionAuth(() => {
                                deleteProduct(p.id);
                              });
                            }
                          }}
                          className="border border-zinc-200 hover:border-red-600 hover:bg-red-50 text-zinc-400 hover:text-red-600 p-1.5 rounded-md transition-colors cursor-pointer inline-flex items-center"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center bg-zinc-50">
        <span className="text-zinc-500 text-sm font-semibold">Yükleniyor...</span>
      </div>
    }>
      <AdminProductsContent />
    </Suspense>
  );
}

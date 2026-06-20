'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Link as LinkIcon, 
  ChevronUp, 
  ChevronDown, 
  FolderTree, 
  X 
} from 'lucide-react';
import { NavbarLink } from '../../../types';

export default function AdminNavbarPage() {
  const { 
    navbarLinks, 
    categories, 
    addNavbarLink, 
    updateNavbarLink, 
    deleteNavbarLink 
  } = useApp();

  // Form States
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [linkType, setLinkType] = useState<'custom' | 'category'>('custom');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const rootLinks = navbarLinks.filter(l => !l.parentId);
  const getSubLinks = (parentId: string) => navbarLinks.filter(l => l.parentId === parentId);

  const handleOpenAdd = () => {
    setFormMode('add');
    setEditingId('');
    setTitle('');
    setUrl('');
    setParentId('');
    setSortOrder(navbarLinks.length + 1);
    setLinkType('custom');
    setSelectedCatId('');
    setErrorMsg('');
  };

  const handleOpenEdit = (link: NavbarLink) => {
    setFormMode('edit');
    setEditingId(link.id);
    setTitle(link.title);
    setUrl(link.url);
    setParentId(link.parentId || '');
    setSortOrder(link.sortOrder);
    
    // Check if url matches a category slug
    const matchingCat = categories.find(c => link.url.includes(c.id));
    if (matchingCat) {
      setLinkType('category');
      setSelectedCatId(matchingCat.id);
    } else {
      setLinkType('custom');
      setSelectedCatId('');
    }
    setErrorMsg('');
  };

  const handleCloseForm = () => {
    setFormMode(null);
    setEditingId('');
    setTitle('');
    setUrl('');
    setParentId('');
    setSortOrder(0);
    setLinkType('custom');
    setSelectedCatId('');
    setErrorMsg('');
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCatId(catId);
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      setTitle(cat.name);
      setUrl(`/shop?category=${cat.id}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !url.trim()) {
      setErrorMsg('Lütfen Başlık ve URL alanlarını doldurun.');
      return;
    }

    const payload = {
      title: title.trim(),
      url: url.trim(),
      parentId: parentId || null,
      sortOrder: Number(sortOrder)
    };

    if (formMode === 'add') {
      addNavbarLink(payload);
    } else if (formMode === 'edit') {
      updateNavbarLink({
        id: editingId,
        ...payload
      });
    }

    handleCloseForm();
  };

  const handleSort = (link: NavbarLink, direction: 'up' | 'down') => {
    const siblingLinks = navbarLinks.filter(l => l.parentId === link.parentId);
    const index = siblingLinks.findIndex(l => l.id === link.id);
    if (index === -1) return;

    const swapWithIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapWithIndex < 0 || swapWithIndex >= siblingLinks.length) return;

    const swapLink = siblingLinks[swapWithIndex];

    // Swap sortOrder
    updateNavbarLink({ ...link, sortOrder: swapLink.sortOrder });
    updateNavbarLink({ ...swapLink, sortOrder: link.sortOrder });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-black">Navbar Özelleştirme</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Üst menüde ve mobil menüde gösterilen linkleri ve kategorileri özelleştirin, sıralayın ve düzenleyin.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-1.5 text-xs font-bold w-full sm:w-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Yeni Menü Linki
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation list */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-black">Menü Ağaç Yapısı</h3>
          
          <div className="space-y-3">
            {rootLinks.length === 0 ? (
              <p className="text-zinc-500 text-xs font-medium py-4 text-center">Menüde hiç link bulunmuyor.</p>
            ) : (
              rootLinks.map((link, rootIdx) => {
                const subLinks = getSubLinks(link.id);
                return (
                  <div key={link.id} className="border border-zinc-150 rounded-lg overflow-hidden bg-zinc-50/30">
                    {/* Root row */}
                    <div className="flex items-center justify-between p-4 bg-white border-b border-zinc-150">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-zinc-400" />
                        <span className="font-bold text-sm text-black">{link.title}</span>
                        <span className="text-[10px] bg-zinc-100 text-zinc-500 rounded-md px-2 py-0.5 font-mono select-all">
                          {link.url}
                        </span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSort(link, 'up')}
                          disabled={rootIdx === 0}
                          className="p-1 rounded-sm border border-zinc-150 bg-white text-zinc-500 hover:text-black disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Yukarı Taşı"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSort(link, 'down')}
                          disabled={rootIdx === rootLinks.length - 1}
                          className="p-1 rounded-sm border border-zinc-150 bg-white text-zinc-500 hover:text-black disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="Aşağı Taşı"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(link)}
                          className="p-1 rounded-sm border border-zinc-150 bg-white text-zinc-500 hover:text-black cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`"${link.title}" linkini ve altındaki tüm alt menüleri silmek istediğinize emin misiniz?`)) {
                              deleteNavbarLink(link.id);
                            }
                          }}
                          className="p-1 rounded-sm border border-zinc-150 bg-white text-zinc-500 hover:text-red-650 cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sublinks */}
                    {subLinks.length > 0 && (
                      <div className="p-3 pl-8 space-y-2 border-t border-zinc-100 divide-y divide-zinc-100/50">
                        {subLinks.map((sub, subIdx) => (
                          <div key={sub.id} className="flex items-center justify-between pt-2 first:pt-0">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                              <span className="font-semibold text-xs text-zinc-700">{sub.title}</span>
                              <span className="text-[9px] bg-zinc-100/70 text-zinc-400 rounded-sm px-1.5 py-0.5 font-mono select-all">
                                {sub.url}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 scale-90">
                              <button
                                onClick={() => handleSort(sub, 'up')}
                                disabled={subIdx === 0}
                                className="p-1 rounded-sm border border-zinc-150 bg-white text-zinc-500 hover:text-black disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleSort(sub, 'down')}
                                disabled={subIdx === subLinks.length - 1}
                                className="p-1 rounded-sm border border-zinc-150 bg-white text-zinc-500 hover:text-black disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(sub)}
                                className="p-1 rounded-sm border border-zinc-150 bg-white text-zinc-500 hover:text-black cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`"${sub.title}" alt linkini silmek istediğinize emin misiniz?`)) {
                                    deleteNavbarLink(sub.id);
                                  }
                                }}
                                className="p-1 rounded-sm border border-zinc-150 bg-white text-zinc-500 hover:text-red-650 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="lg:col-span-4 space-y-6">
          {formMode && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="font-bold text-xs text-black uppercase tracking-wider flex items-center gap-1">
                  <LinkIcon className="w-4 h-4 text-zinc-500" />
                  {formMode === 'add' ? 'Yeni Link Ekle' : 'Linki Düzenle'}
                </h4>
                <button onClick={handleCloseForm} className="text-zinc-400 hover:text-black cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {errorMsg && <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Link Type Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Link Tipi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLinkType('custom')}
                      className={`py-2 px-3 border rounded-md text-xs font-bold text-center cursor-pointer transition-colors ${
                        linkType === 'custom'
                          ? 'border-black bg-black text-white'
                          : 'border-zinc-200 bg-white text-zinc-650 hover:border-zinc-300'
                      }`}
                    >
                      Özel Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setLinkType('category')}
                      className={`py-2 px-3 border rounded-md text-xs font-bold text-center cursor-pointer transition-colors ${
                        linkType === 'category'
                          ? 'border-black bg-black text-white'
                          : 'border-zinc-200 bg-white text-zinc-650 hover:border-zinc-300'
                      }`}
                    >
                      Kategori Linki
                    </button>
                  </div>
                </div>

                {/* Category Selection Dropdown */}
                {linkType === 'category' && (
                  <div className="space-y-1 animate-fadeIn">
                    <label className="text-[10px] font-bold text-zinc-450 uppercase block">Kategori Seçimi</label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black cursor-pointer font-semibold"
                    >
                      <option value="">-- Kategori Seçin --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.parentId ? '↳ ' : ''}{cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Menü Başlığı</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kedi Maması, İletişim, Biz Kimiz"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black font-semibold"
                  />
                </div>

                {/* URL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Hedef URL</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: /shop, /about-us, /contact"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black font-mono font-bold"
                  />
                </div>

                {/* Parent link selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Üst Menü Linki (Alt Menü ise)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black cursor-pointer font-semibold"
                  >
                    <option value="">Üst Menü Yok (Ana Link)</option>
                    {rootLinks
                      .filter(l => l.id !== editingId) // Cannot nest under itself
                      .map((rootL) => (
                        <option key={rootL.id} value={rootL.id}>
                          {rootL.title}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 uppercase block">Sıralama Değeri</label>
                  <input
                    type="number"
                    required
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
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
                    {formMode === 'add' ? 'Linki Kaydet' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tips card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 text-xs leading-relaxed text-zinc-500 shadow-xs">
            <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Özelleştirme İpuçları</h4>
            <p>
              • <strong>Alt Menü Oluşturma:</strong> Bir menü linkini başka bir ana linkin altına yerleştirmek için "Üst Menü Linki" seçeneğini kullanın.
            </p>
            <p>
              • <strong>Sıralama:</strong> Linkleri yukarı/aşağı taşıma butonlarıyla kolayca sıralayabilirsiniz.
            </p>
            <p>
              • <strong>Kategori Linkleri:</strong> "Kategori Linki" tipini seçtiğinizde, sistem başlığı ve hedef URL'yi otomatik doldurur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

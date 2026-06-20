'use client';

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Check, 
  Folder,
  Cat,
  Dog,
  Bird,
  Fish,
  Rabbit,
  Upload,
  PawPrint
} from 'lucide-react';
import { Category } from '../../../types';
import { optimizeAndUploadImage } from '../../../utils/supabase';

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, requireActionAuth } = useApp();

  // Expanded/collapsed states for tree nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'cat-1': true,
    'cat-2': true
  });

  // Form State
  const [formMode, setFormMode] = useState<'none' | 'add' | 'edit'>('none');
  const [formData, setFormData] = useState({
    id: '',
    parentId: null as string | null,
    name: '',
    description: '',
    isPromo: false,
    iconType: 'svg' as 'svg' | 'image',
    iconSvgPreset: 'none' as 'cat' | 'dog' | 'bird' | 'fish' | 'rabbit' | 'none',
    iconImageUrl: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleStartAdd = (parentId: string | null = null) => {
    setFormData({
      id: '',
      parentId: parentId,
      name: '',
      description: '',
      isPromo: false,
      iconType: 'svg',
      iconSvgPreset: 'none',
      iconImageUrl: '',
    });
    setFormMode('add');
  };

  const handleStartEdit = (cat: Category) => {
    setFormData({
      id: cat.id,
      parentId: cat.parentId || null,
      name: cat.name,
      description: cat.description || '',
      isPromo: !!cat.isPromo,
      iconType: cat.iconType || 'svg',
      iconSvgPreset: cat.iconSvgPreset || 'none',
      iconImageUrl: cat.iconImageUrl || '',
    });
    setFormMode('edit');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await optimizeAndUploadImage(file);
      setFormData(prev => ({ ...prev, iconImageUrl: url }));
    } catch (err) {
      console.error("Failed to upload category icon image:", err);
      alert("Görsel yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    requireActionAuth(() => {
      if (formMode === 'add') {
        addCategory({
          name: formData.name.trim(),
          parentId: formData.parentId,
          description: formData.description.trim(),
          isPromo: formData.isPromo,
          iconType: formData.iconType,
          iconSvgPreset: formData.iconSvgPreset,
          iconImageUrl: formData.iconImageUrl,
        });
      } else if (formMode === 'edit') {
        const existing = categories.find(c => c.id === formData.id);
        if (existing) {
          updateCategory({
            ...existing,
            name: formData.name.trim(),
            description: formData.description.trim(),
            isPromo: formData.isPromo,
            iconType: formData.iconType,
            iconSvgPreset: formData.iconSvgPreset,
            iconImageUrl: formData.iconImageUrl,
          });
        }
      }
      setFormMode('none');
    });
  };

  // Delete category with confirmation
  const handleDeleteCategory = (catId: string, name: string) => {
    const hasChildren = categories.some(c => c.parentId === catId);
    let msg = `"${name}" kategorisini silmek istediğinize emin misiniz?`;
    if (hasChildren) {
      msg = `"${name}" kategorisi alt kategoriler barındırıyor! Kategoriyi silerseniz alt kategoriler de silinecektir. Emin misiniz?`;
    }
    if (confirm(msg)) {
      requireActionAuth(() => {
        deleteCategory(catId);
        if ((formMode === 'edit' && formData.id === catId) || (formMode === 'add' && formData.parentId === catId)) {
          setFormMode('none');
        }
      });
    }
  };

  const getCategoryIconPreview = (cat: Category) => {
    if (cat.iconType === 'image' && cat.iconImageUrl) {
      return (
        <img 
          src={cat.iconImageUrl} 
          alt="" 
          className="w-4 h-4 rounded-full object-cover border border-zinc-200" 
        />
      );
    }
    const preset = cat.iconSvgPreset || 'none';
    let IconComp = Folder;
    if (preset === 'cat') IconComp = Cat;
    else if (preset === 'dog') IconComp = Dog;
    else if (preset === 'bird') IconComp = Bird;
    else if (preset === 'fish') IconComp = Fish;
    else if (preset === 'rabbit') IconComp = Rabbit;
    
    return <IconComp className="w-3.5 h-3.5 text-zinc-550" />;
  };

  const getPresetIconComponent = (preset: string) => {
    if (preset === 'cat') return Cat;
    if (preset === 'dog') return Dog;
    if (preset === 'bird') return Bird;
    if (preset === 'fish') return Fish;
    if (preset === 'rabbit') return Rabbit;
    return PawPrint;
  };

  // Group root and children
  const rootCategories = categories.filter(c => !c.parentId);

  // Recursive renderer for category node
  const renderCategoryNode = (category: Category, depth = 0) => {
    const children = categories.filter(c => c.parentId === category.id);
    const isExpanded = !!expandedNodes[category.id];
    const isEditingThis = formMode === 'edit' && formData.id === category.id;

    return (
      <div key={category.id} className="space-y-1">
        {/* Category Row */}
        <div 
          className={`bg-white border rounded-md p-3 flex items-center justify-between hover:border-black transition-colors ${
            isEditingThis ? 'border-black ring-1 ring-black bg-zinc-50' : 'border-zinc-200'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center gap-2 flex-grow min-w-0">
            {children.length > 0 ? (
              <button 
                onClick={() => toggleNode(category.id)} 
                className="text-zinc-500 hover:text-black p-0.5 rounded-sm hover:bg-zinc-100 cursor-pointer flex-shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-5 flex justify-center text-zinc-300 flex-shrink-0">
                {getCategoryIconPreview(category)}
              </div>
            )}

            {children.length > 0 && (
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                {getCategoryIconPreview(category)}
              </div>
            )}
            
            <div className="min-w-0 flex items-center gap-2">
              <span className="font-bold text-xs text-zinc-900 truncate">{category.name}</span>
              {category.isPromo && (
                <span className="bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex-shrink-0">
                  Öne Çıkan
                </span>
              )}
              <span className="text-[9px] text-zinc-400 font-mono font-normal hidden sm:inline">slug: {category.slug}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            {/* Add Subcategory (available up to depth 1 for cleaner dashboard structure) */}
            {depth < 1 && (
              <button
                onClick={() => handleStartAdd(category.id)}
                className="border border-zinc-200 hover:border-black text-zinc-500 hover:text-black text-[10px] font-bold py-1 px-2.5 rounded-sm inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                title="Alt kategori ekle"
              >
                <Plus className="w-3 h-3" />
                Alt Kategori
              </button>
            )}

            <button
              onClick={() => handleStartEdit(category)}
              className={`border p-1 rounded-sm transition-colors cursor-pointer ${
                isEditingThis 
                  ? 'bg-black text-white border-black' 
                  : 'border-zinc-250 hover:border-black text-zinc-500 hover:text-black'
              }`}
              title="Düzenle"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleDeleteCategory(category.id, category.name)}
              className="border border-zinc-250 hover:border-red-650 hover:bg-red-50 text-zinc-400 hover:text-red-600 p-1 rounded-sm transition-colors cursor-pointer"
              title="Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Child Nodes */}
        {children.length > 0 && isExpanded && (
          <div className="space-y-1 animate-fadeIn">
            {children.map(child => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-black">Kategori Hiyerarşisi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Mağazanızın çok katmanlı kategorilerini düzenleyin, iç içe ağaç yapısında yönetin.
          </p>
        </div>

        <button
          onClick={() => handleStartAdd(null)}
          className="btn-primary flex items-center gap-1.5 text-xs font-bold w-full sm:w-auto shadow-xs"
        >
          <Plus className="w-4 h-4" /> Ana Kategori Ekle
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Tree view */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-zinc-100 border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-inner">
            <h3 className="text-xs font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-200 pb-2">
              <FolderTree className="w-4 h-4 text-zinc-400" />
              Aktif Kategori Ağacı
            </h3>
            
            {rootCategories.length === 0 ? (
              <p className="text-zinc-550 text-xs font-medium py-4">Henüz kategori bulunmuyor.</p>
            ) : (
              <div className="space-y-2">
                {rootCategories.map(rootCat => renderCategoryNode(rootCat, 0))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="lg:col-span-4 space-y-6">
          {formMode !== 'none' ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="font-bold text-xs text-black uppercase tracking-wider">
                  {formMode === 'add' 
                    ? (formData.parentId 
                      ? `Alt Kategori Ekle` 
                      : 'Yeni Ana Kategori Ekle')
                    : 'Kategori Düzenle'}
                </h4>
                <button onClick={() => setFormMode('none')} className="text-zinc-400 hover:text-black cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {formData.parentId && formMode === 'add' && (
                <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-2.5 text-[11px] text-zinc-650 font-medium">
                  Üst Kategori: <strong className="text-black">{categories.find(c => c.id === formData.parentId)?.name}</strong>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {/* Category Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Kategori İsmi</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Yaş Mamalar, Tasmalar"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs text-black focus:outline-hidden focus:border-black"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Açıklama (Homepage Showcase İçin)</label>
                  <textarea
                    placeholder="Örn: Mama, Kum & Oyuncaklar"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-xs text-black focus:outline-hidden focus:border-black min-h-[60px] resize-y"
                  />
                </div>

                {/* Promo Checkbox */}
                <div className="flex items-center justify-between py-2 border-t border-b border-zinc-100">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-700 block">Anasayfada Öne Çıkar</span>
                    <span className="text-[9px] text-zinc-400 block">Kategori vitrininde listelensin mi?</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={formData.isPromo}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPromo: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                {/* Icon Settings */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">İkon Kaynağı</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, iconType: 'svg' }))}
                        className={`py-1.5 text-xs font-bold border rounded-md transition-all ${
                          formData.iconType === 'svg'
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        SVG Preset Simge
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, iconType: 'image' }))}
                        className={`py-1.5 text-xs font-bold border rounded-md transition-all ${
                          formData.iconType === 'image'
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        Özel Görsel Yükle
                      </button>
                    </div>
                  </div>

                  {formData.iconType === 'svg' ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">SVG Preset İkonu Seçin</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['cat', 'dog', 'bird', 'fish', 'rabbit', 'none'] as const).map(preset => {
                          const PresetIcon = getPresetIconComponent(preset);
                          const isSelected = formData.iconSvgPreset === preset;
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, iconSvgPreset: preset }))}
                              className={`p-2 flex flex-col items-center justify-center border rounded-md gap-1 transition-all ${
                                isSelected
                                  ? 'border-black bg-zinc-50 text-black font-bold'
                                  : 'border-zinc-200 text-zinc-450 hover:border-zinc-350 hover:text-black'
                              }`}
                            >
                              <PresetIcon className="w-5 h-5" />
                              <span className="text-[9px] uppercase font-bold tracking-wider">{preset === 'none' ? 'Yok' : preset}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Özel İkon Görseli</label>
                      
                      {formData.iconImageUrl ? (
                        <div className="relative w-20 h-20 mx-auto rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50 group">
                          <img 
                            src={formData.iconImageUrl} 
                            alt="Kategori özel simge önizlemesi" 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, iconImageUrl: '' }))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-zinc-200 hover:border-black rounded-lg p-5 text-center transition-colors relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                          <Upload className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                          <span className="text-[10px] font-bold text-zinc-500 block">
                            {isUploading ? 'Yükleniyor...' : 'Görsel Yükle (Kare önerilir)'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex gap-2 justify-end pt-2 border-t border-zinc-150">
                  <button 
                    type="button" 
                    onClick={() => setFormMode('none')}
                    className="btn-secondary text-[10px] font-bold py-2 px-3.5 rounded-md"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="btn-primary text-[10px] font-bold py-2 px-4.5 rounded-md disabled:bg-zinc-300"
                  >
                    {formMode === 'add' ? 'Kategoriyi Ekle' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Guidelines */
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 text-xs leading-relaxed text-zinc-550 shadow-xs">
              <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Ağaç Yapısı Rehberi</h4>
              <p>
                • Kategoriler çok katmanlı çalışır. Ürünleri alt kategorilere bağlayabilirsiniz.
              </p>
              <p>
                • Bir ana kategori (örn: <strong>Kedi</strong>) silindiğinde, ona bağlı tüm alt kategoriler otomatik olarak silinecektir.
              </p>
              <p>
                • Öne Çıkarılan kategorileri, özel SVG preset ikonları veya kendi yükleyeceğiniz görsellerle anasayfa vitrininde özelleştirebilirsiniz.
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

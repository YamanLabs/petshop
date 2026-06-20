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
  Folder 
} from 'lucide-react';
import { Category } from '../../../types';

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, requireActionAuth } = useApp();

  // Active form overlays
  const [isAdding, setIsAdding] = useState(false);
  const [addingParentId, setAddingParentId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Expand / collapse states for tree nodes
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'cat-1': true,
    'cat-2': true
  });

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleStartAdd = (parentId: string | null = null) => {
    setAddingParentId(parentId);
    setNewCatName('');
    setIsAdding(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    requireActionAuth(() => {
      addCategory({
        name: newCatName.trim(),
        parentId: addingParentId
      });

      setIsAdding(false);
      setNewCatName('');
      setAddingParentId(null);
    });
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleUpdateCategory = (cat: Category) => {
    if (!editingName.trim()) return;
    requireActionAuth(() => {
      updateCategory({
        ...cat,
        name: editingName.trim()
      });
      setEditingId(null);
      setEditingName('');
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
      });
    }
  };

  // Group root and children
  const rootCategories = categories.filter(c => !c.parentId);

  // Recursive renderer for category node
  const renderCategoryNode = (category: Category, depth = 0) => {
    const children = categories.filter(c => c.parentId === category.id);
    const isExpanded = !!expandedNodes[category.id];
    const isEditing = editingId === category.id;

    return (
      <div key={category.id} className="space-y-1">
        {/* Category Row */}
        <div 
          className="bg-white border border-zinc-200 rounded-md p-3 flex items-center justify-between hover:border-black transition-colors"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center gap-2 flex-grow min-w-0">
            {children.length > 0 ? (
              <button 
                onClick={() => toggleNode(category.id)} 
                className="text-zinc-500 hover:text-black p-0.5 rounded-sm hover:bg-zinc-100 cursor-pointer"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-5 flex justify-center text-zinc-300">
                <Folder className="w-3.5 h-3.5" />
              </div>
            )}
            
            {isEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="bg-zinc-50 border border-zinc-300 rounded px-2 py-0.5 text-xs font-semibold focus:outline-hidden focus:border-black w-full sm:w-48"
                  autoFocus
                />
                <button 
                  onClick={() => handleUpdateCategory(category)}
                  className="bg-black text-white hover:bg-zinc-800 p-1 rounded-sm cursor-pointer"
                  title="Kaydet"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setEditingId(null)}
                  className="bg-zinc-100 text-zinc-500 hover:bg-zinc-200 p-1 rounded-sm cursor-pointer"
                  title="Vazgeç"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="min-w-0 flex items-center gap-2">
                <span className="font-bold text-xs text-zinc-900 truncate">{category.name}</span>
                <span className="text-[9px] text-zinc-400 font-mono font-normal">slug: {category.slug}</span>
              </div>
            )}
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

            {!isEditing && (
              <button
                onClick={() => handleStartEdit(category)}
                className="border border-zinc-250 hover:border-black text-zinc-500 hover:text-black p-1 rounded-sm transition-colors cursor-pointer"
                title="Düzenle"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

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

        {/* Right Side Info & Add dialog */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Inline Add Card */}
          {isAdding && (
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h4 className="font-bold text-xs text-black uppercase tracking-wider">
                  {addingParentId 
                    ? `Alt Kategori Ekle (Üst: ${categories.find(c => c.id === addingParentId)?.name})` 
                    : 'Yeni Ana Kategori Ekle'}
                </h4>
                <button onClick={() => setIsAdding(false)} className="text-zinc-400 hover:text-black cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Kategori İsmi</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Yaş Mamalar, Tasnalar"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2 text-xs focus:outline-hidden focus:border-black"
                  />
                </div>
                <div className="flex gap-2 justify-end">
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
                    Kategoriyi Ekle
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 text-xs leading-relaxed text-zinc-500 shadow-xs">
            <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Ağaç Yapısı Rehberi</h4>
            <p>
              • Kategoriler çok katmanlı çalışır. Ürünleri alt kategorilere bağlayabilirsiniz.
            </p>
            <p>
              • Bir ana kategori (örn: <strong>Kedi</strong>) silindiğinde, ona bağlı tüm alt kategoriler (<strong>Kedi Maması</strong>, vb.) otomatik olarak silinecektir.
            </p>
            <p>
              • Eklenen yeni kategoriler ve ağaç düzenlemeleri public web sayfasındaki Header navigasyonuna hemen yansır.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}

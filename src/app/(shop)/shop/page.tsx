'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  SlidersHorizontal,
  X,
  Search,
  CheckCircle,
  PawPrint,
  Cat,
  Dog,
  Bird,
  Fish,
  Rabbit
} from 'lucide-react';
import { Product, Category } from '../../types';

function ShopCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, categories, addToCart, addToWishlist, wishlist, removeFromWishlist } = useApp();

  // Filter and sort states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Mobile filters sheet open state
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Helper to render category icon (preset SVG or custom uploaded image)
  const renderCategoryIcon = (cat: Category, isActive: boolean) => {
    if (cat.iconType === 'image' && cat.iconImageUrl) {
      return (
        <img 
          src={cat.iconImageUrl} 
          alt="" 
          className="w-4 h-4 rounded-full object-cover border border-zinc-200 flex-shrink-0" 
        />
      );
    }
    
    const preset = cat.iconSvgPreset || 'none';
    let IconComponent = PawPrint;
    
    if (preset === 'cat') IconComponent = Cat;
    else if (preset === 'dog') IconComponent = Dog;
    else if (preset === 'bird') IconComponent = Bird;
    else if (preset === 'fish') IconComponent = Fish;
    else if (preset === 'rabbit') IconComponent = Rabbit;
    
    // Determine the icon color based on active state:
    // White when the category is active and has black bg
    // Black when subcategory is active and has zinc-200 bg
    // Default to zinc-450
    const iconColor = isActive 
      ? (selectedCategory === cat.id && !cat.parentId ? 'text-white' : 'text-black')
      : 'text-zinc-500';

    return <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 ${iconColor}`} />;
  };

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const q = searchParams.get('search') || '';
    const brands = searchParams.get('brands')?.split(',') || [];
    const price = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 2500;
    const stock = searchParams.get('inStock') === 'true';
    const sort = searchParams.get('sortBy') || 'featured';

    setSelectedCategory(cat);
    setSearchQuery(q);
    setSelectedBrands(brands.filter(Boolean));
    setMaxPrice(price);
    setInStockOnly(stock);
    setSortBy(sort);
  }, [searchParams]);

  // Handle URL updates when filters change
  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`/shop?${params.toString()}`);
  };

  const handleCategorySelect = (catId: string) => {
    updateURLParams({ category: catId || null });
  };

  const handleBrandToggle = (brand: string) => {
    const nextBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    
    updateURLParams({ brands: nextBrands.length > 0 ? nextBrands.join(',') : null });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(Number(e.target.value));
  };

  const handlePriceRelease = () => {
    updateURLParams({ maxPrice: maxPrice.toString() });
  };

  const handleStockToggle = () => {
    updateURLParams({ inStock: (!inStockOnly).toString() });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateURLParams({ sortBy: e.target.value });
  };

  const handleResetFilters = () => {
    router.push('/shop');
  };

  // Extract unique brands from active products
  const allBrands = Array.from(new Set(products.map(p => p.brand)));

  // Filter logic
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchDesc) return false;
    }

    // Category filter (support hierarchical match - matches parent category too)
    if (selectedCategory) {
      const matchingCats = [selectedCategory];
      // also check if selected category is parent of the product's category
      const targetCat = categories.find(c => c.id === product.categoryId);
      if (product.categoryId !== selectedCategory && targetCat?.parentId !== selectedCategory) {
        return false;
      }
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }

    // Price filter
    if (product.price > maxPrice) {
      return false;
    }

    // Stock filter
    if (inStockOnly && product.stock <= 0) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'featured':
      default:
        // Default order
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-black">
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.name + ' Ürünleri' 
              : 'Tüm Ürünlerimiz'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Toplam {sortedProducts.length} ürün listeleniyor.
          </p>
        </div>

        {/* Catalog Control Area */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Sorting */}
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <span className="text-xs text-zinc-500 font-semibold whitespace-nowrap hidden sm:inline">Sıralama:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-white border border-zinc-200 rounded-md py-2 px-3 text-xs font-semibold focus:outline-hidden focus:border-black cursor-pointer w-full"
            >
              <option value="featured">Öne Çıkanlar</option>
              <option value="price-asc">Fiyat: Artan</option>
              <option value="price-desc">Fiyat: Azalan</option>
              <option value="rating">Değerlendirme Puanı</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center justify-center gap-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 py-2 px-4 rounded-md text-xs font-semibold text-zinc-700 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtrele
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-lg p-5 space-y-6 sticky top-24">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <span className="font-bold text-sm text-black">Filtreleme Seçenekleri</span>
              <button 
                onClick={handleResetFilters}
                className="text-[10px] text-zinc-400 hover:text-black font-semibold underline cursor-pointer"
              >
                Tümünü Temizle
              </button>
            </div>

            {/* Categories filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Kategoriler</h4>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left px-2 py-1 text-xs font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                    selectedCategory === '' 
                      ? 'bg-black text-white' 
                      : 'text-zinc-650 hover:bg-zinc-100'
                  }`}
                >
                  <PawPrint className={`w-3.5 h-3.5 flex-shrink-0 ${selectedCategory === '' ? 'text-white' : 'text-zinc-450'}`} />
                  <span>Tüm Kategoriler</span>
                </button>
                {categories.filter(c => !c.parentId).map(rootCat => {
                  const subCats = categories.filter(c => c.parentId === rootCat.id);
                  const isRootActive = selectedCategory === rootCat.id;
                  return (
                    <div key={rootCat.id} className="space-y-0.5">
                      <button
                        onClick={() => handleCategorySelect(rootCat.id)}
                        className={`w-full text-left px-2 py-1.5 text-xs font-bold rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                          isRootActive 
                            ? 'bg-black text-white' 
                            : 'text-zinc-750 hover:bg-zinc-100'
                        }`}
                      >
                        {renderCategoryIcon(rootCat, isRootActive)}
                        <span>{rootCat.name}</span>
                      </button>
                      {subCats.length > 0 && (
                        <div className="pl-3 space-y-0.5 border-l border-zinc-200 ml-2">
                          {subCats.map(subCat => {
                            const isSubActive = selectedCategory === subCat.id;
                            return (
                              <button
                                key={subCat.id}
                                onClick={() => handleCategorySelect(subCat.id)}
                                className={`w-full text-left px-2 py-1 text-[11px] font-semibold rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                                  isSubActive 
                                    ? 'bg-zinc-200 text-black font-bold' 
                                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'
                                }`}
                              >
                                {renderCategoryIcon(subCat, isSubActive)}
                                <span>{subCat.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Markalar</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                {allBrands.map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-xs text-zinc-750 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="rounded-sm border-zinc-300 text-black focus:ring-black w-3.5 h-3.5"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Maksimum Fiyat</h4>
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={handlePriceChange}
                  onMouseUp={handlePriceRelease}
                  onTouchEnd={handlePriceRelease}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex justify-between text-xs text-zinc-500 font-semibold pt-1">
                  <span>0 TL</span>
                  <span className="text-black font-bold font-mono">{maxPrice} TL</span>
                </div>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="pt-2 border-t border-zinc-100">
              <label className="flex items-center gap-2 text-xs text-zinc-750 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={handleStockToggle}
                  className="rounded-sm border-zinc-300 text-black focus:ring-black w-3.5 h-3.5"
                />
                <span>Sadece Stokta Olanlar</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          {sortedProducts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-lg p-12 text-center space-y-4 max-w-lg mx-auto mt-6">
              <div className="bg-zinc-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-black">Aramanızla Eşleşen Ürün Bulunamadı</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Farklı anahtar kelimeler seçmeyi veya filtreleri sıfırlamayı deneyebilirsiniz.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-black hover:bg-zinc-800 text-white text-xs font-bold px-6 py-2.5 rounded-md transition-colors cursor-pointer"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => {
                const isFav = wishlist.some(item => item.id === product.id);
                return (
                  <div 
                    key={product.id}
                    className="bg-white border border-zinc-200 hover:border-black rounded-lg overflow-hidden flex flex-col group relative transition-all duration-200"
                  >
                    {/* Wishlist Toggle Button */}
                    <button
                      onClick={() => isFav ? removeFromWishlist(product.id) : addToWishlist(product)}
                      className={`absolute top-3 right-3 z-10 p-1.5 rounded-full shadow-xs border cursor-pointer transition-colors ${
                        isFav 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-zinc-400 hover:text-black border-zinc-150'
                      }`}
                      title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-white text-white' : ''}`} />
                    </button>

                    {/* Image */}
                    <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden cursor-pointer border-b border-zinc-150 bg-zinc-50">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center gap-1.5 p-4 text-center group-hover:bg-zinc-800 transition-colors">
                          <PawPrint className="w-7 h-7 text-white/50" />
                          <span className="text-[9px] font-bold text-white/60 tracking-wider">GÖRSEL YOK</span>
                        </div>
                      )}
                      {product.originalPrice && (
                        <span className="absolute bottom-3 left-3 bg-red-650 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          İndirim
                        </span>
                      )}
                      {product.stock === 0 ? (
                        <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                          Tükendi
                        </span>
                      ) : product.stock <= 3 ? (
                        <span className="absolute top-3 left-3 bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase">
                          Son {product.stock} Ürün!
                        </span>
                      ) : null}
                    </Link>

                    {/* Info */}
                    <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">{product.brand}</span>
                        <Link 
                          href={`/product/${product.id}`}
                          className="font-bold text-sm text-zinc-900 hover:underline line-clamp-2 leading-snug cursor-pointer block min-h-[40px]"
                        >
                          {product.title}
                        </Link>
                        
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <div className="flex text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${
                                  i < Math.floor(product.rating) 
                                    ? 'fill-amber-400' 
                                    : 'text-zinc-200'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">({product.reviews.length || 0})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-zinc-150 pt-3 mt-auto">
                        <div>
                          {product.originalPrice && (
                            <span className="text-zinc-400 text-xs line-through block leading-none mb-0.5 font-mono">
                              {product.originalPrice} TL
                            </span>
                          )}
                          <span className="text-sm sm:text-base font-bold text-black font-mono">
                            {product.price} TL
                          </span>
                        </div>

                        <button
                          onClick={() => addToCart(product, 1)}
                          disabled={product.stock === 0}
                          className={`p-2 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${
                            product.stock === 0 
                              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                              : 'bg-black hover:bg-zinc-800 text-white'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Sepete Ekle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Slide-over for filters */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-fadeIn">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-y-0 left-0 max-w-xs w-full bg-white flex flex-col shadow-2xl animate-slideRight">
            <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center">
              <span className="font-bold text-sm text-black">Filtrele</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-zinc-400 hover:text-black cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Kategoriler</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => { handleCategorySelect(''); setShowMobileFilters(false); }}
                    className={`w-full text-left px-2 py-1 text-xs font-semibold rounded-sm flex items-center gap-2 ${
                      selectedCategory === '' ? 'bg-black text-white' : 'text-zinc-650'
                    }`}
                  >
                    <PawPrint className={`w-3.5 h-3.5 flex-shrink-0 ${selectedCategory === '' ? 'text-white' : 'text-zinc-450'}`} />
                    <span>Tüm Kategoriler</span>
                  </button>
                  {categories.filter(c => !c.parentId).map(rootCat => {
                    const subCats = categories.filter(c => c.parentId === rootCat.id);
                    const isRootActive = selectedCategory === rootCat.id;
                    return (
                      <div key={rootCat.id} className="space-y-0.5">
                        <button
                          onClick={() => { handleCategorySelect(rootCat.id); setShowMobileFilters(false); }}
                          className={`w-full text-left px-2 py-1 text-xs font-bold rounded-sm flex items-center gap-2 ${
                            isRootActive ? 'bg-black text-white' : 'text-zinc-700'
                          }`}
                        >
                          {renderCategoryIcon(rootCat, isRootActive)}
                          <span>{rootCat.name}</span>
                        </button>
                        {subCats.length > 0 && (
                          <div className="pl-3 space-y-0.5 border-l border-zinc-200 ml-2">
                            {subCats.map(subCat => {
                              const isSubActive = selectedCategory === subCat.id;
                              return (
                                <button
                                  key={subCat.id}
                                  onClick={() => { handleCategorySelect(subCat.id); setShowMobileFilters(false); }}
                                  className={`w-full text-left px-2 py-1 text-[11px] font-semibold rounded-sm flex items-center gap-1.5 ${
                                    isSubActive ? 'bg-zinc-200 text-black font-bold' : 'text-zinc-500'
                                  }`}
                                >
                                  {renderCategoryIcon(subCat, isSubActive)}
                                  <span>{subCat.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Markalar</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {allBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-xs text-zinc-750 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="rounded-sm border-zinc-300 text-black focus:ring-black w-3.5 h-3.5"
                      />
                      <span>{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Maksimum Fiyat</h4>
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="2500"
                    step="50"
                    value={maxPrice}
                    onChange={handlePriceChange}
                    onMouseUp={handlePriceRelease}
                    onTouchEnd={handlePriceRelease}
                    className="w-full accent-black"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 font-semibold pt-1">
                    <span>0 TL</span>
                    <span className="text-black font-bold font-mono">{maxPrice} TL</span>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="pt-2 border-t border-zinc-100">
                <label className="flex items-center gap-2 text-xs text-zinc-750 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={handleStockToggle}
                    className="rounded-sm border-zinc-300 text-black focus:ring-black w-3.5 h-3.5"
                  />
                  <span>Sadece Stokta Olanlar</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex gap-2">
              <button
                onClick={handleResetFilters}
                className="btn-secondary w-full py-2 text-xs font-bold rounded-md"
              >
                Sıfırla
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn-primary w-full py-2 text-xs font-bold rounded-md text-center block"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopCatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[400px] flex items-center justify-center bg-zinc-50">
        <span className="text-zinc-500 text-sm font-semibold">Yükleniyor...</span>
      </div>
    }>
      <ShopCatalogContent />
    </Suspense>
  );
}

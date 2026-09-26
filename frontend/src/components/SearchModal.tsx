'use client';

import { useState, useEffect } from 'react';
import { getProducts } from '../services/api';
import { Product } from '../types';
import { Search, X, Star, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function SearchModal({ isOpen, onClose, onSelectProduct }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset query and results when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await getProducts({ search: query.trim() });
        setResults(res.success && Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Crucial: If modal is not open, do not render anything
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#F8F6F0] rounded-3xl overflow-hidden shadow-2xl border border-[#EFE9DD] animate-in zoom-in-95 duration-200"
      >
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#EFE9DD] bg-white flex items-center gap-3">
          <Search className="w-5 h-5 text-[#1F3A2E]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search herbal face pack, hair oil, ointment, joint care..."
            autoFocus
            className="w-full bg-transparent text-sm text-[#1A201C] placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {query.trim() === '' ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-slate-400 font-light">Try searching for:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['Face Pack', 'Hair Oil', 'Skin Ointment', 'Joint Care', 'Weight Loss'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 rounded-full bg-white border border-[#EFE9DD] text-xs font-medium text-[#1F3A2E] hover:bg-[#1F3A2E] hover:text-white transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : searching ? (
            <div className="text-center py-8 text-xs text-slate-500 font-light">
              Searching formulations...
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No herbal products found matching "{query}".
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Matching Products ({results.length})
              </span>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-white border border-[#EFE9DD] hover:border-[#1F3A2E] flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                    />
                    <div>
                      <h5 className="font-serif text-sm font-bold text-[#1A201C]">{product.name}</h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="text-[#71846C] font-semibold">{product.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-[#B58A5A]">
                          <Star className="w-3 h-3 fill-current" /> {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#1F3A2E]">₹{product.price}</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

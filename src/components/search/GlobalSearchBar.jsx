import React, { useState, useEffect, useRef } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, MapPin, Briefcase, Loader2, ArrowRight, X } from 'lucide-react';

const G = {
  bg: '#ffffff',
  bg2: '#f7f7f5',
  surface: 'rgba(0,0,0,0.04)',
  border: 'rgba(0,0,0,0.08)',
  text: '#111111',
  muted: 'rgba(17,17,17,0.5)',
  faint: 'rgba(17,17,17,0.3)',
  rose: '#FF4D6D',
  amber: '#FF8C42',
  green: '#06D6A0',
  blue: '#4361EE',
};

export default function GlobalSearchBar({ onSelect = null }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch all providers and categories
  const { data: allProviders = [], isLoading: providersLoading } = useQuery({
    queryKey: ['all-providers-search'],
    queryFn: () => db.ServiceProvider.filter({ is_active: true }, '-rating', 100),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-search'],
    queryFn: () => db.ServiceCategory.list('-created_date', 50),
  });

  // Filter results based on query
  const getSearchResults = () => {
    if (!query.trim()) return { providers: [], categories: [], services: [] };

    const lowerQuery = query.toLowerCase();

    const matchingProviders = allProviders.filter(p =>
      p.business_name?.toLowerCase().includes(lowerQuery) ||
      p.owner_name?.toLowerCase().includes(lowerQuery) ||
      p.location?.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    const matchingCategories = categories.filter(c =>
      c.name?.toLowerCase().includes(lowerQuery)
    ).slice(0, 3);

    return {
      providers: matchingProviders,
      categories: matchingCategories,
    };
  };

  const results = getSearchResults();
  const hasResults = results.providers.length > 0 || results.categories.length > 0;
  const isSearching = providersLoading || categoriesLoading;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProviderClick = (provider) => {
    navigate(createPageUrl(`ProviderProfile?id=${provider.id}`));
    setShowDropdown(false);
    setQuery('');
    onSelect?.('provider', provider);
  };

  const handleCategoryClick = (category) => {
    navigate(createPageUrl(`Browse?q=${encodeURIComponent(category.name)}`));
    setShowDropdown(false);
    setQuery('');
    onSelect?.('category', category);
  };

  const handleSearchAll = () => {
    navigate(createPageUrl(`Browse?q=${encodeURIComponent(query)}`));
    setShowDropdown(false);
    onSelect?.('search', query);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Search size={18} style={{
          position: 'absolute',
          left: 16,
          color: G.muted,
          pointerEvents: 'none',
        }} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => query && setShowDropdown(true)}
          placeholder="Search providers, services, or areas..."
          style={{
            width: '100%',
            padding: '12px 16px 12px 48px',
            borderRadius: 100,
            background: '#f7f7f5',
            border: `1.5px solid ${showDropdown ? '#d4d0ca' : '#e2e0dc'}`,
            color: G.text,
            fontFamily: 'inherit',
            fontSize: 15,
            transition: 'all 0.2s',
            outline: 'none',
          }}
          onMouseEnter={(e) => !showDropdown && (e.currentTarget.style.borderColor = '#d4d0ca')}
          onMouseLeave={(e) => !showDropdown && (e.currentTarget.style.borderColor = '#e2e0dc')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              handleSearchAll();
            }
          }}
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowDropdown(false);
              inputRef.current?.focus();
            }}
            style={{
              position: 'absolute',
              right: 16,
              background: 'none',
              border: 'none',
              color: G.muted,
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: `1px solid #e2e0dc`,
            borderRadius: 16,
            overflow: 'hidden',
            zIndex: 1000,
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          }}
        >
          {!query.trim() ? (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: G.faint, margin: 0 }}>
                Start typing to search...
              </p>
            </div>
          ) : isSearching ? (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <Loader2 size={18} style={{ color: G.rose, margin: '0 auto' }} className="animate-spin" />
            </div>
          ) : !hasResults ? (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: G.faint, margin: 0 }}>
                No results found for "{query}"
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Categories */}
              {results.categories.length > 0 && (
                <>
                  <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid #e2e0dc` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#999999', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
                      Categories
                    </p>
                  </div>
                  {results.categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      style={{
                       width: '100%',
                       padding: '12px 16px',
                       display: 'flex',
                       alignItems: 'center',
                       gap: 12,
                       background: 'none',
                       border: 'none',
                       textAlign: 'left',
                       cursor: 'pointer',
                       transition: 'background 0.15s',
                       borderBottom: `1px solid #f0efed`,
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f5'}
                     onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${G.blue}15`,
                        border: `1px solid ${G.blue}25`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Briefcase size={18} style={{ color: G.blue }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: G.text, margin: 0 }}>
                          {cat.name}
                        </p>
                        <p style={{ fontSize: 11, color: G.faint, margin: '2px 0 0 0' }}>
                          {cat.description?.substring(0, 40)}...
                        </p>
                      </div>
                      <ArrowRight size={14} style={{ color: G.faint }} />
                    </button>
                  ))}
                </>
              )}

              {/* Providers */}
              {results.providers.length > 0 && (
                <>
                  <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid #e2e0dc` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#999999', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
                      Professionals
                    </p>
                  </div>
                  {results.providers.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderClick(provider)}
                      style={{
                       width: '100%',
                       padding: '12px 16px',
                       display: 'flex',
                       alignItems: 'center',
                       gap: 12,
                       background: 'none',
                       border: 'none',
                       textAlign: 'left',
                       cursor: 'pointer',
                       transition: 'background 0.15s',
                       borderBottom: `1px solid #f0efed`,
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.background = '#f7f7f5'}
                     onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: G.amber,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: '#fff',
                        fontSize: 14,
                      }}>
                        {provider.business_name?.charAt(0) || 'P'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: G.text, margin: 0 }}>
                          {provider.business_name}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <MapPin size={11} style={{ color: G.faint }} />
                          <p style={{ fontSize: 11, color: G.faint, margin: 0 }}>
                            {provider.location}
                          </p>
                          {provider.rating && (
                            <>
                              <span style={{ color: G.faint }}>•</span>
                              <span style={{ fontSize: 11, color: G.amber, fontWeight: 600 }}>
                                {provider.rating.toFixed(1)}★
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: G.faint }} />
                    </button>
                  ))}
                </>
              )}

              {/* View All Results */}
              {hasResults && (
                <button
                  onClick={handleSearchAll}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: '#111111',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#222222'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#111111'}
                >
                  View all results for "{query}"
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
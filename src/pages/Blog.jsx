import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { THEME as L } from '@/lib/theme';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta, breadcrumbSchema } from '@/lib/seo';
import SmartEmptyState from '@/components/ui/SmartEmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => db.Blog.filter({ is_published: true }, '-published_date', 100),
    staleTime: 10 * 60 * 1000,
  });

  const categories = [
    { id: '', label: 'All Articles' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'hvac', label: 'HVAC' },
    { id: 'cleaning', label: 'Home Cleaning' },
    { id: 'emergency_repairs', label: 'Emergency Repairs' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'tips', label: 'Tips & Tricks' },
    { id: 'guides', label: 'Guides' },
  ];

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    return result;
  }, [posts, searchQuery, selectedCategory]);

  const pageMeta = generatePageMeta('blog');
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: 'https://serviceconnectpro.com/' },
    { name: 'Blog', url: 'https://serviceconnectpro.com/Blog' },
  ]);

  return (
    <>
      <SeoHelmet
        title={pageMeta.title}
        description={pageMeta.description}
        canonical={pageMeta.canonical}
        schema={breadcrumbs}
      />

      <div style={{ minHeight: '100vh', background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Hero */}
        <div style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, padding: 'clamp(48px, 6vw, 80px) 32px 40px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 3.4rem)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.05, color: L.text, marginBottom: 16 }}>
              Home Service Tips & Guides
            </h1>
            <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: L.text2, fontWeight: 300, lineHeight: 1.7, marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>
              Expert advice for California homeowners on plumbing, HVAC, cleaning, maintenance, and emergency repairs.
            </p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: L.text3 }} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                     width: '100%',
                     padding: '12px 16px 12px 44px',
                     borderRadius: 100,
                     border: `1px solid ${L.border}`,
                     background: L.bg,
                     color: L.text,
                     fontSize: 'clamp(12px, 2vw, 14px)',
                     outline: 'none',
                   }}
              />
            </div>
          </div>
        </div>

        {/* Category filters */}
        <div style={{ borderBottom: `1px solid ${L.border}`, background: L.bg, padding: '14px 32px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid ${active ? L.text : L.border}`,
                    background: active ? L.text : 'transparent',
                    color: active ? '#fff' : L.text2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = L.border2;
                      e.currentTarget.style.background = L.bg3;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.borderColor = L.border;
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {Array(6).fill(0).map((_, i) => (
                <div key={i} style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 16, overflow: 'hidden' }}>
                  <Skeleton className="h-40" />
                  <div style={{ padding: 20 }}>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {filteredPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug || post.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      background: L.bg2,
                      border: `1px solid ${L.border}`,
                      borderRadius: 16,
                      overflow: 'hidden',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = L.border2;
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = L.border;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {post.featured_image && (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        width="320"
                        height="200"
                        loading="lazy"
                        style={{ width: '100%', height: 200, objectFit: 'cover' }}
                      />
                    )}
                    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: L.bg3, color: L.text2, textTransform: 'uppercase' }}>
                          {categories.find(c => c.id === post.category)?.label || post.category}
                        </span>
                        {post.tags?.[0] && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, border: `1px solid ${L.border}`, color: L.text3 }}>
                            {post.tags[0]}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: L.text, marginBottom: 8, lineHeight: 1.3, flex: 1 }}>
                        {post.title}
                      </h3>
                      <p style={{ fontSize: 14, color: L.text2, lineHeight: 1.6, marginBottom: 12, flex: 1 }}>
                        {post.excerpt}
                      </p>
                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: L.text3 }}>
                        {post.published_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Calendar size={13} />
                            {new Date(post.published_date).toLocaleDateString()}
                          </div>
                        )}
                        {post.read_time_minutes && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={13} />
                            {post.read_time_minutes} min read
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <SmartEmptyState
              preset="noResults"
              title="No articles found"
              body="Try adjusting your filters or search to find helpful guides."
            />
          )}
        </div>
      </div>
    </>
  );
}
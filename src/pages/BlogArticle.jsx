import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { THEME as L } from '@/lib/theme';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta, breadcrumbSchema } from '@/lib/seo';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogArticle() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const slug = window.location.pathname.replace('/blog/', '').replace('/', '');

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-article', postId, slug],
    queryFn: async () => {
      if (postId) return db.Blog.get(postId);
      if (slug) {
        const posts = await db.Blog.filter({ slug });
        return posts?.[0] || null;
      }
      return null;
    },
    enabled: !!postId || !!slug,
  });

  useEffect(() => {
    if (post) {
      db.Blog.update(post.id, { views: (post.views || 0) + 1 });
    }
  }, [post?.id]);

  if (!postId && !slug && !post) {
    return (
      <div style={{ minHeight: '100vh', background: L.bg, padding: '40px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: L.text }}>Article not found</h1>
          <button
            onClick={() => navigate('/blog')}
            style={{
              marginTop: 20,
              padding: '10px 20px',
              borderRadius: 100,
              background: L.text,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: L.bg, padding: '40px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ color: L.text2 }}>Loading...</p>
        </div>
      </div>
    );
  }

  const pageMeta = generatePageMeta('blogArticle', {
    title: post.title,
    description: post.excerpt,
  });

  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: 'https://serviceconnectpro.com/' },
    { name: 'Blog', url: 'https://serviceconnectpro.com/Blog' },
    { name: post.title, url: `https://serviceconnectpro.com/BlogArticle?id=${post.id}` },
  ]);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image,
    datePublished: post.published_date,
    dateModified: post.updated_date || post.published_date,
    author: {
      '@type': 'Person',
      name: post.author || 'Service Connect Pro',
    },
  };

  return (
    <>
      <SeoHelmet
        title={post.title + ' | Service Connect Pro Blog'}
        description={post.excerpt}
        canonical={`https://serviceconnectpro.com/BlogArticle?id=${post.id}`}
        schema={breadcrumbs}
      />

      <div style={{ minHeight: '100vh', background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Header */}
        <div style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, padding: '40px 32px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <button
              onClick={() => navigate('/blog')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: L.text2,
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 24,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = L.text}
              onMouseLeave={e => e.currentTarget.style.color = L.text2}
            >
              <ArrowLeft size={16} /> Back to Blog
            </button>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 20, color: L.text }}>
              {post.title}
            </h1>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 14, color: L.text3 }}>
              {post.published_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={16} />
                  {new Date(post.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
              {(post.read_time || post.read_time_minutes) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} />
                  {post.read_time || post.read_time_minutes} min read
                </div>
              )}
              {post.views && (
                <div>
                  {post.views.toLocaleString()} views
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured image */}
        {post.featured_image && (
          <div style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, maxHeight: 400, overflow: 'hidden' }}>
            <img
              src={post.featured_image}
              alt={post.title}
              width="800"
              height="400"
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '60px 32px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Meta info */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
              {post.tags?.map(tag => (
                <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: L.bg2, borderRadius: 100, fontSize: 12, fontWeight: 600, color: L.text2, border: `1px solid ${L.border}` }}>
                  <Tag size={12} />
                  {tag}
                </div>
              ))}
            </div>

            {/* Content */}
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: L.text2,
                fontWeight: 300,
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author info */}
            {post.author && (
              <div style={{ marginTop: 60, paddingTop: 24, borderTop: `1px solid ${L.border}` }}>
                <p style={{ color: L.text3, fontSize: 14 }}>
                  <strong style={{ color: L.text }}>Written by:</strong> {post.author}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { THEME as L } from '@/lib/theme';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogTab() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'guides',
    tags: '',
    keywords: '',
    author: 'Service Connect Pro',
    read_time_minutes: 5,
    is_published: false,
    featured_image: '',
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-admin'],
    queryFn: () => db.Blog.list('-created_date', 50),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.Blog.create({
      ...data,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      published_date: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-admin'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => db.Blog.update(editingId, {
      ...data,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-admin'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.Blog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-admin'] });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'guides',
      tags: '',
      keywords: '',
      author: 'Service Connect Pro',
      read_time_minutes: 5,
      is_published: false,
      featured_image: '',
    });
    setEditingId(null);
  };

  const handleEdit = (post) => {
    setEditingId(post.id);
    setFormData({
      ...post,
      tags: post.tags?.join(', ') || '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: L.text }}>Blog Management</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 16, padding: 20, marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: L.text }}>
          {editingId ? 'Edit Article' : 'New Article'}
        </h3>

        <div style={{ display: 'grid', gap: 16 }}>
          {/* Title */}
          <input
            type="text"
            placeholder="Article title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
            }}
            required
          />

          {/* Slug */}
          <input
            type="text"
            placeholder="URL slug (e.g., 10-signs-hvac-repair)"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
            }}
            required
          />

          {/* Excerpt */}
          <textarea
            placeholder="Short excerpt for meta description"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
              minHeight: 80,
              fontFamily: 'inherit',
            }}
            required
          />

          {/* Content */}
          <textarea
            placeholder="Article content (HTML or plain text)"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
              minHeight: 200,
              fontFamily: 'monospace',
            }}
            required
          />

          {/* Featured Image */}
          <input
            type="text"
            placeholder="Featured image URL"
            value={formData.featured_image}
            onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
            }}
          />

          {/* Category */}
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
            }}
          >
            <option value="plumbing">Plumbing</option>
            <option value="hvac">HVAC</option>
            <option value="cleaning">Home Cleaning</option>
            <option value="emergency_repairs">Emergency Repairs</option>
            <option value="maintenance">Maintenance</option>
            <option value="tips">Tips & Tricks</option>
            <option value="guides">Guides</option>
          </select>

          {/* Tags */}
          <input
            type="text"
            placeholder="Tags (comma-separated, e.g., AC repair, seasonal maintenance)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
            }}
          />

          {/* Keywords */}
          <input
            type="text"
            placeholder="SEO keywords (comma-separated)"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
            }}
          />

          {/* Author */}
          <input
            type="text"
            placeholder="Author name"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
            }}
          />

          {/* Read time */}
          <input
            type="number"
            placeholder="Read time (minutes)"
            value={formData.read_time_minutes}
            onChange={(e) => setFormData({ ...formData, read_time_minutes: parseInt(e.target.value) })}
            min="1"
            max="60"
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${L.border}`,
              background: L.bg,
              color: L.text,
              fontSize: 14,
              outline: 'none',
            }}
          />

          {/* Publish */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
            />
            <span style={{ fontSize: 14, color: L.text }}>Publish article</span>
          </label>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              style={{
                padding: '10px 20px',
                borderRadius: 100,
                background: L.text,
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: createMutation.isPending || updateMutation.isPending ? 0.5 : 1,
              }}
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '10px 20px',
                  borderRadius: 100,
                  background: 'transparent',
                  color: L.text2,
                  border: `1px solid ${L.border}`,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Articles list */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: L.text }}>Articles ({posts.length})</h3>

        {isLoading ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {posts.map(post => (
              <div
                key={post.id}
                style={{
                  background: L.bg2,
                  border: `1px solid ${L.border}`,
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: L.text, marginBottom: 4 }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: L.text3 }}>
                    {post.category} • {post.is_published ? '✓ Published' : '○ Draft'} • {post.views || 0} views
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleEdit(post)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: L.bg,
                      border: `1px solid ${L.border}`,
                      color: L.text2,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                    }}
                  >
                    <Edit size={12} /> Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(post.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: '#fee',
                      border: '1px solid #fcc',
                      color: '#c33',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: L.text3 }}>
            No articles yet. Create one above to get started.
          </div>
        )}
      </div>
    </div>
  );
}
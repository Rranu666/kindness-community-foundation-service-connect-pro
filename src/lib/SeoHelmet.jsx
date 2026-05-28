import React from 'react';

/**
 * Dynamic SEO Meta Tags Manager
 * Injects title, meta description, canonical, Open Graph tags, and JSON-LD schema
 */
export default function SeoHelmet({ title, description, canonical, image, schema = null }) {
  React.useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper: set/create a <meta> tag by attribute selector
    function setMeta(attrs, content) {
      const selector = Object.entries(attrs)
        .map(([k, v]) => `[${k}="${v}"]`)
        .join('');
      let tag = document.querySelector(`meta${selector}`);
      if (!tag) {
        tag = document.createElement('meta');
        Object.entries(attrs).forEach(([k, v]) => tag.setAttribute(k, v));
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    }

    // Standard meta description
    if (description) {
      setMeta({ name: 'description' }, description);
    }

    // Open Graph tags
    if (title) {
      setMeta({ property: 'og:title' }, title);
    }
    if (description) {
      setMeta({ property: 'og:description' }, description);
    }
    if (canonical) {
      setMeta({ property: 'og:url' }, canonical);
    }
    if (image) {
      setMeta({ property: 'og:image' }, image);
    }

    // Twitter Card tags
    if (title) {
      setMeta({ name: 'twitter:title' }, title);
    }
    if (description) {
      setMeta({ name: 'twitter:description' }, description);
    }
    if (image) {
      setMeta({ name: 'twitter:image' }, image);
    }

    // Update or create canonical link
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    // Inject JSON-LD schema
    if (schema) {
      let scriptTag = document.querySelector('script[type="application/ld+json"][data-seo="dynamic"]');
      if (scriptTag) {
        scriptTag.remove();
      }
      const newScript = document.createElement('script');
      newScript.type = 'application/ld+json';
      newScript.setAttribute('data-seo', 'dynamic');
      newScript.innerHTML = JSON.stringify(schema);
      document.head.appendChild(newScript);
    }
  }, [title, description, canonical, image, schema]);

  return null;
}
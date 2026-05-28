import React from 'react';

/**
 * Dynamic SEO Meta Tags Manager
 * Injects title, meta description, canonical, and JSON-LD schema
 */
export default function SeoHelmet({ title, description, canonical, schema = null }) {
  React.useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) {
      metaDesc.content = description;
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
  }, [title, description, canonical, schema]);

  return null;
}
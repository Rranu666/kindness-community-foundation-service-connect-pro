// SEO utility for dynamic meta tags and schema markup

export const generatePageMeta = (page, params = {}) => {
  const baseUrl = 'https://serviceconnectpro.com';

  // City pages dynamic generation
  const cities = {
    'los-angeles': { name: 'Los Angeles', state: 'CA' },
    'san-diego': { name: 'San Diego', state: 'CA' },
    'san-francisco': { name: 'San Francisco', state: 'CA' },
    'san-jose': { name: 'San Jose', state: 'CA' },
    'sacramento': { name: 'Sacramento', state: 'CA' },
    'orange-county': { name: 'Orange County', state: 'CA' },
    'riverside': { name: 'Riverside', state: 'CA' },
    'fresno': { name: 'Fresno', state: 'CA' },
  };

  // Handle city pages first (dynamic)
  if (page === 'cityServices' && params.city && cities[params.city]) {
    const city = cities[params.city];
    return {
      title: `Plumbing, HVAC & Home Services in ${city.name}, ${city.state} | Service Connect Pro`,
      description: `Find licensed plumbers, HVAC technicians, and house cleaners in ${city.name}, California. Verified professionals, instant booking, upfront pricing.`,
      canonical: `${baseUrl}/${params.city}-home-services`,
    };
  }
  
  const pages = {
    home: {
      title: 'Service Connect Pro — Verified Home Services in California | Plumbing, HVAC, Cleaning',
      description: 'Find licensed, background-checked plumbers, HVAC technicians, house cleaners, and emergency repair professionals in California. Upfront pricing, instant booking, 100% satisfaction guarantee.',
      canonical: `${baseUrl}/`,
    },
    about: {
      title: 'Service Connect Pro | Trusted Home Services Marketplace California',
      description: 'Service Connect Pro by KCF LLC connects you with verified plumbers, HVAC techs, cleaners & repair experts across California. Reliable, fast & community-driven.',
      canonical: `${baseUrl}/About`,
    },
    browse: {
      title: params.query 
        ? `${params.query} Professionals in California | Service Connect Pro`
        : 'Find Trusted Home Professionals | Service Connect Pro',
      description: params.query
        ? `Browse verified ${params.query} professionals in California. Licensed, background-checked, instant booking, locked pricing.`
        : 'Browse verified home service professionals in California. Licensed, background-checked, instant booking with locked pricing.',
      canonical: `${baseUrl}/Browse${params.query ? `?q=${encodeURIComponent(params.query)}` : ''}`,
    },
    provider: {
      title: params.name 
        ? `${params.name} | Verified ${params.service || 'Home Service'} Professional | Service Connect Pro`
        : 'Service Professional | Service Connect Pro',
      description: params.name && params.rating
        ? `${params.name} - ${params.rating}★ verified professional. ${params.service} services in California. Licensed, background-checked, instant booking.`
        : 'Verified home service professional in California.',
      canonical: `${baseUrl}/ProviderProfile${params.id ? `/${params.id}` : ''}`,
    },
    voiceRequest: {
      title: 'AI Voice Match — Describe Your Service | Service Connect Pro',
      description: 'Use your voice to describe your home service needs. AI instantly matches you with verified professionals in California.',
      canonical: `${baseUrl}/VoiceRequest`,
    },
    providerSignup: {
      title: 'Join as a Professional | Service Connect Pro',
      description: 'Join California\'s most trusted home services marketplace. No per-lead fees, flat monthly subscription, instant job matching.',
      canonical: `${baseUrl}/ProviderSignup`,
    },
    support: {
      title: 'Support & Help Center | Service Connect Pro',
      description: 'Get help with bookings, billing, account issues, and more. Contact our support team.',
      canonical: `${baseUrl}/Support`,
    },
    blog: {
      title: 'Home Service Tips, Guides & Expert Advice | Service Connect Pro Blog',
      description: 'Read expert tips and guides for California homeowners on plumbing, HVAC, cleaning, maintenance, and emergency home repairs.',
      canonical: `${baseUrl}/Blog`,
    },
    blogArticle: {
      title: params.title ? `${params.title} | Service Connect Pro Blog` : 'Article | Service Connect Pro Blog',
      description: params.description || 'Read expert home service guides and tips from Service Connect Pro.',
      canonical: `${baseUrl}/blog/${params.slug || ''}`,
    },
  };

  return pages[page] || pages.home;
};

export const breadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

export const faqSchema = (faqs = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
});

export const localBusinessSchema = (provider) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: provider.business_name,
  telephone: provider.phone,
  url: `https://serviceconnectpro.com/ProviderProfile/${provider.id}`,
  image: provider.profile_image,
  description: provider.description,
  address: {
    '@type': 'PostalAddress',
    addressLocality: provider.location,
    addressRegion: 'CA',
    addressCountry: 'US',
  },
  areaServed: provider.service_areas || [],
  aggregateRating: provider.rating > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: provider.rating,
    reviewCount: provider.total_reviews || 0,
  } : undefined,
});

export const reviewSchema = (review) => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  author: {
    '@type': 'Person',
    name: review.customer_name,
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: review.rating,
  },
  reviewBody: review.comment,
  datePublished: review.created_date,
});

export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Service Connect Pro',
  url: 'https://serviceconnectpro.com',
  logo: 'https://serviceconnectpro.com/logo.png',
  description: 'California\'s trusted marketplace for verified plumbers, HVAC technicians, house cleaners, and emergency repair professionals.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Newport Beach',
    addressLocality: 'Newport Beach',
    addressRegion: 'CA',
    postalCode: '92660',
    addressCountry: 'US',
  },
  telephone: '+1-949-996-3051',
  email: 'contact@kindnesscommunityfoundation.com',
  sameAs: [
    'https://www.facebook.com/serviceconnectpro',
    'https://www.instagram.com/serviceconnectpro',
    'https://www.linkedin.com/company/service-connect-pro',
  ],
});

export const cityLocalBusinessSchema = (city, state) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: `Service Connect Pro - ${city}`,
  image: 'https://serviceconnectpro.com/logo.png',
  areaServed: `${city}, ${state}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: city,
    addressRegion: state,
    addressCountry: 'US',
  },
  url: `https://serviceconnectpro.com/${city.toLowerCase().replace(/\s+/g, '-')}-home-services`,
  telephone: '+1-949-996-3051',
  priceRange: '$$',
  description: `Find verified plumbers, HVAC technicians, and home cleaners in ${city}, California.`,
});
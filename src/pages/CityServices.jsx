import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Star, CheckCircle, ArrowRight } from 'lucide-react';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta, breadcrumbSchema, cityLocalBusinessSchema } from '@/lib/seo';
import { THEME as L } from '@/lib/theme';

export default function CityServices() {
  // Extract city from URL path
  const pathSegments = window.location.pathname.split('/');
  const cityPath = pathSegments[1]?.replace('-home-services', '').replace(/-/g, ' ');
  const cityName = cityPath ? cityPath.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

  const { data: providers = [] } = useQuery({
    queryKey: ['providers-city', cityName],
    queryFn: () => db.ServiceProvider.filter({ is_active: true, is_verified: true }, '-rating', 50),
    enabled: !!cityName,
  });

  const cityProviders = useMemo(() => {
    return providers.filter(p => 
      p.location?.toLowerCase().includes(cityName.toLowerCase()) ||
      p.service_areas?.some(area => area.toLowerCase().includes(cityName.toLowerCase()))
    ).slice(0, 12);
  }, [providers, cityName]);

  const citySlug = cityPath?.replace(/\s+/g, '-') || '';
  const pageMeta = generatePageMeta('cityServices', { city: citySlug });
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', url: 'https://serviceconnectpro.com/' },
    { name: `${cityName} Services`, url: `https://serviceconnectpro.com/${citySlug}-home-services` },
  ]);
  const schema = cityLocalBusinessSchema(cityName, 'CA');

  return (
    <>
      <SeoHelmet 
        title={pageMeta.title}
        description={pageMeta.description}
        canonical={pageMeta.canonical}
        schema={schema}
      />
      <div style={{ minHeight: '100vh', background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Hero */}
        <div style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, padding: '64px 32px 48px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.2rem)', fontWeight: 700, letterSpacing: '-1.5px', color: L.text, marginBottom: 16 }}>
              Plumbing, HVAC & Home Services in {cityName}, California
            </h1>
            <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: L.text2, maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.7 }}>
              Need a trusted plumber, HVAC technician, or house cleaner in {cityName}? Connect with verified, licensed professionals in minutes.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: L.text3 }}>
              <MapPin size={16} style={{ color: L.accent }} />
              Serving {cityName} and surrounding areas
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 56 }}>
            {['Plumbing', 'HVAC Repair', 'House Cleaning', 'Emergency Repairs', 'Recurring Services'].map(service => (
              <div key={service} style={{ padding: '24px', background: '#fff', border: `1px solid ${L.border}`, borderRadius: 16, textAlign: 'center' }}>
                <CheckCircle size={28} style={{ color: L.accent, margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, fontSize: 14, color: L.text, marginBottom: 8 }}>{service}</p>
                <p style={{ fontSize: 12, color: L.text3, lineHeight: 1.6 }}>Licensed professionals available in {cityName}</p>
              </div>
            ))}
          </div>

          {/* Top Providers */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: L.text }}>Top-Rated Professionals in {cityName}</h2>
              <Link to="/Browse" style={{ textDecoration: 'none' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: L.text, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  View All <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            {cityProviders.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {cityProviders.map(provider => (
                  <div key={provider.id} style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 16, padding: 20, overflow: 'hidden' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: L.bg3, border: `1px solid ${L.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
                      {provider.business_name?.charAt(0)}
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: L.text }}>{provider.business_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, color: L.text2 }}>
                      <Star size={14} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                      {provider.rating?.toFixed(1)} ({provider.total_reviews || 0} reviews)
                    </div>
                    <p style={{ fontSize: 12, color: L.text3, marginBottom: 16, lineHeight: 1.6 }}>{provider.description?.substring(0, 80)}...</p>
                    <Link to={`/ProviderProfile?id=${provider.id}`}>
                      <button style={{ width: '100%', padding: '10px', background: L.text, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                        View Profile
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: L.bg2, borderRadius: 16 }}>
                <p style={{ color: L.text2, marginBottom: 16 }}>No providers available in {cityName} yet</p>
                <Link to="/Browse">
                  <button style={{ padding: '10px 24px', background: L.text, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, cursor: 'pointer' }}>
                    Browse All Professionals
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: L.text, marginBottom: 24, textAlign: 'center' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { q: `How do I find a plumber in ${cityName}?`, a: `Browse our verified plumbers in ${cityName} using our platform. Filter by rating, experience, and service type to find the best match.` },
                { q: `Are professionals in ${cityName} licensed and verified?`, a: `Yes, all professionals on Service Connect Pro are background-checked, licensed, and verified for quality and reliability.` },
                { q: `How quickly can I get service in ${cityName}?`, a: `Most professionals in ${cityName} can respond within 24 hours, with many offering same-day emergency services.` },
              ].map((item, i) => (
                <div key={i} style={{ padding: '20px', background: '#fff', border: `1px solid ${L.border}`, borderRadius: 12 }}>
                  <p style={{ fontWeight: 700, color: L.text, marginBottom: 8 }}>{item.q}</p>
                  <p style={{ fontSize: 14, color: L.text2, lineHeight: 1.6 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
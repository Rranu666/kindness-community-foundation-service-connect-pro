import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Clock, BadgeCheck, ArrowLeft, Phone, Mail, Calendar, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ServiceCard from '@/components/marketplace/ServiceCard';
import ProviderReviewsTab from '@/components/reviews/ProviderReviewsTab';
import BookingModal from '@/components/booking/BookingModal';
import MessageStartButton from '@/components/chat/MessageStartButton';
import { toast } from 'sonner';

const L = {
  bg: '#ffffff', bg2: '#f7f7f5', bg3: '#f0efed',
  border: '#e2e0dc', border2: '#d4d0ca',
  text: '#111111', text2: '#555555', text3: '#999999',
  accent: '#FF4D6D', green: '#06D6A0', blue: '#4361EE',
};

export default function ProviderProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const providerId = urlParams.get('id');
  const [bookingService, setBookingService] = useState(null);

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: async () => { const r = await db.ServiceProvider.filter({ id: providerId }); return r[0]; },
    enabled: !!providerId
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', providerId],
    queryFn: () => db.Service.filter({ provider_id: providerId, is_active: true }),
    enabled: !!providerId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', providerId],
    queryFn: () => db.Review.filter({ provider_id: providerId }, '-created_date', 50),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: category } = useQuery({
    queryKey: ['category', provider?.category_id],
    queryFn: async () => { const c = await db.ServiceCategory.filter({ id: provider.category_id }); return c[0]; },
    enabled: !!provider?.category_id
  });

  const handleShare = () => {
    if (navigator.share) { navigator.share({ title: provider?.business_name, url: window.location.href }); }
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: L.bg }}>
        <Skeleton className="h-56 w-full" />
        <div className="max-w-5xl mx-auto px-6 -mt-16"><Skeleton className="h-64 rounded-2xl" /></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div style={{ minHeight: '100vh', background: L.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: L.text, marginBottom: 12 }}>Provider not found</h2>
          <Link to={createPageUrl('Browse')}><Button>Browse Providers</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: L.bg }}>
      {/* Cover */}
      <div className="relative h-56 md:h-64">
        {(provider.cover_image || provider.avatar_url) ? (
          <img src={provider.cover_image || provider.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: L.bg3 }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 60%)' }} />
        <Link to={createPageUrl('Browse')} className="absolute top-5 left-5">
          <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        </Link>
        <button onClick={handleShare} className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
          <Share2 className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-10 pb-16">
        <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-100">
                  {(provider.profile_image || provider.avatar_url) ? (
                    <img src={provider.profile_image || provider.avatar_url} alt={provider.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-slate-600">{provider.business_name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-0.5px', color: L.text }}>{provider.business_name}</h1>
                  {provider.is_verified && <Badge className="bg-emerald-100 text-emerald-700 border-0"><BadgeCheck className="w-3 h-3 mr-1" />Verified</Badge>}
                  {provider.is_featured && <Badge className="bg-amber-100 text-amber-700 border-0"><Star className="w-3 h-3 mr-1 fill-current" />Featured</Badge>}
                </div>
                <p style={{ color: L.text2, marginBottom: 12 }}>{provider.owner_name}</p>
                <div className="flex flex-wrap gap-4 text-sm mb-3">
                  {provider.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span style={{ fontWeight: 600, color: L.text }}>{provider.rating?.toFixed(1)}</span>
                      <span style={{ color: L.text3 }}>({provider.total_reviews || 0} reviews)</span>
                    </div>
                  )}
                  {provider.location && <div className="flex items-center gap-1" style={{ color: L.text2 }}><MapPin className="w-4 h-4" />{provider.location}</div>}
                  {provider.experience_years && <div className="flex items-center gap-1" style={{ color: L.text2 }}><Clock className="w-4 h-4" />{provider.experience_years}+ years</div>}
                </div>
                {category && <Badge variant="outline" style={{ borderColor: L.border2, color: L.text2 }}>{category.name}</Badge>}
              </div>
              <div className="md:text-right shrink-0">
                {provider.hourly_rate && (
                  <div className="mb-4">
                    <span style={{ fontSize: 24, fontWeight: 800, color: L.text }}>${provider.hourly_rate}</span>
                    <span style={{ color: L.text3 }}>/hr</span>
                  </div>
                )}
                <div className="flex flex-col gap-2 mb-4">
                  {provider.phone && <a href={`tel:${provider.phone}`} className="flex items-center gap-2 text-sm" style={{ color: L.text2 }}><Phone className="w-4 h-4" />{provider.phone}</a>}
                  {provider.email && <a href={`mailto:${provider.email}`} className="flex items-center gap-2 text-sm" style={{ color: L.text2 }}><Mail className="w-4 h-4" />{provider.email}</a>}
                </div>
                <MessageStartButton provider={provider} onConversationOpen={() => { window.location.href = createPageUrl('Inbox'); }} />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="services">
          <TabsList className="bg-stone-50 border border-stone-200">
            <TabsTrigger value="services">Services ({services.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            {services.length > 0 ? (
              <div className="space-y-4">{services.map(s => <ServiceCard key={s.id} service={s} onBook={() => setBookingService(s)} />)}</div>
            ) : (
              <div style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 16, padding: '40px', textAlign: 'center' }}>
                <p style={{ color: L.text3 }}>No services listed yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ProviderReviewsTab reviews={reviews} />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            {(() => {
              const allImages = [...(provider.certifications || []).filter(c => c.startsWith('http')), ...services.flatMap(s => s.images || []).filter(Boolean)];
              return allImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allImages.map((url, i) => <div key={i} className="aspect-square rounded-xl overflow-hidden"><img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" /></div>)}
                </div>
              ) : (
                <div style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 16, padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: L.text3 }}>No portfolio images yet</p>
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '24px' }}>
              <h3 style={{ fontWeight: 700, color: L.text, marginBottom: 16 }}>About {provider.business_name}</h3>
              <p style={{ color: L.text2, marginBottom: 24, lineHeight: 1.7, fontWeight: 300 }}>{provider.description || 'No description provided.'}</p>
              {provider.availability?.length > 0 && (
                <div className="mb-6">
                  <h4 style={{ fontWeight: 600, color: L.text, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar className="w-4 h-4" style={{ color: L.accent }} /> Availability
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.availability.map(day => <Badge key={day} variant="outline">{day}</Badge>)}
                  </div>
                </div>
              )}
              {provider.certifications?.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 600, color: L.text, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BadgeCheck className="w-4 h-4" style={{ color: L.green }} /> Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.certifications.map(cert => <Badge key={cert} className="bg-emerald-100 text-emerald-700 border-0">{cert}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {bookingService && <BookingModal open={!!bookingService} onClose={() => setBookingService(null)} service={bookingService} provider={provider} />}
    </div>
  );
}
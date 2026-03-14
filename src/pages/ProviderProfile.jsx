import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Star, MapPin, Clock, BadgeCheck, ArrowLeft, Phone, Mail,
  Calendar, Share2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ServiceCard from '@/components/marketplace/ServiceCard';
import ReviewCard from '@/components/marketplace/ReviewCard';
import BookingModal from '@/components/booking/BookingModal';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';

const PINK = '#e8356d';

export default function ProviderProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const providerId = urlParams.get('id');

  const [bookingService, setBookingService] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      const results = await base44.entities.ServiceProvider.filter({ id: providerId });
      return results[0];
    },
    enabled: !!providerId
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', providerId],
    queryFn: () => base44.entities.Service.filter({ provider_id: providerId, is_active: true }),
    enabled: !!providerId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', providerId],
    queryFn: () => base44.entities.Review.filter({ provider_id: providerId }, '-created_date'),
    enabled: !!providerId
  });

  const { data: category } = useQuery({
    queryKey: ['category', provider?.category_id],
    queryFn: async () => {
      const cats = await base44.entities.ServiceCategory.filter({ id: provider.category_id });
      return cats[0];
    },
    enabled: !!provider?.category_id
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: provider?.business_name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#0d0d1f' }}>
        <Skeleton className="h-64 w-full opacity-30" />
        <div className="max-w-5xl mx-auto px-6 -mt-16">
          <div className="rounded-2xl p-8" style={{ background: '#13132a' }}>
            <Skeleton className="w-32 h-32 rounded-2xl mb-4 opacity-30" />
            <Skeleton className="h-8 w-64 mb-2 opacity-20" />
            <Skeleton className="h-4 w-48 opacity-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d1f' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Provider not found</h2>
          <Link to={createPageUrl('Browse')}>
            <Button className="text-white border-0" style={{ background: PINK }}>Browse Providers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d0d1f' }}>
      {/* Cover */}
      <div className="relative h-56 md:h-72">
        {provider.cover_image ? (
          <img src={provider.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0d0d1f 100%)' }} />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,13,31,0.85) 0%, transparent 60%)' }} />
        <Link to={createPageUrl('Browse')} className="absolute top-5 left-5">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <button onClick={handleShare} className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-16">
        <div className="rounded-2xl shadow-xl overflow-hidden mb-6" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-2 overflow-hidden" style={{ borderColor: PINK, background: 'linear-gradient(135deg, #e8356d, #9333ea)' }}>
                  {provider.profile_image ? (
                    <img src={provider.profile_image} alt={provider.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{provider.business_name?.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{provider.business_name}</h1>
                  {provider.is_verified && (
                    <Badge className="text-white border-0" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                      <BadgeCheck className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {provider.is_featured && (
                    <Badge className="text-white border-0" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>

                <p className="mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>{provider.owner_name}</p>

                <div className="flex flex-wrap gap-4 text-sm mb-3">
                  {provider.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-white">{provider.rating?.toFixed(1)}</span>
                      <span style={{ color: 'rgba(255,255,255,0.45)' }}>({provider.total_reviews || 0} reviews)</span>
                    </div>
                  )}
                  {provider.location && (
                    <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <MapPin className="w-4 h-4" />
                      {provider.location}
                    </div>
                  )}
                  {provider.experience_years && (
                    <div className="flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <Clock className="w-4 h-4" />
                      {provider.experience_years}+ years experience
                    </div>
                  )}
                </div>

                {category && (
                  <Badge variant="outline" style={{ borderColor: 'rgba(232,53,109,0.3)', color: PINK }}>
                    {category.name}
                  </Badge>
                )}
              </div>

              {/* Price & Contact */}
              <div className="md:text-right shrink-0">
                {provider.hourly_rate && (
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-white">${provider.hourly_rate}</span>
                    <span style={{ color: 'rgba(255,255,255,0.45)' }}>/hr</span>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {provider.phone && (
                    <a href={`tel:${provider.phone}`} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <Phone className="w-4 h-4" />
                      {provider.phone}
                    </a>
                  )}
                  {provider.email && (
                    <a href={`mailto:${provider.email}`} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <Mail className="w-4 h-4" />
                      {provider.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services">
          <TabsList style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
            <TabsTrigger value="services" className="data-[state=active]:text-white data-[state=active]:bg-white/15 hover:bg-white/10 hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Services ({services.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:text-white data-[state=active]:bg-white/15 hover:bg-white/10 hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:text-white data-[state=active]:bg-white/15 hover:bg-white/10 hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:text-white data-[state=active]:bg-white/15 hover:bg-white/10 hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-6">
            {services.length > 0 ? (
              <div className="space-y-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onBook={() => setBookingService(service)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-10 text-center" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.1)' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No services listed yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} dark />
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-10 text-center" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.1)' }}>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>No reviews yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            {(() => {
              const portfolioImages = (provider.certifications || []).filter(c => c.startsWith('http'));
              const serviceImages = services.flatMap(s => s.images || []).filter(Boolean);
              const allImages = [...portfolioImages, ...serviceImages];
              return allImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allImages.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden">
                      <img src={url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl p-10 text-center" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.1)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>No portfolio images yet</p>
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="rounded-2xl p-6" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.15)' }}>
              <h3 className="font-semibold text-white mb-4">About {provider.business_name}</h3>
              <p className="mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>{provider.description || 'No description provided.'}</p>

              {(() => {
                const avail = Array.isArray(provider.availability)
                  ? provider.availability
                  : typeof provider.availability === 'string' && provider.availability
                    ? provider.availability.split(',').map(s => s.trim()).filter(Boolean)
                    : [];
                return avail.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="font-medium text-white mb-3 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: PINK }} />
                      Availability
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {avail.map((day) => (
                        <Badge key={day} variant="outline" style={{ borderColor: 'rgba(232,53,109,0.3)', color: 'rgba(255,255,255,0.7)' }}>{day}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {(() => {
                const certs = Array.isArray(provider.certifications)
                  ? provider.certifications
                  : typeof provider.certifications === 'string' && provider.certifications
                    ? provider.certifications.split(',').map(s => s.trim()).filter(Boolean)
                    : [];
                return certs.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-white mb-3 text-sm flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" style={{ color: PINK }} />
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {certs.map((cert) => (
                        <Badge key={cert} className="text-white border-0" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>{cert}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {bookingService && (
        <BookingModal
          open={!!bookingService}
          onClose={() => setBookingService(null)}
          service={bookingService}
          provider={provider}
        />
      )}
    </div>
  );
}
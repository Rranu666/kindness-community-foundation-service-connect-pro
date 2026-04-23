import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Star, MapPin, Clock, BadgeCheck, ArrowLeft, Share2,
  ChevronDown, ChevronUp, Zap, Calendar, Image as ImageIcon,
  DollarSign, ShieldCheck, Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReviewCard from '@/components/marketplace/ReviewCard';
import BookingModal from '@/components/booking/BookingModal';
import { toast } from 'sonner';

const PINK = '#cb3c7a';

const priceTypeLabels = {
  fixed: 'Fixed Price',
  hourly: 'Per Hour',
  per_visit: 'Per Visit',
  negotiable: 'Negotiable',
};

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="pb-4">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-medium text-white text-sm">{faq.question}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: PINK }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />}
      </button>
      {open && <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{faq.answer}</p>}
    </div>
  );
}

export default function ServiceDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceId = urlParams.get('id');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: service, isLoading: loadingService } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const results = await base44.entities.Service.filter({ id: serviceId });
      return results[0];
    },
    enabled: !!serviceId
  });

  const { data: provider } = useQuery({
    queryKey: ['provider', service?.provider_id],
    queryFn: async () => {
      const results = await base44.entities.ServiceProvider.filter({ id: service.provider_id });
      return results[0];
    },
    enabled: !!service?.provider_id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', service?.provider_id],
    queryFn: () => base44.entities.Review.filter({ provider_id: service.provider_id }, '-created_date'),
    enabled: !!service?.provider_id
  });

  const { data: taxConfigs = [] } = useQuery({
    queryKey: ['taxConfigs'],
    queryFn: () => base44.entities.TaxConfig.filter({ is_active: true })
  });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const taxRate = taxConfigs[0]?.tax_rate || 0;
  const commission = 10;
  const taxAmount = service ? ((service.price * taxRate) / 100) : 0;
  const commissionAmount = service ? ((service.price * commission) / 100) : 0;
  const total = service ? service.price + taxAmount : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.name,
        text: service?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loadingService) {
    return (
      <div className="min-h-screen" style={{ background: '#0f0900' }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Skeleton className="h-72 w-full rounded-2xl mb-8 opacity-30" />
          <Skeleton className="h-8 w-64 mb-4 opacity-20" />
          <Skeleton className="h-4 w-full mb-2 opacity-20" />
          <Skeleton className="h-4 w-2/3 opacity-20" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0900' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Service not found</h2>
          <Link to={createPageUrl('Browse')}>
            <Button className="text-white border-0" style={{ background: PINK }}>Browse Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = service.images?.filter(Boolean) || [];

  return (
    <div className="min-h-screen" style={{ background: '#0f0900' }}>
      {/* Mobile sticky Book Now bar */}
      <div className="lg:hidden sticky top-16 z-40 px-4 py-2" style={{ background: 'rgba(15,9,0,0.95)', borderBottom: '1px solid rgba(203,60,122,0.2)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">${service?.price?.toLocaleString()}</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{priceTypeLabels[service?.price_type] || ''}</span>
          </div>
          <Button
            className="flex-1 h-10 text-white font-semibold rounded-xl border-0 max-w-[200px]"
            style={{ background: PINK }}
            onClick={() => setBookingOpen(true)}
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            Book Now
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Back */}
        <Link to={provider ? createPageUrl(`ProviderProfile?id=${provider.id}`) : createPageUrl('Browse')} className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.15)' }}>
              {images.length > 0 ? (
                <>
                  <div className="aspect-video">
                    <img src={images[selectedImage]} alt={service.name} className="w-full h-full object-cover" />
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className="w-16 h-12 rounded-lg overflow-hidden border-2 transition-all"
                          style={{ borderColor: selectedImage === i ? PINK : 'transparent' }}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(203,60,122,0.1) 0%, rgba(239,68,68,0.1) 100%)' }}>
                  <ImageIcon className="w-16 h-16" style={{ color: 'rgba(203,60,122,0.3)' }} />
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div>
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <h1 className="text-2xl font-bold text-white flex-1">{service.name}</h1>
                <div className="flex gap-2">
                  {service.is_instant_booking && (
                    <Badge className="text-white border-0" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                      <Zap className="w-3 h-3 mr-1" /> Instant Booking
                    </Badge>
                  )}
                  {service.is_featured && (
                    <Badge className="text-white border-0" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                      <Star className="w-3 h-3 mr-1 fill-current" /> Featured
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {service.price_type && (
                  <Badge variant="outline" style={{ borderColor: 'rgba(203,60,122,0.3)', color: PINK }}>
                    {priceTypeLabels[service.price_type] || service.price_type}
                  </Badge>
                )}
                {service.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    ~{service.duration_minutes} min
                  </span>
                )}
                {avgRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {avgRating} ({reviews.length} reviews)
                  </span>
                )}
              </div>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {service.description || 'No description provided.'}
              </p>
            </div>

            {/* Provider Info */}
            {provider && (
              <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.15)' }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, #cb3c7a, #ef4444)' }}>
                  {provider.profile_image ? (
                    <img src={provider.profile_image} alt={provider.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                      {provider.business_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{provider.business_name}</span>
                    {provider.is_verified && (
                      <BadgeCheck className="w-4 h-4" style={{ color: '#10b981' }} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {provider.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{provider.location}</span>
                    )}
                    {provider.rating > 0 && (
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{provider.rating?.toFixed(1)} rating</span>
                    )}
                    {provider.experience_years && (
                      <span>{provider.experience_years}+ yrs exp</span>
                    )}
                  </div>
                </div>
                <Link to={createPageUrl(`ProviderProfile?id=${provider.id}`)}>
                  <Button variant="outline" size="sm" className="text-white" style={{ borderColor: 'rgba(203,60,122,0.3)', background: 'transparent' }}>
                    View Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  {reviews.slice(0, 5).map(review => (
                    <ReviewCard key={review.id} review={review} dark />
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {service.faqs?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
                <div className="rounded-2xl p-5 space-y-4" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.15)' }}>
                  {service.faqs.map((faq, i) => (
                    <FAQItem key={i} faq={faq} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl p-6 space-y-5" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.25)' }}>
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-white">${service.price?.toLocaleString()}</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {priceTypeLabels[service.price_type] || ''}
                  </span>
                </div>
                {service.price_type === 'negotiable' && (
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Price subject to negotiation</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="rounded-xl p-4 space-y-2 text-sm" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" style={{ color: PINK }} />
                  Price Breakdown
                </h4>
                <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span>Service Price</span>
                  <span className="text-white">${service.price?.toLocaleString()}</span>
                </div>
                {taxRate > 0 && (
                  <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span>Tax ({taxRate}%)</span>
                    <span className="text-white">${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span>Platform Fee ({commission}%)</span>
                  <span className="text-white">${commissionAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-white" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span>Estimated Total</span>
                  <span style={{ color: PINK }}>${(total + commissionAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Book Button */}
              <Button
                className="w-full h-12 text-white font-semibold rounded-xl border-0"
                style={{ background: PINK }}
                onClick={() => setBookingOpen(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Now
              </Button>

              <Button
                variant="outline"
                className="w-full text-white"
                style={{ borderColor: 'rgba(203,60,122,0.3)', background: 'transparent' }}
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Service
              </Button>

              {/* Trust badges */}
              <div className="pt-2 space-y-2">
                {[
                  { icon: ShieldCheck, text: 'Secure & verified booking' },
                  { icon: Clock, text: 'Flexible scheduling' },
                  { icon: BadgeCheck, text: 'Quality guaranteed' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: PINK }} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {bookingOpen && provider && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          service={service}
          provider={provider}
        />
      )}
    </div>
  );
}
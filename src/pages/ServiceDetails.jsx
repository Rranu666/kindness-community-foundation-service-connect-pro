import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Star, MapPin, Clock, BadgeCheck, ArrowLeft, Share2, ChevronDown, ChevronUp, Zap, Calendar, Image as ImageIcon, DollarSign, ShieldCheck, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReviewCard from '@/components/marketplace/ReviewCard';
import BookingModal from '@/components/booking/BookingModal';
import { toast } from 'sonner';

const L = {
  bg: '#ffffff', bg2: '#f7f7f5', bg3: '#f0efed',
  border: '#e2e0dc', border2: '#d4d0ca',
  text: '#111111', text2: '#555555', text3: '#999999',
  accent: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
};

const priceTypeLabels = { fixed: 'Fixed Price', hourly: 'Per Hour', per_visit: 'Per Visit', negotiable: 'Negotiable' };

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${L.border}`, paddingBottom: 16 }}>
      <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen(o => !o)}>
        <span style={{ fontWeight: 600, color: L.text, fontSize: 14 }}>{faq.question}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: L.accent }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: L.text3 }} />}
      </button>
      {open && <p className="mt-2 text-sm" style={{ color: L.text2, lineHeight: 1.7, fontWeight: 300 }}>{faq.answer}</p>}
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
    queryFn: async () => { const r = await db.Service.filter({ id: serviceId }); return r[0]; },
    enabled: !!serviceId
  });

  const { data: provider } = useQuery({
    queryKey: ['provider', service?.provider_id],
    queryFn: async () => { const r = await db.ServiceProvider.filter({ id: service.provider_id }); return r[0]; },
    enabled: !!service?.provider_id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', service?.provider_id],
    queryFn: () => db.Review.filter({ provider_id: service.provider_id }, '-created_date'),
    enabled: !!service?.provider_id
  });

  const { data: taxConfigs = [] } = useQuery({
    queryKey: ['taxConfigs'],
    queryFn: () => db.TaxConfig.filter({ is_active: true })
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;
  const taxRate = taxConfigs[0]?.tax_rate || 0;
  const commission = 10;
  const taxAmount = service ? ((service.price * taxRate) / 100) : 0;
  const commissionAmount = service ? ((service.price * commission) / 100) : 0;
  const total = service ? service.price + taxAmount : 0;

  const handleShare = () => {
    if (navigator.share) { navigator.share({ title: service?.name, text: service?.description, url: window.location.href }); }
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
  };

  if (loadingService) {
    return (
      <div style={{ background: L.bg, minHeight: '100vh' }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Skeleton className="h-72 w-full rounded-2xl mb-8" />
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div style={{ background: L.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: L.text, marginBottom: 12 }}>Service not found</h2>
          <Link to={createPageUrl('Browse')}><Button>Browse Services</Button></Link>
        </div>
      </div>
    );
  }

  const images = service.images?.filter(Boolean) || [];

  return (
    <div style={{ background: L.bg, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link to={provider ? createPageUrl(`ProviderProfile?id=${provider.id}`) : createPageUrl('Browse')}
          className="inline-flex items-center gap-2 mb-6 text-sm" style={{ color: L.text2 }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${L.border}` }}>
              {images.length > 0 ? (
                <>
                  <div className="aspect-video"><img src={images[selectedImage]} alt={service.name} className="w-full h-full object-cover" /></div>
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3" style={{ background: L.bg2 }}>
                      {images.map((img, i) => (
                        <button key={i} onClick={() => setSelectedImage(i)}
                          className="w-16 h-12 rounded-lg overflow-hidden border-2 transition-all"
                          style={{ borderColor: selectedImage === i ? L.accent : 'transparent' }}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video flex items-center justify-center" style={{ background: L.bg3 }}>
                  <ImageIcon className="w-16 h-16" style={{ color: L.border2 }} />
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: L.text, flex: 1 }}>{service.name}</h1>
                <div className="flex gap-2">
                  {service.is_instant_booking && <Badge className="bg-emerald-100 text-emerald-700 border-0"><Zap className="w-3 h-3 mr-1" />Instant</Badge>}
                  {service.is_featured && <Badge className="bg-amber-100 text-amber-700 border-0"><Star className="w-3 h-3 mr-1 fill-current" />Featured</Badge>}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {service.price_type && <Badge variant="outline" style={{ borderColor: L.border2, color: L.text2 }}>{priceTypeLabels[service.price_type] || service.price_type}</Badge>}
                {service.duration_minutes && <span className="flex items-center gap-1" style={{ color: L.text2 }}><Clock className="w-4 h-4" />~{service.duration_minutes} min</span>}
                {avgRating && <span className="flex items-center gap-1" style={{ color: L.text2 }}><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{avgRating} ({reviews.length} reviews)</span>}
              </div>
              <p style={{ lineHeight: 1.7, color: L.text2, fontWeight: 300 }}>{service.description || 'No description provided.'}</p>
            </div>

            {/* Provider */}
            {provider && (
              <div style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                  {(provider.profile_image || provider.avatar_url) ? <img src={provider.profile_image || provider.avatar_url} alt={provider.business_name} className="w-full h-full object-cover" /> :
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-slate-600">{provider.business_name?.charAt(0)}</div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontWeight: 600, color: L.text }}>{provider.business_name}</span>
                    {provider.is_verified && <BadgeCheck className="w-4 h-4" style={{ color: L.green }} />}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: L.text3 }}>
                    {provider.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{provider.location}</span>}
                    {provider.rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{provider.rating?.toFixed(1)}</span>}
                  </div>
                </div>
                <Link to={createPageUrl(`ProviderProfile?id=${provider.id}`)}>
                  <Button variant="outline" size="sm">View Profile</Button>
                </Link>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: L.text, marginBottom: 16 }}>Customer Reviews</h3>
                <div className="space-y-4">{reviews.slice(0, 5).map(review => <ReviewCard key={review.id} review={review} />)}</div>
              </div>
            )}

            {/* FAQs */}
            {service.faqs?.length > 0 && (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: L.text, marginBottom: 16 }}>FAQs</h3>
                <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 16, padding: '20px' }} className="space-y-4">
                  {service.faqs.map((faq, i) => <FAQItem key={i} faq={faq} />)}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24" style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '24px' }}>
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <span style={{ fontSize: 32, fontWeight: 800, color: L.text }}>${service.price?.toLocaleString()}</span>
                  <span style={{ fontSize: 14, color: L.text3 }}>{priceTypeLabels[service.price_type] || ''}</span>
                </div>
              </div>

              <div style={{ borderRadius: 12, padding: '16px', background: L.bg2, marginBottom: 20 }} className="space-y-2 text-sm">
                <h4 style={{ fontWeight: 600, color: L.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign className="w-4 h-4" style={{ color: L.accent }} /> Price Breakdown
                </h4>
                <div className="flex justify-between" style={{ color: L.text2 }}><span>Service Price</span><span style={{ color: L.text, fontWeight: 600 }}>${service.price?.toLocaleString()}</span></div>
                {taxRate > 0 && <div className="flex justify-between" style={{ color: L.text2 }}><span>Tax ({taxRate}%)</span><span style={{ color: L.text }}>${taxAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between" style={{ color: L.text2 }}><span>Platform Fee ({commission}%)</span><span style={{ color: L.text }}>${commissionAmount.toFixed(2)}</span></div>
                <div style={{ borderTop: `1px solid ${L.border}`, paddingTop: 8 }} className="flex justify-between font-semibold">
                  <span style={{ color: L.text }}>Estimated Total</span>
                  <span style={{ color: L.accent, fontWeight: 800 }}>${(total + commissionAmount).toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full h-12 bg-slate-900 hover:bg-slate-700 text-white font-semibold rounded-xl mb-3" onClick={() => setBookingOpen(true)}>
                <Calendar className="w-4 h-4 mr-2" /> Book Now
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" /> Share Service
              </Button>

              <div className="pt-4 space-y-2">
                {[{ icon: ShieldCheck, text: 'Secure & verified booking' }, { icon: Clock, text: 'Flexible scheduling' }, { icon: BadgeCheck, text: 'Quality guaranteed' }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs" style={{ color: L.text3 }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: L.accent }} /> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {bookingOpen && provider && <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} service={service} provider={provider} />}
    </div>
  );
}
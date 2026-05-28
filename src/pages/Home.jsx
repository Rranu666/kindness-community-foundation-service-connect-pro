import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import {
  ArrowRight, Shield, Clock, Star, CheckCircle, MapPin,
  BadgeCheck, Mic, Wrench, Wind, Sparkles, DollarSign,
  XCircle, Ban, Frown, SmilePlus, RefreshCw, Bell,
  CreditCard, Lock, Repeat, MessageCircle, ChevronDown,
  Zap, Phone, Mail
} from 'lucide-react';
import Logo from '@/components/Logo';
import GlobalSearchBar from '@/components/search/GlobalSearchBar';
import ReferralLinkHandler from '@/components/referral/ReferralLinkHandler';
import MobileMenuButton from '@/components/home/MobileMenuButton';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta, faqSchema } from '@/lib/seo';

// ─── LIGHT THEME TOKENS ──────────────────────────────────────────────
const L = {
  bg:      '#ffffff',
  bg2:     '#f7f7f5',
  bg3:     '#f0efed',
  bg4:     '#e8e6e2',
  border:  '#e2e0dc',
  border2: '#d4d0ca',
  text:    '#111111',
  text2:   '#555555',
  text3:   '#999999',
  accent:  '#FF4D6D',
  accent2: '#FF8C42',
  green:   '#06D6A0',
  blue:    '#4361EE',
  purple:  '#7C3AED',
  grad:    'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
  gradText:'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
  ease:    'cubic-bezier(0.4,0,0.2,1)',
};

// ─── ANIMATIONS ──────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes logoScroll   { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes liveBlip { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.5);opacity:0.4;} }
  @keyframes floatCard { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-8px);} }
  @keyframes pulse2s { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.3);} }
  @keyframes wordIn { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
`;

// ─── CYCLING WORD ────────────────────────────────────────────────────
function CyclingWord({ words }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIndex(i => (i + 1) % words.length); setVisible(true); }, 300);
    }, 2800);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span style={{
      display: 'inline-block', fontStyle: 'italic', fontWeight: 300, color: L.text2,
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-12px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {words[index]}
    </span>
  );
}

// ─── TICKER ──────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '/ Verified California Pros',
  '/ Locked-In Pricing',
  '/ Same-Day Booking',
  '/ Background Checked',
  '/ 100% Guaranteed',
  '/ Plumbing',
  '/ HVAC',
  '/ Home Cleaning',
  '/ Emergency Repairs',
  '/ Recurring Services',
];

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ overflow: 'hidden', background: L.bg3, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}`, padding: '14px 0' }}>
      <div style={{ display: 'flex', width: 'max-content', animation: 'tickerScroll 28s linear infinite' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 24, fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: L.text3, padding: '0 20px', whiteSpace: 'nowrap' }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────
const SERVICES = [
  {
    slug: 'Plumbing', emoji: '🔧', label: 'Plumbing',
    tagline: 'Leaks, clogs, pipes & water heaters', price: 'From $89', eta: '~2 hr',
    color: L.blue, img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    tags: ['Emergency', 'Leaks', 'Drains', 'Water Heaters'],
  },
  {
    slug: 'HVAC', emoji: '❄️', label: 'HVAC',
    tagline: 'AC & heating, licensed techs', price: 'From $129', eta: '~4 hr',
    color: L.accent, img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    tags: ['AC Repair', 'Heating', 'Duct Clean', 'Tune-ups'],
  },
  {
    slug: 'Home Cleaning', emoji: '✨', label: 'Home Cleaning',
    tagline: 'Vetted cleaners, recurring or one-time', price: 'From $69', eta: 'Same day',
    color: L.green, img: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    tags: ['Deep Clean', 'Move-In/Out', 'Weekly', 'Eco'],
  },
  {
    slug: 'Emergency Repairs', emoji: '🚨', label: 'Emergency Repairs',
    tagline: 'Urgent fixes, 24/7 rapid response', price: 'From $99', eta: '<2 hr',
    color: L.accent2, img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    tags: ['24/7', 'Urgent', 'Handyman', 'Same Day'],
  },
  {
    slug: 'Recurring Services', emoji: '🔄', label: 'Recurring Services',
    tagline: 'Scheduled plans, preventive maintenance', price: 'From $49/mo', eta: 'Flexible',
    color: L.purple, img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
    tags: ['Monthly Plans', 'Preventive', 'Savings', 'Auto-Schedule'],
  },
];

const STATS = [
  { v: '2,400+', l: 'Verified pros', s: 'Licensed & background-checked' },
  { v: '4.97★',  l: 'Average rating', s: 'Across 6,200+ reviews' },
  { v: '<60min', l: 'Response time', s: 'Most requests matched instantly' },
  { v: '100%',   l: 'Satisfaction guarantee', s: 'Or we make it right, free' },
];

const PAINS_CUSTOMER = [
  { icon: XCircle,    pain: 'Contractor no-shows', fix: 'GPS-tracked arrivals + penalty system', c: L.accent },
  { icon: Ban,        pain: 'Hidden pricing', fix: 'Price locked before work begins', c: L.accent2 },
  { icon: Frown,      pain: 'Unverified strangers', fix: 'License + background check on all pros', c: L.purple },
  { icon: Clock,      pain: 'Days waiting', fix: 'Providers respond within 60 min', c: L.blue },
];

const PAINS_PROVIDER = [
  { icon: DollarSign, pain: '$30–$200 per fake lead', fix: 'Flat monthly fee — unlimited matches', c: L.accent },
  { icon: RefreshCw,  pain: 'Bidding against 10 others', fix: 'AI sends exclusive matched jobs only', c: L.accent2 },
  { icon: CreditCard, pain: 'Waiting 30 days to get paid', fix: 'Paid within 24 hrs of approval', c: L.green },
  { icon: Bell,       pain: 'Missing jobs while offline', fix: 'Instant push + SMS for every job', c: L.blue },
];

const STEPS = {
  customer: [
    { n: '01', title: 'Describe in 30 sec', body: 'Type or tap the mic — AI categorizes your request instantly.' },
    { n: '02', title: 'See matched pros', body: 'Verified nearby providers with upfront pricing and real ETA.' },
    { n: '03', title: 'Book & pay safely', body: 'Secure payment — locked pricing with satisfaction guarantee.' },
    { n: '04', title: 'Rate & save', body: 'Build your trusted home team with automated reminders.' },
  ],
  provider: [
    { n: '01', title: 'Create your profile', body: 'Upload license & insurance. Verified in 24–48 hours.' },
    { n: '02', title: 'Get matched jobs', body: 'AI sends only jobs that fit your skills and schedule.' },
    { n: '03', title: 'Work & get paid fast', body: 'Customer approves → money in your account within 24 hrs.' },
    { n: '04', title: 'Grow your business', body: 'Dashboard, analytics, invoicing — everything to scale.' },
  ],
};

const TESTIMONIALS = [
  { name: 'Maria G.', city: 'Los Angeles, CA', avatar: 'MG', role: 'Homeowner',
    text: 'Posted at 8am, verified tech at my door by 11am. Price was exactly quoted. Never going back to other platforms.', rating: 5 },
  { name: 'James T.', city: 'San Diego, CA', avatar: 'JT', role: 'HVAC Contractor',
    text: 'Was spending $800/mo on leads from other platforms — half fake. Flat fee here, made it back in week one.', rating: 5 },
  { name: 'Sofia R.', city: 'San Jose, CA', avatar: 'SR', role: 'Property Manager',
    text: 'Set up recurring weekly cleaning for 3 units in one dashboard. Fixed pricing means I always know what I\'m paying.', rating: 5 },
  { name: 'David M.', city: 'San Francisco, CA', avatar: 'DM', role: 'Homeowner',
    text: 'Had a water leak at midnight. Someone was at my door in 90 minutes. Professional, fair price, problem solved.', rating: 5 },
  { name: 'Alex K.', city: 'Sacramento, CA', avatar: 'AK', role: 'Plumbing Business',
    text: 'No fake leads, no bidding wars, and we get paid within 24 hours. Best decision ever for our business.', rating: 5 },
  { name: 'Jessica L.', city: 'Oakland, CA', avatar: 'JL', role: 'Homeowner',
    text: 'Three quotes in 45 minutes, all transparent pricing upfront. Saved 40% vs other platforms. Worth every minute.', rating: 5 },
];

const FAQS = [
  { q: 'How do you verify providers?', a: 'License, insurance, criminal background, and identity checks — before their first job. Re-verified annually.' },
  { q: 'What if I\'m not happy?', a: 'Not satisfied? We send another provider free or refund 100%. No questions asked.' },
  { q: 'How fast can I get help?', a: 'Most jobs matched within 30–60 min. Emergency plumbing/HVAC on-site in 2–4 hours.' },
  { q: 'Why list here instead of others?', a: 'Flat subscription — no per-lead fees. Exclusive AI-matched jobs. Paid within 24 hours. Other platforms charge per lead and sell it to 10+ contractors.' },
  { q: 'Are prices fixed?', a: 'Quotes locked before work begins. Providers cannot charge more. Extras need your approval.' },
  { q: 'What services do you offer?', a: 'We offer 5 focused categories: Plumbing, HVAC, Home Cleaning, Emergency Repairs, and Recurring Services. All in California — covering 90% of all home service needs.' },
  { q: 'Where are you available?', a: 'California only — starting in LA, San Diego, San Jose, SF, Sacramento, and Orange County. Focused means faster response and better vetting.' },
];

const CLIENTS = [
  'Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Sacramento',
  'Orange County', 'Irvine', 'Fresno', 'Oakland', 'Long Beach',
  'Riverside', 'Anaheim', 'Bakersfield', 'Santa Ana', 'Stockton',
];

// ─── SERVICE ACCORDION ITEM ──────────────────────────────────────────
function ServiceAccordionItem({ svc, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${L.border}`, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '22px 0', cursor: 'pointer', transition: 'padding 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.paddingLeft = '12px'}
        onMouseLeave={e => e.currentTarget.style.paddingLeft = '0px'}>
        <span style={{ fontSize: 13, color: L.text3, fontWeight: 500, minWidth: 28 }}>0{index + 1}</span>
        <span style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, letterSpacing: '-1px', flex: 1, color: L.text }}>
          {svc.emoji} {svc.label}
        </span>
        <span style={{ fontSize: 13, color: L.text3, marginRight: 16 }} className="hidden sm:block">{svc.price}</span>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', border: `1px solid ${L.border2}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s', flexShrink: 0,
          background: open ? L.text : 'transparent',
          transform: open ? 'rotate(45deg)' : 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={open ? '#fff' : L.text2} strokeWidth="2" strokeLinecap="round">
            <line x1="7" y1="1" x2="7" y2="13" /><line x1="1" y1="7" x2="13" y2="7" />
          </svg>
        </div>
      </div>
      {open && (
        <div style={{ paddingBottom: 20, paddingLeft: 48 }}>
          <p style={{ fontSize: 15, color: L.text2, fontWeight: 300, lineHeight: 1.7, marginBottom: 14 }}>{svc.tagline} — {svc.price} · {svc.eta}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {svc.tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, border: `1px solid ${L.border2}`, color: L.text2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{tag}</span>
            ))}
            <Link to={createPageUrl(`Browse?q=${encodeURIComponent(svc.slug)}`)}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: L.text, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>Book now →</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NAV LINK ─────────────────────────────────────────────────────────
function NavLink({ children, to }) {
  return (
    <Link to={to} style={{ color: L.text2, fontSize: 14, fontWeight: 400, textDecoration: 'none', padding: '8px 14px', borderRadius: 8, transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.color = L.text; e.currentTarget.style.background = L.bg3; }}
      onMouseLeave={e => { e.currentTarget.style.color = L.text2; e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </Link>
  );
}

// ─── SECTION LABEL ───────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 20, height: 1, background: L.border2 }} />
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: L.text3 }}>
        {children}
      </span>
    </div>
  );
}

// ─── CARD ────────────────────────────────────────────────────────────
function Card({ children, style = {}, hover = true }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => hover && setHov(true)} onMouseLeave={() => hover && setHov(false)}
      style={{
        background: hov ? L.bg3 : L.bg2,
        border: `1px solid ${hov ? L.border2 : L.border}`,
        borderRadius: 20,
        transition: 'all 0.25s ease',
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState('customer');
  const [faq, setFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [referralCode, setReferralCode] = useState(null);
  const [sliderIdx, setSliderIdx] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) { setReferralCode(ref); window.history.replaceState({}, document.title, window.location.pathname); }
  }, []);

  const slideRight = () => setSliderIdx(i => Math.min(i + 1, TESTIMONIALS.length - 3));
  const slideLeft  = () => setSliderIdx(i => Math.max(i - 1, 0));

  const pageMeta = generatePageMeta('home');
  const faqData = faqSchema(FAQS);

  return (
    <>
      <SeoHelmet 
        title={pageMeta.title} 
        description={pageMeta.description} 
        canonical={pageMeta.canonical}
        schema={faqData}
      />
    <div style={{ background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
      <style>{KEYFRAMES}</style>

      {referralCode && (
        <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 50, maxWidth: 400 }}>
          <ReferralLinkHandler referralCode={referralCode} onProcessed={() => setReferralCode(null)} />
        </div>
      )}

      {/* ══ NAV ══════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.85)',
        borderBottom: `1px solid ${scrolled ? L.border : 'transparent'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(12px, 3vw, 16px) clamp(16px, 5vw, 32px)', display: 'none', alignItems: 'center', justifyContent: 'space-between', minHeight: 'clamp(56px, 12vw, 68px)' }} className="md:flex">
          <Link to={createPageUrl('Home')} style={{ textDecoration: 'none' }}>
            <Logo size="sm" />
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1vw, 12px)' }}>
            <NavLink to={createPageUrl('Browse')}>Services</NavLink>
            <NavLink to={createPageUrl('VoiceRequest')}>Voice Match</NavLink>
            <NavLink to={createPageUrl('ProviderSignup')}>For Providers</NavLink>
            <NavLink to={createPageUrl('Support')}>Support</NavLink>
            <NavLink to="/blog">Blog</NavLink>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
            <button onClick={() => auth.redirectToLogin()}
              style={{ color: L.text2, fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: 8, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = L.text; e.currentTarget.style.background = L.bg3; }}
              onMouseLeave={e => { e.currentTarget.style.color = L.text2; e.currentTarget.style.background = 'transparent'; }}>
              Sign in
            </button>
            <Link to={createPageUrl('Browse')}>
              <button style={{
                background: 'rgba(0, 0, 0, 0.08)',
                border: 'none',
                borderRadius: 100,
                color: L.text,
                fontWeight: 700,
                fontSize: 'clamp(12px, 2vw, 14px)',
                padding: 'clamp(8px 16px, 1vw, 10px 22px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
                }}>
                Book now
              </button>
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(12px, 3vw, 16px) clamp(16px, 5vw, 32px)', minHeight: 'clamp(56px, 12vw, 68px)' }} className="md:hidden">
          <Link to={createPageUrl('Home')} style={{ textDecoration: 'none' }}>
            <Logo size="sm" />
          </Link>

          <MobileMenuButton scrolled={scrolled} />
        </div>
      </header>
      

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(48px, 8vw, 140px) clamp(16px, 5vw, 32px) clamp(48px, 8vw, 80px)', maxWidth: 1280, margin: '0 auto' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(24px, 4vw, 36px)', animation: 'fadeUp 0.5s ease both', justifyContent: 'center' }}>
          <span style={{ width: 8, height: 8, background: L.green, borderRadius: '50%', display: 'inline-block', animation: 'pulse2s 2s infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 'clamp(12px, 2.2vw, 14px)', color: L.text2, fontWeight: 600, letterSpacing: '-0.3px' }}>Find and book home services in California with our strategy-led marketplace</span>
        </div>

        <div style={{ display: 'grid', gap: 'clamp(32px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
          {/* Left */}
          <div style={{ animation: 'fadeUp 0.6s ease 0.1s both', textAlign: 'center' }} className="lg:text-left">
            <h1 style={{
              fontSize: 'clamp(2rem, 7vw, 5.5rem)', fontWeight: 700, lineHeight: 1.1,
              letterSpacing: '-0.02em', marginBottom: 'clamp(16px, 3vw, 24px)', color: L.text,
            }}>
              California's home<br />
              pros you can{' '}
              <CyclingWord words={['actually trust.', 'always count on.', 'book in 60s.', 'rely on.']} />
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(12px, 2vw, 20px)' }} className="md:flex hidden">
              <div style={{ height: 1, width: 40, background: L.border2 }} />
              <span style={{ fontSize: 'clamp(10px, 1.5vw, 11px)', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: L.text3 }}>
                Plumbing · HVAC · Cleaning · Emergency · Recurring · California
              </span>
            </div>

            <p style={{ fontSize: 'clamp(13px, 2.5vw, 18px)', lineHeight: 1.7, color: L.text2, maxWidth: 480, marginBottom: 'clamp(24px, 4vw, 36px)', fontWeight: 300 }}>
               AI-matched, background-checked, licensed professionals. Upfront pricing, zero surprises, 100% satisfaction guaranteed across Los Angeles, San Diego, San Jose, SF, Sacramento & Orange County.
            </p>

            {/* Search */}
            <div style={{ marginBottom: 'clamp(24px, 4vw, 36px)' }}>
              <GlobalSearchBar />
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 5vw, 40px)', marginBottom: 'clamp(24px, 4vw, 40px)', justifyContent: 'center' }} className="lg:justify-start">
              <Link to={createPageUrl('Browse')} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 700, color: L.text,
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  transition: 'all 0.2s', letterSpacing: '-0.3px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
                  Find a professional <ArrowRight size={18} style={{ flexShrink: 0 }} />
                </span>
              </Link>
              <Link to={createPageUrl('VoiceRequest')} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 700, color: L.text,
                  display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                  transition: 'all 0.2s', letterSpacing: '-0.3px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
                  <Mic size={18} style={{ color: L.accent2, flexShrink: 0 }} /> Voice request
                </span>
              </Link>
            </div>

            {/* Trust chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px, 2vw, 16px)', marginBottom: 'clamp(24px, 4vw, 36px)', justifyContent: 'center' }} className="sm:flex sm:flex-wrap lg:justify-start">
              {[
                { icon: BadgeCheck, label: 'License verified' },
                { icon: Shield, label: 'Payment protected' },
                { icon: Lock, label: 'Background checked' },
                { icon: Repeat, label: '100% Guaranteed' },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 10px)',
                  }}>
                    <Icon size={18} style={{ color: L.text, flexShrink: 0 }} />
                    <span style={{ fontSize: 'clamp(12px, 1.8vw, 14px)', fontWeight: 700, color: L.text }}>{t.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'clamp(16px, 3vw, 28px)', justifyContent: 'center' }} className="lg:justify-start">
              {[
                { v: '2,400+', l: 'Verified pros', c: L.blue },
                { v: '4.97★',  l: 'Avg. rating',   c: L.accent2 },
                { v: '<60min', l: 'Response time',  c: L.green },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1.5vw, 8px)' }}>
                  <div style={{ width: 3, height: 'clamp(24px, 3vw, 32px)', borderRadius: 2, background: s.c }} />
                  <div>
                    <div style={{ fontSize: 'clamp(14px, 2.5vw, 18px)', fontWeight: 800, letterSpacing: '-0.04em', color: L.text }}>{s.v}</div>
                    <div style={{ fontSize: 'clamp(8px, 1.5vw, 10px)', fontWeight: 600, color: L.text3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — service cards grid */}
          <div style={{ animation: 'fadeUp 0.6s ease 0.25s both' }} className="hidden lg:block">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {SERVICES.slice(0, 4).map((svc, i) => (
                <Link key={i} to={createPageUrl(`Browse?q=${encodeURIComponent(svc.slug)}`)} style={{ textDecoration: 'none' }}>
                  <div style={{
                    borderRadius: 20, overflow: 'hidden', position: 'relative', height: 200,
                    border: `1px solid ${L.border}`, transition: 'all 0.3s ease',
                    animation: `floatCard ${[6, 8, 7, 9][i]}s ease-in-out ${i * 0.5}s infinite`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = L.border2; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = L.border; }}>
                    <img src={svc.img} alt={svc.label} width="400" height="300" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                      {svc.price}
                    </div>
                    <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                      <div style={{ fontSize: 18, marginBottom: 2 }}>{svc.emoji}</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '-0.02em' }}>{svc.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>{svc.eta}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {/* 5th service — full width */}
            <Link to={createPageUrl(`Browse?q=${encodeURIComponent('Recurring Services')}`)} style={{ textDecoration: 'none', display: 'block', marginTop: 16 }}>
              <div style={{
                borderRadius: 20, overflow: 'hidden', position: 'relative', height: 100,
                border: `1px solid ${L.border}`, transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = L.border2; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = L.border; }}>
                <img src={SERVICES[4].img} alt="Recurring Services" width="400" height="200" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>🔄 Recurring Services</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>Scheduled plans · From $49/mo</div>
                  </div>
                  <ArrowRight size={18} style={{ color: '#fff' }} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <Ticker />

      {/* ══ STATS ══════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(32px, 5vw, 48px) clamp(16px, 5vw, 32px)', background: L.bg2, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, background: L.border, borderRadius: 12, overflow: 'hidden' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: L.bg2, padding: 'clamp(16px, 3vw, 28px) clamp(12px, 3vw, 24px)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 4, color: L.text }}>{s.v}</div>
              <div style={{ fontSize: 'clamp(11px, 1.8vw, 13px)', fontWeight: 600, color: L.text, marginBottom: 3 }}>{s.l}</div>
              <div style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: L.text3 }}>{s.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ SERVICES GRID ══════════════════════════════════════ */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 32px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(32px, 5vw, 48px)', flexWrap: 'wrap', gap: 'clamp(12px, 3vw, 16px)' }}>
            <div>
              <SectionLabel>What We Offer</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, color: L.text, marginBottom: 'clamp(8px, 2vw, 12px)' }}>
                5 services. 1 trusted platform.<br /><span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>All of California.</span>
              </h2>
              <p style={{ fontSize: 'clamp(13px, 2.5vw, 16px)', color: L.text2, maxWidth: 560, fontWeight: 300, lineHeight: 1.7 }}>
                Every professional is licensed, insured, background-checked, and ready for same-day or scheduled bookings.
              </p>
            </div>
            <Link to={createPageUrl('Browse')}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', border: `1px solid ${L.border2}`, borderRadius: 100, background: 'none', color: L.text, fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = L.text; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = L.text; e.currentTarget.style.borderColor = L.border2; }}>
                Browse all services →
              </button>
            </Link>
          </div>

          {/* Services accordion list */}
          <div style={{ borderTop: `1px solid ${L.border}` }}>
            {SERVICES.map((svc, i) => (
              <ServiceAccordionItem key={i} svc={svc} index={i} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 100, padding: '10px 20px' }}>
              <CheckCircle size={14} style={{ color: L.green }} />
              <span style={{ fontSize: 13, color: L.text2 }}>All services include <strong style={{ color: L.text }}>background-checked pros</strong>, <strong style={{ color: L.text }}>locked pricing</strong>, and <strong style={{ color: L.text }}>100% satisfaction guarantee</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CITIES MARQUEE ═════════════════════════════════════ */}
      <section style={{ padding: '0 0 clamp(48px, 8vw, 80px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(16px, 5vw, 32px) clamp(24px, 4vw, 32px)' }}>
          <SectionLabel>Where We Serve</SectionLabel>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.4rem)', fontWeight: 700, letterSpacing: '-1px', color: L.text, marginBottom: 'clamp(24px, 4vw, 40px)', lineHeight: 1.3 }}>
            We typically serve homeowners across California's<br />
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>largest cities and surrounding communities.</span>
          </h2>
        </div>
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, background: 'linear-gradient(to right, #fff, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, background: 'linear-gradient(to left, #fff, transparent)', zIndex: 2, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', width: 'max-content', animation: 'logoScroll 22s linear infinite' }}>
            {[...CLIENTS, ...CLIENTS].map((city, i) => (
              <div key={i} style={{ padding: '0 40px', fontSize: 15, fontWeight: 700, letterSpacing: '-0.5px', color: L.border2, whiteSpace: 'nowrap', transition: 'color 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.color = L.text2}
                onMouseLeave={e => e.currentTarget.style.color = L.border2}>
                {city}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHO WE WORK WITH / ABOUT ═══════════════════════════ */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 32px)', background: L.bg2, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 'clamp(32px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
          {/* Left — photo collage */}
          <div style={{ position: 'relative', height: 400 }} className="hidden lg:block">
            {SERVICES.slice(0, 3).map((svc, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${[0, 140, 60][i]}px`, top: `${[0, 40, 200][i]}px`,
                width: `${[280, 240, 260][i]}px`, height: `${[200, 180, 190][i]}px`,
                borderRadius: 20, overflow: 'hidden',
                border: `1px solid ${L.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                transform: `rotate(${[-2, 2, -1.5][i]}deg)`,
              }}>
                <img src={svc.img} alt={svc.label} width="280" height="200" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
            {/* Floating badge */}
            <div style={{ position: 'absolute', bottom: 20, right: 20, background: '#fff', border: `1px solid ${L.border2}`, borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
              <CheckCircle size={20} style={{ color: L.green }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: L.text }}>Job Completed ✓</div>
                <div style={{ fontSize: 11, color: L.text3 }}>Maria G. — AC Repair · 5★</div>
              </div>
            </div>
          </div>

          {/* Right — content */}
          <div>
            <SectionLabel>Who We Work With</SectionLabel>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, color: L.text, marginBottom: 20 }}>
              We work where <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>trust meets</span> home services.
            </h2>
            <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 32 }}>
              Service Connect Pro is built for California homeowners at every stage — first-time bookers, property managers, and landlords who need reliable recurring help. We've seen what happens when a homeowner's experience lags behind their expectations. Jobs are botched. Bills balloon. Strangers show up unvetted.
              <br /><br />
              We close that gap. Plumbing, HVAC, Cleaning, Emergency Repairs, and Recurring Services — one trusted platform, fully aligned to your home.
            </p>
            <Link to={createPageUrl('Browse')}>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', border: `1px solid ${L.border2}`, borderRadius: 100, background: 'none', color: L.text, fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = L.text; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = L.text; e.currentTarget.style.borderColor = L.border2; }}>
                Browse services →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ PAIN POINTS ════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 32px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: 'clamp(32px, 6vw, 60px)', alignItems: 'start' }} className="lg:grid-cols-2">
            {/* Left sticky */}
            <div className="lg:sticky" style={{ top: 80 }}>
              <SectionLabel>The Real Problem</SectionLabel>
              <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.05, color: L.text, marginBottom: 20 }}>
                Every pain point.<br /><span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>Actually fixed.</span>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: L.text2, marginBottom: 36, maxWidth: 400, fontWeight: 300 }}>
                Based on real complaints from thousands of homeowners and contractors on other home service platforms.
              </p>
              {/* Toggle */}
              <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: L.bg3, border: `1px solid ${L.border}`, borderRadius: 100 }}>
                {[{ k: 'customer', l: '🏠 Homeowners' }, { k: 'provider', l: '🔧 Professionals' }].map(t => (
                  <button key={t.k} onClick={() => setTab(t.k)}
                    style={{
                      padding: '9px 20px', borderRadius: 100, border: 'none',
                      background: tab === t.k ? L.text : 'transparent',
                      color: tab === t.k ? '#fff' : L.text2,
                      fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.25s ease',
                    }}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Right cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(tab === 'customer' ? PAINS_CUSTOMER : PAINS_PROVIDER).map((item, i) => {
                const Icon = item.icon;
                return (
                  <Card key={`${tab}-${i}`} style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: `${item.c}12`, border: `1px solid ${item.c}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} style={{ color: item.c }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, marginBottom: 6, color: L.text }}>{item.pain}</p>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <CheckCircle size={14} style={{ color: L.green, marginTop: 2, flexShrink: 0 }} />
                        <p style={{ fontSize: 14, color: L.text2, lineHeight: 1.6, fontWeight: 300 }}>{item.fix}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ VS COMPETITION ═════════════════════════════════════ */}
      <section style={{ padding: 'clamp(60px, 8vw, 80px) clamp(16px, 5vw, 32px)', background: L.bg2, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
            <SectionLabel>Honest Comparison</SectionLabel>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', color: L.text, lineHeight: 1.1 }}>
              Why not just use <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>the others?</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gap: 16 }} className="md:grid-cols-2">
            {/* Others */}
            <Card style={{ padding: 32 }} hover={false}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${L.accent}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Frown size={20} style={{ color: L.accent }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 18, color: L.text }}>Other Platforms</span>
              </div>
              {['Pay $30–$200 per lead (often fake)', 'Leads sold to 10+ contractors at once', 'No payment protection for customers', 'Providers often unverified', 'Fined $7.2M by FTC for deceiving providers', 'Commission 20–30% per job'].map((x, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                  <XCircle size={14} style={{ color: L.accent, marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: L.text2, fontWeight: 300 }}>{x}</span>
                </div>
              ))}
            </Card>
            {/* Us */}
            <Card style={{ padding: 32, background: '#f0faf6', border: `1px solid ${L.green}30` }} hover={false}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${L.green}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SmilePlus size={20} style={{ color: L.green }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 18, color: L.text }}>Service Connect Pro</span>
              </div>
              {['Flat monthly subscription — unlimited matched jobs', 'Exclusive AI-matched jobs — no bidding wars', 'Locked pricing — no surprise charges', '100% verified, licensed, background-checked', 'FTC-compliant, transparent business model', 'Lower 8% commission — more money for pros'].map((x, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                  <CheckCircle size={14} style={{ color: L.green, marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: L.text, fontWeight: 400 }}>{x}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 32px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(16px, 3vw, 20px)' }}>
            <SectionLabel>How It Works</SectionLabel>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-1.5px', color: L.text, lineHeight: 1.1 }}>
              Simple for homeowners.<br /><span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>Fair for professionals.</span>
            </h2>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'clamp(20px, 4vw, 32px)', marginBottom: 'clamp(32px, 5vw, 48px)' }}>
            <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: L.bg3, border: `1px solid ${L.border}`, borderRadius: 100 }}>
              {[{ k: 'customer', l: 'I need a service' }, { k: 'provider', l: 'I offer services' }].map(t => (
                <button key={t.k} onClick={() => setTab(t.k)}
                  style={{
                    padding: '10px 22px', borderRadius: 100, border: 'none',
                    background: tab === t.k ? L.text : 'transparent',
                    color: tab === t.k ? '#fff' : L.text2,
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.25s ease',
                  }}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }} className="md:grid-cols-4">
            {STEPS[tab].map((s, i) => (
              <Card key={`${tab}-${i}`} style={{ padding: '28px 24px' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: L.border2, letterSpacing: '-0.06em', marginBottom: 20, lineHeight: 1 }}>{s.n}</div>
                <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, color: L.text }}>{s.title}</h4>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: L.text2, fontWeight: 300 }}>{s.body}</p>
              </Card>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to={tab === 'customer' ? createPageUrl('Browse') : createPageUrl('ProviderSignup')}>
              <button style={{
                background: L.text, border: 'none', borderRadius: 100, color: '#fff',
                fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.25s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.transform = 'none'; }}>
                {tab === 'customer' ? 'Book a service now' : 'Apply to join'} <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═══════════════════════════════════════ */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 32px)', background: L.bg2, borderTop: `1px solid ${L.border}` }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(32px, 5vw, 48px)', flexWrap: 'wrap', gap: 'clamp(12px, 3vw, 16px)' }}>
            <div>
              <SectionLabel>Testimonials</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-1.5px', color: L.text, lineHeight: 1.1 }}>
                What our <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>clients say.</span>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[slideLeft, slideRight].map((fn, i) => (
                <button key={i} onClick={fn} style={{ width: 44, height: 44, borderRadius: '50%', border: `1px solid ${L.border2}`, background: 'none', cursor: 'pointer', fontSize: 18, color: L.text, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = L.text; }}>
                  {i === 0 ? '←' : '→'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflow: 'hidden' }}>
            <div ref={sliderRef} style={{ display: 'flex', gap: 20, transition: 'transform 0.5s ease', transform: `translateX(-${sliderIdx * 420}px)` }}>
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: 28, minWidth: 380, flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                    {Array(t.rating).fill(0).map((_, j) => <Star key={j} size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />)}
                  </div>
                  <p style={{ fontSize: 15, color: L.text2, lineHeight: 1.8, marginBottom: 24, fontWeight: 300 }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: `1px solid ${L.border}` }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: L.bg4, border: `1px solid ${L.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: L.text2, flexShrink: 0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: L.text }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: L.text3 }}>{t.city} · {t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 28 }}>
            {TESTIMONIALS.map((_, i) => (
              <div key={i} onClick={() => setSliderIdx(i)} style={{ height: 6, borderRadius: 3, background: i === sliderIdx ? L.text : L.border2, width: i === sliderIdx ? 24 : 6, transition: 'all 0.3s', cursor: 'pointer' }} />
            ))}
          </div>

          {/* Trust bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0, marginTop: 48, borderTop: `1px solid ${L.border}`, paddingTop: 32 }}>
            {[{ v: '4.97★', l: 'Avg. Rating' }, { v: '6,200+', l: 'Reviews' }, { v: '98%', l: 'Recommend' }, { v: '24hrs', l: 'Avg Response' }].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', textAlign: 'center', borderRight: i < 3 ? `1px solid ${L.border}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: L.text }}>{stat.v}</div>
                  <div style={{ fontSize: 11, color: L.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════ */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) clamp(16px, 5vw, 32px)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionLabel>FAQ</SectionLabel>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-1.5px', color: L.text, lineHeight: 1.1, marginBottom: 'clamp(32px, 5vw, 48px)' }}>
            Frequently asked <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>questions.</span>
          </h2>
          <div style={{ borderTop: `1px solid ${L.border}` }}>
            {FAQS.map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${L.border}`, overflow: 'hidden' }}>
                <button onClick={() => setFaq(faq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: 12, color: L.text3, fontWeight: 600, minWidth: 24 }}>0{i + 1}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 17, color: L.text, lineHeight: 1.3 }}>{item.q}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${L.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: L.text2, transition: 'all 0.3s', flexShrink: 0, background: faq === i ? L.text : 'transparent', transform: faq === i ? 'rotate(45deg)' : 'none' }}>
                    <span style={{ color: faq === i ? '#fff' : L.text2, fontSize: 18, lineHeight: 1 }}>+</span>
                  </div>
                </button>
                {faq === i && (
                  <div style={{ padding: '0 0 22px 40px' }}>
                    <p style={{ fontSize: 15, lineHeight: 1.8, color: L.text2, fontWeight: 300 }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═════════════════════════════════════════ */}
      <section style={{ padding: '0 clamp(16px, 5vw, 32px) clamp(60px, 8vw, 100px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ background: L.text, borderRadius: 16, padding: 'clamp(32px, 5vw, 80px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'clamp(20px, 4vw, 32px)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>The right partner changes everything</div>
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1, color: '#fff', marginBottom: 8 }}>
                Your home deserves<br />professionals you trust.
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', fontWeight: 300 }}>Verified pros · Locked pricing · 100% guaranteed · California</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
              <Link to={createPageUrl('Browse')}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#fff', color: L.text, border: 'none', borderRadius: 100, fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0efed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}>
                  Book a service <ArrowRight size={18} />
                </button>
              </Link>
              <Link to={createPageUrl('ProviderSignup')}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'none', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, fontWeight: 500, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', width: '100%', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
                  Join as a provider
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════ */}
      <footer style={{ background: L.bg, borderTop: `1px solid ${L.border}`, padding: 'clamp(48px, 6vw, 72px) clamp(16px, 5vw, 32px) clamp(24px, 4vw, 40px)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: 48, marginBottom: 56 }} className="grid-cols-1 md:grid-cols-4">

            {/* Brand */}
            <div className="md:col-span-2">
              <div style={{ marginBottom: 14 }}>
                <Logo size="sm" />
              </div>
              <p style={{ fontSize: 13, color: L.text3, lineHeight: 1.7, maxWidth: 340, fontWeight: 300, marginBottom: 20 }}>
                California's most trusted marketplace for verified plumbers, HVAC techs, house cleaners, emergency repair specialists, and recurring home service professionals. KCF LLC.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a href="tel:+19499963051" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: L.text3, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = L.text}
                  onMouseLeave={e => e.currentTarget.style.color = L.text3}>
                  <Phone size={13} /> (949) 996-3051
                </a>
                <a href="mailto:contact@kindnesscommunityfoundation.com" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: L.text3, textDecoration: 'none', transition: 'color 0.2s', wordBreak: 'break-all' }}
                  onMouseEnter={e => e.currentTarget.style.color = L.text}
                  onMouseLeave={e => e.currentTarget.style.color = L.text3}>
                  <Mail size={13} /> contact@kindnesscommunityfoundation.com
                </a>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: L.text3 }}>
                  <MapPin size={13} /> Newport Beach, California 92660
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                {['⭐ 4.97 Rating', '🛡️ FTC Compliant', '📍 California'].map(badge => (
                  <span key={badge} style={{ padding: '6px 12px', border: `1px solid ${L.border}`, borderRadius: 8, fontSize: 11, color: L.text3 }}>{badge}</span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: L.text3, marginBottom: 16 }}>Services</h4>
              {['Plumbing', 'HVAC', 'Home Cleaning', 'Emergency Repairs', 'Recurring Services'].map(s => (
                <Link key={s} to={createPageUrl(`Browse?q=${encodeURIComponent(s)}`)}
                  style={{ display: 'block', fontSize: 14, color: L.text3, marginBottom: 10, textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = L.text}
                  onMouseLeave={e => e.target.style.color = L.text3}>{s}</Link>
              ))}
            </div>

            {/* Platform */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: L.text3, marginBottom: 16 }}>Platform</h4>
              {[
                { l: 'Find a Professional', p: 'Browse' },
                { l: 'Voice Match', p: 'VoiceRequest' },
                { l: 'Join as Provider', p: 'ProviderSignup' },
                { l: 'My Orders', p: 'Orders' },
                { l: 'About Us', p: 'About' },
                { l: 'Terms & Privacy', p: 'TermsAndPrivacy' },
                { l: 'Support', p: 'Support' },
              ].map(({ l, p }) => (
                <Link key={p} to={createPageUrl(p)}
                  style={{ display: 'block', fontSize: 14, color: L.text3, marginBottom: 10, textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = L.text}
                  onMouseLeave={e => e.target.style.color = L.text3}>{l}</Link>
              ))}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${L.border}`, paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: L.text3 }}>© {new Date().getFullYear()} Service Connect Pro · KCF LLC · All rights reserved</span>
            <span style={{ fontSize: 12, color: L.text3 }}>Data: KPMG · FTC · OCC Strategy · 2025–2026</span>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
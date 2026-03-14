import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, Shield, Clock, CreditCard, Star, Users, Briefcase,
  Search, CheckCircle, MapPin, HeartHandshake, BadgeCheck,
  ChevronRight, Quote, Globe, Zap, TrendingUp, Flame, Brain,
  Bot, Code2, LineChart, Lock, Cpu, Sparkles, Building2,
  Database, MessageSquare, Eye, Layers, Award, ChevronDown, Mic,
  LayoutDashboard, LogOut
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CategoryCard from '@/components/marketplace/CategoryCard';
import ProviderCard from '@/components/marketplace/ProviderCard';
import SearchBar from '@/components/marketplace/SearchBar';
import { Skeleton } from "@/components/ui/skeleton";
import Logo from '@/components/Logo';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

const PINK = '#e8356d';
const CYAN = '#00d4ff';

const AI_STATS = [
  { value: '$211B', label: 'AI VC Funding 2025', source: 'Crunchbase' },
  { value: '78%', label: 'Enterprises Using AI', source: 'McKinsey' },
  { value: '$4.4T', label: 'GenAI Value Potential', source: 'McKinsey' },
  { value: '170M', label: 'New AI Jobs by 2030', source: 'WEF' },
];

const AI_CATEGORIES = [
  { name: 'AI Automation Agencies', icon: Bot, desc: 'End-to-end workflow automation, AI agents & process transformation', color: '#7c3aed', growth: '+38%' },
  { name: 'Generative AI & LLMs', icon: Sparkles, desc: 'GPT fine-tuning, prompt engineering, custom LLM development', color: PINK, growth: '+85%' },
  { name: 'AI for Cybersecurity', icon: Lock, desc: 'Threat detection, AI-powered security audits & compliance', color: '#0ea5e9', growth: '+38%' },
  { name: 'Data Science & ML', icon: Brain, desc: 'Predictive models, ML pipelines, data strategy & analytics', color: '#10b981', growth: '+34%' },
  { name: 'AI SaaS Development', icon: Layers, desc: 'Build AI-native software products, APIs & integrations', color: '#f59e0b', growth: '+22%' },
  { name: 'Computer Vision & NLP', icon: Eye, desc: 'Image recognition, OCR, chatbots & language understanding', color: '#e879f9', growth: '+41%' },
  { name: 'AI for Healthcare', icon: Database, desc: 'Diagnostics AI, patient management & clinical decision tools', color: '#f97316', growth: '+28%' },
  { name: 'AI Strategy & Consulting', icon: LineChart, desc: 'AI readiness audits, roadmaps & enterprise transformation', color: '#06b6d4', growth: '+30%' },
  { name: 'AI Content & Marketing', icon: MessageSquare, desc: 'AI copywriting, SEO automation, ad optimization & creative AI', color: '#84cc16', growth: '+45%' },
  { name: 'AI Infrastructure & MLOps', icon: Cpu, desc: 'Model deployment, cloud AI infra, vector databases & scaling', color: '#a78bfa', growth: '+35%' },
];

const HOW_IT_WORKS_CLIENT = [
  { step: '1', title: 'Describe Your AI Need', desc: 'Tell us what you want to automate, build, or improve using AI — our smart matching helps you identify the right service type.' },
  { step: '2', title: 'Browse Verified AI Experts', desc: 'Explore agencies, freelancers and AI labs with verified portfolios, case studies, tech stacks and client reviews.' },
  { step: '3', title: 'Hire & Collaborate Securely', desc: 'Book a consultation or project, agree on milestones, and work with confidence through our escrow-backed payment system.' },
];

const HOW_IT_WORKS_PROVIDER = [
  { step: '1', title: 'Build Your AI Profile', desc: 'Showcase your AI specializations, tech stack (GPT, LangChain, PyTorch etc.), certifications, and past project outcomes.' },
  { step: '2', title: 'Get Discovered by Enterprises', desc: 'Companies actively searching for AI talent find you through smart search, AI category pages, and featured listings.' },
  { step: '3', title: 'Grow Your AI Business', desc: 'Manage projects, receive secure payments, collect verified reviews and build your reputation in the AI economy.' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'CTO, FinTech Startup', text: 'Found an incredible AI automation agency within days. They built our document processing pipeline and saved us 40 hrs/week. The verified reviews made the decision easy.', rating: 5, avatar: 'SK', sector: 'FinTech' },
  { name: 'Marcus D.', role: 'AI Automation Agency Founder', text: 'Listed our agency here 3 months ago. Our inbound project inquiries tripled. The platform attracts serious enterprise buyers, not time-wasters.', rating: 5, avatar: 'MD', sector: 'AI Agency' },
  { name: 'Priya R.', role: 'Head of Digital, Retail Chain', text: 'Used this to find an AI consultant who redesigned our demand forecasting. ROI was visible within 6 weeks. Couldn\'t have found this caliber of talent elsewhere.', rating: 5, avatar: 'PR', sector: 'Retail' },
];

const MARKET_INSIGHTS = [
  { stat: '87%', label: 'of large enterprises now implement AI solutions', source: 'SecondTalent 2025' },
  { stat: '+55%', label: 'productivity gain for software devs using AI tools', source: 'GitHub/Microsoft' },
  { stat: '$3.3T', label: 'projected global AI spend by 2029', source: 'Gartner' },
  { stat: '22%', label: 'CAGR for worldwide AI spending', source: 'Gartner' },
];

const WHY_US = [
  { icon: Award, title: 'Verified AI Credentials', desc: 'Every provider\'s AI expertise, certifications, and tech stack are independently verified before listing.' },
  { icon: Shield, title: 'Escrow-Protected Payments', desc: 'Funds held securely until milestones are met. Full protection for both clients and providers.' },
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Our smart matching engine recommends providers based on your industry, budget, and specific AI use case.' },
  { icon: LineChart, title: 'ROI-Focused Profiles', desc: 'Providers showcase real business outcomes — not just tech skills — so you can compare expected ROI.' },
  { icon: Users, title: 'Enterprise & SMB Ready', desc: 'Whether you\'re a Fortune 500 or a startup, find AI talent matched to your scale and budget.' },
  { icon: Globe, title: 'Global AI Talent Pool', desc: 'Access verified AI professionals and agencies from 50+ countries, all in one trusted marketplace.' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
];

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem('kcf_onboarding_seen');
    if (!seen) setTimeout(() => setShowOnboarding(true), 1000);
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('kcf_onboarding_seen', '1');
  };

  const handleLangChange = (code) => {
    setSelectedLang(code);
    setLangMenuOpen(false);
    const lang = LANGUAGES.find(l => l.code === code);
    document.documentElement.setAttribute('dir', lang?.dir || 'ltr');
    document.documentElement.setAttribute('lang', code);
  };

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.ServiceCategory.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: providers = [], isLoading: loadingProviders } = useQuery({
    queryKey: ['providers-home'],
    queryFn: () => base44.entities.ServiceProvider.filter({ is_active: true, is_featured: true }, '-rating', 8),
    staleTime: 2 * 60 * 1000,
  });

  const handleSearch = ({ query, location }) => {
    window.location.href = createPageUrl(`Browse?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  const faqs = [
    { q: 'Who can list services on this platform?', a: 'AI agencies, freelance AI engineers, data scientists, ML consultants, AI product companies, and any professional offering AI-related services. We verify all providers before activation.' },
    { q: 'How is this different from Upwork or Toptal?', a: 'We are exclusively focused on the AI economy. Every category, filter, and matching algorithm is purpose-built for AI services — not generic freelancing. Our providers showcase ROI outcomes, not just skills.' },
    { q: 'How are providers verified?', a: 'We review AI certifications (Google Cloud, AWS AI, OpenAI partner status), GitHub portfolios, client references, and conduct a technical assessment for featured listings.' },
    { q: 'What industries do AI providers serve here?', a: 'Finance, healthcare, retail, manufacturing, logistics, education, cybersecurity, real estate, and more. The platform supports all AI × industry verticals identified in the 2026 AI Economic Report.' },
    { q: 'Is there a fee to list?', a: 'Basic listings are free. Premium featured placements, priority search visibility, and verified badges are available on subscription plans starting from our basic tier.' },
  ];

  return (
    <div style={{ background: '#0d0d1f', color: '#fff', fontFamily: 'inherit' }}>
      <OnboardingModal open={showOnboarding} onClose={handleCloseOnboarding} />

      {/* ── NAV ── */}
      <nav style={{ background: 'rgba(13,13,31,0.97)', borderBottom: '1px solid rgba(0,212,255,0.15)' }} className="sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center">
              <Logo size="md" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {[
                { label: 'Home', page: 'Home' },
                { label: 'Browse AI Services', page: 'Browse' },
                { label: '🎤 Voice Request', page: 'VoiceRequest' },
                { label: 'List Your Services', page: 'ProviderSignup' },
                { label: 'Support', page: 'Support' },
              ].map(({ label, page }) => (
                <Link key={page} to={createPageUrl(page)}
                  className="text-sm font-medium transition-colors"
                  style={{ color: page === 'Home' ? PINK : 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={e => e.target.style.color = PINK}
                  onMouseLeave={e => e.target.style.color = page === 'Home' ? PINK : 'rgba(255,255,255,0.7)'}
                >{label}</Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <button onClick={() => setLangMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Globe className="w-3.5 h-3.5" /><span>{currentLang?.label}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden shadow-xl z-50" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.25)' }}>
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                        style={{ color: lang.code === selectedLang ? PINK : 'rgba(255,255,255,0.75)', background: lang.code === selectedLang ? 'rgba(232,53,109,0.1)' : 'transparent', fontWeight: lang.code === selectedLang ? 600 : 400 }}
                        onClick={() => handleLangChange(lang.code)}>{lang.label}</button>
                    ))}
                  </div>
                )}
              </div>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback style={{ background: PINK, color: '#fff' }}>
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium">
                        {user.full_name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.3)', color: '#fff' }}>
                    <DropdownMenuItem asChild>
                      <Link to="/CustomerProfile" className="flex items-center text-white hover:text-white">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/Orders" className="flex items-center text-white hover:text-white">
                        <Briefcase className="w-4 h-4 mr-2" /> My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ProviderDashboard" className="flex items-center text-white hover:text-white">
                        <Building2 className="w-4 h-4 mr-2" /> Provider Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator style={{ background: 'rgba(232,53,109,0.2)' }} />
                        <DropdownMenuItem asChild>
                          <Link to="/AdminDashboard" className="flex items-center text-white hover:text-white">
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator style={{ background: 'rgba(232,53,109,0.2)' }} />
                    <DropdownMenuItem onClick={() => logout()} className="text-white hover:text-white cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('/Login')} style={{ background: PINK }} className="text-white hover:opacity-90 border-0">
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #0d0d1f 0%, #0a0a2e 40%, #0d0d1f 100%)', position: 'relative', overflow: 'hidden' }} className="py-20 lg:py-32">
        {/* Decorative grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(232,53,109,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '0%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center max-w-5xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-sm font-medium" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: CYAN }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: CYAN }} />
              THE #1 MARKETPLACE FOR AI SERVICES — 2026
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Where <span style={{ color: PINK }}>AI Expertise</span> Meets<br />
              <span style={{ color: CYAN }}>Every Professional Service</span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Hire world-class AI specialists, ML engineers, automation experts, and consultants ready to transform your business.
            </p>
            <p className="text-base mb-4 max-w-3xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
              AI services are at the heart of our platform — our primary USP and the fastest-growing opportunity in today's economy.
            </p>
            <p className="text-base mb-4 max-w-3xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Beyond AI, our marketplace connects you with skilled professionals across every industry, from digital experts to local service providers.
            </p>
            <p className="text-base mb-10 max-w-3xl mx-auto font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
              One platform to discover talent, hire experts, and scale faster.
            </p>

            <div className="max-w-3xl mx-auto mb-8">
              <SearchBar onSearch={handleSearch} dark />
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-10 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {['AI Automation', 'LLM Development', 'Data Science', 'MLOps', 'AI Strategy', 'Computer Vision'].map(tag => (
                <Link key={tag} to={createPageUrl(`Browse?q=${encodeURIComponent(tag)}`)}
                  className="px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = PINK; e.currentTarget.style.color = PINK; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                  {tag}
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to={createPageUrl('Browse')}>
                <Button size="lg" className="h-14 px-10 text-lg rounded-xl text-white border-0 w-full sm:w-auto" style={{ background: PINK }}>
                  <Search className="w-5 h-5 mr-2" /> Find AI Talent
                </Button>
              </Link>
              <Link to={createPageUrl('VoiceRequest')}>
                <Button size="lg" className="h-14 px-10 text-lg rounded-xl text-white border-0 w-full sm:w-auto animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #e8356d)' }}>
                  <Mic className="w-5 h-5 mr-2" /> Voice Request
                </Button>
              </Link>
              <Link to={createPageUrl('ProviderSignup')}>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-xl w-full sm:w-auto bg-transparent hover:bg-cyan-400/10 hover:text-white border-0"
                  style={{ border: `2px solid rgba(0,212,255,0.4)`, color: CYAN }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = CYAN; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; }}>
                  <Briefcase className="w-5 h-5 mr-2" /> List Your AI Services
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4" style={{ color: CYAN }} /> Verified AI Credentials</div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4" style={{ color: CYAN }} /> Escrow-Protected Payments</div>
              <div className="flex items-center gap-2"><Brain className="w-4 h-4" style={{ color: CYAN }} /> AI-Powered Matching</div>
              <div className="flex items-center gap-2"><LineChart className="w-4 h-4" style={{ color: CYAN }} /> ROI-Focused Profiles</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARKET STATS ── */}
      <section style={{ background: '#080812', borderTop: '1px solid rgba(0,212,255,0.12)', borderBottom: '1px solid rgba(0,212,255,0.12)' }} className="py-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'rgba(0,212,255,0.6)' }}>
            The AI Economy — Live Research Data 2025–2026
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {AI_STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: i % 2 === 0 ? PINK : CYAN }}>{stat.value}</div>
                <div className="text-sm font-medium text-white mb-0.5">{stat.label}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI SERVICE CATEGORIES ── */}
      <section style={{ background: '#0d0d1f' }} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold" style={{ background: 'rgba(232,53,109,0.12)', color: PINK }}>
                <Flame className="w-3.5 h-3.5" /> High-Demand AI Services
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Browse AI Service Categories</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Explore the fastest-growing AI verticals, each backed by real market demand</p>
            </div>
            <Link to={createPageUrl('Browse')}>
              <Button variant="ghost" className="hover:bg-white/10" style={{ color: PINK }}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {AI_CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link key={i} to={createPageUrl(`Browse?q=${encodeURIComponent(cat.name)}`)}
                  className="rounded-2xl p-5 group transition-all duration-300 cursor-pointer"
                  style={{ background: '#13132a', border: `1px solid rgba(255,255,255,0.06)` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.background = `${cat.color}10`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#13132a'; }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: `${cat.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-white text-sm leading-tight">{cat.name}</h4>
                  </div>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{cat.desc}</p>
                  <div className="inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5" style={{ background: `${cat.color}20`, color: cat.color }}>
                    <TrendingUp className="w-3 h-3" /> {cat.growth} CAGR
                  </div>
                </Link>
              );
            })}
          </div>

          {/* DB-driven categories */}
          {categories.length > 0 && (
            <div className="mt-8">
              <p className="text-sm font-medium mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>More categories on the platform:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(0, 4).map(category => (
                  <CategoryCard key={category.id} category={category}
                    providerCount={providers.filter(p => p.category_id === category.id).length} dark />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── MARKET INSIGHTS TICKER ── */}
      <section style={{ background: '#080812', borderTop: '1px solid rgba(232,53,109,0.12)', borderBottom: '1px solid rgba(232,53,109,0.12)' }} className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'rgba(232,53,109,0.6)' }}>
            Why the AI Services Market is Exploding
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MARKET_INSIGHTS.map((m, i) => (
              <div key={i} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-2xl font-bold mb-1" style={{ color: i % 2 === 0 ? CYAN : PINK }}>{m.stat}</div>
                <div className="text-xs text-white mb-1">{m.label}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP AI PROVIDERS ── */}
      <section style={{ background: '#13132a' }} className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold" style={{ background: 'rgba(0,212,255,0.1)', color: CYAN }}>
                <Award className="w-3.5 h-3.5" /> Top Rated
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured AI Providers</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Verified AI agencies and professionals with proven client results</p>
            </div>
            <Link to={createPageUrl('Browse')}>
              <Button variant="ghost" className="hover:bg-white/10" style={{ color: PINK }}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingProviders ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl" style={{ background: '#0d0d1f' }}>
                  <Skeleton className="h-40 rounded-t-2xl opacity-30" />
                  <div className="p-6 pt-12"><Skeleton className="h-5 w-32 mb-2 opacity-20" /><Skeleton className="h-4 w-24 mb-4 opacity-20" /></div>
                </div>
              ))
            ) : providers.length > 0 ? (
              providers.slice(0, 4).map(provider => (
                <ProviderCard key={provider.id} provider={provider} dark />
              ))
            ) : (
              <div className="col-span-4 text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">AI providers will appear here once registered.</p>
                <Link to={createPageUrl('ProviderSignup')} className="mt-4 inline-block">
                  <Button style={{ background: PINK }} className="text-white border-0 mt-4">List Your AI Services</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: '#0d0d1f' }} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Designed for the AI economy — simple, secure, and fast</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* For AI Buyers */}
            <div className="rounded-3xl p-8" style={{ background: '#13132a', border: `1px solid rgba(232,53,109,0.2)` }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl p-2" style={{ background: 'rgba(232,53,109,0.15)' }}>
                  <Search className="w-6 h-6" style={{ color: PINK }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">For AI Buyers</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Enterprises, startups & individuals</p>
                </div>
              </div>
              <div className="space-y-5">
                {HOW_IT_WORKS_CLIENT.map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: PINK }}>{item.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{item.title}</h4><p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <Link to={createPageUrl('Browse')} className="mt-6 block">
                <Button className="w-full text-white rounded-xl border-0" style={{ background: PINK }}>
                  Find AI Talent <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* For AI Providers */}
            <div className="rounded-3xl p-8" style={{ background: '#13132a', border: `1px solid rgba(0,212,255,0.2)` }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl p-2" style={{ background: 'rgba(0,212,255,0.1)' }}>
                  <Brain className="w-6 h-6" style={{ color: CYAN }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">For AI Providers</h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Agencies, freelancers & AI companies</p>
                </div>
              </div>
              <div className="space-y-5">
                {HOW_IT_WORKS_PROVIDER.map(item => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: CYAN, color: '#0d0d1f' }}>{item.step}</div>
                    <div><h4 className="font-semibold text-white mb-1">{item.title}</h4><p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p></div>
                  </div>
                ))}
              </div>
              <Link to={createPageUrl('ProviderSignup')} className="mt-6 block">
                <Button className="w-full rounded-xl border-0 font-bold" style={{ background: CYAN, color: '#0d0d1f' }}>
                  List Your AI Services <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section style={{ background: '#13132a' }} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(0,212,255,0.1)', color: CYAN }}>
              Why ServiceConnect Pro AI
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Built Exclusively for the AI Economy</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Not a generic freelancing platform. Purpose-built for AI services with features that matter.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="rounded-2xl p-6" style={{ background: '#0d0d1f', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(232,53,109,0.15)' }}>
                    <Icon className="w-6 h-6" style={{ color: PINK }} />
                  </div>
                  <h4 className="font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#0d0d1f' }} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">What Our Community Says</h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Real outcomes from real businesses using AI services found here</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-3xl p-6 relative" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.15)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {Array(t.rating).fill(0).map((_, s) => <Star key={s} className="w-4 h-4 fill-current" style={{ color: '#f59e0b' }} />)}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(0,212,255,0.1)', color: CYAN }}>{t.sector}</span>
                </div>
                <Quote className="w-6 h-6 mb-3" style={{ color: 'rgba(232,53,109,0.3)' }} />
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: PINK }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{t.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI OPPORTUNITY SECTION ── */}
      <section style={{ background: '#080812', borderTop: '1px solid rgba(0,212,255,0.1)' }} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(232,53,109,0.12)', color: PINK }}>
                The AI Opportunity — 2026 Research
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                The competitive window is <span style={{ color: PINK }}>closing fast</span>
              </h2>
              <p className="mb-4 text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                McKinsey estimates AI could unlock <strong className="text-white">$4.4 trillion</strong> annually in corporate value. 78% of enterprises now use AI — but only <strong className="text-white">1% have reached AI maturity</strong>.
              </p>
              <p className="mb-6 text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                That gap between intention and execution is the single greatest opportunity for AI service providers right now. Businesses need trusted partners to guide their AI transformation — and this is where they find them.
              </p>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Global VC investment in AI hit <strong className="text-white">$211 billion in 2025</strong> — up 85% year-over-year. AI is no longer a pilot programme. It is the primary engine of GDP growth.
              </p>
              <p className="text-xs mt-4 italic" style={{ color: 'rgba(255,255,255,0.3)' }}>Sources: McKinsey, WEF, Crunchbase, Gartner — 2025–2026 Research Edition by KCF LLC</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'AI GDP Contribution', value: '1.1%', sub: 'US GDP boost H1 2025', color: PINK },
                { label: 'AI VC Funding 2025', value: '$211B', sub: '+85% YoY growth', color: CYAN },
                { label: 'Net New AI Jobs by 2030', value: '78M', sub: 'WEF Future of Jobs', color: '#10b981' },
                { label: 'Enterprises Planning AI', value: '92%', sub: 'Increased AI investment', color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-5" style={{ background: '#13132a', border: `1px solid ${item.color}25` }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: item.color }}>{item.value}</div>
                  <p className="text-sm font-medium text-white mb-1">{item.label}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#0d0d1f' }} className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Everything you need to know about the platform</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#13132a', border: '1px solid rgba(255,255,255,0.07)' }}>
                <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                  <span className="font-medium text-white text-sm">{faq.q}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 ml-3 transition-transform" style={{ color: PINK, transform: activeFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #0d0a2e 0%, #0d0d1f 100%)', borderTop: '1px solid rgba(232,53,109,0.2)' }} className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(232,53,109,0.15)', border: '1px solid rgba(232,53,109,0.3)' }}>
            <Brain className="w-10 h-10" style={{ color: PINK }} />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            The AI Economy is Here.<br /><span style={{ color: PINK }}>Are You Ready?</span>
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Whether you need cutting-edge AI expertise or a trusted local plumber — find verified professionals, book instantly, and get results. Any business. Any skill. One platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('Browse')}>
              <Button size="lg" className="h-14 px-10 text-lg rounded-xl text-white border-0 w-full sm:w-auto" style={{ background: PINK }}>
                Find AI Talent <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('ProviderSignup')}>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-xl bg-transparent hover:bg-cyan-400/10 hover:text-white border-0 w-full sm:w-auto font-bold" style={{ border: '2px solid rgba(0,212,255,0.4)', color: CYAN }}>
                List Your AI Services <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-xs mt-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Powered by Kindness Community · KCF LLC · Research: McKinsey, WEF, Gartner, Crunchbase 2025–2026
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#080812', borderTop: '1px solid rgba(0,212,255,0.1)' }} className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="mb-4"><Logo size="md" /></div>
              <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                The world's leading marketplace for AI services. Connecting businesses with verified AI agencies, engineers and consultants across 50+ countries.
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Powered by <span style={{ color: PINK }}>Kindness Community</span> · KCF LLC
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">AI Services</h4>
              <div className="space-y-2">
                {['AI Automation', 'LLM Development', 'Data Science', 'AI Strategy', 'MLOps'].map(s => (
                  <Link key={s} to={createPageUrl(`Browse?q=${encodeURIComponent(s)}`)} className="block text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.target.style.color = PINK} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>{s}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Platform</h4>
              <div className="space-y-2">
                {[
                  { label: 'Browse AI Services', page: 'Browse' },
                  { label: 'List Your Services', page: 'ProviderSignup' },
                  { label: 'Terms & Privacy', page: 'TermsAndPrivacy' },
                  { label: 'Help & Support', page: 'Support' },
                ].map(({ label, page }) => (
                  <Link key={page} to={createPageUrl(page)} className="block text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.target.style.color = PINK} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>{label}</Link>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Service Connect Pro. Built by KCF LLC. All rights reserved.</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
              AI Economy Data: McKinsey · WEF · Gartner · Crunchbase <span style={{ color: PINK }}>2026</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
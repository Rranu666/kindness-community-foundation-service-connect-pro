import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, Shield, Star, Users, Briefcase,
  Search, CheckCircle, MapPin, HeartHandshake, BadgeCheck,
  ChevronRight, Quote, Globe, Zap, TrendingUp,
  LineChart, Sparkles, Award, ChevronDown, Mic,
  LayoutDashboard, LogOut, UserCheck, Building2,
  Handshake, Target, UserPlus, ClipboardList, ThumbsUp,
  Menu, X, HelpCircle, Home as HomeIcon
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

const PINK = '#cb3c7a';
const CYAN = '#fbbf24';

const SERVICE_CATEGORIES = [
  { name: 'Home & Repairs', icon: Building2, desc: 'Plumbing, electrical, painting, carpentry and general maintenance', color: '#7c3aed' },
  { name: 'Design & Creative', icon: Sparkles, desc: 'Graphic design, photography, video production and branding', color: PINK },
  { name: 'Business & Finance', icon: LineChart, desc: 'Accounting, bookkeeping, consulting and financial planning', color: '#0ea5e9' },
  { name: 'Technology', icon: Zap, desc: 'Web development, software, IT support and digital solutions', color: '#10b981' },
  { name: 'Health & Wellness', icon: HeartHandshake, desc: 'Personal training, nutrition, therapy and wellness coaching', color: '#f59e0b' },
  { name: 'Education & Training', icon: Award, desc: 'Tutoring, coaching, workshops and professional development', color: '#e879f9' },
  { name: 'Marketing & Sales', icon: TrendingUp, desc: 'Social media, SEO, content creation and advertising', color: '#cb3c7a' },
  { name: 'Legal & Compliance', icon: Shield, desc: 'Legal advice, contract review, compliance and documentation', color: '#06b6d4' },
  { name: 'Events & Hospitality', icon: Users, desc: 'Event planning, catering, photography and entertainment', color: '#84cc16' },
  { name: 'Consulting & Strategy', icon: Target, desc: 'Business strategy, operations, HR and organisational development', color: '#a78bfa' },
];

const HOW_IT_WORKS = [
  { step: '1', icon: UserPlus, title: 'Create Your Profile', desc: 'Professionals set up a clear, compelling profile that highlights their skills, experience, and services. Clients describe what they need in just a few clicks.', color: PINK },
  { step: '2', icon: Search, title: 'Connect with the Right People', desc: 'Clients search and connect with trusted service providers in their area or online. Professionals get discovered by people who genuinely need their expertise.', color: CYAN },
  { step: '3', icon: ThumbsUp, title: 'Deliver Great Work', desc: 'Complete projects with confidence. Build your reputation through honest reviews and grow a loyal client base over time.', color: '#10b981' },
];

const WHY_US = [
  { icon: BadgeCheck, title: 'Verified Service Providers', desc: 'Every professional on the platform is reviewed and verified before connecting with clients.' },
  { icon: UserCheck, title: 'Professional Profiles', desc: 'Providers showcase their skills, qualifications, and services in one clear, professional profile.' },
  { icon: Star, title: 'Ratings & Reviews', desc: 'Honest feedback from real clients helps you choose the right professional with confidence every time.' },
  { icon: Shield, title: 'Secure Bookings', desc: 'Book services safely. Payments and communications are protected throughout every project.' },
  { icon: ClipboardList, title: 'Clear Service Listings', desc: 'Providers describe exactly what they offer and at what price, so there are no surprises.' },
  { icon: Handshake, title: 'Trusted Connections', desc: 'A community built on reliability and professionalism, where trust is the foundation of every connection.' },
];

const TESTIMONIALS = [
  { name: 'Rachel M.', role: 'Small Business Owner', text: 'I found an excellent accountant through the platform within a day. The review system gave me real confidence. My business finances have never been better organised.', rating: 5, avatar: 'RM', sector: 'Finance' },
  { name: 'James O.', role: 'Freelance Designer', text: 'Since creating my profile here, I have more consistent client work than ever before. The platform makes it easy for the right clients to find me and my portfolio.', rating: 5, avatar: 'JO', sector: 'Design' },
  { name: 'Amina T.', role: 'Operations Manager', text: 'We needed a reliable IT consultant quickly. Found an excellent professional, agreed on scope, and the project was delivered on time. I would recommend this platform to anyone.', rating: 5, avatar: 'AT', sector: 'Technology' },
];

const PLATFORM_STATS = [
  { value: '10000', suffix: ',000+', label: 'Registered Professionals', color: PINK },
  { value: '50', suffix: '+', label: 'Service Categories', color: CYAN },
  { value: '4.8', suffix: '★', label: 'Average Provider Rating', color: PINK, isFloat: true },
  { value: '95', suffix: '%', label: 'Client Satisfaction Rate', color: CYAN },
];

const WHO_ITS_FOR = [
  { icon: Briefcase, title: 'Freelancers', desc: 'Offer your skills to clients who are actively searching for reliable, talented professionals.' },
  { icon: Zap, title: 'Skilled Tradespeople', desc: 'Plumbers, electricians, builders and other tradespeople can connect with local clients easily.' },
  { icon: LineChart, title: 'Consultants', desc: 'Business, financial, HR and strategy consultants can find clients who value expert guidance.' },
  { icon: MapPin, title: 'Local Service Providers', desc: 'Reach people in your community who need trusted help close to home.' },
  { icon: Building2, title: 'Small Businesses', desc: 'Grow your business by connecting with more clients through a trusted professional network.' },
  { icon: Sparkles, title: 'Creative Professionals', desc: 'Designers, writers, photographers and creatives can showcase their work and attract clients.' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
];

// ── ANIMATION CSS INJECTION ─────────────────────────────────────────────────
function useAnimationStyles() {
  useEffect(() => {
    const id = 'scp-home-animations';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes floatY {
        0%,100% { transform: translateY(0px); }
        50% { transform: translateY(-14px); }
      }
      @keyframes floatYSlow {
        0%,100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-22px) rotate(6deg); }
      }
      @keyframes rotateZ {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fadeSlideUp {
        from { transform: translateY(22px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes fadeSlideLeft {
        from { transform: translateX(-22px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeSlideRight {
        from { transform: translateX(22px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.92); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes heroBadgePop {
        0% { opacity: 0; transform: scale(0.6); }
        70% { transform: scale(1.06); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes glassFloat {
        0%,100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-6px) rotate(-4deg); }
      }
      @keyframes pulseGlow {
        0%,100% { box-shadow: 0 0 0px rgba(203,60,122,0.4); }
        50% { box-shadow: 0 0 28px rgba(203,60,122,0.7), 0 0 56px rgba(203,60,122,0.25); }
      }
      @keyframes pulseGlowCyan {
        0%,100% { box-shadow: 0 0 0px rgba(251,191,36,0.3); }
        50% { box-shadow: 0 0 22px rgba(251,191,36,0.6), 0 0 44px rgba(251,191,36,0.2); }
      }
      @keyframes radialBurst {
        from { transform: translate(-50%,-50%) scale(0); opacity: 0.6; }
        to { transform: translate(-50%,-50%) scale(4); opacity: 0; }
      }
      @keyframes connectorDraw {
        from { width: 0; }
        to { width: 100%; }
      }
      @keyframes scrollBounce {
        0%,100% { transform: translateX(-50%) translateY(0); opacity: 0.6; }
        50% { transform: translateX(-50%) translateY(6px); opacity: 1; }
      }
      @keyframes shimmerText {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes orbPulse {
        0%,100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.15); opacity: 1; }
      }

      /* Reveal: content is always visible (progressive enhancement).
         Observer adds *-visible to trigger a subtle entrance animation. */
      .reveal-hidden { opacity: 1; }
      .reveal-left-hidden { opacity: 1; }
      .reveal-scale-hidden { opacity: 1; }
      /* Slide-only animations (no opacity flip) so content never flashes invisible */
      @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
      @keyframes slideLeft { from { transform: translateX(-20px); } to { transform: translateX(0); } }
      @keyframes slideScale { from { transform: scale(0.95); } to { transform: scale(1); } }
      .reveal-visible { animation: slideUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
      .reveal-left-visible { animation: slideLeft 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
      .reveal-scale-visible { animation: slideScale 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }

      .tilt-card { transform-style: preserve-3d; will-change: transform; }
      .tilt-card:hover .tilt-shine { opacity: 1 !important; }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById(id); if (el) el.remove(); };
  }, []);
}

// ── HOOKS ───────────────────────────────────────────────────────────────────

function useScrollReveal({ threshold = 0.14, rootMargin = '0px 0px -50px 0px', staggerMs = 80 } = {}) {
  const observerRef = useRef(null);
  const nodesRef = useRef(new Set());

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const revealType = el.dataset.revealType || 'up';

        if (el.dataset.stagger) {
          const delay = parseInt(el.dataset.stagger, 10) || staggerMs;
          Array.from(el.children).forEach((child, idx) => {
            if (prefersReduced) {
              child.classList.remove('reveal-hidden', 'reveal-left-hidden', 'reveal-scale-hidden');
              child.style.opacity = '1';
            } else {
              child.style.animationDelay = `${idx * delay}ms`;
              if (revealType === 'scale') {
                child.classList.remove('reveal-scale-hidden');
                child.classList.add('reveal-scale-visible');
              } else {
                child.classList.remove('reveal-hidden');
                child.classList.add('reveal-visible');
              }
            }
          });
        } else {
          if (prefersReduced) {
            el.classList.remove('reveal-hidden', 'reveal-left-hidden', 'reveal-scale-hidden');
            el.style.opacity = '1';
          } else {
            if (revealType === 'left') {
              el.classList.remove('reveal-left-hidden');
              el.classList.add('reveal-left-visible');
            } else if (revealType === 'scale') {
              el.classList.remove('reveal-scale-hidden');
              el.classList.add('reveal-scale-visible');
            } else {
              el.classList.remove('reveal-hidden');
              el.classList.add('reveal-visible');
            }
          }
        }
        observerRef.current.unobserve(el);
        nodesRef.current.delete(el);
      });
    }, { threshold, rootMargin });

    // Observe nodes that registered before the observer was ready
    nodesRef.current.forEach(el => {
      if (el && el.isConnected) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const revealRef = useCallback((el) => {
    if (!el || nodesRef.current.has(el)) return;
    nodesRef.current.add(el);
    if (observerRef.current) {
      observerRef.current.observe(el);
    }
    // If observer not ready yet, the useEffect above will pick it up
  }, []);

  return revealRef;
}

function useMouseParallax(strength = 0.012) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const latestRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.innerWidth < 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onMove = (e) => {
      latestRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * strength * window.innerWidth,
        y: (e.clientY / window.innerHeight - 0.5) * strength * window.innerHeight,
      };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          setPos({ ...latestRef.current });
          rafRef.current = null;
        });
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [strength]);

  return pos;
}

function useCountUp(targetStr, duration = 1800) {
  const [display, setDisplay] = useState('0');
  const triggeredRef = useRef(false);
  const rafRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!triggerRef.current) return;
    const el = triggerRef.current;
    const isFloat = targetStr.includes('.');
    const num = parseFloat(targetStr.replace(/,/g, ''));

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || triggeredRef.current) return;
      triggeredRef.current = true;
      observer.disconnect();

      const start = performance.now();
      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = num * ease;
        setDisplay(isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString());
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(el);

    return () => { observer.disconnect(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [targetStr, duration]);

  return { display, triggerRef };
}

function useTilt3D(maxDeg = 9) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = typeof window !== 'undefined' && 'ontouchstart' in window;

  const onMouseMove = useCallback((e) => {
    if (prefersReduced || isTouch) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rotX = ((e.clientY - cy) / (rect.height / 2)) * -maxDeg;
    const rotY = ((e.clientX - cx) / (rect.width / 2)) * maxDeg;
    el.style.transition = 'transform 0.12s ease';
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    const shine = el.querySelector('.tilt-shine');
    if (shine) {
      shine.style.opacity = '1';
      shine.style.background = `radial-gradient(circle at ${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%, rgba(255,255,255,0.06) 0%, transparent 60%)`;
    }
  }, [maxDeg, prefersReduced, isTouch]);

  const onMouseLeave = useCallback((e) => {
    if (prefersReduced || isTouch) return;
    const el = e.currentTarget;
    el.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1)';
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    const shine = el.querySelector('.tilt-shine');
    if (shine) shine.style.opacity = '0';
  }, [prefersReduced, isTouch]);

  return { onMouseMove, onMouseLeave };
}

// ── SMALL COMPONENTS ────────────────────────────────────────────────────────

const AmbientShapes = memo(() => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  if (isMobile) return null;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 2 }}>
      {/* Wireframe hexagon TL */}
      <svg width="70" height="70" viewBox="0 0 70 70" style={{ position: 'absolute', top: '12%', left: '5%', animation: 'floatY 5s ease-in-out infinite, rotateZ 22s linear infinite', willChange: 'transform', opacity: 0.18 }}>
        <polygon points="35,4 64,20 64,50 35,66 6,50 6,20" fill="none" stroke={PINK} strokeWidth="1.5" />
      </svg>
      {/* Diamond TR */}
      <div style={{ position: 'absolute', top: '18%', right: '7%', width: 60, height: 60, border: `1.5px solid rgba(251,191,36,0.22)`, transform: 'rotate(45deg)', animation: 'floatYSlow 7s ease-in-out infinite 1.2s', willChange: 'transform' }} />
      {/* Circle BL */}
      <div style={{ position: 'absolute', bottom: '22%', left: '8%', width: 40, height: 40, borderRadius: '50%', border: `1.5px solid rgba(203,60,122,0.18)`, animation: 'floatY 6s ease-in-out infinite 2.1s', willChange: 'transform' }} />
      {/* Octagon CR */}
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: 'absolute', top: '40%', right: '3%', animation: 'floatYSlow 9s ease-in-out infinite 0.4s, rotateZ 32s linear infinite reverse', willChange: 'transform', opacity: 0.12 }}>
        <polygon points="27,6 63,6 84,27 84,63 63,84 27,84 6,63 6,27" fill="none" stroke={CYAN} strokeWidth="1.5" />
      </svg>
      {/* Glow blob BC */}
      <div style={{ position: 'absolute', bottom: '10%', left: '40%', width: 320, height: 180, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(203,60,122,0.09) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'floatY 8s ease-in-out infinite', willChange: 'transform' }} />
      {/* Dot grid TL */}
      <svg width="120" height="80" viewBox="0 0 120 80" style={{ position: 'absolute', top: '5%', right: '18%', opacity: 0.1 }}>
        {Array.from({ length: 20 }, (_, i) => (
          <circle key={i} cx={(i % 5) * 24 + 12} cy={Math.floor(i / 5) * 20 + 10} r="1.5" fill={CYAN} />
        ))}
      </svg>
    </div>
  );
});

const ScrollIndicator = () => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 80) setVisible(false); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, pointerEvents: 'none' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Scroll</span>
      <ChevronDown style={{ color: 'rgba(203,60,122,0.65)', width: 18, height: 18, animation: 'floatY 1.6s ease-in-out infinite' }} />
    </div>
  );
};

function StatCounter({ stat }) {
  const { display, triggerRef } = useCountUp(stat.value, 1900);
  return (
    <div ref={triggerRef} className="text-center" style={{ padding: '8px 0' }}>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1" style={{ color: stat.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>
        {display}{stat.suffix}
      </div>
      <div className="text-xs sm:text-sm font-medium text-white" style={{ opacity: 0.75 }}>{stat.label}</div>
    </div>
  );
}

// ── SHADER BACKGROUND ──────────────────────────────────────────────────────
const defaultShaderSource = `#version 300 es
/*
 * made by Matthias Hurrle (@atzedent)
 */
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(in vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;mat2 m=mat2(1.,-.5,.2,1.2);for(int i=0;i<5;i++){t+=a*noise(p);p*=2.*m;a*=.5;}return t;}
float clouds(vec2 p){float d=1.,t=.0;for(float i=.0;i<3.;i++){float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);t=mix(t,d,a);d=a;p*=2./(i+1.);}return t;}
void main(void){
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for(float i=1.;i<12.;i++){
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
  }
  O=vec4(col,1);
}`;

function useShaderBackground() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const rendererRef = useRef(null);
  const pointersRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    class WebGLRenderer {
      constructor(canvas, scale) {
        this.canvas = canvas; this.scale = scale; this.program = null;
        this.vs = null; this.fs = null; this.buffer = null;
        this.shaderSource = defaultShaderSource;
        this.mouseMove = [0, 0]; this.mouseCoords = [0, 0];
        this.pointerCoords = [0, 0]; this.nbrOfPointers = 0;
        this.vertexSrc = `#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}`;
        this.vertices = [-1, 1, -1, -1, 1, 1, 1, -1];
        this.gl = canvas.getContext('webgl2');
        if (this.gl) this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
      }
      compile(shader, source) {
        const gl = this.gl; gl.shaderSource(shader, source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.error('Shader error:', gl.getShaderInfoLog(shader));
      }
      setup() {
        const gl = this.gl; if (!gl) return;
        this.vs = gl.createShader(gl.VERTEX_SHADER); this.fs = gl.createShader(gl.FRAGMENT_SHADER);
        this.compile(this.vs, this.vertexSrc); this.compile(this.fs, this.shaderSource);
        this.program = gl.createProgram(); gl.attachShader(this.program, this.vs); gl.attachShader(this.program, this.fs);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(this.program));
      }
      init() {
        const gl = this.gl; const p = this.program; if (!gl || !p) return;
        this.buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        const pos = gl.getAttribLocation(p, 'position'); gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        p.resolution = gl.getUniformLocation(p, 'resolution'); p.time = gl.getUniformLocation(p, 'time');
        p.move = gl.getUniformLocation(p, 'move'); p.touch = gl.getUniformLocation(p, 'touch');
        p.pointerCount = gl.getUniformLocation(p, 'pointerCount'); p.pointers = gl.getUniformLocation(p, 'pointers');
      }
      reset() {
        const gl = this.gl; if (!gl || !this.program) return;
        if (this.vs) { gl.detachShader(this.program, this.vs); gl.deleteShader(this.vs); }
        if (this.fs) { gl.detachShader(this.program, this.fs); gl.deleteShader(this.fs); }
        gl.deleteProgram(this.program); this.program = null;
      }
      updateScale(scale) { this.scale = scale; if (this.gl) this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale); }
      updateMove(d) { this.mouseMove = d; }
      updateMouse(c) { this.mouseCoords = c; }
      updatePointerCoords(c) { this.pointerCoords = c; }
      updatePointerCount(n) { this.nbrOfPointers = n; }
      render(now = 0) {
        const gl = this.gl; const p = this.program; if (!gl || !p) return;
        gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(p);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.uniform2f(p.resolution, this.canvas.width, this.canvas.height);
        gl.uniform1f(p.time, now * 1e-3);
        gl.uniform2f(p.move, ...this.mouseMove); gl.uniform2f(p.touch, ...this.mouseCoords);
        gl.uniform1i(p.pointerCount, this.nbrOfPointers); gl.uniform2fv(p.pointers, this.pointerCoords);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }

    class PointerHandler {
      constructor(element, scale) {
        this.scale = scale; this.active = false; this.pointers = new Map();
        this.lastCoords = [0, 0]; this.moves = [0, 0];
        const map = (el, sc, x, y) => [x * sc, el.height - y * sc];
        element.addEventListener('pointerdown', (e) => { this.active = true; this.pointers.set(e.pointerId, map(element, this.scale, e.clientX, e.clientY)); });
        element.addEventListener('pointerup', (e) => { if (this.pointers.size === 1) this.lastCoords = this.first; this.pointers.delete(e.pointerId); this.active = this.pointers.size > 0; });
        element.addEventListener('pointerleave', (e) => { if (this.pointers.size === 1) this.lastCoords = this.first; this.pointers.delete(e.pointerId); this.active = this.pointers.size > 0; });
        element.addEventListener('pointermove', (e) => { if (!this.active) return; this.lastCoords = [e.clientX, e.clientY]; this.pointers.set(e.pointerId, map(element, this.scale, e.clientX, e.clientY)); this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY]; });
      }
      get count() { return this.pointers.size; }
      get move() { return this.moves; }
      get coords() { return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0]; }
      get first() { return this.pointers.values().next().value || this.lastCoords; }
    }

    const renderer = new WebGLRenderer(canvas, dpr);
    const pointers = new PointerHandler(canvas, dpr);
    rendererRef.current = renderer; pointersRef.current = pointers;
    renderer.setup(); renderer.init();

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.offsetWidth : window.innerWidth;
      const h = parent ? parent.offsetHeight : window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      renderer.updateScale(dpr);
    };
    resize();

    const loop = (now) => {
      renderer.updateMouse(pointers.first); renderer.updatePointerCount(pointers.count);
      renderer.updatePointerCoords(pointers.coords); renderer.updateMove(pointers.move);
      renderer.render(now);
      animationFrameRef.current = requestAnimationFrame(loop);
    };
    animationFrameRef.current = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); renderer.reset(); };
  }, []);

  return canvasRef;
}
// ───────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const heroCanvasRef = useShaderBackground();
  const parallax = useMouseParallax(0.013);
  const revealRef = useScrollReveal();
  const tilt = useTilt3D(8);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Connector line for How It Works
  const connectorRef = useRef(null);
  const howItWorksSectionRef = useRef(null);

  useAnimationStyles();

  useEffect(() => {
    const seen = localStorage.getItem('kcf_onboarding_seen');
    if (!seen) setTimeout(() => setShowOnboarding(true), 1000);
  }, []);

  // Connector line observer
  useEffect(() => {
    if (!connectorRef.current || !howItWorksSectionRef.current) return;
    if (window.innerWidth < 768) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const el = connectorRef.current;
      if (!el) return;
      el.style.display = 'block';
      requestAnimationFrame(() => { el.style.width = '100%'; });
      observer.disconnect();
    }, { threshold: 0.3 });
    observer.observe(howItWorksSectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCloseOnboarding = () => { setShowOnboarding(false); localStorage.setItem('kcf_onboarding_seen', '1'); };
  const handleLangChange = (code) => {
    setSelectedLang(code); setLangMenuOpen(false);
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

  return (
    <div style={{ background: '#0f0900', color: '#fff', fontFamily: 'inherit' }}>
      <OnboardingModal open={showOnboarding} onClose={handleCloseOnboarding} />

      {/* ── NAV ── */}
      <nav style={{ background: 'rgba(15,9,0,0.97)', borderBottom: '1px solid rgba(251,191,36,0.15)' }} className="sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Home')} className="flex items-center flex-shrink-0">
              <Logo size="md" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {[
                { label: 'Home', page: 'Home' },
                { label: 'Find Services', page: 'Browse' },
                { label: '🎤 Voice Request', page: 'VoiceRequest' },
                { label: 'List Your Services', page: 'ProviderSignup' },
                { label: 'Support', page: 'Support' },
              ].map(({ label, page }) => (
                <Link key={page} to={createPageUrl(page)}
                  className="text-sm font-medium transition-colors whitespace-nowrap"
                  style={{ color: page === 'Home' ? PINK : 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={e => e.target.style.color = PINK}
                  onMouseLeave={e => e.target.style.color = page === 'Home' ? PINK : 'rgba(255,255,255,0.7)'}
                >{label}</Link>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative hidden md:block">
                <button onClick={() => setLangMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Globe className="w-3.5 h-3.5" /><span>{currentLang?.label}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden shadow-xl z-50" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.25)' }}>
                    {LANGUAGES.map(lang => (
                      <button key={lang.code} className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                        style={{ color: lang.code === selectedLang ? PINK : 'rgba(255,255,255,0.75)', background: lang.code === selectedLang ? 'rgba(203,60,122,0.1)' : 'transparent', fontWeight: lang.code === selectedLang ? 600 : 400 }}
                        onClick={() => handleLangChange(lang.code)}>{lang.label}</button>
                    ))}
                  </div>
                )}
              </div>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10 px-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback style={{ background: PINK, color: '#fff' }}>
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                        {user.full_name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.3)', color: '#fff' }}>
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
                        <DropdownMenuSeparator style={{ background: 'rgba(203,60,122,0.2)' }} />
                        <DropdownMenuItem asChild>
                          <Link to="/AdminDashboard" className="flex items-center text-white hover:text-white">
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator style={{ background: 'rgba(203,60,122,0.2)' }} />
                    <DropdownMenuItem onClick={() => logout()} className="text-white hover:text-white cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate('/Login')} style={{ background: PINK }} className="text-white hover:opacity-90 border-0 hidden sm:flex">
                  Sign In
                </Button>
              )}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)' }}
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div style={{ background: '#140b00', borderTop: '1px solid rgba(251,191,36,0.15)' }} className="md:hidden pb-4">
            <div className="px-4 pt-2 space-y-1">
              {[
                { label: 'Home', page: 'Home' },
                { label: 'Find Services', page: 'Browse' },
                { label: '🎤 Voice Request', page: 'VoiceRequest' },
                { label: 'List Your Services', page: 'ProviderSignup' },
                { label: 'Support', page: 'Support' },
              ].map(({ label, page }) => (
                <Link key={page} to={createPageUrl(page)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: page === 'Home' ? PINK : 'rgba(255,255,255,0.8)', background: page === 'Home' ? 'rgba(203,60,122,0.08)' : 'transparent' }}
                  onClick={() => setMobileMenuOpen(false)}
                >{label}</Link>
              ))}
              {!user && (
                <div className="pt-3 pb-1 border-t mt-2" style={{ borderColor: 'rgba(251,191,36,0.15)' }}>
                  <button onClick={() => { setMobileMenuOpen(false); navigate('/Login'); }}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold text-white text-center"
                    style={{ background: PINK }}>
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: '#000', position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }} className="py-14 md:py-20 lg:py-32">
        {/* WebGL shader canvas */}
        <canvas
          ref={heroCanvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none', display: 'block' }}
        />
        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.48)', pointerEvents: 'none' }} />
        {/* Ambient 3D shapes */}
        <AmbientShapes />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative w-full" style={{ zIndex: 10 }}>
          <div className="text-center max-w-4xl mx-auto mb-8 md:mb-12">

            {/* Layer 1 — badge + headline (moves opposite to mouse) */}
            <div style={{ transform: `translate(${-parallax.x * 0.8}px, ${-parallax.y * 0.8}px)`, transition: 'transform 0.1s linear', willChange: 'transform' }}>
              <div className="inline-flex items-center gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 text-xs sm:text-sm font-medium"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: CYAN, animation: 'heroBadgePop 0.9s cubic-bezier(0.22,1,0.36,1) both', animationDelay: '0.2s', opacity: 0 }}>
                <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: CYAN }} />
                WHERE SKILLS MEET OPPORTUNITY
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight" style={{ letterSpacing: '-1.5px' }}>
                Turn Your Skills<br />
                Into{' '}
                <span style={{
                  background: `linear-gradient(135deg, ${PINK} 0%, ${CYAN} 50%, ${PINK} 100%)`,
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmerText 3s linear infinite',
                }}>Opportunity</span>
              </h1>
            </div>

            {/* Layer 2 — body text (moves with mouse at reduced rate) */}
            <div style={{ transform: `translate(${parallax.x * 0.35}px, ${parallax.y * 0.35}px)`, transition: 'transform 0.15s linear', willChange: 'transform' }}>
              <p className="text-base sm:text-xl md:text-2xl mb-3 sm:mb-4 font-medium px-2" style={{ color: 'rgba(255,255,255,0.78)' }}>
                Connect with people who need your expertise. Build your reputation, grow your income, and be part of a trusted community.
              </p>
              <p className="text-sm sm:text-base mb-6 sm:mb-10 max-w-2xl mx-auto px-2" style={{ color: 'rgba(255,255,255,0.48)' }}>
                Whether you are a skilled professional looking for clients, or someone who needs reliable help — Service Connect Pro brings the right people together.
              </p>
            </div>

            {/* Layer 3 — CTA (stays fixed) */}
            <div>
              <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
                <SearchBar onSearch={handleSearch} dark />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-8 sm:mb-12 px-2">
                <Link to={createPageUrl('Browse')} className="w-full sm:w-auto">
                  <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg rounded-xl text-white border-0 w-full"
                    style={{ background: PINK, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(203,60,122,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Find Services
                  </Button>
                </Link>
                <Link to={createPageUrl('VoiceRequest')} className="w-full sm:w-auto">
                  <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg rounded-xl text-white border-0 w-full"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #cb3c7a)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(239,68,68,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Voice Request
                  </Button>
                </Link>
                <Link to={createPageUrl('ProviderSignup')} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg rounded-xl w-full bg-transparent hover:bg-amber-400/10 hover:text-white border-0"
                    style={{ border: `2px solid rgba(251,191,36,0.4)`, color: CYAN, transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = CYAN; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(251,191,36,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.4)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Offer Your Services
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm px-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {[
                  { Icon: BadgeCheck, label: 'Verified Professionals' },
                  { Icon: Shield, label: 'Secure Bookings' },
                  { Icon: Star, label: 'Trusted Reviews' },
                  { Icon: Handshake, label: 'Community Built on Trust' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: CYAN }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* ── PLATFORM STATS ── */}
      <section
        ref={revealRef}
        data-reveal-type="up"
        style={{ background: '#080500', borderTop: '1px solid rgba(251,191,36,0.12)', borderBottom: '1px solid rgba(251,191,36,0.12)' }}
        className="py-8 sm:py-10 reveal-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {PLATFORM_STATS.map((stat, i) => (
              <StatCounter key={i} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE CATEGORIES ── */}
      <section style={{ background: '#0f0900' }} className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={revealRef} className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3 reveal-hidden">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2" style={{ letterSpacing: '-0.5px' }}>Browse Service Categories</h2>
              <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>Find the right professional for whatever you need</p>
            </div>
            <Link to={createPageUrl('Browse')} className="self-start sm:self-auto flex-shrink-0">
              <Button variant="ghost" className="hover:bg-white/10" style={{ color: PINK }}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Staggered 3D tilt category cards */}
          <div
            ref={(el) => revealRef(el)}
            data-stagger="55"
            data-reveal-type="up"
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
          >
            {SERVICE_CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link key={i} to={createPageUrl(`Browse?q=${encodeURIComponent(cat.name)}`)}
                  className="rounded-2xl p-5 group cursor-pointer tilt-card reveal-hidden"
                  style={{ background: '#140b00', border: `1px solid rgba(255,255,255,0.07)`, position: 'relative', overflow: 'hidden', transition: 'border-color 0.25s ease, background 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.background = `${cat.color}12`; e.currentTarget.style.boxShadow = `0 8px 32px ${cat.color}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#140b00'; e.currentTarget.style.boxShadow = ''; }}
                  onMouseMove={tilt.onMouseMove}
                >
                  {/* Tilt shine overlay */}
                  <div className="tilt-shine" style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none', borderRadius: 16 }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ background: `${cat.color}22`, transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 16px ${cat.color}50`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <h4 className="font-semibold text-white text-sm leading-tight mb-1">{cat.name}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>{cat.desc}</p>
                </Link>
              );
            })}
          </div>

          {categories.length > 0 && (
            <div ref={revealRef} className="mt-8 reveal-hidden">
              <p className="text-sm font-medium mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>More categories on the platform:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {categories.slice(0, 4).map(category => (
                  <CategoryCard key={category.id} category={category}
                    providerCount={providers.filter(p => p.category_id === category.id).length} dark />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED PROVIDERS ── */}
      <section style={{ background: '#140b00' }} className="py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={revealRef} className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3 reveal-hidden">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-semibold" style={{ background: 'rgba(251,191,36,0.1)', color: CYAN }}>
                <Award className="w-3.5 h-3.5" /> Top Rated
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ letterSpacing: '-0.5px' }}>Featured Service Providers</h2>
              <p className="text-sm sm:text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>Verified professionals with proven track records and excellent reviews</p>
            </div>
            <Link to={createPageUrl('Browse')} className="self-start sm:self-auto flex-shrink-0">
              <Button variant="ghost" className="hover:bg-white/10" style={{ color: PINK }}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div
            ref={(el) => revealRef(el)}
            data-stagger="90"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {loadingProviders ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl reveal-hidden" style={{ background: '#0f0900' }}>
                  <Skeleton className="h-40 rounded-t-2xl opacity-30" />
                  <div className="p-6 pt-12"><Skeleton className="h-5 w-32 mb-2 opacity-20" /><Skeleton className="h-4 w-24 mb-4 opacity-20" /></div>
                </div>
              ))
            ) : providers.length > 0 ? (
              providers.slice(0, 4).map(provider => (
                <div key={provider.id} className="reveal-hidden">
                  <ProviderCard provider={provider} dark />
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Service providers will appear here once registered.</p>
                <Link to={createPageUrl('ProviderSignup')} className="mt-4 inline-block">
                  <Button style={{ background: PINK }} className="text-white border-0 mt-4">List Your Services</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section ref={howItWorksSectionRef} style={{ background: '#0f0900' }} className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={revealRef} className="text-center mb-10 sm:mb-16 reveal-hidden">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.5px' }}>How It Works</h2>
            <p className="text-base sm:text-lg max-w-xl mx-auto px-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Simple, clear, and designed to get you connected with the right people fast
            </p>
          </div>

          {/* Steps with animated connector */}
          <div style={{ position: 'relative' }}>
            {/* Connector line — desktop only, drawn on scroll */}
            <div
              ref={connectorRef}
              style={{
                display: 'none',
                position: 'absolute',
                top: 52,
                left: 'calc(16.66% + 8px)',
                right: 'calc(16.66% + 8px)',
                height: 2,
                background: `linear-gradient(90deg, ${PINK}, ${CYAN}, #10b981)`,
                width: 0,
                transition: 'width 1.3s cubic-bezier(0.22,1,0.36,1)',
                pointerEvents: 'none',
                zIndex: 1,
                borderRadius: 2,
                boxShadow: `0 0 12px rgba(203,60,122,0.4)`,
              }}
            />

            <div
              ref={(el) => revealRef(el)}
              data-stagger="160"
              className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8"
              style={{ position: 'relative', zIndex: 2 }}
            >
              {HOW_IT_WORKS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="rounded-3xl p-6 sm:p-8 text-center tilt-card reveal-hidden"
                    style={{ background: '#140b00', border: `1px solid ${item.color}28`, position: 'relative', overflow: 'hidden', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}55`; e.currentTarget.style.boxShadow = `0 16px 48px ${item.color}18`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${item.color}28`; e.currentTarget.style.boxShadow = ''; }}
                    onMouseMove={tilt.onMouseMove}
                  >
                    <div className="tilt-shine" style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none', borderRadius: 24 }} />
                    {/* Floating icon */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5"
                      style={{ background: `${item.color}22`, animation: `floatY ${4 + i * 0.9}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`, willChange: 'transform' }}>
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: item.color }} />
                    </div>
                    {/* Floating step badge */}
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm mb-3 sm:mb-4"
                      style={{ background: item.color, animation: `floatY ${4.5 + i * 0.7}s ease-in-out infinite`, animationDelay: `${i * 0.3 + 0.2}s`, willChange: 'transform', boxShadow: `0 4px 16px ${item.color}50` }}>
                      {item.step}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={revealRef} className="flex flex-col sm:flex-row gap-3 justify-center mt-8 sm:mt-12 px-2 reveal-hidden">
            <Link to={createPageUrl('Browse')} className="w-full sm:w-auto">
              <Button size="lg" className="h-12 px-8 rounded-xl text-white border-0 w-full sm:w-auto" style={{ background: PINK }}>
                Find a Professional <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('ProviderSignup')} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl bg-transparent hover:bg-amber-400/10 hover:text-white border-0 w-full sm:w-auto"
                style={{ border: '2px solid rgba(251,191,36,0.4)', color: CYAN }}>
                Create Your Profile <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY SCP MATTERS ── */}
      <section style={{ background: '#080500', borderTop: '1px solid rgba(203,60,122,0.12)' }} className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div ref={revealRef} className="reveal-left-hidden" data-reveal-type="left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight" style={{ letterSpacing: '-0.5px' }}>
                Bridging the gap between <span style={{ color: PINK }}>skills and opportunity</span>
              </h2>
              <p className="mb-4 text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Many talented professionals struggle to find consistent, reliable work — not because of a lack of skill, but because of a lack of the right connections.
              </p>
              <p className="mb-4 text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                At the same time, individuals and businesses often struggle to find trustworthy professionals they can count on.
              </p>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Service Connect Pro exists to bridge that gap — creating a trusted environment where skills meet real opportunity, and where great work leads to long-term success.
              </p>
            </div>
            <div
              ref={(el) => revealRef(el)}
              data-stagger="120"
              className="grid grid-cols-1 gap-4"
            >
              {[
                { icon: Target, label: 'Skills Meet Opportunity', desc: 'Talented professionals connect directly with people and businesses that need their expertise.', color: PINK },
                { icon: UserCheck, label: 'Clients Find Reliable Help', desc: 'Verified profiles and real reviews make it easy to hire with confidence.', color: CYAN },
                { icon: TrendingUp, label: 'Professionals Build Long-Term Success', desc: 'A reputation built here opens doors to consistent work and a growing income.', color: '#10b981' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 rounded-2xl p-5 reveal-hidden"
                    style={{ background: '#140b00', border: `1px solid ${item.color}22`, transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}55`; e.currentTarget.style.boxShadow = `0 8px 28px ${item.color}15`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${item.color}22`; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}22` }}>
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.label}</h4>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ── */}
      <section style={{ background: '#140b00' }} className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={revealRef} className="text-center mb-10 sm:mb-14 reveal-hidden">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(251,191,36,0.1)', color: CYAN }}>
              Platform Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.5px' }}>Built on Trust</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Every feature is designed to make finding and offering services safe, simple, and reliable.
            </p>
          </div>
          <div
            ref={(el) => revealRef(el)}
            data-stagger="75"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="rounded-2xl p-6 tilt-card reveal-hidden"
                  style={{ background: '#0f0900', border: '1px solid rgba(255,255,255,0.07)', position: 'relative', overflow: 'hidden', transition: 'border-color 0.25s ease, box-shadow 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(203,60,122,0.38)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(203,60,122,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = ''; }}
                  onMouseMove={tilt.onMouseMove}
                >
                  <div className="tilt-shine" style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none', borderRadius: 16 }} />
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(203,60,122,0.15)', transition: 'box-shadow 0.3s ease' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(203,60,122,0.35)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
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
      <section style={{ background: '#0f0900' }} className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={revealRef} className="text-center mb-8 sm:mb-12 reveal-hidden">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.5px' }}>What Our Community Says</h2>
            <p className="text-base sm:text-lg px-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Real stories from professionals and clients who found the right connection</p>
          </div>
          <div
            ref={(el) => revealRef(el)}
            data-stagger="130"
            data-reveal-type="scale"
            className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
          >
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-3xl p-6 relative tilt-card reveal-scale-hidden"
                style={{
                  background: 'rgba(20,11,0,0.65)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  border: '1px solid rgba(203,60,122,0.18)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(203,60,122,0.4)'; e.currentTarget.style.boxShadow = '0 16px 56px rgba(0,0,0,0.5), 0 0 32px rgba(203,60,122,0.12), inset 0 1px 0 rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(203,60,122,0.18)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)'; }}
                onMouseMove={tilt.onMouseMove}
              >
                <div className="tilt-shine" style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.2s ease', pointerEvents: 'none', borderRadius: 24 }} />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {Array(t.rating).fill(0).map((_, s) => <Star key={s} className="w-4 h-4 fill-current" style={{ color: '#f59e0b' }} />)}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(251,191,36,0.1)', color: CYAN }}>{t.sector}</span>
                </div>
                <Quote className="w-7 h-7 mb-3" style={{ color: 'rgba(203,60,122,0.4)', animation: 'glassFloat 4s ease-in-out infinite', animationDelay: `${i * 0.8}s` }} />
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.68)' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${PINK}, #ef4444)`, boxShadow: '0 4px 12px rgba(203,60,122,0.4)' }}>
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

      {/* ── WHO THIS IS FOR ── */}
      <section style={{ background: '#080500', borderTop: '1px solid rgba(251,191,36,0.1)' }} className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={revealRef} className="text-center mb-10 sm:mb-14 reveal-hidden">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3" style={{ letterSpacing: '-0.5px' }}>Who This Is For</h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto px-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Anyone with valuable skills can create opportunity and build income through this platform
            </p>
          </div>
          <div
            ref={(el) => revealRef(el)}
            data-stagger="80"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {WHO_ITS_FOR.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="rounded-2xl p-6 flex items-start gap-4 reveal-hidden"
                  style={{ background: '#140b00', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(251,191,36,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.1)' }}>
                    <Icon className="w-6 h-6" style={{ color: CYAN }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROFESSIONAL GROWTH ── */}
      <section style={{ background: '#0f0900' }} className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div ref={revealRef} className="reveal-left-hidden" data-reveal-type="left">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-wider" style={{ background: 'rgba(203,60,122,0.12)', color: PINK }}>
                Professional Growth
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight" style={{ letterSpacing: '-0.5px' }}>
                A platform where your <span style={{ color: PINK }}>skills turn into success</span>
              </h2>
              <p className="mb-4 text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Service Connect Pro is more than a marketplace. It is a community where professionals build long-term careers and meaningful client relationships.
              </p>
              <p className="mb-6 text-base" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Every completed project, every five-star review, and every returning client strengthens your professional reputation and opens doors to new opportunities.
              </p>
              <Link to={createPageUrl('ProviderSignup')}>
                <Button size="lg" className="h-12 px-6 rounded-xl text-white border-0 w-full sm:w-auto" style={{ background: PINK }}>
                  Create Your Professional Profile <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div
              ref={(el) => revealRef(el)}
              data-stagger="100"
              className="grid grid-cols-1 gap-4"
            >
              {[
                { icon: Users, title: 'Expand Your Client Base', desc: 'Reach more clients than you ever could through word of mouth alone.', color: PINK },
                { icon: Star, title: 'Build Credibility Through Reviews', desc: 'Verified client reviews establish your reputation and build lasting trust.', color: '#f59e0b' },
                { icon: TrendingUp, title: 'Grow Consistent Income', desc: 'A strong profile attracts repeat clients and steady, reliable work.', color: CYAN },
                { icon: BadgeCheck, title: 'Showcase Your Expertise', desc: 'Your profile is your portfolio — make it work for you around the clock.', color: '#10b981' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-4 rounded-2xl p-4 reveal-hidden"
                    style={{ background: '#140b00', border: `1px solid ${item.color}22`, transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}55`; e.currentTarget.style.boxShadow = `0 6px 20px ${item.color}12`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${item.color}22`; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}22` }}>
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm mb-0.5">{item.title}</h4>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #0d0800 0%, #0f0900 100%)', borderTop: '1px solid rgba(203,60,122,0.2)', position: 'relative', overflow: 'hidden' }} className="py-16 sm:py-24">
        {/* Radial ambient glow */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', width: 700, height: 700, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(203,60,122,0.1) 0%, rgba(203,60,122,0.04) 35%, transparent 70%)', pointerEvents: 'none', animation: 'orbPulse 6s ease-in-out infinite' }} />
        {/* Secondary glow */}
        <div aria-hidden="true" style={{ position: 'absolute', top: '30%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)', pointerEvents: 'none', animation: 'floatYSlow 9s ease-in-out infinite 2s' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div ref={revealRef} className="reveal-hidden">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6"
              style={{ background: 'rgba(203,60,122,0.15)', border: '1px solid rgba(203,60,122,0.3)', animation: 'floatY 3.5s ease-in-out infinite', boxShadow: '0 0 40px rgba(203,60,122,0.2)' }}>
              <Handshake className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: PINK }} />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4" style={{ letterSpacing: '-1px' }}>
              Great work begins with<br className="hidden sm:block" />
              <span style={{
                background: `linear-gradient(135deg, ${PINK} 0%, ${CYAN} 60%, ${PINK} 100%)`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmerText 3.5s linear infinite',
              }}> the right connection.</span>
            </h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Join a trusted network where skills, opportunity, and community come together. Whether you need help or have help to offer — this is where it starts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-2">
              <Link to={createPageUrl('Browse')} className="w-full sm:w-auto">
                <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg rounded-xl text-white border-0 w-full"
                  style={{ background: PINK, animation: 'pulseGlow 2.8s ease-in-out infinite' }}>
                  Find Services <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('ProviderSignup')} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg rounded-xl bg-transparent hover:bg-amber-400/10 hover:text-white border-0 w-full font-bold"
                  style={{ border: '2px solid rgba(251,191,36,0.45)', color: CYAN, animation: 'pulseGlowCyan 3.2s ease-in-out infinite 0.5s' }}>
                  Offer Your Services <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#080500', borderTop: '1px solid rgba(251,191,36,0.1)' }} className="py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="mb-4"><Logo size="md" /></div>
              <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                A trusted platform connecting skilled professionals with clients who need their expertise. Built on trust, community, and meaningful work.
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Powered by <span style={{ color: PINK }}>Kindness Community</span> · KCF LLC
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Services</h4>
              <div className="space-y-2">
                {['Home & Repairs', 'Design & Creative', 'Technology', 'Business & Finance', 'Consulting & Strategy'].map(s => (
                  <Link key={s} to={createPageUrl(`Browse?q=${encodeURIComponent(s)}`)} className="block text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.target.style.color = PINK} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>{s}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Platform</h4>
              <div className="space-y-2">
                {[
                  { label: 'Find Services', page: 'Browse' },
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
              Powered by <span style={{ color: PINK }}>Kindness Community Foundation</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useAuth } from '@/lib/AuthContext';
import {
  Menu, X, LogOut, Home, Search, Building2, HelpCircle,
  Briefcase, LayoutDashboard, Mic,
  MapPin, BadgeCheck, Shield, ChevronDown, Phone, Mail, Heart, MessageCircle, BookOpen
} from 'lucide-react';
import Logo from '@/components/Logo';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import BottomTabNavigation from '@/components/mobile/BottomTabNavigation';
import { Toaster } from "@/components/ui/sonner";
import { THEME as L } from '@/lib/theme';

const NAV_LINKS = [
  { label: 'Services', page: 'Browse' },
  { label: 'Voice Match', page: 'VoiceRequest' },
  { label: 'For Providers', page: 'ProviderSignup' },
  { label: 'Support', page: 'Support' },
  { label: 'Blog', page: 'Blog' },
];

const USER_MENU_ITEMS = [
  { label: 'My Dashboard', page: 'HomeownerDashboard', icon: LayoutDashboard },
  { label: 'My Profile', page: 'CustomerProfile', icon: LayoutDashboard },
  { label: 'Messages', page: 'Inbox', icon: MessageCircle },
  { label: 'My Orders', page: 'Orders', icon: Briefcase },
  { label: 'My Favorites', page: 'Favorites', icon: Heart },
  { label: 'Provider Dashboard', page: 'ProviderDashboard', icon: Building2 },
];

function Footer() {
  return (
    <footer style={{ background: L.bg2, borderTop: `1px solid ${L.border}`, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ display: 'grid', gap: 48, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <Logo size="sm" />
            </div>
            <p style={{ fontSize: 13, color: L.text3, lineHeight: 1.7, fontWeight: 300, marginBottom: 20 }}>
              California's most trusted home services marketplace.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="tel:+19499963051" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: L.text3, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = L.text}
                onMouseLeave={e => e.currentTarget.style.color = L.text3}>
                <Phone size={13} /> (949) 996-3051
              </a>
              <a href="mailto:contact@kindnesscommunityfoundation.com" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: L.text3, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = L.text}
                onMouseLeave={e => e.currentTarget.style.color = L.text3}>
                <Mail size={13} /> Contact us
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: L.text3, marginBottom: 16 }}>Services</p>
            {[
              { label: 'Plumbing', page: 'PlumbingServices' },
              { label: 'HVAC', page: 'HVACServices' },
              { label: 'Cleaning', page: 'CleaningServices' },
              { label: 'Emergency Repairs', page: 'EmergencyRepairs' },
              { label: 'Recurring', page: 'RecurringServices' },
            ].map(({ label, page }) => (
              <Link key={page} to={createPageUrl(page)}
                style={{ display: 'block', fontSize: 13, color: L.text3, marginBottom: 8, textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = L.text}
                onMouseLeave={e => e.target.style.color = L.text3}>{label}</Link>
            ))}
          </div>

          {/* Quick Links */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: L.text3, marginBottom: 16 }}>Platform</p>
            {[
              { l: 'Browse', p: 'Browse' },
              { l: 'Voice Match', p: 'VoiceRequest' },
              { l: 'For Providers', p: 'ProviderSignup' },
              { l: 'Blog', p: 'Blog' },
              { l: 'Support', p: 'Support' },
            ].map(({ l, p }) => (
              <Link key={p} to={createPageUrl(p)}
                style={{ display: 'block', fontSize: 13, color: L.text3, marginBottom: 8, textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = L.text}
                onMouseLeave={e => e.target.style.color = L.text3}>{l}</Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: L.text3, marginBottom: 16 }}>Legal</p>
            {[
              { l: 'Terms & Privacy', p: 'TermsAndPrivacy' },
              { l: 'About Us', p: 'About' },
              { l: 'Trust & Safety', p: 'Support' },
            ].map(({ l, p }) => (
              <Link key={p} to={createPageUrl(p)}
                style={{ display: 'block', fontSize: 13, color: L.text3, marginBottom: 8, textDecoration: 'none', fontWeight: 300, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = L.text}
                onMouseLeave={e => e.target.style.color = L.text3}>{l}</Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${L.border}`, marginTop: 40, paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <p style={{ fontSize: 12, color: L.text3 }}>© {new Date().getFullYear()} Service Connect Pro · KCF LLC · <a href="https://kindnesscommunityfoundation.com/" style={{ color: L.text3, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = L.text} onMouseLeave={e => e.target.style.color = L.text3}>Kindness Community Foundation</a> · All rights reserved</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[{ icon: BadgeCheck, label: 'Verified', c: L.blue }, { icon: Shield, label: 'Secure', c: L.green }].map(({ icon: Icon, label, c }) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: L.text3, background: L.bg3, border: `1px solid ${L.border}`, borderRadius: 100, padding: '4px 10px' }}>
                <Icon size={10} style={{ color: c }} /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children, currentPageName }) {
  // Use shared AuthContext — no separate auth.me() call needed
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => setUserMenuOpen(false);
    document.addEventListener('click', fn);
    return () => document.removeEventListener('click', fn);
  }, []);

  const hideLayout = currentPageName === 'Home';

  if (hideLayout) {
    return (
      <>
        {children}
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)',
        borderBottom: `1px solid ${scrolled ? L.border : 'transparent'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(12px, 2vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, minHeight: 68, gap: 12, flexWrap: 'wrap' }}>

          <Link to={createPageUrl('Home')} style={{ textDecoration: 'none' }}>
            <Logo size="sm" />
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'none', alignItems: 'center', gap: 'clamp(2px, 1vw, 8px)' }} className="md:flex">
            {NAV_LINKS.map(({ label, page }) => {
              const active = currentPageName === page;
              return (
                <Link key={page} to={createPageUrl(page)} style={{ textDecoration: 'none' }}>
                  <span style={{
                    display: 'block', padding: 'clamp(6px 10px, 1vw, 8px 16px)', borderRadius: 10,
                    fontSize: 'clamp(12px, 1.8vw, 14px)', fontWeight: active ? 600 : 400,
                    color: active ? L.text : L.text2,
                    background: active ? L.bg3 : 'transparent',
                    border: `1px solid ${active ? L.border2 : 'transparent'}`,
                    transition: 'all 0.2s', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                    onMouseEnter={e => { if (!active) { e.target.style.color = L.text; e.target.style.background = L.bg3; } }}
                    onMouseLeave={e => { if (!active) { e.target.style.color = L.text2; e.target.style.background = 'transparent'; } }}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user && <NotificationCenter />}

            {user ? (
              <div style={{ position: 'relative' }} className="hidden md:block">
                <button onClick={e => { e.stopPropagation(); setUserMenuOpen(o => !o); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', borderRadius: 100, background: L.bg3, border: `1px solid ${L.border}`, color: L.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = L.border2}
                  onMouseLeave={e => e.currentTarget.style.borderColor = L.border}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: L.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </div>
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.full_name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={12} style={{ color: L.text3, transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {userMenuOpen && (
                  <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 210, borderRadius: 16, overflow: 'hidden', background: '#fff', border: `1px solid ${L.border}`, zIndex: 200, boxShadow: '0 16px 48px rgba(0,0,0,0.10)' }}>
                    <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${L.border}` }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: L.text, marginBottom: 2 }}>{user.full_name}</p>
                      <p style={{ fontSize: 11, color: L.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                    <div style={{ padding: '6px 0' }}>
                      {[...USER_MENU_ITEMS, ...(user.role === 'admin' ? [{ label: 'Admin Dashboard', page: 'AdminDashboard', icon: LayoutDashboard }] : [])].map(({ label, page, icon: Icon }) => (
                        <Link key={page} to={createPageUrl(page)} onClick={() => setUserMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: L.text2, textDecoration: 'none', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = L.bg3; e.currentTarget.style.color = L.text; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = L.text2; }}>
                          <Icon size={13} style={{ color: L.text3, flexShrink: 0 }} /> {label}
                        </Link>
                      ))}
                    </div>
                    <div style={{ borderTop: `1px solid ${L.border}`, padding: '6px 0 4px' }}>
                      <button onClick={() => logout()}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: L.accent, background: 'none', border: 'none', cursor: 'pointer', width: '100%', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = `${L.accent}08`}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LogOut size={13} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'none', alignItems: 'center', gap: 8 }} className="md:flex">
                <button onClick={() => auth.redirectToLogin(window.location.href)}
                  style={{ padding: '8px 16px', borderRadius: 100, background: 'none', border: `1px solid ${L.border2}`, color: L.text2, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = L.text; e.currentTarget.style.borderColor = L.text; }}
                  onMouseLeave={e => { e.currentTarget.style.color = L.text2; e.currentTarget.style.borderColor = L.border2; }}>
                  Sign in
                </button>
                <Link to={createPageUrl('Browse')}>
                  <button style={{ padding: '8px 20px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.transform = 'none'; }}>
                    Book now
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden" onClick={() => setMobileOpen(o => !o)}
              style={{ background: L.bg3, border: `1px solid ${L.border}`, borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: L.text, cursor: 'pointer' }}>
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: '#fff', borderTop: `1px solid ${L.border}`, padding: '10px 16px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { label: 'Home', page: 'Home', icon: Home },
                { label: 'Browse Services', page: 'Browse', icon: Search },
                { label: 'Blog', page: 'Blog', icon: BookOpen },
                { label: 'Voice Match', page: 'VoiceRequest', icon: Mic },
                { label: 'For Providers', page: 'ProviderSignup', icon: Building2 },
                { label: 'Support', page: 'Support', icon: HelpCircle },
              ].map(({ label, page, icon: Icon }) => (
                <Link key={page} to={createPageUrl(page)}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, color: currentPageName === page ? L.text : L.text2, background: currentPageName === page ? L.bg3 : 'transparent', textDecoration: 'none', fontSize: 14, fontWeight: currentPageName === page ? 600 : 400, transition: 'all 0.2s' }}>
                  <Icon size={15} style={{ color: currentPageName === page ? L.text : L.text3 }} /> {label}
                </Link>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${L.border}`, marginTop: 10, paddingTop: 10 }}>
              {user ? (
                <div>
                  <div style={{ padding: '8px 12px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: L.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 13 }}>
                      {user.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: L.text }}>{user.full_name}</p>
                      <p style={{ fontSize: 11, color: L.text3 }}>{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => logout()}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, background: `${L.accent}08`, border: `1px solid ${L.accent}20`, color: L.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={() => auth.redirectToLogin(window.location.href)}
                  style={{ width: '100%', padding: '12px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Sign In to Continue
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main style={{ flex: 1, paddingBottom: 'env(safe-area-inset-bottom)' }} className="md:pb-0">{children}</main>
      <Footer />
      <BottomTabNavigation currentPageName={currentPageName} />
      <Toaster position="top-right" />
    </div>
  );
}
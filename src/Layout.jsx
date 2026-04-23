import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Menu, X, LayoutDashboard, LogOut, Home, Search, Building2, HelpCircle, Globe, Briefcase, CreditCard } from 'lucide-react';
import Logo from '@/components/Logo';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from '@/lib/AuthContext';

const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'sw', label: 'Kiswahili', dir: 'ltr' },
];

export default function Layout({ children, currentPageName }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => document.documentElement.lang || 'en');
  const location = useLocation();

  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  const handleLangChange = (code) => {
    setSelectedLang(code);
    setLangMenuOpen(false);
    const lang = LANGUAGES.find(l => l.code === code);
    document.documentElement.setAttribute('dir', lang?.dir || 'ltr');
    document.documentElement.setAttribute('lang', code);
    if (code !== 'en') {
      toast.info('Full translations coming soon. The interface is currently in English.');
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLang);

  const hideLayout = ['Home', 'Login', 'AdminDashboard'].includes(currentPageName);

  if (hideLayout) {
    return (
      <>
        <style>{`
          :root {
            --kcf-dark: #0f0900;
            --kcf-darker: #080500;
            --kcf-pink: #cb3c7a;
            --kcf-pink-light: #fb923c;
            --kcf-card: #140b00;
            --kcf-border: rgba(203,60,122,0.2);
          }
        `}</style>
        {children}
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0900', color: '#fff' }}>
      <style>{`
        :root {
          --kcf-dark: #0f0900;
          --kcf-darker: #080500;
          --kcf-pink: #cb3c7a;
          --kcf-pink-light: #fb923c;
          --kcf-card: #140b00;
          --kcf-border: rgba(203,60,122,0.2);
        }
      `}</style>

      {/* Navigation */}
      <nav style={{ background: 'rgba(15,9,0,0.95)', borderBottom: '1px solid rgba(203,60,122,0.2)' }} className="sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center">
              <Logo size="md" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { label: 'Home', page: 'Home' },
                { label: 'Find Services', page: 'Browse' },
                { label: '🎤 Voice Request', page: 'VoiceRequest' },
                { label: 'List Your Services', page: 'ProviderSignup' },
                { label: 'Support', page: 'Support' },
              ].map(({ label, page }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="text-sm font-medium transition-colors"
                  style={{ color: currentPageName === page ? '#cb3c7a' : 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={e => e.target.style.color = '#cb3c7a'}
                  onMouseLeave={e => e.target.style.color = currentPageName === page ? '#cb3c7a' : 'rgba(255,255,255,0.7)'}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              {user && <NotificationCenter />}

              {/* Language Switcher */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setLangMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{currentLang?.label}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden shadow-xl z-50" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.25)' }}>
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        className="w-full text-left px-4 py-2.5 text-sm"
                        style={{
                          color: lang.code === selectedLang ? '#cb3c7a' : 'rgba(255,255,255,0.75)',
                          background: lang.code === selectedLang ? 'rgba(203,60,122,0.1)' : 'transparent',
                          fontWeight: lang.code === selectedLang ? 600 : 400,
                        }}
                        onClick={() => handleLangChange(lang.code)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback style={{ background: '#cb3c7a', color: '#fff' }}>
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium">
                        {user.full_name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 [&_[role=menuitem]]:focus:bg-white/10 [&_[role=menuitem]]:hover:bg-white/10" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.3)', color: '#fff' }}>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('CustomerProfile')} className="flex items-center text-white hover:text-white">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Orders')} className="flex items-center text-white hover:text-white">
                        <Briefcase className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Wallet')} className="flex items-center text-white hover:text-white">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ background: 'rgba(203,60,122,0.2)' }} />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('ProviderDashboard')} className="flex items-center text-white hover:text-white">
                        <Building2 className="w-4 h-4 mr-2" />
                        Provider Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('ProviderPayouts')} className="flex items-center text-white hover:text-white">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payouts
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('SubscriptionManagement')} className="flex items-center text-white hover:text-white">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Subscription Plans
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('AdminDashboard')} className="flex items-center text-white hover:text-white">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl('AdminMultiCity')} className="flex items-center text-white hover:text-white">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            City Configuration
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator style={{ background: 'rgba(203,60,122,0.2)' }} />
                    <DropdownMenuItem onClick={() => logout()} className="text-white hover:text-white cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => navigate('/Login')}
                  style={{ background: '#cb3c7a', border: 'none' }}
                  className="hover:opacity-90 text-white"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ background: '#140b00', borderTop: '1px solid rgba(203,60,122,0.2)' }} className="md:hidden pb-4">
            <div className="px-4 pt-2 space-y-1">
              {[
                { label: 'Home', page: 'Home', icon: Home },
                { label: 'Find Services', page: 'Browse', icon: Search },
                { label: '🎤 Voice Request', page: 'VoiceRequest', icon: null },
                { label: 'List Your Services', page: 'ProviderSignup', icon: Building2 },
                { label: 'Support', page: 'Support', icon: HelpCircle },
              ].map(({ label, page, icon: Icon }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium"
                  style={{
                    color: currentPageName === page ? '#cb3c7a' : 'rgba(255,255,255,0.8)',
                    background: currentPageName === page ? 'rgba(203,60,122,0.08)' : 'transparent',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#cb3c7a' }} />}
                  {label}
                </Link>
              ))}
              {/* Mobile user actions if not logged in */}
              {!user && (
                <div className="pt-3 pb-1 border-t mt-2" style={{ borderColor: 'rgba(203,60,122,0.2)' }}>
                  <Link to={createPageUrl('Login')} onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white"
                      style={{ background: '#cb3c7a' }}>
                      Sign In
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main>{children}</main>

      <Toaster position="top-right" />
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search, MessageCircle, User } from 'lucide-react';
import { THEME as L } from '@/lib/theme';

export default function BottomTabNavigation({ currentPageName }) {
  const tabs = [
    { id: 'Home', label: 'Home', icon: Home, page: 'Home' },
    { id: 'Browse', label: 'Services', icon: Search, page: 'Browse' },
    { id: 'Inbox', label: 'Messages', icon: MessageCircle, page: 'Inbox' },
    { id: 'CustomerProfile', label: 'Profile', icon: User, page: 'CustomerProfile' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: L.bg,
      borderTop: `1px solid ${L.border}`,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'none',
    }} className="md:hidden">
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 60 }}>
        {tabs.map(({ id, label, icon: Icon, page }) => {
          const isActive = currentPageName === page;
          return (
            <Link key={id} to={createPageUrl(page)} style={{ flex: 1, textDecoration: 'none' }}>
              <button
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  width: '100%',
                  height: '100%',
                  background: 'none',
                  border: 'none',
                  color: isActive ? L.accent : L.text3,
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}>
                <Icon size={24} strokeWidth={2} />
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'capitalize', letterSpacing: '0.02em' }}>
                  {label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
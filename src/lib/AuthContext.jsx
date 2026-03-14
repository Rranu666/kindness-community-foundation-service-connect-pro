import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabase';

const AuthContext = createContext();

const formatUser = (supabaseUser, profile = null) => ({
  id: supabaseUser.id,
  email: supabaseUser.email,
  full_name: profile?.full_name || supabaseUser.user_metadata?.full_name || '',
  avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || '',
  role: profile?.role || supabaseUser.user_metadata?.role || 'customer',
  ...supabaseUser.user_metadata,
  // profile fields override metadata
  ...(profile ? { role: profile.role } : {}),
});

const fetchProfile = async (userId) => {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const loadUser = async (supabaseUser) => {
    const profile = await fetchProfile(supabaseUser.id);
    setUser(formatUser(supabaseUser, profile));
    setIsAuthenticated(true);
  };

  useEffect(() => {
    // Load current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user).finally(() => setIsLoadingAuth(false));
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Stay in sync with auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadUser(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = '/';
  };

  const navigateToLogin = () => {
    window.location.href = `/Login?redirect=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: {},
      logout,
      navigateToLogin,
      checkAppState: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

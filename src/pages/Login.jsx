import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { THEME as L } from '@/lib/theme';

const PINK = L.accent;

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect after successful login
  const getRedirectPath = () => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) {
      try {
        const url = new URL(redirect);
        return url.pathname + url.search + url.hash;
      } catch {
        return '/';
      }
    }
    return '/';
  };

  useEffect(() => {
    // If already logged in, redirect away
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(getRedirectPath(), { replace: true });
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Signed in successfully!');
      navigate(getRedirectPath(), { replace: true });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'customer' } },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm.');
      setMode('login');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/Login`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset email sent!');
      setMode('login');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: L.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Logo />
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '32px 32px 28px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: L.text, textAlign: 'center', marginBottom: 6 }}>
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create an account'}
            {mode === 'reset' && 'Reset password'}
          </h1>
          <p style={{ color: L.text3, textAlign: 'center', fontSize: 13, marginBottom: 28 }}>
            {mode === 'login' && 'Sign in to your Service Connect Pro account'}
            {mode === 'signup' && 'Join the AI home-services marketplace'}
            {mode === 'reset' && "We'll send a reset link to your email"}
          </p>

          <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {mode === 'signup' && (
              <div>
                <Label style={{ fontSize: 12, fontWeight: 600, color: L.text2, marginBottom: 6, display: 'block' }}>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith" required
                  style={{ borderColor: L.border, color: L.text }} />
              </div>
            )}

            <div>
              <Label style={{ fontSize: 12, fontWeight: 600, color: L.text2, marginBottom: 6, display: 'block' }}>Email</Label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: L.text3 }} />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  style={{ paddingLeft: 36, borderColor: L.border, color: L.text }} />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <Label style={{ fontSize: 12, fontWeight: 600, color: L.text2, marginBottom: 6, display: 'block' }}>Password</Label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: L.text3 }} />
                  <Input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    style={{ paddingLeft: 36, paddingRight: 36, borderColor: L.border, color: L.text }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: L.text3 }}>
                    {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -6 }}>
                <button type="button" onClick={() => setMode('reset')}
                  style={{ fontSize: 12, color: L.text3, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', borderRadius: 100, background: PINK, border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', marginTop: 4 }}
              onMouseEnter={e => !loading && (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={e => !loading && (e.currentTarget.style.opacity = '1')}>
              {loading ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : (
                mode === 'login' ? 'Sign In' :
                mode === 'signup' ? 'Create Account' : 'Send Reset Link'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: L.text3 }}>
            {mode === 'login' && (
              <>Don't have an account?{' '}
                <button onClick={() => setMode('signup')} style={{ color: PINK, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}
                <button onClick={() => setMode('login')} style={{ color: PINK, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Sign in
                </button>
              </>
            )}
            {mode === 'reset' && (
              <button onClick={() => setMode('login')} style={{ color: PINK, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                ← Back to sign in
              </button>
            )}
          </p>
        </div>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: L.text3 }}>
          By continuing you agree to our{' '}
          <a href="/TermsAndPrivacy" style={{ color: L.text2, textDecoration: 'underline' }}>Terms & Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

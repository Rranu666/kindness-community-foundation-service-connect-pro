import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const PINK = '#cb3c7a';

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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f0900 0%, #1a0c00 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create an account'}
            {mode === 'reset' && 'Reset password'}
          </h1>
          <p className="text-white/50 text-center text-sm mb-8">
            {mode === 'login' && 'Sign in to your Service Connect Pro account'}
            {mode === 'signup' && 'Join the AI services marketplace'}
            {mode === 'reset' && "We'll send you a reset link"}
          </p>

          <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleReset}
            className="space-y-4">

            {mode === 'signup' && (
              <div className="space-y-1">
                <Label className="text-white/70 text-sm">Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-pink-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-white/70 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-pink-500"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1">
                <Label className="text-white/70 text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-2.5 text-white"
              style={{ background: PINK }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                mode === 'login' ? 'Sign In' :
                mode === 'signup' ? 'Create Account' : 'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 text-center text-sm text-white/40">
            {mode === 'login' && (
              <>Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-pink-400 hover:text-pink-300 font-medium">
                  Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-pink-400 hover:text-pink-300 font-medium">
                  Sign in
                </button>
              </>
            )}
            {mode === 'reset' && (
              <button onClick={() => setMode('login')} className="text-pink-400 hover:text-pink-300 font-medium">
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

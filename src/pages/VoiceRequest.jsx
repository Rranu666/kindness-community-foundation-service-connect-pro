import React, { useState, useRef, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import {
  Mic, MicOff, Loader2, Brain, ArrowRight, Send, CheckCircle,
  Volume2, AlertCircle, RefreshCw, Phone, X, Zap, Activity,
  Shield, Clock, Star, MapPin, BadgeCheck, ChevronRight, Check, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Design tokens ─────────────────────────────────────────────────
const D = {
  bg:        '#ffffff',
  bg2:       '#f7f7f5',
  surface:   '#f7f7f5',
  surfaceHov:'#f0efed',
  border:    '#e2e0dc',
  borderHov: '#d4d0ca',
  text:      '#111111',
  muted:     '#555555',
  faint:     '#999999',
  amber:     '#FF8C42',
  rose:      '#FF4D6D',
  blue:      '#4361EE',
  green:     '#06D6A0',
  purple:    '#7C3AED',
  grad:      'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
  gradCool:  'linear-gradient(135deg, #4361EE 0%, #7C3AED 100%)',
};

// Urgency config with dynamic weight profile
const URGENCY = {
  immediate: { label: 'Emergency', color: D.rose,   icon: '🔴', weights: { responseTime: 0.45, distance: 0.30, rating: 0.15, availability: 0.10 } },
  today:     { label: 'Today',     color: D.amber,  icon: '🟡', weights: { responseTime: 0.30, distance: 0.25, rating: 0.25, availability: 0.20 } },
  this_week: { label: 'This Week', color: '#F59E0B', icon: '🟠', weights: { responseTime: 0.15, distance: 0.20, rating: 0.40, availability: 0.25 } },
  flexible:  { label: 'Flexible',  color: D.green,  icon: '🟢', weights: { responseTime: 0.10, distance: 0.15, rating: 0.50, availability: 0.25 } },
};

// Pipeline stages shown during processing
const PIPELINE_STAGES = [
  { id: 'voice',    icon: '🎙️', label: 'Voice Intake',         desc: 'Converting speech → text' },
  { id: 'intent',   icon: '🧠', label: 'Intent Analysis',       desc: 'Detecting category, urgency & emotion' },
  { id: 'context',  icon: '⚡', label: 'Context Enrichment',    desc: 'Time, location & sentiment weighting' },
  { id: 'filter',   icon: '🔍', label: 'Provider Filtering',    desc: 'License verified, available, nearby' },
  { id: 'rank',     icon: '📊', label: 'Dynamic Ranking',       desc: 'Scoring with adaptive weights' },
  { id: 'match',    icon: '✅', label: 'Match Ready',           desc: 'Best providers surfaced < 500ms' },
];

const SAMPLE_PROMPTS = [
  "I need a plumber urgently, water is leaking everywhere!",
  "Looking for HVAC repair, my AC stopped working",
  "Need a deep home cleaning this weekend",
  "Emergency — pipe burst in my bathroom right now",
  "Weekly cleaning service for my 3-bedroom house",
];

// ─── Dynamic scoring engine ─────────────────────────────────────────
function scoreProvider(provider, urgencyKey, index) {
  const weights = URGENCY[urgencyKey]?.weights || URGENCY.flexible.weights;
  const total = provider.total_reviews || 1;

  const ratingScore     = ((provider.rating || 3) / 5) * 100;
  const distanceScore   = Math.max(0, 100 - index * 12); // proxy (no GPS)
  const responseScore   = provider.response_time?.includes('hour') ? 60 : provider.response_time?.includes('24') ? 40 : 80;
  const availScore      = provider.is_active ? 90 : 30;
  const reliabilityScore= Math.min(100, 60 + (total * 2));

  const composite = (
    weights.rating       * ratingScore +
    weights.distance     * distanceScore +
    weights.responseTime * responseScore +
    weights.availability * availScore
  );

  return {
    ...provider,
    _scores: { rating: ratingScore, distance: distanceScore, response: responseScore, availability: availScore, reliability: reliabilityScore },
    _composite: Math.round(composite),
    _urgencyKey: urgencyKey,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────

function GlassCard({ children, style = {}, glow }) {
  return (
    <div style={{
      background: D.surface,
      border: `1px solid ${glow ? `${glow}40` : D.border}`,
      borderRadius: 20,
      boxShadow: glow ? `0 4px 24px ${glow}15` : '0 1px 4px rgba(0,0,0,0.05)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function PipelineProgress({ activeStage }) {
  return (
    <GlassCard style={{ padding: '24px 28px' }} glow={D.blue}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Activity size={16} style={{ color: D.blue }} />
        <span style={{ color: D.blue, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
          AI DECISION ENGINE — RUNNING
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: D.blue, opacity: 0.3 + i * 0.3, animation: `pulse 1s ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PIPELINE_STAGES.map((stage, i) => {
          const done    = i < activeStage;
          const current = i === activeStage;
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: done ? D.green + '20' : current ? D.blue + '20' : D.surface,
                border: `1px solid ${done ? D.green + '50' : current ? D.blue + '50' : D.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                transition: 'all 0.4s ease',
              }}>
                {done ? '✓' : stage.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: done ? D.green : current ? D.text : D.faint, transition: 'color 0.4s' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: 11, color: current ? D.muted : D.faint }}>
                  {stage.desc}
                </div>
              </div>
              {current && (
                <div style={{ flexShrink: 0 }}>
                  <Loader2 size={14} style={{ color: D.blue, animation: 'spin 1s linear infinite' }} />
                </div>
              )}
              {done && (
                <div style={{ flexShrink: 0 }}>
                  <CheckCircle size={14} style={{ color: D.green }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function WeightBreakdown({ urgencyKey }) {
  const cfg = URGENCY[urgencyKey] || URGENCY.flexible;
  const weights = cfg.weights;
  return (
    <GlassCard style={{ padding: '20px 24px' }} glow={cfg.color}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Zap size={14} style={{ color: cfg.color }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, letterSpacing: '0.08em' }}>
          DYNAMIC WEIGHTS · {cfg.icon} {cfg.label.toUpperCase()} MODE
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {Object.entries(weights).map(([k, v]) => (
          <div key={k}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: D.muted, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: D.text }}>{Math.round(v * 100)}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: D.border, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${v * 100}%`, background: cfg.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ProviderCard({ provider, selected, onToggle }) {
  const cfg = URGENCY[provider._urgencyKey] || URGENCY.flexible;
  const scores = provider._scores || {};
  return (
    <div
      onClick={onToggle}
      style={{
        borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
        background: selected ? `${D.rose}10` : D.surface,
        border: `1px solid ${selected ? D.rose : D.border}`,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.25s ease',
        boxShadow: selected ? `0 0 24px ${D.rose}20` : 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: selected ? D.rose : `${cfg.color}25`,
          border: `1px solid ${selected ? D.rose : cfg.color + '40'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 18, color: '#fff',
          boxShadow: selected ? `0 0 16px ${D.rose}40` : 'none',
        }}>
          {provider.business_name?.charAt(0) || '?'}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {provider.business_name}
            </span>
            {provider.is_verified && <BadgeCheck size={14} style={{ color: D.green, flexShrink: 0 }} />}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: D.muted, marginBottom: 8 }}>
            {provider.rating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={11} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                <strong style={{ color: D.text }}>{provider.rating.toFixed(1)}</strong>
                {provider.total_reviews > 0 && `(${provider.total_reviews})`}
              </span>
            )}
            {provider.hourly_rate && <span style={{ color: D.text, fontWeight: 600 }}>${provider.hourly_rate}/hr</span>}
            {provider.response_time && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} style={{ color: D.green }} />{provider.response_time}
              </span>
            )}
          </div>

          {/* Score bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
            {[
              { k: 'Rating', v: scores.rating },
              { k: 'Response', v: scores.response },
              { k: 'Proximity', v: scores.distance },
              { k: 'Reliability', v: scores.reliability },
            ].map(({ k, v }) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: D.faint, width: 56, flexShrink: 0 }}>{k}</span>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: D.border, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${v || 0}%`, background: `linear-gradient(90deg, ${D.blue}, ${D.purple})`, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Composite score + selector */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `conic-gradient(${cfg.color} ${provider._composite * 3.6}deg, ${D.border} 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: 3, borderRadius: 9, background: D.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: cfg.color }}>{provider._composite}</span>
            </div>
          </div>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: selected ? D.rose : 'transparent',
            border: `2px solid ${selected ? D.rose : D.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>
            {selected && <Check size={12} style={{ color: '#fff' }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function VoiceRequest() {
  const [phase, setPhase] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [interpretation, setInterpretation] = useState(null);
  const [matchedProviders, setMatchedProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', location: '' });
  const [user, setUser] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [contactedProviders, setContactedProviders] = useState([]);
  const recognitionRef = useRef(null);

  const { data: allProviders = [] } = useQuery({
    queryKey: ['providers-voice'],
    queryFn: () => db.ServiceProvider.filter({ is_active: true }, '-rating', 100),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => db.ServiceCategory.list(),
  });

  useEffect(() => {
    auth.me().then(u => {
      setUser(u);
      if (u) setUserInfo(i => ({ ...i, name: u.full_name || '' }));
    }).catch(() => {});
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) setIsSupported(false);
  }, []);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false;
    rec.onstart  = () => setPhase('listening');
    rec.onresult = (e) => {
      let txt = '';
      for (let i = e.resultIndex; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setTranscript(txt);
    };
    rec.onerror = () => { setPhase('idle'); toast.error('Mic error. Try typing below.'); };
    rec.onend   = () => setTranscript(t => { if (t.trim()) processRequest(t.trim()); else setPhase('idle'); return t; });
    recognitionRef.current = rec;
    rec.start();
  };

  const stopListening = () => recognitionRef.current?.stop();

  const processRequest = async (text) => {
    setPhase('processing');
    setTranscript(text);
    setPipelineStage(0);

    // Simulate streaming pipeline progress
    const advance = (n, delay) => setTimeout(() => setPipelineStage(n), delay);
    advance(1, 400); advance(2, 900); advance(3, 1400); advance(4, 1900); advance(5, 2400);

    const result = await invokeLLM({
      prompt: `You are the AI intent engine for a home services platform (Plumbing, HVAC, Home Cleaning in California).

Analyze this service request deeply:
"${text}"

Extract:
1. service_category — match from: ${categories.map(c => c.name).join(', ')}
2. service_type — specific task (e.g. "drain clearing", "AC repair")
3. urgency — one of: "immediate", "today", "this_week", "flexible"
4. emotion_level — "high" (panic/emergency), "medium" (concerned), "low" (routine)
5. summary — 1 clear sentence describing the request
6. key_requirements — up to 3 extracted details
7. context_signals — array of signals detected (e.g. "after-hours", "repeat customer", "emergency language")
8. recommended_weight_boost — which factor to boost: "responseTime", "rating", "distance", or "availability"`,
      response_json_schema: {
        type: 'object',
        properties: {
          service_category: { type: 'string' },
          service_type: { type: 'string' },
          urgency: { type: 'string' },
          emotion_level: { type: 'string' },
          summary: { type: 'string' },
          key_requirements: { type: 'array', items: { type: 'string' } },
          context_signals: { type: 'array', items: { type: 'string' } },
          recommended_weight_boost: { type: 'string' },
        }
      }
    });

    setInterpretation(result);

    // Category match
    const catMatch = categories.find(c =>
      c.name?.toLowerCase().includes(result.service_category?.toLowerCase()) ||
      result.service_category?.toLowerCase().includes(c.name?.toLowerCase())
    );
    let pool = catMatch ? allProviders.filter(p => p.category_id === catMatch.id) : allProviders;
    if (pool.length === 0) pool = allProviders.slice(0, 6);

    // Dynamic scoring with urgency-adaptive weights
    const scored = pool
      .map((p, i) => scoreProvider(p, result.urgency || 'flexible', i))
      .sort((a, b) => b._composite - a._composite)
      .slice(0, 8);

    setMatchedProviders(scored);
    setPipelineStage(5);
    setTimeout(() => setPhase('results'), 400);
  };

  const handleContactProviders = async () => {
    if (!selectedProviders.length) return toast.error('Select at least one provider');
    if (!userInfo.name || !userInfo.phone) return toast.error('Fill in your contact details');
    setPhase('contacting');
    await Promise.all(selectedProviders.map(pid => {
      const prov = matchedProviders.find(p => p.id === pid);
      return db.Notification.create({
        recipient_email: prov?.email || 'provider@platform.com',
        recipient_type: 'provider',
        type: 'booking_confirmed',
        title: `New ${interpretation?.urgency === 'immediate' ? '🔴 EMERGENCY ' : ''}Request: ${interpretation?.service_type}`,
        message: `${userInfo.name} needs: "${interpretation?.summary}". Contact: ${userInfo.phone}${userInfo.location ? ` · ${userInfo.location}` : ''}. Urgency: ${interpretation?.urgency}.`,
        channels: ['push', 'email'],
        is_read: false,
        sent_at: new Date().toISOString(),
      });
    }));
    setContactedProviders(selectedProviders);
    setPhase('done');
    toast.success(`Request sent to ${selectedProviders.length} provider(s)!`);
  };

  const reset = () => {
    setPhase('idle'); setTranscript(''); setTextInput(''); setInterpretation(null);
    setMatchedProviders([]); setSelectedProviders([]); setContactedProviders([]); setPipelineStage(0);
  };

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: D.text, fontFamily: "'Inter', system-ui, sans-serif", padding: '40px 32px' }}>

      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 10 }}>

        {/* Back button */}
        <Link to={createPageUrl('Home')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: D.muted, textDecoration: 'none', fontSize: 13, marginBottom: 32, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = D.text; e.currentTarget.style.transform = 'translateX(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = D.muted; e.currentTarget.style.transform = 'translateX(0)'; }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24,
            background: `${D.blue}12`, border: `1px solid ${D.blue}30`,
            borderRadius: 100, padding: '8px 18px', fontSize: 'clamp(11px, 2vw, 12px)',
            fontWeight: 700, letterSpacing: '0.1em', color: D.blue,
            boxShadow: `0 2px 12px ${D.blue}10`,
          }}>
            <Brain size={15} style={{ color: D.blue }} />
            AI DECISION ENGINE · REAL-TIME MATCHING
          </div>

          <h1 style={{ 
            fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', 
            fontWeight: 900, 
            lineHeight: 1.08, 
            letterSpacing: '-0.02em', 
            marginBottom: 16,
            color: D.text,
          }}>
            Speak your need.{' '}
            <span style={{ 
              background: D.grad, 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              backgroundClip: 'text',
              display: 'inline-block',
            }}>
              AI finds the expert.
            </span>
          </h1>

          <p style={{ 
            fontSize: 'clamp(14px, 2.2vw, 17px)', 
            color: D.muted, 
            maxWidth: 560, 
            margin: '0 auto',
            lineHeight: 1.7,
            fontWeight: 400,
          }}>
            Context-aware matching with dynamic ranking — urgency, emotion, proximity, and reliability factored in real-time.
          </p>
        </div>

        {/* ── IDLE / LISTENING ── */}
        {(phase === 'idle' || phase === 'listening') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Voice Orb */}
            <GlassCard style={{ padding: '40px 24px', textAlign: 'center' }} glow={phase === 'listening' ? D.rose : undefined}>
              <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 24px' }}>
                {phase === 'listening' && [0,1,2].map(i => (
                  <div key={i} style={{
                    position: 'absolute', inset: -(i * 16), borderRadius: '50%',
                    border: `1px solid ${D.rose}`, opacity: 0.5 - i * 0.15,
                    animation: `ping 1.5s ${i * 0.3}s cubic-bezier(0,0,0.2,1) infinite`,
                  }} />
                ))}
                <button
                  onClick={phase === 'listening' ? stopListening : startListening}
                  disabled={!isSupported}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '50%', border: 'none', cursor: isSupported ? 'pointer' : 'not-allowed',
                    background: phase === 'listening' ? D.grad : 'radial-gradient(circle, rgba(67,97,238,0.3), rgba(8,10,18,0.8))',
                    boxShadow: phase === 'listening' ? `0 0 48px ${D.rose}50` : `0 0 24px ${D.blue}20`,
                    transition: 'all 0.3s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  {phase === 'listening'
                    ? <MicOff size={40} style={{ color: '#fff' }} />
                    : <Mic size={40} style={{ color: isSupported ? D.blue : D.faint }} />}
                </button>
              </div>

              {phase === 'listening' ? (
                <div>
                  <p style={{ fontWeight: 700, color: D.text, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: D.rose, display: 'inline-block', animation: 'pulse 1s infinite' }} />
                    Listening... tap to stop
                  </p>
                  {transcript && <p style={{ fontSize: 14, color: D.muted, fontStyle: 'italic' }}>"{transcript}"</p>}
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 700, color: D.text, marginBottom: 6 }}>
                    {isSupported ? 'Tap to speak' : 'Voice not supported'}
                  </p>
                  <p style={{ fontSize: 14, color: D.muted }}>
                    {isSupported ? 'Describe any home service need in your own words' : 'Please use text input below'}
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Text fallback */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: D.border }} />
              <span style={{ fontSize: 12, color: D.faint }}>or type your request</span>
              <div style={{ flex: 1, height: 1, background: D.border }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && textInput.trim() && processRequest(textInput.trim())}
                placeholder="e.g. I need a plumber urgently, water is leaking!"
                style={{
                  flex: 1, height: 48, borderRadius: 14, padding: '0 16px',
                  background: D.surface, border: `1px solid ${D.border}`,
                  color: D.text, fontSize: 14, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = D.blue}
                onBlur={e => e.target.style.borderColor = D.border}
              />
              <button
                onClick={() => textInput.trim() && processRequest(textInput.trim())}
                style={{
                  width: 48, height: 48, borderRadius: 14, border: 'none',
                  background: D.grad, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 16px ${D.rose}30`,
                }}>
                <Send size={18} style={{ color: '#fff' }} />
              </button>
            </div>

            {/* Sample prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {SAMPLE_PROMPTS.map((s, i) => (
                <button key={i} onClick={() => setTextInput(s)}
                  style={{
                    padding: '7px 14px', borderRadius: 100, border: `1px solid ${D.border}`,
                    background: 'transparent', color: D.muted, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = D.rose; e.currentTarget.style.color = D.rose; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.color = D.muted; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {phase === 'processing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <GlassCard style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Volume2 size={14} style={{ color: D.muted }} />
                <p style={{ fontSize: 14, fontStyle: 'italic', color: D.muted }}>"{transcript}"</p>
              </div>
            </GlassCard>
            <PipelineProgress activeStage={pipelineStage} />
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && interpretation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Transcript chip */}
            <GlassCard style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Volume2 size={14} style={{ color: D.muted }} />
              <p style={{ flex: 1, fontSize: 14, fontStyle: 'italic', color: D.muted }}>"{transcript}"</p>
              <button onClick={reset}><X size={14} style={{ color: D.faint }} /></button>
            </GlassCard>

            {/* AI Interpretation */}
            <GlassCard style={{ padding: '20px 24px' }} glow={D.blue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Brain size={15} style={{ color: D.blue }} />
                <span style={{ color: D.blue, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}>AI INTERPRETATION</span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{interpretation.summary}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {[
                  { label: interpretation.service_category, color: D.blue },
                  { label: URGENCY[interpretation.urgency]?.icon + ' ' + URGENCY[interpretation.urgency]?.label, color: URGENCY[interpretation.urgency]?.color },
                  { label: `Emotion: ${interpretation.emotion_level || 'low'}`, color: interpretation.emotion_level === 'high' ? D.rose : D.muted },
                ].map((t, i) => (
                  <span key={i} style={{
                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                    background: `${t.color}15`, border: `1px solid ${t.color}35`, color: t.color,
                  }}>{t.label}</span>
                ))}
              </div>

              {interpretation.key_requirements?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {interpretation.key_requirements.map((r, i) => (
                    <span key={i} style={{ fontSize: 12, color: D.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={11} style={{ color: D.green }} /> {r}
                    </span>
                  ))}
                </div>
              )}

              {interpretation.context_signals?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {interpretation.context_signals.map((s, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '2px 10px', borderRadius: 6, background: D.surface, color: D.faint, border: `1px solid ${D.border}` }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Weight breakdown */}
            <WeightBreakdown urgencyKey={interpretation.urgency} />

            {/* Providers */}
            {matchedProviders.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: D.text }}>
                    Ranked Providers
                    <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 400, color: D.muted }}>
                      ({matchedProviders.length} matched · {selectedProviders.length} selected)
                    </span>
                  </h3>
                  <span style={{ fontSize: 11, color: D.faint, background: D.surface, padding: '4px 10px', borderRadius: 6, border: `1px solid ${D.border}` }}>
                    Sorted by composite score
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {matchedProviders.map(p => (
                    <ProviderCard key={p.id} provider={p} selected={selectedProviders.includes(p.id)}
                      onToggle={() => setSelectedProviders(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                    />
                  ))}
                </div>

                {/* Contact form */}
                <GlassCard style={{ padding: '24px' }} glow={D.rose}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Phone size={15} style={{ color: D.rose }} />
                    <span style={{ fontWeight: 700, color: D.text }}>Your Contact Details</span>
                  </div>
                  <p style={{ fontSize: 13, color: D.muted, marginBottom: 16 }}>
                    {selectedProviders.length} provider(s) selected — they'll be notified and reach out to you.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                    {[
                      { key: 'name',     placeholder: 'Your name *' },
                      { key: 'phone',    placeholder: 'Phone number *' },
                      { key: 'location', placeholder: 'Your city / location' },
                    ].map(({ key, placeholder }) => (
                      <input key={key} value={userInfo[key]} onChange={e => setUserInfo(i => ({ ...i, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{
                          height: 44, borderRadius: 12, padding: '0 14px',
                          background: D.surface, border: `1px solid ${D.border}`,
                          color: D.text, fontSize: 13, outline: 'none',
                        }}
                        onFocus={e => e.target.style.borderColor = D.rose}
                        onBlur={e => e.target.style.borderColor = D.border}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={handleContactProviders}
                      disabled={!selectedProviders.length || !userInfo.name || !userInfo.phone}
                      style={{
                        flex: 1, height: 48, borderRadius: 14, border: 'none',
                        background: D.grad, color: '#fff', fontWeight: 700, fontSize: 15,
                        cursor: selectedProviders.length && userInfo.name && userInfo.phone ? 'pointer' : 'not-allowed',
                        opacity: selectedProviders.length && userInfo.name && userInfo.phone ? 1 : 0.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 4px 24px rgba(255,77,109,0.3)',
                      }}>
                      <Send size={16} />
                      Notify {selectedProviders.length || ''} Provider{selectedProviders.length !== 1 ? 's' : ''}
                    </button>
                    <button onClick={reset}
                      style={{ width: 48, height: 48, borderRadius: 14, border: `1px solid ${D.border}`, background: D.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <RefreshCw size={16} style={{ color: D.muted }} />
                    </button>
                  </div>
                </GlassCard>
              </>
            ) : (
              <GlassCard style={{ padding: '40px', textAlign: 'center' }}>
                <AlertCircle size={40} style={{ color: D.faint, margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, marginBottom: 8 }}>No providers found in this category yet</p>
                <Link to={createPageUrl('Browse')}>
                  <button style={{ marginTop: 8, background: D.grad, border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Browse All Providers
                  </button>
                </Link>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── CONTACTING ── */}
        {phase === 'contacting' && (
          <GlassCard style={{ padding: '60px 24px', textAlign: 'center' }} glow={D.rose}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${D.rose}15`, border: `2px solid ${D.rose}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pulse 1s infinite' }}>
              <Send size={32} style={{ color: D.rose }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Notifying providers...</h3>
            <p style={{ color: D.muted }}>Sending your request to {selectedProviders.length} provider(s)</p>
          </GlassCard>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <GlassCard style={{ padding: '48px 24px', textAlign: 'center' }} glow={D.green}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${D.green}15`, border: `2px solid ${D.green}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} style={{ color: D.green }} />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Request Sent!</h3>
              <p style={{ color: D.muted, marginBottom: 6 }}>
                {contactedProviders.length} provider(s) notified for <strong style={{ color: D.text }}>{interpretation?.service_type}</strong>
              </p>
              <p style={{ color: D.faint, fontSize: 14, marginBottom: 28 }}>
                They'll reach you at <strong style={{ color: D.text }}>{userInfo.phone}</strong>
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={reset}
                  style={{ background: D.grad, border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, padding: '12px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mic size={16} /> New Request
                </button>
                <Link to={createPageUrl('Browse')}>
                  <button style={{ background: D.surface, border: `1px solid ${D.border}`, borderRadius: 14, color: D.text, fontWeight: 600, padding: '12px 24px', cursor: 'pointer' }}>
                    Browse All Providers
                  </button>
                </Link>
              </div>
            </GlassCard>

            {/* Notified list */}
            <GlassCard style={{ padding: '20px 24px' }}>
              <h4 style={{ fontWeight: 700, marginBottom: 14, color: D.text }}>Notified Providers</h4>
              {matchedProviders.filter(p => contactedProviders.includes(p.id)).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: D.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 15 }}>
                    {p.business_name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: D.text }}>{p.business_name}</div>
                    <div style={{ fontSize: 12, color: D.faint }}>{p.email}</div>
                  </div>
                  <CheckCircle size={16} style={{ color: D.green }} />
                </div>
              ))}
            </GlassCard>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ping { 75%,100% { transform: scale(1.8); opacity: 0; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
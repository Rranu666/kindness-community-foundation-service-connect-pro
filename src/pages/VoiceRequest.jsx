import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import {
  Mic, MicOff, Loader2, Brain, ArrowRight, MapPin, Star,
  BadgeCheck, Send, CheckCircle, ChevronRight, Volume2,
  Sparkles, AlertCircle, RefreshCw, Phone, MessageSquare, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import VoiceOrb from '@/components/voice/VoiceOrb';
import AIInterpretationCard from '@/components/voice/AIInterpretationCard';
import ProviderMatchList from '@/components/voice/ProviderMatchList';

const PINK = '#f97316';
const CYAN = '#fbbf24';

const FALLBACK_CATEGORIES = [
  { id: 'ai-automation', name: 'AI & Automation' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'cleaning', name: 'Cleaning' },
  { id: 'catering', name: 'Catering' },
  { id: 'data-science', name: 'Data Science' },
  { id: 'web-development', name: 'Web Development' },
  { id: 'tutoring', name: 'Tutoring' },
  { id: 'moving', name: 'Moving & Delivery' },
  { id: 'photography', name: 'Photography' },
];

export default function VoiceRequest() {
  const [phase, setPhase] = useState('idle'); // idle | listening | processing | results | contacting | done
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [interpretation, setInterpretation] = useState(null);
  const [matchedProviders, setMatchedProviders] = useState([]);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [contactedProviders, setContactedProviders] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: '', phone: '', location: '' });
  const [user, setUser] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) setUserInfo(i => ({ ...i, name: u.full_name || '', location: '' }));
    }).catch(() => {});

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
    }
  }, []);

  const { data: allProviders = [] } = useQuery({
    queryKey: ['providers-voice'],
    queryFn: () => base44.entities.ServiceProvider.filter({ is_active: true }, '-rating', 100),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const result = await base44.entities.ServiceCategory.list();
        return result.length > 0 ? result : FALLBACK_CATEGORIES;
      } catch {
        return FALLBACK_CATEGORIES;
      }
    },
    initialData: FALLBACK_CATEGORIES,
  });

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setPhase('listening');
    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          setTranscript(t => t + e.results[i][0].transcript);
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      if (interim) setTranscript(interim);
    };
    recognition.onerror = () => { setPhase('idle'); toast.error('Microphone error. Try typing instead.'); };
    recognition.onend = () => {
      setTranscript(t => {
        if (t.trim()) processRequest(t.trim());
        else setPhase('idle');
        return t;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const processRequest = async (text) => {
    if (!text.trim()) return;
    setPhase('processing');
    setTranscript(text);

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant for a service marketplace. Analyze this service request and extract structured information.

User request: "${text}"

Available service categories: ${categories.map(c => c.name).join(', ')}

Extract and return:
1. service_category: The best matching category name from the list above
2. service_type: Specific service needed (e.g., "drain clearing", "wedding catering")
3. urgency: "immediate", "today", "this_week", or "flexible"
4. summary: A clear 1-sentence summary of the request
5. key_requirements: Array of up to 3 key requirements/details extracted
6. suggested_search_terms: Array of 2-3 keywords for searching providers`,
        response_json_schema: {
          type: 'object',
          properties: {
            service_category: { type: 'string' },
            service_type: { type: 'string' },
            urgency: { type: 'string' },
            summary: { type: 'string' },
            key_requirements: { type: 'array', items: { type: 'string' } },
            suggested_search_terms: { type: 'array', items: { type: 'string' } },
          }
        }
      });
    } catch (error) {
      toast.error('AI analysis failed. Please try again.');
      setPhase('idle');
      return;
    }

    setInterpretation(result);

    // Match providers
    const catMatch = categories.find(c =>
      c.name?.toLowerCase().includes(result.service_category?.toLowerCase()) ||
      result.service_category?.toLowerCase().includes(c.name?.toLowerCase())
    );

    let matched = allProviders;
    if (catMatch) {
      matched = allProviders.filter(p => p.category_id === catMatch.id);
    }
    if (matched.length === 0) matched = allProviders.slice(0, 6);

    // Score and sort by rating
    const scored = matched.map(p => ({
      ...p,
      matchScore: Math.floor(70 + Math.random() * 30),
    })).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

    setMatchedProviders(scored);
    setPhase('results');
  };

  const handleSubmitText = () => {
    if (!textInput.trim()) return;
    processRequest(textInput.trim());
  };

  const handleContactProviders = async () => {
    if (selectedProviders.length === 0) return toast.error('Select at least one provider');
    if (!userInfo.name || !userInfo.phone) return toast.error('Please fill in your contact details');

    setPhase('contacting');

    const notifications = selectedProviders.map(pid => {
      const prov = matchedProviders.find(p => p.id === pid);
      return base44.entities.Notification.create({
        recipient_email: prov?.email || 'provider@platform.com',
        recipient_type: 'provider',
        type: 'booking_confirmed',
        title: `New Service Request: ${interpretation?.service_type || 'Service Needed'}`,
        message: `${userInfo.name} is looking for: "${interpretation?.summary}". Contact: ${userInfo.phone}${userInfo.location ? ` · Location: ${userInfo.location}` : ''}. Urgency: ${interpretation?.urgency || 'flexible'}.`,
        channels: ['push', 'email'],
        is_read: false,
        sent_at: new Date().toISOString()
      });
    });

    await Promise.all(notifications);
    setContactedProviders(selectedProviders);
    setPhase('done');
    toast.success(`Request sent to ${selectedProviders.length} provider(s)!`);
  };

  const resetAll = () => {
    setPhase('idle');
    setTranscript('');
    setTextInput('');
    setInterpretation(null);
    setMatchedProviders([]);
    setSelectedProviders([]);
    setContactedProviders([]);
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 px-4" style={{ background: '#0f0900' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-7 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 text-sm font-medium" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: CYAN }}>
            <Sparkles className="w-4 h-4" /> AI-Powered Voice Request
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Speak Your Need,<br /><span style={{ color: PINK }}>We Find the Expert</span>
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Say what you need — our AI understands your request, matches the right providers in your area, and notifies them on your behalf.
          </p>
        </div>

        {/* PHASE: IDLE / LISTENING */}
        {(phase === 'idle' || phase === 'listening') && (
          <div className="space-y-6">
            <VoiceOrb
              phase={phase}
              transcript={transcript}
              isSupported={isSupported}
              onStart={startListening}
              onStop={stopListening}
            />

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>or type your request</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Text fallback */}
            <div className="flex gap-3">
              <Input
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                placeholder="e.g. I need a plumber to fix a leaking pipe today"
                className="flex-1 h-12 rounded-xl text-white border-white/20 bg-white/5"
                onKeyDown={e => e.key === 'Enter' && handleSubmitText()}
              />
              <Button onClick={handleSubmitText} disabled={!textInput.trim()} className="h-12 px-5 rounded-xl border-0 text-white" style={{ background: PINK }}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Sample prompts */}
            <div>
              <p className="text-xs mb-3 text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "I need an AI automation expert for my business",
                  "Looking for a plumber urgently",
                  "Need catering for a party of 20 people",
                  "Find me a data scientist for a project",
                  "I need a dentist appointment this week",
                ].map((s, i) => (
                  <button key={i} onClick={() => { setTextInput(s); }}
                    className="px-3 py-1.5 rounded-full text-xs transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = PINK; e.currentTarget.style.color = PINK; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PHASE: PROCESSING */}
        {phase === 'processing' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.3)' }}>
              <Brain className="w-10 h-10" style={{ color: CYAN }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI is analyzing your request...</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Understanding intent · Matching categories · Finding providers</p>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              <Loader2 className="w-4 h-4 animate-spin" /> "{transcript}"
            </div>
          </div>
        )}

        {/* PHASE: RESULTS */}
        {phase === 'results' && interpretation && (
          <div className="space-y-6">
            {/* Transcript */}
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Volume2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: CYAN }} />
              <p className="text-sm italic" style={{ color: 'rgba(255,255,255,0.65)' }}>"{transcript}"</p>
              <button onClick={resetAll} className="ml-auto flex-shrink-0"><X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} /></button>
            </div>

            <AIInterpretationCard interpretation={interpretation} />

            {matchedProviders.length > 0 ? (
              <>
                <ProviderMatchList
                  providers={matchedProviders}
                  selectedProviders={selectedProviders}
                  onToggle={id => setSelectedProviders(prev =>
                    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                  )}
                  interpretation={interpretation}
                />

                {/* Contact form */}
                <div className="rounded-2xl p-6 space-y-4" style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: PINK }} />
                    Your Contact Details
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Selected providers ({selectedProviders.length}) will be notified and asked to reach out to you.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input value={userInfo.name} onChange={e => setUserInfo(i => ({ ...i, name: e.target.value }))}
                      placeholder="Your name *" className="h-11 rounded-xl text-white border-white/20 bg-white/5" />
                    <Input value={userInfo.phone} onChange={e => setUserInfo(i => ({ ...i, phone: e.target.value }))}
                      placeholder="Phone number *" className="h-11 rounded-xl text-white border-white/20 bg-white/5" />
                    <Input value={userInfo.location} onChange={e => setUserInfo(i => ({ ...i, location: e.target.value }))}
                      placeholder="Your location / city" className="h-11 rounded-xl text-white border-white/20 bg-white/5" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleContactProviders}
                      disabled={selectedProviders.length === 0 || !userInfo.name || !userInfo.phone}
                      className="flex-1 h-12 rounded-xl text-white border-0 font-semibold" style={{ background: PINK }}>
                      <Send className="w-4 h-4 mr-2" />
                      Notify {selectedProviders.length > 0 ? selectedProviders.length : ''} Provider{selectedProviders.length !== 1 ? 's' : ''}
                    </Button>
                    <Button onClick={resetAll} variant="outline" className="h-12 px-5 rounded-xl bg-transparent text-white border-white/20">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-10 rounded-2xl" style={{ background: '#140b00', border: '1px solid rgba(255,255,255,0.08)' }}>
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" style={{ color: PINK }} />
                <p className="text-white font-medium mb-2">No providers found in this category yet</p>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Be the first to list services in this area</p>
                <Link to={createPageUrl('Browse')}>
                  <Button className="border-0 text-white" style={{ background: PINK }}>Browse All Providers</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* PHASE: CONTACTING */}
        {phase === 'contacting' && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ background: 'rgba(249,115,22,0.15)', border: '2px solid rgba(249,115,22,0.3)' }}>
              <Send className="w-10 h-10" style={{ color: PINK }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Notifying providers...</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Sending your request to {selectedProviders.length} provider(s)</p>
          </div>
        )}

        {/* PHASE: DONE */}
        {phase === 'done' && (
          <div className="space-y-6">
            <div className="text-center py-10 rounded-3xl" style={{ background: '#140b00', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <CheckCircle className="w-10 h-10" style={{ color: '#10b981' }} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Request Sent Successfully!</h3>
              <p className="text-base mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {contactedProviders.length} provider(s) have been notified about your request for <strong className="text-white">"{interpretation?.service_type}"</strong>.
              </p>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                They will contact you at <strong className="text-white">{userInfo.phone}</strong> soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={resetAll} className="border-0 text-white" style={{ background: PINK }}>
                  <Mic className="w-4 h-4 mr-2" /> Make Another Request
                </Button>
                <Link to={createPageUrl('Browse')}>
                  <Button variant="outline" className="bg-transparent text-white border-white/20">
                    Browse All Providers <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contacted providers list */}
            <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 className="text-sm font-semibold text-white">Notified Providers</h4>
              {matchedProviders.filter(p => contactedProviders.includes(p.id)).map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ background: PINK }}>
                    {p.business_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.business_name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.email}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
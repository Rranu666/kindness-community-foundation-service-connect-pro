import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Building2, MapPin, FileText, Camera,
  Upload, Loader2, CheckCircle, ArrowLeft, ArrowRight,
  Sparkles, Zap, Shield, BadgeCheck, DollarSign, Clock
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { THEME, INPUT_STYLE, LABEL_STYLE } from '@/lib/theme';

const G = {
  ...THEME,
  // light-theme overrides for ProviderSignup (was dark, now light)
  bg: '#ffffff', bg2: '#f7f7f5', surface: '#f7f7f5',
  border: '#e2e0dc', text: '#111111',
  muted: '#999999', faint: '#bbbbbb',
  textMuted: '#555555', textFaint: '#999999',
  rose: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Documents', icon: FileText },
  { id: 3, label: 'Location & Schedule', icon: MapPin },
];

// Fixed categories matching the 5 focused services
const FIXED_CATEGORIES = [
  { id: 'plumbing', name: '🔧 Plumbing' },
  { id: 'hvac', name: '❄️ HVAC' },
  { id: 'home_cleaning', name: '✨ Home Cleaning' },
  { id: 'emergency_repairs', name: '🚨 Emergency Repairs' },
  { id: 'recurring_services', name: '🔄 Recurring Services' },
];

const PERKS = [
  { icon: DollarSign, label: 'Flat monthly fee', sub: 'No per-lead costs', c: G.green },
  { icon: BadgeCheck, label: 'Verified badge', sub: 'Build customer trust', c: G.blue },
  { icon: Clock, label: 'Paid in 24 hrs', sub: 'After job approval', c: G.amber },
  { icon: Shield, label: 'FTC compliant', sub: 'Transparent & fair', c: G.rose },
];

function StepBadge({ stepNumber, isActive, isComplete }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isComplete
        ? `linear-gradient(135deg, ${G.green}, ${G.green}bb)`
        : isActive ? G.grad : G.surface,
      border: `2px solid ${isComplete ? G.green : isActive ? G.rose : G.border}`,
      boxShadow: isActive ? `0 0 20px ${G.rose}50` : 'none',
      transition: 'all 0.35s ease',
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
      flexShrink: 0,
    }}>
      <span style={{ color: isComplete || isActive ? '#fff' : G.textFaint, fontSize: 15, fontWeight: 900 }}>
        {isComplete ? '✓' : stepNumber}
      </span>
    </div>
  );
}

export default function ProviderSignup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [documents, setDocuments] = useState({ id_proof: null, business_cert: null, portfolio: [] });
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [formData, setFormData] = useState({
    business_name: '', owner_name: '', email: '', phone: '',
    category_id: '', description: '', location: '', experience_years: '', hourly_rate: ''
  });

  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => db.ServiceCategory.list()
  });

  // Use DB categories if available, fall back to fixed list
  const categories = dbCategories.length > 0 ? dbCategories : FIXED_CATEGORIES;

  const toggleDay = (day) => setSelectedDays(prev =>
    prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
  );

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await uploadFile({ file });
      setProfileImage(file_url);
      toast.success('Profile image uploaded!');
    } catch { toast.error('Upload failed'); }
  };

  const handleDocUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(docType);
    try {
      const { file_url } = await uploadFile({ file });
      if (docType === 'portfolio') {
        setDocuments(prev => ({ ...prev, portfolio: [...prev.portfolio, file_url] }));
      } else {
        setDocuments(prev => ({ ...prev, [docType]: file_url }));
      }
      toast.success('Document uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingDoc(''); }
  };

  const validateStep = () => {
    if (step === 1 && (!formData.business_name || !formData.owner_name || !formData.email || !formData.category_id)) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await db.ServiceProvider.create({
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        profile_image: profileImage,
        availability: selectedDays,
        certifications: documents.id_proof ? ['ID Verified'] : [],
        is_active: true, is_verified: false, rating: 0, total_reviews: 0, total_orders: 0
      });
      setSuccess(true);
    } catch (e) {
      toast.error(e?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  // ── SUCCESS STATE ──────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: G.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{
          maxWidth: 440, width: '100%', textAlign: 'center',
          borderRadius: 28, padding: '56px 32px',
          background: '#ffffff',
          border: `2px solid ${G.green}40`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.08), 0 0 40px ${G.green}10`,
        }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: `${G.green}20`,
            border: `2px solid ${G.green}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
            boxShadow: `0 0 40px ${G.green}50`,
          }}>
            <CheckCircle size={44} style={{ color: G.green }} />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: 28, color: G.text, marginBottom: 12, letterSpacing: '-0.02em' }}>
            Application Submitted!
          </h2>
          <p style={{ fontSize: 15, color: G.textMuted, marginBottom: 10, lineHeight: 1.7 }}>
            Your California provider profile is pending admin review. We verify all licenses and backgrounds within 1–2 business days.
          </p>
          <p style={{ fontSize: 13, color: G.textFaint, marginBottom: 32 }}>
            You'll get a notification once approved. You can start setting up your services in the dashboard.
          </p>
          <Link to={createPageUrl('ProviderDashboard')}>
            <button style={{
              padding: '14px 32px', borderRadius: 14,
              background: G.grad, border: 'none', color: '#fff',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255,77,109,0.4)',
              transition: 'all 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,77,109,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,77,109,0.4)'; }}>
              Go to Dashboard →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ── MAIN FORM ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ position: 'relative' }}>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh' }} className="lg:grid-cols-[420px_1fr]">

          {/* LEFT PANEL — Value prop */}
          <div style={{ background: G.bg2, borderRight: `1px solid ${G.border}`, padding: '48px 40px', display: 'flex', flexDirection: 'column' }} className="hidden lg:flex">

            <Link to={createPageUrl('Home')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: G.textMuted, textDecoration: 'none', marginBottom: 48, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = G.text}
              onMouseLeave={e => e.currentTarget.style.color = G.textMuted}>
              <ArrowLeft size={14} /> Back to Home
            </Link>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `${G.amber}15`, border: `1px solid ${G.amber}30`, borderRadius: 100, padding: '7px 14px', marginBottom: 24 }}>
                <Sparkles size={12} style={{ color: G.amber }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: G.amber, letterSpacing: '0.1em', textTransform: 'uppercase' }}>California Providers Only</span>
              </div>

              <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, background: `linear-gradient(135deg, ${G.text}, ${G.textMuted})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Grow your California<br />home services business.
              </h1>

              <p style={{ fontSize: 15, color: G.textMuted, lineHeight: 1.7, marginBottom: 40, maxWidth: 320 }}>
                Join California's most trusted home services marketplace. One flat monthly fee replaces expensive per-lead costs. Get matched with pre-qualified homeowners and get paid within 24 hours of job completion.
              </p>

              {/* Perks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
                {PERKS.map(({ icon: Icon, label, sub, c }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: `${c}08`, border: `1px solid ${c}20` }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} style={{ color: c }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>{label}</div>
                      <div style={{ fontSize: 12, color: G.textMuted }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Services offered */}
              <div style={{ padding: '16px', borderRadius: 14, background: G.surface, border: `1px solid ${G.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: G.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>We serve these categories</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['🔧 Plumbing', '❄️ HVAC', '✨ Home Cleaning', '🚨 Emergency Repairs', '🔄 Recurring Services'].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: G.textMuted }}>
                      <CheckCircle size={13} style={{ color: G.green, flexShrink: 0 }} /> {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: G.textFaint, marginTop: 32 }}>
              © 2026 Service Connect Pro · KCF LLC · California
            </p>
          </div>

          {/* RIGHT PANEL — Form */}
          <div style={{ padding: 'clamp(24px, 5vw, 60px) clamp(16px, 5vw, 60px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {/* Mobile back link */}
            <div className="lg:hidden w-full mb-6" style={{ maxWidth: 600 }}>
              <Link to={createPageUrl('Home')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: G.textMuted, textDecoration: 'none' }}>
                <ArrowLeft size={14} /> Back to Home
              </Link>
            </div>

            <div style={{ width: '100%', maxWidth: 580 }}>

              {/* Step progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
                {STEPS.map((s, idx) => (
                  <React.Fragment key={s.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <StepBadge stepNumber={s.id} isActive={step === s.id} isComplete={step > s.id} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: step === s.id ? G.text : step > s.id ? G.green : G.textFaint, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div style={{ height: 2, width: 48, borderRadius: 2, marginBottom: 20, background: step > s.id ? G.green : G.border, transition: 'background 0.4s ease', flexShrink: 0 }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Form card */}
              <div style={{
                background: '#ffffff',
                border: `1px solid ${G.border}`,
                borderRadius: 24,
                padding: 'clamp(24px, 4vw, 36px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
              }}>
                {/* Step header */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    {React.createElement(STEPS[step - 1].icon, { size: 18, style: { color: G.amber } })}
                    <h2 style={{ fontWeight: 800, fontSize: 20, color: G.text, margin: 0 }}>
                      {STEPS[step - 1].label}
                    </h2>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: G.textFaint, fontWeight: 600 }}>
                      Step {step} of 3
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: G.textMuted, lineHeight: 1.6, margin: 0 }}>
                    {step === 1 && 'Tell us about your business and what services you offer in California.'}
                    {step === 2 && 'Upload your verification documents — kept private, reviewed by admins only.'}
                    {step === 3 && 'Set your California service area and your available working days.'}
                  </p>
                </div>

                {/* ── STEP 1: Business Info ── */}
                {step === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Logo upload */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                      <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{
                          width: 88, height: 88, borderRadius: 20,
                          border: `2px dashed ${profileImage ? G.green : G.rose + '50'}`,
                          background: profileImage ? `${G.green}08` : 'rgba(255,255,255,0.03)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', margin: '0 auto 6px',
                          transition: 'all 0.2s',
                        }}>
                          {profileImage
                            ? <img src={profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Camera size={26} style={{ color: G.rose }} />
                          }
                        </div>
                        <span style={{ fontSize: 11, color: G.textFaint }}>{profileImage ? 'Logo uploaded ✓' : 'Business Logo (optional)'}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={LABEL_STYLE}>Business Name *</label>
                        <input value={formData.business_name} onChange={e => setFormData({ ...formData, business_name: e.target.value })} placeholder="ABC Plumbing Co." style={INPUT_STYLE} />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Owner Name *</label>
                        <input value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} placeholder="John Smith" style={INPUT_STYLE} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={LABEL_STYLE}>Email *</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@company.com" style={INPUT_STYLE} />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Phone</label>
                        <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(949) 555-0100" style={INPUT_STYLE} />
                      </div>
                    </div>

                    <div>
                      <label style={LABEL_STYLE}>Service Category *</label>
                      <Select value={formData.category_id} onValueChange={v => setFormData({ ...formData, category_id: v })}>
                        <SelectTrigger style={{ ...INPUT_STYLE, display: 'flex', alignItems: 'center' }}>
                          <SelectValue placeholder="Select your category" />
                        </SelectTrigger>
                        <SelectContent style={{ background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 12 }}>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id} style={{ color: G.text }}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={LABEL_STYLE}>Years of Experience</label>
                        <input type="number" value={formData.experience_years} onChange={e => setFormData({ ...formData, experience_years: e.target.value })} placeholder="5" style={INPUT_STYLE} />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Hourly Rate ($)</label>
                        <input type="number" value={formData.hourly_rate} onChange={e => setFormData({ ...formData, hourly_rate: e.target.value })} placeholder="75" style={INPUT_STYLE} />
                      </div>
                    </div>

                    <div>
                      <label style={LABEL_STYLE}>About Your Business</label>
                      <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your services, certifications, and what makes you stand out..."
                        rows={3}
                        style={{ ...INPUT_STYLE, height: 'auto', padding: '12px 14px', resize: 'vertical', lineHeight: 1.6 }} />
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Documents ── */}
                {step === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(67,97,238,0.1)', border: '1px solid rgba(67,97,238,0.2)', fontSize: 13, color: 'rgba(147,197,253,0.9)', lineHeight: 1.6 }}>
                      🔒 Documents are used by our admin team to verify your identity and California license. They are never shown publicly.
                    </div>

                    {[
                      { key: 'id_proof', label: 'Government ID / Passport *', desc: 'Driver\'s License, Passport, or State ID' },
                      { key: 'business_cert', label: 'Business Certificate (Optional)', desc: 'CA Contractor License, Business Registration, etc.' },
                    ].map(({ key, label, desc }) => (
                      <div key={key}>
                        <label style={LABEL_STYLE}>{label}</label>
                        <p style={{ fontSize: 12, color: G.textFaint, marginBottom: 8 }}>{desc}</p>
                        <label style={{ cursor: 'pointer', display: 'block' }}>
                          <div style={{
                            padding: '18px 16px', borderRadius: 14,
                            border: `2px dashed ${documents[key] ? G.green : G.rose + '40'}`,
                            background: documents[key] ? `${G.green}08` : 'rgba(255,255,255,0.02)',
                            display: 'flex', alignItems: 'center', gap: 14,
                            transition: 'all 0.2s',
                          }}>
                            {uploadingDoc === key
                              ? <Loader2 size={22} style={{ color: G.rose }} className="animate-spin" />
                              : documents[key]
                                ? <CheckCircle size={22} style={{ color: G.green }} />
                                : <Upload size={22} style={{ color: G.rose }} />
                            }
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 600, color: documents[key] ? G.green : G.textMuted, marginBottom: 2 }}>
                                {documents[key] ? 'Document uploaded ✓' : 'Click to upload file'}
                              </p>
                              <p style={{ fontSize: 12, color: G.textFaint }}>PDF, JPG, PNG — max 10MB</p>
                            </div>
                          </div>
                          <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleDocUpload(e, key)} disabled={!!uploadingDoc} />
                        </label>
                      </div>
                    ))}

                    <div>
                      <label style={LABEL_STYLE}>Portfolio / Work Photos (Optional)</label>
                      <p style={{ fontSize: 12, color: G.textFaint, marginBottom: 10 }}>Photos of past work help customers trust you faster</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {documents.portfolio.map((url, i) => (
                          <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10 }} />
                        ))}
                        <label style={{ cursor: 'pointer' }}>
                          <div style={{ aspectRatio: '1', borderRadius: 10, border: `2px dashed ${G.rose}40`, background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            {uploadingDoc === 'portfolio'
                              ? <Loader2 size={16} style={{ color: G.rose }} className="animate-spin" />
                              : <><Camera size={16} style={{ color: G.rose }} /><span style={{ fontSize: 10, color: G.textFaint }}>Add</span></>
                            }
                          </div>
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleDocUpload(e, 'portfolio')} disabled={!!uploadingDoc} />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Location & Schedule ── */}
                {step === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    <div>
                      <label style={LABEL_STYLE}>California City / Service Area *</label>
                      <div style={{ position: 'relative' }}>
                        <MapPin size={15} style={{ color: G.rose, position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Los Angeles, Orange County, San Diego"
                          style={{ ...INPUT_STYLE, paddingLeft: 38 }}
                        />
                      </div>
                      <p style={{ fontSize: 12, color: G.textFaint, marginTop: 6 }}>
                        We currently serve California only — LA, San Diego, SF, San Jose, Sacramento & surrounding areas.
                      </p>
                    </div>

                    <div>
                      <label style={LABEL_STYLE}>Available Working Days</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                        {DAYS.map(day => (
                          <button key={day} type="button" onClick={() => toggleDay(day)}
                            style={{
                              padding: '10px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                              border: `1px solid ${selectedDays.includes(day) ? G.rose : G.border}`,
                              background: selectedDays.includes(day) ? `${G.rose}20` : G.surface,
                              color: selectedDays.includes(day) ? G.rose : G.textFaint,
                              cursor: 'pointer', transition: 'all 0.2s',
                            }}>
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* What happens next */}
                    <div style={{ padding: '18px 20px', borderRadius: 16, background: `${G.green}08`, border: `1px solid ${G.green}20` }}>
                      <h4 style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: G.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What happens next</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          'Profile submitted for admin review',
                          'Documents verified within 1–2 business days',
                          'You get a verified badge + notification',
                          'Start receiving matched jobs immediately',
                        ].map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: G.textMuted }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${G.green}20`, border: `1px solid ${G.green}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: 10, fontWeight: 800, color: G.green }}>{i + 1}</span>
                            </div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 28, paddingTop: 20, borderTop: `1px solid ${G.border}` }}>
                  {step > 1 && (
                    <button onClick={() => setStep(s => s - 1)}
                      style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6, padding: '13px 20px', borderRadius: 14, background: G.surface, border: `1px solid ${G.border}`, color: G.textMuted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = G.text; }}
                      onMouseLeave={e => { e.currentTarget.style.background = G.surface; e.currentTarget.style.color = G.textMuted; }}>
                      <ArrowLeft size={15} /> Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button onClick={() => { if (validateStep()) setStep(s => s + 1); }}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 20px', borderRadius: 14, background: G.grad, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,77,109,0.35)', transition: 'all 0.25s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(255,77,109,0.5)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,77,109,0.35)'; }}>
                      Continue <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button disabled={loading} onClick={onSubmit}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 14, background: G.grad, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, boxShadow: '0 6px 20px rgba(255,77,109,0.35)', transition: 'all 0.25s ease' }}
                      onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                      {loading ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : <>Submit Application <Zap size={15} /></>}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
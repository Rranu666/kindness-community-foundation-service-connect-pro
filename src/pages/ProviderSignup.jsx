import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Building2, User, Mail, Phone, MapPin, Clock, DollarSign,
  Upload, Loader2, CheckCircle, ArrowLeft, ArrowRight, FileText, Camera
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Documents', icon: FileText },
  { id: 3, label: 'Location & Schedule', icon: MapPin },
];

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

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfileImage(file_url);
      toast.success('Profile image uploaded!');
    } catch { toast.error('Upload failed'); }
  };

  const handleDocUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(docType);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
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
    if (step === 1) {
      if (!formData.business_name || !formData.owner_name || !formData.email || !formData.category_id) {
        toast.error('Please fill in all required fields');
        return false;
      }
    }
    return true;
  };

  const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const onSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await base44.entities.ServiceProvider.create({
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        owner_email: formData.email,
        category_id: isUUID(formData.category_id) ? formData.category_id : null,
        description: formData.description,
        location: formData.location,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        avatar_url: profileImage,
        is_active: true,
        is_verified: false,
        rating: 0,
        review_count: 0,
      });
      setSuccess(true);
    } catch (e) {
      toast.error(e?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0d0d1f' }}>
        <div className="max-w-md w-full text-center rounded-2xl p-10" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.25)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
          <p className="mb-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Your business profile has been created and is pending admin verification.
          </p>
          <p className="mb-6 text-xs px-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            You'll receive a notification once your account is verified. You can start adding services in the meantime.
          </p>
          <Link to={createPageUrl('ProviderDashboard')}>
            <Button className="text-white border-0" style={{ background: '#e8356d' }}>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10" style={{ background: '#0d0d1f' }}>
      <div className="max-w-2xl mx-auto px-4">
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-sm mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: step >= s.id ? '#e8356d' : 'rgba(255,255,255,0.1)',
                    color: step >= s.id ? '#fff' : 'rgba(255,255,255,0.4)'
                  }}>
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-sm hidden sm:block" style={{ color: step === s.id ? '#e8356d' : 'rgba(255,255,255,0.45)' }}>
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-px" style={{ background: step > s.id ? '#e8356d' : 'rgba(255,255,255,0.1)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
          <CardHeader>
            <CardTitle className="text-white">{STEPS[step - 1].label}</CardTitle>
            <CardDescription style={{ color: 'rgba(255,255,255,0.5)' }}>
              {step === 1 && 'Tell us about your business'}
              {step === 2 && 'Upload verification documents (helps build trust with customers)'}
              {step === 3 && 'Set your service area and working schedule'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* STEP 1: Business Info */}
            {step === 1 && (
              <>
                {/* Profile Image */}
                <div className="flex justify-center mb-2">
                  <label className="cursor-pointer">
                    <div className="w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(232,53,109,0.3)' }}>
                      {profileImage ? (
                        <img src={profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8" style={{ color: '#e8356d' }} />
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>Business Logo</p>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Business Name *</Label>
                    <Input value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})}
                      placeholder="Your Business Name"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                      className="placeholder:text-white/30" />
                  </div>
                  <div>
                    <Label className="text-white">Owner Name *</Label>
                    <Input value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})}
                      placeholder="Your Full Name"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                      className="placeholder:text-white/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Email *</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="email@example.com"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                      className="placeholder:text-white/30" />
                  </div>
                  <div>
                    <Label className="text-white">Phone</Label>
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 234 567 890"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                      className="placeholder:text-white/30" />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Service Category *</Label>
                  <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                    <SelectTrigger style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Years of Experience</Label>
                    <Input type="number" value={formData.experience_years} onChange={e => setFormData({...formData, experience_years: e.target.value})}
                      placeholder="5"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                      className="placeholder:text-white/30" />
                  </div>
                  <div>
                    <Label className="text-white">Hourly Rate ($)</Label>
                    <Input type="number" value={formData.hourly_rate} onChange={e => setFormData({...formData, hourly_rate: e.target.value})}
                      placeholder="50"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                      className="placeholder:text-white/30" />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your services, expertise, and what makes you unique..."
                    rows={3}
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                    className="placeholder:text-white/30" />
                </div>
              </>
            )}

            {/* STEP 2: Documents */}
            {step === 2 && (
              <>
                <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(147,197,253,0.9)' }}>
                  Documents are used by admins to verify your identity and business. They are not publicly shown.
                </div>

                {[
                  { key: 'id_proof', label: 'Government ID / Passport', desc: 'Aadhaar, Passport, Driving License, etc.' },
                  { key: 'business_cert', label: 'Business Certificate (Optional)', desc: 'GST, Trade License, or any business registration' },
                ].map(({ key, label, desc }) => (
                  <div key={key}>
                    <Label className="text-white">{label}</Label>
                    <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                    <label className="cursor-pointer block">
                      <div className="p-4 rounded-xl border-dashed border-2 flex items-center gap-3 transition-colors"
                        style={{ borderColor: documents[key] ? '#10b981' : 'rgba(232,53,109,0.3)', background: documents[key] ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)' }}>
                        {uploadingDoc === key ? (
                          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#e8356d' }} />
                        ) : documents[key] ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Upload className="w-6 h-6" style={{ color: '#e8356d' }} />
                        )}
                        <div>
                          <p className="text-sm font-medium" style={{ color: documents[key] ? '#10b981' : 'rgba(255,255,255,0.7)' }}>
                            {documents[key] ? 'Document Uploaded ✓' : 'Click to upload'}
                          </p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>PDF, JPG, PNG up to 10MB</p>
                        </div>
                      </div>
                      <input type="file" accept="image/*,.pdf" className="hidden"
                        onChange={(e) => handleDocUpload(e, key)} disabled={!!uploadingDoc} />
                    </label>
                  </div>
                ))}

                <div>
                  <Label className="text-white">Portfolio Images (Optional)</Label>
                  <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Upload photos of your previous work</p>
                  <div className="grid grid-cols-3 gap-2">
                    {documents.portfolio.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                    ))}
                    <label className="cursor-pointer">
                      <div className="h-20 rounded-lg border-dashed border-2 flex flex-col items-center justify-center"
                        style={{ borderColor: 'rgba(232,53,109,0.3)', background: 'rgba(255,255,255,0.03)' }}>
                        {uploadingDoc === 'portfolio' ? (
                          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#e8356d' }} />
                        ) : (
                          <>
                            <Camera className="w-5 h-5" style={{ color: '#e8356d' }} />
                            <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Add Photo</span>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleDocUpload(e, 'portfolio')} disabled={!!uploadingDoc} />
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: Location & Schedule */}
            {step === 3 && (
              <>
                <div>
                  <Label className="text-white">Service Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#e8356d' }} />
                    <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                      placeholder="City, State / Area"
                      className="pl-10 placeholder:text-white/30"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Enter your primary service area</p>
                </div>

                <div>
                  <Label className="text-white mb-3 block">Working Days</Label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {DAYS.map((day) => (
                      <button key={day} type="button" onClick={() => toggleDay(day)}
                        className="p-2 rounded-xl text-sm font-medium transition-all border"
                        style={{
                          background: selectedDays.includes(day) ? '#e8356d' : 'rgba(255,255,255,0.06)',
                          color: selectedDays.includes(day) ? '#fff' : 'rgba(255,255,255,0.6)',
                          borderColor: selectedDays.includes(day) ? '#e8356d' : 'rgba(255,255,255,0.1)'
                        }}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(232,53,109,0.07)', border: '1px solid rgba(232,53,109,0.15)' }}>
                  <h4 className="text-white font-medium mb-2">What happens next?</h4>
                  <ul className="space-y-1 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <li>✓ Your profile is submitted for admin review</li>
                    <li>✓ Admin verifies your documents (1-2 business days)</li>
                    <li>✓ You'll receive a verification notification</li>
                    <li>✓ Start adding services and accepting bookings</li>
                  </ul>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button variant="outline" className="flex-1 text-white border-white/20 hover:bg-white/10 hover:text-white hover:border-white/30" onClick={() => setStep(s => s - 1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button className="flex-1 text-white" style={{ background: '#e8356d' }}
                  onClick={() => { if (validateStep()) setStep(s => s + 1); }}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button className="flex-1 text-white" style={{ background: '#e8356d' }}
                  disabled={loading} onClick={onSubmit}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : 'Submit Registration'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
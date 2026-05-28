import React, { useState } from 'react';
import { Settings, CheckCircle2, TrendingUp, ExternalLink, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

import BlogTab from './BlogTab';

export default function SettingsTab() {
  const [saving, setSaving] = useState(false);
  const [general, setGeneral] = useState({
    maintenance_mode: false,
    maintenance_message: 'We are performing scheduled maintenance. We\'ll be back shortly!',
    cache_enabled: true,
    cache_ttl: '60',
  });
  const [gdpr, setGdpr] = useState({
    cookie_banner: true,
    analytics_consent: true,
    marketing_consent: false,
    cookie_expiry_days: '365',
    privacy_policy_url: '/terms',
  });
  const [social, setSocial] = useState({
    facebook: '', instagram: '', twitter: '', linkedin: '', youtube: '', whatsapp: '',
  });
  const [analytics, setAnalytics] = useState({
    ga_measurement_id: '', gtm_id: '', fb_pixel_id: '', enabled: false,
  });
  const [livechat, setLivechat] = useState({
    provider: 'none', widget_id: '', enabled: false, color: '#cb3c7a',
  });
  const [emailTemplates, setEmailTemplates] = useState({
    booking_confirmed: 'Hi {customer_name},\n\nYour booking #{order_number} for {service_name} has been confirmed!\n\nDate: {scheduled_date}\nProvider: {provider_name}\n\nThank you!',
    booking_cancelled: 'Hi {customer_name},\n\nYour booking #{order_number} has been cancelled.\n\nIf you were charged, a refund will be processed within 3-5 business days.',
    payout_approved: 'Hi {provider_name},\n\nYour payout request of ${amount} has been approved and will be processed within 2 business days.',
  });
  const [activeTemplate, setActiveTemplate] = useState('booking_confirmed');

  const templateLabels = { booking_confirmed: 'Booking Confirmed', booking_cancelled: 'Booking Cancelled', payout_approved: 'Payout Approved' };

  const handleSave = (section) => {
    setSaving(section);
    setTimeout(() => { setSaving(false); toast.success('Settings saved'); }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4 text-amber-500" /> General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div><p className="font-medium text-amber-900">Maintenance Mode</p><p className="text-xs text-amber-700">Temporarily disable site</p></div>
              <Switch checked={general.maintenance_mode} onCheckedChange={v => setGeneral(g => ({ ...g, maintenance_mode: v }))} />
            </div>
            {general.maintenance_mode && (
              <div><Label>Message</Label><Textarea value={general.maintenance_message} onChange={e => setGeneral(g => ({ ...g, maintenance_message: e.target.value }))} rows={2} className="mt-1 text-sm" /></div>
            )}
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-slate-800">Cache System</p><p className="text-xs text-slate-500">Cache API responses</p></div>
              <Switch checked={general.cache_enabled} onCheckedChange={v => setGeneral(g => ({ ...g, cache_enabled: v }))} />
            </div>
            {general.cache_enabled && (
              <div><Label>Cache TTL (seconds)</Label><Input type="number" value={general.cache_ttl} onChange={e => setGeneral(g => ({ ...g, cache_ttl: e.target.value }))} className="mt-1 w-36" /></div>
            )}
            <Button className="bg-violet-600 hover:bg-violet-700 w-full" onClick={() => handleSave('general')} disabled={saving === 'general'}>
              {saving === 'general' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> GDPR</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[{ key: 'cookie_banner', label: 'Cookie Consent Banner', desc: 'Show GDPR notice' }, { key: 'analytics_consent', label: 'Analytics Consent', desc: 'Ask before tracking' }, { key: 'marketing_consent', label: 'Marketing Consent', desc: 'Ask before marketing' }].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between"><div><p className="font-medium text-slate-800 text-sm">{label}</p><p className="text-xs text-slate-500">{desc}</p></div><Switch checked={gdpr[key]} onCheckedChange={v => setGdpr(g => ({ ...g, [key]: v }))} /></div>
            ))}
            <div><Label>Cookie Expiry (days)</Label><Input type="number" value={gdpr.cookie_expiry_days} onChange={e => setGdpr(g => ({ ...g, cookie_expiry_days: e.target.value }))} className="mt-1 w-36" /></div>
            <Button className="bg-violet-600 hover:bg-violet-700 w-full" onClick={() => handleSave('gdpr')} disabled={saving === 'gdpr'}>
              {saving === 'gdpr' ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> Social Media</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[{ key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' }, { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' }, { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/...' }, { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' }, { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' }, { key: 'whatsapp', label: 'WhatsApp', placeholder: '+1234567890' }].map(({ key, label, placeholder }) => (
              <div key={key}><Label>{label}</Label><Input value={social[key]} onChange={e => setSocial(s => ({ ...s, [key]: e.target.value }))} placeholder={placeholder} className="mt-1 text-sm" /></div>
            ))}
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700 mt-4" onClick={() => handleSave('social')} disabled={saving === 'social'}>
            {saving === 'social' ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-500" /> Analytics</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="font-medium text-slate-800">Enable Analytics</p><p className="text-xs text-slate-500">Load analytics scripts</p></div><Switch checked={analytics.enabled} onCheckedChange={v => setAnalytics(a => ({ ...a, enabled: v }))} /></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label>GA4 ID</Label><Input value={analytics.ga_measurement_id} onChange={e => setAnalytics(a => ({ ...a, ga_measurement_id: e.target.value }))} placeholder="G-XXXXXXXXXX" className="mt-1 font-mono text-sm" /></div>
            <div><Label>GTM ID</Label><Input value={analytics.gtm_id} onChange={e => setAnalytics(a => ({ ...a, gtm_id: e.target.value }))} placeholder="GTM-XXXXXXX" className="mt-1 font-mono text-sm" /></div>
            <div><Label>FB Pixel ID</Label><Input value={analytics.fb_pixel_id} onChange={e => setAnalytics(a => ({ ...a, fb_pixel_id: e.target.value }))} placeholder="123456789012345" className="mt-1 font-mono text-sm" /></div>
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => handleSave('analytics')} disabled={saving === 'analytics'}>
            {saving === 'analytics' ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><ExternalLink className="w-4 h-4 text-violet-500" /> Live Chat</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="font-medium text-slate-800">Enable Chat Widget</p><p className="text-xs text-slate-500">Show to visitors</p></div><Switch checked={livechat.enabled} onCheckedChange={v => setLivechat(l => ({ ...l, enabled: v }))} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Provider</Label><Select value={livechat.provider} onValueChange={v => setLivechat(l => ({ ...l, provider: v }))}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="intercom">Intercom</SelectItem><SelectItem value="crisp">Crisp</SelectItem><SelectItem value="tawk">Tawk.to</SelectItem><SelectItem value="zendesk">Zendesk</SelectItem><SelectItem value="freshchat">Freshchat</SelectItem></SelectContent></Select></div>
            {livechat.provider !== 'none' && (
              <div><Label>Widget ID</Label><Input value={livechat.widget_id} onChange={e => setLivechat(l => ({ ...l, widget_id: e.target.value }))} placeholder="Widget key" className="mt-1 font-mono text-sm" /></div>
            )}
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => handleSave('livechat')} disabled={saving === 'livechat'}>
            {saving === 'livechat' ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Email Templates</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(templateLabels).map(([key, label]) => (
              <Button key={key} size="sm" variant={activeTemplate === key ? 'default' : 'outline'}
                className={activeTemplate === key ? 'bg-violet-600 hover:bg-violet-700' : ''}
                onClick={() => setActiveTemplate(key)}>
                {label}
              </Button>
            ))}
          </div>
          <div><Label className="text-sm font-medium">{templateLabels[activeTemplate]}</Label><p className="text-xs text-slate-500 mb-2">Variables: {'{customer_name}'} {'{order_number}'} {'{service_name}'} {'{scheduled_date}'} {'{provider_name}'} {'{amount}'}</p><Textarea value={emailTemplates[activeTemplate]} onChange={e => setEmailTemplates(t => ({ ...t, [activeTemplate]: e.target.value }))} rows={6} className="font-mono text-sm" /></div>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => handleSave('email')} disabled={saving === 'email'}>
            {saving === 'email' ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
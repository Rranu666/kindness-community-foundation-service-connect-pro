import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function BrandingTab() {
  const [form, setForm] = useState({
    primary_color: '#cb3c7a',
    secondary_color: '#9b2d5c',
    bg_color: '#0f0900',
    font_family: 'Inter',
    logo_url: '',
    rtl: false,
    custom_css: '',
    custom_js: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    document.documentElement.style.setProperty('--brand-primary', form.primary_color);
    setTimeout(() => {
      setSaving(false);
      toast.success('Branding settings saved');
    }, 600);
  };

  const handleRTL = (v) => {
    setForm(f => ({ ...f, rtl: v }));
    document.documentElement.setAttribute('dir', v ? 'rtl' : 'ltr');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Colors & Typography</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'primary_color', label: 'Primary / Brand Color' },
              { key: 'secondary_color', label: 'Secondary Color' },
              { key: 'bg_color', label: 'Background Color' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <input type="color" value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                <div className="flex-1">
                  <Label>{label}</Label>
                  <Input value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} className="mt-1 font-mono text-sm" />
                </div>
              </div>
            ))}
            <div>
              <Label>Font Family</Label>
              <Select value={form.font_family} onValueChange={v => setForm({...form, font_family: v})}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Lato', 'Montserrat'].map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Logo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={e => setForm({...form, logo_url: e.target.value})}
                placeholder="https://..." className="mt-1" />
            </div>
            {form.logo_url && (
              <img src={form.logo_url} alt="Logo preview" className="h-12 object-contain border rounded-lg p-2" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Layout & RTL</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">RTL Layout</p>
                <p className="text-sm text-slate-500">Right-to-left for Arabic, Hebrew, etc.</p>
              </div>
              <Switch checked={form.rtl} onCheckedChange={handleRTL} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader><CardTitle className="text-base">Custom CSS</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.custom_css} onChange={e => setForm({...form, custom_css: e.target.value})}
              rows={8} placeholder="/* Custom CSS styles */&#10;.my-class { color: red; }"
              className="font-mono text-sm" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Custom JavaScript</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.custom_js} onChange={e => setForm({...form, custom_js: e.target.value})}
              rows={6} placeholder="// Custom JS&#10;console.log('hello');"
              className="font-mono text-sm" />
            <p className="text-xs text-slate-400 mt-2">⚠ Custom scripts run on every page. Use with caution.</p>
          </CardContent>
        </Card>

        <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Branding Settings'}
        </Button>
      </div>
    </div>
  );
}
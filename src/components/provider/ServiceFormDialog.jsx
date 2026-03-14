import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Camera, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const S = { background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' };

export default function ServiceFormDialog({ open, onClose, onSave, service, providerId }) {
  const [form, setForm] = useState({
    name: '', description: '', price: '', price_type: 'fixed',
    duration_minutes: '', is_active: true, is_instant_booking: false,
    tax_rate: '', images: [], addons: []
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newAddon, setNewAddon] = useState({ name: '', price: '' });

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name || '',
        description: service.description || '',
        price: service.price || '',
        price_type: service.price_type || 'fixed',
        duration_minutes: service.duration_minutes || '',
        is_active: service.is_active !== false,
        is_instant_booking: !!service.is_instant_booking,
        tax_rate: service.tax_rate || '',
        images: service.images || [],
        addons: service.addons || []
      });
    } else {
      setForm({
        name: '', description: '', price: '', price_type: 'fixed',
        duration_minutes: '', is_active: true, is_instant_booking: false,
        tax_rate: '', images: [], addons: []
      });
    }
  }, [service, open]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, images: [...f.images, file_url] }));
    } catch { toast.error('Upload failed'); }
    finally { setUploadingImage(false); }
  };

  const removeImage = (idx) => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const addAddon = () => {
    if (!newAddon.name || !newAddon.price) return;
    setForm(f => ({ ...f, addons: [...f.addons, { ...newAddon, price: parseFloat(newAddon.price) }] }));
    setNewAddon({ name: '', price: '' });
  };

  const removeAddon = (idx) => setForm(f => ({ ...f, addons: f.addons.filter((_, i) => i !== idx) }));

  const handleSave = () => {
    if (!form.name || !form.price) return toast.error('Name and price are required');
    onSave({
      provider_id: providerId,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      price_type: form.price_type,
      duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
      is_active: form.is_active,
      is_instant_booking: form.is_instant_booking,
      tax_rate: form.tax_rate ? parseFloat(form.tax_rate) : null,
      images: form.images,
      addons: form.addons
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ background: '#13132a', borderColor: 'rgba(232,53,109,0.3)' }}
        className="border max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{service ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Basic Info */}
          <div>
            <Label className="text-white">Service Name *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              style={S} className="mt-1" />
          </div>
          <div>
            <Label className="text-white">Description</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} style={S} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white">Price ($) *</Label>
              <Input type="number" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} style={S} className="mt-1" />
            </div>
            <div>
              <Label className="text-white">Price Type</Label>
              <Select value={form.price_type} onValueChange={v => setForm({ ...form, price_type: v })}>
                <SelectTrigger style={S} className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent style={{ background: '#13132a' }}>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="per_visit">Per Visit</SelectItem>
                  <SelectItem value="negotiable">Negotiable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white">Duration (minutes)</Label>
              <Input type="number" value={form.duration_minutes}
                onChange={e => setForm({ ...form, duration_minutes: e.target.value })}
                placeholder="60" style={S} className="mt-1" />
            </div>
            <div>
              <Label className="text-white">Tax Rate (%)</Label>
              <Input type="number" step="0.1" value={form.tax_rate}
                onChange={e => setForm({ ...form, tax_rate: e.target.value })}
                placeholder="e.g. 8.5" style={S} className="mt-1" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Instant Booking</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>No confirmation needed</p>
            </div>
            <Switch checked={form.is_instant_booking} onCheckedChange={v => setForm({ ...form, is_instant_booking: v })} />
          </div>

          {/* Images */}
          <div>
            <Label className="text-white mb-2 block">Service Images</Label>
            <div className="grid grid-cols-3 gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                  <button onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.7)' }}>
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="cursor-pointer">
                <div className="h-20 rounded-lg border-dashed border-2 flex flex-col items-center justify-center"
                  style={{ borderColor: 'rgba(232,53,109,0.3)', background: 'rgba(255,255,255,0.03)' }}>
                  {uploadingImage
                    ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#e8356d' }} />
                    : <Camera className="w-5 h-5" style={{ color: '#e8356d' }} />}
                  <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Add</span>
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <Label className="text-white mb-2 block">Add-ons / Extra Services</Label>
            <div className="space-y-2 mb-3">
              {form.addons.map((addon, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-white text-sm">{addon.name}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#e8356d' }} className="text-sm font-medium">+${addon.price}</span>
                    <button onClick={() => removeAddon(i)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add-on name" value={newAddon.name}
                onChange={e => setNewAddon({ ...newAddon, name: e.target.value })}
                style={S} className="flex-1 text-sm" />
              <Input type="number" placeholder="$" value={newAddon.price}
                onChange={e => setNewAddon({ ...newAddon, price: e.target.value })}
                style={S} className="w-20 text-sm" />
              <Button type="button" size="sm" onClick={addAddon}
                style={{ background: 'rgba(232,53,109,0.2)', color: '#e8356d' }}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 text-white border-white/20" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 text-white" style={{ background: '#e8356d' }} onClick={handleSave}>
              {service ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
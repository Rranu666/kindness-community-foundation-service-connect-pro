import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Mail, Phone, Edit2, Plus, Trash2, Save, Star, Heart, Globe, Settings, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'sw', label: 'Kiswahili', dir: 'ltr' },
];

export default function CustomerProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', postal_code: '' });
  const [openAddAddress, setOpenAddAddress] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setSelectedLang(u?.preferred_language || document.documentElement.lang || 'en');
    }).catch(() => {});
  }, []);

  const { data: addresses = [], isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses', user?.email],
    queryFn: () => base44.entities.Address.filter({ customer_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ customer_name: user?.full_name }, '-created_date', 20),
    enabled: !!user?.full_name
  });

  const { data: savedProviderIds = [] } = useQuery({
    queryKey: ['saved-providers-ids', user?.email],
    queryFn: async () => {
      const u = await base44.auth.me();
      return u?.saved_providers || [];
    },
    enabled: !!user?.email
  });

  const { data: savedProviders = [] } = useQuery({
    queryKey: ['saved-providers', savedProviderIds],
    queryFn: async () => {
      if (!savedProviderIds.length) return [];
      const results = await Promise.all(
        savedProviderIds.map(id => base44.entities.ServiceProvider.filter({ id }))
      );
      return results.map(r => r[0]).filter(Boolean);
    },
    enabled: savedProviderIds.length > 0
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe(formData);
    },
    onSuccess: () => {
      toast.success('Profile updated');
      setEditMode(false);
      base44.auth.me().then(setUser);
    },
    onError: () => toast.error('Failed to update profile')
  });

  const addAddressMutation = useMutation({
    mutationFn: async () => {
      if (!newAddress.street || !newAddress.city) throw new Error('Please fill in all fields');
      await base44.entities.Address.create({ customer_email: user.email, ...newAddress });
    },
    onSuccess: () => {
      toast.success('Address added');
      setNewAddress({ label: 'Home', street: '', city: '', postal_code: '' });
      setOpenAddAddress(false);
      refetchAddresses();
    },
    onError: (e) => toast.error(e.message || 'Failed to add address')
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => base44.entities.Address.delete(id),
    onSuccess: () => { toast.success('Address deleted'); refetchAddresses(); },
    onError: () => toast.error('Failed to delete address')
  });

  const removeSavedProvider = useMutation({
    mutationFn: async (providerId) => {
      const updated = (user?.saved_providers || []).filter(id => id !== providerId);
      await base44.auth.updateMe({ saved_providers: updated });
    },
    onSuccess: () => {
      toast.success('Removed from saved');
      queryClient.invalidateQueries({ queryKey: ['saved-providers-ids'] });
      base44.auth.me().then(setUser);
    }
  });

  const handleLangChange = async (code) => {
    setSelectedLang(code);
    const lang = LANGUAGES.find(l => l.code === code);
    document.documentElement.setAttribute('dir', lang?.dir || 'ltr');
    document.documentElement.setAttribute('lang', code);
    await base44.auth.updateMe({ preferred_language: code });
    toast.success(`Language changed to ${lang?.label}`);
  };

  useEffect(() => {
    if (user) setFormData({ phone: user.phone || '' });
  }, [user]);

  if (!user) {
    return (
      <div style={{ background: '#0f0900' }} className="min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4"><Skeleton className="h-96" /></div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f0900' }} className="min-h-screen py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
            {user.full_name?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.full_name}</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">{user.email}</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(249,115,22,0.2)' }}
            className="grid w-full grid-cols-3 sm:grid-cols-5 border mb-6 h-auto gap-0.5 p-1">
            {['profile', 'addresses', 'saved', 'reviews', 'settings'].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-white text-xs data-[state=active]:bg-pink-500/20 capitalize py-2">
                {tab === 'saved' ? 'Saved' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile" className="mt-0">
            <Card style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Personal Information</CardTitle>
                  {!editMode && (
                    <Button size="sm" variant="outline" className="text-white border-white/20"
                      onClick={() => setEditMode(true)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Email</label>
                  <div className="flex items-center gap-2 mt-1 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Mail className="w-4 h-4" style={{ color: '#f97316' }} />
                    <p className="text-white">{user.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Full Name</label>
                  <div className="flex items-center gap-2 mt-1 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-white">{user.full_name}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-2 block" style={{ color: 'rgba(255,255,255,0.6)' }}>Phone Number</label>
                  {editMode ? (
                    <Input type="tel" value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone number"
                      style={{ background: '#0f0900', borderColor: 'rgba(249,115,22,0.2)', color: '#fff' }}
                      className="placeholder:text-gray-500" />
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Phone className="w-4 h-4" style={{ color: '#f97316' }} />
                      <p className="text-white">{formData.phone || 'Not provided'}</p>
                    </div>
                  )}
                </div>
                {editMode && (
                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1 text-white" style={{ background: '#f97316' }}
                      onClick={() => updateProfileMutation.mutate()}
                      disabled={updateProfileMutation.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" className="flex-1 text-white border-white/20"
                      onClick={() => setEditMode(false)}>Cancel</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Addresses Tab ── */}
          <TabsContent value="addresses" className="mt-0 space-y-4">
            {addressesLoading ? <Skeleton className="h-40" /> : addresses.map((address) => (
              <Card key={address.id} style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{address.label}</h3>
                        {address.is_default && (
                          <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: '#f97316' }}>Default</span>
                        )}
                      </div>
                      <div className="flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#f97316' }} />
                        <div className="text-sm">
                          <p>{address.street}</p>
                          <p>{address.city}{address.postal_code ? `, ${address.postal_code}` : ''}</p>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10"
                      onClick={() => deleteAddressMutation.mutate(address.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {addresses.length === 0 && !addressesLoading && (
              <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>No saved addresses</div>
            )}

            <Dialog open={openAddAddress} onOpenChange={setOpenAddAddress}>
              <DialogTrigger asChild>
                <Button className="w-full text-white" style={{ background: '#f97316' }}>
                  <Plus className="w-4 h-4 mr-2" /> Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.3)' }}>
                <DialogHeader><DialogTitle className="text-white">Add New Address</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Label</label>
                    <select value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      style={{ background: '#0f0900', borderColor: 'rgba(249,115,22,0.2)', color: '#fff' }}
                      className="w-full rounded-md border p-2">
                      <option>Home</option><option>Work</option><option>Other</option>
                    </select>
                  </div>
                  {['street', 'city', 'postal_code'].map((field) => (
                    <div key={field}>
                      <label className="text-white text-sm mb-2 block capitalize">{field.replace('_', ' ')}</label>
                      <Input placeholder={field.replace('_', ' ')} value={newAddress[field]}
                        onChange={(e) => setNewAddress({ ...newAddress, [field]: e.target.value })}
                        style={{ background: '#0f0900', borderColor: 'rgba(249,115,22,0.2)', color: '#fff' }}
                        className="placeholder:text-gray-500" />
                    </div>
                  ))}
                  <Button className="w-full text-white" style={{ background: '#f97316' }}
                    onClick={() => addAddressMutation.mutate()}
                    disabled={addAddressMutation.isPending}>
                    {addAddressMutation.isPending ? 'Adding...' : 'Add Address'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ── Saved Providers Tab ── */}
          <TabsContent value="saved" className="mt-0">
            {savedProviders.length > 0 ? (
              <div className="space-y-3">
                {savedProviders.map((provider) => (
                  <Card key={provider.id} style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                          {provider.profile_image ? (
                            <img src={provider.profile_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold">
                              {provider.business_name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{provider.business_name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {provider.rating > 0 && (
                              <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {provider.rating?.toFixed(1)}
                              </span>
                            )}
                            {provider.location && (
                              <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                <MapPin className="w-3 h-3" /> {provider.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={createPageUrl(`ProviderProfile?id=${provider.id}`)}>
                            <Button size="sm" style={{ background: '#f97316' }} className="text-white text-xs">View</Button>
                          </Link>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-400/10"
                            onClick={() => removeSavedProvider.mutate(provider.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>No saved providers yet</p>
                <Link to={createPageUrl('Browse')}>
                  <Button size="sm" style={{ background: '#f97316' }} className="mt-4 text-white">Browse Providers</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* ── Reviews Tab ── */}
          <TabsContent value="reviews" className="mt-0">
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <Card key={review.id} style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className="w-4 h-4" style={{ color: s <= review.rating ? '#f59e0b' : 'rgba(255,255,255,0.2)', fill: s <= review.rating ? '#f59e0b' : 'transparent' }} />
                          ))}
                        </div>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {new Date(review.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{review.comment}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>You haven't left any reviews yet</p>
              </div>
            )}
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings" className="mt-0 space-y-4">
            {/* Language */}
            <Card style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Globe className="w-5 h-5" style={{ color: '#f97316' }} />Language & Region</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className="p-3 rounded-xl text-sm font-medium transition-all border"
                      style={{
                        background: selectedLang === lang.code ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.04)',
                        borderColor: selectedLang === lang.code ? '#f97316' : 'rgba(255,255,255,0.1)',
                        color: selectedLang === lang.code ? '#f97316' : 'rgba(255,255,255,0.7)'
                      }}>
                      {lang.label}
                      {lang.dir === 'rtl' && <span className="ml-1 text-xs opacity-60">(RTL)</span>}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Bell className="w-5 h-5" style={{ color: '#f97316' }} />Notifications</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Booking updates, confirmations' },
                  { key: 'push', label: 'Push Notifications', desc: 'Real-time alerts on your device' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Text messages for critical updates' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{label}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                    </div>
                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [key]: v }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security */}
            <Card style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Shield className="w-5 h-5" style={{ color: '#f97316' }} />Account</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-white border-white/10 hover:bg-white/5"
                  onClick={() => base44.auth.logout()}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
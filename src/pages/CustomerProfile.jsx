import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile, callFunction } from '@/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimisticMutation } from '@/hooks/useOptimisticMutation';
import { MapPin, Mail, Phone, Edit2, Plus, Trash2, Save, Star, Heart, Globe, Bell, Shield, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { THEME as L, INPUT_STYLE } from '@/lib/theme';

const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'sw', label: 'Kiswahili', dir: 'ltr' },
];

const TABS = ['profile', 'addresses', 'saved', 'reviews', 'settings'];

export default function CustomerProfile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', postal_code: '' });
  const [openAddAddress, setOpenAddAddress] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [notifications, setNotifications] = useState({ email: true, push: true, sms: false });
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    auth.me().then(u => { setUser(u); setSelectedLang(u?.preferred_language || 'en'); }).catch(() => {});
  }, []);

  useEffect(() => { if (user) setFormData({ phone: user.phone || '' }); }, [user]);

  const { data: addresses = [], isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses', user?.email],
    queryFn: () => db.Address.filter({ customer_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: () => db.Review.filter({ customer_name: user?.full_name }, '-created_date', 20),
    enabled: !!user?.full_name
  });

  const { data: savedProviderIds = [] } = useQuery({
    queryKey: ['saved-providers-ids', user?.email],
    queryFn: async () => (await auth.me())?.saved_providers || [],
    enabled: !!user?.email
  });

  const { data: savedProviders = [] } = useQuery({
    queryKey: ['saved-providers', savedProviderIds],
    queryFn: async () => {
      if (!savedProviderIds.length) return [];
      return (await Promise.all(savedProviderIds.map(id => db.ServiceProvider.filter({ id })))).map(r => r[0]).filter(Boolean);
    },
    enabled: savedProviderIds.length > 0
  });

  const updateProfileMutation = useOptimisticMutation({
    mutationFn: () => auth.updateMe(formData),
    queryKeys: [],
    onSuccess: () => {
      toast.success('Profile updated');
      setEditMode(false);
      auth.me().then(setUser);
    },
    optimisticData: () => ({ ...user, ...formData }),
  });

  const addAddressMutation = useMutation({
    mutationFn: async () => {
      if (!newAddress.street || !newAddress.city) throw new Error('Fill in all fields');
      await db.Address.create({ customer_email: user.email, ...newAddress });
    },
    onSuccess: () => { toast.success('Address added'); setNewAddress({ label: 'Home', street: '', city: '', postal_code: '' }); setOpenAddAddress(false); refetchAddresses(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => db.Address.delete(id),
    onSuccess: () => { toast.success('Address deleted'); refetchAddresses(); },
  });

  const removeSavedProvider = useMutation({
    mutationFn: async (providerId) => {
      const updated = (user?.saved_providers || []).filter(id => id !== providerId);
      await auth.updateMe({ saved_providers: updated });
    },
    onSuccess: () => { toast.success('Removed from saved'); queryClient.invalidateQueries({ queryKey: ['saved-providers-ids'] }); auth.me().then(setUser); }
  });

  const handleLangChange = async (code) => {
    setSelectedLang(code);
    const lang = LANGUAGES.find(l => l.code === code);
    document.documentElement.setAttribute('dir', lang?.dir || 'ltr');
    document.documentElement.setAttribute('lang', code);
    await auth.updateMe({ preferred_language: code });
    toast.success(`Language: ${lang?.label}`);
  };

  const sectionStyle = { background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '24px' };
  const fieldStyle = { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: L.bg2, border: `1px solid ${L.border}` };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: L.bg, padding: '48px 32px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}><Skeleton className="h-96 rounded-2xl" /></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: L.bg, color: L.text, padding: '48px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: L.bg3, border: `1px solid ${L.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: L.text, flexShrink: 0 }}>
            {user.full_name?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 22, marginBottom: 4, letterSpacing: '-0.5px', color: L.text }}>{user.full_name}</h1>
            <p style={{ fontSize: 13, color: L.text3 }}>{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 100, marginBottom: 28, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: '8px 16px', borderRadius: 100, border: 'none', background: activeTab === t ? L.text : 'transparent', color: activeTab === t ? '#fff' : L.text2, fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: L.text }}>Personal Information</h3>
              {!editMode && (
                <button onClick={() => setEditMode(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, background: L.bg2, border: `1px solid ${L.border}`, color: L.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Email', value: user.email, icon: Mail },
                { label: 'Full Name', value: user.full_name, icon: null },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <label style={{ fontSize: 12, color: L.text3, display: 'block', marginBottom: 6 }}>{label}</label>
                  <div style={fieldStyle}>
                    {Icon && <Icon size={14} style={{ color: L.accent }} />}
                    <span style={{ fontSize: 14, color: L.text }}>{value}</span>
                  </div>
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: L.text3, display: 'block', marginBottom: 6 }}>Phone Number</label>
                {editMode ? (
                  <input type="tel" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" style={INPUT_STYLE} />
                ) : (
                  <div style={fieldStyle}>
                    <Phone size={14} style={{ color: L.accent }} />
                    <span style={{ fontSize: 14, color: formData.phone ? L.text : L.text3 }}>{formData.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>
            {editMode && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  <Save size={14} /> {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditMode(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: 100, background: L.bg2, border: `1px solid ${L.border}`, color: L.text2, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Addresses tab */}
        {activeTab === 'addresses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {addressesLoading ? <Skeleton className="h-28 rounded-2xl" /> : addresses.map(addr => (
              <div key={addr.id} style={{ ...sectionStyle, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: L.text }}>{addr.label}</span>
                    {addr.is_default && <span style={{ padding: '2px 10px', borderRadius: 100, background: `${L.accent}15`, color: L.accent, fontSize: 11, fontWeight: 700 }}>Default</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, color: L.text2, fontSize: 13 }}>
                    <MapPin size={13} style={{ color: L.accent, marginTop: 1 }} />
                    <span>{addr.street}, {addr.city}{addr.postal_code ? ` ${addr.postal_code}` : ''}</span>
                  </div>
                </div>
                <button onClick={() => deleteAddressMutation.mutate(addr.id)}
                  style={{ background: `${L.accent}10`, border: `1px solid ${L.accent}25`, borderRadius: 10, padding: '7px', color: L.accent, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {addresses.length === 0 && !addressesLoading && (
              <div style={{ textAlign: 'center', padding: '40px', color: L.text2, background: L.bg2, borderRadius: 20, border: `1px solid ${L.border}` }}>No saved addresses</div>
            )}
            <Dialog open={openAddAddress} onOpenChange={setOpenAddAddress}>
              <DialogTrigger asChild>
                <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  <Plus size={16} /> Add New Address
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Address</DialogTitle></DialogHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, color: L.text2, display: 'block', marginBottom: 6 }}>Label</label>
                    <select value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
                      <option>Home</option><option>Work</option><option>Other</option>
                    </select>
                  </div>
                  {[{ k: 'street', l: 'Street Address' }, { k: 'city', l: 'City' }, { k: 'postal_code', l: 'Postal Code' }].map(({ k, l }) => (
                    <div key={k}>
                      <label style={{ fontSize: 13, color: L.text2, display: 'block', marginBottom: 6 }}>{l}</label>
                      <input placeholder={l} value={newAddress[k]} onChange={e => setNewAddress({ ...newAddress, [k]: e.target.value })} style={INPUT_STYLE} />
                    </div>
                  ))}
                  <button onClick={() => addAddressMutation.mutate()} disabled={addAddressMutation.isPending}
                    style={{ padding: '12px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 4 }}>
                    {addAddressMutation.isPending ? 'Adding...' : 'Add Address'}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Saved providers */}
        {activeTab === 'saved' && (
          savedProviders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {savedProviders.map(prov => (
                <div key={prov.id} style={{ ...sectionStyle, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: L.bg3, border: `1px solid ${L.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: L.text, flexShrink: 0 }}>
                    {prov.business_name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: L.text }}>{prov.business_name}</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: L.text3 }}>
                      {prov.rating > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} style={{ color: '#F59E0B', fill: '#F59E0B' }} />{prov.rating?.toFixed(1)}</span>}
                      {prov.location && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{prov.location}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={createPageUrl(`ProviderProfile?id=${prov.id}`)}>
                      <button style={{ padding: '7px 14px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>View</button>
                    </Link>
                    <button onClick={() => removeSavedProvider.mutate(prov.id)}
                      style={{ padding: '7px', borderRadius: 10, background: `${L.accent}10`, border: `1px solid ${L.accent}25`, color: L.accent, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20 }}>
              <Heart size={40} style={{ color: L.border2, margin: '0 auto 14px' }} />
              <p style={{ color: L.text2, marginBottom: 16 }}>No saved providers yet</p>
              <Link to={createPageUrl('Browse')}>
                <button style={{ padding: '10px 22px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Browse Providers</button>
              </Link>
            </div>
          )
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(review => (
                <div key={review.id} style={sectionStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} style={{ color: s <= review.rating ? '#F59E0B' : L.border2, fill: s <= review.rating ? '#F59E0B' : 'transparent' }} />)}
                    </div>
                    <span style={{ fontSize: 12, color: L.text3 }}>{new Date(review.created_date).toLocaleDateString()}</span>
                  </div>
                  {review.comment && <p style={{ fontSize: 14, color: L.text2, lineHeight: 1.6, fontWeight: 300 }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20 }}>
              <Star size={40} style={{ color: L.border2, margin: '0 auto 14px' }} />
              <p style={{ color: L.text2 }}>No reviews yet</p>
            </div>
          )
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Globe size={16} style={{ color: L.accent }} />
                <h3 style={{ fontWeight: 700, fontSize: 15, color: L.text }}>Language & Region</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => handleLangChange(lang.code)}
                    style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${selectedLang === lang.code ? L.accent : L.border}`, background: selectedLang === lang.code ? `${L.accent}10` : 'transparent', color: selectedLang === lang.code ? L.accent : L.text2, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Bell size={16} style={{ color: L.accent }} />
                <h3 style={{ fontWeight: 700, fontSize: 15, color: L.text }}>Notifications</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { k: 'email', l: 'Email Notifications', d: 'Booking updates, confirmations' },
                  { k: 'push', l: 'Push Notifications', d: 'Real-time alerts on your device' },
                  { k: 'sms', l: 'SMS Notifications', d: 'Text messages for critical updates' },
                ].map(({ k, l, d }) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: L.text }}>{l}</p>
                      <p style={{ fontSize: 12, color: L.text3 }}>{d}</p>
                    </div>
                    <Switch checked={notifications[k]} onCheckedChange={v => setNotifications(p => ({ ...p, [k]: v }))} />
                  </div>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Shield size={16} style={{ color: L.accent }} />
                <h3 style={{ fontWeight: 700, fontSize: 15, color: L.text }}>Account</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => auth.logout()}
                  style={{ width: '100%', padding: '11px', borderRadius: 100, background: `${L.accent}10`, border: `1px solid ${L.accent}25`, color: L.accent, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Sign Out
                </button>
                <button onClick={() => setShowDeleteConfirm(true)}
                  style={{ width: '100%', padding: '11px', borderRadius: 100, background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent style={{ background: L.bg2, borderColor: L.border }}>
          <DialogHeader>
            <DialogTitle style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
              <AlertTriangle size={20} /> Delete Account
            </DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 12, borderRadius: 12, background: '#fee2e2', border: '1px solid #fca5a5' }}>
              <p style={{ color: '#b91c1c', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Warning: This action cannot be undone</p>
              <p style={{ color: '#991b1b', fontSize: 13, lineHeight: 1.5 }}>
                Deleting your account will permanently remove all your personal data, addresses, saved providers, and order history from our system.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteLoading}
                style={{ flex: 1, padding: '11px', borderRadius: 100, background: L.bg2, border: `1px solid ${L.border}`, color: L.text2, fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: deleteLoading ? 0.5 : 1 }}>
                Cancel
              </button>
              <button onClick={async () => {
                setDeleteLoading(true);
                try {
                  await callFunction('deleteUserAccount', {});
                  auth.logout();
                } catch (err) {
                  alert('Error deleting account: ' + err.message);
                  setDeleteLoading(false);
                }
              }} disabled={deleteLoading}
                style={{ flex: 1, padding: '11px', borderRadius: 100, background: '#dc2626', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: deleteLoading ? 0.7 : 1 }}>
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
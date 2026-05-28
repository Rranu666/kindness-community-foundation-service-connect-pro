import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Tag, Wallet, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import { db, auth, invokeLLM, uploadFile, callFunction } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import TipSelector from '@/components/tips/TipSelector';
import StripePaymentForm from './StripePaymentForm';
import BookingCalendarGrid from './BookingCalendarGrid';
import { THEME as L } from '@/lib/theme';

const COMMISSION_RATE = 10;
const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'card',   label: 'Card',   icon: CreditCard },
  { id: 'cash',   label: 'Cash',   icon: Banknote },
  { id: 'upi',    label: 'UPI',    icon: CreditCard },
];
const ALL_TIME_SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

export default function BookingModal({ open, onClose, service, provider }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(null);
  const [tip, setTip] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showCalendarGrid, setShowCalendarGrid] = useState(false);
  const [formData, setFormData] = useState({ customer_name: '', customer_email: '', customer_phone: '', scheduled_time: '', address: '', notes: '' });
  const debounceTimer = useRef(null);

  const { data: existingOrders = [] } = useQuery({
    queryKey: ['provider-orders-availability', provider?.id],
    queryFn: () => db.Order.filter({ provider_id: provider.id }),
    enabled: open && !!provider?.id,
    staleTime: 30 * 1000,
  });

  const bookedSlotsMap = useMemo(() => {
    const map = {};
    existingOrders.filter(o => ['pending','confirmed','in_progress'].includes(o.status) && o.scheduled_date && o.scheduled_time)
      .forEach(o => { if (!map[o.scheduled_date]) map[o.scheduled_date] = new Set(); map[o.scheduled_date].add(o.scheduled_time); });
    return map;
  }, [existingOrders]);

  const isDateFullyBooked = (d) => { const key = format(d, 'yyyy-MM-dd'); const b = bookedSlotsMap[key]; return b && b.size >= ALL_TIME_SLOTS.length; };

  const availableSlots = useMemo(() => {
    if (!date) return ALL_TIME_SLOTS.map(slot => ({ slot, available: true }));
    const key = format(date, 'yyyy-MM-dd');
    const booked = bookedSlotsMap[key] || new Set();
    return ALL_TIME_SLOTS.map(slot => ({ slot, available: !booked.has(slot) }));
  }, [date, bookedSlotsMap]);

  useEffect(() => {
    auth.me().then(user => {
      if (user) setFormData(prev => ({ ...prev, customer_name: user.full_name || '', customer_email: user.email || '', customer_phone: user.phone || '' }));
    }).catch(() => {});
  }, [open]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    if (formData.address && formData.address.trim()) {
      debounceTimer.current = setTimeout(async () => {
        try {
          const configs = await db.TaxConfig.filter({ is_active: true });
          const match = configs.find(c => formData.address.toLowerCase().includes(c.city.toLowerCase()));
          setTaxRate(match?.tax_rate || 0);
        } catch { setTaxRate(0); }
      }, 1000);
    } else {
      setTaxRate(0);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [formData.address]);

  const subtotal = service?.price || 0;
  const commissionAmount = (subtotal * COMMISSION_RATE) / 100;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = Math.max(0, subtotal + commissionAmount + taxAmount + tip - promoDiscount);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const promos = await db.Promotion.filter({ code: promoCode.trim().toUpperCase(), is_active: true });
      const promo = promos[0];
      if (!promo) { toast.error('Invalid promo code'); setPromoLoading(false); return; }
      if (promo.valid_until && new Date(promo.valid_until) < new Date()) { toast.error('Promo code expired'); setPromoLoading(false); return; }
      if (promo.min_order_value && subtotal < promo.min_order_value) { toast.error(`Minimum order $${promo.min_order_value}`); setPromoLoading(false); return; }
      if (promo.usage_limit && promo.current_usage >= promo.usage_limit) { toast.error('Promo code limit reached'); setPromoLoading(false); return; }
      let discount = promo.discount_type === 'percentage' ? Math.min((subtotal * promo.discount_value) / 100, promo.max_discount || Infinity) : promo.discount_value;
      setPromoDiscount(discount); setPromoApplied(promo);
      toast.success(`Saved $${discount.toFixed(2)}!`);
    } catch (error) { toast.error(error?.message || 'Failed to apply promo'); }
    finally { setPromoLoading(false); }
  };

  const removePromo = () => { setPromoCode(''); setPromoDiscount(0); setPromoApplied(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !formData.scheduled_time) { toast.error('Please select date and time'); return; }
    if (!formData.customer_email || !formData.customer_name) { toast.error('Name and email are required'); return; }
    if (!formData.address?.trim()) { toast.error('Service address is required'); return; }
    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      if (promoApplied) await db.Promotion.update(promoApplied.id, { current_usage: (promoApplied.current_usage || 0) + 1 });
      const order = await db.Order.create({
        order_number: orderNumber, customer_name: formData.customer_name, customer_email: formData.customer_email,
        customer_phone: formData.customer_phone, provider_id: provider.id, service_id: service.id,
        service_name: service.name, provider_name: provider.business_name, scheduled_date: format(date, 'yyyy-MM-dd'),
        scheduled_time: formData.scheduled_time, address: formData.address, notes: formData.notes,
        subtotal, commission_rate: COMMISSION_RATE, commission_amount: commissionAmount,
        tax_rate: taxRate, tax_amount: taxAmount, tip_amount: tip, total_amount: totalAmount,
        status: 'pending', payment_status: 'pending', payment_method: paymentMethod
      });
      setOrderId(order.id);
      if (paymentMethod === 'card') { setShowPaymentForm(true); return; }
      const paymentResponse = await callFunction('processBookingPayment', { orderId: order.id, totalAmount, paymentMethod });
      if (paymentResponse.data.success) {
        await Promise.all([
          db.Notification.create({ recipient_email: formData.customer_email, recipient_type: 'customer', type: 'booking_confirmed', title: 'Booking Confirmed', message: `Your booking for ${service.name} has been confirmed. Order #${orderNumber}`, order_id: order.id, channels: ['email'] }),
          db.Notification.create({ recipient_email: provider.email, recipient_type: 'provider', type: 'booking_confirmed', title: 'New Booking', message: `New booking from ${formData.customer_name} for ${service.name}. Order #${orderNumber}`, order_id: order.id, channels: ['email'] })
        ]);
        toast.success(paymentResponse.data.message);
        onClose();
      }
    } catch (error) { toast.error(error?.message || 'Booking failed'); }
    finally { setLoading(false); }
  };

  const handlePaymentSuccess = async () => {
    try {
      const order = await db.Order.get(orderId);
      await Promise.all([
        db.Notification.create({ recipient_email: formData.customer_email, recipient_type: 'customer', type: 'booking_confirmed', title: 'Booking Confirmed', message: `Your booking for ${service.name} has been confirmed. Order #${order.order_number}`, order_id: orderId, channels: ['email'] }),
        db.Notification.create({ recipient_email: provider.email, recipient_type: 'provider', type: 'booking_confirmed', title: 'New Booking', message: `New booking from ${formData.customer_name} for ${service.name}. Order #${order.order_number}`, order_id: orderId, channels: ['email'] })
      ]);
      onClose();
    } catch { toast.error('Error finalizing booking'); }
  };

  const inputStyle = { background: L.bg2, borderColor: L.border, color: L.text };
  const fieldBorder = `1px solid ${L.border}`;

  if (showPaymentForm && orderId) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Complete Payment</DialogTitle></DialogHeader>
          <StripePaymentForm amount={totalAmount} orderId={orderId} paymentMethod={paymentMethod} onSuccess={handlePaymentSuccess} onError={() => setShowPaymentForm(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Book Service</DialogTitle></DialogHeader>

        <div style={{ background: `${L.accent}08`, border: `1px solid ${L.accent}20`, borderRadius: 12, padding: '14px 16px', marginBottom: 4 }}>
          <h3 style={{ fontWeight: 700, color: L.text, marginBottom: 2 }}>{service?.name}</h3>
          <p style={{ fontSize: 13, color: L.text2 }}>{provider?.business_name} · ${service?.price}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Full Name *</Label>
              <Input required value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} placeholder="John Doe" style={inputStyle} className="mt-1" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" required value={formData.customer_email} onChange={e => setFormData({...formData, customer_email: e.target.value})} placeholder="john@example.com" style={inputStyle} className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} placeholder="+1 234 567 890" style={inputStyle} className="mt-1" />
            </div>
          </div>

          {/* Calendar toggle */}
          <div>
            <button type="button" onClick={() => setShowCalendarGrid(!showCalendarGrid)}
              style={{ fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 100, background: showCalendarGrid ? L.text : L.bg2, color: showCalendarGrid ? '#fff' : L.text2, border: `1px solid ${showCalendarGrid ? L.text : L.border}`, cursor: 'pointer', marginBottom: 12 }}>
              📅 Calendar View
            </button>
            {showCalendarGrid ? (
              <div style={{ padding: 16, borderRadius: 14, background: L.bg2, border: fieldBorder }}>
                <BookingCalendarGrid selectedDate={date} onSelectSlot={(d, time) => { setDate(d); setFormData(prev => ({ ...prev, scheduled_time: time })); }} bookedSlotsMap={bookedSlotsMap} provider={provider} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal mt-1" style={{ background: L.bg2, borderColor: L.border }}>
                        <CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={d => { setDate(d); setFormData(prev => ({ ...prev, scheduled_time: '' })); }}
                        disabled={d => { const t = new Date(); t.setHours(0,0,0,0); return d < t || isDateFullyBooked(d); }}
                        modifiers={{ fullyBooked: d => isDateFullyBooked(d) }}
                        modifiersStyles={{ fullyBooked: { textDecoration: 'line-through', opacity: 0.4 } }} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Time *</Label>
                  <Select value={formData.scheduled_time} onValueChange={v => setFormData({...formData, scheduled_time: v})}>
                    <SelectTrigger className="mt-1" style={{ background: L.bg2, borderColor: L.border }}><SelectValue placeholder="Select time" /></SelectTrigger>
                    <SelectContent>
                      {availableSlots.map(({ slot, available }) => (
                        <SelectItem key={slot} value={slot} disabled={!available} style={{ opacity: available ? 1 : 0.4 }}>
                          {slot}{!available ? ' — Booked' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Service Address *</Label>
            <Textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Enter your complete address" rows={2} style={inputStyle} className="mt-1" />
          </div>
          <div>
            <Label>Special Instructions</Label>
            <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any special requirements?" rows={2} style={inputStyle} className="mt-1" />
          </div>

          {/* Promo Code */}
          <div>
            <Label>Promo Code</Label>
            {promoApplied ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', marginTop: 6 }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span style={{ color: '#059669', fontSize: 13, fontWeight: 600, flex: 1 }}>{promoApplied.code} — saved ${promoDiscount.toFixed(2)}</span>
                <Button type="button" size="sm" variant="ghost" onClick={removePromo} className="text-red-500 h-6 px-2">Remove</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Tag style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: L.text3 }} size={15} />
                  <Input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter promo code" style={{ ...inputStyle, paddingLeft: 34 }} />
                </div>
                <Button type="button" onClick={applyPromoCode} disabled={promoLoading || !promoCode.trim()} variant="outline">
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </Button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <Label className="mb-2 block">Payment Method</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 12, border: `1px solid ${paymentMethod === id ? L.accent : L.border}`, background: paymentMethod === id ? `${L.accent}10` : L.bg2, color: paymentMethod === id ? L.accent : L.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <Icon size={18} />{label}
                </button>
              ))}
            </div>
          </div>

          <TipSelector amount={tip} onTipChange={setTip} serviceTotal={subtotal} />

          {/* Summary */}
          <div style={{ background: L.bg2, border: fieldBorder, borderRadius: 14, padding: 16 }} className="space-y-2">
            {[
              { label: `Service Cost`, val: `$${subtotal.toFixed(2)}` },
              { label: `Platform Fee (${COMMISSION_RATE}%)`, val: `$${commissionAmount.toFixed(2)}` },
              taxRate > 0 && { label: `Tax (${taxRate}%)`, val: `$${taxAmount.toFixed(2)}` },
              tip > 0 && { label: 'Tip', val: `$${tip.toFixed(2)}` },
              promoDiscount > 0 && { label: 'Promo Discount', val: `-$${promoDiscount.toFixed(2)}`, green: true },
            ].filter(Boolean).map(({ label, val, green }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: green ? '#059669' : L.text2 }}>
                <span>{label}</span><span style={{ fontWeight: 600, color: green ? '#059669' : L.text }}>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: fieldBorder }}>
              <span style={{ fontWeight: 700, color: L.text }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: L.accent }}>${totalAmount.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: 11, textAlign: 'center', color: L.text3 }}>Paying via <span style={{ textTransform: 'capitalize', fontWeight: 600, color: L.text }}>{paymentMethod}</span></p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 hover:bg-slate-700 text-white">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : 'Confirm Booking'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
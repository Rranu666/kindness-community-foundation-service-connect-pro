import React, { useState, useEffect, useRef } from 'react';
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
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import TipSelector from '@/components/tips/TipSelector';

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const COMMISSION_RATE = 10;

const PAYMENT_METHODS = [
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'upi', label: 'UPI', icon: CreditCard },
];

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
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    scheduled_time: '',
    address: '',
    notes: ''
  });

  // Pre-fill from logged-in user
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user) {
        setFormData(prev => ({
          ...prev,
          customer_name: user.full_name || '',
          customer_email: user.email || '',
          customer_phone: user.phone || ''
        }));
      }
    }).catch(() => {});
  }, [open]);

  // Fetch tax rate based on location (debounced)
  const debounceTimer = useRef(null);
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    if (formData.address) {
      debounceTimer.current = setTimeout(async () => {
        const configs = await base44.entities.TaxConfig.filter({ is_active: true });
        const matchingConfig = configs.find(c => formData.address.toLowerCase().includes(c.city.toLowerCase()));
        setTaxRate(matchingConfig?.tax_rate || 0);
      }, 500);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [formData.address]);

  const subtotal = service?.price || 0;
  const commissionAmount = (subtotal * COMMISSION_RATE) / 100;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalBeforeDiscount = subtotal + commissionAmount + taxAmount + tip;
  const totalAmount = Math.max(0, totalBeforeDiscount - promoDiscount);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const promos = await base44.entities.Promotion.filter({ code: promoCode.trim().toUpperCase(), is_active: true });
      const promo = promos[0];
      if (!promo) {
        toast.error('Invalid promo code');
        setPromoLoading(false);
        return;
      }
      const now = new Date();
      if (promo.valid_until && new Date(promo.valid_until) < now) {
        toast.error('Promo code has expired');
        setPromoLoading(false);
        return;
      }
      if (promo.min_order_value && subtotal < promo.min_order_value) {
        toast.error(`Minimum order value $${promo.min_order_value} required`);
        setPromoLoading(false);
        return;
      }
      let discount = 0;
      if (promo.discount_type === 'percentage') {
        discount = (subtotal * promo.discount_value) / 100;
        if (promo.max_discount) discount = Math.min(discount, promo.max_discount);
      } else {
        discount = promo.discount_value;
      }
      setPromoDiscount(discount);
      setPromoApplied(promo);
      toast.success(`Promo applied! You saved $${discount.toFixed(2)}`);
    } catch {
      toast.error('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setPromoDiscount(0);
    setPromoApplied(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !formData.scheduled_time) {
      toast.error('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      const orderData = {
        order_number: orderNumber,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        provider_id: provider.id,
        service_id: service.id,
        service_name: service.name,
        provider_name: provider.business_name,
        scheduled_date: format(date, 'yyyy-MM-dd'),
        scheduled_time: formData.scheduled_time,
        address: formData.address,
        notes: formData.notes,
        subtotal: subtotal,
        commission_rate: COMMISSION_RATE,
        commission_amount: commissionAmount,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        tip_amount: tip,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
        payment_method: paymentMethod
      };

      // If paying by wallet, deduct balance
      if (paymentMethod === 'wallet') {
        const wallets = await base44.entities.Wallet.filter({ customer_email: formData.customer_email });
        const wallet = wallets[0];
        if (!wallet || wallet.balance < totalAmount) {
          toast.error('Insufficient wallet balance');
          setLoading(false);
          return;
        }
        await base44.entities.Wallet.update(wallet.id, {
          balance: wallet.balance - totalAmount,
          total_spent: (wallet.total_spent || 0) + totalAmount
        });
        await base44.entities.Transaction.create({
          customer_email: formData.customer_email,
          type: 'debit',
          amount: totalAmount,
          payment_method: 'wallet',
          description: `Payment for ${service.name}`
        });
      }

      // Update promo usage
      if (promoApplied) {
        await base44.entities.Promotion.update(promoApplied.id, {
          current_usage: (promoApplied.current_usage || 0) + 1
        });
      }

      const order = await base44.entities.Order.create(orderData);

      await Promise.all([
        base44.entities.Notification.create({
          recipient_email: formData.customer_email,
          recipient_type: 'customer',
          type: 'booking_confirmed',
          title: 'Booking Confirmed',
          message: `Your booking for ${service.name} with ${provider.business_name} has been confirmed. Order #${orderNumber}`,
          order_id: order.id,
          channels: ['email']
        }),
        base44.entities.Notification.create({
          recipient_email: provider.email,
          recipient_type: 'provider',
          type: 'booking_confirmed',
          title: 'New Booking',
          message: `You have a new booking from ${formData.customer_name} for ${service.name}. Order #${orderNumber}`,
          order_id: order.id,
          channels: ['email']
        })
      ]);

      toast.success('Booking confirmed!');
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.3)' }}>
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Book Service</DialogTitle>
        </DialogHeader>

        <div style={{ background: 'rgba(232,53,109,0.1)', borderColor: 'rgba(232,53,109,0.2)' }} className="rounded-xl p-4 mb-2 border">
          <h3 className="font-semibold text-white">{service?.name}</h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{provider?.business_name} · ${service?.price}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-white/70 text-sm">Full Name *</Label>
              <Input required value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                placeholder="John Doe"
                style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                className="placeholder:text-gray-500" />
            </div>
            <div>
              <Label className="text-white/70 text-sm">Email *</Label>
              <Input type="email" required value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                placeholder="john@example.com"
                style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                className="placeholder:text-gray-500" />
            </div>
            <div>
              <Label className="text-white/70 text-sm">Phone</Label>
              <Input value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                placeholder="+1 234 567 890"
                style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                className="placeholder:text-gray-500" />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/70 text-sm">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal text-white"
                    style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: date ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate}
                    disabled={(d) => d < new Date()} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-white/70 text-sm">Time *</Label>
              <Select value={formData.scheduled_time}
                onValueChange={(value) => setFormData({...formData, scheduled_time: value})}>
                <SelectTrigger style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label className="text-white/70 text-sm">Service Address *</Label>
            <Textarea required value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Enter your complete address"
              rows={2}
              style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
              className="placeholder:text-gray-500" />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-white/70 text-sm">Special Instructions</Label>
            <Textarea value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any special requirements?"
              rows={2}
              style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
              className="placeholder:text-gray-500" />
          </div>

          {/* Promo Code */}
          <div>
            <Label className="text-white/70 text-sm">Promo Code</Label>
            {promoApplied ? (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-semibold flex-1">{promoApplied.code} — saved ${promoDiscount.toFixed(2)}</span>
                <Button type="button" size="sm" variant="ghost" onClick={removePromo}
                  className="text-red-400 h-6 px-2 hover:bg-red-400/10">Remove</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                  <Input value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="pl-9 placeholder:text-gray-500"
                    style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }} />
                </div>
                <Button type="button" onClick={applyPromoCode} disabled={promoLoading || !promoCode.trim()}
                  style={{ background: 'rgba(232,53,109,0.2)', color: '#e8356d', border: '1px solid rgba(232,53,109,0.3)' }}
                  className="hover:opacity-90 shrink-0">
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </Button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-white/70 text-sm mb-2 block">Payment Method</Label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button"
                  onClick={() => setPaymentMethod(id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-sm font-medium"
                  style={{
                    background: paymentMethod === id ? 'rgba(232,53,109,0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: paymentMethod === id ? '#e8356d' : 'rgba(255,255,255,0.1)',
                    color: paymentMethod === id ? '#e8356d' : 'rgba(255,255,255,0.6)'
                  }}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tip */}
          <TipSelector amount={tip} onTipChange={setTip} serviceTotal={subtotal} />

          {/* Price Summary */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Service Cost</span>
              <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Platform Fee ({COMMISSION_RATE}%)</span>
              <span className="text-white font-medium">${commissionAmount.toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Tax ({taxRate}%)</span>
                <span className="text-white font-medium">${taxAmount.toFixed(2)}</span>
              </div>
            )}
            {tip > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Tip</span>
                <span className="text-white font-medium">${tip.toFixed(2)}</span>
              </div>
            )}
            {promoDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Promo Discount</span>
                <span className="text-green-400 font-medium">-${promoDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className="font-semibold text-white">Total</span>
              <span className="font-bold text-lg" style={{ color: '#e8356d' }}>${totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-center pt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Paying via <span className="capitalize font-medium" style={{ color: '#e8356d' }}>{paymentMethod}</span>
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-white" style={{ background: '#e8356d' }}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
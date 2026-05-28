import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2, Clock, AlertCircle, Calendar,
  ChevronRight, MessageSquare, FileText, ArrowRight, Zap, Award, Star, TrendingUp, Receipt
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import VerifyRateModal from '@/components/reviews/VerifyRateModal';
import SmartEmptyState from '@/components/ui/SmartEmptyState';
import { SkeletonCard, SkeletonLine } from '@/components/ui/PageLoader';
import { track, EVENTS } from '@/lib/analytics';
import InvoicesSection from '@/components/dashboard/InvoicesSection';

const G = {
  bg: '#080A12', bg2: '#0D1020', bg3: '#111527',
  surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
  cyan: '#4CC9F0',
};

const PINK = G.rose;
const CYAN = G.cyan;

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  confirmed: { label: 'Confirmed', color: CYAN, bgColor: 'rgba(0,212,255,0.1)' },
  in_progress: { label: 'In Progress', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },
  completed: { label: 'Completed', color: '#06b6d4', bgColor: 'rgba(6,182,212,0.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Awaiting Payment', color: '#f59e0b' },
  paid: { label: 'Paid', color: '#10b981' },
  refunded: { label: 'Refunded', color: '#06b6d4' },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: () => db.Order.filter({ customer_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers-dashboard'],
    queryFn: () => db.ServiceProvider.list(),
    staleTime: 5 * 60 * 1000,
  });

  const activeProjects = orders.filter(o => ['confirmed', 'in_progress'].includes(o.status));
  const completedProjects = orders.filter(o => o.status === 'completed');
  const allProjects = orders.filter(o => !['cancelled'].includes(o.status));

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p.id === providerId);
    return provider?.business_name || 'AI Service Provider';
  };

  const getProjectProgress = (order) => {
    if (order.status === 'completed') return 100;
    if (order.status === 'in_progress') return 65;
    if (order.status === 'confirmed') return 30;
    return 0;
  };

  const getMilestones = (order) => {
    return [
      { label: 'Booking Confirmed', done: ['confirmed', 'in_progress', 'completed'].includes(order.status), date: order.created_date },
      { label: 'Work Started', done: ['in_progress', 'completed'].includes(order.status), date: order.scheduled_date },
      { label: 'In Progress', done: order.status === 'in_progress' || order.status === 'completed', date: null },
      { label: 'Completed', done: order.status === 'completed', date: null },
    ];
  };

  useEffect(() => {
    track(EVENTS.PAGE_VIEW, { page: 'Dashboard' });
  }, []);

  if (!user) {
    return (
      <div style={{ background: G.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <SmartEmptyState
          icon={AlertCircle}
          title="Sign in required"
          body="You need to be signed in to view your dashboard."
          color={G.rose}
          cta={{ label: 'Sign In', onClick: () => { track(EVENTS.SIGN_IN_CLICKED); auth.redirectToLogin(); } }}
        />
      </div>
    );
  }

  return (
    <div style={{ background: G.bg, minHeight: '100vh', color: G.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── HEADER ── */}
      <section style={{ background: `linear-gradient(135deg, ${G.bg} 0%, ${G.bg2} 60%, ${G.bg} 100%)`, borderBottom: `1px solid ${G.border}` }} className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16, background: `${G.amber}12`, border: `1px solid ${G.amber}28`, borderRadius: 100, padding: '5px 14px' }}>
            <TrendingUp size={12} style={{ color: G.amber }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: G.amber, letterSpacing: '0.1em', textTransform: 'uppercase' }}>My Dashboard</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.1 }}>
            Welcome back,{' '}
            <span style={{ background: G.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {user.full_name?.split(' ')[0] || user.email.split('@')[0]}
            </span>
          </h1>
          <p style={{ fontSize: 15, color: G.muted }}>Track your active bookings and service history</p>
        </div>
      </section>

      {/* ── STATS CARDS ── */}
      <section style={{ background: G.bg }} className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Bookings', value: activeProjects.length, icon: Zap, color: G.green },
              { label: 'Completed', value: completedProjects.length, icon: CheckCircle2, color: G.cyan },
              { label: 'Total Spent', value: `$${allProjects.reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString()}`, icon: Award, color: G.rose },
              { label: 'Total Orders', value: orders.length, icon: Clock, color: G.amber },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 20, padding: '20px', backdropFilter: 'blur(12px)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: G.faint, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</p>
                      <p style={{ fontSize: 32, fontWeight: 900, color: stat.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{stat.value}</p>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${stat.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} style={{ color: stat.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ACTIVE PROJECTS ── */}
      <section style={{ background: G.bg }} className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Active Projects</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Your ongoing AI service engagements</p>
            </div>
            <Link to={createPageUrl('Orders')}>
              <Button variant="ghost" className="hover:bg-white/10" style={{ color: PINK }}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Projects List */}
          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 20, padding: 24 }}>
                  <SkeletonLine width="40%" height={18} className="mb-4" />
                  <SkeletonLine width="100%" height={12} className="mb-2" />
                  <SkeletonLine width="70%" height={12} />
                </div>
              ))}
            </div>
          ) : activeProjects.length > 0 ? (
            <div className="space-y-4">
              {activeProjects.map(order => {
                const progress = getProjectProgress(order);
                const milestones = getMilestones(order);
                const statusConfig = STATUS_CONFIG[order.status];
                const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status];
                const isExpanded = expandedProject === order.id;

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl overflow-hidden transition-all duration-300"
                    style={{
                      background: '#140b00',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: isExpanded ? `0 20px 40px rgba(203,60,122,0.15)` : 'none',
                    }}
                  >
                    {/* Main Card */}
                    <div
                      onClick={() => setExpandedProject(isExpanded ? null : order.id)}
                      className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">{order.service_name}</h3>
                          <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">with <strong>{getProviderName(order.provider_id)}</strong></p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: statusConfig.bgColor, color: statusConfig.color }}>
                            {statusConfig.label}
                          </span>
                          <ChevronRight
                            className="w-5 h-5 transition-transform"
                            style={{ color: 'rgba(255,255,255,0.3)', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)' }}
                          />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Project Progress</span>
                          <span className="text-xs font-bold" style={{ color: CYAN }}>{progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ background: `linear-gradient(90deg, ${CYAN}, ${PINK})`, width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-4 h-4" style={{ color: CYAN }} />
                          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {new Date(order.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 rounded-lg" style={{ background: paymentConfig && `${paymentConfig.color}20`, color: paymentConfig?.color }}>
                            {paymentConfig?.label}
                          </span>
                        </div>
                        <div className="text-right text-xs font-bold" style={{ color: PINK }}>
                          ${order.total_amount?.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }} className="p-6">
                        {/* Milestones */}
                        <div className="mb-6">
                          <h4 className="font-bold text-white mb-4">Project Milestones</h4>
                          <div className="space-y-3">
                            {milestones.map((m, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: m.done ? CYAN : 'rgba(255,255,255,0.1)' }}>
                                  {m.done && <CheckCircle2 className="w-4 h-4" style={{ color: '#0f0900' }} />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{m.label}</p>
                                  {m.date && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(m.date).toLocaleDateString()}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>SERVICE DETAILS</p>
                            <div className="space-y-2 text-sm">
                              <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Provider:</span> <span className="font-medium text-white">{getProviderName(order.provider_id)}</span></div>
                              <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Location:</span> <span className="font-medium text-white">{order.address || 'Not specified'}</span></div>
                              <div><span style={{ color: 'rgba(255,255,255,0.5)' }}>Special Notes:</span> <span className="font-medium text-white">{order.notes || 'None'}</span></div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>PRICING BREAKDOWN</p>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span style={{ color: 'rgba(255,255,255,0.5)' }}>Subtotal:</span> <span className="text-white">${order.subtotal?.toFixed(2)}</span></div>
                              {order.tax_amount > 0 && <div className="flex justify-between"><span style={{ color: 'rgba(255,255,255,0.5)' }}>Tax:</span> <span className="text-white">${order.tax_amount?.toFixed(2)}</span></div>}
                              {order.tip_amount > 0 && <div className="flex justify-between"><span style={{ color: 'rgba(255,255,255,0.5)' }}>Tip:</span> <span className="text-white">${order.tip_amount?.toFixed(2)}</span></div>}
                              <div className="flex justify-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}><span className="font-bold text-white">Total:</span> <span className="font-bold" style={{ color: PINK }}>${order.total_amount?.toFixed(2)}</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                            <MessageSquare className="w-4 h-4 mr-2" /> Message Provider
                          </Button>
                          <Button className="flex-1 text-white border-0 rounded-xl" style={{ background: CYAN, color: '#0f0900' }}>
                            <FileText className="w-4 h-4 mr-2" /> View Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <SmartEmptyState
              icon={Zap}
              title="No active bookings"
              body="You don't have any active bookings. Browse verified professionals and book a service to get started."
              color={G.green}
              cta={{ label: 'Browse Services', to: createPageUrl('Browse') }}
            />
          )}
        </div>
      </section>

      {/* ── COMPLETED PROJECTS ── */}
      {completedProjects.length > 0 && (
        <section style={{ background: G.bg2 }} className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-white mb-6">Completed Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedProjects.slice(0, 4).map(order => {
                const provider = providers.find(p => p.id === order.provider_id);
                return (
                  <div key={order.id} style={{ background: G.surface, border: `1px solid ${G.green}25`, borderRadius: 16, padding: 20 }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{order.service_name}</h4>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>by {getProviderName(order.provider_id)}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(order.created_date).toLocaleDateString()}</span>
                      <span className="font-bold" style={{ color: CYAN }}>${order.total_amount?.toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedOrderForRating(order);
                        setRatingModalOpen(true);
                      }}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border-0 rounded-lg text-xs"
                    >
                      <Star className="w-3 h-3 mr-2" /> Verify & Rate
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── INVOICES ── */}
      <section style={{ background: G.bg }} className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${G.rose}15`, border: `1px solid ${G.rose}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={18} style={{ color: G.rose }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">My Invoices</h2>
              <p style={{ color: G.muted, fontSize: 13 }}>Auto-generated after each completed service</p>
            </div>
          </div>
          <InvoicesSection userEmail={user.email} />
        </div>
      </section>

      {/* ── VERIFY & RATE MODAL ── */}
      {selectedOrderForRating && (
        <VerifyRateModal
          open={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedOrderForRating(null);
          }}
          order={selectedOrderForRating}
          provider={providers.find(p => p.id === selectedOrderForRating.provider_id)}
          onSubmitSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
          }}
        />
      )}
    </div>
  );
}
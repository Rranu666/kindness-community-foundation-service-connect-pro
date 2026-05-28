import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { createPageUrl } from '@/utils';
import {
  Search, Briefcase, Shield, Star, CreditCard, ArrowRight, ChevronRight, ChevronLeft, CheckCircle
} from 'lucide-react';

const PINK = '#cb3c7a';

const STEPS = [
  {
    icon: <span style={{ fontSize: 48 }}>👋</span>,
    title: 'Welcome to Service Connect Pro',
    subtitle: 'by Kindness Community Foundation',
    description: 'The trusted marketplace connecting service seekers with skilled local providers. Let\'s get you set up in just a few steps.',
  },
  {
    icon: <Search className="w-12 h-12" style={{ color: PINK }} />,
    title: 'Find Any Service, Fast',
    description: 'Search by category, location, or keyword. Browse verified providers with real reviews and transparent pricing.',
    highlight: 'Plumbing, Cleaning, Tutoring, Design & more',
  },
  {
    icon: <Shield className="w-12 h-12" style={{ color: PINK }} />,
    title: 'Verified & Trusted Providers',
    description: 'Every provider goes through our verification process. Check ratings, reviews, and certifications before booking.',
    highlight: 'Community-verified • Background checked',
  },
  {
    icon: <CreditCard className="w-12 h-12" style={{ color: PINK }} />,
    title: 'Book & Pay Your Way',
    description: 'Instant booking with flexible payment options. Pay online or in person after the job is done — card, UPI, or cash accepted.',
    highlight: 'Pay after service • Multiple payment options',
  },
  {
    icon: <Briefcase className="w-12 h-12" style={{ color: PINK }} />,
    title: 'Are You a Service Provider?',
    description: 'List your services, manage bookings, and grow your client base. Join hundreds of providers already earning on the platform.',
    highlight: 'Free signup • Flexible scheduling',
  },
];

export default function OnboardingModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState(null);

  const isRoleStep = step === STEPS.length;
  const isLast = step === STEPS.length - 1;
  const progress = ((step) / STEPS.length) * 100;

  const handleNext = () => {
    if (isLast) {
      setStep(STEPS.length); // role selection
    } else if (isRoleStep) {
      handleFinish();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleFinish = () => {
    if (selectedRole === 'provider') {
      onClose();
      window.location.href = createPageUrl('ProviderSignup');
    } else {
      onClose();
      if (!selectedRole) {
        auth.redirectToLogin();
      } else {
        auth.redirectToLogin();
      }
    }
  };

  const currentStep = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="p-0 overflow-hidden max-w-md w-full"
        style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.3)', borderRadius: 20 }}
      >
        <DialogTitle className="sr-only">Welcome to Service Connect Pro</DialogTitle>
        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-1 transition-all duration-500"
            style={{ width: `${isRoleStep ? 100 : progress}%`, background: PINK }}
          />
        </div>

        <div className="p-8">
          {!isRoleStep ? (
            /* Feature walkthrough */
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(203,60,122,0.12)', border: '1px solid rgba(203,60,122,0.2)' }}>
                  {currentStep.icon}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{currentStep.title}</h2>
              {currentStep.subtitle && (
                <p className="text-sm mb-3" style={{ color: PINK }}>{currentStep.subtitle}</p>
              )}
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>{currentStep.description}</p>
              {currentStep.highlight && (
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold" style={{ background: 'rgba(203,60,122,0.1)', border: '1px solid rgba(203,60,122,0.25)', color: PINK }}>
                  <CheckCircle className="w-3 h-3" />
                  {currentStep.highlight}
                </div>
              )}

              {/* Step dots */}
              <div className="flex justify-center gap-2 mt-8 mb-6">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === step ? 20 : 8, height: 8,
                      background: i === step ? PINK : 'rgba(255,255,255,0.2)'
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {step > 0 && (
                  <Button variant="ghost" className="flex-1 text-white hover:bg-white/10" onClick={() => setStep(s => s - 1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                )}
                <Button
                  className="flex-1 text-white border-0"
                  style={{ background: PINK }}
                  onClick={handleNext}
                >
                  {isLast ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <button onClick={onClose} className="mt-4 text-xs underline w-full text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Skip intro
              </button>
            </div>
          ) : (
            /* Role selection */
            <div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">How will you use the platform?</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Choose your primary role to get started</p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  className="w-full rounded-2xl p-4 text-left transition-all"
                  style={{
                    background: selectedRole === 'customer' ? 'rgba(203,60,122,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${selectedRole === 'customer' ? PINK : 'rgba(255,255,255,0.1)'}`,
                  }}
                  onClick={() => setSelectedRole('customer')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(203,60,122,0.15)' }}>
                      🔍
                    </div>
                    <div>
                      <div className="font-semibold text-white">I'm a Customer</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Find and book local services</div>
                    </div>
                    {selectedRole === 'customer' && <CheckCircle className="w-5 h-5 ml-auto" style={{ color: PINK }} />}
                  </div>
                </button>

                <button
                  className="w-full rounded-2xl p-4 text-left transition-all"
                  style={{
                    background: selectedRole === 'provider' ? 'rgba(203,60,122,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${selectedRole === 'provider' ? PINK : 'rgba(255,255,255,0.1)'}`,
                  }}
                  onClick={() => setSelectedRole('provider')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(203,60,122,0.15)' }}>
                      🛠️
                    </div>
                    <div>
                      <div className="font-semibold text-white">I'm a Service Provider</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>List services & grow my business</div>
                    </div>
                    {selectedRole === 'provider' && <CheckCircle className="w-5 h-5 ml-auto" style={{ color: PINK }} />}
                  </div>
                </button>
              </div>

              <Button
                className="w-full text-white border-0 h-12 text-base"
                style={{ background: PINK, opacity: selectedRole ? 1 : 0.5 }}
                disabled={!selectedRole}
                onClick={handleFinish}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <button onClick={onClose} className="mt-3 text-xs underline w-full text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Skip for now
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
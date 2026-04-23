import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatAssistant from '@/components/ai/ChatAssistant';

export default function Support() {
  const [selectedContext, setSelectedContext] = useState('general_help');

  const faqs = [
    {
      question: 'How do I book a service?',
      answer: 'Browse services, select a provider, choose your preferred date/time, and complete checkout. You\'ll receive a confirmation immediately.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept credit cards, debit cards, digital wallets, and in-app wallet transfers for your convenience.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel up to 24 hours before the scheduled service. Cancellations within 24 hours may incur a fee.'
    },
    {
      question: 'How do refunds work?',
      answer: 'Refunds are processed within 5-7 business days to your original payment method.'
    },
    {
      question: 'How do I become a service provider?',
      answer: 'Click "Become a Provider" in the menu, fill out your business details, upload documents, and wait for verification.'
    },
    {
      question: 'What are subscription plans?',
      answer: 'Subscription plans offer different commission rates, features, and benefits. Choose based on your business needs.'
    }
  ];

  return (
    <div style={{ background: '#0f0900' }} className="min-h-screen py-6 sm:py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Support Center</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-6 sm:mb-8">We're here to help!</p>

        {/* Contact Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <Card style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
            <CardContent className="pt-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-3" style={{ color: '#f97316' }} />
              <h3 className="text-white font-semibold mb-2">Email Support</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm mb-4">
                contact@kindnesscommunityfoundation.com
              </p>
              <a href="mailto:contact@kindnesscommunityfoundation.com">
                <Button variant="outline" className="text-white border-pink-500/50 hover:bg-pink-500/10" style={{ background: 'transparent' }}>
                  Send Email
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
            <CardContent className="pt-6 text-center">
              <Phone className="w-8 h-8 mx-auto mb-3" style={{ color: '#f97316' }} />
              <h3 className="text-white font-semibold mb-2">Call Us</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm mb-4">
                +1 (555) 123-4567
              </p>
              <Button variant="outline" className="text-white border-pink-500/50 hover:bg-pink-500/10" style={{ background: 'transparent' }}>
                Schedule Call
              </Button>
            </CardContent>
          </Card>

          <Card style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-3" style={{ color: '#f97316' }} />
              <h3 className="text-white font-semibold mb-2">Live Chat</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm mb-4">
                Available Mon-Fri 9am-5pm
              </p>
              <Button className="text-white" style={{ background: '#f97316' }}>
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Sections */}
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-2" style={{ background: 'rgba(249,115,22,0.1)' }}>
            <TabsTrigger value="faq" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-pink-500/20 hover:bg-white/10 hover:text-white">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-pink-500/20 hover:bg-white/10 hover:text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="mt-6">
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <Card key={idx} style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <CardContent className="pt-6">
                    <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <Card style={{ background: '#140b00', border: '1px solid rgba(249,115,22,0.2)' }}>
              <CardHeader>
                <CardTitle className="text-white">AI Support Assistant</CardTitle>
                <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm mt-2">
                  Get instant answers to your questions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">What do you need help with?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { label: 'Booking Help', value: 'booking_help' },
                        { label: 'General Help', value: 'general_help' },
                        { label: 'Provider Help', value: 'provider_help' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedContext(option.value)}
                          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={{
                            background: selectedContext === option.value ? '#f97316' : 'rgba(249,115,22,0.1)',
                            color: selectedContext === option.value ? '#fff' : '#f97316'
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <ChatAssistant context={selectedContext} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
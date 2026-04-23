import React, { useState } from 'react';
import { Shield, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TermsAndPrivacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Terms, Privacy & Legal</h1>
          <p className="text-slate-500">Kindness Community Foundation – Marketplace Platform</p>
        </div>

        <Tabs defaultValue="terms">
          <TabsList className="w-full mb-8">
            <TabsTrigger value="terms" className="flex-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="w-4 h-4 shrink-0" /> <span className="hidden xs:inline sm:inline">Terms &amp; Conditions</span><span className="xs:hidden sm:hidden">Terms</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="w-4 h-4 shrink-0" /> <span className="hidden xs:inline sm:inline">Privacy Policy</span><span className="xs:hidden sm:hidden">Privacy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="terms">
            <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-100 shadow-sm prose prose-slate max-w-none">
              <h2>Terms & Conditions</h2>
              <p className="text-slate-500 text-sm">Last updated: {new Date().toLocaleDateString()}</p>

              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using the Kindness Community Foundation Marketplace ("Platform"), you agree to these Terms & Conditions. If you do not agree, please refrain from using the Platform.</p>

              <h3>2. User Responsibilities</h3>
              <p>All users (service seekers and providers) agree to provide accurate information, behave respectfully, and comply with applicable laws. Misuse of the platform will result in account termination.</p>

              <h3>3. Service Provider Obligations</h3>
              <p>Service providers are responsible for delivering the services they list, maintaining professional standards, and honoring confirmed bookings. Providers must be qualified to offer the services they advertise.</p>

              <h3>4. Platform Commission</h3>
              <p>The Platform charges a commission on each completed transaction to maintain operations and continue serving the community. Commission rates are clearly disclosed at the time of booking.</p>

              <h3>5. Payments & Refunds</h3>
              <p>All payments are processed securely through the Platform. Refund requests must be submitted within 48 hours of service completion. Disputes will be reviewed on a case-by-case basis.</p>

              <h3>6. Limitation of Liability</h3>
              <p>Kindness Community Foundation is a marketplace platform connecting seekers and providers. We are not directly responsible for the quality of services rendered by independent providers. We do, however, take complaints seriously and act on them.</p>

              <h3>7. Changes to Terms</h3>
              <p>We reserve the right to update these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.</p>

              <h3>8. Contact</h3>
              <p>For questions regarding these terms, please visit our Support page.</p>
            </div>
          </TabsContent>

          <TabsContent value="privacy">
            <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-100 shadow-sm prose prose-slate max-w-none">
              <h2>Privacy Policy</h2>
              <p className="text-slate-500 text-sm">Last updated: {new Date().toLocaleDateString()}</p>

              <h3>1. Information We Collect</h3>
              <p>We collect information you provide when registering, booking services, or communicating on the Platform. This includes name, email, phone number, location, and payment details.</p>

              <h3>2. How We Use Your Information</h3>
              <ul>
                <li>To facilitate service bookings and payments</li>
                <li>To verify service provider credentials</li>
                <li>To send important updates and notifications</li>
                <li>To improve our platform experience</li>
              </ul>

              <h3>3. Data Sharing</h3>
              <p>We do not sell your personal data. We share necessary details between seekers and providers only to fulfill bookings. We may share data with payment processors and legal authorities when required.</p>

              <h3>4. Data Security</h3>
              <p>We use industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. We encourage users to use strong passwords.</p>

              <h3>5. Cookies</h3>
              <p>We use cookies to improve your experience on the Platform. You may disable cookies in your browser settings, though this may affect some functionality.</p>

              <h3>6. Your Rights</h3>
              <p>You have the right to access, correct, or delete your personal data. To make a request, please contact us through the Support page.</p>

              <h3>7. Children's Privacy</h3>
              <p>Our Platform is not intended for children under 13. We do not knowingly collect data from minors.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Star, MapPin, Phone, Clock, CheckCircle2, Users, Zap, Shield } from 'lucide-react';
import SeoHelmet from '@/lib/SeoHelmet';
import { THEME as L } from '@/lib/theme';

const cityData = {
  'los-angeles': { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=400&fit=crop' },
  'san-diego': { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, image: 'https://images.unsplash.com/photo-1502581573902-a4a1e23db3f7?w=1200&h=400&fit=crop' },
  'san-francisco': { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop' },
  'orange-county': { name: 'Orange County', state: 'CA', lat: 33.7490, lng: -117.8677, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop' },
  'san-jose': { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&h=400&fit=crop' },
  'sacramento': { name: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=400&fit=crop' },
  'riverside': { name: 'Riverside', state: 'CA', lat: 33.9533, lng: -117.2958, image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=400&fit=crop' },
  'fresno': { name: 'Fresno', state: 'CA', lat: 36.7469, lng: -119.7674, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop' },
};

const serviceContent = {
  plumbing: {
    title: 'Plumbing Services',
    icon: '🔧',
    keywords: 'emergency plumber, pipe repair, water heater, drain cleaning, leak detection',
    description: 'Professional plumbing services including emergency repairs, drain cleaning, water heater installation, pipe repair, and leak detection. Licensed, verified plumbers available 24/7.',
    content: (city) => `
## Professional Plumbing Services in ${city.name}, California

When you need reliable plumbing services in ${city.name}, Service Connect Pro connects you with licensed, background-checked plumbers who deliver quality workmanship every time. Whether it's a burst pipe at midnight or routine maintenance, our verified professionals are ready to help.

### Why Choose Our ${city.name} Plumbers?

Our network of ${city.name} plumbers brings decades of combined experience to every job. Each professional is verified, insured, and committed to transparent pricing—no hidden fees, no surprises. We understand that plumbing emergencies don't wait for business hours, which is why we offer 24/7 emergency plumbing services throughout ${city.name} and surrounding areas.

### Common Plumbing Services in ${city.name}

**Emergency Plumbing Repairs**: Burst pipes, overflowing toilets, gas line issues—we handle urgent plumbing problems fast. Our emergency plumbers in ${city.name} arrive quickly and diagnose the issue accurately, preventing costly water damage to your home.

**Drain Cleaning & Unclogging**: From slow drains to complete blockages, our drain cleaning experts use advanced equipment like hydro-jetting to clear even the toughest clogs safely. Regular drain maintenance prevents future backups and extends your plumbing system's lifespan.

**Water Heater Services**: Whether you need water heater repair, maintenance, or installation of a new tankless or traditional unit, our licensed plumbers in ${city.name} ensure your system operates efficiently, reducing energy bills.

**Leak Detection & Repair**: Hidden leaks waste thousands of gallons annually and damage structures. Our plumbers use modern leak detection technology to pinpoint problems precisely, then repair them properly the first time.

**Pipe Installation & Replacement**: We handle copper, PVC, and modern PEX piping with expert installation and code-compliant workmanship. Whether updating old galvanized pipes or installing new construction plumbing, we've got you covered.

### ${city.name}'s Trusted Plumbing Experts

${city.name} residents depend on Service Connect Pro to connect them with the best local plumbers. Our rigorous vetting process ensures only qualified, honest professionals are on our platform. Each plumber maintains current licensing, carries liability insurance, and undergoes background screening.

### What Makes Us Different

**Upfront Pricing**: Get clear quotes before work begins. No hourly surprises, just honest, transparent billing.

**Verified Professionals**: Every plumber is background-checked and reviewed by real customers from ${city.name}.

**Same-Day Service**: Many jobs completed the same day you request them.

**Money-Back Guarantee**: 100% satisfaction guaranteed, or we'll make it right.

### Service Areas Throughout ${city.name}

We serve all neighborhoods and communities in ${city.name}, including residential homes, apartments, and small businesses. From downtown to outer communities, our plumbers are familiar with local codes and conditions.

### Schedule Your ${city.name} Plumber Today

Don't let plumbing problems disrupt your life. Book a licensed plumber in ${city.name} through Service Connect Pro today. Get instant pricing, choose your preferred professional, and experience hassle-free plumbing service.
    `,
    hero: 'Professional Emergency Plumbers Available 24/7',
    benefits: [
      'Licensed & insured plumbers',
      '24/7 emergency response',
      'Upfront transparent pricing',
      'Same-day service available',
      'Water damage prevention',
      'Drain cleaning expertise',
    ],
  },
  hvac: {
    title: 'HVAC Services',
    icon: '❄️',
    keywords: 'AC repair, furnace repair, HVAC installation, air conditioning service, heating',
    description: 'Expert HVAC services including air conditioning repair, furnace maintenance, system installation, and emergency heating/cooling. Certified technicians available throughout the year.',
    content: (city) => `
## Expert HVAC Services in ${city.name}, California

Your home's heating and cooling comfort is essential, especially in ${city.name}'s variable climate. Service Connect Pro connects you with certified HVAC technicians who provide reliable air conditioning repair, furnace service, and system installations with expertise that keeps your family comfortable year-round.

### Comprehensive HVAC Services for ${city.name}

**Air Conditioning Repair**: Keep your AC running efficiently even during scorching summers. Our certified HVAC technicians diagnose and repair air conditioning problems quickly, restoring comfortable indoor temperatures.

**Furnace & Heating Repair**: Before winter arrives, ensure your heating system works properly. We service gas furnaces, heat pumps, and electric heating systems with expert care and maintenance.

**HVAC System Installation**: Upgrading to a new HVAC system? Our licensed technicians in ${city.name} handle professional installation, ensuring optimal efficiency and longevity from day one.

**Maintenance & Tune-ups**: Regular maintenance prevents expensive breakdowns and extends your system's life. We offer seasonal tune-ups tailored to ${city.name}'s climate.

**Thermostat Upgrades**: Programmable and smart thermostats save energy and money. Our experts install and set up modern thermostat technology for maximum efficiency.

### Why HVAC Service Matters in ${city.name}

${city.name}'s climate demands reliable heating and cooling. Neglected HVAC systems consume excess energy and fail at the worst times. Our certified technicians ensure your system operates at peak efficiency, reducing utility bills while maintaining comfort.

### Certified & Trusted HVAC Professionals

Each HVAC technician on Service Connect Pro is certified, licensed, and trained on the latest heating and cooling technologies. We work on all major brands—Carrier, Lennox, Trane, York, and more.

### Same-Day HVAC Service

Many repairs and maintenance jobs are completed same-day in ${city.name}. Why wait for comfort? Book your HVAC technician and get fast, reliable service.

### Energy Efficiency & Savings

Proper HVAC service reduces energy consumption and lowers monthly utility bills. Our technicians optimize your system for maximum efficiency specific to ${city.name} weather patterns.

### Book Your ${city.name} HVAC Technician

Don't suffer through uncomfortable temperatures. Schedule expert HVAC service in ${city.name} today and enjoy reliable heating and cooling.
    `,
    hero: 'Expert Heating & Cooling for Year-Round Comfort',
    benefits: [
      'Certified HVAC technicians',
      'AC & furnace repair',
      'System installation & upgrade',
      'Energy efficiency optimization',
      'Seasonal maintenance plans',
      'Same-day service available',
    ],
  },
  cleaning: {
    title: 'House Cleaning Services',
    icon: '🧹',
    keywords: 'house cleaning, deep cleaning, carpet cleaning, post-construction cleaning',
    description: 'Professional house cleaning services including deep cleaning, regular maintenance, carpet cleaning, and post-construction cleanup. Trusted cleaners serving your neighborhood.',
    content: (city) => `
## Professional House Cleaning Services in ${city.name}, California

Life is busy, and your home deserves professional care. Service Connect Pro connects you with vetted, reliable house cleaners in ${city.name} who provide thorough cleaning services tailored to your specific needs and schedule.

### Types of Cleaning Services Available

**Regular House Cleaning**: Weekly, bi-weekly, or monthly cleaning service keeps your home spotless. Our cleaners handle dusting, vacuuming, bathrooms, kitchens, and more.

**Deep Cleaning**: For a comprehensive refresh, deep cleaning targets areas often missed—baseboards, behind appliances, inside cabinets, and grout lines. Perfect for spring cleaning or preparing to sell.

**Move-In/Move-Out Cleaning**: Transitioning homes? We provide thorough move-in or move-out cleaning, making sure spaces are pristine.

**Post-Construction Cleaning**: After renovation or construction, our cleaners remove dust, debris, and construction residue, leaving your ${city.name} home completely clean.

**Carpet & Upholstery Cleaning**: Professional carpet cleaning extends life and removes deep stains. We handle delicate upholstery with specialized care.

**Window & Exterior Cleaning**: Sparkling windows enhance curb appeal. We safely clean windows, gutters, and exterior surfaces.

### Why Professional Cleaning in ${city.name}?

${city.name}'s urban and suburban environments collect dust, allergens, and grime faster than many regions. Professional cleaning improves indoor air quality, prolongs your home's condition, and provides peace of mind.

### Trusted Cleaning Professionals

Every cleaner on our platform is background-checked, insured, and reviewed by real ${city.name} customers. We stand behind the quality of every service.

### Eco-Friendly Cleaning Options

Prefer green cleaning solutions? Many of our ${city.name} cleaners offer eco-friendly, non-toxic products that clean effectively while protecting your family and environment.

### Flexible Scheduling

Busy schedule? Our cleaners work around your availability—early morning, evening, or weekend appointments available throughout ${city.name}.

### Transparent, Upfront Pricing

Know the cost before we start. No surprise charges, just honest pricing for quality cleaning service.

### Book Your ${city.name} House Cleaner

Transform your home into a clean, comfortable sanctuary. Schedule professional house cleaning in ${city.name} today and enjoy more free time.
    `,
    hero: 'Professional Cleaning for a Spotless Home',
    benefits: [
      'Regular & deep cleaning',
      'Move-in/move-out service',
      'Eco-friendly options',
      'Carpet & upholstery care',
      'Background-checked cleaners',
      'Flexible scheduling',
    ],
  },
  'emergency-repairs': {
    title: 'Emergency Repair Services',
    icon: '🚨',
    keywords: 'emergency repair, 24/7 service, home repair, urgent repair',
    description: 'Around-the-clock emergency home repair services. Water damage, electrical issues, appliance failures—we handle urgent repairs fast.',
    content: (city) => `
## 24/7 Emergency Home Repair Services in ${city.name}, California

Home emergencies don't wait for business hours. Service Connect Pro provides 24/7 emergency repair services in ${city.name}, connecting you instantly with available professionals who handle urgent home problems immediately.

### Types of Emergency Repairs

**Water Damage & Flooding**: Burst pipes, overflowing washing machines, roof leaks—water damage spreads quickly. Our emergency responders in ${city.name} act fast to stop water flow and prevent structural damage.

**Electrical Emergencies**: Sparking outlets, tripped breakers, or complete power loss require immediate professional attention. Licensed electricians handle electrical emergencies safely.

**Appliance Failures**: When your refrigerator, dishwasher, or washer breaks down unexpectedly, our technicians provide rapid repair or emergency replacement guidance.

**HVAC Emergencies**: No heat in winter or no AC in summer? We get your heating and cooling back online fast.

**Roof & Weather Damage**: Storm damage, missing shingles, or tree damage need urgent repair. Our professionals assess and fix roof damage quickly.

**Door & Window Damage**: Broken locks, shattered glass, or damaged doors compromise security. We provide emergency repair and temporary solutions.

### Why Choose Our Emergency Service?

In ${city.name}, when disaster strikes, you need professionals who respond immediately with expertise. Our network of emergency responders works 24/7/365, ensuring someone is available when you need help most.

### Rapid Response & Assessment

When you call, we dispatch available professionals immediately. Most emergency calls in ${city.name} receive response within 1-2 hours, depending on location and availability.

### Licensed, Insured Professionals

Every emergency responder is licensed, insured, and qualified to handle urgent home issues safely and effectively.

### Temporary & Permanent Solutions

We provide immediate temporary measures to prevent further damage (boarding windows, shutting off water, etc.), then complete permanent repairs.

### Insurance Documentation

We provide detailed documentation and photos for insurance claims, making the process smoother for you.

### Book Emergency Service in ${city.name}

Don't panic during a home emergency. Call Service Connect Pro immediately for 24/7 emergency repair service in ${city.name}.
    `,
    hero: 'Immediate Emergency Response Available 24/7',
    benefits: [
      'Round-the-clock availability',
      '1-2 hour response time',
      'Licensed emergency responders',
      'Water damage prevention',
      'Insurance claim support',
      'Temporary & permanent fixes',
    ],
  },
  'recurring-services': {
    title: 'Recurring Home Services',
    icon: '♻️',
    keywords: 'maintenance plans, recurring service, subscription cleaning, home maintenance',
    description: 'Convenient recurring home service subscriptions for regular maintenance, cleaning, and upkeep. Set it and forget it with trusted professionals.',
    content: (city) => `
## Recurring Home Service Subscriptions in ${city.name}, California

Stay on top of home maintenance with convenient recurring service plans from Service Connect Pro. Subscribe to regular cleaning, maintenance, and upkeep services in ${city.name}, and enjoy a consistently well-maintained home without scheduling hassles.

### Popular Recurring Service Plans

**Weekly House Cleaning**: Maintain a consistently clean home with weekly professional cleaning. Perfect for busy professionals and families.

**Bi-Weekly Cleaning**: For those wanting regular cleaning without weekly visits, bi-weekly service provides balance between frequency and budget.

**Monthly Maintenance Checks**: Regular home inspections catch small issues before they become expensive problems. Monthly maintenance visits keep everything running smoothly.

**Quarterly Deep Cleaning**: Combine regular cleaning with quarterly deep cleans for comprehensive home maintenance throughout the year.

**Seasonal HVAC Maintenance**: Prepare your heating system for winter and AC for summer with seasonal tune-ups and maintenance.

**Lawn & Exterior Maintenance**: Keep your home's exterior looking great with regular lawn care, gutter cleaning, and pressure washing.

### Benefits of Recurring Service Plans

**Consistency**: Regular visits from familiar professionals who understand your home's needs.

**Prevention**: Regular maintenance catches issues early, preventing expensive emergency repairs.

**Savings**: Subscription plans often cost less than individual service calls.

**Convenience**: Set your schedule once; services happen automatically without constant rescheduling.

**Priority Booking**: Subscribers get priority scheduling when they need additional services.

### Flexible Plans for ${city.name} Homes

Whether you prefer weekly, bi-weekly, monthly, or custom intervals, we create plans matching your needs and budget. Change, pause, or cancel anytime.

### Trusted Professionals You Know

Build relationships with the same reliable professionals visiting your ${city.name} home regularly. Consistency breeds trust and better service quality.

### Upfront Pricing & Transparent Billing

Know exactly what you'll pay each month. No surprise fees, just predictable, affordable recurring service.

### Book Your Recurring Service Plan

Stop worrying about home maintenance. Subscribe to recurring services in ${city.name} today and enjoy peace of mind knowing your home is regularly cared for by trusted professionals.
    `,
    hero: 'Regular Service Plans for Consistent Home Care',
    benefits: [
      'Weekly & monthly options',
      'Familiar trusted professionals',
      'Prevention-focused maintenance',
      'Cost-effective subscriptions',
      'Flexible scheduling',
      'Priority service access',
    ],
  },
};

export default function LocationServicePage() {
  const { city, service } = useParams();
  
  // Debug log
  console.log('Params:', { city, service });
  console.log('CityData keys:', Object.keys(cityData));
  console.log('ServiceContent keys:', Object.keys(serviceContent));
  
  const cityInfo = cityData[city];
  const serviceInfo = serviceContent[service];

  if (!cityInfo || !serviceInfo) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', minHeight: '100vh', background: L.bg, color: L.text }}>
      <p>Service not found</p>
      <p style={{ fontSize: 12, color: '#999' }}>City: {city} | Service: {service}</p>
    </div>;
  }

  const pageTitle = `${serviceInfo.title} in ${cityInfo.name}, ${cityInfo.state} | Service Connect Pro`;
  const pageDesc = `${serviceInfo.description} in ${cityInfo.name}, California. Professional, verified service providers available now.`;

  const breadcrumbs = [
    { name: 'Home', url: 'https://serviceconnectpro.com/' },
    { name: 'Services', url: 'https://serviceconnectpro.com/Browse' },
    { name: `${cityInfo.name}`, url: `https://serviceconnectpro.com/${city}-home-services` },
    { name: serviceInfo.title, url: `https://serviceconnectpro.com/services/${city}/${service}` },
  ];

  return (
    <>
      <SeoHelmet 
        title={pageTitle}
        description={pageDesc}
        canonical={`https://serviceconnectpro.com/services/${city}/${service}`}
      />
      <div style={{ background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Hero */}
        <div style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%), url('${cityInfo.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: 'clamp(60px, 10vw, 100px) 20px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>📍 {cityInfo.name} Services</span>
            <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 800, letterSpacing: '-2px', marginTop: 12, marginBottom: 16, lineHeight: 1.1 }}>
              {serviceInfo.title} in {cityInfo.name}
            </h1>
            <p style={{ fontSize: 18, fontWeight: 300, marginBottom: 32, opacity: 0.95 }}>{serviceInfo.hero}</p>
            <button onClick={() => window.location.href = '/Browse'} style={{
              padding: '14px 40px',
              background: '#fff',
              border: 'none',
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 700,
              color: '#000',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              Book a Professional Now
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 32px' }}>
          <div style={{ lineHeight: 1.8, fontSize: 16, color: L.text }}>
            {serviceInfo.content(cityInfo).split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('##')) {
                return <h2 key={i} style={{ fontSize: 28, fontWeight: 700, marginTop: 40, marginBottom: 16, color: L.text }}>{paragraph.replace('## ', '')}</h2>;
              }
              if (paragraph.startsWith('**') && paragraph.includes(':')) {
                const [title, desc] = paragraph.replace(/\*\*/g, '').split(':');
                return (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: L.text, marginBottom: 8 }}>{title}</h3>
                    <p style={{ color: L.text2 }}>{desc}</p>
                  </div>
                );
              }
              return paragraph && <p key={i} style={{ marginBottom: 16, color: L.text2 }}>{paragraph}</p>;
            })}
          </div>

          {/* Benefits */}
          <div style={{ marginTop: 60, background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20, padding: 40 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: L.text }}>Why Choose Our {cityInfo.name} Professionals?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {serviceInfo.benefits.map((benefit, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: L.text2, fontSize: 14 }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 60, textAlign: 'center', background: L.text, color: '#fff', borderRadius: 20, padding: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Ready for Professional Service?</h2>
            <p style={{ fontSize: 16, marginBottom: 24, opacity: 0.9 }}>Connect with verified professionals in {cityInfo.name} today. Fast, reliable, and transparent pricing.</p>
            <button onClick={() => window.location.href = '/Browse'} style={{
              padding: '14px 40px',
              background: '#fff',
              border: 'none',
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 700,
              color: L.text,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
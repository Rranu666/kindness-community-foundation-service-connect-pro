import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function EarningsCalculator() {
  const SKILLS = [
    { value: 'video', label: '🎬 AI Video (+329%)', low: 180, high: 450, growth: 329 },
    { value: 'integration', label: '⚙️ AI Integration (+178%)', low: 120, high: 350, growth: 178 },
    { value: 'annotation', label: '📊 Data Annotation (+154%)', low: 35, high: 85, growth: 154 },
    { value: 'llm', label: '🧠 Chatbot/LLM (+71%)', low: 150, high: 500, growth: 71 },
    { value: 'image', label: '🎨 AI Image (+95%)', low: 90, high: 280, growth: 95 },
    { value: 'ml', label: '📈 ML/Training (stable)', low: 200, high: 800, growth: 40 },
  ];

  const [skill, setSkill] = useState('video');
  const [hours, setHours] = useState(40);
  const [rate, setRate] = useState(150);

  const skillData = SKILLS.find(s => s.value === skill);
  const monthlyGross = hours * rate;
  const monthlyNet = monthlyGross * 0.9; // 10% platform fee

  useEffect(() => {
    setRate(skillData.low);
  }, [skill]);

  return (
    <section style={{ padding: '100px 40px', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#00f0ff', marginBottom: '16px', display: 'block' }}>
          // earning potential
        </span>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-2px', color: '#fff', lineHeight: 1, marginBottom: '16px' }}>
          Calculate Your Earning Power
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: 300, maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
          See how much you could earn offering AI services on AIGig.io
        </p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{
          background: '#111827',
          border: '1px solid #253558',
          borderRadius: '20px',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: '-1px',
            left: '20px',
            right: '20px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00f0ff, #7b5cff, #ff3cac, transparent)',
          }} />

          {/* Skill Selection */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              fontFamily: 'Space Mono',
              display: 'block',
              marginBottom: '12px',
            }}>
              Select Your Primary Skill
            </label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value)}
              style={{
                width: '100%',
                background: '#0d1428',
                border: '1px solid #1e2d4a',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter',
                transition: 'all 0.2s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#00f0ff';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#1e2d4a';
                e.target.style.boxShadow = 'none';
              }}
            >
              {SKILLS.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label} — ${s.low}–${s.high}/hr
                </option>
              ))}
            </select>
          </div>

          {/* Hours per Month */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              fontFamily: 'Space Mono',
              display: 'block',
              marginBottom: '12px',
            }}>
              Hours/Month You Can Dedicate
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="range"
                min="5"
                max="200"
                value={hours}
                onChange={e => setHours(parseInt(e.target.value))}
                style={{ flex: 1, cursor: 'pointer', height: '6px' }}
              />
              <input
                type="number"
                min="5"
                max="200"
                value={hours}
                onChange={e => setHours(parseInt(e.target.value))}
                style={{
                  width: '60px',
                  background: '#0d1428',
                  border: '1px solid #1e2d4a',
                  borderRadius: '8px',
                  padding: '8px',
                  color: '#fff',
                  textAlign: 'center',
                  fontFamily: 'Inter',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '8px' }}>
              Pro tip: Start with 5–10 hrs/week while keeping your day job
            </p>
          </div>

          {/* Rate Selection */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              fontFamily: 'Space Mono',
              display: 'block',
              marginBottom: '12px',
            }}>
              Your Hourly Rate
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="range"
                min={skillData.low}
                max={skillData.high}
                value={rate}
                onChange={e => setRate(parseInt(e.target.value))}
                style={{ flex: 1, cursor: 'pointer', height: '6px' }}
              />
              <div style={{ width: '100px', textAlign: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#00f0ff', fontFamily: 'Syne' }}>
                  ${rate}
                </span>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>/hour</p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{
            background: 'linear-gradient(135deg,rgba(0,240,255,0.1),rgba(123,92,255,0.1))',
            border: '1px solid #253558',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Space Mono' }}>
              Monthly Earning Estimate
            </p>
            <div style={{ fontFamily: 'Syne', fontSize: '48px', fontWeight: 800, color: '#00ff88', marginBottom: '8px' }}>
              ${monthlyNet.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              {rate}USD/hr × {hours} hrs/mo
              <span style={{ color: 'rgba(255,255,255,0.35)' }}> — Platform fee 10%</span>
            </p>
            <p style={{ fontSize: '13px', color: '#00ff88', marginTop: '12px', fontWeight: 600 }}>
              📈 Growth potential: +{skillData.growth}% YoY
            </p>
          </div>

          <button style={{
            width: '100%',
            background: 'linear-gradient(135deg, #7b5cff, #00f0ff)',
            border: 'none',
            color: '#fff',
            padding: '16px 40px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Syne',
            letterSpacing: '0.5px',
            transition: 'all 0.25s',
          }}
          onClick={() => alert('🚀 Earnings calculator saved. Let\'s get you started!')}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 0 40px rgba(0,240,255,0.35)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          >
            Get Started as Provider →
          </button>
        </div>
      </div>
    </section>
  );
}
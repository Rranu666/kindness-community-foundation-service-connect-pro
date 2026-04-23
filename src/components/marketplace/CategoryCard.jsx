import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Stethoscope, Hammer, Baby, Scissors, Car, Home, Utensils, Sparkles } from 'lucide-react';

const iconMap = {
  Stethoscope,
  Hammer,
  Baby,
  Scissors,
  Car,
  Home,
  Utensils,
  Sparkles
};

export default function CategoryCard({ category, providerCount = 0 }) {
  const IconComponent = iconMap[category.icon] || Sparkles;
  
  return (
    <Link 
      to={createPageUrl(`Browse?category=${category.id}`)}
      className="group relative rounded-2xl p-5 border transition-all duration-300 overflow-hidden"
      style={{ background: '#140b00', border: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.background = 'rgba(249,115,22,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#140b00'; }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500"
        style={{ background: 'rgba(124,58,237,0.08)' }} />
      
      <div className="relative">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300"
          style={{ background: 'rgba(124,58,237,0.2)' }}>
          <IconComponent className="w-6 h-6" style={{ color: '#a78bfa' }} />
        </div>
        
        <h3 className="text-base font-semibold mb-1" style={{ color: '#fff' }}>{category.name}</h3>
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{category.description}</p>
        <span className="text-xs font-medium" style={{ color: '#f97316' }}>{providerCount} providers</span>
      </div>
    </Link>
  );
}
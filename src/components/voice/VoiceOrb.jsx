import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

const PINK = '#cb3c7a';
const CYAN = '#fbbf24';

export default function VoiceOrb({ phase, transcript, isSupported, onStart, onStop }) {
  const isListening = phase === 'listening';

  if (!isSupported) {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }}>
          <AlertCircle className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Voice input not supported in this browser. Please use the text input below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Orb */}
      <div className="relative">
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: PINK, animationDuration: '1s' }} />
            <div className="absolute inset-[-12px] rounded-full animate-ping opacity-10" style={{ background: PINK, animationDuration: '1.5s' }} />
            <div className="absolute inset-[-24px] rounded-full animate-ping opacity-5" style={{ background: PINK, animationDuration: '2s' }} />
          </>
        )}
        <button
          onClick={isListening ? onStop : onStart}
          className="relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none"
          style={{
            background: isListening
              ? `radial-gradient(circle, ${PINK}, #c0134f)`
              : `radial-gradient(circle, #1e0e00, #140b00)`,
            border: `3px solid ${isListening ? PINK : 'rgba(255,255,255,0.15)'}`,
            boxShadow: isListening ? `0 0 40px rgba(203,60,122,0.5)` : `0 0 20px rgba(0,0,0,0.5)`,
            transform: isListening ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {isListening
            ? <MicOff className="w-10 h-10 text-white" />
            : <Mic className="w-10 h-10" style={{ color: PINK }} />}
        </button>
      </div>

      {/* Status text */}
      <div className="text-center">
        {isListening ? (
          <>
            <p className="font-semibold text-white mb-1 flex items-center gap-2 justify-center">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: PINK }} />
              Listening... tap to stop
            </p>
            {transcript && (
              <p className="text-sm max-w-md mx-auto mt-2 italic" style={{ color: 'rgba(255,255,255,0.6)' }}>
                "{transcript}"
              </p>
            )}
          </>
        ) : (
          <>
            <p className="font-semibold text-white mb-1">Tap the mic to speak</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Describe any service you need in your own words
            </p>
          </>
        )}
      </div>
    </div>
  );
}
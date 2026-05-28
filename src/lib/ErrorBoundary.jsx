import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const G = {
  bg: '#080A12', surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', rose: '#FF4D6D', amber: '#FF8C42',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console and monitoring service
    console.error('[ErrorBoundary]', error, errorInfo);
    // In production, send to monitoring service:
    // logger.error('App error', { error: error.message, stack: errorInfo.componentStack });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', background: G.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif", padding: 24,
      }}>
        <div style={{
          maxWidth: 480, width: '100%', textAlign: 'center',
          background: G.surface, border: `1px solid ${G.rose}30`,
          borderRadius: 24, padding: '48px 40px',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `${G.rose}15`, border: `1px solid ${G.rose}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <AlertTriangle size={32} style={{ color: G.rose }} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: G.text, marginBottom: 10, letterSpacing: '-0.03em' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7, marginBottom: 32 }}>
            An unexpected error occurred. Don't worry — your data is safe. Please try refreshing.
          </p>

          {this.state.error && (
            <div style={{
              background: 'rgba(255,77,109,0.08)', border: `1px solid ${G.rose}20`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 28, textAlign: 'left',
            }}>
              <p style={{ fontSize: 12, color: G.rose, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {this.state.error.message}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleRetry}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '11px 22px', borderRadius: 12,
                background: G.grad, border: 'none', color: '#fff',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(255,77,109,0.35)',
              }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
            <a href="/" style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '11px 22px', borderRadius: 12,
              background: G.surface, border: `1px solid ${G.border}`,
              color: G.muted, fontWeight: 600, fontSize: 14,
              cursor: 'pointer', textDecoration: 'none',
            }}>
              <Home size={15} /> Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
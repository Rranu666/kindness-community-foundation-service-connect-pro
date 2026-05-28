import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { FileText, Download, Receipt } from 'lucide-react';
import { THEME as L } from '@/lib/theme';

const STATUS_COLORS = {
  generated: { color: '#d97706', bg: '#fef3c7' },
  sent:      { color: L.blue,   bg: '#eff3ff' },
  downloaded:{ color: '#059669', bg: '#ecfdf5' },
};

function InvoiceRow({ invoice }) {
  const [downloading, setDownloading] = useState(false);
  const sc = STATUS_COLORS[invoice.status] || STATUS_COLORS.generated;

  const handleDownload = async () => {
    if (!invoice.pdf_url) return;
    setDownloading(true);
    try {
      await db.Invoice.update(invoice.id, { status: 'downloaded' });
      window.open(invoice.pdf_url, '_blank');
    } finally { setDownloading(false); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: `1px solid ${L.border}`, borderRadius: 16, padding: '14px 18px', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = L.border2}
      onMouseLeave={e => e.currentTarget.style.borderColor = L.border}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${L.accent}12`, border: `1px solid ${L.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Receipt size={18} style={{ color: L.accent }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: L.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{invoice.service_name}</p>
          <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, borderRadius: 100, padding: '2px 8px', flexShrink: 0 }}>{invoice.status}</span>
        </div>
        <p style={{ fontSize: 12, color: L.text3 }}>{invoice.invoice_number} · {invoice.provider_name} · {invoice.scheduled_date}</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontWeight: 800, fontSize: 16, color: L.text }}>${(invoice.total_amount || 0).toFixed(2)}</p>
        <p style={{ fontSize: 11, color: L.text3 }}>Total</p>
      </div>
      <button onClick={handleDownload} disabled={!invoice.pdf_url || downloading}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, flexShrink: 0, background: invoice.pdf_url ? L.text : L.bg2, border: invoice.pdf_url ? 'none' : `1px solid ${L.border}`, color: invoice.pdf_url ? '#fff' : L.text3, fontSize: 12, fontWeight: 700, cursor: invoice.pdf_url ? 'pointer' : 'not-allowed', opacity: downloading ? 0.7 : 1 }}>
        <Download size={13} />{downloading ? 'Opening...' : 'Download'}
      </button>
    </div>
  );
}

export default function InvoicesSection({ userEmail }) {
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', userEmail],
    queryFn: () => db.Invoice.filter({ customer_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[1, 2].map(i => <div key={i} style={{ height: 72, borderRadius: 16, background: L.bg2, border: `1px solid ${L.border}` }} />)}
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20 }}>
        <FileText size={36} style={{ color: L.border2, margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 700, color: L.text, marginBottom: 6 }}>No invoices yet</p>
        <p style={{ fontSize: 13, color: L.text2, fontWeight: 300 }}>Invoices are auto-generated when a service is marked as complete.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {invoices.map(inv => <InvoiceRow key={inv.id} invoice={inv} />)}
    </div>
  );
}
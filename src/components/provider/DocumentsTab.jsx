import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Upload, FileText, CheckCircle2, Clock, AlertCircle, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const G = {
  card: '#140b00', border: 'rgba(203,60,122,0.2)', rose: '#cb3c7a',
  text: '#fff', muted: 'rgba(255,255,255,0.55)', faint: 'rgba(255,255,255,0.25)',
  green: '#10b981', amber: '#fbbf24',
};

const DOC_TYPES = [
  { key: 'business_license',    label: 'Business License',       desc: 'State or city business license', required: true },
  { key: 'insurance',           label: 'General Liability Insurance', desc: 'Certificate of insurance (COI)', required: true },
  { key: 'contractors_license', label: "Contractor's License",   desc: 'CSLB license (if applicable)', required: false },
  { key: 'id_proof',            label: 'Government ID',          desc: "Driver's license or passport", required: true },
  { key: 'w9',                  label: 'W-9 Tax Form',           desc: 'Required for payments', required: true },
  { key: 'background_check',    label: 'Background Check',       desc: 'Dated within last 12 months', required: false },
];

export default function DocumentsTab({ provider, onUpdate }) {
  const [uploading, setUploading] = useState({});
  const docs = provider.documents || {};

  const handleUpload = async (key, file) => {
    if (!file) return;
    setUploading(p => ({ ...p, [key]: true }));
    try {
      const { file_url } = await uploadFile({ file });
      const updated = { ...docs, [key]: { url: file_url, name: file.name, uploaded_at: new Date().toISOString(), status: 'pending' } };
      await db.ServiceProvider.update(provider.id, { documents: updated });
      onUpdate({ documents: updated });
      toast.success(`${key.replace('_', ' ')} uploaded successfully`);
    } catch {
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(p => ({ ...p, [key]: false }));
    }
  };

  const handleRemove = async (key) => {
    const updated = { ...docs };
    delete updated[key];
    await db.ServiceProvider.update(provider.id, { documents: updated });
    onUpdate({ documents: updated });
    toast.success('Document removed');
  };

  const uploadedCount = DOC_TYPES.filter(d => docs[d.key]).length;
  const requiredCount = DOC_TYPES.filter(d => d.required).length;
  const uploadedRequired = DOC_TYPES.filter(d => d.required && docs[d.key]).length;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="p-5 rounded-2xl" style={{ background: G.card, border: `1px solid ${G.border}` }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-white">Verification Progress</h3>
            <p className="text-sm" style={{ color: G.muted }}>{uploadedRequired}/{requiredCount} required documents uploaded</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">{Math.round((uploadedRequired / requiredCount) * 100)}%</p>
            <p className="text-xs" style={{ color: G.muted }}>Complete</p>
          </div>
        </div>
        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${(uploadedRequired / requiredCount) * 100}%`, background: `linear-gradient(90deg, ${G.rose}, #FF8C42)` }} />
        </div>
        {uploadedRequired === requiredCount && (
          <div className="flex items-center gap-2 mt-3 text-sm" style={{ color: G.green }}>
            <CheckCircle2 size={14} /> All required documents submitted — pending admin review
          </div>
        )}
      </div>

      {/* Document list */}
      <div className="grid gap-3">
        {DOC_TYPES.map(({ key, label, desc, required }) => {
          const doc = docs[key];
          const isUploading = uploading[key];
          return (
            <div key={key} className="flex items-center gap-4 p-4 rounded-xl transition-all"
              style={{ background: G.card, border: `1px solid ${doc ? G.green + '40' : G.border}` }}>
              {/* Status icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: doc ? `${G.green}15` : 'rgba(255,255,255,0.05)' }}>
                {doc
                  ? <CheckCircle2 size={18} style={{ color: G.green }} />
                  : <FileText size={18} style={{ color: G.faint }} />}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-white">{label}</span>
                  {required && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: `${G.rose}18`, color: G.rose }}>Required</span>
                  )}
                </div>
                <p className="text-xs" style={{ color: G.muted }}>{doc ? `Uploaded · ${doc.name}` : desc}</p>
                {doc?.status === 'pending' && (
                  <span className="text-xs flex items-center gap-1 mt-1" style={{ color: G.amber }}>
                    <Clock size={11} /> Under review
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc && (
                  <>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="ghost" className="h-8 text-xs text-white/60 hover:text-white px-2">
                        <Eye size={13} />
                      </Button>
                    </a>
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-red-400 hover:text-red-300 px-2"
                      onClick={() => handleRemove(key)}>
                      <Trash2 size={13} />
                    </Button>
                  </>
                )}
                <label className="cursor-pointer">
                  <Button size="sm" asChild
                    style={{ background: doc ? 'rgba(255,255,255,0.06)' : G.rose, color: '#fff' }}
                    className="h-8 text-xs pointer-events-none">
                    <span>{isUploading ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin inline-block" /> : (doc ? 'Replace' : 'Upload')}</span>
                  </Button>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    disabled={isUploading}
                    onChange={e => handleUpload(key, e.target.files[0])} />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl flex gap-3" style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <AlertCircle size={16} style={{ color: G.amber, flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
          All documents are reviewed within 2–3 business days. Accepted file types: PDF, JPG, PNG (max 10MB). Documents are stored securely and are only accessed by our compliance team.
        </p>
      </div>
    </div>
  );
}
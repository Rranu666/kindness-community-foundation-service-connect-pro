import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminMultiCity() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({ city: '', state: '', country: '', tax_rate: '' });

  const { data: taxConfigs = [], isLoading, refetch } = useQuery({
    queryKey: ['tax-configs'],
    queryFn: () => db.TaxConfig.filter({ is_active: true })
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.TaxConfig.create({ ...data, is_active: true }),
    onSuccess: () => { toast.success('City configuration added'); setFormData({ city: '', state: '', country: '', tax_rate: '' }); setOpenDialog(false); refetch(); },
    onError: () => toast.error('Failed to add city')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => db.TaxConfig.update(editingCity.id, data),
    onSuccess: () => { toast.success('City updated'); setFormData({ city: '', state: '', country: '', tax_rate: '' }); setEditingCity(null); setOpenDialog(false); refetch(); },
    onError: () => toast.error('Failed to update city')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.TaxConfig.delete(id),
    onSuccess: () => { toast.success('City deleted'); refetch(); },
    onError: () => toast.error('Failed to delete city')
  });

  const handleSubmit = () => {
    if (!formData.city || !formData.country || !formData.tax_rate) { toast.error('Please fill all required fields'); return; }
    if (editingCity) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const openEditDialog = (city) => {
    setEditingCity(city);
    setFormData({ city: city.city, state: city.state || '', country: city.country, tax_rate: city.tax_rate });
    setOpenDialog(true);
  };

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Multi-City Configuration</h1>
            <p className="text-slate-500 mt-1">Manage tax rates and locations</p>
          </div>
          <Dialog open={openDialog} onOpenChange={(open) => { setOpenDialog(open); if (!open) { setEditingCity(null); setFormData({ city: '', state: '', country: '', tax_rate: '' }); } }}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 text-white hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" /> Add City
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingCity ? 'Edit City' : 'Add New City'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><label className="text-sm font-medium text-slate-700 mb-2 block">City *</label><Input placeholder="e.g., Los Angeles" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-slate-700 mb-2 block">State/Province</label><Input placeholder="e.g., CA" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-slate-700 mb-2 block">Country *</label><Input placeholder="e.g., USA" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} /></div>
                <div><label className="text-sm font-medium text-slate-700 mb-2 block">Tax Rate (%) *</label><Input type="number" placeholder="e.g., 8.5" value={formData.tax_rate} onChange={e => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })} step="0.1" min="0" max="100" /></div>
                <Button className="w-full bg-slate-900 text-white hover:bg-slate-700" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save City'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div>
        ) : taxConfigs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {taxConfigs.map(config => (
              <Card key={config.id} className="border border-slate-200 bg-white">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{config.city}</h3>
                      <p className="text-slate-500 text-sm">{config.state && `${config.state}, `}{config.country}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="text-slate-500 hover:text-slate-800" onClick={() => openEditDialog(config)}><Edit2 className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-50" onClick={() => deleteMutation.mutate(config.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-slate-500 text-sm">Tax Rate</p>
                    <p className="text-2xl font-bold text-slate-800">{config.tax_rate}%</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border border-slate-200">
            <CardContent className="py-12 text-center text-slate-400">No cities configured yet</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
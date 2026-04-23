import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminMultiCity() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: '',
    tax_rate: ''
  });

  const { data: taxConfigs = [], isLoading, refetch } = useQuery({
    queryKey: ['tax-configs'],
    queryFn: () => base44.entities.TaxConfig.filter({ is_active: true })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TaxConfig.create({ ...data, is_active: true }),
    onSuccess: () => {
      toast.success('City configuration added');
      setFormData({ city: '', state: '', country: '', tax_rate: '' });
      setOpenDialog(false);
      refetch();
    },
    onError: () => toast.error('Failed to add city')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.TaxConfig.update(editingCity.id, data),
    onSuccess: () => {
      toast.success('City configuration updated');
      setFormData({ city: '', state: '', country: '', tax_rate: '' });
      setEditingCity(null);
      setOpenDialog(false);
      refetch();
    },
    onError: () => toast.error('Failed to update city')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TaxConfig.delete(id),
    onSuccess: () => {
      toast.success('City configuration deleted');
      refetch();
    },
    onError: () => toast.error('Failed to delete city')
  });

  const handleSubmit = () => {
    if (!formData.city || !formData.country || !formData.tax_rate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingCity) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (city) => {
    setEditingCity(city);
    setFormData({
      city: city.city,
      state: city.state || '',
      country: city.country,
      tax_rate: city.tax_rate
    });
    setOpenDialog(true);
  };

  return (
    <div style={{ background: '#0f0900' }} className="min-h-screen py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Multi-City Configuration</h1>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Manage tax rates and locations</p>
          </div>
          <Dialog open={openDialog} onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) {
              setEditingCity(null);
              setFormData({ city: '', state: '', country: '', tax_rate: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button style={{ background: '#cb3c7a' }} className="text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.3)' }}>
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingCity ? 'Edit City' : 'Add New City'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">City</label>
                  <Input
                    placeholder="e.g., New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">State/Province</label>
                  <Input
                    placeholder="e.g., NY"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Country</label>
                  <Input
                    placeholder="e.g., USA"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">Tax Rate (%)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 8.5"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                    step="0.1"
                    min="0"
                    max="100"
                    style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff' }}
                  />
                </div>
                <Button
                  className="w-full text-white"
                  style={{ background: '#cb3c7a' }}
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save City'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cities Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : taxConfigs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {taxConfigs.map(config => (
              <Card key={config.id} style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.2)' }}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{config.city}</h3>
                      <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">
                        {config.state && `${config.state}, `}{config.country}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                        onClick={() => openEditDialog(config)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-400/10"
                        onClick={() => deleteMutation.mutate(config.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(203,60,122,0.1)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">Tax Rate</p>
                    <p className="text-2xl font-bold" style={{ color: '#cb3c7a' }}>
                      {config.tax_rate}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.2)' }}>
            <CardContent className="py-12 text-center">
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>No cities configured yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
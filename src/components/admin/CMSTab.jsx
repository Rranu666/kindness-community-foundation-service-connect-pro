import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function CMSTab() {
  const [pages, setPages] = useState([
    { id: 1, title: 'Home', slug: '/', meta_title: 'Service Connect Pro', meta_desc: 'Find top service providers', status: 'published' },
    { id: 2, title: 'About Us', slug: '/about', meta_title: 'About Us', meta_desc: 'Learn about our platform', status: 'published' },
    { id: 3, title: 'Terms & Privacy', slug: '/terms', meta_title: 'Terms & Privacy', meta_desc: '', status: 'published' },
  ]);
  const [editPage, setEditPage] = useState(null);
  const [newPage, setNewPage] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', meta_title: '', meta_desc: '', content: '', status: 'draft' });

  const savePage = () => {
    if (editPage) {
      setPages(p => p.map(pg => pg.id === editPage.id ? { ...pg, ...form } : pg));
      toast.success('Page updated');
    } else {
      setPages(p => [...p, { id: Date.now(), ...form }]);
      toast.success('Page created');
    }
    setEditPage(null);
    setNewPage(false);
    setForm({ title: '', slug: '', meta_title: '', meta_desc: '', content: '', status: 'draft' });
  };

  const openEdit = (pg) => {
    setEditPage(pg);
    setForm({ title: pg.title, slug: pg.slug, meta_title: pg.meta_title || '', meta_desc: pg.meta_desc || '', content: pg.content || '', status: pg.status });
    setNewPage(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Pages</CardTitle>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700"
              onClick={() => { setEditPage(null); setForm({ title: '', slug: '', meta_title: '', meta_desc: '', content: '', status: 'draft' }); setNewPage(true); }}>
              <Plus className="w-4 h-4 mr-1" /> New Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Meta Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map(pg => (
                <TableRow key={pg.id}>
                  <TableCell className="font-medium">{pg.title}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-500">{pg.slug}</TableCell>
                  <TableCell className="text-sm text-slate-600">{pg.meta_title}</TableCell>
                  <TableCell><span className={`text-xs font-semibold px-2 py-1 rounded ${pg.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{pg.status}</span></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(pg)}><Edit className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setPages(p => p.filter(x => x.id !== pg.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {newPage && (
        <Card>
          <CardHeader><CardTitle className="text-base">{editPage ? 'Edit Page' : 'New Page'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Page Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="mt-1" /></div>
              <div><Label>Slug (URL path)</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="/page-name" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Meta Title (SEO)</Label><Input value={form.meta_title} onChange={e => setForm({...form, meta_title: e.target.value})} className="mt-1" /></div>
              <div><Label>Meta Description (SEO)</Label><Input value={form.meta_desc} onChange={e => setForm({...form, meta_desc: e.target.value})} className="mt-1" /></div>
            </div>
            <div>
              <Label>Page Content</Label>
              <Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={5} className="mt-1" placeholder="Page content / HTML..." />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger className="mt-1 w-40"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={savePage}>Save Page</Button>
              <Button variant="outline" onClick={() => { setNewPage(false); setEditPage(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
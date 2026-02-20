import { useState, useEffect } from 'react';

interface Resource {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  cover_image: string;
  download_url: string;
  publish_date: string;
  status: string;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ResourcesManager() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/resources').then(r => r.json()).then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  function startNew() {
    setEditing({ title: '', slug: '', description: '', category: '', cover_image: '', download_url: '#', publish_date: new Date().toISOString().split('T')[0], status: 'draft' });
  }

  function startEdit(item: Resource) {
    setEditing({ ...item, publish_date: item.publish_date ? item.publish_date.split('T')[0] : '' });
  }

  async function save() {
    if (!editing || !editing.title || !editing.slug) return;
    setSaving(true);
    if (editing.id) {
      await fetch(`/api/resources/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
      setItems(items.map(i => i.id === editing.id ? { ...i, ...editing } : i));
    } else {
      const res = await fetch('/api/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
      const { id } = await res.json();
      setItems([{ ...editing, id }, ...items]);
    }
    setEditing(null);
    setSaving(false);
  }

  async function del(id: number) {
    if (!confirm('Delete this resource?')) return;
    await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  }

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  if (editing) {
    return (
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">{editing.id ? 'Edit Resource' : 'New Resource'}</h2>
          <button onClick={() => setEditing(null)} className="text-sm text-neutral-400 hover:text-neutral-600">Cancel</button>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
            <input value={editing.title} onChange={e => {
              const title = e.target.value;
              setEditing({ ...editing, title, ...(!editing.id && { slug: slugify(title) }) });
            }} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
            <input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Template, Guide, Whitepaper" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Publish Date</label>
            <input type="date" value={editing.publish_date} onChange={e => setEditing({ ...editing, publish_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Cover Image</label>
          {editing.cover_image && (
            <div className="mb-2 relative inline-block">
              <img src={editing.cover_image} alt="Preview" className="h-32 rounded-lg border object-cover" />
              <button onClick={() => setEditing({ ...editing, cover_image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600">x</button>
            </div>
          )}
          <div className="flex gap-2">
            <input value={editing.cover_image} onChange={e => setEditing({ ...editing, cover_image: e.target.value })} placeholder="Paste URL or upload" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            <label className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${uploading ? 'bg-neutral-200 text-neutral-400' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}`}>
              {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const form = new FormData();
                form.append('file', file);
                try {
                  const res = await fetch('/api/upload', { method: 'POST', body: form });
                  const data = await res.json();
                  if (data.url) setEditing((prev: any) => ({ ...prev, cover_image: data.url }));
                } catch {}
                setUploading(false);
                e.target.value = '';
              }} />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Download URL</label>
          <input value={editing.download_url} onChange={e => setEditing({ ...editing, download_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Resource'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-400">{items.length} resources</p>
        <button onClick={startNew} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700">+ New Resource</button>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 border-b bg-neutral-50">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-900 font-medium">{item.title}</td>
                <td className="px-4 py-3 text-neutral-600">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'published' ? 'bg-teal-50 text-teal-700' : 'bg-neutral-100 text-neutral-600'}`}>{item.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(item)} className="text-teal-600 hover:text-teal-700 text-sm font-medium mr-3">Edit</button>
                  <button onClick={() => del(item.id)} className="text-red-400 hover:text-red-600 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

interface Category { id: number; name: string; slug: string; description: string; }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CategoriesManager() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  function startNew() { setEditing({ name: '', slug: '', description: '' }); }
  function startEdit(item: Category) { setEditing({ ...item }); }

  async function save() {
    if (!editing || !editing.name || !editing.slug) return;
    setSaving(true);
    try {
      if (editing.id) {
        const res = await fetch(`/api/categories/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Save failed' }));
          alert(err.error || `Save failed (${res.status})`);
          setSaving(false);
          return;
        }
        setItems(items.map(i => i.id === editing.id ? { ...i, ...editing } : i));
      } else {
        const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Save failed' }));
          alert(err.error || `Save failed (${res.status})`);
          setSaving(false);
          return;
        }
        const { id } = await res.json();
        setItems([...items, { ...editing, id }]);
      }
      setEditing(null);
    } catch (e: any) {
      alert('Save failed: ' + (e.message || 'Unknown error'));
    }
    setSaving(false);
  }

  async function del(id: number) {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  }

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  if (editing) {
    return (
      <div className="max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">{editing.id ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={() => setEditing(null)} className="text-sm text-neutral-400 hover:text-neutral-600">Cancel</button>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
          <input value={editing.name} onChange={e => {
            const name = e.target.value;
            setEditing({ ...editing, name, ...(!editing.id && { slug: slugify(name) }) });
          }} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
          <input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
          <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-400">{items.length} categories</p>
        <button onClick={startNew} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700">+ New Category</button>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 border-b bg-neutral-50">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-900 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-neutral-400">{item.slug}</td>
                <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">{item.description}</td>
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

import { useState, useEffect } from 'react';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  category_slug: string;
  featured_image: string;
  meta_description: string;
  publish_date: string;
  author: string;
  featured: boolean;
  tags: string[];
  read_time: number;
  faq: { question: string; answer: string }[];
  status: string;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ArticlesManager() {
  const [items, setItems] = useState<Article[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/articles').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([arts, cats]) => {
      setItems(Array.isArray(arts) ? arts : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setLoading(false);
    });
  }, []);

  function startNew() {
    setEditing({
      title: '', slug: '', excerpt: '', content: '', category: '', category_slug: '',
      featured_image: '', meta_description: '', publish_date: new Date().toISOString().split('T')[0],
      author: 'SourcingTomorrow', featured: false, tags: '', read_time: 5, faq: [], status: 'draft',
    });
  }

  function startEdit(item: Article) {
    setEditing({
      ...item,
      tags: (item.tags || []).join(', '),
      faq: item.faq || [],
      publish_date: item.publish_date ? item.publish_date.split('T')[0] : '',
    });
  }

  async function save() {
    if (!editing || !editing.title || !editing.slug) return;
    setSaving(true);
    const tags = editing.tags ? editing.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    const cat = categories.find(c => c.name === editing.category);
    const body = {
      ...editing,
      tags,
      category_slug: cat?.slug || slugify(editing.category || ''),
      faq: editing.faq || [],
    };

    if (editing.id) {
      await fetch(`/api/articles/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setItems(items.map(i => i.id === editing.id ? { ...i, ...body } : i));
    } else {
      const res = await fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const { id } = await res.json();
      setItems([{ ...body, id }, ...items]);
    }
    setEditing(null);
    setSaving(false);
  }

  async function del(id: number) {
    if (!confirm('Delete this article?')) return;
    await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  }

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  if (editing) {
    return (
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">{editing.id ? 'Edit Article' : 'New Article'}</h2>
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
          <label className="block text-sm font-medium text-neutral-700 mb-1">Excerpt</label>
          <textarea value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Content (HTML)</label>
          <textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={12} className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
            <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">Select...</option>
              {categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
            <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Publish Date</label>
            <input type="date" value={editing.publish_date} onChange={e => setEditing({ ...editing, publish_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Author</label>
            <input value={editing.author} onChange={e => setEditing({ ...editing, author: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Read Time (min)</label>
            <input type="number" value={editing.read_time} onChange={e => setEditing({ ...editing, read_time: parseInt(e.target.value) || 5 })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.featured} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="rounded" />
              <span className="font-medium text-neutral-700">Featured</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Tags (comma-separated)</label>
          <input value={editing.tags} onChange={e => setEditing({ ...editing, tags: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="AI, Automation, Technology" />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Featured Image</label>
          {editing.featured_image && (
            <div className="mb-2 relative inline-block">
              <img src={editing.featured_image} alt="Preview" className="h-32 rounded-lg border object-cover" />
              <button onClick={() => setEditing({ ...editing, featured_image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600">x</button>
            </div>
          )}
          <div className="flex gap-2">
            <input value={editing.featured_image} onChange={e => setEditing({ ...editing, featured_image: e.target.value })} placeholder="Paste URL or upload" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
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
                  if (data.url) setEditing((prev: any) => ({ ...prev, featured_image: data.url }));
                } catch {}
                setUploading(false);
                e.target.value = '';
              }} />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Meta Description</label>
          <textarea value={editing.meta_description} onChange={e => setEditing({ ...editing, meta_description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        {/* FAQ Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-neutral-700">FAQ</label>
            <button onClick={() => setEditing({ ...editing, faq: [...(editing.faq || []), { question: '', answer: '' }] })} className="text-xs text-teal-600 hover:text-teal-700 font-medium">+ Add FAQ</button>
          </div>
          {(editing.faq || []).map((faq: any, i: number) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={faq.question} onChange={e => {
                const faqArr = [...editing.faq];
                faqArr[i] = { ...faqArr[i], question: e.target.value };
                setEditing({ ...editing, faq: faqArr });
              }} placeholder="Question" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input value={faq.answer} onChange={e => {
                const faqArr = [...editing.faq];
                faqArr[i] = { ...faqArr[i], answer: e.target.value };
                setEditing({ ...editing, faq: faqArr });
              }} placeholder="Answer" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <button onClick={() => setEditing({ ...editing, faq: editing.faq.filter((_: any, j: number) => j !== i) })} className="text-red-400 hover:text-red-600 text-sm px-2">x</button>
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Article'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-400">{items.length} articles</p>
        <button onClick={startNew} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700">+ New Article</button>
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 border-b bg-neutral-50">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-900 font-medium">{item.title}</td>
                <td className="px-4 py-3 text-neutral-600">{item.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.status === 'published' ? 'bg-teal-50 text-teal-700' :
                    item.status === 'review' ? 'bg-amber-50 text-amber-700' :
                    item.status === 'draft' ? 'bg-neutral-100 text-neutral-600' :
                    'bg-neutral-100 text-neutral-400'
                  }`}>{item.status}</span>
                </td>
                <td className="px-4 py-3 text-neutral-400">{item.publish_date ? new Date(item.publish_date).toLocaleDateString() : '-'}</td>
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

import { useState, useEffect, Fragment } from 'react';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export default function ContactsTable() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/contacts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setItems(items.map(i => i.id === id ? { ...i, status } : i));
  }

  async function del(id: number) {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  }

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  return (
    <div>
      <p className="text-sm text-neutral-400 mb-6">{items.length} contacts</p>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 border-b bg-neutral-50">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <Fragment key={item.id}>
                <tr className="border-b hover:bg-neutral-50 cursor-pointer" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  <td className="px-4 py-3 text-neutral-900 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{item.email}</td>
                  <td className="px-4 py-3 text-neutral-600">{item.subject || '-'}</td>
                  <td className="px-4 py-3">
                    <select value={item.status} onChange={e => { e.stopPropagation(); updateStatus(item.id, e.target.value); }} onClick={e => e.stopPropagation()} className="px-2 py-1 border rounded text-xs">
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); del(item.id); }} className="text-red-400 hover:text-red-600 text-sm font-medium">Delete</button>
                  </td>
                </tr>
                {expanded === item.id && (
                  <tr>
                    <td colSpan={6} className="px-4 py-4 bg-neutral-50 text-sm text-neutral-600 whitespace-pre-wrap">{item.message || 'No message'}</td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

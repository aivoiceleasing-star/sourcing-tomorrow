import { useState, useEffect } from 'react';

interface Subscriber {
  id: number;
  email: string;
  status: string;
  subscribed_at: string;
}

export default function SubscribersTable() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subscribers').then(r => r.json()).then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  function exportCsv() {
    const csv = ['email,status,subscribed_at', ...items.map(i => `${i.email},${i.status},${i.subscribed_at}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="text-neutral-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-400">{items.length} subscribers</p>
        {items.length > 0 && (
          <button onClick={exportCsv} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700">Export CSV</button>
        )}
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-400 border-b bg-neutral-50">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 text-neutral-900 font-medium">{item.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-teal-50 text-teal-700' : 'bg-neutral-100 text-neutral-400'}`}>{item.status}</span>
                </td>
                <td className="px-4 py-3 text-neutral-400">{new Date(item.subscribed_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-neutral-400">No subscribers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

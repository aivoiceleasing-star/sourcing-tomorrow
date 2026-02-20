import { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BRAND_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#2dd4bf', '#99f6e4'];
const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  review: '#f59e0b',
  published: '#14b8a6',
  archived: '#9ca3af',
};

interface Stats {
  articleCount: number;
  publishedArticleCount: number;
  resourceCount: number;
  categoryCount: number;
  contactCount: number;
  newContactCount: number;
  subscriberCount: number;
  recentContacts: any[];
  articlesByCategory: { name: string; value: number }[];
  articlesByStatus: { name: string; value: number }[];
  articlesByMonth: { month: string; articles: number }[];
  subscribersByMonth: { month: string; subscribers: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setStats(data);
      })
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>;
  if (!stats) return <div className="text-neutral-400">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Articles" value={stats.articleCount} sub={`${stats.publishedArticleCount} published`} />
        <StatCard label="Resources" value={stats.resourceCount} />
        <StatCard label="Categories" value={stats.categoryCount} />
        <StatCard label="Contacts" value={stats.contactCount} sub={`${stats.newContactCount} new`} />
        <StatCard label="Subscribers" value={stats.subscriberCount} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Articles over time */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Articles Published</h3>
          {stats.articlesByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.articlesByMonth}>
                <defs>
                  <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="articles" stroke="#14b8a6" fill="url(#colorArticles)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-neutral-400 text-sm">No data yet</p>}
        </div>

        {/* Articles by category (donut) */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Articles by Category</h3>
          {stats.articlesByCategory.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={stats.articlesByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {stats.articlesByCategory.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 text-sm">
                {stats.articlesByCategory.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: BRAND_COLORS[i % BRAND_COLORS.length] }} />
                    <span className="text-neutral-600">{item.name}</span>
                    <span className="text-neutral-400 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-neutral-400 text-sm">No data yet</p>}
        </div>

        {/* Articles by status */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Articles by Status</h3>
          {stats.articlesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.articlesByStatus}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stats.articlesByStatus.map((item) => (
                    <Cell key={item.name} fill={STATUS_COLORS[item.name] || '#14b8a6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-neutral-400 text-sm">No data yet</p>}
        </div>

        {/* Subscriber growth */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-900 mb-4">Newsletter Growth</h3>
          {stats.subscribersByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.subscribersByMonth}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="subscribers" stroke="#0f766e" fill="url(#colorSubs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-neutral-400 text-sm">No subscribers yet</p>}
        </div>
      </div>

      {/* Recent Contacts */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">Recent Contacts</h3>
        {stats.recentContacts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 border-b">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentContacts.map((c: any) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2.5 text-neutral-900 font-medium">{c.name}</td>
                  <td className="py-2.5 text-neutral-600">{c.email}</td>
                  <td className="py-2.5 text-neutral-600">{c.subject || '-'}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === 'new' ? 'bg-teal-50 text-teal-700' :
                      c.status === 'read' ? 'bg-blue-50 text-blue-700' :
                      c.status === 'replied' ? 'bg-green-50 text-green-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>{c.status}</span>
                  </td>
                  <td className="py-2.5 text-neutral-400">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-neutral-400 text-sm">No contacts yet</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-neutral-200">
      <p className="text-sm text-neutral-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  );
}

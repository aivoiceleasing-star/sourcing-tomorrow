import { useState } from 'react';

const API_BASE = 'https://api.usaspending.gov/api/v2';

interface SpendingResult {
  name: string;
  code: string;
  amount: number;
  id?: number;
}

const fiscalYears = Array.from({ length: 7 }, (_, i) => 2026 - i);

const categoryOptions = [
  { value: 'awarding_agency', label: 'By Agency' },
  { value: 'naics', label: 'By Industry (NAICS)' },
  { value: 'psc', label: 'By Product/Service Code' },
  { value: 'state_territory', label: 'By State' },
];

function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1e12) return `$${(amount / 1e12).toFixed(1)}T`;
  if (Math.abs(amount) >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
  if (Math.abs(amount) >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
  if (Math.abs(amount) >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

export default function FederalSpending() {
  const [fy, setFy] = useState(2026);
  const [category, setCategory] = useState('awarding_agency');
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SpendingResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function search() {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const startDate = `${fy - 1}-10-01`;
      const endDate = `${fy}-09-30`;
      const filters: Record<string, unknown> = {
        time_period: [{ start_date: startDate, end_date: endDate }],
      };
      if (keyword.trim()) {
        filters.keywords = [keyword.trim()];
      }

      const res = await fetch(`${API_BASE}/search/spending_by_category/${category}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, limit: 25, page: 1 }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.results?.reduce((sum: number, r: SpendingResult) => sum + (r.amount || 0), 0) || 0);
    } catch (e: any) {
      setError(e.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const maxAmount = results.length > 0 ? Math.max(...results.map(r => Math.abs(r.amount || 0))) : 1;

  return (
    <div>
      {/* Search Form */}
      <div className="card p-6 mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Fiscal Year</label>
            <select
              value={fy}
              onChange={(e) => setFy(Number(e.target.value))}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              {fiscalYears.map(y => <option key={y} value={y}>FY {y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Keyword (optional)</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. cybersecurity, construction"
              onKeyDown={(e) => e.key === 'Enter' && search()}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={search}
              disabled={loading}
              className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Spending'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Results */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="card p-12 text-center text-neutral-400">No results found. Try adjusting your filters.</div>
      )}

      {results.length > 0 && (
        <div className="card overflow-hidden">
          <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">
              Top {results.length} Results — FY {fy}
            </h3>
            <span className="text-sm font-semibold text-teal-700">
              Total shown: {formatCurrency(total)}
            </span>
          </div>
          <div className="divide-y divide-neutral-100">
            {results.map((r, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <span className="shrink-0 w-8 text-xs font-bold text-neutral-400 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-neutral-900 truncate">{r.name || 'Unknown'}</span>
                    {r.code && <span className="shrink-0 text-[10px] font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">{r.code}</span>}
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-600 transition-all"
                      style={{ width: `${Math.max(2, (Math.abs(r.amount || 0) / maxAmount) * 100)}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold text-neutral-900 tabular-nums">
                  {formatCurrency(r.amount || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Source */}
      <p className="mt-6 text-xs text-neutral-400 text-center">
        Data from <a href="https://usaspending.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-700">USASpending.gov</a> — updated daily. Fiscal year runs October 1 to September 30.
      </p>
    </div>
  );
}

import { useState } from 'react';

const API_BASE = 'https://api.gsa.gov/acquisition/calc/v3/api/ceilingrates';

interface LaborRate {
  labor_category: string;
  vendor_name: string;
  current_price: number;
  next_year_price: number;
  education_level: string;
  min_years_experience: number;
  business_size: string;
  security_clearance: boolean;
  worksite: string;
  schedule: string;
  sin: string;
  idv_piid: string;
}

const educationLevels = ['', 'High School', 'Associates', 'Bachelors', 'Masters', 'Doctorate'];

function formatRate(rate: number): string {
  return `$${rate.toFixed(2)}`;
}

export default function LaborRates() {
  const [keyword, setKeyword] = useState('');
  const [education, setEducation] = useState('');
  const [minYears, setMinYears] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [businessSize, setBusinessSize] = useState('');
  const [results, setResults] = useState<LaborRate[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [stats, setStats] = useState<{ min: number; max: number; avg: number; median: number } | null>(null);

  async function search() {
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const params = new URLSearchParams();
      params.set('keyword', keyword.trim());
      params.set('page', '1');
      params.set('page_size', '50');
      if (education) params.set('education_level', education);
      if (minYears) params.set('min_years_experience', minYears);
      if (minPrice || maxPrice) {
        params.set('price_range', `${minPrice || '0'},${maxPrice || '999'}`);
      }
      if (businessSize) params.set('business_size', businessSize);

      const res = await fetch(`${API_BASE}/?${params.toString()}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      const hits = data.hits?.hits || [];
      const rates: LaborRate[] = hits.map((h: any) => h._source);
      setResults(rates);
      setTotalHits(data.hits?.total?.value || 0);

      // Calculate stats
      if (rates.length > 0) {
        const prices = rates.map(r => r.current_price).filter(p => p > 0).sort((a, b) => a - b);
        if (prices.length > 0) {
          const mid = Math.floor(prices.length / 2);
          setStats({
            min: prices[0],
            max: prices[prices.length - 1],
            avg: prices.reduce((a, b) => a + b, 0) / prices.length,
            median: prices.length % 2 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2,
          });
        }
      } else {
        setStats(null);
      }
    } catch (e: any) {
      setError(e.message || 'Search failed');
      setResults([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Search Form */}
      <div className="card p-6 mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Labor Category / Role</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Project Manager, Software Engineer, Cybersecurity Analyst"
              onKeyDown={(e) => e.key === 'Enter' && search()}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Education Level</label>
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Any</option>
              {educationLevels.filter(Boolean).map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Min Years Experience</label>
            <input
              type="number"
              value={minYears}
              onChange={(e) => setMinYears(e.target.value)}
              placeholder="e.g. 5"
              min="0"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Business Size</label>
            <select
              value={businessSize}
              onChange={(e) => setBusinessSize(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="">Any</option>
              <option value="S">Small Business</option>
              <option value="O">Other (Large)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Hourly Rate Range ($)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                min="0"
                className="w-1/2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                min="0"
                className="w-1/2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={search}
              disabled={loading || !keyword.trim()}
              className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Rates'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Low', value: formatRate(stats.min) },
            { label: 'Median', value: formatRate(stats.median) },
            { label: 'Average', value: formatRate(stats.avg) },
            { label: 'High', value: formatRate(stats.max) },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{s.label}</div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{s.value}</div>
              <div className="text-[10px] text-neutral-400">per hour</div>
            </div>
          ))}
        </div>
      )}

      {/* Results Table */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="card p-12 text-center text-neutral-400">No rates found. Try a different search term.</div>
      )}

      {results.length > 0 && (
        <div className="card overflow-hidden">
          <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">
              Showing {results.length} of {totalHits.toLocaleString()} results
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs text-neutral-400 uppercase tracking-wider">
                  <th className="text-left p-4 font-semibold">Labor Category</th>
                  <th className="text-left p-4 font-semibold">Vendor</th>
                  <th className="text-right p-4 font-semibold">Rate/hr</th>
                  <th className="text-left p-4 font-semibold">Education</th>
                  <th className="text-left p-4 font-semibold">Exp</th>
                  <th className="text-left p-4 font-semibold">Size</th>
                  <th className="text-left p-4 font-semibold">Contract</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="p-4 font-medium text-neutral-900 max-w-xs">
                      <div className="truncate">{r.labor_category}</div>
                    </td>
                    <td className="p-4 text-neutral-500 max-w-[200px]">
                      <div className="truncate">{r.vendor_name}</div>
                    </td>
                    <td className="p-4 text-right font-bold text-neutral-900 tabular-nums">
                      {formatRate(r.current_price)}
                    </td>
                    <td className="p-4 text-neutral-500 text-xs">{r.education_level || '—'}</td>
                    <td className="p-4 text-neutral-500 text-xs">{r.min_years_experience || 0}+ yr</td>
                    <td className="p-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.business_size === 'S' ? 'bg-teal-50 text-teal-700' : 'bg-neutral-100 text-neutral-600'}`}>
                        {r.business_size === 'S' ? 'Small' : 'Large'}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400 text-xs font-mono">{r.idv_piid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Source */}
      <p className="mt-6 text-xs text-neutral-400 text-center">
        Data from <a href="https://calc.gsa.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-700">GSA CALC+</a> — GSA Schedule contract ceiling rates. Rates shown are maximum allowable, actual rates may be lower.
      </p>
    </div>
  );
}

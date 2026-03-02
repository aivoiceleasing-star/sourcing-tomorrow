import { useState } from 'react';

interface Opportunity {
  title: string;
  solicitationNumber: string;
  department: string;
  subtier: string;
  office: string;
  postedDate: string;
  responseDeadLine: string;
  type: string;
  baseType: string;
  naicsCode: string;
  classificationCode: string;
  typeOfSetAsideDescription: string;
  uiLink: string;
  description: string;
  active: string;
}

const noticeTypes = [
  { value: '', label: 'All Types' },
  { value: 'o', label: 'Solicitation' },
  { value: 'k', label: 'Combined Synopsis/Solicitation' },
  { value: 'p', label: 'Presolicitation' },
  { value: 's', label: 'Sources Sought' },
  { value: 'r', label: 'Special Notice' },
  { value: 'a', label: 'Award Notice' },
];

const setAsideTypes = [
  { value: '', label: 'Any Set-Aside' },
  { value: 'SBA', label: 'Total Small Business' },
  { value: 'SBP', label: 'Partial Small Business' },
  { value: 'HZC', label: 'HUBZone' },
  { value: '8A', label: '8(a)' },
  { value: 'SDVOSBC', label: 'Service-Disabled Veteran' },
  { value: 'WOSB', label: 'Women-Owned SB' },
  { value: 'EDWOSB', label: 'Econ Disadvantaged WOSB' },
];

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  try {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export default function GovernmentOpportunities() {
  const [titleSearch, setTitleSearch] = useState('');
  const [naicsCode, setNaicsCode] = useState('');
  const [noticeType, setNoticeType] = useState('');
  const [setAside, setSetAside] = useState('');
  const [results, setResults] = useState<Opportunity[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function search() {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const params = new URLSearchParams();
      // Search last 90 days
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      params.set('postedFrom', `${String(from.getMonth() + 1).padStart(2, '0')}/${String(from.getDate()).padStart(2, '0')}/${from.getFullYear()}`);
      params.set('postedTo', `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`);
      params.set('limit', '25');

      if (titleSearch.trim()) params.set('title', titleSearch.trim());
      if (naicsCode.trim()) params.set('ncode', naicsCode.trim());
      if (noticeType) params.set('ptype', noticeType);
      if (setAside) params.set('typeOfSetAside', setAside);

      const res = await fetch(`/api/tools/opportunities?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `API error: ${res.status}`);
      }
      const data = await res.json();
      setResults(data.opportunitiesData || []);
      setTotalCount(data.totalRecords || 0);
    } catch (e: any) {
      setError(e.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Search Form */}
      <div className="card p-6 mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Search Title / Keywords</label>
            <input
              type="text"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              placeholder="e.g. cybersecurity, IT services, construction"
              onKeyDown={(e) => e.key === 'Enter' && search()}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">NAICS Code</label>
            <input
              type="text"
              value={naicsCode}
              onChange={(e) => setNaicsCode(e.target.value)}
              placeholder="e.g. 541512"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Notice Type</label>
            <select
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              {noticeTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Set-Aside</label>
            <select
              value={setAside}
              onChange={(e) => setSetAside(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              {setAsideTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex items-end">
            <button
              onClick={search}
              disabled={loading}
              className="w-full sm:w-auto rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching SAM.gov...' : 'Search Opportunities'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error.includes('SAM_GOV_API_KEY') ? (
            <span>SAM.gov API key not configured. <a href="https://sam.gov" target="_blank" rel="noopener noreferrer" className="underline">Register for a free API key</a> and add it to your environment variables.</span>
          ) : error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="card p-12 text-center text-neutral-400">No opportunities found. Try broadening your search.</div>
      )}

      {results.length > 0 && (
        <>
          <div className="mb-4 text-sm text-neutral-500">
            Showing {results.length} of {totalCount.toLocaleString()} opportunities (last 90 days)
          </div>
          <div className="space-y-4">
            {results.map((opp, i) => {
              const days = daysUntil(opp.responseDeadLine);
              const isUrgent = days !== null && days >= 0 && days <= 7;
              const isExpired = days !== null && days < 0;
              return (
                <div key={i} className="card p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-neutral-900 line-clamp-2">{opp.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-xs text-neutral-400">{opp.department || opp.subtier}</span>
                        {opp.solicitationNumber && (
                          <span className="text-xs font-mono text-neutral-400">#{opp.solicitationNumber}</span>
                        )}
                      </div>
                    </div>
                    {opp.uiLink && (
                      <a
                        href={opp.uiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
                      >
                        View on SAM.gov
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opp.baseType && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {noticeTypes.find(t => t.value === opp.baseType)?.label || opp.baseType}
                      </span>
                    )}
                    {opp.naicsCode && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">
                        NAICS: {opp.naicsCode}
                      </span>
                    )}
                    {opp.typeOfSetAsideDescription && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700">
                        {opp.typeOfSetAsideDescription}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-500">
                      Posted: {formatDate(opp.postedDate)}
                    </span>
                    {opp.responseDeadLine && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isExpired ? 'bg-neutral-100 text-neutral-400 line-through' :
                        isUrgent ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        Due: {formatDate(opp.responseDeadLine)}
                        {days !== null && days >= 0 && ` (${days}d)`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Data Source */}
      <p className="mt-6 text-xs text-neutral-400 text-center">
        Data from <a href="https://sam.gov" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-700">SAM.gov</a> — the official U.S. government system for procurement opportunities.
      </p>
    </div>
  );
}

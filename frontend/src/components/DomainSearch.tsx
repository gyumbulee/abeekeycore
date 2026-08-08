'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, DomainSearchResult } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function DomainSearch() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'searching' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const keyword = query.trim().split('.')[0].replace(/[^a-zA-Z0-9-]/g, '');
    if (!keyword) return;

    setStatus('searching');
    setError('');
    try {
      const res = await api.searchDomains(keyword);
      setResults(res.data);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
      setStatus('error');
    }
  }

  function handleRegister(result: DomainSearchResult) {
    const keyword = query.trim().split('.')[0].replace(/[^a-zA-Z0-9-]/g, '');
    const target = `/portal/domains/register?domain=${encodeURIComponent(keyword)}&tld=${encodeURIComponent(result.tld)}`;
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(target)}`);
    } else {
      router.push(target);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find your perfect domain — e.g. yourbusiness"
          className="flex-1 px-5 py-4 rounded-sm text-[15px] border border-white/15 bg-white/[0.07] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-accent backdrop-blur"
        />
        <button
          type="submit"
          disabled={status === 'searching'}
          className="px-7 py-4 rounded-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent shadow-[0_4px_18px_rgba(37,99,235,0.35)] disabled:opacity-60 whitespace-nowrap"
        >
          {status === 'searching' ? 'Searching...' : 'Search Domains'}
        </button>
      </form>

      {error && <p className="text-danger text-sm text-center mb-4">{error}</p>}

      {status === 'done' && (
        <div className="bg-white/[0.06] border border-white/10 backdrop-blur rounded-md divide-y divide-white/10 overflow-hidden">
          {results.map((r) => (
            <div key={r.domain} className="flex items-center justify-between px-5 py-4">
              <div>
                <span className="text-white font-medium">{r.domain}</span>
                {r.available === null && (
                  <span className="block text-white/40 text-xs mt-0.5">Couldn&apos;t check availability</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {r.available ? (
                  <>
                    <span className="text-[#93c5fd] text-sm font-mono">
                      ₦{r.price.toLocaleString()}/yr
                    </span>
                    <button
                      onClick={() => handleRegister(r)}
                      className="px-4 py-2 rounded-sm text-sm font-semibold text-white bg-gradient-to-br from-blue-primary to-blue-accent"
                    >
                      Register
                    </button>
                  </>
                ) : r.available === false ? (
                  <span className="text-white/40 text-sm">Taken</span>
                ) : (
                  <span className="text-white/40 text-sm">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
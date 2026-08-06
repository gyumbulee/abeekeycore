'use client';

import { useEffect, useState } from 'react';
import { api, Contract } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getContracts()
      .then((res) => setContracts(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load contracts.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-heading font-bold text-navy-primary text-2xl mb-8">Contracts</h1>

      {loading && <p className="text-text-soft text-sm">Loading contracts...</p>}
      {error && <p className="text-danger text-sm">{error}</p>}

      {!loading && !error && contracts.length === 0 && (
        <p className="text-text-soft text-sm">You don&apos;t have any contracts yet.</p>
      )}

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white border border-slate-200 rounded-[20px] p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-navy-secondary font-semibold">
                {contract.contract_number}
              </span>
              <StatusBadge status={contract.status} />
            </div>
            <h3 className="font-heading font-semibold text-navy-primary mb-1">{contract.title}</h3>
            {contract.summary && <p className="text-text-soft text-sm mb-3">{contract.summary}</p>}
            <p className="text-text-soft text-xs">
              {formatDate(contract.start_date)} — {formatDate(contract.end_date)}
            </p>
            {contract.file_path && (
              <a
                href={contract.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-blue-primary font-medium hover:underline"
              >
                View signed document →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
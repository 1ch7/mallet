import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Shield, TrendingUp, Calendar, Activity, Wallet, Loader2 } from 'lucide-react';
import { analyzeWallet, type WalletAnalysisResponse } from '../lib/api';

interface AccountResultsProps {
  walletAddress: string;
}

interface MaliciousAddress {
  address: string;
  count: number;
}

export function AccountResults({ walletAddress }: AccountResultsProps) {
  const [result, setResult] = useState<WalletAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setResult(null);

    analyzeWallet(walletAddress)
      .then((data) => {
        if (!cancelled) {
          setResult(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to analyze wallet');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const daysOld = useMemo(() => {
    if (!result?.creation_date) {
      return null;
    }

    const createdAt = new Date(result.creation_date).getTime();
    if (Number.isNaN(createdAt)) {
      return null;
    }

    return Math.max(0, Math.floor((Date.now() - createdAt) / 86400000));
  }, [result?.creation_date]);

  const status: 'Unverified' | 'Safe' | 'Suspicious' | 'Malicious' = useMemo(() => {
    if (!result) {
      return 'Unverified';
    }

    const flaggedCount = result.total_flagged_count ?? 0;
    const transactionCount = result.total_transactions_6months ?? 0;

    if (flaggedCount > 0) {
      return 'Malicious';
    }

    if (transactionCount === 0 || (daysOld !== null && daysOld < 365)) {
      return 'Suspicious';
    }

    return 'Safe';
  }, [daysOld, result]);

  const balance = result?.balance || 'N/A';
  const lastTransaction = result?.last_transaction
    ? new Date(result.last_transaction).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';
  const transactionsLast6Months = result?.total_transactions_6months ?? 0;

  const maliciousAddresses: MaliciousAddress[] = Object.entries(result?.flagged_interactions ?? {}).map(
    ([address, count]) => ({ address, count })
  );

  const statusConfig = {
    Unverified: { color: 'bg-gray-500', textColor: 'text-gray-200', borderColor: 'border-gray-500/30' },
    Safe: { color: 'bg-green-500', textColor: 'text-green-200', borderColor: 'border-green-500/30' },
    Suspicious: { color: 'bg-yellow-500', textColor: 'text-yellow-200', borderColor: 'border-yellow-500/30' },
    Malicious: { color: 'bg-red-500', textColor: 'text-red-200', borderColor: 'border-red-500/30' },
  };

  const currentStatus = statusConfig[status];

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
        <div className="flex items-center justify-center gap-3 text-blue-200">
          <Loader2 className="w-5 h-5 animate-spin" />
          Analyzing wallet...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 rounded-2xl border border-red-500/30 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-300 mt-1 shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Unable to check account</h3>
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-black/40 rounded-xl p-4 border border-white/10">
            <p className="text-blue-200 text-sm mb-2">Wallet ID</p>
            <p className="text-white font-mono text-sm break-all">{result?.address || walletAddress}</p>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-white/10">
            <p className="text-blue-200 text-sm mb-2">Status</p>
            <div className="flex items-center gap-2">
              <span className={`${currentStatus.color} ${currentStatus.textColor} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2`}>
                <Shield className="w-4 h-4" />
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <p className="text-blue-200 text-sm">Balance</p>
          </div>
          <p className="text-2xl font-bold text-white">{balance}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <p className="text-blue-200 text-sm">Days Old</p>
            </div>
            <p className="text-white font-semibold">{daysOld === null ? 'Unknown' : `${daysOld.toLocaleString()} days`}</p>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <p className="text-blue-200 text-sm">Last Transaction</p>
            </div>
            <p className="text-white font-semibold">{lastTransaction}</p>
          </div>

          <div className="bg-black/40 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <p className="text-blue-200 text-sm">Transactions Last 6 Months</p>
            </div>
            <p className="text-white font-semibold">{transactionsLast6Months}</p>
          </div>
        </div>

        {maliciousAddresses.length > 0 && (
          <div className="bg-red-500/10 rounded-xl p-5 border border-red-500/30">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Flagged Malicious Addresses ({maliciousAddresses.length})</h3>
            </div>
            <div className="space-y-2">
              {maliciousAddresses.map((addr, index) => (
                <div key={index} className="bg-black/40 rounded-lg p-3 border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-mono text-sm break-all">{addr.address}</p>
                      <p className="text-red-200 text-xs mt-1">{addr.count} interaction{addr.count === 1 ? '' : 's'}</p>
                    </div>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold ml-3 whitespace-nowrap">
                      Malicious
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

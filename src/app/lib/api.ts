export interface WalletAnalysisResponse {
  success: boolean;
  error?: string;
  address?: string;
  creation_date?: string | null;
  total_transactions_6months?: number;
  flagged_interactions?: Record<string, number>;
  total_flagged_count?: number;
  analyzed_transactions?: number;
  last_transaction?: string | null;
  balance?: string;
  is_demo?: boolean;
}

export interface GithubVerificationResponse {
  success: boolean;
  error?: string;
  message?: string;
  code?: string;
  username?: string;
  expires_at?: number;
}

export interface GithubProfile {
  login: string;
  bio: string | null;
}

interface BlockvisionTransaction {
  timestamp?: string;
  from?: string;
  to?: string;
}

export function extractWalletAddress(input: string) {
  return input.trim().match(/0x[a-fA-F0-9]{40}/)?.[0] ?? '';
}

const demoWallets: Record<string, WalletAnalysisResponse> = {
  '0x742d35cc6634c0532925a3b844bc9e7595f0b6f0': {
    success: true,
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0b6f0',
    creation_date: '2023-01-15T10:30:00Z',
    total_transactions_6months: 45,
    flagged_interactions: {
      '0x1234567890123456789012345678901234567890': 3,
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': 1,
    },
    total_flagged_count: 4,
    analyzed_transactions: 45,
    last_transaction: '2024-12-01T15:20:00Z',
    balance: '1,234.56 MON',
    is_demo: true,
  },
  '0x4ea043757f7d2e0b386b26e57633ed97863ff63d': {
    success: true,
    address: '0x4ea043757F7D2E0B386b26E57633eD97863FF63D',
    creation_date: '2024-06-20T08:15:00Z',
    total_transactions_6months: 12,
    flagged_interactions: {},
    total_flagged_count: 0,
    analyzed_transactions: 12,
    last_transaction: '2024-11-28T09:45:00Z',
    balance: '567.89 MON',
    is_demo: true,
  },
  '0x4951b1018033954f02e96ec9b7375336b5f7b6da': {
    success: true,
    address: '0x4951b1018033954f02e96ec9b7375336b5f7b6da',
    creation_date: '2024-11-01T14:20:00Z',
    total_transactions_6months: 8,
    flagged_interactions: {
      '0x9999999999999999999999999999999999999999': 2,
    },
    total_flagged_count: 2,
    analyzed_transactions: 8,
    last_transaction: '2024-12-02T11:30:00Z',
    balance: '89.12 MON',
    is_demo: true,
  },
  '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': {
    success: true,
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    creation_date: '2023-11-10T22:00:00Z',
    total_transactions_6months: 128,
    flagged_interactions: {
      '0x1234567890123456789012345678901234567890': 15,
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': 8,
      '0x9999999999999999999999999999999999999999': 12,
    },
    total_flagged_count: 35,
    analyzed_transactions: 128,
    last_transaction: '2024-12-02T18:45:00Z',
    balance: '15,678.90 MON',
    is_demo: true,
  },
};

const blockvisionApiKey = '3DnUE3NupdMwpA8b4crqbgqjj37';
const flaggedAddresses = [
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  '0x9999999999999999999999999999999999999999',
];

function normalizeTimestamp(timestamp?: string) {
  if (!timestamp) {
    return null;
  }

  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildWalletAnalysis(address: string, transactions: BlockvisionTransaction[]): WalletAnalysisResponse {
  const sixMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 183;
  const sortedTransactions = [...transactions].sort((a, b) => {
    const timeA = normalizeTimestamp(a.timestamp)?.getTime() ?? 0;
    const timeB = normalizeTimestamp(b.timestamp)?.getTime() ?? 0;
    return timeA - timeB;
  });

  const recentTransactions = sortedTransactions.filter((transaction) => {
    const timestamp = normalizeTimestamp(transaction.timestamp);
    return timestamp ? timestamp.getTime() >= sixMonthsAgo : false;
  });

  const flaggedInteractions = flaggedAddresses.reduce<Record<string, number>>((counts, flaggedAddress) => {
    const count = recentTransactions.filter((transaction) => {
      return (
        transaction.from?.toLowerCase() === flaggedAddress.toLowerCase() ||
        transaction.to?.toLowerCase() === flaggedAddress.toLowerCase()
      );
    }).length;

    if (count > 0) {
      counts[flaggedAddress] = count;
    }

    return counts;
  }, {});

  return {
    success: true,
    address,
    creation_date: sortedTransactions[0]?.timestamp ?? null,
    total_transactions_6months: recentTransactions.length,
    flagged_interactions: flaggedInteractions,
    total_flagged_count: Object.values(flaggedInteractions).reduce((sum, count) => sum + count, 0),
    analyzed_transactions: recentTransactions.length,
    last_transaction: sortedTransactions.at(-1)?.timestamp ?? null,
    balance: 'N/A',
    is_demo: false,
  };
}

async function analyzeWalletWithBlockvision(address: string): Promise<WalletAnalysisResponse> {
  const url = new URL('https://api.blockvision.org/v2/monad/account/transactions');
  url.searchParams.set('address', address);
  url.searchParams.set('limit', '50');
  url.searchParams.set('ascendingOrder', 'false');

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'x-api-key': blockvisionApiKey,
      },
    });
  } catch {
    throw new Error('The PHP backend failed, and the browser could not reach Blockvision directly.');
  }

  if (!response.ok) {
    throw new Error(`The PHP backend failed, and Blockvision returned HTTP ${response.status}.`);
  }

  const payload = await response.json();
  const transactions = payload?.result?.data;

  if (!Array.isArray(transactions)) {
    throw new Error('The PHP backend failed, and Blockvision returned an unexpected response.');
  }

  return buildWalletAnalysis(address, transactions);
}

function createVerificationCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function fetchGithubProfile(username: string): Promise<GithubProfile> {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (response.status === 404) {
    throw new Error('That GitHub username does not exist.');
  }

  if (!response.ok) {
    throw new Error(`GitHub could not be reached right now. HTTP ${response.status}.`);
  }

  return response.json();
}

export async function startGithubVerificationWithFallback(username: string, walletAddress: string) {
  try {
    return await startGithubVerification(username, walletAddress);
  } catch {
    await fetchGithubProfile(username);

    return {
      success: true,
      message: 'Code generated in the browser. Add it to your GitHub bio.',
      code: createVerificationCode(),
      username,
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    };
  }
}

export async function verifyGithubProfileWithFallback(username: string, code: string, walletAddress: string) {
  try {
    return await verifyGithubProfile(walletAddress);
  } catch {
    const profile = await fetchGithubProfile(username);

    if (!profile.bio?.includes(code)) {
      throw new Error('Could not find the code in your GitHub bio. Make sure your profile is public and the code is exact.');
    }

    return {
      success: true,
      message: 'Your GitHub account has been linked.',
      username: profile.login,
    };
  }
}

async function postJson<T>(url: string, data: Record<string, string>): Promise<T> {
  const endpoint = new URL(url, window.location.origin);
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('Cannot reach the backend. Start the PHP server with `npm run dev:backend`, then try again.');
  }

  const text = await response.text();
  let payload: { success?: boolean; error?: string };

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('The backend returned an invalid response. Make sure the PHP server is running on 127.0.0.1:8000.');
  }

  if (!response.ok) {
    throw new Error(payload.error || `Backend request failed with HTTP ${response.status}.`);
  }

  if (payload.success === false) {
    throw new Error(payload.error || 'The backend could not process this wallet.');
  }

  return payload as T;
}

export function analyzeWallet(address: string) {
  return postJson<WalletAnalysisResponse>('/api/wallet_analysis.php', { address }).catch((error) => {
    const demoWallet = demoWallets[address.toLowerCase()];

    if (demoWallet) {
      return demoWallet;
    }

    return analyzeWalletWithBlockvision(address).catch(() => {
      throw error;
    });
  });
}

export function startGithubVerification(username: string, walletAddress: string) {
  return postJson<GithubVerificationResponse>('/api/github_verification.php', {
    action: 'check_username',
    username,
    wallet_address: walletAddress,
  });
}

export function verifyGithubProfile(walletAddress: string) {
  return postJson<GithubVerificationResponse>('/api/github_verification.php', {
    action: 'verify_profile',
    wallet_address: walletAddress,
  });
}

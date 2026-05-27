import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Twitter, Facebook, MessageCircle, Instagram, Wallet, Check, Github, Loader2 } from 'lucide-react';
import { VerificationModal } from './VerificationModal';
import { extractWalletAddress } from '../lib/api';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const platforms: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: <Twitter className="w-8 h-8" />,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="w-8 h-8" />,
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: <Github className="w-8 h-8" />,
    color: 'from-gray-600 to-gray-800',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: <MessageCircle className="w-8 h-8" />,
    color: 'from-indigo-400 to-indigo-600',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="w-8 h-8" />,
    color: 'from-pink-400 to-purple-600',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    color: 'from-cyan-400 to-pink-500',
  },
];

export function ConnectWalletPage() {
  const navigate = useNavigate();
  const [walletId, setWalletId] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, string>>({});
  const [walletSignature, setWalletSignature] = useState('');
  const [walletError, setWalletError] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState(false);

  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const address = extractWalletAddress(walletId);

    if (address) {
      setWalletId(address);
      setWalletConnected(true);
      setWalletError(null);
    } else {
      setWalletError('Enter a valid wallet address, or use MetaMask to connect.');
    }
  };

  const handleMetaMaskConnect = async () => {
    setWalletError(null);
    setConnectingWallet(true);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask was not detected. Install MetaMask or paste your wallet address manually.');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accountList = Array.isArray(accounts) ? accounts : [];
      const address = String(accountList[0] || '');

      if (!address) {
        throw new Error('No wallet address was returned by MetaMask.');
      }

      const message = 'Verify wallet ownership';
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      setWalletId(address);
      setWalletSignature(String(signature || ''));
      setWalletConnected(true);
    } catch (err) {
      setWalletError(err instanceof Error ? err.message : 'Unable to connect MetaMask');
    } finally {
      setConnectingWallet(false);
    }
  };

  const handlePlatformVerified = (platformId: string, username: string) => {
    setConnectedPlatforms(prev => ({
      ...prev,
      [platformId]: username
    }));
  };

  if (!walletConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-blue-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="max-w-md mx-auto">
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Connect Your Wallet</h1>
            <p className="text-blue-200">
              Enter your wallet ID to continue
            </p>
          </header>

          <form onSubmit={handleWalletSubmit}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <label className="block text-white font-medium mb-3">
                Wallet ID
              </label>
              <input
                type="text"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                placeholder="Enter your wallet address (0x...)"
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 transition-colors mb-4"
                autoFocus
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Continue
              </button>

              <div className="my-4 flex items-center gap-3 text-blue-200">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-wider">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleMetaMaskConnect}
                disabled={connectingWallet}
                className="w-full border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {connectingWallet ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                Connect MetaMask
              </button>

              {walletError && (
                <p className="mt-4 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  {walletError}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-white hover:text-blue-200 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </button>

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Connect Social Media</h1>
          <p className="text-blue-200">
            Choose a platform to verify with your wallet
          </p>
          <div className="mt-4 inline-block bg-black/40 px-4 py-2 rounded-lg border border-white/20">
            <p className="text-sm text-blue-200">Wallet: <span className="text-white font-mono">{walletId}</span></p>
            {walletSignature && <p className="text-xs text-green-300 mt-1">Ownership signature captured</p>}
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const isConnected = connectedPlatforms[platform.id];
            return (
              <button
                key={platform.id}
                onClick={() => !isConnected && setSelectedPlatform(platform)}
                className={`bg-white/10 backdrop-blur-lg border rounded-xl p-6 transition-all ${
                  isConnected
                    ? 'border-green-500/40 cursor-default'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/20 transform hover:scale-105'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${platform.color} rounded-full flex items-center justify-center mb-4 text-white relative`}>
                    {platform.icon}
                    {isConnected && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{platform.name}</h3>
                  {isConnected ? (
                    <>
                      <span className="text-sm text-green-400 font-semibold mb-1">Connected</span>
                      <span className="text-xs text-blue-200">{isConnected}</span>
                    </>
                  ) : (
                    <span className="text-sm text-blue-200">Connect & Verify</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedPlatform && (
        <VerificationModal
          platform={selectedPlatform}
          walletAddress={walletId}
          onClose={() => setSelectedPlatform(null)}
          onVerified={(username) => handlePlatformVerified(selectedPlatform.id, username)}
        />
      )}
    </div>
  );
}

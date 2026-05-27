import { Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface WalletInfoProps {
  address: string;
}

export function WalletInfo({ address }: WalletInfoProps) {
  const [copied, setCopied] = useState(false);
  const balance = "100.5 ETH"; // Mock balance

  const copyAddress = async () => {
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = address;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Failed to copy:', fallbackErr);
      }
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Your Wallet</h2>
          <p className="text-blue-200 text-sm">Connected and active</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-black/20 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Wallet Address</p>
          <div className="flex items-center justify-between">
            <p className="text-white font-mono">{shortenAddress(address)}</p>
            <button
              onClick={copyAddress}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-blue-300" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-black/20 rounded-xl p-4">
          <p className="text-blue-200 text-sm mb-1">Balance</p>
          <p className="text-2xl font-bold text-white">{balance}</p>
        </div>
      </div>
    </div>
  );
}

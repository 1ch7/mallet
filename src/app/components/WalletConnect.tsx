import { Wallet } from 'lucide-react';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const handleConnect = async () => {
    // Mock wallet connection - in a real app, this would integrate with MetaMask, WalletConnect, etc.
    const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
    onConnect(mockAddress);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-blue-200">
            Connect your blockchain wallet to verify your social media accounts
          </p>
        </div>

        <button
          onClick={handleConnect}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Connect Wallet
        </button>

        <div className="mt-6 text-center text-sm text-blue-200">
          <p>Supported wallets: MetaMask, WalletConnect, Coinbase Wallet</p>
        </div>
      </div>
    </div>
  );
}

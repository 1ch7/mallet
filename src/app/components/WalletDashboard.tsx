import { useState } from 'react';
import { WalletInfo } from './WalletInfo';
import { SocialMediaConnections } from './SocialMediaConnections';
import { LogOut } from 'lucide-react';

interface WalletDashboardProps {
  walletAddress: string;
  onDisconnect: () => void;
}

export function WalletDashboard({ walletAddress, onDisconnect }: WalletDashboardProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={onDisconnect}
          className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg transition-colors border border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <WalletInfo address={walletAddress} />
        <SocialMediaConnections walletAddress={walletAddress} />
      </div>
    </div>
  );
}

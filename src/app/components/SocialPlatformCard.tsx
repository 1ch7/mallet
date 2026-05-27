import { CheckCircle, Link2, Unlink } from 'lucide-react';
import { useState } from 'react';
import { VerificationModal } from './VerificationModal';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  username?: string;
  verified: boolean;
}

interface SocialPlatformCardProps {
  platform: SocialPlatform;
  walletAddress: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SocialPlatformCard({
  platform,
  walletAddress,
  onConnect,
  onDisconnect
}: SocialPlatformCardProps) {
  const [showVerification, setShowVerification] = useState(false);

  const handleConnectClick = () => {
    setShowVerification(true);
  };

  const handleVerificationComplete = () => {
    setShowVerification(false);
    onConnect();
  };

  return (
    <>
      <div className="bg-black/20 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center text-white`}>
              {platform.icon}
            </div>
            <div>
              <h3 className="font-semibold text-white">{platform.name}</h3>
              {platform.verified && platform.username && (
                <p className="text-sm text-blue-200">@{platform.username}</p>
              )}
            </div>
          </div>
          {platform.verified && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
        </div>

        {platform.verified ? (
          <button
            onClick={onDisconnect}
            className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 py-2 px-4 rounded-lg transition-colors border border-red-500/30"
          >
            <Unlink className="w-4 h-4" />
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnectClick}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors border border-white/20"
          >
            <Link2 className="w-4 h-4" />
            Connect & Verify
          </button>
        )}
      </div>

      {showVerification && (
        <VerificationModal
          platform={platform}
          walletAddress={walletAddress}
          onClose={() => setShowVerification(false)}
          onVerified={handleVerificationComplete}
        />
      )}
    </>
  );
}

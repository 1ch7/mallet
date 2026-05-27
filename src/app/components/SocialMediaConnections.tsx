import { useState } from 'react';
import { SocialPlatformCard } from './SocialPlatformCard';
import { Twitter, MessageCircle, Instagram, Github, Linkedin } from 'lucide-react';

interface SocialMediaConnectionsProps {
  walletAddress: string;
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  username?: string;
  verified: boolean;
}

export function SocialMediaConnections({ walletAddress }: SocialMediaConnectionsProps) {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="w-6 h-6" />,
      color: 'from-blue-400 to-blue-600',
      verified: false,
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'from-indigo-400 to-indigo-600',
      verified: false,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-6 h-6" />,
      color: 'from-pink-400 to-purple-600',
      verified: false,
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: <Github className="w-6 h-6" />,
      color: 'from-gray-400 to-gray-600',
      verified: false,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-700',
      verified: false,
    },
  ]);

  const handleConnect = (platformId: string) => {
    setPlatforms(platforms.map(platform => {
      if (platform.id === platformId) {
        // Mock verification process
        return {
          ...platform,
          username: `user_${Math.random().toString(36).slice(2, 9)}`,
          verified: true,
        };
      }
      return platform;
    }));
  };

  const handleDisconnect = (platformId: string) => {
    setPlatforms(platforms.map(platform => {
      if (platform.id === platformId) {
        return {
          ...platform,
          username: undefined,
          verified: false,
        };
      }
      return platform;
    }));
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Social Media Verification</h2>
        <p className="text-blue-200">
          Connect and verify your social media accounts with your wallet
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {platforms.map((platform) => (
          <SocialPlatformCard
            key={platform.id}
            platform={platform}
            walletAddress={walletAddress}
            onConnect={() => handleConnect(platform.id)}
            onDisconnect={() => handleDisconnect(platform.id)}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
        <p className="text-sm text-blue-200">
          <strong className="text-white">How it works:</strong> When you connect a social platform,
          you'll sign a message with your wallet. This proves you own both the wallet address and
          the social media account, creating a verifiable link between them.
        </p>
      </div>
    </div>
  );
}

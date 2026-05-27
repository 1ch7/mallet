import { useState, useEffect } from 'react';
import { X, Clock, Copy, Check, User, AlertTriangle, Loader2 } from 'lucide-react';
import { startGithubVerificationWithFallback, verifyGithubProfileWithFallback } from '../lib/api';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface VerificationModalProps {
  platform: SocialPlatform;
  walletAddress?: string;
  onClose: () => void;
  onVerified: (username: string) => void;
}

export function VerificationModal({ platform, walletAddress = '', onClose, onVerified }: VerificationModalProps) {
  const [step, setStep] = useState<'username' | 'code' | 'success'>('username');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState(() =>
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isGithub = platform.id === 'github';

  useEffect(() => {
    if (step === 'code') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = verificationCode;
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

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim().replace(/^@/, '');

    if (!trimmedUsername) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isGithub) {
        const response = await startGithubVerificationWithFallback(trimmedUsername, walletAddress);
        if (response.code) {
          setVerificationCode(response.code);
        }
      }

      setUsername(trimmedUsername);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to verify ${platform.name} username`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAccount = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isGithub) {
        await verifyGithubProfileWithFallback(username, verificationCode, walletAddress);
      }

      setStep('success');
      setTimeout(() => {
        onVerified(username);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to verify ${platform.name} account`);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'username') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center text-white`}>
                {platform.icon}
              </div>
              <h2 className="text-xl font-bold text-white">Connect {platform.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <form onSubmit={handleUsernameSubmit} className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-400" />
                <label className="text-white font-medium">
                  Enter your {platform.name} username
                </label>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`@username`}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 transition-colors"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Verification Status</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Verification Successful!</h3>
            <p className="text-green-200">
              Your {platform.name} account has been successfully verified and linked to your wallet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center text-white`}>
              {platform.icon}
            </div>
            <h2 className="text-xl font-bold text-white">Verify {platform.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <p className="text-blue-200 font-medium">Time Remaining</p>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{formatTime(timeLeft)}</p>
            <p className="text-sm text-blue-300">This code expires in 30 minutes</p>
          </div>

          <div className="bg-black/40 rounded-xl p-6 text-center">
            <p className="text-blue-200 mb-3 font-medium">Your Verification Code</p>
            <div className="bg-black/60 rounded-lg p-4 mb-3">
              <p className="text-4xl font-bold text-white tracking-widest font-mono">
                {verificationCode}
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 mx-auto"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            {isGithub ? (
              <p className="text-sm text-blue-200">
                <strong className="text-white">Instructions:</strong> Add this code to your public GitHub bio, save your profile, then check the account.
              </p>
            ) : (
              <p className="text-sm text-blue-200">
                <strong className="text-white">Instructions:</strong> Post this verification code on your {platform.name} account, then click "Check Account" below to complete verification.
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleCheckAccount}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Check Account
          </button>
        </div>
      </div>
    </div>
  );
}

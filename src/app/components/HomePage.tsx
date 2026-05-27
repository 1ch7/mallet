import { useNavigate } from 'react-router';
import { Wallet, Search, Shield } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">MALLET</h1>
          <p className="text-xl text-blue-200">
            Verify your wallet with social media or check account safety
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/connect-wallet')}
            className="group bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-8 transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
              <p className="text-blue-200">
                Link your wallet to social media platforms and verify ownership
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/check-account')}
            className="group bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-8 transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check an Account</h2>
              <p className="text-blue-200">
                Verify wallet safety and view linked social media accounts
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

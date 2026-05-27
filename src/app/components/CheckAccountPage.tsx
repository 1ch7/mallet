import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search } from 'lucide-react';
import { AccountResults } from './AccountResults';
import { extractWalletAddress } from '../lib/api';

export function CheckAccountPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const address = extractWalletAddress(searchInput);

    if (!address) {
      setSearchedAddress(null);
      setInputError('Enter a valid wallet address, or paste a link that contains one.');
      return;
    }

    setInputError(null);
    setSearchedAddress(address);
  };

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
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Check an Account</h1>
          <p className="text-blue-200">
            Look up wallet information and verify account safety
          </p>
        </header>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <label className="block text-white font-medium mb-3">
              Paste Wallet ID or Profile Link
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setInputError(null);
                }}
                placeholder="0x... or profile URL"
                className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-400 transition-colors"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
            {inputError && (
              <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">
                {inputError}
              </p>
            )}
          </div>
        </form>

        {searchedAddress && <AccountResults key={searchedAddress} walletAddress={searchedAddress} />}
      </div>
    </div>
  );
}

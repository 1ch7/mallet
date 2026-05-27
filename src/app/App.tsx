import { BrowserRouter, Routes, Route } from 'react-router';
import { HomePage } from './components/HomePage';
import { ConnectWalletPage } from './components/ConnectWalletPage';
import { CheckAccountPage } from './components/CheckAccountPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="size-full min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connect-wallet" element={<ConnectWalletPage />} />
          <Route path="/check-account" element={<CheckAccountPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

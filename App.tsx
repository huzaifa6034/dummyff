
import React, { useState, useEffect } from 'react';
import { User, AuthState, UserRole } from './types';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TournamentDetail from './pages/TournamentDetail';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import { db } from './services/mockDb';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const saved = localStorage.getItem('ft_session');
    return saved ? JSON.parse(saved) : { user: null, token: null };
  });

  const [currentPath, setCurrentPath] = useState<string>(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const login = (user: User) => {
    const newAuth = { user, token: 'mock-jwt-token' };
    setAuthState(newAuth);
    localStorage.setItem('ft_session', JSON.stringify(newAuth));
    window.location.hash = '#/';
  };

  const logout = () => {
    setAuthState({ user: null, token: null });
    localStorage.removeItem('ft_session');
    window.location.hash = '#/login';
  };

  const renderPage = () => {
    const hash = currentPath.split('?')[0];
    
    if (hash === '#/login' || hash === '#/register') {
      return <Auth isLogin={hash === '#/login'} onLogin={login} />;
    }

    if (hash === '#/admin') {
      if (!authState.user || authState.user.role !== UserRole.ADMIN) {
        window.location.hash = '#/';
        return null;
      }
      return <AdminDashboard user={authState.user} />;
    }

    if (hash.startsWith('#/tournament/')) {
      const id = hash.split('/').pop();
      return <TournamentDetail tournamentId={id || ''} user={authState.user} />;
    }

    return <Home user={authState.user} />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={authState.user} onLogout={logout} />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {renderPage()}
      </main>
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-slate-500">
        <p>© 2024 FireTourney Pro. Built for champions.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-orange-500 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;

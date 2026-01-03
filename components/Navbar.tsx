
import React from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-7xl">
        <a href="#/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <span className="text-2xl font-rajdhani font-bold tracking-wider text-white">
            FIRE<span className="text-orange-500">TOURNEY</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#/" className="text-slate-300 hover:text-white transition-colors">Home</a>
          <a href="#/tournaments" className="text-slate-300 hover:text-white transition-colors">Tournaments</a>
          <a href="#/leaderboard" className="text-slate-300 hover:text-white transition-colors">Ranking</a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.role === UserRole.ADMIN && (
                <a 
                  href="#/admin" 
                  className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Admin
                </a>
              )}
              <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                <span className="text-sm font-medium text-slate-200">{user.username}</span>
                <button 
                  onClick={onLogout}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <a href="#/login" className="text-white px-5 py-2 hover:text-orange-500 transition-colors font-medium">Login</a>
              <a href="#/register" className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-all font-semibold shadow-lg shadow-orange-600/20">Register</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

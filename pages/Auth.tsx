
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/mockDb';

interface AuthProps {
  isLogin: boolean;
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ isLogin, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = db.users.getAll().find(u => u.email === formData.email);
      if (user) {
        onLogin(user);
      } else {
        setError('User not found. Try registering!');
      }
    } else {
      const existing = db.users.getAll().find(u => u.email === formData.email || u.username === formData.username);
      if (existing) {
        setError('Username or email already exists.');
        return;
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: formData.username,
        email: formData.email,
        role: UserRole.PLAYER,
        createdAt: new Date().toISOString()
      };
      
      db.users.add(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-rajdhani font-bold text-white">
            {isLogin ? 'Welcome Back' : 'Join the Elite'}
          </h2>
          <p className="text-slate-500">
            {isLogin ? 'Enter your credentials to continue' : 'Create an account to start playing'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-slate-400 text-sm font-medium ml-1">Username</label>
              <input 
                required
                type="text" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                placeholder="GameMaster99"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-slate-400 text-sm font-medium ml-1">Email Address</label>
            <input 
              required
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-slate-400 text-sm font-medium ml-1">Password</label>
            <input 
              required
              type="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-600/20 transition-all">
            {isLogin ? 'Login Now' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-slate-500">
            {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
            <a href={isLogin ? '#/register' : '#/login'} className="text-orange-500 font-bold hover:text-orange-400">
              {isLogin ? 'Sign Up' : 'Log In'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

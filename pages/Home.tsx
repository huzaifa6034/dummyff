
import React, { useState, useEffect } from 'react';
import { Tournament, TournamentStatus, User } from '../types';
import { db } from '../services/mockDb';

interface HomeProps {
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    setTournaments(db.tournaments.getAll());
  }, []);

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case TournamentStatus.UPCOMING: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case TournamentStatus.ONGOING: return 'bg-green-500/10 text-green-400 border-green-500/20';
      case TournamentStatus.FINISHED: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-orange-800 p-8 md:p-16">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
             <path d="M0 0 L100 100 L100 0 Z" />
           </svg>
        </div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-rajdhani font-extrabold text-white leading-tight">
            PROVE YOUR <span className="text-orange-200">DOMINANCE</span> IN THE ARENA
          </h1>
          <p className="text-orange-100 text-lg md:text-xl font-medium opacity-90">
            Join thousands of players in daily Free Fire tournaments. 
            Win massive rewards and build your legacy as an elite gamer.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <a href="#/tournaments" className="bg-white text-orange-700 px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all shadow-xl shadow-black/20">
              Browse Tournaments
            </a>
            {!user && (
               <a href="#/register" className="bg-black/20 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-xl font-bold hover:bg-black/30 transition-all">
                Create Account
               </a>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: 'Total Players', value: '25,000+' },
          { label: 'Prize Pool', value: '$12,400' },
          { label: 'Active Tourneys', value: '12' },
          { label: 'Winners Paid', value: '1,500' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
            <p className="text-3xl font-rajdhani font-bold text-white mb-1">{stat.value}</p>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Tournament Listings */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-rajdhani font-bold text-white">Active Tournaments</h2>
          <a href="#/tournaments" className="text-orange-500 hover:text-orange-400 font-medium flex items-center gap-2">
            View All <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
               <p className="text-slate-500 text-lg">No tournaments found. Check back later!</p>
            </div>
          ) : (
            tournaments.map((t) => (
              <div key={t.id} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all flex flex-col">
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  <img src={`https://picsum.photos/seed/${t.id}/600/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={t.name} />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <p className="text-white font-rajdhani text-xl font-bold drop-shadow-lg">{t.name}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4 flex-grow flex flex-col">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Prize Pool</span>
                    <span className="text-orange-500 font-bold">{t.prizePool}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Entry Type</span>
                    <span className="text-slate-200 capitalize">{t.type.replace('_', ' ').toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Slots</span>
                    <span className="text-slate-200 font-medium">{t.currentParticipants} / {t.maxParticipants}</span>
                  </div>
                  <div className="pt-4 mt-auto">
                    <a 
                      href={`#/tournament/${t.id}`}
                      className="block w-full text-center bg-slate-800 group-hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold transition-all"
                    >
                      {t.status === TournamentStatus.UPCOMING ? 'Register Now' : 'View Details'}
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

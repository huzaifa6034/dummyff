
import React, { useState, useEffect } from 'react';
import { Tournament, TournamentStatus, TournamentType, User, Match } from '../types';
import { db } from '../services/mockDb';
import { generateBrackets, advanceWinner } from '../services/tournamentLogic';

interface AdminDashboardProps {
  user: User;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: TournamentType.SINGLE_ELIMINATION,
    prizePool: '',
    maxParticipants: 8,
    startDate: ''
  });

  useEffect(() => {
    setTournaments(db.tournaments.getAll());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTournament: Tournament = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: TournamentStatus.UPCOMING,
      currentParticipants: 0,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };
    db.tournaments.add(newTournament);
    setTournaments([...tournaments, newTournament]);
    setShowCreateModal(false);
  };

  const startTournament = (tId: string) => {
    const t = db.tournaments.getById(tId);
    const participants = db.participants.getByTournament(tId);
    
    if (!t) return;

    // Generate matches
    const matches = generateBrackets(tId, participants, t.type);
    db.matches.setAll(matches);
    
    const updated = { ...t, status: TournamentStatus.ONGOING };
    db.tournaments.update(updated);
    setTournaments(tournaments.map(curr => curr.id === tId ? updated : curr));
  };

  const deleteTournament = (tId: string) => {
    if (confirm('Are you sure you want to delete this tournament?')) {
      db.tournaments.delete(tId);
      setTournaments(tournaments.filter(t => t.id !== tId));
    }
  };

  const updateMatchWinner = (match: Match, winnerId: string) => {
     const tId = match.tournamentId;
     const allMatches = db.matches.getByTournament(tId);
     
     const updatedMatch = { ...match, winnerId, status: 'COMPLETED' as const };
     const nextMatches = advanceWinner(allMatches, updatedMatch, winnerId);
     
     // Update storage
     db.matches.update(updatedMatch);
     db.matches.setAll(nextMatches);

     // If it's the last round, finish the tournament
     const maxRound = Math.max(...allMatches.map(m => m.round));
     if (match.round === maxRound) {
        const t = db.tournaments.getById(tId);
        if (t) {
          const finished = { ...t, status: TournamentStatus.FINISHED };
          db.tournaments.update(finished);
          setTournaments(tournaments.map(curr => curr.id === tId ? finished : curr));
        }
     }
     
     // Refresh state (simplified)
     window.location.reload(); 
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-rajdhani font-bold text-white">Management Console</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Tournament
        </button>
      </div>

      <div className="grid gap-6">
        {tournaments.map(t => {
          const matches = db.matches.getByTournament(t.id);
          const activeMatches = matches.filter(m => m.status === 'PENDING' && m.player1Id && m.player2Id);

          return (
            <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-rajdhani font-bold text-white">{t.name}</h3>
                  <p className="text-slate-500 text-sm">Status: <span className="text-slate-300 font-bold uppercase">{t.status}</span> • Type: {t.type}</p>
                </div>
                <div className="flex gap-2">
                   {t.status === TournamentStatus.UPCOMING && (
                     <button 
                      onClick={() => startTournament(t.id)}
                      className="bg-green-600/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 hover:text-white transition-all"
                     >
                       Generate Bracket
                     </button>
                   )}
                   <button 
                    onClick={() => deleteTournament(t.id)}
                    className="bg-red-600/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all"
                   >
                     Delete
                   </button>
                </div>
              </div>

              {t.status === TournamentStatus.ONGOING && activeMatches.length > 0 && (
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                   <h4 className="text-orange-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                     <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                     Pending Match Decisions
                   </h4>
                   <div className="grid md:grid-cols-2 gap-4">
                      {activeMatches.map(m => (
                        <div key={m.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                           <div className="space-y-2">
                             <button 
                              onClick={() => updateMatchWinner(m, m.player1Id!)}
                              className="w-full text-left px-3 py-1.5 rounded bg-slate-700 hover:bg-orange-600 text-sm text-slate-200 font-medium transition-all"
                             >
                               Set {m.player1Name} as Winner
                             </button>
                             <button 
                              onClick={() => updateMatchWinner(m, m.player2Id!)}
                              className="w-full text-left px-3 py-1.5 rounded bg-slate-700 hover:bg-orange-600 text-sm text-slate-200 font-medium transition-all"
                             >
                               Set {m.player2Name} as Winner
                             </button>
                           </div>
                           <div className="text-center px-4">
                             <span className="text-slate-500 text-xs font-bold uppercase">VS</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                 <h2 className="text-2xl font-rajdhani font-bold text-white">Create New Tournament</h2>
                 <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-slate-400 text-sm font-medium">Tournament Name</label>
                       <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-all" 
                        placeholder="e.g. Winter Clash 2024"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-slate-400 text-sm font-medium">Prize Pool</label>
                       <input 
                        required
                        type="text" 
                        value={formData.prizePool}
                        onChange={e => setFormData({...formData, prizePool: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-all" 
                        placeholder="$1,000"
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-slate-400 text-sm font-medium">Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-all h-24" 
                      placeholder="Tournament details and rules..."
                    />
                 </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-slate-400 text-sm font-medium">Max Participants</label>
                       <select 
                        value={formData.maxParticipants}
                        onChange={e => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-all"
                       >
                         {[4, 8, 16, 32].map(n => <option key={n} value={n}>{n} Players</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-slate-400 text-sm font-medium">Start Date</label>
                       <input 
                        required
                        type="date" 
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-all" 
                       />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-600/20 transition-all">
                    Launch Tournament
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

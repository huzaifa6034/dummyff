
import React, { useState, useEffect } from 'react';
import { Tournament, Match, User, Participant, TournamentStatus } from '../types';
import { db } from '../services/mockDb';

interface TournamentDetailProps {
  tournamentId: string;
  user: User | null;
}

const TournamentDetail: React.FC<TournamentDetailProps> = ({ tournamentId, user }) => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<'bracket' | 'players' | 'info'>('bracket');

  useEffect(() => {
    const t = db.tournaments.getById(tournamentId);
    if (t) {
      setTournament(t);
      setMatches(db.matches.getByTournament(tournamentId));
      setParticipants(db.participants.getByTournament(tournamentId));
    }
  }, [tournamentId]);

  if (!tournament) return <div className="text-center py-20 text-slate-400">Loading Tournament...</div>;

  const isJoined = user && participants.some(p => p.userId === user.id);

  const handleJoin = () => {
    if (!user) {
      window.location.hash = '#/login';
      return;
    }
    if (tournament.currentParticipants >= tournament.maxParticipants) return;

    const newParticipant: Participant = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      tournamentId: tournament.id,
      username: user.username,
      joinedAt: new Date().toISOString()
    };

    db.participants.add(newParticipant);
    const updated = { ...tournament, currentParticipants: tournament.currentParticipants + 1 };
    db.tournaments.update(updated);
    setTournament(updated);
    setParticipants([...participants, newParticipant]);
  };

  const rounds = Array.from({ length: Math.max(...matches.map(m => m.round), 0) }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <img src={`https://picsum.photos/seed/${tournament.id}/800/600`} className="w-full h-64 object-cover" alt={tournament.name} />
          <div className="p-8 space-y-6">
            <h1 className="text-3xl font-rajdhani font-bold text-white">{tournament.name}</h1>
            <p className="text-slate-400 leading-relaxed">{tournament.description}</p>
            
            <div className="space-y-3">
               <div className="flex justify-between py-2 border-b border-slate-800">
                 <span className="text-slate-500">Starts</span>
                 <span className="text-slate-200 font-medium">{new Date(tournament.startDate).toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-slate-800">
                 <span className="text-slate-500">Prize Pool</span>
                 <span className="text-orange-500 font-bold">{tournament.prizePool}</span>
               </div>
               <div className="flex justify-between py-2">
                 <span className="text-slate-500">Slots</span>
                 <span className="text-slate-200 font-medium">{tournament.currentParticipants} / {tournament.maxParticipants}</span>
               </div>
            </div>

            {tournament.status === TournamentStatus.UPCOMING && (
              <button 
                onClick={handleJoin}
                disabled={isJoined || tournament.currentParticipants >= tournament.maxParticipants}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-xl ${
                  isJoined 
                    ? 'bg-green-600/20 text-green-500 border border-green-500/20 cursor-default' 
                    : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20'
                }`}
              >
                {isJoined ? 'Joined Successfully' : 'Register Tournament'}
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 space-y-6">
           <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
              {(['bracket', 'players', 'info'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-bold capitalize transition-all ${
                    activeTab === tab ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-[400px]">
             {activeTab === 'bracket' && (
               <div className="flex overflow-x-auto pb-8 gap-12">
                 {matches.length === 0 ? (
                    <div className="w-full text-center py-20 text-slate-500">Bracket will be generated once tournament starts.</div>
                 ) : (
                    rounds.map(roundNum => (
                      <div key={roundNum} className="flex-shrink-0 w-64 space-y-8">
                         <h3 className="text-slate-500 font-bold text-center border-b border-slate-800 pb-4">Round {roundNum}</h3>
                         <div className="space-y-6 flex flex-col justify-around h-full">
                           {matches.filter(m => m.round === roundNum).map(match => (
                             <div key={match.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                                <div className={`px-4 py-2 border-b border-slate-700 flex justify-between items-center ${match.winnerId === match.player1Id && match.player1Id ? 'bg-orange-600/10' : ''}`}>
                                   <span className={`text-sm font-medium ${match.winnerId === match.player1Id ? 'text-orange-400' : 'text-slate-300'}`}>
                                      {match.player1Name || 'TBD'}
                                   </span>
                                   {match.winnerId === match.player1Id && <span className="text-[10px] bg-orange-600 text-white px-1.5 rounded">WIN</span>}
                                </div>
                                <div className={`px-4 py-2 flex justify-between items-center ${match.winnerId === match.player2Id && match.player2Id ? 'bg-orange-600/10' : ''}`}>
                                   <span className={`text-sm font-medium ${match.winnerId === match.player2Id ? 'text-orange-400' : 'text-slate-300'}`}>
                                      {match.player2Name || 'TBD'}
                                   </span>
                                   {match.winnerId === match.player2Id && <span className="text-[10px] bg-orange-600 text-white px-1.5 rounded">WIN</span>}
                                </div>
                             </div>
                           ))}
                         </div>
                      </div>
                    ))
                 )}
               </div>
             )}

             {activeTab === 'players' && (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {participants.map(p => (
                   <div key={p.id} className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700">
                     <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-orange-500 uppercase">
                        {p.username.charAt(0)}
                     </div>
                     <div>
                       <p className="text-white font-medium">{p.username}</p>
                       <p className="text-slate-500 text-xs">Joined: {new Date(p.joinedAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                 ))}
               </div>
             )}

             {activeTab === 'info' && (
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-white">Tournament Rules</h3>
                  <ul className="text-slate-400 space-y-2">
                    <li>Single elimination format. Losers are immediately out.</li>
                    <li>Players must join the custom room 15 minutes before start.</li>
                    <li>Any use of third-party hacks will result in a permanent ban.</li>
                    <li>Decisions made by tournament admins are final.</li>
                    <li>Rewards will be distributed within 24 hours of completion.</li>
                  </ul>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;

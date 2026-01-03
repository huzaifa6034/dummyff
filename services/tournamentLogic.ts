
import { Match, Participant, TournamentType } from '../types';

export const generateBrackets = (tournamentId: string, participants: Participant[], type: TournamentType): Match[] => {
  const matches: Match[] = [];
  const numParticipants = participants.length;

  // For this implementation, we focus on powers of 2 for simplicity
  // Ideally handle byes for non-powers of 2
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
  const rounds = Math.log2(nextPowerOfTwo);

  let currentRoundMatches: Match[] = [];
  let previousRoundMatches: Match[] = [];

  // Generate from final backwards to associate nextMatchId
  for (let r = rounds; r >= 1; r--) {
    const numMatchesInRound = Math.pow(2, rounds - r);
    const roundMatches: Match[] = [];

    for (let i = 0; i < numMatchesInRound; i++) {
      const matchId = `m-${tournamentId}-${r}-${i}`;
      const match: Match = {
        id: matchId,
        tournamentId,
        round: r,
        player1Id: null,
        player2Id: null,
        winnerId: null,
        status: 'PENDING',
        nextMatchId: null // We'll set this for earlier rounds
      };

      // If this isn't the final round, link it to the next round match
      if (r < rounds) {
        const nextMatchIndex = Math.floor(i / 2);
        match.nextMatchId = `m-${tournamentId}-${r + 1}-${nextMatchIndex}`;
      }

      // Populate players for Round 1
      if (r === 1) {
        const p1 = participants[i * 2];
        const p2 = participants[i * 2 + 1];
        match.player1Id = p1?.userId || null;
        match.player2Id = p2?.userId || null;
        match.player1Name = p1?.username;
        match.player2Name = p2?.username;
        
        // Auto-win if only one player
        if (match.player1Id && !match.player2Id) {
          match.winnerId = match.player1Id;
          match.status = 'COMPLETED';
        }
      }

      roundMatches.push(match);
    }
    matches.push(...roundMatches);
  }

  return matches;
};

export const advanceWinner = (allMatches: Match[], completedMatch: Match, winnerId: string): Match[] => {
  if (!completedMatch.nextMatchId) return allMatches;

  return allMatches.map(m => {
    if (m.id === completedMatch.nextMatchId) {
      // Find which slot in the next match to fill
      // In a binary tree, we check if the match that just finished was the first or second child
      const isFirstChild = allMatches.findIndex(x => x.id === completedMatch.id) % 2 === 0;
      
      return {
        ...m,
        player1Id: isFirstChild ? winnerId : m.player1Id,
        player2Id: !isFirstChild ? winnerId : m.player2Id,
        player1Name: isFirstChild ? (completedMatch.player1Id === winnerId ? completedMatch.player1Name : completedMatch.player2Name) : m.player1Name,
        player2Name: !isFirstChild ? (completedMatch.player1Id === winnerId ? completedMatch.player1Name : completedMatch.player2Name) : m.player2Name
      };
    }
    return m;
  });
};

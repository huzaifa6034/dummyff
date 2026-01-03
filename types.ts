
export enum UserRole {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER'
}

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED'
}

export enum TournamentType {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  type: TournamentType;
  status: TournamentStatus;
  startDate: string;
  maxParticipants: number;
  currentParticipants: number;
  prizePool: string;
  createdBy: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  tournamentId: string;
  username: string;
  joinedAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  player1Id: string | null;
  player2Id: string | null;
  player1Name?: string;
  player2Name?: string;
  winnerId: string | null;
  status: 'PENDING' | 'COMPLETED';
  nextMatchId: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

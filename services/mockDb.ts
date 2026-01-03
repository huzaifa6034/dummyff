
import { Tournament, TournamentStatus, TournamentType, User, UserRole, Match, Participant } from '../types';

// In a real app, these would be calls to Cloudflare D1 and KV.
// We use localStorage to persist state across reloads in this demo environment.

const STORAGE_KEYS = {
  USERS: 'ft_users',
  TOURNAMENTS: 'ft_tournaments',
  PARTICIPANTS: 'ft_participants',
  MATCHES: 'ft_matches',
  SESSIONS: 'ft_sessions'
};

const get = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const set = <T,>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Data if empty
if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
  const adminUser: User = {
    id: '1',
    username: 'AdminPro',
    email: 'admin@firetourney.com',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString()
  };
  set(STORAGE_KEYS.USERS, [adminUser]);
}

export const db = {
  users: {
    getAll: () => get<User>(STORAGE_KEYS.USERS),
    getById: (id: string) => get<User>(STORAGE_KEYS.USERS).find(u => u.id === id),
    add: (user: User) => set(STORAGE_KEYS.USERS, [...get<User>(STORAGE_KEYS.USERS), user])
  },
  tournaments: {
    getAll: () => get<Tournament>(STORAGE_KEYS.TOURNAMENTS),
    getById: (id: string) => get<Tournament>(STORAGE_KEYS.TOURNAMENTS).find(t => t.id === id),
    add: (t: Tournament) => set(STORAGE_KEYS.TOURNAMENTS, [...get<Tournament>(STORAGE_KEYS.TOURNAMENTS), t]),
    update: (updated: Tournament) => {
      const all = get<Tournament>(STORAGE_KEYS.TOURNAMENTS);
      set(STORAGE_KEYS.TOURNAMENTS, all.map(t => t.id === updated.id ? updated : t));
    },
    delete: (id: string) => set(STORAGE_KEYS.TOURNAMENTS, get<Tournament>(STORAGE_KEYS.TOURNAMENTS).filter(t => t.id !== id))
  },
  participants: {
    getByTournament: (tid: string) => get<Participant>(STORAGE_KEYS.PARTICIPANTS).filter(p => p.tournamentId === tid),
    add: (p: Participant) => set(STORAGE_KEYS.PARTICIPANTS, [...get<Participant>(STORAGE_KEYS.PARTICIPANTS), p]),
    remove: (uid: string, tid: string) => set(STORAGE_KEYS.PARTICIPANTS, get<Participant>(STORAGE_KEYS.PARTICIPANTS).filter(p => !(p.userId === uid && p.tournamentId === tid)))
  },
  matches: {
    getByTournament: (tid: string) => get<Match>(STORAGE_KEYS.MATCHES).filter(m => m.tournamentId === tid),
    setAll: (matches: Match[]) => {
       // Filter out existing matches for this tournament and replace
       const others = get<Match>(STORAGE_KEYS.MATCHES).filter(m => m.tournamentId !== matches[0]?.tournamentId);
       set(STORAGE_KEYS.MATCHES, [...others, ...matches]);
    },
    update: (updated: Match) => {
      const all = get<Match>(STORAGE_KEYS.MATCHES);
      set(STORAGE_KEYS.MATCHES, all.map(m => m.id === updated.id ? updated : m));
    }
  }
};

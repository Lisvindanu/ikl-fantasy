import type { IKLPlayer } from '../../api/fantasy';

export type Tab = 'overview' | 'draft' | 'players' | 'leaderboard' | 'matches' | 'team' | 'leagues' | 'predictions' | 'achievements' | 'compare' | 'meta';
export type Role = 'EXP' | 'JGL' | 'MID' | 'GOLD' | 'ROAM';
export type SortBy = 'pts' | 'price' | 'mvps';

export const ROLES: Role[] = ['EXP', 'JGL', 'MID', 'GOLD', 'ROAM'];
export const BUDGET = 100;
export const MAX_PER_TEAM = 2;

export const ROLE_META: Record<Role, { label: string; color: string; img: string; short: string }> = {
  EXP:  { label: 'Clash Laner', short: 'CLASH', color: '#F97316', img: '/assets/lanes/clash-lane.webp' },
  JGL:  { label: 'Jungler',     short: 'JGL',   color: '#22C55E', img: '/assets/lanes/jungle.webp'     },
  MID:  { label: 'Mid Laner',   short: 'MID',   color: '#3B82F6', img: '/assets/lanes/mid-lane.webp'   },
  GOLD: { label: 'Farm Laner',  short: 'FARM',  color: '#EAB308', img: '/assets/lanes/farm-lane.webp'  },
  ROAM: { label: 'Roamer',      short: 'ROAM',  color: '#A855F7', img: '/assets/lanes/roamer.webp'     },
};

export const NAT_FLAG: Record<string, string> = { ID: '🇮🇩', MY: '🇲🇾', CN: '🇨🇳', HK: '🇭🇰', TH: '🇹🇭' };

export const FORMATION_LAYOUT: Role[][] = [
  ['EXP'],
  ['JGL', 'MID'],
  ['ROAM', 'GOLD'],
];

export const BENCH_SLOTS = 2;

export interface DraftProps {
  picks: Record<Role, IKLPlayer | null>;
  setPicks: React.Dispatch<React.SetStateAction<Record<Role, IKLPlayer | null>>>;
  activeRole: Role;
  setActiveRole: (r: Role) => void;
  search: string;
  setSearch: (s: string) => void;
  filterRole: Role | 'ALL';
  setFilterRole: (r: Role | 'ALL') => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  teamName: string;
  setTeamName: (n: string) => void;
  saving: boolean;
  saveMsg: string;
  onSave: () => void;
  onDetail: (p: IKLPlayer) => void;
  isAuthenticated: boolean;
  budget: number;
  budgetLeft: number;
  totalPts: number;
  filledCount: number;
  pickedIds: Set<number>;
  teamCounts: Record<string, number>;
  filteredPlayers: IKLPlayer[];
  roleCounts: Record<string, number>;
  selectPlayer: (p: IKLPlayer) => void;
  captainId: number | null;
  viceCaptainId: number | null;
  setCaptainId: (id: number | null) => void;
  setViceCaptainId: (id: number | null) => void;
  benchPicks: [IKLPlayer | null, IKLPlayer | null];
  setBenchPicks: React.Dispatch<React.SetStateAction<[IKLPlayer | null, IKLPlayer | null]>>;
}

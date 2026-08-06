export type TournamentType = "swiss" | "elimination" | "roundRobin";
export type TournamentStatus = "active" | "completed";
export interface Participant { id: string; name: string; }
export interface Match { id: string; round: number; playerA: string | null; playerB: string | null; scoreA: number | null; scoreB: number | null; winner: string | null; completed: boolean; isBye?: boolean; }
export interface Standing { participantId: string; wins: number; losses: number; draws: number; points: number; }
export interface Tournament { id: string; name: string; type: TournamentType; status: TournamentStatus; participants: Participant[]; rounds: Match[][]; standings: Standing[]; createdAt: string; championId?: string; }

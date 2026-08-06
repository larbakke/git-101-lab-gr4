import type { Match, Participant, Standing, Tournament, TournamentType } from "@/types/tournament";

const id = () => Math.random().toString(36).slice(2, 10);
const makeMatch = (round: number, playerA: string | null, playerB: string | null): Match => { const isBye = Boolean(playerA) !== Boolean(playerB); const winner = isBye ? playerA ?? playerB : null; return { id: id(), round, playerA, playerB, scoreA: isBye ? 1 : null, scoreB: isBye ? 0 : null, winner, completed: isBye, isBye }; };
export const formatLabel: Record<TournamentType, string> = { swiss: "Swiss System", elimination: "Single Elimination", roundRobin: "Round Robin" };
const nameMoods = ["Aftershock", "Neon", "Midnight", "Turbo", "Cosmic", "Electric", "Velvet", "Chrome", "Wildfire", "Phantom", "Solar", "Lunar", "Rogue", "Hyperdrive", "Glitch", "Thunder", "Frostbite", "Laser", "Arcade", "Velocity", "Chaos", "Eclipse", "Prism", "Static", "Dragonfire", "Quantum", "Gravity", "Vortex", "Supernova", "Moonshot"];
const nameFinales = ["Clash", "Cup", "Rumble", "Showdown", "Throwdown", "Brawl", "Bash", "Bonanza", "Derby", "Gauntlet", "Grand Prix", "Invitational", "Open", "Odyssey", "Face-Off", "Frenzy", "Festival", "Fiesta", "Collision", "Carnival", "Convergence", "Riot", "Reckoning", "Rally", "Rivalry", "Rumblefest", "Spectacular", "Sprint", "Stampede", "Summit"];
const formatNames: Record<TournamentType, string[]> = {
  swiss: ["Alpine Shuffle", "Swiss Summit", "Pairing Parade", "Ladder League", "Scorecard Scramble", "Tiebreak Tango", "Mountain Matchup", "Yodel Yield", "Points Pursuit", "Bracketless Bash", "Ranking Ruckus", "Matchmaking Mayhem", "Scoreboard Safari", "Ascension Circuit", "Roundtable Rumble"],
  elimination: ["Knockout Nights", "Last Stand", "Survival Circuit", "Sudden Death", "Eliminator", "Final Boss Fight", "No Mercy Melee", "Do-or-Die Derby", "Cutthroat Cup", "Winner-Takes-All", "Bracket Breaker", "One-Shot Showdown", "Last Player Standing", "Gauntlet Run", "Final Four Frenzy"],
  roundRobin: ["Roundabout Rumble", "Circle of Champions", "Everybody Battles", "League Loop", "Rivalry Roundup", "Full Orbit Face-Off", "Carousel Clash", "All-Star Circuit", "Infinite Loop Invitational", "Tabletop Tour", "The Grand Rotation", "Friendly Fire Festival", "Orbit Open", "Circle Pit", "Complete Circuit"],
};
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
const participantTitle = (name: string) => name.trim().replace(/\s+/g, " ").slice(0, 40);

export function generateTournamentName(type: TournamentType, names: string[]): string {
  const formatName = pick(formatNames[type]);
  const mood = pick(nameMoods);
  const finale = pick(nameFinales);
  const participants = names.map(participantTitle).filter(Boolean);

  if (participants.length > 1 && Math.random() < 0.45) {
    const first = pick(participants);
    const opponent = pick(participants.filter((name) => name !== first));
    return `${first} vs ${opponent}: ${mood} ${formatName}`;
  }
  if (participants.length && Math.random() < 0.7) {
    return `${pick(participants)}'s ${mood} ${formatName}`;
  }
  return Math.random() < 0.5 ? `${mood} ${formatName}` : `${formatName} ${finale}`;
}
export function calculateStandings(players: Participant[], rounds: Match[][]): Standing[] { const all = new Map(players.map((p) => [p.id, { participantId: p.id, wins: 0, losses: 0, draws: 0, points: 0 }])); rounds.flat().filter((m) => m.completed).forEach((m) => { if (!m.playerA || !m.playerB) { const w = m.winner && all.get(m.winner); if (w) { w.wins += 1; w.points += 1; } return; } const a = all.get(m.playerA)!; const b = all.get(m.playerB)!; if (!m.winner) { a.draws += 1; b.draws += 1; a.points += .5; b.points += .5; return; } const w = all.get(m.winner)!; const l = all.get(m.winner === m.playerA ? m.playerB : m.playerA)!; w.wins += 1; w.points += 1; l.losses += 1; }); return [...all.values()].sort((a,b) => b.points-a.points || b.wins-a.wins || a.losses-b.losses); }
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - .5);
export function swissRound(round: number, players: Participant[], standings: Standing[], past: Match[][]): Match[] { const pool = round === 1 ? shuffle(players) : [...players].sort((a,b) => (standings.find((s) => s.participantId === b.id)?.points ?? 0) - (standings.find((s) => s.participantId === a.id)?.points ?? 0)); const seen = new Set(past.flat().filter((m) => m.playerA && m.playerB).map((m) => [m.playerA,m.playerB].sort().join("/"))); const byes = new Set(past.flat().filter((m) => m.isBye).map((m) => m.winner)); const result: Match[] = []; if (pool.length % 2) { const reverseIndex = [...pool].reverse().findIndex((p) => !byes.has(p.id)); result.push(makeMatch(round, pool.splice(reverseIndex < 0 ? pool.length - 1 : pool.length - 1 - reverseIndex, 1)[0].id, null)); } while (pool.length) { const a = pool.shift()!; let index = pool.findIndex((b) => !seen.has([a.id,b.id].sort().join("/"))); if (index < 0) index = 0; result.push(makeMatch(round, a.id, pool.splice(index, 1)[0].id)); } return result; }
function eliminationRound(round: number, players: (string | null)[]) { const result: Match[] = []; for (let i = 0; i < players.length; i += 2) if (players[i] || players[i + 1]) result.push(makeMatch(round, players[i], players[i + 1])); return result; }
function roundRobin(players: Participant[]) { const slots: (string | null)[] = players.map((p) => p.id); if (slots.length % 2) slots.push(null); const rounds: Match[][] = []; for (let round = 0; round < slots.length - 1; round += 1) { rounds.push(Array.from({ length: slots.length / 2 }, (_, i) => makeMatch(round + 1, slots[i], slots[slots.length - 1 - i])).filter((m) => m.playerA || m.playerB)); slots.splice(1, 0, slots.pop()!); } return rounds; }
export function createTournament(name: string, type: TournamentType, names: string[]): Tournament { const participants = names.map((name) => ({ id: id(), name: name.trim() })).filter((p) => p.name); let rounds: Match[][] = []; if (type === "swiss") rounds = [swissRound(1, participants, calculateStandings(participants, []), [])]; if (type === "roundRobin") rounds = roundRobin(participants); if (type === "elimination") { const size = 2 ** Math.ceil(Math.log2(Math.max(2, participants.length))); rounds = [eliminationRound(1, [...shuffle(participants.map((p) => p.id)), ...Array(size - participants.length).fill(null)])]; } return { id: id(), name, type, status: "active", participants, rounds, standings: calculateStandings(participants, rounds), createdAt: new Date().toISOString() }; }
export function report(tournament: Tournament, matchId: string, scoreA: number, scoreB: number): Tournament { const rounds = tournament.rounds.map((round) => round.map((m) => m.id === matchId ? { ...m, scoreA, scoreB, winner: scoreA === scoreB ? null : scoreA > scoreB ? m.playerA : m.playerB, completed: true } : m)); return { ...tournament, rounds, standings: calculateStandings(tournament.participants, rounds) }; }
export function advance(tournament: Tournament): Tournament { const current = tournament.rounds[tournament.rounds.length - 1]; if (tournament.type === "swiss") return { ...tournament, rounds: [...tournament.rounds, swissRound(tournament.rounds.length + 1, tournament.participants, tournament.standings, tournament.rounds)] }; if (tournament.type === "elimination") { const winners = current.map((m) => m.winner).filter(Boolean) as string[]; return winners.length === 1 ? { ...tournament, status: "completed", championId: winners[0] } : { ...tournament, rounds: [...tournament.rounds, eliminationRound(tournament.rounds.length + 1, winners)] }; } return { ...tournament, status: "completed", championId: tournament.standings[0]?.participantId }; }

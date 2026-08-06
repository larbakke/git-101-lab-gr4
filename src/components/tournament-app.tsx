"use client";
import { useEffect, useRef, useState } from "react";
import { Crown, Moon, Plus, Sun, Swords, Trophy, Users, X, Zap } from "lucide-react";
import html2canvas from "html2canvas";
import { advance, createTournament, formatLabel, generateTournamentName, report } from "@/lib/tournament";
import type { Match, Tournament, TournamentType } from "@/types/tournament";

type Lang = "no" | "en";
const t = {
  no: {
    createTournament: "Opprett turnering",
    runEvents: "ARRANGER EVENTER SOM FØLES LEGENDARISKE",
    heroTitle: <>Arenaen for <i>hvert oppgjør.</i></>,
    heroDesc: "Fra brettspillrivalisering til LAN-finaler – opprett en stilren turnering, rapporter live-resultater, og la Bracketly ta seg av resten.",
    startTournament: "Start en turnering",
    liveEngine: "LIVE-MOTOR",
    heroSignal: "Din neste konkurranse starter her",
    tournamentLibrary: "TURNERINGSBIBLIOTEK",
    yourEvents: "Dine eventer",
    total: "totalt",
    emptyTitle: "Arenaen din er tom",
    emptyDesc: "Opprett din første turnering for å begynne å spore action.",
    contenders: "deltakere",
    rounds: "runder",
    newEvent: "NYTT EVENT",
    buildTournament: "Bygg turneringen din",
    tournamentName: "Turneringsnavn",
    namePlaceholder: "Fredagsnatt-finale",
    autoName: "Auto-generer et funky navn",
    format: "Format",
    participants: "Deltakere",
    participantsHint: "(én per linje eller komma)",
    contendersReady: "deltakere klare",
    generateTournament: "Generer turnering",
    currentStage: "NÅVÆRENDE FASE",
    tournamentProgress: "TURNERINGSFREMDRIFT",
    liveMatchCenter: "LIVE KAMPSENTRAL",
    generateNextRound: "Generer neste runde",
    matches: "kamper",
    standings: "stillinger",
    players: "spillere",
    rankings: "RANGERINGER",
    leaderboard: "Ledertavle",
    rank: "Rang",
    contender: "Deltaker",
    wins: "Seiere",
    losses: "Tap",
    draws: "Uavgjort",
    points: "Poeng",
    autoAdvance: "AUTO-AVANSERING",
    final: "FERDIG",
    pending: "VENTER",
    update: "Oppdater",
    submit: "Send inn",
    darkMode: "Mørk",
    lightMode: "Lys",
    langToggle: "EN",
    swiss: "Sveitsisk system",
    swissDetail: "Rettferdige score-baserte par",
    elim: "Enkel eliminering",
    elimDetail: "Overlev og avansér",
    robin: "Round Robin",
    robinDetail: "Alle møter alle",
    exportImage: "Eksporter som bilde",
  },
  en: {
    createTournament: "Create tournament",
    runEvents: "RUN EVENTS THAT FEEL LEGENDARY",
    heroTitle: <>The arena for <i>every showdown.</i></>,
    heroDesc: "From tabletop rivalries to LAN finals, create a polished tournament, report live results, and let Bracketly handle what comes next.",
    startTournament: "Start a tournament",
    liveEngine: "LIVE ENGINE",
    heroSignal: "Your next competition begins here",
    tournamentLibrary: "TOURNAMENT LIBRARY",
    yourEvents: "Your events",
    total: "total",
    emptyTitle: "Your arena is empty",
    emptyDesc: "Create your first tournament to start tracking the action.",
    contenders: "contenders",
    rounds: "rounds",
    newEvent: "NEW EVENT",
    buildTournament: "Build your tournament",
    tournamentName: "Tournament name",
    namePlaceholder: "Friday Night Finals",
    autoName: "Auto-generate a funky name",
    format: "Format",
    participants: "Participants",
    participantsHint: "(one per line or comma)",
    contendersReady: "contenders ready",
    generateTournament: "Generate tournament",
    currentStage: "CURRENT STAGE",
    tournamentProgress: "TOURNAMENT PROGRESS",
    liveMatchCenter: "LIVE MATCH CENTER",
    generateNextRound: "Generate next round",
    matches: "matches",
    standings: "standings",
    players: "players",
    rankings: "RANKINGS",
    leaderboard: "Leaderboard",
    rank: "Rank",
    contender: "Contender",
    wins: "Wins",
    losses: "Losses",
    draws: "Draws",
    points: "Points",
    autoAdvance: "AUTO ADVANCE",
    final: "FINAL",
    pending: "PENDING",
    update: "Update",
    submit: "Submit",
    darkMode: "Dark",
    lightMode: "Light",
    langToggle: "NO",
    swiss: "Swiss System",
    swissDetail: "Fair score-based pairings",
    elim: "Single Elim",
    elimDetail: "Survive and advance",
    robin: "Round Robin",
    robinDetail: "Everyone plays everyone",
    exportImage: "Export as image",
  },
};

export function TournamentApp() {
  const [events, setEvents] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<Lang>("no");

  useEffect(() => { const saved = localStorage.getItem("bracketly-events"); if (saved) setEvents(JSON.parse(saved)); }, []);
  useEffect(() => localStorage.setItem("bracketly-events", JSON.stringify(events)), [events]);
  useEffect(() => { document.body.classList.toggle("light", !dark); }, [dark]);

  const txt = t[lang];
  const event = events.find((item) => item.id === selected);
  const save = (updated: Tournament) => setEvents((all) => all.map((item) => item.id === updated.id ? updated : item));
  const options: { type: TournamentType; title: string; detail: string; icon: typeof Swords }[] = [
    { type: "swiss", title: txt.swiss, detail: txt.swissDetail, icon: Swords },
    { type: "elimination", title: txt.elim, detail: txt.elimDetail, icon: Trophy },
    { type: "roundRobin", title: txt.robin, detail: txt.robinDetail, icon: Users },
  ];

  return (
    <main>
      <nav>
        <button className="brand" onClick={() => setSelected(null)}><span><Zap size={21} fill="currentColor" /></span><b>BRACKETLY<small>TOURNAMENT COMMAND</small></b></button>
        <div className="toggle-bar">
          <button className="toggle-btn" onClick={() => setDark((d) => !d)}>{dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? txt.lightMode : txt.darkMode}</button>
          <button className="toggle-btn" onClick={() => setLang((l) => l === "no" ? "en" : "no")}>{txt.langToggle}</button>
          <button className="primary" onClick={() => setCreating(true)}><Plus size={17} /> {txt.createTournament}</button>
        </div>
      </nav>
      {event ? <EventView event={event} save={save} txt={txt} options={options} /> : <Landing events={events} open={setSelected} create={() => setCreating(true)} txt={txt} />}
      {creating && <Create close={() => setCreating(false)} txt={txt} options={options} create={(name, type, names) => { const next = createTournament(name, type, names); setEvents((all) => [next, ...all]); setSelected(next.id); setCreating(false); }} />}
    </main>
  );
}

type Txt = typeof t["no"];

function Landing({ events, open, create, txt }: { events: Tournament[]; open: (id: string) => void; create: () => void; txt: Txt }) {
  return <>
    <section className="hero">
      <div>
        <em>{txt.runEvents}</em>
        <h1>{txt.heroTitle}</h1>
        <p>{txt.heroDesc}</p>
        <button className="primary" onClick={create}><Zap size={17} fill="currentColor" /> {txt.startTournament}</button>
      </div>
      <div className="signal"><span>{txt.liveEngine}</span><strong>VS</strong><p>{txt.heroSignal}</p></div>
    </section>
    <header><div><em>{txt.tournamentLibrary}</em><h2>{txt.yourEvents}</h2></div><span>{events.length} {txt.total}</span></header>
    {events.length ? <div className="event-grid">{events.map((event) => <button className="event" key={event.id} onClick={() => open(event.id)}><span>{formatLabel[event.type]}</span><b>{event.name}</b><p>{event.participants.length} {txt.contenders} · {event.rounds.length} {txt.rounds}</p><hr /></button>)}</div> : <div className="empty"><Trophy size={30} /><b>{txt.emptyTitle}</b><p>{txt.emptyDesc}</p></div>}
  </>;
}

function Create({ close, create, txt, options }: { close: () => void; create: (name: string, type: TournamentType, names: string[]) => void; txt: Txt; options: { type: TournamentType; title: string; detail: string; icon: typeof Swords }[] }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TournamentType>("swiss");
  const [names, setNames] = useState("");
  const players = names.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
  return <div className="modal"><section>
    <button className="close" onClick={close}><X /></button>
    <em>{txt.newEvent}</em><h2>{txt.buildTournament}</h2>
    <label>{txt.tournamentName}<input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={txt.namePlaceholder} /></label>
    <button type="button" className="name-generator" onClick={() => setName(generateTournamentName(type, players))}><Zap size={14} fill="currentColor" /> {txt.autoName}</button>
    <label>{txt.format}</label>
    <div className="formats">{options.map(({ type: value, title, detail, icon: Icon }) => <button key={value} className={type === value ? "chosen" : ""} onClick={() => setType(value)}><Icon size={18} /><b>{title}</b><small>{detail}</small></button>)}</div>
    <label>{txt.participants} <small>{txt.participantsHint}</small><textarea value={names} onChange={(e) => setNames(e.target.value)} placeholder={"Apex Predator\nNeon Knights\nPixel Raiders"} /></label>
    <p className="count">{players.length} {txt.contendersReady}</p>
    <button className="primary wide" disabled={!name.trim() || players.length === 0} onClick={() => create(name.trim(), type, players)}><Swords size={17} /> {txt.generateTournament}</button>
  </section></div>;
}

function EventView({ event, save, txt, options }: { event: Tournament; save: (event: Tournament) => void; txt: Txt; options: { type: TournamentType; title: string; detail: string; icon: typeof Swords }[] }) {
  const [tab, setTab] = useState("matches");
  const viewRef = useRef<HTMLElement | null>(null);
  const found = event.type === "roundRobin" ? event.rounds.findIndex((r) => !r.every((m) => m.completed)) : event.rounds.length - 1;
  const index = found < 0 ? event.rounds.length - 1 : found;
  const matches = event.rounds[index];
  const champion = event.participants.find((p) => p.id === event.championId);
  const player = (id: string | null) => event.participants.find((p) => p.id === id)?.name ?? "BYE";
  const done = event.rounds.flat().filter((m) => m.completed).length;
  const tabs = [txt.matches, txt.standings, txt.participants.toLowerCase()];
  const tabKeys = ["matches", "standings", "participants"];
  const exportTournament = async () => {
    if (!viewRef.current) return;
    const canvas = await html2canvas(viewRef.current, { backgroundColor: "#08090d", scale: 2 });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${event.name.replace(/[^a-zA-Z0-9_-]/g, "_")}-tournament.png`;
    link.click();
  };
  return <section ref={viewRef}>
    <section className="event-head">
      <div><span>{formatLabel[event.type]}</span><span>{event.participants.length} {txt.players}</span><h1>{event.name}</h1></div>
      {champion ? <div className="champion"><Crown /><b>{champion.name}</b></div> : <div className="round"><small>{txt.currentStage}</small><b>Round {index + 1}</b></div>}
      <div className="progress"><small>{txt.tournamentProgress}</small><i><b style={{ width: `${done / event.rounds.flat().length * 100}%` }} /></i></div>
    </section>
    <div className="tab-actions"><button className="secondary" onClick={exportTournament}>{txt.exportImage}</button></div>
    <div className="tabs">{tabs.map((label, i) => <button key={tabKeys[i]} className={tab === tabKeys[i] ? "active" : ""} onClick={() => setTab(tabKeys[i])}>{label}</button>)}</div>
    {tab === "matches" && <section><header><div><em>{txt.liveMatchCenter}</em><h2>Round {index + 1}</h2></div>{matches.every((m) => m.completed) && event.type !== "roundRobin" && event.status !== "completed" && <button className="primary" onClick={() => save(advance(event))}>{txt.generateNextRound}</button>}</header><div className="match-grid">{matches.map((m, i) => <MatchCard key={m.id} match={m} number={i + 1} a={player(m.playerA)} b={player(m.playerB)} txt={txt} submit={(a, b) => save(report(event, m.id, a, b))} />)}</div></section>}
    {tab === "standings" && <Standings event={event} txt={txt} />}
    {tab === "participants" && <div className="people">{event.participants.map((p, i) => <div key={p.id}><span>{String(i + 1).padStart(2, "0")}</span><b>{p.name}</b></div>)}</div>}
  </section>;
}

function MatchCard({ match, number, a, b, submit, txt }: { match: Match; number: number; a: string; b: string; submit: (a: number, b: number) => void; txt: Txt }) {
  const [one, setOne] = useState(match.scoreA?.toString() ?? "");
  const [two, setTwo] = useState(match.scoreB?.toString() ?? "");
  return <article className="match">
    <header><small>MATCH {String(number).padStart(2, "0")}</small><span>{match.isBye ? txt.autoAdvance : match.completed ? txt.final : txt.pending}</span></header>
    <div className="versus"><b className={match.winner === match.playerA ? "winner" : ""}>{a}</b><i>VS</i><b className={match.winner === match.playerB ? "winner right" : "right"}>{b}</b></div>
    {!match.isBye && <div className="scores"><input type="number" min="0" value={one} onChange={(e) => setOne(e.target.value)} /><i>:</i><input type="number" min="0" value={two} onChange={(e) => setTwo(e.target.value)} /><button disabled={one === "" || two === ""} onClick={() => submit(Number(one), Number(two))}>{match.completed ? txt.update : txt.submit}</button></div>}
  </article>;
}

function Standings({ event, txt }: { event: Tournament; txt: Txt }) {
  const names = new Map(event.participants.map((p) => [p.id, p.name]));
  return <section className="table"><header><div><em>{txt.rankings}</em><h2>{txt.leaderboard}</h2></div></header><table><thead><tr><th>{txt.rank}</th><th>{txt.contender}</th><th>{txt.wins}</th><th>{txt.losses}</th><th>{txt.draws}</th><th>{txt.points}</th></tr></thead><tbody>{event.standings.map((s, i) => <tr key={s.participantId}><td>{i + 1}</td><td><b>{names.get(s.participantId)}</b></td><td>{s.wins}</td><td>{s.losses}</td><td>{s.draws}</td><td className="points">{s.points}</td></tr>)}</tbody></table></section>;
}

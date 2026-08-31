import React, { useState } from 'react';
import { X, Swords, Trophy, Award, Play, RotateCcw, Flame, Activity, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { API_BASE } from '../services/socket';

export default function MatchSimModal({ isOpen, onClose, room }) {
  const teams = room?.teams?.filter((t) => t.squad.length >= 7) || room?.teams || [];
  const [teamAId, setTeamAId] = useState(teams[0]?.id || '');
  const [teamBId, setTeamBId] = useState(teams[1]?.id || teams[0]?.id || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'inn1' | 'inn2' | 'impact' | 'fow'

  if (!isOpen) return null;

  const handleSimulate = () => {
    const tA = room.teams.find((t) => t.id === teamAId);
    const tB = room.teams.find((t) => t.id === teamBId);

    if (!tA || !tB) {
      alert('Please select both teams!');
      return;
    }

    if (tA.id === tB.id) {
      alert('Please select two distinct teams for the match!');
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/match/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamA: tA, teamB: tB })
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data.result);
        setLoading(false);
        setActiveTab('summary');
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-emerald-500/20">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">Live T20 Match Simulator & Analytics</h3>
              <p className="text-xs text-slate-400">Deep ball-by-ball simulation, dismissals, fall of wickets, and player impact scores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* TEAM SELECTION PANEL */}
          <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Team 1 (Bat First)</label>
                <select
                  value={teamAId}
                  onChange={(e) => setTeamAId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-bold"
                >
                  {room?.teams?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.squad.length} players)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 text-center font-black text-amber-400 text-lg">VS</div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Team 2 (Chase)</label>
                <select
                  value={teamBId}
                  onChange={(e) => setTeamBId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-bold"
                >
                  {room?.teams?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.squad.length} players)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{loading ? 'Simulating 20-Over Clash...' : 'SIMULATE HIGH-STAKES MATCH'}</span>
            </button>
          </div>

          {/* SIMULATION RESULTS */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* WINNER BANNER & SCORES */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 p-6 rounded-3xl text-center space-y-4 shadow-xl relative overflow-hidden">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black uppercase">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>MATCH RESULT</span>
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-white">{result.summary}</h4>

                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
                    <div className="text-xs text-slate-400 font-bold">{result.teamA.name}</div>
                    <div className="text-2xl font-black text-amber-400 mt-0.5">{result.teamA.runs}/{result.teamA.wickets}</div>
                    <div className="text-[10px] text-slate-400 font-mono">({result.teamA.overs} ov) • CRR: {result.teamA.runRate}</div>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
                    <div className="text-xs text-slate-400 font-bold">{result.teamB.name}</div>
                    <div className="text-2xl font-black text-amber-400 mt-0.5">{result.teamB.runs}/{result.teamB.wickets}</div>
                    <div className="text-[10px] text-slate-400 font-mono">({result.teamB.overs} ov) • CRR: {result.teamB.runRate}</div>
                  </div>
                </div>

                {/* MVP Highlight Box */}
                {result.mvp && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl max-w-md mx-auto flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shadow">
                        ★
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-300 uppercase font-bold">Player of the Match (MVP)</span>
                        <div className="font-extrabold text-white text-sm">{result.mvp.name} ({result.mvp.team})</div>
                        <div className="text-[10px] text-slate-300">{result.mvp.summary}</div>
                      </div>
                    </div>
                    <div className="text-right pl-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Impact Score</span>
                      <div className="text-lg font-black text-amber-400 font-mono">+{result.mvp.impactScore}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* DETAILED SCORECARD TABS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'summary' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Match Overview</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('inn1')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'inn1' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>1st Innings ({result.teamA.name})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('inn2')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'inn2' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>2nd Innings ({result.teamB.name})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('impact')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === 'impact' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Player Impact Leaderboard</span>
                  </button>
                </div>

                {/* TAB 1: MATCH OVERVIEW & PHASE BREAKDOWN */}
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    {/* Phase-by-phase Run rates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                        <div className="font-extrabold text-xs text-white uppercase flex items-center justify-between border-b border-slate-800 pb-2">
                          <span>{result.teamA.name} Phases</span>
                          <span className="text-amber-400">{result.teamA.runs}/{result.teamA.wickets}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Powerplay (1-6)</span>
                            <span className="font-extrabold text-amber-300">{result.teamA.phases?.powerplay}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Middle (7-15)</span>
                            <span className="font-extrabold text-amber-300">{result.teamA.phases?.middle}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Death (16-20)</span>
                            <span className="font-extrabold text-amber-300">{result.teamA.phases?.death}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                        <div className="font-extrabold text-xs text-white uppercase flex items-center justify-between border-b border-slate-800 pb-2">
                          <span>{result.teamB.name} Phases</span>
                          <span className="text-amber-400">{result.teamB.runs}/{result.teamB.wickets}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Powerplay (1-6)</span>
                            <span className="font-extrabold text-amber-300">{result.teamB.phases?.powerplay}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Middle (7-15)</span>
                            <span className="font-extrabold text-amber-300">{result.teamB.phases?.middle}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">Death (16-20)</span>
                            <span className="font-extrabold text-amber-300">{result.teamB.phases?.death}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Commentary Highlights */}
                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span>Key Moments & Ball-by-Ball Highlights</span>
                      </div>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                        {result.highlights.map((h, idx) => (
                          <div key={idx} className="text-xs text-slate-300 bg-slate-900/70 p-2 rounded-xl border border-slate-800/80">
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: INNINGS 1 FULL SCORECARD */}
                {activeTab === 'inn1' && (
                  <div className="space-y-4">
                    {/* Batting Card */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-x-auto custom-scrollbar">
                      <div className="font-extrabold text-sm text-white mb-3 flex items-center justify-between">
                        <span>{result.teamA.name} - Batting Scorecard</span>
                        <span className="text-amber-400 font-mono">{result.teamA.runs}/{result.teamA.wickets} ({result.teamA.overs} ov)</span>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                            <th className="py-2">Batter</th>
                            <th className="py-2">Dismissal</th>
                            <th className="py-2 text-right">R</th>
                            <th className="py-2 text-right">B</th>
                            <th className="py-2 text-right">4s</th>
                            <th className="py-2 text-right">6s</th>
                            <th className="py-2 text-right">SR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {result.teamA.batters.map((b, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-2.5 font-bold text-white">{b.name}</td>
                              <td className="py-2.5 text-slate-400 italic text-[11px]">{b.dismissal}</td>
                              <td className="py-2.5 text-right font-black text-amber-400 text-sm">{b.runs}</td>
                              <td className="py-2.5 text-right text-slate-300">{b.balls}</td>
                              <td className="py-2.5 text-right text-slate-300">{b.fours}</td>
                              <td className="py-2.5 text-right text-slate-300">{b.sixes}</td>
                              <td className="py-2.5 text-right font-mono text-slate-300">{b.strikeRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bowling Card */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-x-auto custom-scrollbar">
                      <div className="font-extrabold text-sm text-white mb-3">
                        {result.teamB.name} - Bowling Figures
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                            <th className="py-2">Bowler</th>
                            <th className="py-2 text-right">O</th>
                            <th className="py-2 text-right">M</th>
                            <th className="py-2 text-right">R</th>
                            <th className="py-2 text-right">W</th>
                            <th className="py-2 text-right">Dots</th>
                            <th className="py-2 text-right">Econ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {result.teamB.bowlers.map((bw, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-2.5 font-bold text-white">{bw.name}</td>
                              <td className="py-2.5 text-right text-slate-300">{bw.overs}</td>
                              <td className="py-2.5 text-right text-slate-300">{bw.maidens}</td>
                              <td className="py-2.5 text-right text-slate-300">{bw.runsConceded}</td>
                              <td className="py-2.5 text-right font-black text-teal-400 text-sm">{bw.wickets}</td>
                              <td className="py-2.5 text-right text-slate-300">{bw.dots}</td>
                              <td className="py-2.5 text-right font-mono text-slate-300">{bw.economy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: INNINGS 2 FULL SCORECARD */}
                {activeTab === 'inn2' && (
                  <div className="space-y-4">
                    {/* Batting Card */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-x-auto custom-scrollbar">
                      <div className="font-extrabold text-sm text-white mb-3 flex items-center justify-between">
                        <span>{result.teamB.name} - Batting Scorecard</span>
                        <span className="text-amber-400 font-mono">{result.teamB.runs}/{result.teamB.wickets} ({result.teamB.overs} ov)</span>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                            <th className="py-2">Batter</th>
                            <th className="py-2">Dismissal</th>
                            <th className="py-2 text-right">R</th>
                            <th className="py-2 text-right">B</th>
                            <th className="py-2 text-right">4s</th>
                            <th className="py-2 text-right">6s</th>
                            <th className="py-2 text-right">SR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {result.teamB.batters.map((b, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-2.5 font-bold text-white">{b.name}</td>
                              <td className="py-2.5 text-slate-400 italic text-[11px]">{b.dismissal}</td>
                              <td className="py-2.5 text-right font-black text-amber-400 text-sm">{b.runs}</td>
                              <td className="py-2.5 text-right text-slate-300">{b.balls}</td>
                              <td className="py-2.5 text-right text-slate-300">{b.fours}</td>
                              <td className="py-2.5 text-right text-slate-300">{b.sixes}</td>
                              <td className="py-2.5 text-right font-mono text-slate-300">{b.strikeRate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Bowling Card */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-x-auto custom-scrollbar">
                      <div className="font-extrabold text-sm text-white mb-3">
                        {result.teamA.name} - Bowling Figures
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                            <th className="py-2">Bowler</th>
                            <th className="py-2 text-right">O</th>
                            <th className="py-2 text-right">M</th>
                            <th className="py-2 text-right">R</th>
                            <th className="py-2 text-right">W</th>
                            <th className="py-2 text-right">Dots</th>
                            <th className="py-2 text-right">Econ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {result.teamA.bowlers.map((bw, idx) => (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-2.5 font-bold text-white">{bw.name}</td>
                              <td className="py-2.5 text-right text-slate-300">{bw.overs}</td>
                              <td className="py-2.5 text-right text-slate-300">{bw.maidens}</td>
                              <td className="py-2.5 text-right text-slate-300">{bw.runsConceded}</td>
                              <td className="py-2.5 text-right font-black text-teal-400 text-sm">{bw.wickets}</td>
                              <td className="py-2.5 text-right text-slate-300">{bw.dots}</td>
                              <td className="py-2.5 text-right font-mono text-slate-300">{bw.economy}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: PLAYER IMPACT LEADERBOARD */}
                {activeTab === 'impact' && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Match MVP & Fantasy Impact Ratings</span>
                      </h4>
                      <span className="text-[10px] text-slate-400">Calculated from Runs, Boundaries, Wickets & Economy</span>
                    </div>

                    <div className="space-y-2">
                      {result.topImpactPlayers.map((p, idx) => (
                        <div key={idx} className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                              idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-extrabold text-white text-sm">{p.name} <span className="text-xs text-slate-400 font-normal">({p.team})</span></div>
                              <div className="text-[11px] text-slate-300 mt-0.5">{p.summary}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Impact</span>
                            <div className="text-base font-black text-amber-400 font-mono">+{p.impactScore}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Flame, Shield, Award, CheckCircle2, AlertTriangle, Trophy, Zap } from 'lucide-react';
import { formatINR, API_BASE } from '../services/socket';

export default function AiReportModal({ isOpen, onClose, room, selectedTeam }) {
  const [activeTeam, setActiveTeam] = useState(selectedTeam || room?.teams[0] || null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTeam) {
      setActiveTeam(selectedTeam);
    } else if (room?.teams?.length > 0 && !activeTeam) {
      setActiveTeam(room.teams[0]);
    }
  }, [selectedTeam, room]);

  useEffect(() => {
    if (!activeTeam) return;
    setLoading(true);

    fetch(`${API_BASE}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team: activeTeam })
    })
      .then((res) => res.json())
      .then((data) => {
        setAnalysis(data.analysis);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [activeTeam]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">AI Squad Intelligence & Tactical Report</h3>
              <p className="text-xs text-slate-400">Deep cricket analytical breakdown, Playing XI selection & IPL roasts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Selector Tabs */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {room?.teams?.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTeam(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTeam?.id === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-400">AI Engine is crunching stats & evaluating match data...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* TOP RATING METRICS BANNER */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Overall Squad Rating</div>
                  <div className="text-3xl font-black text-amber-400 mt-1">{analysis.overallScore}/100</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Win Prob: {analysis.winProbability}%</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Batting Depth</div>
                  <div className="text-3xl font-black text-amber-300 mt-1">{analysis.battingDepth}/100</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Top order + Finishers</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Bowling Firepower</div>
                  <div className="text-3xl font-black text-teal-400 mt-1">{analysis.bowlingAttack}/100</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Pace & Spin attack</div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Death Overs Rating</div>
                  <div className="text-3xl font-black text-purple-400 mt-1">{analysis.deathOvers}/100</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Clutch yorker ability</div>
                </div>
              </div>

              {/* AI ROAST & PRAISE COMMENTARY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-950/20 border border-red-800/40 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-red-400 uppercase tracking-wider">
                    <Flame className="w-4 h-4 fill-red-400" />
                    <span>AI Squad Roast 🔥</span>
                  </div>
                  <p className="text-xs text-red-200/90 leading-relaxed font-medium italic">
                    "{analysis.roast}"
                  </p>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-emerald-400" />
                    <span>Tactical Masterclass 💡</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed font-medium italic">
                    "{analysis.praise}"
                  </p>
                </div>
              </div>

              {/* STRENGTHS & VULNERABILITIES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs text-emerald-400 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tactical Strengths</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis.strengths?.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs text-amber-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Areas to Improve / Risks</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis.weaknesses?.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* BEST PLAYING XI RECOMMENDATION */}
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>AI Recommended Best Playing XI</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Max 4 Overseas Rule Applied</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {analysis.playingXI?.map((p, idx) => (
                    <div key={p.id || idx} className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[10px]">{idx + 1}.</span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1">
                            <span>{p.name}</span>
                            <span>{p.flag}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{p.role}</div>
                        </div>
                      </div>
                      <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-black text-[10px]">
                        ★{p.overallRating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              No squad data available for analysis. Acquire players in the auction room first!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
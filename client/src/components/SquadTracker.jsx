import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Trophy, Award, Sparkles, Plane } from 'lucide-react';
import { formatINR } from '../services/socket';

export default function SquadTracker({ room, currentTeam, onSelectTeamForAi }) {
  const [expandedTeamId, setExpandedTeamId] = useState(currentTeam?.id || null);

  const toggleExpand = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-black text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Franchise Leaderboards & Rosters</span>
          </h3>
          <p className="text-xs text-slate-400">Live purse balances, overseas limits, and player rosters</p>
        </div>
        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-bold">
          {room?.teams?.length || 0} Franchises
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {room?.teams?.map((team) => {
          const isUser = currentTeam && currentTeam.id === team.id;
          const isExpanded = expandedTeamId === team.id;
          const overseasCount = team.squad.filter((p) => p.isOverseas).length;

          return (
            <div
              key={team.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isUser
                  ? 'bg-slate-950/90 border-blue-500/60 shadow-lg shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: team.color || '#3b82f6' }} />
                    <div>
                      <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                        <span>{team.name}</span>
                        {isUser && (
                          <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-blue-500/30">
                            YOU
                          </span>
                        )}
                        {team.isBot && (
                          <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-bold border border-slate-700">
                            BOT
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400">{team.ownerName}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleExpand(team.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Purse & Squad Counts */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Purse Left</span>
                    <div className="font-black text-emerald-400 text-sm">{formatINR(team.purse)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Squad / Overseas</span>
                    <div className="font-bold text-slate-200 text-sm">
                      {team.squad.length}/{room?.rules?.squadLimit || 18} <span className="text-xs text-blue-400 font-normal">({overseasCount} ✈️)</span>
                    </div>
                  </div>
                </div>

                {/* Quick AI Squad Button */}
                {team.squad.length > 0 && (
                  <button
                    onClick={() => onSelectTeamForAi(team)}
                    className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Analyze This Squad</span>
                  </button>
                )}
              </div>

              {/* Expandable Squad Roster */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-slate-900/60 p-3 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                    <span>Acquired Players ({team.squad.length})</span>
                    <span>Cost</span>
                  </div>

                  {team.squad.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500 italic">No players acquired yet.</div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {team.squad.map((p, idx) => (
                        <div key={idx} className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-slate-200 flex items-center gap-1">
                              <span>{p.name}</span>
                              <span className="text-[10px]">{p.flag}</span>
                              <span className="text-[10px] text-amber-400 font-mono">★{p.overallRating}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{p.role}</div>
                          </div>
                          <span className="font-black text-amber-400">{formatINR(p.soldPrice)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
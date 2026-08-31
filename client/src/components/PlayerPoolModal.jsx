import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, Filter, RefreshCw, UserPlus } from 'lucide-react';
import { formatINR } from '../services/socket';

export default function PlayerPoolModal({ isOpen, onClose, room, onGenerateMore }) {
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('BAT');
  const [customRating, setCustomRating] = useState(88);
  const [genCount, setGenCount] = useState(10);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const pool = room?.playerPool || [];

  const filteredPool = pool.filter((p) => {
    if (filterRole !== 'ALL' && p.category !== filterRole && p.roleId !== filterRole) return false;
    if (filterCountry !== 'ALL' && p.country !== filterCountry) return false;
    return true;
  });

  const handleGenerateBatch = () => {
    setLoading(true);
    onGenerateMore({
      count: genCount,
      filter: {
        role: filterRole !== 'ALL' ? filterRole : undefined,
        country: filterCountry !== 'ALL' ? filterCountry : undefined
      }
    });
    setTimeout(() => setLoading(false), 500);
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onGenerateMore({
      count: 1,
      filter: {
        name: customName.trim(),
        role: customRole,
        rating: Number(customRating)
      }
    });
    setCustomName('');
    alert(`Added custom player ${customName} to auction queue!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-black">
              🏏
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">Draft Player Pool & Generator</h3>
              <p className="text-xs text-slate-400">Manage, filter, and procedurally generate infinite cricket players</p>
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
          {/* GENERATOR CONTROLS */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Procedural Infinite Player Generator</span>
              </h4>
              <div className="flex items-center gap-2">
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value={5}>Generate 5 Players</option>
                  <option value={10}>Generate 10 Players</option>
                  <option value={20}>Generate 20 Players</option>
                </select>
                <button
                  onClick={handleGenerateBatch}
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/10"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Generate & Add to Draft</span>
                </button>
              </div>
            </div>

            {/* Custom Player Creator */}
            <form onSubmit={handleCreateCustom} className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
              <input
                type="text"
                placeholder="Or create custom name (e.g. MS Dhoni)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="BAT">Top Batter</option>
                <option value="WK">Wicketkeeper</option>
                <option value="BAT_AR">All-Rounder</option>
                <option value="FAST">Fast Bowler</option>
                <option value="SPIN_LEG">Spinner</option>
              </select>
              <input
                type="number"
                min={70}
                max={99}
                value={customRating}
                onChange={(e) => setCustomRating(e.target.value)}
                title="Overall Rating"
                className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-amber-400 text-center font-bold"
              />
              <button
                type="submit"
                disabled={!customName}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                Add Custom Player
              </button>
            </form>
          </div>

          {/* DRAFT POOL QUEUE */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-extrabold text-sm text-white">
                Upcoming Queue ({filteredPool.length} of {pool.length})
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Batter">Batters</option>
                  <option value="Bowler">Bowlers</option>
                  <option value="All-Rounder">All-Rounders</option>
                  <option value="Wicketkeeper">Wicketkeepers</option>
                </select>

                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
                >
                  <option value="ALL">All Countries</option>
                  <option value="India">India 🇮🇳</option>
                  <option value="Australia">Australia 🇦🇺</option>
                  <option value="England">England 🏴󠁧󠁢󠁥󠁮󠁧󠁿</option>
                  <option value="South Africa">South Africa 🇿🇦</option>
                  <option value="West Indies">West Indies 🌴</option>
                  <option value="New Zealand">New Zealand 🇳🇿</option>
                </select>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredPool.slice(0, 24).map((p) => (
                <div key={p.id} className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-2xl flex flex-col justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{p.name}</span>
                        <span>{p.flag}</span>
                      </span>
                      <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-black text-[10px]">
                        ★{p.overallRating}
                      </span>
                    </div>
                    <p className={`text-[11px] font-semibold ${p.roleColor} mt-0.5`}>{p.role}</p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Bat Avg: <strong className="text-slate-200">{p.stats.battingAverage}</strong> | SR: <strong className="text-slate-200">{p.stats.strikeRate}</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-[10px]">
                    <span className="text-slate-400">{p.tier}</span>
                    <span className="font-bold text-emerald-400">{formatINR(p.basePrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
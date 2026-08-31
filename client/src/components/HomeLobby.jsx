import React, { useState } from 'react';
import { Trophy, Play, Users, Bot, Zap, Shield, Sparkles, Flame, CheckCircle2, Clock } from 'lucide-react';
import { formatINR } from '../services/socket';

export default function HomeLobby({ onCreateRoom, onJoinRoom, onStartSolo }) {
  const [activeTab, setActiveTab] = useState('solo'); // 'solo' | 'multi-create' | 'multi-join'
  const [hostName, setHostName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [purse, setPurse] = useState(1000000000); // 100 Cr
  const [squadLimit, setSquadLimit] = useState(18);
  const [timerDuration, setTimerDuration] = useState(15);
  const [loading, setLoading] = useState(false);

  const handleSolo = (e) => {
    e.preventDefault();
    if (!hostName.trim()) {
      alert('Please enter your manager name');
      return;
    }
    setLoading(true);
    onStartSolo({
      hostName: hostName.trim(),
      teamName: teamName.trim() || `${hostName}'s Titans`,
      purse,
      squadLimit,
      timerDuration
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!hostName.trim()) {
      alert('Please enter your manager name');
      return;
    }
    setLoading(true);
    onCreateRoom({
      hostName: hostName.trim(),
      teamName: teamName.trim() || `${hostName}'s XI`,
      purse,
      squadLimit,
      timerDuration,
      isSolo: false
    });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!hostName.trim() || !roomCode.trim()) {
      alert('Please enter your name and room code');
      return;
    }
    setLoading(true);
    onJoinRoom({
      userName: hostName.trim(),
      teamName: teamName.trim() || `${hostName}'s XI`,
      roomCode: roomCode.trim().toUpperCase()
    });
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Stadium Glow Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Hero Pitch */}
        <div className="lg:col-span-6 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            Live IPL-Style Mega Auction 2026
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Bid on <span className="gold-gradient-text">Real Cricket Legends</span> with Real Stats
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Bid on <strong className="text-amber-300">Virat Kohli, Jasprit Bumrah, Rohit Sharma, Heinrich Klaasen, Travis Head, Nicholas Pooran, Rashid Khan</strong> & 50+ real cricketers with authentic career stats and custom bidding timers!
          </p>

          {/* Quick Perks List */}
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Real IPL Player Database & Stats</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Custom Bidding Timer (10s-30s)</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Smart AI Franchise Bidders</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>AI Squad Roasts & Match Sim</span>
            </div>
          </div>
        </div>

        {/* Right Action Box */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('solo')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'solo'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Solo vs Bots</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('multi-create')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'multi-create'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Host Room</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('multi-join')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'multi-join'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Join Room</span>
              </button>
            </div>

            {/* TAB 1: SOLO MODE */}
            {activeTab === 'solo' && (
              <form onSubmit={handleSolo} className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Bid on Real IPL Superstars vs 5 AI Franchises (CSK, MI, RCB, KKR, RR)!</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Manager Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Virat Fan, Dhoni, Aryan"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Team / Franchise Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Strikers, Delhi Superstars"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Starting Purse</label>
                    <select
                      value={purse}
                      onChange={(e) => setPurse(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-amber-400 text-white"
                    >
                      <option value={800000000}>₹80 Cr</option>
                      <option value={1000000000}>₹100 Cr</option>
                      <option value={1200000000}>₹120 Cr</option>
                      <option value={1500000000}>₹150 Cr</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Squad Size</label>
                    <select
                      value={squadLimit}
                      onChange={(e) => setSquadLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-amber-400 text-white"
                    >
                      <option value={15}>15 Players</option>
                      <option value={18}>18 Players</option>
                      <option value={22}>22 Players</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bidding Timer</label>
                    <select
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-amber-400 text-amber-300 font-bold"
                    >
                      <option value={10}>⚡ 10s Blitz</option>
                      <option value={15}>⏱️ 15s Standard</option>
                      <option value={20}>⏳ 20s Strategic</option>
                      <option value={30}>🕒 30s Relaxed</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-3 rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>{loading ? 'Starting Arena...' : 'START SOLO AUCTION'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: HOST MULTIPLAYER ROOM */}
            {activeTab === 'multi-create' && (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-xs text-blue-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>Host a live auction room with custom bidding timers & real players!</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Host Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Franchise Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai Masters"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Purse</label>
                    <select
                      value={purse}
                      onChange={(e) => setPurse(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-amber-400 text-white"
                    >
                      <option value={1000000000}>₹100 Cr</option>
                      <option value={1200000000}>₹120 Cr</option>
                      <option value={1500000000}>₹150 Cr</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Squad</label>
                    <select
                      value={squadLimit}
                      onChange={(e) => setSquadLimit(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-amber-400 text-white"
                    >
                      <option value={15}>15 Players</option>
                      <option value={18}>18 Players</option>
                      <option value={25}>25 Players</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bidding Timer</label>
                    <select
                      value={timerDuration}
                      onChange={(e) => setTimerDuration(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-amber-400 text-amber-300 font-bold"
                    >
                      <option value={10}>⚡ 10s Blitz</option>
                      <option value={15}>⏱️ 15s Standard</option>
                      <option value={20}>⏳ 20s Strategic</option>
                      <option value={30}>🕒 30s Relaxed</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black py-3 rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Trophy className="w-5 h-5" />
                  <span>{loading ? 'Creating...' : 'CREATE AUCTION ROOM'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: JOIN EXISTING ROOM */}
            {activeTab === 'multi-join' && (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Room Code (6 Letters) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 7X9K2A"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono uppercase tracking-widest font-bold text-center focus:outline-none focus:border-amber-400 text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Franchise Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai Super Warriors"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Users className="w-5 h-5 fill-slate-950" />
                  <span>{loading ? 'Entering Room...' : 'JOIN AUCTION ROOM'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Trophy, Users, Sparkles, Swords, Volume2, VolumeX, PlusCircle, LogOut, Sliders } from 'lucide-react';
import { formatINR } from '../services/socket';

export default function Navbar({ 
  room, 
  currentTeam, 
  onOpenAiReport, 
  onOpenPlayerPool, 
  onOpenMatchSim, 
  onLeaveRoom,
  soundEnabled,
  volume,
  onToggleSound,
  onChangeVolume 
}) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
            🏏
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white">
                Cric<span className="text-amber-400">Auction</span> <span className="bg-amber-400/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-400/30">AI</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Live IPL Auction Room & AI Squad Intelligence</p>
          </div>
        </div>

        {/* Room Info & Quick Controls */}
        {room && (
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Room Code Badge */}
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs">
              <span className="text-slate-400">ROOM:</span>
              <span className="font-mono font-bold text-amber-400 tracking-wider text-sm">{room.code}</span>
            </div>

            {/* Current Team Purse */}
            {currentTeam && (
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/60 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-blue-300 font-medium">{currentTeam.name}:</span>
                <span className="font-bold text-emerald-400 text-sm">{formatINR(currentTeam.purse)}</span>
                <span className="text-slate-400">({currentTeam.squad.length}/{room.rules.squadLimit})</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenPlayerPool}
                aria-label="Open Player Pool"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                title="Player Pool & Infinite Generator"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Player Pool</span>
              </button>

              <button
                onClick={onOpenAiReport}
                aria-label="Open AI Squad Analysis"
                className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                title="AI Squad Analysis & Roasts"
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline">AI Analysis</span>
              </button>

              <button
                onClick={onOpenMatchSim}
                aria-label="Open Match Simulator"
                className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                title="Simulate T20 Match"
              >
                <Swords className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Match Sim</span>
              </button>

              {/* Sound & Volume Control */}
              <div className="relative">
                <button
                  onClick={onToggleSound}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setShowVolumeSlider(!showVolumeSlider);
                  }}
                  aria-label={soundEnabled ? "Mute audio sound effects" : "Unmute audio sound effects"}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition flex items-center gap-1"
                  title={soundEnabled ? `Sound ON (${Math.round((volume ?? 0.6) * 100)}%) - Click to mute` : "Sound MUTED - Click to unmute"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>
              </div>

              {/* Leave Room */}
              <button
                onClick={onLeaveRoom}
                aria-label="Exit auction room"
                className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 transition ml-1"
                title="Exit Auction Room"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Gavel, Clock, Flame, Shield, Award, Sparkles, TrendingUp, 
  CheckCircle2, XCircle, AlertCircle, Bot, UserPlus, Play, Pause, FastForward, SkipForward, Zap, Settings2, AlertTriangle 
} from 'lucide-react';
import { formatINR } from '../services/socket';

export default function AuctionArena({
  room,
  currentTeam,
  onPlaceBid,
  onPassPlayer,
  onNextPlayer,
  onStartAuction,
  onAddBot,
  onTogglePause,
  onSetTimerDuration,
  onFastForward,
  onSkipPlayer,
  lastSoldEvent,
  onOpenPlayerPool,
  isHost
}) {
  const [customBid, setCustomBid] = useState('');
  const [confirmHighBidModal, setConfirmHighBidModal] = useState(null);

  const player = room?.currentPlayer;
  const currentBid = room?.currentBid || 0;
  const currentBidder = room?.currentBidder;
  const timer = room?.timer || 0;
  const hammerStage = room?.hammerStage || 0;
  const isPaused = room?.isPaused || false;
  const currentTimerDuration = room?.rules?.timerDuration || 15;

  const getIncrement = (amt) => {
    if (amt < 10000000) return 2000000;    // +20 L
    if (amt < 50000000) return 5000000;    // +50 L
    if (amt < 150000000) return 10000000;  // +1 Cr
    return 20000000;                      // +2 Cr
  };

  const nextIncrement = getIncrement(currentBid);
  const nextMinBid = currentBidder ? currentBid + nextIncrement : (player?.basePrice || 2000000);

  const isHighestBidder = currentBidder && currentTeam && currentBidder.id === currentTeam.id;
  const canAfford = currentTeam && currentTeam.purse >= nextMinBid;

  const triggerBidWithCheck = (bidVal) => {
    if (!currentTeam || !player || isPaused || isHighestBidder) return;
    if (currentTeam.purse < bidVal) {
      alert('Insufficient purse for this bid!');
      return;
    }

    if (bidVal > currentTeam.purse * 0.50) {
      setConfirmHighBidModal({ amount: bidVal, name: player.name });
      return;
    }

    onPlaceBid(bidVal);
  };

  const handleQuickBid = (increment) => {
    const bidVal = currentBidder ? currentBid + increment : player.basePrice;
    triggerBidWithCheck(bidVal);
  };

  const handleCustomBid = (e) => {
    e.preventDefault();
    if (isPaused) return;
    const val = Number(customBid) * 10000000;
    if (val > currentBid) {
      triggerBidWithCheck(val);
      setCustomBid('');
    } else {
      alert(`Bid must be higher than current bid of ${formatINR(currentBid)}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (room?.status === 'AUCTION' && player) {
        if ((e.key === 'Enter' || e.key === ' ') && !isHighestBidder && canAfford && !isPaused) {
          e.preventDefault();
          handleQuickBid(nextIncrement);
        } else if ((e.key === '+' || e.key === '=') && !isHighestBidder && canAfford && !isPaused) {
          e.preventDefault();
          handleQuickBid(5000000);
        } else if ((e.key === 's' || e.key === 'S') && onSkipPlayer) {
          e.preventDefault();
          onSkipPlayer();
        } else if ((e.key === 'p' || e.key === 'P') && isHost && onTogglePause) {
          e.preventDefault();
          onTogglePause();
        } else if ((e.key === 'f' || e.key === 'F') && isHost && onFastForward) {
          e.preventDefault();
          onFastForward();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room, player, isHighestBidder, canAfford, isPaused, nextIncrement, isHost]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ARIA LIVE REGION */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {player ? `Current player: ${player.name}. Leading bid: ${formatINR(currentBid)} by ${currentBidder?.name || 'none'}. Timer: ${timer}s.` : 'Lobby view'}
      </div>

      {/* CONFIRM HIGH-STAKES BID MODAL */}
      {confirmHighBidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-lg text-white">Confirm High-Stakes Bid</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This bid of <strong className="text-amber-400 text-sm">{formatINR(confirmHighBidModal.amount)}</strong> for <strong className="text-white">{confirmHighBidModal.name}</strong> will consume over <strong className="text-red-400">50%</strong> of your remaining purse ({formatINR(currentTeam?.purse)}). Are you sure?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmHighBidModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onPlaceBid(confirmHighBidModal.amount);
                  setConfirmHighBidModal(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 rounded-xl text-xs font-black transition shadow-md"
              >
                Yes, Place High Bid
              </button>
            </div>
          </div>
        </div>
      )}
      {/* LEFT & CENTER: THE MAIN AUCTION PODIUM (8 Cols) */}
      <div className="lg:col-span-8 space-y-6">
        {/* AUCTION STAGE / PODIUM */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Stage Lighting / Atmosphere Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* LAST SOLD / SKIPPED RESULT TOAST NOTIFICATION */}
          {lastSoldEvent && (
            <div className={`mb-4 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 shadow-lg animate-fadeIn ${
              lastSoldEvent.isUnsold 
                ? 'bg-red-950/40 border-red-800/60 text-red-300' 
                : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-base">{lastSoldEvent.isUnsold ? '❌' : '🎉'}</span>
                <span>
                  <strong>{lastSoldEvent.player?.name}</strong> {lastSoldEvent.player?.flag} {lastSoldEvent.isUnsold ? 'went Unsold' : `SOLD to ${lastSoldEvent.winner?.name} for ${formatINR(lastSoldEvent.price)}!`}
                </span>
              </div>
              {lastSoldEvent.skipped && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px]">
                  ⏩ Auto-Simulated
                </span>
              )}
            </div>
          )}

          {/* LOBBY / PRE-AUCTION STATE */}
          {room?.status === 'LOBBY' && (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner animate-bounce-short">
                🏏
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Live IPL Mega Auction Room</h2>
                <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                  {room.teams.length} team(s) joined. Timer set to <strong className="text-amber-400 font-bold">{currentTimerDuration}s per bid</strong>. Share room code <strong className="text-amber-400 font-mono text-base">{room.code}</strong> with friends!
                </p>
              </div>

              {isHost ? (
                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <button
                    onClick={onStartAuction}
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-2 text-base transition transform hover:scale-105"
                  >
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>START LIVE AUCTION</span>
                  </button>
                  <button
                    onClick={onAddBot}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3.5 rounded-2xl border border-slate-700 font-bold text-sm flex items-center gap-2 transition"
                  >
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span>Add AI Bot Team</span>
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl inline-flex items-center gap-3 text-sm text-slate-300">
                  <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                  <span>Waiting for host to begin the auction hammer...</span>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE AUCTION PLAYER SPOTLIGHT */}
          {room?.status === 'AUCTION' && player && (
            <div className="space-y-6">
              {/* TOP HEADER: TIER & COUNTDOWN TIMER & CONTROLS */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    {player.tier}
                  </span>
                  {player.isOverseas ? (
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                      ✈️ Overseas
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-bold">
                      🇮🇳 Domestic Indian
                    </span>
                  )}
                </div>

                {/* TIMER & FAST FORWARD BUTTON */}
                <div className="flex items-center gap-2">
                  {isPaused && (
                    <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                      ⏸️ PAUSED
                    </span>
                  )}
                  
                  <div className={`px-4 py-1.5 rounded-2xl border flex items-center gap-2 text-sm font-black transition-all ${
                    isPaused
                      ? 'bg-yellow-950/40 border-yellow-600/40 text-yellow-300'
                      : timer <= 4 
                        ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse-fast shadow-lg shadow-red-500/20' 
                        : timer <= 8 
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                          : 'bg-slate-800 border-slate-700 text-slate-200'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span className="text-lg font-mono">{timer}s</span>
                  </div>

                  {/* Fast Forward Button */}
                  <button
                    onClick={onFastForward}
                    title="Quick Forward (Instantly drop hammer to 1s)"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition flex items-center gap-1 text-xs font-bold"
                  >
                    <FastForward className="w-4 h-4" />
                    <span className="hidden sm:inline">Fast Forward</span>
                  </button>
                </div>
              </div>

              {/* HAMMER STATUS BANNER */}
              {hammerStage > 0 && currentBidder && !isPaused && (
                <div className={`py-2 px-4 rounded-xl text-center font-black text-sm tracking-wide border flex items-center justify-center gap-2 animate-bounce-short ${
                  hammerStage === 2 
                    ? 'bg-red-950/60 border-red-500/60 text-red-300 shadow-lg shadow-red-500/20' 
                    : 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-lg shadow-amber-500/20'
                }`}>
                  <Gavel className="w-4 h-4 animate-pulse" />
                  <span>{hammerStage === 1 ? '🔨 GOING ONCE...' : '🔨🔨 GOING TWICE...'}</span>
                </div>
              )}

              {/* MAIN PLAYER INFO CARD */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Player Avatar & Overall Rating */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/60 border border-slate-800 rounded-2xl relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border-2 border-amber-400/60 flex items-center justify-center text-4xl shadow-xl mb-3">
                    {player.roleIcon || '🏏'}
                  </div>
                  <div className="absolute top-3 right-3 bg-amber-400 text-slate-950 font-black text-sm px-2.5 py-0.5 rounded-full shadow">
                    ★ {player.overallRating}
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{player.country} {player.flag}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{player.age} Years Old • {player.stats.matchesPlayed} Matches</span>
                </div>

                {/* Player Details & Real Stats */}
                <div className="md:col-span-8 space-y-3 text-center md:text-left">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                      <span>{player.name}</span>
                      <span className="text-xl">{player.flag}</span>
                    </h2>
                    <p className={`text-sm font-bold ${player.roleColor || 'text-amber-400'} mt-0.5 flex items-center justify-center md:justify-start gap-1.5`}>
                      <span>{player.roleIcon}</span>
                      <span>{player.role}</span>
                      <span className="text-slate-500 font-normal">({player.category})</span>
                    </p>
                  </div>

                  {/* Traits & Achievements Pills */}
                  <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                    {player.traits?.map((t, idx) => (
                      <span key={idx} className="bg-slate-800/90 border border-slate-700/80 text-amber-200/90 text-xs px-2.5 py-0.5 rounded-md font-medium">
                        ✨ {t}
                      </span>
                    ))}
                  </div>

                  {/* Real Stats Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2 text-center">
                    <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Bat Avg</div>
                      <div className="text-base font-extrabold text-amber-400">{player.stats.battingAverage}</div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Strike Rate</div>
                      <div className="text-base font-extrabold text-amber-400">{player.stats.strikeRate}</div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        {player.category === 'Bowler' || player.category === 'All-Rounder' ? 'Bowl Econ' : 'Runs/100s'}
                      </div>
                      <div className="text-base font-extrabold text-teal-400">
                        {player.stats.bowlingEconomy > 0 
                          ? player.stats.bowlingEconomy 
                          : (player.stats.runs ? `${player.stats.runs}r` : '—')}
                      </div>
                    </div>
                    <div className="bg-slate-950/80 border border-slate-800 p-2 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        {player.stats.wickets ? 'Wickets' : 'Clutch'}
                      </div>
                      <div className="text-base font-extrabold text-purple-400">
                        {player.stats.wickets ? `${player.stats.wickets}w` : player.stats.clutchRating}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CURRENT BIDDING STATUS BOX */}
              <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-inner">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Current Highest Bid</div>
                  <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                    {formatINR(currentBid)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Base Price: <strong className="text-slate-300">{formatINR(player.basePrice)}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Leading Bidder</div>
                  {currentBidder ? (
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentBidder.color }} />
                      <span className="font-extrabold text-base text-white">{currentBidder.name}</span>
                      {currentBidder.isBot && (
                        <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-bold border border-blue-500/30">BOT</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-slate-500 mt-1">No bids yet</div>
                  )}
                </div>
              </div>

              {/* BIDDING CONTROLS & SKIP BUTTON */}
              {currentTeam && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Your Purse: <strong className="text-emerald-400 font-bold">{formatINR(currentTeam.purse)}</strong></span>
                    <span>Min Next Bid: <strong className="text-amber-300 font-bold">{formatINR(nextMinBid)}</strong></span>
                  </div>

                  {/* Quick Bid Increment Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <button
                      type="button"
                      disabled={isHighestBidder || !canAfford || isPaused}
                      onClick={() => handleQuickBid(nextIncrement)}
                      className={`py-3 px-4 rounded-xl font-extrabold text-sm transition flex flex-col items-center justify-center gap-0.5 shadow-lg ${
                        isHighestBidder
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 cursor-not-allowed'
                          : !canAfford || isPaused
                            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
                      }`}
                    >
                      <span className="text-xs uppercase">{isHighestBidder ? 'You are Leading' : 'Quick Bid'}</span>
                      <span className="text-base font-black">+{formatINR(nextIncrement)}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isHighestBidder || !canAfford || isPaused}
                      onClick={() => handleQuickBid(5000000)}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 py-3 px-3 rounded-xl border border-slate-700 font-bold text-xs flex flex-col items-center justify-center transition"
                    >
                      <span className="text-[10px] text-slate-400 uppercase">Increment</span>
                      <span className="text-sm font-extrabold text-white">+₹50 Lakhs</span>
                    </button>

                    <button
                      type="button"
                      disabled={isHighestBidder || !canAfford || isPaused}
                      onClick={() => handleQuickBid(10000000)}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 py-3 px-3 rounded-xl border border-slate-700 font-bold text-xs flex flex-col items-center justify-center transition"
                    >
                      <span className="text-[10px] text-slate-400 uppercase">Increment</span>
                      <span className="text-sm font-extrabold text-amber-300">+₹1.00 Crore</span>
                    </button>

                    <button
                      type="button"
                      disabled={isHighestBidder || !canAfford || isPaused}
                      onClick={() => handleQuickBid(20000000)}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 py-3 px-3 rounded-xl border border-slate-700 font-bold text-xs flex flex-col items-center justify-center transition"
                    >
                      <span className="text-[10px] text-slate-400 uppercase">Big Jump</span>
                      <span className="text-sm font-extrabold text-amber-400">+₹2.00 Crores</span>
                    </button>
                  </div>

                  {/* Custom Bid Input & NOT INTERESTED (SKIP) BUTTON */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                    <form onSubmit={handleCustomBid} className="sm:col-span-8 flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min={(nextMinBid / 10000000).toFixed(2)}
                        placeholder="Custom Bid in Cr (e.g. 8.5)"
                        value={customBid}
                        onChange={(e) => setCustomBid(e.target.value)}
                        disabled={isPaused}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!customBid || isHighestBidder || isPaused}
                        className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap"
                      >
                        Place Bid
                      </button>
                    </form>

                    {/* NOT INTERESTED (SKIP & AUTO-SIM) BUTTON */}
                    <button
                      type="button"
                      onClick={onSkipPlayer}
                      className="sm:col-span-4 bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/50 py-2.5 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-sm"
                      title="Skip this player: Let bots fight instantly and reveal who bought him!"
                    >
                      <SkipForward className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>Not Interested (Skip)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* HOST TOOLS BAR & LIVE CONTROLS */}
              {isHost && (
                <div className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-2xl border">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={onTogglePause}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition border ${
                        isPaused
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-yellow-950/50 hover:bg-yellow-900/60 text-yellow-300 border-yellow-600/40'
                      }`}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-slate-950" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      onClick={onFastForward}
                      className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>Quick Forward</span>
                    </button>

                    <button
                      onClick={onPassPlayer}
                      className="bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-800/50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>Pass / Unsold</span>
                    </button>

                    <button
                      onClick={onAddBot}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                      <span>Add Bot</span>
                    </button>
                  </div>

                  {/* Real-time Timer Duration Controller */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Timer:
                    </span>
                    <select
                      value={currentTimerDuration}
                      onChange={(e) => onSetTimerDuration(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value={10}>⚡ 10s Blitz</option>
                      <option value={15}>⏱️ 15s Standard</option>
                      <option value={20}>⏳ 20s Strategic</option>
                      <option value={30}>🕒 30s Relaxed</option>
                    </select>

                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400 font-medium">
                      Queue: <strong className="text-amber-400">{room.playerPool?.length || 0}</strong> left
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AUCTION COMPLETED STATE */}
          {room?.status === 'COMPLETED' && (
            <div className="text-center py-12 space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-4xl shadow-inner">
                🏆
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Mega Auction Completed!</h2>
                <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                  All drafted real players have been auctioned! Now let the AI evaluate squads and simulate matches!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: LIVE BIDDING STREAM & RECENT SALES (4 Cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* LIVE BID HISTORY FEED */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Live Bid Activity</span>
            </h3>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Real-Time</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {room?.bidHistory && room.bidHistory.length > 0 ? (
              room.bidHistory.map((b) => (
                <div key={b.id} className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.teamColor || '#3b82f6' }} />
                    <span className="font-bold text-slate-200">{b.teamName}</span>
                  </div>
                  <span className="font-black text-amber-400">{formatINR(b.amount)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No active bids placed for this player yet.
              </div>
            )}
          </div>
        </div>

        {/* RECENTLY SOLD PLAYERS TICKER */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Sold Players ({room?.soldList?.length || 0})</span>
            </h3>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {room?.soldList && room.soldList.length > 0 ? (
              room.soldList.slice(0, 10).map((p, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{p.name}</span>
                      <span>{p.flag}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sold to <strong className="text-slate-200">{p.boughtBy}</strong>
                    </div>
                  </div>
                  <span className="font-black text-emerald-400">{formatINR(p.soldPrice)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No players sold yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
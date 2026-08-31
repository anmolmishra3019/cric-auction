import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeLobby from './components/HomeLobby';
import AuctionArena from './components/AuctionArena';
import SquadTracker from './components/SquadTracker';
import PlayerPoolModal from './components/PlayerPoolModal';
import AiReportModal from './components/AiReportModal';
import MatchSimModal from './components/MatchSimModal';
import { useAuctionRoom } from './hooks/useAuctionRoom';

export default function App() {
  const {
    room,
    currentTeam,
    soundEnabled,
    volume,
    lastSoldEvent,
    antiSnipeToast,
    isHost,
    toggleSound,
    changeVolume,
    startSolo,
    createRoom,
    joinRoom,
    startAuction,
    togglePause,
    fastForward,
    skipPlayer,
    setTimerDuration,
    placeBid,
    passPlayer,
    addBot,
    generateMorePlayers,
    leaveRoom
  } = useAuctionRoom();

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [selectedTeamForAi, setSelectedTeamForAi] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        room={room}
        currentTeam={currentTeam}
        onOpenAiReport={() => {
          setSelectedTeamForAi(currentTeam || room?.teams[0]);
          setIsAiModalOpen(true);
        }}
        onOpenPlayerPool={() => setIsPoolModalOpen(true)}
        onOpenMatchSim={() => setIsSimModalOpen(true)}
        onLeaveRoom={leaveRoom}
        soundEnabled={soundEnabled}
        volume={volume}
        onToggleSound={toggleSound}
        onChangeVolume={changeVolume}
      />

      {/* Anti-Snipe Toast Notification */}
      {antiSnipeToast && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-black tracking-wide shadow-md animate-bounce-short">
          {antiSnipeToast}
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!room ? (
          <HomeLobby
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onStartSolo={startSolo}
          />
        ) : (
          <div className="space-y-8">
            {/* Live Auction Podium & Bidding Stage */}
            <AuctionArena
              room={room}
              currentTeam={currentTeam}
              onPlaceBid={placeBid}
              onPassPlayer={passPlayer}
              onNextPlayer={passPlayer}
              onStartAuction={startAuction}
              onAddBot={addBot}
              onTogglePause={togglePause}
              onFastForward={fastForward}
              onSkipPlayer={skipPlayer}
              lastSoldEvent={lastSoldEvent}
              onSetTimerDuration={setTimerDuration}
              onOpenPlayerPool={() => setIsPoolModalOpen(true)}
              isHost={isHost}
            />

            {/* Live Squads Leaderboard & Rosters */}
            <SquadTracker
              room={room}
              currentTeam={currentTeam}
              onSelectTeamForAi={(team) => {
                setSelectedTeamForAi(team);
                setIsAiModalOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      <PlayerPoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
        room={room}
        onGenerateMore={generateMorePlayers}
      />

      <AiReportModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        room={room}
        selectedTeam={selectedTeamForAi}
      />

      <MatchSimModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        room={room}
      />
    </div>
  );
}
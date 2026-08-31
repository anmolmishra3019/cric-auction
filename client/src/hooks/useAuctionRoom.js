import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { socket, API_BASE, getUserId } from '../services/socket';
import { soundFX } from '../services/soundEffects';

export function useAuctionRoom() {
  const [room, setRoom] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(soundFX.enabled);
  const [volume, setVolume] = useState(soundFX.volume);
  const [lastSoldEvent, setLastSoldEvent] = useState(null);
  const [antiSnipeToast, setAntiSnipeToast] = useState(null);

  useEffect(() => {
    socket.on('joined-success', ({ room: r, currentTeam: team }) => {
      setRoom(r);
      setCurrentTeam(team);
      sessionStorage.setItem('cric_auction_active_room', r.code);
      if (team?.ownerName) {
        localStorage.setItem('cric_auction_user_name', team.ownerName);
      }
    });

    socket.on('room-updated', ({ room: r }) => {
      setRoom(r);
      const uid = getUserId();
      const updated = r.teams.find((t) => t.userId === uid || (currentTeam && t.id === currentTeam.id));
      if (updated) setCurrentTeam(updated);
    });

    socket.on('bid-placed', ({ bidder, amount, antiSnipeExtended }) => {
      soundFX.playBid();
      if (antiSnipeExtended) {
        setAntiSnipeToast('⏱️ Anti-Snipe Rule Triggered! Timer extended to 5s.');
        setTimeout(() => setAntiSnipeToast(null), 3000);
      }
    });

    socket.on('timer-tick', ({ timer, hammerStage }) => {
      if (timer <= 5 && timer > 0) {
        soundFX.playTick();
      }
      if (hammerStage === 1 || hammerStage === 2) {
        soundFX.playGavel();
      }
    });

    socket.on('player-sold', ({ player, winner, price, isUnsold, skipped }) => {
      setLastSoldEvent({ player, winner, price, isUnsold, skipped });
      soundFX.playGavel();
      if (!isUnsold && winner) {
        soundFX.playSoldFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    });

    socket.on('bid-error', ({ message }) => {
      alert(`Bid Error: ${message}`);
    });

    socket.on('error-msg', ({ message }) => {
      alert(message);
    });

    // Auto-reconnect on mount
    const savedRoom = sessionStorage.getItem('cric_auction_active_room');
    const savedName = localStorage.getItem('cric_auction_user_name');
    if (savedRoom && savedName && !room) {
      socket.emit('join-room', {
        roomCode: savedRoom,
        userName: savedName,
        userId: getUserId()
      });
    }

    return () => {
      socket.off('joined-success');
      socket.off('room-updated');
      socket.off('bid-placed');
      socket.off('timer-tick');
      socket.off('player-sold');
      socket.off('bid-error');
      socket.off('error-msg');
    };
  }, [currentTeam]);

  // Audio Controls
  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.setMuted(!next);
  }, [soundEnabled]);

  const changeVolume = useCallback((newVol) => {
    setVolume(newVol);
    soundFX.setVolume(newVol);
  }, []);

  // Room Actions
  const startSolo = useCallback(({ hostName, teamName, purse, squadLimit, timerDuration }) => {
    const uid = getUserId();
    fetch(`${API_BASE}/api/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName, teamName, isSolo: true, purse, squadLimit, timerDuration, userId: uid })
    })
      .then((res) => res.json())
      .then(({ room: r, hostTeam }) => {
        setRoom(r);
        setCurrentTeam(hostTeam);
        sessionStorage.setItem('cric_auction_active_room', r.code);
        localStorage.setItem('cric_auction_user_name', hostName);
        socket.emit('join-room', { roomCode: r.code, userName: hostName, teamName, userId: uid });
      });
  }, []);

  const createRoom = useCallback(({ hostName, teamName, purse, squadLimit, timerDuration }) => {
    const uid = getUserId();
    fetch(`${API_BASE}/api/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostName, teamName, isSolo: false, purse, squadLimit, timerDuration, userId: uid })
    })
      .then((res) => res.json())
      .then(({ room: r, hostTeam }) => {
        setRoom(r);
        setCurrentTeam(hostTeam);
        sessionStorage.setItem('cric_auction_active_room', r.code);
        localStorage.setItem('cric_auction_user_name', hostName);
        socket.emit('join-room', { roomCode: r.code, userName: hostName, teamName, userId: uid });
      });
  }, []);

  const joinRoom = useCallback(({ userName, teamName, roomCode }) => {
    const uid = getUserId();
    localStorage.setItem('cric_auction_user_name', userName);
    sessionStorage.setItem('cric_auction_active_room', roomCode);
    socket.emit('join-room', { roomCode, userName, teamName, userId: uid });
  }, []);

  const startAuction = useCallback(() => {
    if (!room) return;
    socket.emit('start-auction', { roomCode: room.code });
  }, [room]);

  const togglePause = useCallback(() => {
    if (!room) return;
    socket.emit('toggle-pause', { roomCode: room.code });
  }, [room]);

  const fastForward = useCallback(() => {
    if (!room) return;
    socket.emit('fast-forward', { roomCode: room.code });
  }, [room]);

  const skipPlayer = useCallback(() => {
    if (!room) return;
    socket.emit('skip-player', { roomCode: room.code, teamId: currentTeam?.id });
  }, [room, currentTeam]);

  const setTimerDuration = useCallback((seconds) => {
    if (!room) return;
    socket.emit('set-timer-duration', { roomCode: room.code, seconds });
  }, [room]);

  const placeBid = useCallback((amount) => {
    if (!room || !currentTeam) return;
    socket.emit('place-bid', { roomCode: room.code, teamId: currentTeam.id, amount });
  }, [room, currentTeam]);

  const passPlayer = useCallback(() => {
    if (!room) return;
    socket.emit('pass-player', { roomCode: room.code });
  }, [room]);

  const addBot = useCallback(() => {
    if (!room) return;
    socket.emit('add-bot', { roomCode: room.code });
  }, [room]);

  const generateMorePlayers = useCallback(({ count, filter }) => {
    if (!room) return;
    socket.emit('generate-more-players', { roomCode: room.code, count, filter });
  }, [room]);

  const leaveRoom = useCallback(() => {
    if (window.confirm('Are you sure you want to exit this auction room?')) {
      sessionStorage.removeItem('cric_auction_active_room');
      setRoom(null);
      setCurrentTeam(null);
      setLastSoldEvent(null);
    }
  }, []);

  return {
    room,
    currentTeam,
    soundEnabled,
    volume,
    lastSoldEvent,
    antiSnipeToast,
    isHost: currentTeam?.isHost || false,
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
  };
}
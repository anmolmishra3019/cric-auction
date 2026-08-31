const { v4: uuidv4 } = require('uuid');
const { generatePlayer, generateInitialPool } = require('./playerGenerator');
const {
  calculateNextIncrement,
  calculateBotWillingness,
  evaluateBotBids
} = require('./botStrategy');

const DEFAULT_PURSE = 1000000000; // 100 Crores
const MAX_ACTIVE_ROOMS = 50;
const ROOM_GC_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes of inactivity
const HOST_MIGRATION_GRACE_MS = 60 * 1000; // 60 seconds

const BOT_TEAMS = [
  { name: 'Chennai Super Kings', shortName: 'CSK', color: '#FACC15', secondary: '#CA8A04', logo: '🦁' },
  { name: 'Mumbai Indians', shortName: 'MI', color: '#2563EB', secondary: '#1D4ED8', logo: '🦅' },
  { name: 'Royal Challengers Bengaluru', shortName: 'RCB', color: '#DC2626', secondary: '#991B1B', logo: '👑' },
  { name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#7C3AED', secondary: '#5B21B6', logo: '⚔️' },
  { name: 'Rajasthan Royals', shortName: 'RR', color: '#EC4899', secondary: '#BE185D', logo: '🏰' },
  { name: 'Sunrisers Hyderabad', shortName: 'SRH', color: '#F97316', secondary: '#C2410C', logo: '☀️' },
  { name: 'Delhi Capitals', shortName: 'DC', color: '#0284C7', secondary: '#0369A1', logo: '🐯' },
  { name: 'Gujarat Titans', shortName: 'GT', color: '#0F766E', secondary: '#115E59', logo: '⚡' },
  { name: 'Lucknow Super Giants', shortName: 'LSG', color: '#06B6D4', secondary: '#0891B2', logo: '🌪️' },
  { name: 'Punjab Kings', shortName: 'PBKS', color: '#E11D48', secondary: '#9F1239', logo: '🦁' }
];

class AuctionRoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom({ hostName, teamName, isSolo = false, purse = DEFAULT_PURSE, squadLimit = 18, maxOverseas = 8, timerDuration = 15, userId = null }) {
    if (this.rooms.size >= MAX_ACTIVE_ROOMS) {
      this.cleanupInactiveRooms();
      if (this.rooms.size >= MAX_ACTIVE_ROOMS) {
        return { error: 'Server room capacity reached (max 50 active rooms). Please try again later.' };
      }
    }

    const roomId = uuidv4().slice(0, 8);
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const resolvedUserId = userId || uuidv4();
    const dur = Math.max(5, Math.min(60, Number(timerDuration) || 15));
    
    const hostTeam = {
      id: uuidv4(),
      userId: resolvedUserId,
      socketId: null,
      name: teamName || `${hostName}'s XI`,
      shortName: (teamName || hostName).slice(0, 4).toUpperCase(),
      ownerName: hostName,
      isHost: true,
      isBot: false,
      purse: purse,
      initialPurse: purse,
      spent: 0,
      squad: [],
      color: '#3B82F6',
      logo: '🏏',
      disconnectedAt: null
    };

    const room = {
      id: roomId,
      code: roomCode,
      hostName,
      status: 'LOBBY',
      isPaused: false,
      isSolo,
      rules: {
        purse,
        squadLimit,
        minSquad: 11,
        maxOverseas,
        timerDuration: dur
      },
      teams: [hostTeam],
      playerPool: generateInitialPool(),
      currentPlayer: null,
      currentBid: 0,
      currentBidder: null,
      bidHistory: [],
      timer: dur,
      timerExpiresAt: null,
      remainingOnPause: null,
      hammerStage: 0,
      soldList: [],
      unsoldList: [],
      hasRunReEntry: false,
      isReEntryRound: false,
      snipeExtensionsCount: 0,
      chatMessages: [],
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };

    if (isSolo) {
      const selectedBots = BOT_TEAMS.slice(0, 5);
      selectedBots.forEach(bot => {
        room.teams.push({
          id: uuidv4(),
          userId: null,
          socketId: null,
          name: bot.name,
          shortName: bot.shortName,
          ownerName: `${bot.shortName} AI Owner`,
          isHost: false,
          isBot: true,
          purse: purse,
          initialPurse: purse,
          spent: 0,
          squad: [],
          color: bot.color,
          logo: bot.logo,
          disconnectedAt: null
        });
      });
    }

    this.rooms.set(roomCode, room);
    return { room, hostTeam };
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toUpperCase()) || null;
  }

  isHost(code, socketId) {
    const room = this.getRoom(code);
    if (!room) return false;
    const team = room.teams.find(t => t.socketId === socketId);
    return team ? Boolean(team.isHost) : false;
  }

  joinRoom(code, { userName, teamName, socketId, userId = null }) {
    const room = this.getRoom(code);
    if (!room) return { error: 'Room not found' };
    if (room.status === 'COMPLETED') return { error: 'Auction has already ended' };

    room.lastActiveAt = Date.now();

    let existingTeam = null;
    if (userId) {
      existingTeam = room.teams.find(t => t.userId === userId);
    }
    if (!existingTeam && userName) {
      existingTeam = room.teams.find(t => t.ownerName.toLowerCase() === userName.toLowerCase());
    }

    if (existingTeam) {
      existingTeam.socketId = socketId;
      existingTeam.disconnectedAt = null;
      if (userId && !existingTeam.userId) existingTeam.userId = userId;
      return { room, team: existingTeam, reconnected: true };
    }

    if (room.teams.length >= 10) {
      return { error: 'Room is full (max 10 teams)' };
    }

    const availableColors = ['#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#14B8A6'];
    const assignedColor = availableColors[room.teams.length % availableColors.length];
    const resolvedUserId = userId || uuidv4();

    const newTeam = {
      id: uuidv4(),
      userId: resolvedUserId,
      socketId,
      name: teamName || `${userName}'s XI`,
      shortName: (teamName || userName).slice(0, 4).toUpperCase(),
      ownerName: userName,
      isHost: false,
      isBot: false,
      purse: room.rules.purse,
      initialPurse: room.rules.purse,
      spent: 0,
      squad: [],
      color: assignedColor,
      logo: '⚡',
      disconnectedAt: null
    };

    room.teams.push(newTeam);
    return { room, team: newTeam, reconnected: false };
  }

  handleSocketDisconnect(socketId) {
    const affectedRooms = [];

    for (const [code, room] of this.rooms.entries()) {
      const team = room.teams.find(t => t.socketId === socketId);
      if (team) {
        team.socketId = null;
        team.disconnectedAt = Date.now();
        room.lastActiveAt = Date.now();

        const connectedHumans = room.teams.filter(t => !t.isBot && t.socketId !== null);
        if (connectedHumans.length === 0 && room.status === 'AUCTION') {
          if (!room.isPaused) {
            room.isPaused = true;
            room.remainingOnPause = Math.max(0, (room.timerExpiresAt || Date.now()) - Date.now());
          }
        }

        affectedRooms.push({ code, room, team });
      }
    }
    return affectedRooms;
  }

  checkHostMigration(code) {
    const room = this.getRoom(code);
    if (!room) return null;

    const currentHost = room.teams.find(t => t.isHost);
    const now = Date.now();

    if (currentHost && currentHost.socketId === null && currentHost.disconnectedAt && (now - currentHost.disconnectedAt > HOST_MIGRATION_GRACE_MS)) {
      const nextConnectedHuman = room.teams.find(t => !t.isBot && t.socketId !== null);
      if (nextConnectedHuman) {
        currentHost.isHost = false;
        nextConnectedHuman.isHost = true;
        room.hostName = nextConnectedHuman.ownerName;
        console.log(`👑 Host migrated to ${nextConnectedHuman.ownerName} in room ${code}`);
        return { migrated: true, newHost: nextConnectedHuman, room };
      }
    }
    return null;
  }

  startAuction(code) {
    const room = this.getRoom(code);
    if (!room) return null;

    room.status = 'AUCTION';
    room.isPaused = false;
    room.lastActiveAt = Date.now();
    this.bringNextPlayer(room);
    return room;
  }

  togglePause(code) {
    const room = this.getRoom(code);
    if (!room || room.status === 'LOBBY' || room.status === 'COMPLETED') return null;

    room.lastActiveAt = Date.now();
    if (!room.isPaused) {
      room.isPaused = true;
      room.remainingOnPause = Math.max(0, (room.timerExpiresAt || Date.now()) - Date.now());
    } else {
      room.isPaused = false;
      const rem = room.remainingOnPause !== null ? room.remainingOnPause : (room.rules.timerDuration * 1000);
      room.timerExpiresAt = Date.now() + rem;
      room.remainingOnPause = null;
    }
    return room;
  }

  setTimerDuration(code, seconds) {
    const room = this.getRoom(code);
    if (!room) return null;
    const dur = Math.max(5, Math.min(60, Number(seconds) || 15));
    room.rules.timerDuration = dur;
    room.timer = dur;
    if (room.status === 'AUCTION' && !room.isPaused) {
      room.timerExpiresAt = Date.now() + (dur * 1000);
    }
    room.lastActiveAt = Date.now();
    return room;
  }

  bringNextPlayer(room) {
    if (room.playerPool.length === 0) {
      // Check Unsold Re-entry Round trigger
      if (!room.hasRunReEntry && room.unsoldList.length > 0) {
        console.log(`🔄 Triggering Unsold Player Re-entry Round in room ${room.code} (${room.unsoldList.length} players)`);
        room.hasRunReEntry = true;
        room.isReEntryRound = true;
        room.playerPool = [...room.unsoldList];
        room.unsoldList = [];
      } else {
        room.status = 'COMPLETED';
        room.currentPlayer = null;
        room.timerExpiresAt = null;
        return;
      }
    }

    const nextPlayer = room.playerPool.shift();
    const dur = room.isReEntryRound ? Math.min(10, room.rules.timerDuration) : (room.rules.timerDuration || 15);
    room.currentPlayer = nextPlayer;
    room.currentBid = nextPlayer.basePrice;
    room.currentBidder = null;
    room.bidHistory = [];
    room.hammerStage = 0;
    room.timer = dur;
    room.timerExpiresAt = Date.now() + (dur * 1000);
    room.remainingOnPause = null;
    room.snipeExtensionsCount = 0;
    room.lastActiveAt = Date.now();
  }

  placeBid(code, teamId, bidAmount) {
    const room = this.getRoom(code);
    if (!room || room.status !== 'AUCTION' || !room.currentPlayer || room.isPaused) {
      return { error: 'Auction is not active or is paused' };
    }

    const team = room.teams.find(t => t.id === teamId);
    if (!team) return { error: 'Team not found' };

    if (team.squad.length >= room.rules.squadLimit) {
      return { error: 'Squad is full!' };
    }

    const overseasCount = team.squad.filter(p => p.isOverseas).length;
    if (room.currentPlayer.isOverseas && overseasCount >= room.rules.maxOverseas) {
      return { error: `Max overseas limit (${room.rules.maxOverseas}) reached!` };
    }

    const minRemainingRequired = (room.rules.minSquad - (team.squad.length + 1)) * 2000000;
    if (team.purse - bidAmount < Math.max(0, minRemainingRequired)) {
      return { error: 'Insufficient purse to complete minimum squad requirements!' };
    }

    if (room.currentBidder && room.currentBidder.id === teamId) {
      return { error: 'You are already the highest bidder!' };
    }

    if (room.currentBidder && bidAmount <= room.currentBid) {
      return { error: 'Bid must be higher than current bid!' };
    }

    const now = Date.now();
    const remainingMs = (room.timerExpiresAt || now) - now;
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    let extended = false;

    // ANTI-SNIPE RULE: If <= 3s remain, extend timer to 5s (capped at 3 extensions)
    if (remainingSeconds <= 3 && (room.snipeExtensionsCount || 0) < 3) {
      room.timerExpiresAt = now + 5000;
      room.timer = 5;
      room.snipeExtensionsCount = (room.snipeExtensionsCount || 0) + 1;
      extended = true;
    } else {
      const dur = room.rules.timerDuration || 15;
      room.timer = dur;
      room.timerExpiresAt = now + (dur * 1000);
    }

    room.currentBid = bidAmount;
    room.currentBidder = team;
    room.hammerStage = 0;
    room.lastActiveAt = now;

    room.bidHistory.unshift({
      id: uuidv4(),
      teamId: team.id,
      teamName: team.name,
      teamShort: team.shortName,
      teamColor: team.color,
      amount: bidAmount,
      timestamp: now,
      antiSnipeExtended: extended
    });

    return { success: true, room, antiSnipeExtended: extended };
  }

  sellCurrentPlayer(room) {
    if (!room.currentPlayer) return;

    const player = room.currentPlayer;
    const winningTeam = room.currentBidder;

    if (winningTeam) {
      const soldInfo = {
        ...player,
        soldPrice: room.currentBid,
        boughtBy: winningTeam.name,
        boughtById: winningTeam.id,
        boughtByShort: winningTeam.shortName,
        boughtByColor: winningTeam.color
      };

      const teamRef = room.teams.find(t => t.id === winningTeam.id);
      if (teamRef) {
        teamRef.squad.push(soldInfo);
        teamRef.purse -= room.currentBid;
        teamRef.spent += room.currentBid;
      }
      room.soldList.unshift(soldInfo);
    } else {
      room.unsoldList.unshift(player);
    }

    this.bringNextPlayer(room);
  }

  fastForward(code) {
    const room = this.getRoom(code);
    if (!room || room.status !== 'AUCTION' || !room.currentPlayer) return null;
    room.timer = 1;
    room.timerExpiresAt = Date.now() + 1000;
    room.lastActiveAt = Date.now();
    return room;
  }

  instantSkipAndSimulate(code, skipUserTeamId) {
    const room = this.getRoom(code);
    if (!room || room.status !== 'AUCTION' || !room.currentPlayer) return null;

    const player = room.currentPlayer;
    const bots = room.teams.filter(t => t.isBot && (!skipUserTeamId || t.id !== skipUserTeamId));
    
    let currentHighBid = room.currentBidder ? room.currentBid : 0;
    let currentHighBidder = room.currentBidder;

    let newBidPlaced = true;
    let round = 0;
    while (newBidPlaced && round < 25) {
      newBidPlaced = false;
      round++;

      for (const bot of bots) {
        if (currentHighBidder && currentHighBidder.id === bot.id) continue;
        const maxWillingness = calculateBotWillingness(bot, player, room, room.isReEntryRound || false);
        const nextInc = currentHighBidder ? calculateNextIncrement(currentHighBid) : 0;
        const nextBid = currentHighBidder ? currentHighBid + nextInc : player.basePrice;

        if (maxWillingness >= nextBid) {
          currentHighBid = nextBid;
          currentHighBidder = bot;
          newBidPlaced = true;
        }
      }
    }

    const playerSold = { ...player };
    room.currentBid = currentHighBid || player.basePrice;
    room.currentBidder = currentHighBidder;
    room.lastActiveAt = Date.now();

    this.sellCurrentPlayer(room);

    return {
      player: playerSold,
      winner: currentHighBidder,
      price: currentHighBidder ? currentHighBid : 0,
      isUnsold: !currentHighBidder,
      room
    };
  }

  passCurrentPlayer(code) {
    const room = this.getRoom(code);
    if (!room || !room.currentPlayer) return null;
    room.unsoldList.unshift(room.currentPlayer);
    room.lastActiveAt = Date.now();
    this.bringNextPlayer(room);
    return room;
  }

  addBotToRoom(code) {
    const room = this.getRoom(code);
    if (!room || room.teams.length >= 10) return null;

    const existingNames = new Set(room.teams.map(t => t.name));
    const available = BOT_TEAMS.filter(b => !existingNames.has(b.name));
    if (available.length === 0) return null;

    const botChoice = available[0];
    const botTeam = {
      id: uuidv4(),
      userId: null,
      socketId: null,
      name: botChoice.name,
      shortName: botChoice.shortName,
      ownerName: `${botChoice.shortName} AI Bot`,
      isHost: false,
      isBot: true,
      purse: room.rules.purse,
      initialPurse: room.rules.purse,
      spent: 0,
      squad: [],
      color: botChoice.color,
      logo: botChoice.logo,
      disconnectedAt: null
    };

    room.teams.push(botTeam);
    room.lastActiveAt = Date.now();
    return botTeam;
  }

  evaluateBotBids(room) {
    return evaluateBotBids(room);
  }

  addGeneratedPlayers(code, count = 10, filter = {}) {
    const room = this.getRoom(code);
    if (!room) return [];

    const newPlayers = [];
    for (let i = 0; i < count; i++) {
      const p = generatePlayer(filter);
      newPlayers.push(p);
      room.playerPool.push(p);
    }
    room.lastActiveAt = Date.now();
    return newPlayers;
  }

  cleanupInactiveRooms(maxAgeMs = ROOM_GC_TIMEOUT_MS) {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [code, room] of this.rooms.entries()) {
      const humanTeams = room.teams.filter(t => !t.isBot);
      const activeHumans = humanTeams.filter(t => t.socketId !== null);

      const isAbandoned = activeHumans.length === 0 && (now - (room.lastActiveAt || room.createdAt) > maxAgeMs);
      const isOldCompleted = room.status === 'COMPLETED' && (now - (room.lastActiveAt || room.createdAt) > 60 * 60 * 1000);

      if (isAbandoned || isOldCompleted) {
        this.rooms.delete(code);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} inactive room(s). Remaining: ${this.rooms.size}`);
    }
    return cleanedCount;
  }
}

module.exports = new AuctionRoomManager();
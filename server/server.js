const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

const auctionManager = require('./auctionRoomManager');
const { generatePlayer, COUNTRIES, ROLES, TIERS } = require('./playerGenerator');
const { analyzeSquad } = require('./aiAnalysisEngine');
const { simulateT20Match } = require('./matchSimulator');
const {
  createRoomSchema,
  joinRoomSchema,
  placeBidSchema,
  setTimerDurationSchema,
  generatePlayersSchema,
  roomOnlySchema,
  skipPlayerSchema
} = require('./validators');

dotenv.config();

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const isDev = process.env.NODE_ENV !== 'production';

// Express Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const corsOptions = {
  origin: (origin, callback) => {
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Bid Rate Limiter Map (SocketId -> Array of timestamps in ms)
const socketBidHistory = new Map();
const MAX_BIDS_PER_SECOND = 5;

function isBidRateLimited(socketId) {
  const now = Date.now();
  const history = socketBidHistory.get(socketId) || [];
  const recent = history.filter(ts => now - ts < 1000);
  recent.push(now);
  socketBidHistory.set(socketId, recent);
  return recent.length > MAX_BIDS_PER_SECOND;
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/metadata', (req, res) => {
  res.json({ countries: COUNTRIES, roles: ROLES, tiers: TIERS });
});

app.post('/api/players/generate', (req, res) => {
  const parsed = generatePlayersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { count = 10, filter = {} } = parsed.data;
  const players = [];
  for (let i = 0; i < count; i++) {
    players.push(generatePlayer(filter));
  }
  res.json({ players });
});

app.post('/api/rooms/create', (req, res) => {
  const parsed = createRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const result = auctionManager.createRoom(parsed.data);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ room: result.room, hostTeam: result.hostTeam });
});

app.get('/api/rooms/:code', (req, res) => {
  const room = auctionManager.getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({ room });
});

app.post('/api/ai/analyze', (req, res) => {
  const { team } = req.body;
  if (!team || typeof team !== 'object') return res.status(400).json({ error: 'Team data is required' });
  const analysis = analyzeSquad(team);
  res.json({ analysis });
});

app.post('/api/match/simulate', (req, res) => {
  const { teamA, teamB } = req.body;
  if (!teamA || !teamB) return res.status(400).json({ error: 'Both teams are required' });
  const result = simulateT20Match(teamA, teamB);
  res.json({ result });
});

// Serve Static Frontend (Production Build)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Socket.io Real-time Event Management with Zod Validation & Host Security
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-room', (payload) => {
    const parsed = joinRoomSchema.safeParse(payload);
    if (!parsed.success) {
      socket.emit('error-msg', { message: parsed.error.issues[0].message });
      return;
    }

    const { roomCode, userName, teamName, userId } = parsed.data;
    const result = auctionManager.joinRoom(roomCode, { userName, teamName, socketId: socket.id, userId });
    if (result.error) {
      socket.emit('error-msg', { message: result.error });
      return;
    }

    socket.join(roomCode);
    socket.emit('joined-success', { room: result.room, currentTeam: result.team });
    io.to(roomCode).emit('room-updated', { room: result.room });
  });

  socket.on('start-auction', (payload) => {
    const parsed = roomOnlySchema.safeParse(payload);
    if (!parsed.success) return socket.emit('error-msg', { message: parsed.error.issues[0].message });

    const { roomCode } = parsed.data;
    if (!auctionManager.isHost(roomCode, socket.id)) {
      return socket.emit('error-msg', { message: 'Only the room host can start the auction!' });
    }

    const room = auctionManager.startAuction(roomCode);
    if (room) {
      io.to(roomCode).emit('auction-started', { room });
      io.to(roomCode).emit('room-updated', { room });
    }
  });

  socket.on('toggle-pause', (payload) => {
    const parsed = roomOnlySchema.safeParse(payload);
    if (!parsed.success) return socket.emit('error-msg', { message: parsed.error.issues[0].message });

    const { roomCode } = parsed.data;
    if (!auctionManager.isHost(roomCode, socket.id)) {
      return socket.emit('error-msg', { message: 'Only the room host can pause/resume!' });
    }

    const room = auctionManager.togglePause(roomCode);
    if (room) {
      io.to(roomCode).emit('room-updated', { room });
    }
  });

  socket.on('fast-forward', (payload) => {
    const parsed = roomOnlySchema.safeParse(payload);
    if (!parsed.success) return socket.emit('error-msg', { message: parsed.error.issues[0].message });

    const { roomCode } = parsed.data;
    if (!auctionManager.isHost(roomCode, socket.id)) {
      return socket.emit('error-msg', { message: 'Only the room host can fast forward!' });
    }

    const room = auctionManager.fastForward(roomCode);
    if (room) {
      io.to(roomCode).emit('room-updated', { room });
    }
  });

  socket.on('skip-player', (payload) => {
    const parsed = skipPlayerSchema.safeParse(payload);
    if (!parsed.success) return socket.emit('error-msg', { message: parsed.error.issues[0].message });

    const { roomCode, teamId } = parsed.data;
    const result = auctionManager.instantSkipAndSimulate(roomCode, teamId);
    if (result) {
      io.to(roomCode).emit('player-sold', {
        player: result.player,
        winner: result.winner,
        price: result.price,
        isUnsold: result.isUnsold,
        skipped: true,
        room: result.room
      });
      io.to(roomCode).emit('room-updated', { room: result.room });
    }
  });

  socket.on('set-timer-duration', (payload) => {
    const parsed = setTimerDurationSchema.safeParse(payload);
    if (!parsed.success) return socket.emit('error-msg', { message: parsed.error.issues[0].message });

    const { roomCode, seconds } = parsed.data;
    if (!auctionManager.isHost(roomCode, socket.id)) {
      return socket.emit('error-msg', { message: 'Only the room host can change timer duration!' });
    }

    const room = auctionManager.setTimerDuration(roomCode, seconds);
    if (room) {
      io.to(roomCode).emit('room-updated', { room });
    }
  });

  socket.on('place-bid', (payload) => {
    if (isBidRateLimited(socket.id)) {
      return socket.emit('bid-error', { message: 'Too many bids! Please slow down (max 5 bids/sec).' });
    }

    const parsed = placeBidSchema.safeParse(payload);
    if (!parsed.success) {
      return socket.emit('bid-error', { message: parsed.error.issues[0].message });
    }

    const { roomCode, teamId, amount } = parsed.data;
    const result = auctionManager.placeBid(roomCode, teamId, amount);
    if (result.error) {
      return socket.emit('bid-error', { message: result.error });
    }

    io.to(roomCode).emit('bid-placed', {
      room: result.room,
      bidder: result.room.currentBidder,
      amount: result.room.currentBid,
      antiSnipeExtended: result.antiSnipeExtended
    });
    io.to(roomCode).emit('room-updated', { room: result.room });
  });

  socket.on('pass-player', (payload) => {
    const parsed = roomOnlySchema.safeParse(payload);
    if (!parsed.success) return;

    const { roomCode } = parsed.data;
    if (!auctionManager.isHost(roomCode, socket.id)) {
      return socket.emit('error-msg', { message: 'Only the room host can pass players!' });
    }

    const room = auctionManager.passCurrentPlayer(roomCode);
    if (room) {
      io.to(roomCode).emit('player-passed', { room });
      io.to(roomCode).emit('room-updated', { room });
    }
  });

  socket.on('add-bot', (payload) => {
    const parsed = roomOnlySchema.safeParse(payload);
    if (!parsed.success) return;

    const { roomCode } = parsed.data;
    if (!auctionManager.isHost(roomCode, socket.id)) {
      return socket.emit('error-msg', { message: 'Only the room host can add bot teams!' });
    }

    const bot = auctionManager.addBotToRoom(roomCode);
    const room = auctionManager.getRoom(roomCode);
    if (bot && room) {
      io.to(roomCode).emit('bot-added', { bot, room });
      io.to(roomCode).emit('room-updated', { room });
    }
  });

  socket.on('generate-more-players', (payload) => {
    const parsed = generatePlayersSchema.safeParse(payload);
    if (!parsed.success) return socket.emit('error-msg', { message: parsed.error.issues[0].message });

    const { roomCode, count, filter } = parsed.data;
    if (roomCode && !auctionManager.isHost(roomCode, socket.id)) {
      return socket.emit('error-msg', { message: 'Only the room host can add generated players!' });
    }

    if (roomCode) {
      const newPlayers = auctionManager.addGeneratedPlayers(roomCode, count, filter);
      const room = auctionManager.getRoom(roomCode);
      if (room) {
        io.to(roomCode).emit('players-added', { count: newPlayers.length, room });
        io.to(roomCode).emit('room-updated', { room });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    socketBidHistory.delete(socket.id);

    const affected = auctionManager.handleSocketDisconnect(socket.id);
    for (const { code, room } of affected) {
      io.to(code).emit('room-updated', { room });
    }
  });
});

// Master Authoritative Auction Heartbeat Timer (Timestamp-based)
setInterval(() => {
  const now = Date.now();

  for (const [code, room] of auctionManager.rooms.entries()) {
    const migration = auctionManager.checkHostMigration(code);
    if (migration) {
      io.to(code).emit('room-updated', { room: migration.room });
    }

    if (room.status !== 'AUCTION' || !room.currentPlayer || room.isPaused) continue;

    // AI Bot Bidding evaluation check with realistic human-like think delay
    if (Math.random() < 0.50) {
      const botBid = auctionManager.evaluateBotBids(room);
      if (botBid) {
        setTimeout(() => {
          const currentRoom = auctionManager.getRoom(code);
          if (currentRoom && currentRoom.status === 'AUCTION' && !currentRoom.isPaused && currentRoom.currentPlayer) {
            const res = auctionManager.placeBid(code, botBid.bot.id, botBid.nextBid);
            if (res.success) {
              io.to(code).emit('bid-placed', {
                room: res.room,
                bidder: res.room.currentBidder,
                amount: res.room.currentBid,
                antiSnipeExtended: res.antiSnipeExtended
              });
              io.to(code).emit('room-updated', { room: res.room });
            }
          }
        }, botBid.thinkDelayMs || 400);
      }
    }

    // Timestamp-based countdown verification
    const remainingMs = (room.timerExpiresAt || (now + 15000)) - now;
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    room.timer = remainingSeconds;

    if (room.timer > 0) {
      const dur = room.rules.timerDuration || 15;
      if (room.currentBidder) {
        if (room.timer <= Math.round(dur * 0.45) && room.timer > Math.round(dur * 0.2)) {
          room.hammerStage = 1; // Going Once...
        } else if (room.timer <= Math.round(dur * 0.2)) {
          room.hammerStage = 2; // Going Twice...
        }
      }

      io.to(code).emit('timer-tick', { 
        timer: room.timer, 
        hammerStage: room.hammerStage,
        currentPlayer: room.currentPlayer
      });
    } else {
      // Authoritative Expiration: Hammer Down!
      const playerSold = room.currentPlayer;
      const winner = room.currentBidder;
      
      auctionManager.sellCurrentPlayer(room);
      
      io.to(code).emit('player-sold', {
        player: playerSold,
        winner,
        price: playerSold.soldPrice || 0,
        isUnsold: !winner,
        room
      });
      io.to(code).emit('room-updated', { room });
    }
  }
}, 1000);

// Room Garbage Collection Sweep (Runs every 60 seconds)
setInterval(() => {
  auctionManager.cleanupInactiveRooms();
}, 60000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CricAuction AI Server running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Network: http://10.145.4.42:${PORT}`);
});
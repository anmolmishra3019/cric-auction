# 🏏 CricAuction AI — Live IPL Mega Auction Simulator & AI Intelligence Engine

A full-stack, real-time cricket auction platform powered by Node.js, Socket.io, React 19, Tailwind CSS, and AI tactical evaluation engines.

---

## 🌟 Highlights & Features

### ⚡ 1. Real-Time Authoritative Auction Arena
- **Live Bidding with Socket.io**: Server-authoritative timer with timestamp countdowns, hammer stages (Going Once, Going Twice, SOLD).
- **Anti-Snipe Protection**: If a bid lands with $\le 3\text{s}$ remaining, the timer automatically extends to $5\text{s}$ (max 3 extensions per player).
- **Pacing & Host Controls**: Pause/Resume, Fast-Forward to 1s, Custom Bidding Timers (10s, 15s, 20s, 30s), and "Not Interested (Instant Skip & Auto-Sim)".
- **Rapid Unsold Re-Entry Round**: Second-chance auction round for unsold players at discounted valuations after main pool completion.
- **Keyboard Shortcuts**: `Enter`/`Space` to Quick Bid, `+`/`-` to adjust increments, `P` to Pause, `F` to Fast-Forward, `S` to Skip.

### 🤖 2. Smart AI Franchise Bidders
- **Authentic IPL Franchises**: CSK, MI, RCB, KKR, RR, SRH, DC, GT, LSG, PBKS.
- **Budget-Conscious AI**: Dynamic purse reserve floors ($\approx ₹3\text{ Cr}$ per empty slot), marquee tier throttles, role saturation caps (max 2 WKs, max 6 pure batters/bowlers).
- **Franchise Traits & Biases**: MI prioritizes 150kph pace & power hitters; CSK targets ice-cool all-rounders; KKR loves mystery spinners; RR targets emerging young talent.
- **Human-Like Think Delays**: 300–1500ms think delays before counter-bidding.

### 📊 3. Deep 20-Over Match Simulation Engine
- **Ball-by-ball Inning Simulation**: Dynamic strike rotation, realistic wicket dismissal logs (`b Bumrah`, `c Kohli b Rashid`), run rates, phase breakdown (Powerplay, Middle, Death Overs).
- **Comprehensive Scorecards**: Runs, balls, 4s, 6s, strike rate, bowling economy, maidens, dot balls.
- **Fantasy Impact Score & MVP**: Formula-based player impact points identifying the Player of the Match.

### 🧠 4. AI Squad Intelligence & Playing XI Selector
- **Tactical Breakdown**: Overall Squad Score (0–100), Batting Depth, Bowling Firepower, Death Overs rating.
- **IPL Roasts & Praise Commentary**: Contextual squad roasts and tactical compliments.
- **Best Playing XI**: Automatic Playing XI builder enforcing max 4 overseas players, 1 wicketkeeper, and 5 bowling options.

---

## 🧪 Automated Test Suite

Run all unit, invariant, and property tests via Vitest:

```bash
npm test
```

### Test Coverage:
- `tests/matchSimulator.test.js`: 200+ simulated matches verifying run sums, overs ($\le 20$), bowler quotas ($\le 4\text{ ov}$), and dismissal authenticity.
- `tests/botBidding.test.js`: 100 full 5-bot simulated auctions verifying purse limits, squad constraints, and minimum squad safety reserves.
- `tests/aiAnalysisEngine.test.js`: 4 overseas limit enforcement, 1 WK guarantee, 5 bowling options, and 0–100 rating bounds.

---

## 🚀 Quickstart & Development

### 1. Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### 2. Run Local Development Server
```bash
npm run dev
```
- Server: `http://localhost:5000`
- Client: `http://localhost:5173`

### 3. Build & Run for Production
```bash
cd client && npm run build && cd ..
npm start
```

---

## 📂 Project Architecture

```
cric-auction-ai/
├── server/
│   ├── server.js              # REST endpoints, Helmet, CORS, Socket.io & Authoritative Heartbeat
│   ├── auctionRoomManager.js  # In-memory room manager, lifecycle, reconnection & GC
│   ├── botStrategy.js         # Pure bot decision algorithms & franchise biases
│   ├── validators.js          # Zod validation schemas for all inputs & events
│   ├── playerGenerator.js     # Procedural infinite player generator (130+ pool)
│   ├── realPlayersData.js     # Real IPL cricketer dataset with stats (as of 2026)
│   ├── aiAnalysisEngine.js    # Squad rating engine & Playing XI selector
│   └── matchSimulator.js      # 20-over match engine with fall of wickets & MVP calculation
├── client/
│   ├── src/
│   │   ├── components/        # Navbar, HomeLobby, AuctionArena, SquadTracker, Modals
│   │   ├── hooks/             # useAuctionRoom custom React hook
│   │   ├── services/          # socket.js & soundEffects.js (Web Audio synthesizer)
│   │   └── App.jsx            # Coordinator view
├── tests/                     # Vitest unit & property test suites
├── DEPLOYMENT.md              # Deployment guide for Render / Railway / Fly.io
└── package.json
```

---

## 📜 Disclaimer
*Player statistics, traits, and ratings are curated reflecting recent IPL and international career records as of 2026.*
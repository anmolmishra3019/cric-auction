# 🏏 CricAuction AI — Full Project Overview & Technical Documentation

**CricAuction AI** is a full-stack, real-time multiplayer IPL-style Cricket Auction web application with realistic player datasets, budget-conscious AI franchise bidding, deep tactical squad analysis, and a 20-over match simulation engine.

---

## 🚀 Key Highlights & Features

### 1. 👥 Massive Real Cricketer Dataset (130+ Players)
- **Authentic Career Stats**: Includes real IPL/T20 stats (batting average, strike rate, bowling economy, wickets, matches played, clutch rating, age, role, traits).
- **Roster Includes**:
  - **Superstars**: Virat Kohli, Rohit Sharma, MS Dhoni, Jasprit Bumrah, Suryakumar Yadav, Hardik Pandya, Rishabh Pant, Heinrich Klaasen, Travis Head, Rashid Khan, Nicholas Pooran, Sunil Narine, Andre Russell, Pat Cummins, Mitchell Starc, Jos Buttler, Kagiso Rabada, Trent Boult.
  - **Emerging & Pro Talents**: Yashasvi Jaiswal, Shubman Gill, Rinku Singh, Abhishek Sharma, Matheesha Pathirana, Mayank Yadav, Tilak Varma, Sai Sudharsan, Harshit Rana, Dhruv Jurel, Ashutosh Sharma, Sam Curran, Phil Salt, and 100+ more across 10 cricket-playing nations.
- **Role Categories**: Top-Order Batters, Anchors, Finishers, Wicketkeepers, Batting All-Rounders, Bowling All-Rounders, Express Fast Bowlers, Swing Bowlers, Leg-Spinners, Mystery Spinners.

---

### 2. 🧠 Smart Budget-Conscious AI Bidding Engine
- **Slot Budget Reservation Floor**: Bots dynamically reserve at least ₹3.0 - ₹3.5 Crores per empty squad slot to guarantee enough purse to fill a balanced 11-18 player squad without burning out early.
- **Tier-Based Spending Caps**: Bots limit their expenditure per player based on player rating and marquee count (e.g. ₹18.5 Cr max for 97+ legends like Bumrah/Kohli; downscales for subsequent players once a star is acquired).
- **Role Need Checks**: Prevents role saturation (e.g. max 2 WKs, max 6 pure batters, max 6 pure bowlers), prioritizing budget on deficit areas.
- **Overseas Quota Enforcement**: Strict IPL limit of max 8 overseas players per squad and max 4 in the Playing XI.

---

### 3. ⚡ Live Auction Room, Timer & Instant Skip Controls
- **Solo Mode vs 5 AI Bots** (CSK, MI, RCB, KKR, RR) or **Multiplayer Rooms** with sharable 6-character room codes.
- **Custom Timer Options**: 10s Blitz, 15s Standard, 20s Strategic, 30s Relaxed.
- **Live Host Controls**:
  - ⏸️ **Pause / Resume**: Pause the live countdown for strategy discussion.
  - ⏩ **Quick Forward**: Accelerates countdown to 1s for immediate hammer drop.
  - ⏭️ **Not Interested (Skip & Auto-Sim)**: Instantly simulates AI bots bidding war in the background, reveals the winner and price on a toast banner, and brings the next player immediately.
- **Web Audio Sound Synthesizers**: Built-in sound effects (Gavel hammer hits, bid chimes, countdown ticks, sold fanfare) generated via the Web Audio API (zero external audio file dependencies).

---

### 4. 🤖 AI Squad Analytics, Playing XI & IPL Roasts
- **Overall Squad Rating (0-100)**: Evaluates batting depth, bowling attack firepower, death-overs specialists, and spin/pace balance.
- **Best Playing XI Auto-Selector**: Automatically picks the optimal Playing XI honoring the 4-overseas limit, wicketkeeper requirements, balanced top-order, and 5-bowler setup.
- **IPL Roasts & Praises**: Contextual feedback in authentic Hinglish commentary style based on team strengths or glaring weaknesses.

---

### 5. 🏟️ Deep 20-Over Match Simulator & Player Impact Leaderboard
- **Full Scorecards**:
  - **Batting**: Runs, Balls, 4s, 6s, Strike Rate, Dismissal mode (e.g. `c Suryakumar Yadav b Jasprit Bumrah`, `b Nuwan Thushara`, `not out`).
  - **Bowling**: Overs, Maidens, Runs conceded, Wickets, Dots, Economy.
- **Phase Breakdown**: Powerplay (Overs 1-6), Middle Overs (7-15), Death Overs (16-20).
- **Fall of Wickets (FOW) Timeline**: Tracks exact scores and overs of each wicket.
- **Player Impact Score (Fantasy Points)**: Calculates individual impact from runs, boundaries, wickets, dot balls, and economy bonuses to award the **Player of the Match (MVP)**.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express, Socket.io, UUID, CORS |
| **Audio** | Web Audio API (Synthesized SFX) |
| **Networking** | WebSocket (Real-time bidirectional synchronization) + REST API |

---

## 📁 Project Directory Structure

```
cric-auction-ai/
├── package.json                   # Root package dependencies
├── server/
│   ├── server.js                  # Express REST API & Socket.io server
│   ├── playerGenerator.js         # Player generator & pool builder
│   ├── realPlayersData.js         # 50+ iconic real cricketers dataset
│   ├── auctionRoomManager.js      # Room management, bidding logic & smart AI bots
│   ├── aiAnalysisEngine.js        # AI squad evaluation & Playing XI selector
│   └── matchSimulator.js          # Deep 20-over match simulation engine
├── client/
│   ├── index.html                 # Vite HTML entry point
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # Tailwind CSS styling config
│   └── src/
│       ├── main.jsx               # React DOM root
│       ├── App.jsx                # Core application coordinator & socket listeners
│       ├── services/
│       │   ├── socket.js          # Socket.io connection & API_BASE config
│       │   └── soundEffects.js    # Web Audio API sound synthesizers
│       └── components/
│           ├── Navbar.jsx          # Header with room code, purse, and navigation modals
│           ├── HomeLobby.jsx       # Solo / Host / Join lobby & rules configuration
│           ├── AuctionArena.jsx    # Live podium, player card, bid pad, timer & skip controls
│           ├── SquadTracker.jsx    # Teams leaderboard, purse tracker & squad rosters
│           ├── PlayerPoolModal.jsx # Player pool viewer & custom player generator
│           ├── AiReportModal.jsx   # Squad tactical analysis, roasts & Best Playing XI
│           └── MatchSimModal.jsx   # Match simulator with full scorecards & MVP breakdown
```

---

## 🔌 API Endpoints & WebSocket Events

### REST API
- `POST /api/rooms/create`: Creates a new room (supports solo vs bots, custom purse, squad limits, timer duration).
- `GET /api/rooms/:code`: Retrieves full room state.
- `POST /api/ai/analyze-squad`: Evaluates squad composition and returns tactical scores, strengths, weaknesses, and Best Playing XI.
- `POST /api/match/simulate`: Runs a head-to-head 20-over clash between two squad rosters.

### WebSocket Events (Socket.io)
- **Client -> Server**:
  - `join-room`: Join room with username & team name.
  - `start-auction`: Host triggers the auction hammer.
  - `place-bid`: Place standard or custom bid amount.
  - `pass-player`: Skip / pass player without bidding.
  - `skip-player`: Instant skip & AI auto-simulation of current player.
  - `fast-forward`: Accelerate countdown timer to 1s.
  - `toggle-pause`: Pause/resume the live timer.
  - `set-timer-duration`: Change timer duration (10s, 15s, 20s, 30s).
  - `add-bot`: Add an AI bot franchise.
  - `generate-more-players`: Dynamically inject more players into the queue.
- **Server -> Client**:
  - `joined-success`: Room state on successful join.
  - `room-updated`: Broadcasted on any state change (bids, teams, purse).
  - `timer-tick`: Countdown timer tick (1-second intervals).
  - `player-sold`: Broadcasted when a player is sold or goes unsold.
  - `bid-error`: Error feedback for invalid bids (e.g. insufficient purse).

---

## 💻 How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Install Dependencies
```bash
# In the project root directory
npm install

# In the client directory
cd client
npm install
cd ..
```

### 3. Start the Backend Server
```bash
node server/server.js
# Backend runs on http://localhost:5000
```

### 4. Start the Frontend Dev Server
```bash
cd client
npm run dev -- --host 0.0.0.0 --port 5173
# Frontend runs on http://localhost:5173
```

---

## 🎯 Summary for AI Models / ChatGPT

This codebase is a complete, production-ready, interactive full-stack Node.js + React web application simulating an authentic IPL mega-auction environment. It features:
1. Real-time multiplayer synchronization via Socket.io.
2. 130+ real international cricket player profiles with verified IPL career statistics.
3. Realistic franchise budgeting algorithms ensuring AI bots retain purse for full 11-18 squad rosters.
4. Flexible auction pacing (Skip, Fast Forward, Pause/Resume, custom 10s-30s timers).
5. Comprehensive AI squad analysis (Playing XI, role balances, death bowling, roasts/praises).
6. 20-over match simulation engine with ball-by-ball commentary, full scorecards, dismissal tracking, and fantasy impact MVP scoring.

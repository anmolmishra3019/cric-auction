# CricAuction AI

A full-stack **real-time cricket auction simulator** combining live bidding, automated franchise strategies, squad analysis, and 20-over match simulation.

The project explores real-time state synchronization, server-authoritative events, rule-based decision systems, domain constraints, and simulation testing.

## Highlights

### Real-Time Auction

- Live bidding with **Socket.io**
- Server-authoritative auction timer
- Going Once / Going Twice / SOLD stages
- Anti-snipe timer extension
- Pause, resume, fast-forward, and configurable timers
- Unsold-player re-entry round
- Keyboard shortcuts for common auction actions

### Automated Franchise Bidders

Ten IPL franchise profiles use rule-based strategies with different priorities and constraints.

The bidding engine considers:

- Remaining purse
- Empty squad slots
- Player roles
- Role saturation
- Marquee tiers
- Franchise-specific preferences
- Minimum budget reserves

### Match Simulation

A 20-over ball-by-ball simulation engine models:

- Strike rotation and run scoring
- Wickets and dismissal logs
- Powerplay, middle-over, and death-over phases
- Batting and bowling scorecards
- Run rate and bowling economy
- Player impact scoring and MVP selection

### Squad Intelligence

The analysis engine provides:

- Overall squad rating
- Batting depth
- Bowling strength
- Death-over rating
- Tactical commentary
- Automated Playing XI selection
- Overseas-player and role constraints

## Tech Stack

- **React 19** — frontend UI
- **Tailwind CSS** — responsive styling
- **Node.js** — backend runtime
- **Socket.io** — real-time communication
- **Zod** — server-side validation
- **Vitest** — unit and simulation testing

## Architecture

```text
React Client
     │
     │ Socket.io / REST
     ▼
Node.js Server
     │
     ├── Auction Room Manager
     ├── Bid Validation
     ├── Bot Strategy Engine
     ├── Player Generator / Dataset
     ├── Squad Analysis Engine
     └── Match Simulation Engine
     │
     ▼
Vitest Test Suites
```

### Key Modules

```text
server/
├── server.js              # REST, Socket.io and server lifecycle
├── auctionRoomManager.js  # Room lifecycle and reconnection handling
├── botStrategy.js         # Automated bidding decisions
├── validators.js          # Zod input/event validation
├── playerGenerator.js     # Player pool generation
├── realPlayersData.js     # Player dataset
├── aiAnalysisEngine.js    # Squad analysis and Playing XI selection
└── matchSimulator.js      # 20-over match simulation

client/
└── src/
    ├── components/
    ├── hooks/
    ├── services/
    └── App.jsx

tests/
└── *.test.js
```

## Testing

Run the complete suite with:

```bash
npm test
```

Tests cover auction constraints, purse limits, squad rules, match invariants, over limits, and analysis constraints.

## Getting Started

### Install

```bash
npm install
cd client && npm install && cd ..
```

### Development

```bash
npm run dev
```

Typical local endpoints:

- Server: `http://localhost:5000`
- Client: `http://localhost:5173`

### Production Build

```bash
cd client && npm run build && cd ..
npm start
```

## Engineering Focus

This project demonstrates practical work with:

- Real-time client/server synchronization
- Server-authoritative state transitions
- Rule-based automated decision making
- Complex domain constraints
- Deterministic and invariant-oriented testing
- React component architecture
- Input validation at the server boundary

## Author

**Anmol Mishra**  
B.Tech ECE | Full-Stack Development | React | Node.js | JavaScript

// Franchise Personalities and Strategic Biases
const FRANCHISE_BIASES = {
  CSK: {
    name: 'Chennai Super Kings',
    preferredRoles: ['BOWL_AR', 'BAT_AR', 'ANCHOR', 'WK'],
    preferredTraits: ['Ice Cool', 'Experience', 'Composed', 'Captaincy'],
    multiplier: 1.15
  },
  MI: {
    name: 'Mumbai Indians',
    preferredRoles: ['FAST', 'BAT', 'FINISHER'],
    preferredTraits: ['Pace Cannon', '150kph', 'Six Machine', 'Powerplay'],
    multiplier: 1.15
  },
  RCB: {
    name: 'Royal Challengers Bengaluru',
    preferredRoles: ['BAT', 'ANCHOR', 'FAST'],
    preferredTraits: ['Iconic Superstar', 'Centuries', 'Boundary Magnet'],
    multiplier: 1.15
  },
  KKR: {
    name: 'Kolkata Knight Riders',
    preferredRoles: ['SPIN_OFF', 'BAT_AR', 'FINISHER', 'SWING'],
    preferredTraits: ['Mystery', 'Dre Russ', 'Spin Destroyer', 'Aggressive'],
    multiplier: 1.15
  },
  RR: {
    name: 'Rajasthan Royals',
    preferredRoles: ['BAT', 'SPIN_LEG', 'SWING'],
    preferredTraits: ['Emerging', 'Rising Star', 'Young', 'Fastest'],
    multiplier: 1.20
  }
};

function calculateNextIncrement(currentBid) {
  if (currentBid < 10000000) return 2000000;    // +20 Lakhs
  if (currentBid < 50000000) return 5000000;    // +50 Lakhs
  if (currentBid < 150000000) return 10000000;  // +1 Crore
  return 20000000;                              // +2 Crores
}

function calculateBotWillingness(bot, player, room, isReEntryRound = false) {
  if (bot.squad.length >= room.rules.squadLimit) return 0;

  const overseas = bot.squad.filter(p => p.isOverseas).length;
  if (player.isOverseas && overseas >= room.rules.maxOverseas) return 0;

  // Check Role Needs
  const batters = bot.squad.filter(p => p.category === 'Batter').length;
  const wks = bot.squad.filter(p => p.category === 'Wicketkeeper').length;
  const allRounders = bot.squad.filter(p => p.category === 'All-Rounder').length;
  const bowlers = bot.squad.filter(p => p.category === 'Bowler').length;

  if (player.category === 'Wicketkeeper' && wks >= 2) return 0;
  if (player.category === 'Batter' && batters >= 6) return 0;
  if (player.category === 'Bowler' && bowlers >= 6) return 0;
  if (player.category === 'All-Rounder' && allRounders >= 4) return 0;

  let roleMultiplier = 1.0;
  if (player.category === 'Wicketkeeper' && wks === 0) roleMultiplier = 1.35;
  else if (player.category === 'Bowler' && bowlers < 3) roleMultiplier = 1.25;
  else if (player.category === 'Batter' && batters < 3) roleMultiplier = 1.20;

  // Apply Franchise Personality Bias
  const bias = FRANCHISE_BIASES[bot.shortName];
  if (bias) {
    const matchesRole = bias.preferredRoles.includes(player.roleId) || bias.preferredRoles.includes(player.category);
    const matchesTrait = player.traits?.some(t => bias.preferredTraits.some(pt => t.toLowerCase().includes(pt.toLowerCase())));
    if (matchesRole || matchesTrait) {
      roleMultiplier *= bias.multiplier;
    }
  }

  // Calculate dynamic purse reserve floor
  const targetSquad = Math.min(15, room.rules.squadLimit);
  const slotsRemaining = Math.max(1, targetSquad - (bot.squad.length + 1));
  const reservedFloor = slotsRemaining * 3000000; // Reserve ₹3 Cr per empty slot
  const availableForPlayer = bot.purse - reservedFloor;

  if (availableForPlayer <= player.basePrice) return 0;

  // Tier Cap & Big Spender Throttle
  const expensivePlayersBought = bot.squad.filter(p => (p.soldPrice || 0) >= 12000000).length;
  let tierMax = 40000000; // Default ₹4 Cr

  if (player.overallRating >= 97) {
    tierMax = expensivePlayersBought >= 1 ? 140000000 : 185000000; // Max ₹18.5 Cr for Bumrah/Kohli
  } else if (player.overallRating >= 94) {
    tierMax = expensivePlayersBought >= 2 ? 80000000 : 130000000;  // ₹13 Cr
  } else if (player.overallRating >= 90) {
    tierMax = expensivePlayersBought >= 2 ? 60000000 : 90000000;   // ₹9 Cr
  } else if (player.overallRating >= 86) {
    tierMax = 55000000;                                           // ₹5.5 Cr
  } else {
    tierMax = 35000000;                                           // ₹3.5 Cr
  }

  // In Unsold Re-entry rounds, bots discount valuations to 70% (bargain hunting)
  if (isReEntryRound) {
    tierMax = Math.round(tierMax * 0.70);
  }

  const calculatedMax = Math.round(tierMax * roleMultiplier);
  return Math.min(availableForPlayer, calculatedMax);
}

function evaluateBotBids(room) {
  if (!room || room.status !== 'AUCTION' || !room.currentPlayer || room.isPaused) return null;

  const player = room.currentPlayer;
  const bots = room.teams.filter(t => t.isBot && (!room.currentBidder || room.currentBidder.id !== t.id));
  if (bots.length === 0) return null;

  // Shuffle bots slightly to create variety in bidding orders
  const shuffledBots = [...bots].sort(() => Math.random() - 0.5);

  for (const bot of shuffledBots) {
    const maxWillingness = calculateBotWillingness(bot, player, room, room.isReEntryRound || false);
    const nextIncrement = room.currentBidder ? calculateNextIncrement(room.currentBid) : 0;
    const nextBid = room.currentBidder ? room.currentBid + nextIncrement : player.basePrice;

    if (maxWillingness >= nextBid) {
      const interestProb = player.overallRating >= 95 ? 0.85 : player.overallRating >= 90 ? 0.65 : 0.45;
      if (Math.random() < interestProb) {
        // Assign random human-like think delay (300ms - 1500ms)
        const thinkDelayMs = Math.floor(Math.random() * 1200) + 300;
        return { bot, nextBid, thinkDelayMs };
      }
    }
  }
  return null;
}

module.exports = {
  FRANCHISE_BIASES,
  calculateNextIncrement,
  calculateBotWillingness,
  evaluateBotBids
};
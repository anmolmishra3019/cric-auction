import { describe, it, expect, beforeEach } from 'vitest';
const auctionManager = require('../server/auctionRoomManager');

describe('AI Bot Bidding Engine - Property Tests (100 Full Auctions)', () => {
  beforeEach(() => {
    auctionManager.rooms.clear();
  });

  it('should never exceed purse, should respect overseas caps and role constraints across 100 full auctions', () => {
    for (let sim = 0; sim < 100; sim++) {
      auctionManager.rooms.clear();
      const { room } = auctionManager.createRoom({
        hostName: `SimulationUser_${sim}`,
        teamName: 'User XI',
        isSolo: true,
        purse: 1000000000,
        squadLimit: 18,
        maxOverseas: 8,
        timerDuration: 10
      });

      expect(room).toBeDefined();
      expect(room.code).toBeDefined();

      auctionManager.startAuction(room.code);

      // Simulate auction until all players in pool are processed
      while (room.status === 'AUCTION' && room.currentPlayer) {
        const skipRes = auctionManager.instantSkipAndSimulate(room.code, null);
        expect(skipRes).toBeDefined();
      }

      // Check invariants on every bot franchise
      const botTeams = room.teams.filter(t => t.isBot);
      expect(botTeams.length).toBe(5);

      botTeams.forEach(bot => {
        // 1. Purse invariants: Spent + Remaining == Initial Purse
        expect(bot.spent).toBeGreaterThanOrEqual(0);
        expect(bot.purse).toBeGreaterThanOrEqual(0);
        expect(bot.spent + bot.purse).toBe(bot.initialPurse);
        expect(bot.purse).toBeLessThanOrEqual(bot.initialPurse);

        // 2. Squad size limits
        expect(bot.squad.length).toBeLessThanOrEqual(room.rules.squadLimit);

        // 3. Overseas limits: Max 8 overseas
        const overseas = bot.squad.filter(p => p.isOverseas);
        expect(overseas.length).toBeLessThanOrEqual(8);

        // 4. Role saturation constraints
        const wks = bot.squad.filter(p => p.category === 'Wicketkeeper');
        expect(wks.length).toBeLessThanOrEqual(2);

        const pureBatters = bot.squad.filter(p => p.category === 'Batter');
        expect(pureBatters.length).toBeLessThanOrEqual(6);

        const pureBowlers = bot.squad.filter(p => p.category === 'Bowler');
        expect(pureBowlers.length).toBeLessThanOrEqual(6);

        // 5. If squad is less than minSquad (11), remaining purse must be >= (minSquad - currentSquad) * basePrice
        const needed = room.rules.minSquad - bot.squad.length;
        if (needed > 0) {
          expect(bot.purse).toBeGreaterThanOrEqual(needed * 2000000);
        }
      });
    }
  });
});
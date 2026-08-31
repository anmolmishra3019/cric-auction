import { describe, it, expect } from 'vitest';
const { simulateT20Match } = require('../server/matchSimulator');
const { generatePlayer } = require('../server/playerGenerator');

function createSampleSquad(namePrefix) {
  const squad = [];
  // 1 WK
  squad.push(generatePlayer({ name: `${namePrefix}_WK_1`, role: 'WK', country: 'India' }));
  // 4 Batters (1 overseas)
  squad.push(generatePlayer({ name: `${namePrefix}_BAT_1`, role: 'BAT', country: 'India' }));
  squad.push(generatePlayer({ name: `${namePrefix}_BAT_2`, role: 'BAT', country: 'India' }));
  squad.push(generatePlayer({ name: `${namePrefix}_BAT_3`, role: 'ANCHOR', country: 'Australia' }));
  squad.push(generatePlayer({ name: `${namePrefix}_BAT_4`, role: 'FINISHER', country: 'India' }));
  // 3 All-rounders (2 overseas)
  squad.push(generatePlayer({ name: `${namePrefix}_AR_1`, role: 'BAT_AR', country: 'England' }));
  squad.push(generatePlayer({ name: `${namePrefix}_AR_2`, role: 'BOWL_AR', country: 'West Indies' }));
  squad.push(generatePlayer({ name: `${namePrefix}_AR_3`, role: 'BOWL_AR', country: 'India' }));
  // 4 Bowlers (1 overseas)
  squad.push(generatePlayer({ name: `${namePrefix}_BOWL_1`, role: 'FAST', country: 'India' }));
  squad.push(generatePlayer({ name: `${namePrefix}_BOWL_2`, role: 'FAST', country: 'South Africa' }));
  squad.push(generatePlayer({ name: `${namePrefix}_BOWL_3`, role: 'SPIN_LEG', country: 'India' }));
  squad.push(generatePlayer({ name: `${namePrefix}_BOWL_4`, role: 'SWING', country: 'India' }));
  return squad;
}

describe('T20 Match Simulator - Invariant Tests (200+ Simulations)', () => {
  it('should satisfy all cricket match invariants across 200+ matches', () => {
    for (let i = 0; i < 200; i++) {
      const teamA = { name: `Team_Alpha_${i}`, squad: createSampleSquad(`A_${i}`) };
      const teamB = { name: `Team_Beta_${i}`, squad: createSampleSquad(`B_${i}`) };

      const match = simulateT20Match(teamA, teamB);

      // 1. Result summary and MVP
      expect(match).toHaveProperty('summary');
      expect(typeof match.summary).toBe('string');
      expect(match.mvp).toBeDefined();
      expect(match.mvp.impactScore).toBeGreaterThanOrEqual(0);

      // 2. Team A Invariants
      expect(match.teamA.runs).toBeGreaterThanOrEqual(0);
      expect(match.teamA.wickets).toBeGreaterThanOrEqual(0);
      expect(match.teamA.wickets).toBeLessThanOrEqual(10);
      const oversA = parseFloat(match.teamA.overs);
      expect(oversA).toBeLessThanOrEqual(20.0);
      expect(oversA).toBeGreaterThanOrEqual(0);

      // 3. Team B Invariants
      expect(match.teamB.runs).toBeGreaterThanOrEqual(0);
      expect(match.teamB.wickets).toBeGreaterThanOrEqual(0);
      expect(match.teamB.wickets).toBeLessThanOrEqual(10);
      const oversB = parseFloat(match.teamB.overs);
      expect(oversB).toBeLessThanOrEqual(20.0);
      expect(oversB).toBeGreaterThanOrEqual(0);

      // 4. Batters mathematical consistency
      let sumRunsA = 0;
      match.teamA.batters.forEach(b => {
        expect(b.runs).toBeGreaterThanOrEqual(0);
        expect(b.balls).toBeGreaterThanOrEqual(0);
        expect(b.fours).toBeGreaterThanOrEqual(0);
        expect(b.sixes).toBeGreaterThanOrEqual(0);
        if (b.balls > 0) {
          expect(b.strikeRate).toBeGreaterThanOrEqual(0);
        }
        sumRunsA += b.runs;
      });
      expect(sumRunsA).toBe(match.teamA.runs);

      // 5. Bowling quotas (no bowler exceeds 4 overs)
      match.teamB.bowlers.forEach(bw => {
        expect(bw.overs).toBeLessThanOrEqual(4);
        expect(bw.overs).toBeGreaterThanOrEqual(0);
        expect(bw.wickets).toBeGreaterThanOrEqual(0);
        expect(bw.wickets).toBeLessThanOrEqual(10);
        expect(bw.runsConceded).toBeGreaterThanOrEqual(0);
      });

      match.teamA.bowlers.forEach(bw => {
        expect(bw.overs).toBeLessThanOrEqual(4);
        expect(bw.overs).toBeGreaterThanOrEqual(0);
        expect(bw.wickets).toBeGreaterThanOrEqual(0);
        expect(bw.wickets).toBeLessThanOrEqual(10);
        expect(bw.runsConceded).toBeGreaterThanOrEqual(0);
      });

      // 6. Dismissal authenticity check
      match.teamA.batters.forEach(b => {
        if (b.dismissal !== 'not out') {
          expect(b.dismissal.length).toBeGreaterThan(3);
        }
      });
    }
  });
});
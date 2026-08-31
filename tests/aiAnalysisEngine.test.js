import { describe, it, expect } from 'vitest';
const { analyzeSquad, selectPlayingXI } = require('../server/aiAnalysisEngine');
const { generatePlayer } = require('../server/playerGenerator');

describe('AI Analysis Engine & Playing XI Selector Tests', () => {
  it('should always enforce max 4 overseas players in Playing XI', () => {
    // Construct squad with 8 overseas players
    const squad = [];
    for (let i = 0; i < 8; i++) {
      squad.push(generatePlayer({ name: `Overseas_${i}`, country: 'Australia' }));
    }
    for (let i = 0; i < 8; i++) {
      squad.push(generatePlayer({ name: `Domestic_${i}`, country: 'India' }));
    }

    const xi = selectPlayingXI(squad);
    expect(xi.length).toBe(11);

    const overseasInXI = xi.filter(p => p.isOverseas);
    expect(overseasInXI.length).toBeLessThanOrEqual(4);
  });

  it('should always select at least 1 Wicketkeeper if present in squad', () => {
    const squad = [];
    squad.push(generatePlayer({ name: 'Specialist_WK', role: 'WK', country: 'India' }));
    for (let i = 0; i < 14; i++) {
      squad.push(generatePlayer({ name: `Player_${i}`, role: i < 7 ? 'BAT' : 'FAST', country: 'India' }));
    }

    const xi = selectPlayingXI(squad);
    expect(xi.some(p => p.category === 'Wicketkeeper')).toBe(true);
  });

  it('should select at least 5 bowling options in the Playing XI', () => {
    const squad = [];
    // 1 WK
    squad.push(generatePlayer({ name: 'WK_1', role: 'WK', country: 'India' }));
    // 4 Batters
    for (let i = 0; i < 4; i++) squad.push(generatePlayer({ name: `BAT_${i}`, role: 'BAT', country: 'India' }));
    // 2 All-rounders
    for (let i = 0; i < 2; i++) squad.push(generatePlayer({ name: `AR_${i}`, role: 'BAT_AR', country: 'India' }));
    // 4 Bowlers
    for (let i = 0; i < 4; i++) squad.push(generatePlayer({ name: `BOWL_${i}`, role: 'FAST', country: 'India' }));

    const xi = selectPlayingXI(squad);
    const bowlingOptions = xi.filter(p => p.category === 'Bowler' || p.category === 'All-Rounder');
    expect(bowlingOptions.length).toBeGreaterThanOrEqual(5);
  });

  it('should generate valid overall scores, roasts and praises', () => {
    const squad = [];
    for (let i = 0; i < 15; i++) {
      squad.push(generatePlayer());
    }

    const analysis = analyzeSquad({ name: 'RCB Challengers', squad });
    expect(analysis.overallScore).toBeGreaterThanOrEqual(0);
    expect(analysis.overallScore).toBeLessThanOrEqual(100);
    expect(analysis.battingDepth).toBeGreaterThanOrEqual(0);
    expect(analysis.bowlingAttack).toBeGreaterThanOrEqual(0);
    expect(analysis.deathOvers).toBeGreaterThanOrEqual(0);
    expect(typeof analysis.roast).toBe('string');
    expect(typeof analysis.praise).toBe('string');
    expect(analysis.playingXI.length).toBe(11);
  });
});
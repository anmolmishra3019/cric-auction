const { selectPlayingXI } = require('./aiAnalysisEngine');

function simulateT20Match(teamA, teamB) {
  const xiA = selectPlayingXI(teamA.squad || []);
  const xiB = selectPlayingXI(teamB.squad || []);

  const innings1 = simulateInnings(xiA, xiB, null, teamA.name, teamB.name);
  const innings2 = simulateInnings(xiB, xiA, innings1.totalRuns, teamB.name, teamA.name);

  let winner, margin, summary;

  if (innings2.totalRuns > innings1.totalRuns) {
    winner = teamB;
    const wktsLeft = 10 - innings2.totalWickets;
    margin = `${wktsLeft} wicket${wktsLeft > 1 ? 's' : ''}`;
    summary = `${teamB.name} chased down ${innings1.totalRuns + 1} and won by ${margin}!`;
  } else if (innings1.totalRuns > innings2.totalRuns) {
    winner = teamA;
    const runDiff = innings1.totalRuns - innings2.totalRuns;
    margin = `${runDiff} run${runDiff > 1 ? 's' : ''}`;
    summary = `${teamA.name} defended ${innings1.totalRuns} and won by ${margin}!`;
  } else {
    winner = null;
    margin = 'Super Over Tie';
    summary = `Thrilling TIE! Both teams scored ${innings1.totalRuns} runs!`;
  }

  // Calculate comprehensive Player Impact Scores
  const allPlayerPerformances = [];

  // Team A Batters
  innings1.batters.forEach(b => {
    const impact = Math.round((b.runs * 1.2) + (b.fours * 2) + (b.sixes * 4) + (b.runs >= 50 ? 20 : 0) + (b.runs >= 100 ? 40 : 0) + (b.strikeRate >= 150 && b.balls >= 10 ? 12 : 0));
    allPlayerPerformances.push({
      name: b.name,
      team: teamA.name,
      role: 'Batter',
      batting: `${b.runs} (${b.balls})`,
      bowling: '—',
      impactScore: impact,
      summary: `${b.runs} runs off ${b.balls} balls [${b.fours}x4, ${b.sixes}x6, SR: ${b.strikeRate}]`
    });
  });

  // Team B Bowlers
  innings1.bowlers.forEach(bw => {
    if (bw.overs > 0) {
      const econBonus = bw.economy <= 7.0 ? 18 : bw.economy <= 8.5 ? 8 : 0;
      const impact = Math.round((bw.wickets * 28) + (bw.maidens * 20) + (bw.dots * 1.2) + econBonus);
      const existing = allPlayerPerformances.find(p => p.name === bw.name);
      if (existing) {
        existing.bowling = `${bw.wickets}/${bw.runsConceded} (${bw.overs} ov)`;
        existing.impactScore += impact;
      } else {
        allPlayerPerformances.push({
          name: bw.name,
          team: teamB.name,
          role: 'Bowler',
          batting: '—',
          bowling: `${bw.wickets}/${bw.runsConceded} (${bw.overs} ov)`,
          impactScore: impact,
          summary: `${bw.wickets} wickets for ${bw.runsConceded} runs in ${bw.overs} overs (Econ: ${bw.economy})`
        });
      }
    }
  });

  // Team B Batters
  innings2.batters.forEach(b => {
    const impact = Math.round((b.runs * 1.2) + (b.fours * 2) + (b.sixes * 4) + (b.runs >= 50 ? 20 : 0) + (b.runs >= 100 ? 40 : 0) + (b.strikeRate >= 150 && b.balls >= 10 ? 12 : 0));
    const existing = allPlayerPerformances.find(p => p.name === b.name);
    if (existing) {
      existing.batting = `${b.runs} (${b.balls})`;
      existing.impactScore += impact;
    } else {
      allPlayerPerformances.push({
        name: b.name,
        team: teamB.name,
        role: 'Batter',
        batting: `${b.runs} (${b.balls})`,
        bowling: '—',
        impactScore: impact,
        summary: `${b.runs} runs off ${b.balls} balls [${b.fours}x4, ${b.sixes}x6, SR: ${b.strikeRate}]`
      });
    }
  });

  // Team A Bowlers
  innings2.bowlers.forEach(bw => {
    if (bw.overs > 0) {
      const econBonus = bw.economy <= 7.0 ? 18 : bw.economy <= 8.5 ? 8 : 0;
      const impact = Math.round((bw.wickets * 28) + (bw.maidens * 20) + (bw.dots * 1.2) + econBonus);
      const existing = allPlayerPerformances.find(p => p.name === bw.name);
      if (existing) {
        existing.bowling = `${bw.wickets}/${bw.runsConceded} (${bw.overs} ov)`;
        existing.impactScore += impact;
      } else {
        allPlayerPerformances.push({
          name: bw.name,
          team: teamA.name,
          role: 'Bowler',
          batting: '—',
          bowling: `${bw.wickets}/${bw.runsConceded} (${bw.overs} ov)`,
          impactScore: impact,
          summary: `${bw.wickets} wickets for ${bw.runsConceded} runs in ${bw.overs} overs (Econ: ${bw.economy})`
        });
      }
    }
  });

  allPlayerPerformances.sort((a, b) => b.impactScore - a.impactScore);
  const mvp = allPlayerPerformances[0] || { name: 'Match Winner', impactScore: 100, team: winner ? winner.name : teamA.name, summary: 'All-round match winning performance' };

  return {
    teamA: {
      name: teamA.name,
      shortName: teamA.shortName,
      color: teamA.color,
      logo: teamA.logo,
      runs: innings1.totalRuns,
      wickets: innings1.totalWickets,
      overs: innings1.overs,
      runRate: (innings1.totalRuns / 20).toFixed(2),
      phases: innings1.phases,
      fallOfWickets: innings1.fallOfWickets,
      batters: innings1.batters,
      bowlers: innings2.bowlers
    },
    teamB: {
      name: teamB.name,
      shortName: teamB.shortName,
      color: teamB.color,
      logo: teamB.logo,
      runs: innings2.totalRuns,
      wickets: innings2.totalWickets,
      overs: innings2.overs,
      runRate: (innings2.totalRuns / 20).toFixed(2),
      phases: innings2.phases,
      fallOfWickets: innings2.fallOfWickets,
      batters: innings2.batters,
      bowlers: innings1.bowlers
    },
    winner: winner ? { name: winner.name, color: winner.color, logo: winner.logo } : null,
    margin,
    summary,
    mvp,
    topImpactPlayers: allPlayerPerformances.slice(0, 5),
    highlights: [...innings1.highlights, ...innings2.highlights].slice(0, 10)
  };
}

function simulateInnings(battingXI, bowlingXI, target = null, batTeamName = '', bowlTeamName = '') {
  let runs = 0;
  let wickets = 0;
  let balls = 0;
  const maxOvers = 20;

  const batters = battingXI.slice(0, 11).map((p) => ({
    name: p.name,
    category: p.category,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
    dismissal: 'not out',
    rating: p.overallRating
  }));

  // Identify 5 primary bowlers from bowling team
  const availableBowlers = bowlingXI.filter(p => p.category === 'Bowler' || p.category === 'All-Rounder');
  let bowlers = availableBowlers.slice(0, 5).map(p => ({
    name: p.name,
    overs: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    dots: 0,
    economy: 0,
    rating: p.overallRating
  }));

  // If fewer than 5 bowlers, fill with other members
  if (bowlers.length < 5) {
    const extra = bowlingXI.filter(p => !bowlers.some(b => b.name === p.name));
    for (const ex of extra) {
      if (bowlers.length >= 5) break;
      bowlers.push({
        name: ex.name,
        overs: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        dots: 0,
        economy: 0,
        rating: ex.overallRating || 75
      });
    }
  }

  let strikerIdx = 0;
  let nonStrikerIdx = 1;
  const highlights = [];
  const fallOfWickets = [];

  let powerplayRuns = 0, powerplayWkts = 0;
  let middleRuns = 0, middleWkts = 0;
  let deathRuns = 0, deathWkts = 0;

  for (let over = 0; over < maxOvers; over++) {
    if (wickets >= 10 || (target !== null && runs > target)) break;

    const currentBowler = bowlers[over % bowlers.length];
    currentBowler.overs++;
    let overRuns = 0;

    for (let b = 1; b <= 6; b++) {
      if (wickets >= 10 || (target !== null && runs > target)) break;
      balls++;

      const striker = batters[strikerIdx];
      if (!striker) break;
      striker.balls++;

      const strikerSkill = (striker.rating || 80) / 100;
      const bowlerSkill = (currentBowler.rating || 80) / 100;

      const rand = Math.random();
      const isPowerplay = over < 6;
      const isDeath = over >= 15;

      // Realistic wicket probability (averaging 4-7 wickets in 20 overs)
      const wktChance = isDeath ? 0.065 + bowlerSkill * 0.025 : 0.040 + bowlerSkill * 0.02 - strikerSkill * 0.015;

      if (rand < wktChance) {
        wickets++;
        currentBowler.wickets++;
        
        const dRand = Math.random();
        if (dRand > 0.65) {
          striker.dismissal = `b ${currentBowler.name}`;
        } else if (dRand > 0.35) {
          const fielder = bowlingXI[Math.floor(Math.random() * bowlingXI.length)]?.name || 'Fielder';
          striker.dismissal = `c ${fielder} b ${currentBowler.name}`;
        } else if (dRand > 0.15) {
          striker.dismissal = `lbw b ${currentBowler.name}`;
        } else {
          striker.dismissal = `run out (${bowlingXI[0]?.name || 'Keeper'})`;
        }

        fallOfWickets.push({
          wicketNum: wickets,
          score: runs,
          overs: `${over}.${b}`,
          batterName: striker.name,
          runsScored: striker.runs
        });

        highlights.push(`⚡ WICKET! Over ${over}.${b}: ${currentBowler.name} dismisses ${striker.name} (${striker.runs} off ${striker.balls})! [${striker.dismissal}]`);
        
        if (isPowerplay) powerplayWkts++;
        else if (isDeath) deathWkts++;
        else middleWkts++;

        strikerIdx = Math.max(strikerIdx, nonStrikerIdx) + 1;
        if (strikerIdx >= batters.length) break;
      } else {
        let ballRuns = 0;
        const outcome = Math.random();

        // Realistic run distribution
        if (outcome > (isDeath ? 0.82 : isPowerplay ? 0.88 : 0.92)) {
          ballRuns = 6;
          striker.sixes++;
          if (over >= 15 || outcome > 0.96) {
            highlights.push(`💥 MONSTER SIX! Over ${over}.${b}: ${striker.name} smashes ${currentBowler.name} into the crowd!`);
          }
        } else if (outcome > (isPowerplay ? 0.68 : isDeath ? 0.70 : 0.76)) {
          ballRuns = 4;
          striker.fours++;
        } else if (outcome > 0.58) {
          ballRuns = 2;
        } else if (outcome > 0.28) {
          ballRuns = 1;
        } else {
          ballRuns = 0;
          currentBowler.dots++;
        }

        striker.runs += ballRuns;
        runs += ballRuns;
        overRuns += ballRuns;
        currentBowler.runsConceded += ballRuns;

        if (isPowerplay) powerplayRuns += ballRuns;
        else if (isDeath) deathRuns += ballRuns;
        else middleRuns += ballRuns;

        if (ballRuns % 2 === 1) {
          const tmp = strikerIdx;
          strikerIdx = nonStrikerIdx;
          nonStrikerIdx = tmp;
        }
      }
    }

    if (overRuns === 0) currentBowler.maidens++;

    const tmp = strikerIdx;
    strikerIdx = nonStrikerIdx;
    nonStrikerIdx = tmp;
  }

  batters.forEach(b => {
    b.strikeRate = b.balls > 0 ? parseFloat(((b.runs / b.balls) * 100).toFixed(1)) : 0;
  });

  bowlers.forEach(bw => {
    bw.economy = bw.overs > 0 ? parseFloat((bw.runsConceded / bw.overs).toFixed(2)) : 0;
  });

  const completedOvers = Math.floor(balls / 6);
  const remBalls = balls % 6;
  const oversStr = `${completedOvers}.${remBalls}`;

  return {
    totalRuns: runs,
    totalWickets: wickets,
    overs: oversStr,
    phases: {
      powerplay: `${powerplayRuns}/${powerplayWkts} (6.0 ov)`,
      middle: `${middleRuns}/${middleWkts} (9.0 ov)`,
      death: `${deathRuns}/${deathWkts} (${completedOvers >= 16 ? completedOvers - 15 : 0} ov)`
    },
    fallOfWickets,
    batters: batters.filter(b => b.balls > 0 || b.dismissal !== 'not out'),
    bowlers,
    highlights
  };
}

module.exports = {
  simulateT20Match
};
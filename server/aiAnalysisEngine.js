function analyzeSquad(team, rules = {}) {
  const squad = team.squad || [];
  const minSquad = rules.minSquad || 11;
  const maxOverseas = rules.maxOverseas || 8;

  const batters = squad.filter(p => p.category === 'Batter');
  const bowlers = squad.filter(p => p.category === 'Bowler');
  const allRounders = squad.filter(p => p.category === 'All-Rounder');
  const wicketkeepers = squad.filter(p => p.category === 'Wicketkeeper');
  const overseas = squad.filter(p => p.isOverseas);

  const avgRating = squad.length > 0
    ? squad.reduce((acc, p) => acc + p.overallRating, 0) / squad.length
    : 0;

  const topBatters = [...batters, ...allRounders.filter(p => p.roleId === 'BAT_AR'), ...wicketkeepers]
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 6);

  const battingDepth = topBatters.length > 0
    ? Math.round(topBatters.reduce((acc, p) => acc + p.overallRating, 0) / topBatters.length)
    : 40;

  const topBowlers = [...bowlers, ...allRounders.filter(p => p.roleId === 'BOWL_AR')]
    .sort((a, b) => b.overallRating - a.overallRating)
    .slice(0, 5);

  const bowlingAttack = topBowlers.length > 0
    ? Math.round(topBowlers.reduce((acc, p) => acc + p.overallRating, 0) / topBowlers.length)
    : 35;

  const deathSpecialists = squad.filter(p => 
    p.traits?.some(t => t.toLowerCase().includes('death') || t.toLowerCase().includes('finisher') || t.toLowerCase().includes('yorker'))
  );
  const deathOvers = Math.min(99, Math.max(40, 55 + deathSpecialists.length * 10));

  const spinners = squad.filter(p => p.roleId === 'SPIN_LEG' || p.roleId === 'SPIN_OFF');
  const pacers = squad.filter(p => p.roleId === 'FAST' || p.roleId === 'SWING');
  let spinPaceBalance = 'Balanced';
  if (pacers.length >= 4 && spinners.length <= 1) spinPaceBalance = 'Pace Heavy';
  else if (spinners.length >= 3 && pacers.length <= 2) spinPaceBalance = 'Spin Heavy';

  let overallScore = Math.round(
    battingDepth * 0.35 +
    bowlingAttack * 0.35 +
    deathOvers * 0.15 +
    (avgRating * 0.15)
  );

  if (wicketkeepers.length === 0) overallScore = Math.max(30, overallScore - 12);
  if (bowlers.length + allRounders.length < 5) overallScore = Math.max(30, overallScore - 15);
  if (squad.length < minSquad) overallScore = Math.max(25, overallScore - (minSquad - squad.length) * 3);

  const playingXI = selectPlayingXI(squad);

  const strengths = [];
  const weaknesses = [];

  if (topBatters.length >= 5 && battingDepth >= 80) {
    strengths.push('🔥 Explosive batting depth with solid top-order firepower.');
  } else if (battingDepth < 65) {
    weaknesses.push('⚠️ Fragile batting lineup; prone to middle-order collapses.');
  }

  if (bowlers.length >= 4 && bowlingAttack >= 78) {
    strengths.push('🎯 Lethal bowling lineup with genuine wicket-taking pedigree.');
  } else if (bowlingAttack < 65) {
    weaknesses.push('⚠️ Underwhelming bowling attack; risk conceding high totals.');
  }

  if (wicketkeepers.length >= 1) {
    strengths.push(`🧤 Solid gloveman presence with ${wicketkeepers[0].name}.`);
  } else {
    weaknesses.push('🚨 Critical flaw: No recognized Wicketkeeper in squad!');
  }

  if (allRounders.length >= 2) {
    strengths.push('⚡ Superb flexibility with multiple multi-dimensional all-rounders.');
  }

  if (deathSpecialists.length >= 2) {
    strengths.push('🧊 Proven ice-cool clutch finishers and death-overs yorker specialists.');
  }

  if (strengths.length === 0) strengths.push('⭐ Balanced domestic core with room for tactical surprises.');
  if (weaknesses.length === 0) weaknesses.push('✅ No glaring tactical weaknesses detected in squad construction.');

  const roasts = [
    `${team.name} ki bowling dekh kar opposition ke batsmen ne helmet utaar diya hai!`,
    `Middle order me itna gap hai ki poori local train nikal jaaye!`,
    `Aisa lagta hai saare paise 2 players pe khatam kardiye aur baaki lottery se uthaye hain!`,
    `Ye team 200 chase karegi ya 120 pe all out hogi, koi guarantee nahi!`,
    `Inka batting order dekh kar lagta hai toss jeet ke pehle bowling hi leni padegi!`
  ];

  const praises = [
    `Unbelievable masterclass in auction strategy! Proper championship-winning balance.`,
    `Inki batting dekh kar opposition bowlers ko pehle hi nightmares aane lagenge!`,
    `World-class death bowling aur deadly top-order — trophy ke direct contender!`,
    `Har player apne role me fit baithta hai. Calculated and clinical squad!`,
    `Ye team 220+ ka target bhi hasste-hasste chase karne ka dum rakhti hai!`
  ];

  const roast = overallScore < 75 ? roasts[Math.floor(Math.random() * roasts.length)] : roasts[0];
  const praise = overallScore >= 75 ? praises[Math.floor(Math.random() * praises.length)] : praises[0];

  const sortedSquad = [...squad].sort((a, b) => b.overallRating - a.overallRating);
  const mvp = sortedSquad[0] || null;
  const winProbability = Math.min(88, Math.max(12, Math.round(overallScore * 0.75 + (squad.length >= 11 ? 15 : 0))));

  return {
    teamName: team.name,
    overallScore,
    battingDepth,
    bowlingAttack,
    deathOvers,
    spinPaceBalance,
    playingXI,
    strengths,
    weaknesses,
    roast,
    praise,
    winProbability,
    mvp
  };
}

function selectPlayingXI(squad) {
  if (squad.length < 11) return squad;

  const xi = [];
  let overseasCount = 0;

  const tryAdd = (player) => {
    if (!player) return false;
    if (xi.some(p => (player.id && p.id === player.id) || p.name === player.name)) return false;
    if (player.isOverseas && overseasCount >= 4) return false;
    xi.push(player);
    if (player.isOverseas) overseasCount++;
    return true;
  };

  // Structured Batting Order Construction:
  // 1 & 2: Top-Order Batters / Openers
  const openers = squad.filter(p => p.roleId === 'BAT' || p.category === 'Batter').sort((a, b) => b.overallRating - a.overallRating);
  for (const op of openers) {
    if (xi.length >= 2) break;
    tryAdd(op);
  }

  // 3 & 4: Top-order Anchors / Wicketkeepers
  const topOrder = squad.filter(p => p.roleId === 'ANCHOR' || p.category === 'Wicketkeeper' || p.category === 'Batter').sort((a, b) => b.overallRating - a.overallRating);
  for (const t of topOrder) {
    if (xi.length >= 4) break;
    tryAdd(t);
  }

  // Ensure at least 1 Wicketkeeper in top 6
  if (!xi.some(p => p.category === 'Wicketkeeper')) {
    const wk = squad.find(p => p.category === 'Wicketkeeper');
    if (wk) tryAdd(wk);
  }

  // 5 & 6: Middle Order & Power Finishers
  const middle = squad.filter(p => p.roleId === 'FINISHER' || p.category === 'All-Rounder' || p.category === 'Batter').sort((a, b) => b.overallRating - a.overallRating);
  for (const m of middle) {
    if (xi.length >= 6) break;
    tryAdd(m);
  }

  // 7 & 8: All-Rounders
  const allRounders = squad.filter(p => p.category === 'All-Rounder').sort((a, b) => b.overallRating - a.overallRating);
  for (const ar of allRounders) {
    if (xi.length >= 8) break;
    tryAdd(ar);
  }

  // 9, 10, 11: Specialist Bowlers (Tailenders)
  const specialistBowlers = squad.filter(p => p.category === 'Bowler').sort((a, b) => b.overallRating - a.overallRating);
  for (const bw of specialistBowlers) {
    if (xi.length >= 11) break;
    tryAdd(bw);
  }

  // Fill remaining slots if any
  const remaining = [...squad].sort((a, b) => b.overallRating - a.overallRating);
  for (const r of remaining) {
    if (xi.length >= 11) break;
    tryAdd(r);
  }

  return xi;
}

module.exports = {
  analyzeSquad,
  selectPlayingXI
};
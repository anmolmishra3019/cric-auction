const { v4: uuidv4 } = require('uuid');
const REAL_PLAYERS = require('./realPlayersData');

const COUNTRIES = [
  { name: 'India', flag: '🇮🇳', isOverseas: false },
  { name: 'Australia', flag: '🇦🇺', isOverseas: true },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', isOverseas: true },
  { name: 'South Africa', flag: '🇿🇦', isOverseas: true },
  { name: 'West Indies', flag: '🌴', isOverseas: true },
  { name: 'New Zealand', flag: '🇳🇿', isOverseas: true },
  { name: 'Afghanistan', flag: '🇦🇫', isOverseas: true },
  { name: 'Sri Lanka', flag: '🇱🇰', isOverseas: true },
  { name: 'Pakistan', flag: '🇵🇰', isOverseas: true },
  { name: 'Bangladesh', flag: '🇧🇩', isOverseas: true }
];

const EXTRA_NAMES = {
  India: ['Devdutt Padikkal', 'Prabhsimran Singh', 'Jitesh Sharma', 'Shahrukh Khan', 'Suyash Sharma', 'Yash Dayal', 'Vaibhav Arora', 'Tanush Kotian', 'Sameer Rizvi', 'Kumar Kushagra', 'Rasikh Salam', 'Manav Suthar', 'Abishek Porel', 'Angkrish Raghuvanshi', 'Ramandeep Singh', 'Anukul Roy', 'Vijay Shankar', 'Jayant Yadav', 'Sandeep Sharma', 'Mohit Sharma', 'Piyush Chawla', 'Karn Sharma', 'Mayank Agarwal', 'Manish Pandey', 'Karun Nair', 'Chetan Sakariya', 'Navdeep Saini', 'Shivam Mavi', 'Kamlesh Nagarkoti', 'Kartik Tyagi', 'Prithvi Shaw', 'Deepak Chahar', 'Shardul Thakur', 'T Natarajan'],
  Australia: ['Sean Abbott', 'Jhye Richardson', 'Riley Meredith', 'Jason Behrendorff', 'Nathan Ellis', 'Ben Dwarshuis', 'Aaron Hardie', 'Lance Morris', 'Matthew Short', 'Josh Inglis', 'Ashton Turner', 'Daniel Sams', 'Moises Henriques', 'Ashton Agar'],
  England: ['Reece Topley', 'Gus Atkinson', 'Brydon Carse', 'Olly Stone', 'Luke Wood', 'Richard Gleeson', 'Tom Curran', 'David Willey', 'Will Jacks', 'Jacob Bethell', 'Dan Mousley', 'Jordan Cox', 'Jamie Smith'],
  'South Africa': ['Nandre Burger', 'Gerald Coetzee', 'Lungi Ngidi', 'Tabraiz Shamsi', 'Keshav Maharaj', 'Wiaan Mulder', 'Dewald Brevis', 'Ryan Rickelton', 'Corbin Bosch', 'Rassie van der Dussen', 'Ottneil Baartman', 'Donovan Ferreira'],
  'West Indies': ['Alzarri Joseph', 'Akeal Hosein', 'Romario Shepherd', 'Gudakesh Motie', 'Sherfane Rutherford', 'Shamar Joseph', 'Kyle Mayers', 'Brandon King', 'Fabian Allen', 'Oshane Thomas', 'Obed McCoy', 'Johnson Charles'],
  'New Zealand': ['Ish Sodhi', 'Matt Henry', 'Michael Bracewell', 'Ajaz Patel', 'Adam Milne', 'Tim Seifert', 'Finn Allen', 'Mark Chapman', 'Glenn Phillips', 'Ben Sears', 'William O Rourke'],
  Afghanistan: ['Mohammad Nabi', 'Mujeeb Ur Rahman', 'Naveen-ul-Haq', 'Gulbadin Naib', 'Ibrahim Zadran', 'Najibullah Zadran', 'Azmatullah Omarzai', 'Sediqullah Atal', 'Karim Janat'],
  'Sri Lanka': ['Nuwan Thushara', 'Dushmantha Chameera', 'Dunith Wellalage', 'Charith Asalanka', 'Kusal Mendis', 'Pathum Nissanka', 'Dasun Shanaka', 'Dilshan Madushanka', 'Kamindu Mendis'],
  Pakistan: ['Fakhar Zaman', 'Iftikhar Ahmed', 'Aamer Jamal', 'Saim Ayub', 'Usman Khan', 'Abbas Afridi', 'Shadab Khan', 'Haris Rauf', 'Imad Wasim', 'Mohammad Amir'],
  Bangladesh: ['Shakib Al Hasan', 'Taskin Ahmed', 'Litton Das', 'Towhid Hridoy', 'Mehidy Hasan Miraz', 'Shoriful Islam', 'Tanzim Hasan Sakib', 'Rishad Hossain', 'Najmul Hossain Shanto']
};

const ROLES = [
  { id: 'BAT', name: 'Top-Order Batsman', type: 'Batter', color: 'text-amber-400', icon: '🏏' },
  { id: 'ANCHOR', name: 'Middle-Order Anchor', type: 'Batter', color: 'text-amber-300', icon: '🏏' },
  { id: 'FINISHER', name: 'Power Finisher', type: 'Batter', color: 'text-orange-500', icon: '💥' },
  { id: 'WK', name: 'Wicketkeeper Batsman', type: 'Wicketkeeper', color: 'text-blue-400', icon: '🧤' },
  { id: 'BAT_AR', name: 'Batting All-Rounder', type: 'All-Rounder', color: 'text-emerald-400', icon: '⚡' },
  { id: 'BOWL_AR', name: 'Bowling All-Rounder', type: 'All-Rounder', color: 'text-teal-400', icon: '⚡' },
  { id: 'FAST', name: 'Express Fast Bowler', type: 'Bowler', color: 'text-red-400', icon: '🚀' },
  { id: 'SWING', name: 'Swing Fast Bowler', type: 'Bowler', color: 'text-rose-400', icon: '🎯' },
  { id: 'SPIN_LEG', name: 'Leg Spinner', type: 'Bowler', color: 'text-purple-400', icon: '🌀' },
  { id: 'SPIN_OFF', name: 'Off Spinner / Mystery', type: 'Bowler', color: 'text-indigo-400', icon: '🔮' }
];

const TIERS = [
  { name: 'Iconic Superstar', minRating: 95, maxRating: 99, basePrices: [20000000] },
  { name: 'Marquee International', minRating: 92, maxRating: 95, basePrices: [15000000, 20000000] },
  { name: 'Established Pro', minRating: 88, maxRating: 92, basePrices: [10000000, 15000000] },
  { name: 'Rising Star / Uncapped', minRating: 82, maxRating: 89, basePrices: [3000000, 5000000] }
];

function generatePlayer(options = {}) {
  const countryObj = options.country 
    ? COUNTRIES.find(c => c.name.toLowerCase() === options.country.toLowerCase()) || COUNTRIES[0]
    : (Math.random() < 0.6 ? COUNTRIES[0] : COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]);

  const role = options.role 
    ? (ROLES.find(r => r.id === options.role || r.name === options.role) || ROLES[0])
    : ROLES[Math.floor(Math.random() * ROLES.length)];

  const rating = options.rating || Math.floor(Math.random() * 12) + 82;
  
  let name = options.name;
  if (!name) {
    const list = EXTRA_NAMES[countryObj.name] || EXTRA_NAMES.India;
    name = list[Math.floor(Math.random() * list.length)];
  }

  return {
    id: uuidv4(),
    name,
    country: countryObj.name,
    flag: countryObj.flag,
    isOverseas: countryObj.isOverseas,
    role: role.name,
    category: role.type,
    roleId: role.id,
    roleIcon: role.icon,
    roleColor: role.color,
    tier: rating >= 95 ? 'Iconic Superstar' : rating >= 92 ? 'Marquee International' : rating >= 88 ? 'Established Pro' : 'Rising Star / Uncapped',
    overallRating: rating,
    basePrice: options.basePrice || (rating >= 95 ? 20000000 : rating >= 92 ? 15000000 : rating >= 88 ? 10000000 : 3000000),
    stats: {
      battingAverage: parseFloat((role.type === 'Batter' || role.type === 'Wicketkeeper' ? (rating * 0.36 + Math.random() * 6) : (10 + Math.random() * 10)).toFixed(1)),
      strikeRate: parseFloat((role.type === 'Batter' || role.type === 'Wicketkeeper' ? (rating * 1.35 + Math.random() * 25) : (80 + Math.random() * 40)).toFixed(1)),
      bowlingEconomy: parseFloat((role.type === 'Bowler' || role.type === 'All-Rounder' ? (12.0 - rating * 0.05 + (Math.random() * 0.8 - 0.4)) : 0).toFixed(2)),
      wicketsPerMatch: parseFloat((role.type === 'Bowler' ? (rating * 0.015 + Math.random() * 0.4) : (role.type === 'All-Rounder' ? 0.6 : 0)).toFixed(1)),
      fieldingRating: Math.floor(Math.random() * 15) + 80,
      clutchRating: rating,
      matchesPlayed: Math.floor(Math.random() * 80) + 20
    },
    traits: ['IPL Pro', 'Matchwinner'],
    age: Math.floor(Math.random() * 12) + 22
  };
}

function generateInitialPool(targetCount = 130) {
  const pool = REAL_PLAYERS.map(p => ({
    ...p,
    id: uuidv4()
  }));

  const usedNames = new Set(pool.map(p => p.name));

  for (const [countryName, namesList] of Object.entries(EXTRA_NAMES)) {
    const countryObj = COUNTRIES.find(c => c.name === countryName) || COUNTRIES[0];
    for (const pName of namesList) {
      if (pool.length >= targetCount) break;
      if (!usedNames.has(pName)) {
        usedNames.add(pName);
        pool.push(generatePlayer({ name: pName, country: countryObj.name }));
      }
    }
  }

  while (pool.length < targetCount) {
    pool.push(generatePlayer());
  }

  return pool.sort((a, b) => b.overallRating - a.overallRating + (Math.random() * 8 - 4));
}

module.exports = {
  REAL_PLAYERS,
  COUNTRIES,
  ROLES,
  TIERS,
  generatePlayer,
  generateInitialPool
};
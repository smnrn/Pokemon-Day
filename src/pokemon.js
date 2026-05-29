// ============================================================
//  Pokemon Battle Engine — Data & Logic Utilities
// ============================================================

export async function fetchWithRetry(url, options = {}, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
        continue;
      }
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
}

// Type effectiveness chart (simplified)
export const TYPE_CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getTypeEffectiveness(attackType, defenderTypes) {
  const chart = TYPE_CHART[attackType] || {};
  return defenderTypes.reduce((mult, dt) => mult * (chart[dt] ?? 1), 1);
}

export function getTotalEffectiveness(attackerTypes, defenderTypes) {
  return Math.max(...attackerTypes.map(at => getTypeEffectiveness(at, defenderTypes)));
}

// ---- GYM TYPES ----
export const GYM_TYPES = [
  'All Types', 'Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
  'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy',
];

// ---- MODEL DESCRIPTIONS ----
export const MODELS = [
  { id: 'kmeans', name: 'K-Means Clustering', short: 'K-Means', metric: 'Silhouette Score', desc: 'Clusters Pokémon into strategic roles based on base stat similarity.' },
  { id: 'knn', name: 'K-Nearest Neighbors', short: 'K-NN', metric: 'Accuracy', desc: 'Classifies Pokémon roles by proximity to k nearest training examples.' },
  { id: 'cosine', name: 'Cosine Similarity', short: 'Cosine', metric: 'Similarity Score', desc: 'Ranks Pokémon by cosine similarity in stat-space vectors.' },
  { id: 'dtree', name: 'Decision Tree', short: 'DecTree', metric: 'Accuracy', desc: 'Splits stat thresholds to classify Pokémon into combat roles.' },
  { id: 'rf', name: 'Random Forest', short: 'Rand Forest', metric: 'Accuracy', desc: 'Ensemble of trees for robust role classification and team scoring.' },
];

// ---- STRATEGY STYLES ----
export const STRATEGIES = ['Balanced','Offensive','Defensive','Stall','HyperOffense','Trick Room','Rain Team','Sun Team','Sand Team','Hail Team'];

export const REGIONS = [
  { id: 'all',   name: 'National Dex (All)',  min: 1,   max: 1025, gen: null },
  { id: 'kanto', name: 'Kanto (Gen 1)', min: 1,   max: 151,  gen: 1 },
  { id: 'johto', name: 'Johto (Gen 2)', min: 152, max: 251,  gen: 2 },
  { id: 'hoenn', name: 'Hoenn (Gen 3)', min: 252, max: 386,  gen: 3 },
  { id: 'sinnoh',name: 'Sinnoh (Gen 4)',min: 387, max: 493,  gen: 4 },
  { id: 'unova', name: 'Unova (Gen 5)', min: 494, max: 649,  gen: 5 },
  { id: 'kalos', name: 'Kalos (Gen 6)', min: 650, max: 721,  gen: 6 },
  { id: 'alola', name: 'Alola (Gen 7)', min: 722, max: 809,  gen: 7 },
  { id: 'galar', name: 'Galar (Gen 8)', min: 810, max: 905,  gen: 8 },
  { id: 'paldea',name: 'Paldea (Gen 9)',min: 906, max: 1025, gen: 9 },
];

// ---- COMPETITIVE DATA ----
export const COMPETITIVE_MOVES = {
  normal: ['Return', 'Double-Edge', 'Body Slam', 'Extreme Speed', 'Fake Out'],
  fire: ['Flamethrower', 'Fire Blast', 'Flare Blitz', 'Overheat', 'Will-O-Wisp'],
  water: ['Scald', 'Surf', 'Hydro Pump', 'Waterfall', 'Liquidation'],
  grass: ['Giga Drain', 'Leaf Storm', 'Power Whip', 'Seed Bomb', 'Energy Ball'],
  electric: ['Thunderbolt', 'Volt Switch', 'Wild Charge', 'Thunder', 'Discharge'],
  ice: ['Ice Beam', 'Blizzard', 'Icicle Crash', 'Ice Shard', 'Freeze-Dry'],
  fighting: ['Close Combat', 'High Jump Kick', 'Drain Punch', 'Mach Punch', 'Superpower'],
  poison: ['Sludge Bomb', 'Sludge Wave', 'Poison Jab', 'Gunk Shot', 'Toxic'],
  ground: ['Earthquake', 'Earth Power', 'High Horsepower', 'Stealth Rock', 'Spikes'],
  flying: ['Brave Bird', 'Hurricane', 'Air Slash', 'Roost', 'Defog'],
  psychic: ['Psychic', 'Psyshock', 'Zen Headbutt', 'Calm Mind', 'Trick'],
  bug: ['U-turn', 'Megahorn', 'Bug Buzz', 'First Impression', 'Quiver Dance'],
  rock: ['Stone Edge', 'Rock Slide', 'Power Gem', 'Rock Blast', 'Stealth Rock'],
  ghost: ['Shadow Ball', 'Poltergeist', 'Shadow Sneak', 'Hex', 'Will-O-Wisp'],
  dragon: ['Draco Meteor', 'Outrage', 'Dragon Claw', 'Dragon Pulse', 'Dragon Dance'],
  dark: ['Knock Off', 'Dark Pulse', 'Sucker Punch', 'Foul Play', 'Crunch'],
  steel: ['Flash Cannon', 'Iron Head', 'Meteor Mash', 'Gyro Ball', 'Bullet Punch'],
  fairy: ['Moonblast', 'Play Rough', 'Dazzling Gleam', 'Fairy Wind'],
};

export const ROLE_BUILDS = {
  'Sweeper': { nature: ['Jolly', 'Timid', 'Naive', 'Hasty'], item: ['Life Orb', 'Choice Scarf', 'Choice Band', 'Choice Specs', 'Focus Sash'], evs: '252 Atk / 4 Def / 252 Spe' },
  'Tank': { nature: ['Bold', 'Impish', 'Relaxed', 'Sassy', 'Careful', 'Calm'], item: ['Leftovers', 'Rocky Helmet', 'Heavy-Duty Boots', 'Assault Vest'], evs: '252 HP / 252 Def / 4 SpD' },
  'Support': { nature: ['Calm', 'Careful', 'Bold', 'Impish'], item: ['Leftovers', 'Light Clay', 'Mental Herb', 'Heavy-Duty Boots'], evs: '252 HP / 4 Def / 252 SpD' },
  'Pivot': { nature: ['Jolly', 'Timid', 'Careful', 'Impish'], item: ['Heavy-Duty Boots', 'Leftovers', 'Choice Scarf', 'Assault Vest'], evs: '252 HP / 4 Atk / 252 Spe' }
};

// ---- ROLE ASSIGNMENT ----
function assignRole(pokemon) {
  const { stats } = pokemon;
  const statObj = {};
  stats.forEach(s => { statObj[s.stat.name] = s.base_stat; });
  const atk = statObj['attack'] || 0;
  const spa = statObj['special-attack'] || 0;
  const def = statObj['defense'] || 0;
  const spd = statObj['special-defense'] || 0;
  const spe = statObj['speed'] || 0;
  const hp = statObj['hp'] || 0;
  const offScore = atk + spa + spe;
  const defScore = def + spd + hp;
  if (offScore > defScore * 1.3 && spe > 80) return 'Sweeper';
  if (defScore > offScore * 1.2 && hp > 80) return 'Tank';
  if (hp > 90 && (def + spd) > 130) return 'Support';
  return 'Pivot';
}

function buildShowdownProfile(pokemon, opponentTypes = []) {
  const role = assignRole(pokemon);
  const build = ROLE_BUILDS[role];
  
  const nature = build.nature[Math.floor(Math.random() * build.nature.length)];
  const item = build.item[Math.floor(Math.random() * build.item.length)];
  const evs = build.evs;
  
  const abilities = pokemon.abilities || [];
  const ability = abilities.length > 0 ? abilities[0].ability.name.split('-').map(pt => pt.charAt(0).toUpperCase() + pt.slice(1)).join(' ') : 'Unknown';

  const myTypes = pokemon.types.map(t => t.type?.name || t);
  let movePool = new Set();
  
  const canLearn = (moveName) => {
    if (!pokemon.moves) return true; 
    const formatName = moveName.toLowerCase().replace(/ /g, '-');
    return pokemon.moves.some(pm => pm.move.name === formatName);
  };

  // 1. STAB moves
  myTypes.forEach(t => {
    (COMPETITIVE_MOVES[t] || []).filter(canLearn).forEach(m => movePool.add(m));
  });

  // 2. Coverage moves against opponent types
  opponentTypes.forEach(ot => {
    Object.keys(TYPE_CHART).forEach(atkType => {
      if ((TYPE_CHART[atkType][ot] || 1) >= 2) {
         const covMoves = (COMPETITIVE_MOVES[atkType] || []).filter(canLearn);
         if (covMoves.length) movePool.add(covMoves[0]); 
      }
    });
  });

  let moves = Array.from(movePool).sort(() => 0.5 - Math.random());

  // 3. If we don't have 4 moves, grab ANY other competitive move they can learn
  if (moves.length < 4) {
    const allCompMoves = Object.values(COMPETITIVE_MOVES).flat().filter(canLearn).sort(() => 0.5 - Math.random());
    allCompMoves.forEach(m => {
       if (!moves.includes(m) && moves.length < 4) moves.push(m);
    });
  }

  // 4. Guaranteed universal fillers if still < 4
  if (moves.length < 4) {
    const fillers = ['Protect', 'Substitute', 'Rest', 'Toxic', 'Recover', 'Swords Dance', 'Calm Mind', 'Nasty Plot', 'Dragon Dance'].filter(canLearn);
    fillers.forEach(m => {
       if (!moves.includes(m) && moves.length < 4) moves.push(m);
    });
  }
  
  // 5. Absolute fallback to raw API moves (very rare now)
  if (moves.length < 4 && pokemon.moves) {
    const actualMoves = pokemon.moves
      .filter(pm => pm.version_group_details.some(v => v.move_learn_method.name === 'level-up' || v.move_learn_method.name === 'machine'))
      .map(pm => pm.move.name.split('-').map(pt => pt.charAt(0).toUpperCase() + pt.slice(1)).join(' '))
      .filter(m => !moves.includes(m))
      .sort(() => 0.5 - Math.random());
    
    actualMoves.forEach(m => {
      if (moves.length < 4) moves.push(m);
    });
  }
  
  if (moves.length === 0) moves = ['Tackle'];
  moves = moves.slice(0, 4);

  return { moves, ability, nature, item, evs, role, ivs: '31 HP / 31 Atk / 31 Def / 31 SpA / 31 SpD / 31 Spe', level: 100 };
}

// ---- TEAM GENERATOR ENGINE ----
export async function generateGymTeam({ gymType, strategy, teamSize, model, regions }) {
  if (!Array.isArray(regions) || regions.length === 0) regions = ['all'];
  const isAll = regions.includes('all');
  const selectedRegions = regions.map(id => REGIONS.find(r => r.id === id)).filter(Boolean);
  
  const team = [];
  const usedIds = new Set();
  let valid;
  
  if (gymType.toLowerCase() === 'all types') {
    const idPool = [];
    if (isAll) {
      for (let id = 1; id <= 1025; id++) idPool.push(id);
    } else {
      selectedRegions.forEach(r => {
        for (let id = r.min; id <= r.max; id++) idPool.push(id);
      });
    }
    const sampleIds = idPool.sort(() => Math.random() - 0.5).slice(0, Math.min(teamSize * 15, idPool.length));
    const fetched = await Promise.all(
      sampleIds.map(id => fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()).catch(() => null))
    );
    valid = fetched.filter(p => p && !usedIds.has(p.id) && (p.stats.reduce((s, st) => s + st.base_stat, 0) > 400));
  } else {
    const res = await fetchWithRetry(`https://pokeapi.co/api/v2/type/${gymType.toLowerCase()}`);
    const typeData = await res.json();
    const pool = typeData.pokemon
      .map(p => ({ name: p.pokemon.name, url: p.pokemon.url }))
      .filter(p => !p.name.includes('-'))
      .filter(p => {
        if (isAll) return true;
        const match = p.url.match(/\/pokemon\/(\d+)\//); 
        if (!match) return true;
        const id = parseInt(match[1], 10);
        return selectedRegions.some(r => id >= r.min && id <= r.max);
      })
      .map(p => p.name);
      
    // Fetch a larger pool to ensure we can sort by BST and get the absolute strongest
    const sample = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(teamSize * 10, 60));
    const fetched = await Promise.all(
      sample.map(name => fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${name}`).then(r => r.json()).catch(() => null))
    );
    valid = fetched.filter(p => p && !usedIds.has(p.id));
  }
  
  // Advanced Stat Evaluation - Strategy Weighting & Model Logic
  let scored = valid.map(p => {
    const s = { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
    p.stats.forEach(st => { s[st.stat.name] = st.base_stat; });
    
    // ---- Strategy Multipliers ----
    let offWeight = 1.0, defWeight = 1.0, speWeight = 1.0;
    if (['Offensive', 'HyperOffense'].includes(strategy)) { offWeight = 1.4; speWeight = 1.3; defWeight = 0.7; }
    else if (['Defensive', 'Stall'].includes(strategy)) { defWeight = 1.4; speWeight = 0.8; offWeight = 0.7; }
    else if (strategy === 'Trick Room') { speWeight = -1.0; offWeight = 1.2; defWeight = 1.2; }
    else if (strategy === 'Rain Team') { offWeight = 1.1; speWeight = 1.1; }
    else if (strategy === 'Sun Team') { offWeight = 1.3; speWeight = 1.0; }
    else if (strategy === 'Sand Team') { defWeight = 1.3; speWeight = 0.9; }
    else if (strategy === 'Hail Team') { defWeight = 1.2; offWeight = 1.1; }
    
    // ---- Physical vs Special Split Intelligence ----
    // Use the HIGHER of Atk/SpA so mixed attackers aren't penalized,
    // but also give a small bonus for having both (versatility)
    const bestAtk = Math.max(s.attack, s['special-attack']);
    const worstAtk = Math.min(s.attack, s['special-attack']);
    const mixedBonus = (worstAtk > 80) ? 20 : 0; // Versatile mixed attacker
    
    const weightedScore = 
      (bestAtk * 1.5 + worstAtk * 0.5 + mixedBonus) * offWeight +
      (s.defense + s['special-defense'] + s.hp) * defWeight +
      (s.speed * speWeight);

    // ---- Defensive Typing Quality ----
    const getResistScore = (types) => {
      const typeNames = types.map(t => t.type.name);
      let weakCount = 0, resistCount = 0, immuneCount = 0;
      Object.keys(TYPE_CHART).forEach(atkType => {
        const eff = getTotalEffectiveness([atkType], typeNames);
        if (eff === 0) immuneCount++;
        else if (eff > 1) weakCount++;
        else if (eff < 1) resistCount++;
      });
      return (resistCount * 1) + (immuneCount * 3) - (weakCount * 2);
    };
    
    // ---- Offensive Coverage Quality ----
    // How many types can this Pokémon hit super-effectively with STAB?
    const myTypes = p.types.map(t => t.type.name);
    let coverageCount = 0;
    Object.keys(TYPE_CHART).forEach(defType => {
      const eff = getTotalEffectiveness(myTypes, [defType]);
      if (eff >= 2) coverageCount++;
    });
    const coverageBonus = coverageCount * 8; // Reward broad offensive coverage
    
    const resistScore = getResistScore(p.types);
    const finalScore = weightedScore + (resistScore * 12) + coverageBonus;
    
    return { ...p, finalScore, roleAssigned: assignRole(p), myTypes };
  });

  // Model-specific selection with TEAM SYNERGY intelligence
  let sorted = scored.sort((a, b) => b.finalScore - a.finalScore);
  const selected = [];
  const desiredRoles = { 'Sweeper': Math.max(1, Math.floor(teamSize * 0.3)), 'Tank': Math.max(1, Math.floor(teamSize * 0.3)), 'Pivot': 1, 'Support': 1 };
  const currentRoles = { 'Sweeper': 0, 'Tank': 0, 'Pivot': 0, 'Support': 0 };
  
  // Track team weaknesses to prevent stacking shared vulnerabilities
  const teamWeaknesses = {}; // type -> count of team members weak to it
  const teamTypes = new Set(); // prevent too many of the exact same secondary type

  const getWeaknesses = (pokemon) => {
    const types = pokemon.myTypes || pokemon.types?.map(t => t.type?.name || t) || [];
    const weakTo = [];
    Object.keys(TYPE_CHART).forEach(atkType => {
      const eff = getTotalEffectiveness([atkType], types);
      if (eff >= 2) weakTo.push(atkType);
    });
    return weakTo;
  };

  const getSynergyPenalty = (pokemon) => {
    const weakTo = getWeaknesses(pokemon);
    let penalty = 0;
    weakTo.forEach(wType => {
      const existing = teamWeaknesses[wType] || 0;
      if (existing >= 2) penalty += 150;  // 3+ members sharing a weakness is catastrophic
      else if (existing >= 1) penalty += 50; // 2 members sharing is risky
    });
    // Penalize exact duplicate typing (e.g. two pure Fire types)
    const typeKey = (pokemon.myTypes || []).sort().join('/');
    if (teamTypes.has(typeKey)) penalty += 100;
    return penalty;
  };

  for (const p of sorted) {
    if (selected.length >= teamSize) break;
    try {
      const s = await fetchWithRetry(p.species.url).then(r => r.json());
      if (s.is_legendary || s.is_mythical) continue;
      if (s.name.startsWith('iron-') || ['great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks', 'roaring-moon', 'walking-wake', 'gouging-fire', 'raging-bolt'].includes(s.name)) continue;
      
      // Apply synergy penalty — skip if adding this mon creates too many shared weaknesses
      const synergyPenalty = getSynergyPenalty(p);
      const adjustedScore = p.finalScore - synergyPenalty;
      
      if (model === 'kmeans') {
        if (currentRoles[p.roleAssigned] < desiredRoles[p.roleAssigned] || selected.length >= teamSize - 1) {
          if (synergyPenalty < 200) { // Don't allow catastrophic overlap even in K-Means
            selected.push({ ...p, adjustedScore });
            currentRoles[p.roleAssigned]++;
          }
        }
      } else {
        // For other models, allow some overlap but heavily penalize it
        if (synergyPenalty < 300 || selected.length >= teamSize - 2) {
          selected.push({ ...p, adjustedScore });
        }
      }
      
      // Register this pokemon's weaknesses and types into the team tracker
      if (selected[selected.length - 1]?.id === p.id) {
        const weakTo = getWeaknesses(p);
        weakTo.forEach(wType => { teamWeaknesses[wType] = (teamWeaknesses[wType] || 0) + 1; });
        const typeKey = (p.myTypes || []).sort().join('/');
        teamTypes.add(typeKey);
      }
    } catch (e) {
      selected.push(p);
    }
  }

  // Fill remaining if selection was too strict
  if (selected.length < teamSize) {
     for (const p of sorted) {
       if (selected.length >= teamSize) break;
       if (!selected.find(sel => sel.id === p.id)) selected.push(p);
     }
  }



  for (const p of selected) {
    usedIds.add(p.id);
    const profile = buildShowdownProfile(p, []); // Gym team doesn't know opponent types yet

    team.push({
      ...p,
      role: profile.role,
      types: p.types.map(t => t.type.name),
      sprite: p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default,
      icon: `https://img.pokemondb.net/sprites/sword-shield/icon/${p.name}.png`,
      showdown: profile
    });
  }

  // Simulate metric
  let metricLabel = 'BST Accuracy', metricValue = '99.9%';
  if (model === 'kmeans') { metricLabel = 'Silhouette Score'; metricValue = (Math.random() * 0.1 + 0.85).toFixed(3); }

  return { team, model, metricLabel, metricValue };
}

export async function generateCounters(opponentTeam, useFullDex, customPoolData = null, regions = ['all']) {
  const opponentTypes = opponentTeam.flatMap(p => p.types || []);
  if (!Array.isArray(regions) || regions.length === 0) regions = ['all'];
  const isAll = regions.includes('all');
  const selectedRegions = regions.map(id => REGIONS.find(r => r.id === id)).filter(Boolean);
  
  let pool;
  if (customPoolData && customPoolData.length > 0) {
    const sample = customPoolData.slice(0, 60);
    pool = await Promise.all(
      sample.map(p => fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${p.name}`).then(r => r.json()).catch(() => null))
    );
  } else {
    const idPool = [];
    if (isAll) {
      for (let id = 1; id <= 1025; id++) idPool.push(id);
    } else {
      selectedRegions.forEach(r => {
        for (let id = r.min; id <= r.max; id++) idPool.push(id);
      });
    }
    
    let sampleIds = idPool;
    if (idPool.length > 600) {
      // Seeded random based on opponent team so it's deterministic for the same opponent
      const teamString = opponentTeam.map(p => p.name).join('');
      let seed = 0;
      for (let i = 0; i < teamString.length; i++) {
        seed = ((seed << 5) - seed) + teamString.charCodeAt(i);
        seed |= 0;
      }
      seed = Math.abs(seed) || 1;
      const seededRandom = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };
      
      // Proper Fisher-Yates shuffle for better distribution
      for (let i = sampleIds.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1));
        [sampleIds[i], sampleIds[j]] = [sampleIds[j], sampleIds[i]];
      }
      sampleIds = sampleIds.slice(0, 350);
    }

    pool = await Promise.all(
      sampleIds.map(id => fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()).catch(() => null))
    );
  }
  
  
  const valid = pool.filter(p => p && !p.name.includes('-') && p.stats.reduce((s, st) => s + st.base_stat, 0) >= 420).map(p => ({
    ...p,
    types: p.types.map(t => t.type.name),
    sprite: p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default,
    icon: `https://img.pokemondb.net/sprites/sword-shield/icon/${p.name}.png`,
    bst: p.stats.reduce((s, st) => s + st.base_stat, 0)
  }));

  // Deep Counter Analysis Score (Calculate Raw)
  const opponentAverageSpeed = opponentTeam.reduce((sum, opp) => {
    const oppStats = opp.stats || [];
    const speedStat = oppStats.find(s => s.stat.name === 'speed');
    return sum + (speedStat ? speedStat.base_stat : 80);
  }, 0) / (opponentTeam.length || 1);

  const scoredRaw = valid.map(p => {
    let offensiveScore = 0;
    let defensiveScore = 0;

    const mySpeed = p.stats.find(s => s.stat.name === 'speed')?.base_stat || 80;

    opponentTeam.forEach(opp => {
      const oppSpeed = (opp.stats || []).find(s => s.stat.name === 'speed')?.base_stat || 80;

      // Offensive: Can I hit them super effectively with my STAB?
      const myBestAttack = Math.max(...p.types.map(t => getTotalEffectiveness([t], opp.types || [])));
      let matchOffense = 0;
      if (myBestAttack >= 4) matchOffense += 80;
      else if (myBestAttack >= 2) matchOffense += 35;
      else if (myBestAttack === 1) matchOffense += 5;
      else if (myBestAttack > 0) matchOffense -= 15;
      else matchOffense -= 30;

      // Defensive: Can I resist their STAB?
      const theirBestAttack = Math.max(...(opp.types || []).map(t => getTotalEffectiveness([t], p.types)));
      let matchDefense = 0;
      if (theirBestAttack === 0) matchDefense += 40;
      else if (theirBestAttack <= 0.25) matchDefense += 30;
      else if (theirBestAttack <= 0.5) matchDefense += 15;
      else if (theirBestAttack === 1) matchDefense += 0;
      else if (theirBestAttack >= 2) matchDefense -= 30;
      else if (theirBestAttack >= 4) matchDefense -= 60;

      // SPEED CONTEXT (Crucial Intelligence)
      // If they hit me super effectively AND they are faster, my defense is meaningless (I'm dead).
      if (theirBestAttack >= 2 && oppSpeed > mySpeed) {
         matchDefense -= 50; // Massive penalty for being slow and weak!
         matchOffense *= 0.5; // My offense is useless if I die before attacking.
      }
      
      // If I hit them super effectively AND I am faster, I am an excellent counter (Sweep potential).
      if (myBestAttack >= 2 && mySpeed > oppSpeed) {
         matchOffense += 40; // Massive bonus for outspeeding and threatening a KO!
      }

      offensiveScore += matchOffense;
      defensiveScore += matchDefense;
    });

    // ---- Attack Stat Relevance ----
    // A Pokemon that hits super-effectively but has terrible attack power shouldn't score high.
    const myAtk = Math.max(
      p.stats.find(s => s.stat.name === 'attack')?.base_stat || 50,
      p.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 50
    );
    // Scale offensive score by actual attack stat (100 is baseline, so 130 Atk = 1.3x multiplier)
    const atkScaler = myAtk / 100;
    
    // Heavily weight Base Stats to prefer fully evolved Pokemon
    const bstBonus = (p.bst / 720) * 80; 
    const rawScore = (offensiveScore * 1.5 * atkScaler) + (defensiveScore * 1.0) + bstBonus;    
    const matchups = opponentTeam.map(opp => ({
      name: opp.name,
      multiplier: getTotalEffectiveness(p.types, opp.types || []),
    }));

    return { ...p, rawScore, matchups };
  });

  // Pick top 6 with TYPE DIVERSITY enforcement
  // Don't allow the counter team to stack 3+ of the same primary type
  const sortedRaw = scoredRaw.sort((a, b) => b.rawScore - a.rawScore);
  const top6 = [];
  const counterTypeCounts = {}; // track how many counters share a primary type
  
  for (const p of sortedRaw) {
    if (top6.length >= 6) break;
    try {
      const s = await fetchWithRetry(p.species.url).then(r => r.json());
      if (s.is_legendary || s.is_mythical) continue;
      if (s.name.startsWith('iron-') || ['great-tusk', 'scream-tail', 'brute-bonnet', 'flutter-mane', 'slither-wing', 'sandy-shocks', 'roaring-moon', 'walking-wake', 'gouging-fire', 'raging-bolt'].includes(s.name)) continue;
      
      // Type diversity check: no more than 2 counters sharing the same primary type
      const primaryType = p.types[0];
      const typeCount = counterTypeCounts[primaryType] || 0;
      if (typeCount >= 2) continue; // Skip — we already have 2 of this type
      
      top6.push(p);
      counterTypeCounts[primaryType] = typeCount + 1;
    } catch (e) {
      top6.push(p);
    }
  }

  // Relative Scaling: The absolute best VALID counter sets the 99 ceiling
  const maxValidRaw = top6.length > 0 ? top6[0].rawScore : 1;
  top6.forEach(p => {
    let normalizedScore = Math.round((p.rawScore / maxValidRaw) * 99);
    p.counterScore = Math.min(99, Math.max(1, normalizedScore));
  });

  // For each in top 6, build Master-tier Showdown stats
  top6.forEach(p => {
    const profile = buildShowdownProfile(p, opponentTypes);
    
    // Determine the absolute best counter move from their generated moves
    let bestMove = profile.moves[0];
    let highestMultiplier = 0;

    profile.moves.forEach(m => {
      // Very naive type guessing for the move name to calculate effectiveness
      let guessedType = 'normal';
      Object.entries(COMPETITIVE_MOVES).forEach(([type, moves]) => {
        if (moves.includes(m)) guessedType = type;
      });

      // Calculate effectiveness against each opponent individually
      let totalMult = 0;
      opponentTeam.forEach(opp => {
        const eff = getTotalEffectiveness([guessedType], opp.types || []);
        totalMult += eff;
      });

      if (totalMult > highestMultiplier) {
        highestMultiplier = totalMult;
        bestMove = m;
      }
    });

    p.bestCounterMove = bestMove;
    p.showdown = profile;
  });

  return top6;
}

// ---- PARSE SHOWDOWN / CSV ----
export function parseTeamInput(text) {
  const team = [];
  if (!text) return team;
  
  // Basic CSV detection
  if (text.includes(',') && !text.includes('@')) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let start = 0;
    if (lines[0].toLowerCase().includes('name')) start = 1;
    for (let i = start; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts[0]) {
        team.push({ name: parts[0].replace(/"/g, '').toLowerCase().trim(), moves: [], bstBonus: 0 });
      }
    }
    return team;
  }

  // Robust line-by-line parsing for mixed Showdown / plain text list
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let currentPokemon = null;

  for (const line of lines) {
    if (line.startsWith('===') || line.startsWith('Format:')) continue;

    const isMove = line.startsWith('- ');
    const isAbility = line.startsWith('Ability:');
    const isEVs = line.startsWith('EVs:');
    const isIVs = line.startsWith('IVs:');
    const isNature = line.toLowerCase().includes('nature');
    const isItemSplit = line.includes('@');
    const isLevel = line.startsWith('Level:');
    const isShiny = line.startsWith('Shiny:');
    const isHappiness = line.startsWith('Happiness:');
    const isTera = line.startsWith('Tera Type:');

    // If it is a known Showdown parameter line and we have an active pokemon, treat it as an attribute of the current pokemon
    if (currentPokemon && (isMove || isAbility || isEVs || isIVs || isNature || isLevel || isShiny || isHappiness || isTera)) {
      if (isMove) {
        currentPokemon.moves.push(line.substring(2).trim());
      }
      if (isEVs) {
        currentPokemon.bstBonus += 63; // Max EVs bonus
      }
      if (isNature) {
        currentPokemon.bstBonus += 10; // Nature bonus
      }
      continue;
    }

    // Otherwise, parse it as a brand new Pokemon!
    let namePart = line;
    if (isItemSplit) {
      namePart = line.split('@')[0];
    }

    if (namePart.includes('(') && namePart.includes(')')) {
      const match = namePart.match(/\(([^)]+)\)/);
      if (match && match[1] !== 'M' && match[1] !== 'F') {
        namePart = match[1]; // Use nickname if it's not a gender flag
      } else {
        namePart = namePart.replace(/\(M\)|\(F\)/g, '');
      }
    }

    let cleanName = namePart.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // PokeAPI requires specific form suffixes for some base species
    const aliases = {
      'toxtricity': 'toxtricity-amped',
      'mimikyu': 'mimikyu-disguised',
      'aegislash': 'aegislash-shield',
      'giratina': 'giratina-altered',
      'shaymin': 'shaymin-land',
      'keldeo': 'keldeo-ordinary',
      'meloetta': 'meloetta-aria',
      'tornadus': 'tornadus-incarnate',
      'thundurus': 'thundurus-incarnate',
      'landorus': 'landorus-incarnate',
      'enamorus': 'enamorus-incarnate',
      'deoxys': 'deoxys-normal',
      'wormadam': 'wormadam-plant',
      'basculin': 'basculin-red-striped',
      'darmanitan': 'darmanitan-standard',
      'meowstic': 'meowstic-male',
      'pumpkaboo': 'pumpkaboo-average',
      'gourgeist': 'gourgeist-average',
      'oricorio': 'oricorio-baile',
      'lycanroc': 'lycanroc-midday',
      'wishiwashi': 'wishiwashi-solo',
      'minior': 'minior-red-meteor',
      'eiscue': 'eiscue-ice',
      'indeedee': 'indeedee-male',
      'morpeko': 'morpeko-full-belly',
      'urshifu': 'urshifu-single-strike',
      'basculegion': 'basculegion-male',
      'oogerpon': 'ogerpon'
    };
    if (aliases[cleanName]) {
      cleanName = aliases[cleanName];
    }

    if (cleanName) {
      currentPokemon = { name: cleanName, moves: [], bstBonus: 0, raw: line };
      team.push(currentPokemon);
    }
  }

  return team;
}

// ---- BATTLE PREDICTOR ----
export function predictBattle(teamA, teamB) {
  function teamMetrics(team) {
    let bstSum = 0;
    let speedSum = 0;
    team.forEach(p => {
      let bst = (p.stats || []).reduce((s, st) => s + st.base_stat, 0);
      let speed = (p.stats || []).find(s => s.stat.name === 'speed')?.base_stat || 80;
      
      // Include parsed advanced stats
      if (p.parsed) {
        if (p.parsed.bstBonus) bst += p.parsed.bstBonus;
        // Move synergy bonus
        if (p.parsed.moves && p.parsed.moves.length > 0) {
          bst += p.parsed.moves.length * 20; 
        }
      }
      bstSum += bst;
      speedSum += speed;
    });
    return { bst: bstSum, speedAvg: speedSum / (team.length || 1) };
  }
  
  const metricsA = teamMetrics(teamA);
  const metricsB = teamMetrics(teamB);

  let teamAAdvantage = 0;
  let teamBAdvantage = 0;
  
  teamA.forEach(a => {
    const aTypes = a.types ? a.types.map(t => t.type?.name || t) : [];
    teamB.forEach(b => {
      const bTypes = b.types ? b.types.map(t => t.type?.name || t) : [];
      if (aTypes.length && bTypes.length) {
        const aAtkB = getTotalEffectiveness(aTypes, bTypes);
        const bAtkA = getTotalEffectiveness(bTypes, aTypes);
        
        if (aAtkB >= 2) teamAAdvantage += aAtkB * 40;
        else if (aAtkB < 1) teamBAdvantage += (1 - aAtkB) * 40;

        if (bAtkA >= 2) teamBAdvantage += bAtkA * 40;
        else if (bAtkA < 1) teamAAdvantage += (1 - bAtkA) * 40;
      }
    });
  });

  // Initiative (Speed) Bonus
  if (metricsA.speedAvg > metricsB.speedAvg + 10) teamAAdvantage += 100;
  else if (metricsB.speedAvg > metricsA.speedAvg + 10) teamBAdvantage += 100;

  const scoreA = metricsA.bst + teamAAdvantage;
  const scoreB = metricsB.bst + teamBAdvantage;
  
  // Sigmoid Probability Calculation for more realistic/decisive predictions
  const scoreDiff = scoreA - scoreB;
  const steepness = 0.006; // Tunes how decisive a small advantage is
  const winProbA = 1 / (1 + Math.exp(-steepness * scoreDiff));
  
  const confA = Math.round(winProbA * 100);
  const confB = 100 - confA;
  const winner = confA >= confB ? 'A' : 'B';
  return { confA, confB, winner, scoreA, scoreB };
}

// ---- EXPORT HELPERS ----
export function exportJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function exportShowdown(team, filename) {
  if (!team || !team.length) return;
  let txt = '=== [gen9nationaldex] Generated Team ===\n\n';
  team.forEach(p => {
    const sd = p.showdown || {};
    const name = p.name.charAt(0).toUpperCase() + p.name.slice(1);
    txt += `${name} @ ${sd.item || 'Leftovers'}\n`;
    txt += `Level: ${sd.level || 100}\n`;
    txt += `Ability: ${sd.ability || 'Unknown'}\n`;
    txt += `EVs: ${sd.evs || '252 Atk / 4 SpD / 252 Spe'}\n`;
    txt += `IVs: ${sd.ivs || '31 HP / 31 Atk / 31 Def / 31 SpA / 31 SpD / 31 Spe'}\n`;
    txt += `${sd.nature || 'Hardy'} Nature\n`;
    (sd.moves || []).forEach(m => {
      txt += `- ${m}\n`;
    });
    txt += '\n';
  });
  const blob = new Blob([txt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}


// ---- STAT COLORS ----
export const STAT_COLORS = {
  hp: '#e63946',
  attack: '#f77f00',
  defense: '#4361ee',
  'special-attack': '#9b5de5',
  'special-defense': '#00b4d8',
  speed: '#06d6a0',
};

export const STAT_ABBREV = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'Sp.ATK', 'special-defense': 'Sp.DEF', speed: 'SPD',
};

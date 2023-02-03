export const TOKEN = Deno.env.get("TOKEN");
export const USER_NAME = Deno.env.get("USER_NAME");

export const GAME_URL = "https://xcraft.ru";
export const MAX_CAPITAL_RESOURCES = 6_500_000;
export const MAX_COLONY_RESOURCES = 80_000;
export const MAX_EXPEDITIONS = +new Date() > +new Date('Feb 18, 2023 23:59:59') ? 3 : 4;
export const MAX_PIRATE_RECYCLING = 3;
export const CHECKED_СOORDINATES_COUNT = 4;

export const MAX_OVERLORDS = 0;
export const MAX_SPYS = 18;
export const MAX_PRODUCERS = Infinity;
export const MAX_SCAVENGERS = 0;
export const MAX_MUTALISKS = 0;
export const MAX_DREDLISKS = 0;
export const MAX_GUARDIANS = 0;
export const MAX_HYDRALISKS = 0; // 100
export const MAX_MOLES = 0; // Infinity
export const MAX_NEEDLE_TREES = 0; // Infinity
export const MAX_FLAMING_WORMS = 0; // 127

export const CAPITAL = {
  id: Deno.env.get("CAPITAL_ID"),
  galaxy: Deno.env.get("CAPITAL_GALAXY"),
  system: Deno.env.get("CAPITAL_SYSTEM"),
  planet: Deno.env.get("CAPITAL_PLANET"),
  planetType: 1,
};

export const QUEEN = {
  id: 250,
  metal: 1200,
  crystal: 14800,
  deuterium: 300,
};

export const OVERLORD = {
  id: 242,
  metal: 2300,
  crystal: 3250,
  deuterium: 0,
  capacity: 15000,
};

export const SPY = {
  id: 240,
  metal: 400,
  crystal: 3000,
  deuterium: 400,
};

export const PRODUCER = {
  id: 239,
  metal: 2800,
  crystal: 1700,
  deuterium: 50,
};

// Баклуша
export const CORMORANT = {
  id: 232,
  metal: 1800,
  crystal: 2200,
  deuterium: 50,
};

// Падальщик
export const SCAVENGER = {
  id: 233,
  metal: 2400,
  crystal: 1600,
  deuterium: 100,
};

// Плеть
export const WHIP = {
  id: 234,
  metal: 100,
  crystal: 150,
  deuterium: 900,
};

export const MUTALISK = {
  id: 236,
  metal: 15000,
  crystal: 9000,
  deuterium: 500,
};

export const DREDLISK = {
  id: 238,
  metal: 27000,
  crystal: 5000,
  deuterium: 750,
};

export const GUARDIAN = {
  id: 241,
  metal: 50000,
  crystal: 20000,
  deuterium: 500,
};

export const EATER = {
  id: 243,
  metal: 60000,
  crystal: 40000,
  deuterium: 30000,
}

export const PANKOR = {
  id: 245,
  metal: 1_000_000,
  crystal: 200_000,
  deuterium: 150_000,
}

export const HYDRALISK = {
  id: 237,
  metal: 2000,
  crystal: 2000,
  deuterium: 500,
};

export const MOLE = {
  id: 437,
  metal: 10000,
  crystal: 5000,
  deuterium: 0,
};

export const NEEDLE_TREE = {
  id: 436,
  metal: 17500,
  crystal: 2500,
  deuterium: 375,
};

export const FLAMING_WORM = {
  id: 434,
  metal: 30000,
  crystal: 30000,
  deuterium: 7500,
};

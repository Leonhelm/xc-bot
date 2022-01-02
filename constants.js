export const TOKEN = Deno.env.get("TOKEN");
export const USER_NAME = Deno.env.get("USER_NAME");

export const GAME_URL = "https://xcraft.ru";
export const MAX_CAPITAL_METAL = 300000;
export const MAX_COLONY_RESOURCES = 20000;

export const CAPITAL = {
  id: Deno.env.get("CAPITAL_ID"),
  galaxy: Deno.env.get("CAPITAL_GALAXY"),
  system: Deno.env.get("CAPITAL_SYSTEM"),
  planet: Deno.env.get("CAPITAL_PLANET"),
  planetType: 1,
};

export const OVERLORD = {
  id: 242,
  capacity: 15000,
};

export const QUEEN = {
  id: 250,
  metal: 1200,
  crystal: 14800,
  deuterium: 300,
};

export const FLAMING_WORM = {
  id: 434,
  metal: 30000,
  crystal: 30000,
  deuterium: 7500,
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

export const HYDRALISK = {
  id: 237,
  metal: 2000,
  crystal: 2000,
  deuterium: 500,
};

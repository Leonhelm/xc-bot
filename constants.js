export const TOKEN = Deno.env.get("TOKEN");
export const USER_NAME = Deno.env.get("USER_NAME");

export const GAME_URL = "https://xcraft.ru";
export const MAX_CAPITAL_RESOURCES = 1_500_000;
export const MAX_COLONY_RESOURCES = 75_000;
export const MAX_EXPEDITIONS = 3;
export const MAX_PIRATE_RECYCLING = 3;
export const CHECKED_СOORDINATES_COUNT = 5;
export const MIN_HYDARIAN_BUY = 10;

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

export const PRODUCER = {
  id: 239,
  metal: 2800,
  crystal: 1700,
  deuterium: 50,
};

export const EATER = {
  id: 243,
  metal: 60000,
  crystal: 40000,
  deuterium: 30000,
};

export const PANKOR = {
  id: 245,
  metal: 1_000_000,
  crystal: 200_000,
  deuterium: 150_000,
};

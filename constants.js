export const TOKEN = Deno.env.get("TOKEN");
export const USER_NAME = Deno.env.get("USER_NAME");

export const GAME_URL = "https://xcraft.ru";
export const MAX_CAPITAL_RESOURCES = 500_000;
export const MAX_COLONY_RESOURCES = 200_000;
export const MIN_COLONY_RESOURCES = 17_000;
export const MAX_FLEETS = +new Date() < +new Date('10 May 2024') ? 13 : 12;
export const MAX_EXPEDITIONS = +new Date() < +new Date('11 Dec 2024') ? 4 : 3;
export const MAX_PIRATE_RECYCLING = 3;

export const IGNORE_AUTO_BUILDING_PLANETS = {
  ids: Deno.env.get("IGNORE_AUTO_BUILDING_PLANET_IDS")
};

export const IGNORE_SEND_TO_CAPITAL_PLANETS = {
  ids: Deno.env.get("IGNORE_SEND_TO_CAPITAL_PLANET_IDS")
};

export const REMOVE_PLANETS = {
  ids: Deno.env.get("REMOVE_PLANET_IDS")
};

export const EXPEDITION_CENTER = {
  id: Deno.env.get("EXPEDITION_CENTER_ID"),
};

export const CAPITAL = {
  id: Deno.env.get("CAPITAL_ID"),
  galaxy: Deno.env.get("CAPITAL_GALAXY"),
  system: Deno.env.get("CAPITAL_SYSTEM"),
  planet: Deno.env.get("CAPITAL_PLANET"),
  planetType: 1,
};

export const QUEEN = {
  id: 250,
  metal: 1_200,
  crystal: 14_800,
  deuterium: 300,
};

export const OVERLORD = {
  id: 242,
  metal: 2_300,
  crystal: 3_250,
  deuterium: 0,
  capacity: 24_200,
};

export const PRODUCER = {
  id: 239,
  metal: 2_800,
  crystal: 1_700,
  deuterium: 50,
};

export const PANKOR = {
  id: 245,
  metal: 1_000_000,
  crystal: 200_000,
  deuterium: 150_000,
};

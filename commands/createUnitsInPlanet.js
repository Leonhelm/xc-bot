import { createFleet } from "./createFleet.js";
import { createDefence } from "./createDefence.js";
import {
  OVERLORD,
  SPY,
  PRODUCER,
  SCAVENGER,
  MUTALISK,
  DREDLISK,
  GUARDIAN,
  HYDRALISK,
  MOLE,
  NEEDLE_TREE,
  FLAMING_WORM,
  MAX_OVERLORDS,
  MAX_SPYS,
  MAX_PRODUCERS,
  MAX_SCAVENGERS,
  MAX_MUTALISKS,
  MAX_DREDLISKS,
  MAX_GUARDIANS,
  MAX_HYDRALISKS,
  MAX_MOLES,
  MAX_NEEDLE_TREES,
  MAX_FLAMING_WORMS,
} from "../constants.js";

const calcToCreateUnit = (planet, unit) => {
  let resources = {
    metal: planet.metal,
    crystal: planet.crystal,
    deuterium: planet.deuterium,
  };
  let count = 0;

  while (unit.metal > 0 || unit.crystal > 0 || unit.deuterium > 0) {
    const resourcesNew = {
      metal: resources.metal - unit.metal,
      crystal: resources.crystal - unit.crystal,
      deuterium: resources.deuterium - unit.deuterium,
    };

    if (
      resourcesNew.metal > 0 &&
      resourcesNew.crystal > 0 &&
      resourcesNew.deuterium > 0
    ) {
      count++;
      resources = { ...resourcesNew };
    } else {
      break;
    }
  }

  return {
    ...resources,
    count,
  };
};

const spendResources = async (params) => {
  const { unit, type, planet, limit = Infinity } = params;
  const calcResult = calcToCreateUnit(planet, unit);

  if (calcResult.count > 0) {
    const count = calcResult.count < limit ? calcResult.count : limit;

    if (type === "defence") {
      await createDefence(unit.id, count);
    } else if (type === "fleet") {
      await createFleet(unit.id, count);
    } else {
      return;
    }

    planet.metal = calcResult.metal;
    planet.crystal = calcResult.crystal;
    planet.deuterium = calcResult.deuterium;
  }
};

// Создаём юнитов на планете
export const createUnitsInPlanet = async (planet) => {
  const { fleet, defense } = planet;
  const fleetToId = new Map(fleet.map((unit) => [unit.id, unit]));
  const defenseToId = new Map(defense.map((unit) => [unit.id, unit]));

  const [
    overlordCount,
    spyCount,
    producerCount,
    scavengerCount,
    mutaliskCount,
    dredliskCount,
    guardianCount,
    hydraliskCount,
  ] = [
    OVERLORD,
    SPY,
    PRODUCER,
    SCAVENGER,
    MUTALISK,
    DREDLISK,
    GUARDIAN,
    HYDRALISK,
  ].map((unit) => fleetToId.get(unit.id)?.count ?? 0);

  const [moleCount, needleTreeCount, flamingWormCount] = [
    MOLE,
    NEEDLE_TREE,
    FLAMING_WORM,
  ].map((unit) => defenseToId.get(unit.id)?.count ?? 0);

  const isCreateOverlord = overlordCount < MAX_OVERLORDS;
  const isCreateSpy = spyCount < MAX_SPYS;
  const isCreateProducer = producerCount < MAX_PRODUCERS;
  const isCreateHydralisk = hydraliskCount < MAX_HYDRALISKS;

  const { createMinUnit } = [
    {
      count: scavengerCount,
      isCreate: scavengerCount < MAX_SCAVENGERS,
      createFunc: () =>
        spendResources({
          unit: SCAVENGER,
          type: "fleet",
          planet: planet,
          limit: MAX_SCAVENGERS - scavengerCount,
        }),
    },
    {
      count: mutaliskCount,
      isCreate: mutaliskCount < MAX_MUTALISKS,
      createFunc: () =>
        spendResources({
          unit: MUTALISK,
          type: "fleet",
          planet: planet,
          limit: MAX_MUTALISKS - mutaliskCount,
        }),
    },
    {
      count: dredliskCount,
      isCreate: dredliskCount < MAX_DREDLISKS,
      createFunc: () =>
        spendResources({
          unit: DREDLISK,
          type: "fleet",
          planet: planet,
          limit: MAX_DREDLISKS - dredliskCount,
        }),
    },
    {
      count: guardianCount,
      isCreate: guardianCount < MAX_GUARDIANS,
      createFunc: () =>
        spendResources({
          unit: GUARDIAN,
          type: "fleet",
          planet: planet,
          limit: MAX_GUARDIANS - guardianCount,
        }),
    },
    {
      count: moleCount,
      isCreate: moleCount < MAX_MOLES && !isCreateHydralisk,
      createFunc: () =>
        spendResources({
          unit: MOLE,
          type: "defence",
          planet: planet,
          limit: MAX_MOLES - moleCount,
        }),
    },
    {
      count: needleTreeCount,
      isCreate: needleTreeCount < MAX_NEEDLE_TREES,
      createFunc: () =>
        spendResources({
          unit: NEEDLE_TREE,
          type: "defence",
          planet: planet,
          limit: MAX_NEEDLE_TREES - needleTreeCount,
        }),
    },
    {
      count: flamingWormCount,
      isCreate: flamingWormCount < MAX_FLAMING_WORMS,
      createFunc: () =>
        spendResources({
          unit: FLAMING_WORM,
          type: "defence",
          planet: planet,
          limit: MAX_FLAMING_WORMS - flamingWormCount,
        }),
    },
  ].reduce((acc, value) => {
    const { count, isCreate, createFunc } = value;
    const { minCount = Infinity } = acc;

    if (count < minCount && isCreate && createFunc) {
      return {
        minCount: count,
        createMinUnit: createFunc,
      };
    }

    return acc;
  }, {});

  if (isCreateOverlord) {
    await spendResources({
      unit: OVERLORD,
      type: "fleet",
      planet: planet,
      limit: MAX_OVERLORDS - overlordCount,
    });
  }

  if (isCreateSpy) {
    await spendResources({
      unit: SPY,
      type: "fleet",
      planet: planet,
      limit: MAX_SPYS - spyCount,
    });
  }

  if (isCreateProducer) {
    await spendResources({
      unit: PRODUCER,
      type: "fleet",
      planet: planet,
      limit: MAX_PRODUCERS - producerCount,
    });
  }

  if (isCreateHydralisk) {
    await spendResources({
      unit: HYDRALISK,
      type: "fleet",
      planet: planet,
      limit: MAX_HYDRALISKS - hydraliskCount,
    });
  }

  createMinUnit?.();
};

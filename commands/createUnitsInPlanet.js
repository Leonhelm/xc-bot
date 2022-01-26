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

const spendResources = async (unit, type, planet) => {
  const calcResult = calcToCreateUnit(planet, unit);

  if (calcResult.count > 0) {
    if (type === "defence") {
      await createDefence(unit.id, calcResult.count);
    } else if (type === "fleet") {
      await createFleet(unit.id, calcResult.count);
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
      createFunc: () => spendResources(SCAVENGER, "fleet", planet),
    },
    {
      count: mutaliskCount,
      isCreate: mutaliskCount < MAX_MUTALISKS,
      createFunc: () => spendResources(MUTALISK, "fleet", planet),
    },
    {
      count: dredliskCount,
      isCreate: dredliskCount < MAX_DREDLISKS,
      createFunc: () => spendResources(DREDLISK, "fleet", planet),
    },
    {
      count: guardianCount,
      isCreate: guardianCount < MAX_GUARDIANS,
      createFunc: () => spendResources(GUARDIAN, "fleet", planet),
    },
    {
      count: moleCount,
      isCreate: moleCount < MAX_MOLES && !isCreateHydralisk,
      createFunc: () => spendResources(MOLE, "defence", planet),
    },
    {
      count: needleTreeCount,
      isCreate: needleTreeCount < MAX_NEEDLE_TREES,
      createFunc: () => spendResources(NEEDLE_TREE, "defence", planet),
    },
    {
      count: flamingWormCount,
      isCreate: flamingWormCount < MAX_FLAMING_WORMS,
      createFunc: () => spendResources(FLAMING_WORM, "defence", planet),
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
    await spendResources(OVERLORD, "fleet", planet);
  }

  if (isCreateSpy) {
    await spendResources(SPY, "fleet", planet);
  }

  if (isCreateProducer) {
    await spendResources(PRODUCER, "fleet", planet);
  }

  if (isCreateHydralisk) {
    await spendResources(HYDRALISK, "fleet", planet);
  }

  createMinUnit?.();
};

import { createFleet } from "./createFleet.js";
import { createDefence } from "./createDefence.js";
import { FLAMING_WORM, HYDRALISK, MOLE, NEEDLE_TREE } from "../constants.js";

const calcToCreateStructure = (planet, unit) => {
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

// Создаём оборону на планете
export const createDefenceInPlanet = async (planet) => {
  const { fleet, defense } = planet;

  const fleetToId = new Map(fleet.map((unit) => [unit.id, unit]));
  const defenseToId = new Map(defense.map((unit) => [unit.id, unit]));
  const [hydraliskCount] = [HYDRALISK].map(
    (unit) => fleetToId.get(unit.id)?.count ?? 0
  );
  const [flamingWormCount, moleCount, needleTreeCount] = [
    FLAMING_WORM,
    MOLE,
    NEEDLE_TREE,
  ].map((unit) => defenseToId.get(unit.id)?.count ?? 0);

  const isNeedCreateFlamingWorm = flamingWormCount < 127;
  const isNeedCreateHydralisk = hydraliskCount < 100;
  const isNeedCreateMole =
    !isNeedCreateHydralisk && moleCount <= needleTreeCount;
  const isNeedCreateNeedleTree = !isNeedCreateMole;

  const spendResources = async (structure, type) => {
    const calcResult = calcToCreateStructure(planet, structure);

    if (calcResult.count > 0) {
      if (type === "defence") {
        await createDefence(structure.id, calcResult.count);
      } else if (type === "fleet") {
        await createFleet(structure.id, calcResult.count);
      } else {
        return;
      }

      planet.metal = calcResult.metal;
      planet.crystal = calcResult.crystal;
      planet.deuterium = calcResult.deuterium;
    }
  };

  if (isNeedCreateFlamingWorm) {
    await spendResources(FLAMING_WORM, "defence");
  }

  if (isNeedCreateHydralisk) {
    await spendResources(HYDRALISK, "fleet");
  }

  if (isNeedCreateMole) {
    await spendResources(MOLE, "defence");
  }

  if (isNeedCreateNeedleTree) {
    await spendResources(NEEDLE_TREE, "defence");
  }
};

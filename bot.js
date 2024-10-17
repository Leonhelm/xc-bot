import { MAX_CAPITAL_RESOURCES, MAX_COLONY_RESOURCES, MAX_FLEETS, MAX_PIRATE_RECYCLING, REMOVE_PLANET, IGNORE_PLANET, EXPEDITION_CENTER } from "./constants.js";
import { collectionResources } from "./commands/collectionResources.js";
import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { sendOnExpedition } from "./commands/sendOnExpedition.js";
import { pirateRecycling } from "./commands/pirateRecycling.js";
import { buyHydarian } from "./commands/buyHydarian.js";
import { createPlanet } from "./commands/createPlanet.js";
import { removePlanet } from "./commands/removePlanet.js";
import { getMyFleetInFly } from "./utils/fleetInFly.js";
import { getBuildTokens } from "./utils/build.js";
import { formatIds } from "./utils/format.js";

const removePlanetIds = formatIds(REMOVE_PLANET.ids);
const ignorePlanetIds = formatIds(IGNORE_PLANET.ids);

let pirateRecyclingCount = 0;

await takingActionsOnPlanets(
  async (planet, planets) => {
    const { type, id, metal, crystal, deuterium } = planet;
    const buildingsPage = await collectionResources(id);
    const nowHours = new Date().getUTCHours() + 3; // Делаем таймзону как на сервере игры
    const buildTokens = getBuildTokens(buildingsPage);
    let fleetFreeSlots = MAX_FLEETS - getMyFleetInFly(buildingsPage).length;

    if (type === "colony") {
      if (fleetFreeSlots === 0) {
        return;
      }

      const isMaxColonyResources = metal > MAX_COLONY_RESOURCES || crystal > MAX_COLONY_RESOURCES || deuterium > MAX_COLONY_RESOURCES;
      let isSendResourcesToCapital = false;

      if (isMaxColonyResources && fleetFreeSlots > 0 && !ignorePlanetIds.includes(String(id))) {
        isSendResourcesToCapital = await sendResourcesToCapital(planet);

        if (isSendResourcesToCapital) {
          fleetFreeSlots--;
        }
        console.log('sendResourcesToCapital', isSendResourcesToCapital);
      }

      if (removePlanetIds.includes(String(id))) {
        const removeCount = await removePlanet(buildingsPage, buildTokens);
        console.log('removePlanet', removeCount);
      } else if (!isSendResourcesToCapital) {
        const createCount = await createPlanet(buildingsPage, buildTokens);
        console.log('createPlanet', createCount);
      }

      if (pirateRecyclingCount <= MAX_PIRATE_RECYCLING && !isSendResourcesToCapital && fleetFreeSlots > 2) {
        const { isSend } = await pirateRecycling(planet, planets);

        if (isSend) {
          fleetFreeSlots -= 2;
          pirateRecyclingCount++;
        }
        console.log('pirateRecycling', isSend);
      }
    }

    if (type === "capital") {
      const isEveryXHours = (nowHours % 6) === 0;
      const isThereSurplusResources = metal >= MAX_CAPITAL_RESOURCES || crystal >= MAX_CAPITAL_RESOURCES || deuterium >= MAX_CAPITAL_RESOURCES;

      if (isEveryXHours && isThereSurplusResources) {
        await buyHydarian(planet);
        console.log('buyHydarian');
      }
    }

    if (id === EXPEDITION_CENTER.id && fleetFreeSlots > 0) {
      const { isSend } = await sendOnExpedition(planet, buildingsPage);
      console.log('sendOnExpedition', isSend);
    }
  },
  (planets) => planets.sort((a, b) => b.deuterium - a.deuterium)
);

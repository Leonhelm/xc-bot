import { MAX_CAPITAL_RESOURCES, MAX_COLONY_RESOURCES, MAX_FLEETS, MAX_PIRATE_RECYCLING } from "./constants.js";
import { collectionResources } from "./commands/collectionResources.js";
import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { sendOnExpedition } from "./commands/sendOnExpedition.js";
import { pirateRecycling } from "./commands/pirateRecycling.js";
import { buyHydarian } from "./commands/buyHydarian.js";
import { planetRecycling } from "./commands/planetRecycling.js";
import { sendFleetTimeout } from "./utils/sendFleet.js";
import { getMyFleetInFly } from "./utils/fleetInFly.js";
import { randomSortArray } from "./utils/random.js";

let pirateRecyclingCount = 0;

await takingActionsOnPlanets(
  async (planet, planets) => {
    const { type, id, metal, crystal, deuterium } = planet;
    const buildingsPage = await collectionResources(id);
    const nowHours = new Date().getUTCHours() + 3; // Делаем таймзону как на сервере игры
    let fleetFreeSlots = MAX_FLEETS - getMyFleetInFly(buildingsPage).length;

    if (type === "colony") {
      if (fleetFreeSlots === 0) {
        return;
      }

      const isMaxColonyResources = metal > MAX_COLONY_RESOURCES || crystal > MAX_COLONY_RESOURCES || deuterium > MAX_COLONY_RESOURCES;
      let isSendResourcesToCapital = false;
      let isSendPirateRecycling = false;

      if (isMaxColonyResources && fleetFreeSlots > 0) {
        isSendResourcesToCapital = await sendResourcesToCapital(planet);

        if (isSendResourcesToCapital) {
          fleetFreeSlots--;
        }
        console.log('sendResourcesToCapital', isSendResourcesToCapital);
      }

      if (pirateRecyclingCount <= MAX_PIRATE_RECYCLING && !isSendResourcesToCapital && fleetFreeSlots > 2) {
        const { isSend } = await pirateRecycling(planet, planets);

        if (isSend) {
          fleetFreeSlots -= 2;
          isSendPirateRecycling = true;
          pirateRecyclingCount++;
        }
        console.log('pirateRecycling', isSend);
      }

      if (fleetFreeSlots > 0) {
        if (isSendPirateRecycling) {
          await sendFleetTimeout();
        }

        const { isSend } = await planetRecycling(planet);
        console.log('planetRecycling', isSend);
      }

      return;
    }

    if (type === "capital") {
      const isEveryXHours = (nowHours % 6) === 0;
      const isThereSurplusResources = metal >= MAX_CAPITAL_RESOURCES || crystal >= MAX_CAPITAL_RESOURCES || deuterium >= MAX_CAPITAL_RESOURCES;

      if (isEveryXHours && isThereSurplusResources) {
        await buyHydarian(planet);
      }

      let isSendOnExpedition = false;

      if (fleetFreeSlots > 0) {
        const { isSend } = await sendOnExpedition(planet, buildingsPage);
        isSendOnExpedition = isSend;

        if (isSendOnExpedition) {
          fleetFreeSlots--;
        }
        console.log('sendOnExpedition', isSend);
      }

      if (fleetFreeSlots > 0) {
        if (isSendOnExpedition) {
          await sendFleetTimeout();
        }
        const { isSend } = await planetRecycling(planet);
        console.log('planetRecycling', isSend);
      }

      return;
    }
  },
  (planets) => planets.sort((a, b) => b.deuterium > a.deuterium)
);

import { MAX_CAPITAL_RESOURCES, MAX_COLONY_RESOURCES, MAX_FLEETS } from "./constants.js";
import { collectionResources } from "./commands/collectionResources.js";
import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { sendOnExpedition } from "./commands/sendOnExpedition.js";
import { pirateRecycling } from "./commands/pirateRecycling.js";
import { buyHydarian } from "./commands/buyHydarian.js";
import { planetRecycling } from "./commands/planetRecycling.js";
import { sendFleetTimeout } from "./utils/sendFleet.js";
import { getMyFleetInFly } from "./utils/fleetInFly.js";

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
      const isSafeHours = nowHours > 0 && nowHours < 20;
      let isSendResourcesToCapital = false;
      let isSendPirateRecycling = false;

      if (isMaxColonyResources && fleetFreeSlots > 0) {
        isSendResourcesToCapital = await sendResourcesToCapital(planet);

        if (isSendResourcesToCapital) {
          fleetFreeSlots--;
        }
      }

      if (isSafeHours && !isSendResourcesToCapital && fleetFreeSlots >= 2) {
        const { isSend } = await pirateRecycling(planet, planets);

        if (isSend) {
          fleetFreeSlots--;
          isSendPirateRecycling = true;
        }
      }

      if (fleetFreeSlots === 0) {
        return;
      }

      if (isSendPirateRecycling) {
        await sendFleetTimeout();
      }

      await planetRecycling(planet);
      return;
    }

    if (type === "capital") {
      await sendOnExpedition(planet, buildingsPage);

      const isEveryXHours = (nowHours % 6) === 0;
      const isThereSurplusResources = metal >= MAX_CAPITAL_RESOURCES || crystal >= MAX_CAPITAL_RESOURCES || deuterium >= MAX_CAPITAL_RESOURCES;

      if (isEveryXHours && isThereSurplusResources) {
        await buyHydarian(planet);
      }
    }
  },
  (planets) => planets.reverse()
);

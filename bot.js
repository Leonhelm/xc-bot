import { MAX_CAPITAL_RESOURCES, MAX_PIRATE_RECYCLING, MAX_COLONY_RESOURCES } from "./constants.js";
import { collectionResources } from "./commands/collectionResources.js";
import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { sendOnExpedition } from "./commands/sendOnExpedition.js";
import { pirateRecycling } from "./commands/pirateRecycling.js";
import { buyHydarian } from "./commands/buyHydarian.js";
import { planetRecycling } from "./commands/planetRecycling.js";

let pirateRecyclingCount = 0;

await takingActionsOnPlanets(
  async (planet, planets) => {
    const { type, id, metal, crystal, deuterium } = planet;
    const buildingsPage = await collectionResources(id);
    const nowHours = new Date().getUTCHours() + 3; // Делаем таймзону как на сервере игры

    if (type === "colony") {
      let isSendResourcesToCapital = false;

      if (
        metal > MAX_COLONY_RESOURCES ||
        crystal > MAX_COLONY_RESOURCES ||
        deuterium > MAX_COLONY_RESOURCES
      ) {
        isSendResourcesToCapital = await sendResourcesToCapital(planet);
      }

      const isSafeHours = nowHours > 0 && nowHours < 20;

      if (isSafeHours && !isSendResourcesToCapital && pirateRecyclingCount < MAX_PIRATE_RECYCLING) {
        const { isSend } = await pirateRecycling(planet, planets);

        if (isSend) {
          pirateRecyclingCount++;
        }

        return;
      }

      if (!isSendResourcesToCapital) {
        await planetRecycling(planet);
      }
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

import { MAX_CAPITAL_RESOURCES, MAX_PIRATE_RECYCLING } from "./constants.js";
import { collectionResources } from "./commands/collectionResources.js";
import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { sendOnExpedition } from "./commands/sendOnExpedition.js";
import { pirateRecycling } from "./commands/pirateRecycling.js";
import { buyHydarian } from "./commands/buyHydarian.js";

let pirateRecyclingCount = 0;

await takingActionsOnPlanets(
  async (planet) => {
    const { type, id, metal, crystal, deuterium } = planet;

    const buildingsPage = await collectionResources(id);

    if (type === "colony") {
      const isSendResourcesToCapital = await sendResourcesToCapital(planet);
      const hours = new Date().getUTCHours() + 3; // Делаем таймзону как на сервере игры
      const isSafeHours = hours > 23 || hours < 19;

      if (isSafeHours && !isSendResourcesToCapital && pirateRecyclingCount < MAX_PIRATE_RECYCLING) {
        const { isSend } = await pirateRecycling(planet);

        if (isSend) {
          pirateRecyclingCount++;
        }
      }

      return;
    }

    if (type === "capital") {
      await sendOnExpedition(planet, buildingsPage);

      const isEveryXHours = (new Date().getHours() % 6) === 0;
      const isThereSurplusResources = metal >= MAX_CAPITAL_RESOURCES || crystal >= MAX_CAPITAL_RESOURCES || deuterium >= MAX_CAPITAL_RESOURCES;

      if (isEveryXHours && isThereSurplusResources) {
        await buyHydarian(planet);
      }
    }
  },
  (planets) => planets.reverse()
);

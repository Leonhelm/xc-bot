import { MAX_CAPITAL_RESOURCES, MAX_PIRATE_RECYCLING } from "./constants.js";
import { collectionResources } from "./commands/collectionResources.js";
import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { sendOnExpedition } from "./commands/sendOnExpedition.js";
import { createUnitsInPlanet } from "./commands/createUnitsInPlanet.js";
import { createEvolution } from "./commands/createEvolution.js";
import { pirateRecycling } from "./commands/pirateRecycling.js";

let pirateRecyclingCount = 0;
const pirateFleetBlackList = [];

await takingActionsOnPlanets(
  async (planet) => {
    const { type, id, metal, crystal, deuterium } = planet;
    const buildingsPage = await collectionResources(id);

    if (type === "colony") {
      const isSendResourcesToCapital = await sendResourcesToCapital(planet);

      if (!isSendResourcesToCapital && pirateRecyclingCount < MAX_PIRATE_RECYCLING) {
        const { isSend } = await pirateRecycling(planet, pirateFleetBlackList);

        if (isSend) {
          pirateRecyclingCount++;
        }
      }

      return;
    }

    if (type === "capital") {
      await sendOnExpedition(planet, buildingsPage);
      await createEvolution(planet);

      if (metal >= MAX_CAPITAL_RESOURCES || crystal >= MAX_CAPITAL_RESOURCES || deuterium >= MAX_CAPITAL_RESOURCES) {
        await createUnitsInPlanet(planet);
      }
    }
  },
  (planets) => planets.reverse()
);

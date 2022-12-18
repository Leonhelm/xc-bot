import { MAX_CAPITAL_RESOURCES } from "./constants.js";
import { collectionResources } from "./commands/collectionResources.js";
import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { sendOnExpedition } from "./commands/sendOnExpedition.js";
import { createUnitsInPlanet } from "./commands/createUnitsInPlanet.js";
import { createEvolution } from "./commands/createEvolution.js";
import { pirateRecycling } from "./commands/pirateRecycling.js";

let isSendPirateRecycling = false;

await takingActionsOnPlanets(
  async (planet) => {
    const { type, id, metal, crystal, deuterium } = planet;
    const buildingsPage = await collectionResources(id);

    if (type === "colony") {
      const isSendResourcesToCapital = await sendResourcesToCapital(planet);

      if (!isSendResourcesToCapital && !isSendPirateRecycling) {
        isSendPirateRecycling = await pirateRecycling(planet);
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

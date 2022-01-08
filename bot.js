import { MAX_CAPITAL_METAL } from "./constants.js";
import { collectionResources } from "./commands/collectionResources.js";
import { collectionPremiumResources } from "./commands/collectionPremiumResources.js";
import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { sendOnExpedition } from "./commands/sendOnExpedition.js";
import { createDefenceInPlanet } from "./commands/createDefenceInPlanet.js";
import { createEvolution } from "./commands/createEvolution.js";

await takingActionsOnPlanets(
  async (planet) => {
    const { type, id, metal } = planet;
    const buildingsPage = await collectionResources(id);

    if (type === "colony") {
      await sendResourcesToCapital(planet);
      return;
    }

    if (type === "capital") {
      const hoursNow = new Date().getHours();

      if (hoursNow > 18 && hoursNow < 20) {
        await collectionPremiumResources();
      }

      await sendOnExpedition(planet, buildingsPage);

      if (metal >= MAX_CAPITAL_METAL) {
        await createEvolution(planet);
        await createDefenceInPlanet(planet);
      }
    }
  },
  (planets) => planets.reverse()
);

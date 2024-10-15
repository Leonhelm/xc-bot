import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { collectionResources } from "./commands/collectionResources.js";
import { MIN_COLONY_RESOURCES } from "./constants.js";

await takingActionsOnPlanets(
  async (planet) => {
    const { type, id, metal, crystal, deuterium } = planet;

    await collectionResources(id);

    if (type === "colony") {
      if (metal > MIN_COLONY_RESOURCES || crystal > MIN_COLONY_RESOURCES || deuterium > MIN_COLONY_RESOURCES) {
        await sendResourcesToCapital(planet);
      }
    }
  },
  (planets) => planets.sort((a, b) => b.deuterium > a.deuterium)
);

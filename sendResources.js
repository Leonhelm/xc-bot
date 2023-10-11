import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { collectionResources } from "./commands/collectionResources.js";

const reserve = 5_000;

await takingActionsOnPlanets(
  async (planet) => {
    const { type, id, metal, crystal, deuterium } = planet;

    await collectionResources(id);

    if (type === "colony") {
      if (metal > reserve || crystal > reserve || deuterium > reserve) {
        await sendResourcesToCapital(planet);
      }
    }
  },
  (planets) => planets.reverse()
);

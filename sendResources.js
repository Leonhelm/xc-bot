import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { collectionResources } from "./commands/collectionResources.js";

const reserve = 10_000;

await takingActionsOnPlanets(
  async (planet) => {
    const { type, id, metal, crystal, deuterium } = planet;

    await collectionResources(id);

    if (type === "colony") {
      if (metal > reserve || crystal > reserve) {
        await sendResourcesToCapital(planet);
      }
    }
  },
  (planets) => planets.sort((a, b) => b.metal > a.metal)
);

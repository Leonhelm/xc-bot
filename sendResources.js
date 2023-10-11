import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";
import { collectionResources } from "./commands/collectionResources.js";

await takingActionsOnPlanets(
  async (planet) => {
    const { type, id } = planet;

    await collectionResources(id);

    if (type === "colony") {
      await sendResourcesToCapital(planet);
    }
  },
  (planets) => planets.reverse()
);

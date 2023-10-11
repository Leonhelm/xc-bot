import { sendResourcesToCapital } from "./commands/sendResourcesToCapital.js";
import { takingActionsOnPlanets } from "./commands/takingActionsOnPlanets.js";

await takingActionsOnPlanets(
  async (planet) => {
    const { type } = planet;

    if (type === "colony") {
      await sendResourcesToCapital(planet);
    }
  },
  (planets) => planets.reverse()
);

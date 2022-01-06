import { createFleet } from "./createFleet.js";
import { CAPITAL, QUEEN } from "../constants.js";
import { makeRequestJson } from "../utils/makeRequest.js";

const sendQueenOnExpedition = async () => {
  await makeRequestJson("/fleet/send/", {
    body: `ship%5B${QUEEN.id}%5D=1&target_user=&method=get&use_portal=false&metal=0&crystal=0&deuterium=0&galaxy=${CAPITAL.galaxy}&system=${CAPITAL.system}&planet=10&planettype=1&planetId=0&mission=15&holding=24&hyd=0&speed=10&fleet_group=0&fid=0&fleet_resource_priority=0&rec-auto-return=1&aggression=0&battle_begin_alarm=0&count=0&silent=0`,
    method: "POST",
  });
};

// Создаём всё необходимое для экспедиции или отправляем экспедицию
export const sendOnExpedition = async (planet, page) => {
  const fleetInFly = page
    .split("window.jsConfig = ")[1]
    .split("window.iFaceToggles = ")[0];
  const isQueenInExpedition = fleetInFly.includes("Экспедиция");

  if (!isQueenInExpedition) {
    const isQueenInReserve = planet.fleet.some(
      (ship) => ship.id === QUEEN.id && ship.count > 0
    );

    if (isQueenInReserve) {
      await sendQueenOnExpedition();
    } else {
      await createFleet(QUEEN.id, 1);
      planet.metal -= QUEEN.metal;
      planet.crystal -= QUEEN.crystal;
      planet.deuterium -= QUEEN.deuterium;
    }
  }
};

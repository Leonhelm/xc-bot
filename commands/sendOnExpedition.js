import { createFleet } from "./createFleet.js";
import { CAPITAL, QUEEN, MAX_EXPEDITIONS } from "../constants.js";
import { makeRequestJson } from "../utils/makeRequest.js";
import { getMyFleetInFly } from "../utils/fleetInFly.js";

// Создаём всё необходимое для экспедиции или отправляем экспедицию со столицы
export const sendOnExpedition = async (planet, page) => {
  const myFleetInFly = getMyFleetInFly(page);
  const expeditionCount = myFleetInFly.filter(({ mission }) => mission.name === 'Экспедиция').length ?? 0;

  if (expeditionCount < MAX_EXPEDITIONS) {
    const queenInReserveCount =
      planet.fleet.find((ship) => ship.id === QUEEN.id)?.count ?? 0;

    if (queenInReserveCount > 0) {
      const response = await makeRequestJson("/fleet/send/", {
        body: `ship%5B${QUEEN.id}%5D=1&target_user=&method=get&use_portal=false&metal=0&crystal=0&deuterium=0&galaxy=${CAPITAL.galaxy}&system=${CAPITAL.system}&planet=10&planettype=1&planetId=0&mission=15&holding=24&hyd=0&speed=100&fleet_group=0&fid=0&fleet_resource_priority=0&rec-auto-return=1&aggression=0&battle_begin_alarm=0&count=0&silent=0`,
        method: "POST",
      });

      return {
        isSend: !response?.error
      };
    }

    const metal = planet.metal - QUEEN.metal;
    const crystal = planet.crystal - QUEEN.crystal;
    const deuterium = planet.deuterium - QUEEN.deuterium;

    if (metal > 0 && crystal > 0 && deuterium > 0) {
      try {
        await createFleet(QUEEN.id, 1);
        planet.metal = metal;
        planet.crystal = crystal;
        planet.deuterium = deuterium;
      } catch { }
    }
  }

  return {
    isSend: false
  };
};

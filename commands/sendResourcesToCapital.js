import { CAPITAL, MAX_COLONY_RESOURCES, OVERLORD } from "../constants.js";
import { makeRequestJson } from "../utils/makeRequest.js";

// Отправка ресурсов с колонии в столицу
export const sendResourcesToCapital = async (planet) => {
  const { metal, crystal, deuterium } = planet;

  if (
    metal < MAX_COLONY_RESOURCES &&
    crystal < MAX_COLONY_RESOURCES &&
    deuterium < MAX_COLONY_RESOURCES
  ) {
    return;
  }

  const overlordsCount = Math.ceil(
    (metal + crystal + deuterium) / OVERLORD.capacity
  );
  await makeRequestJson("/fleet/send/", {
    body: `ship%5B${OVERLORD.id}%5D=${overlordsCount}&target_user=&method=get&use_portal=false&metal=${metal}&crystal=${crystal}&deuterium=${deuterium}&galaxy=${CAPITAL.galaxy}&system=${CAPITAL.system}&planet=${CAPITAL.planet}&planettype=${CAPITAL.planetType}&planetId=${CAPITAL.id}&mission=3&holding=0&hyd=0&speed=10&fleet_group=0&fid=0&fleet_resource_priority=0&rec-auto-return=1&aggression=0&battle_begin_alarm=0&count=0&silent=0`,
    method: "POST",
  });
};

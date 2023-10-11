import { CAPITAL, OVERLORD } from "../constants.js";
import { makeRequestJson } from "../utils/makeRequest.js";

const deuteriumReserve = 10_000;

// Отправка ресурсов с колонии в столицу
export const sendResourcesToCapital = async (planet) => {
  const metal = planet.metal;
  const crystal = planet.crystal;
  const deuterium = planet.deuterium - deuteriumReserve > 0 ? planet.deuterium - deuteriumReserve : 0;

  const overlordsCount = Math.ceil(
    (metal + crystal + deuterium) / OVERLORD.capacity
  );
  const response = await makeRequestJson("/fleet/send/", {
    body: `ship%5B${OVERLORD.id}%5D=${overlordsCount}&target_user=&method=get&use_portal=false&metal=${metal}&crystal=${crystal}&deuterium=${deuterium}&galaxy=${CAPITAL.galaxy}&system=${CAPITAL.system}&planet=${CAPITAL.planet}&planettype=${CAPITAL.planetType}&planetId=${CAPITAL.id}&mission=3&holding=0&hyd=0&speed=100&fleet_group=0&fid=0&fleet_resource_priority=0&rec-auto-return=1&aggression=0&battle_begin_alarm=0&count=0&silent=0`,
    method: "POST",
  });

  return !response?.error;
};

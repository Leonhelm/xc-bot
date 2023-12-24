import { RECYCLING, LEXX } from "../constants.js";
import { makeRequestJson } from "../utils/makeRequest.js";

// Пожираем планету лексами
export async function planetRecycling(planet) {
    if (!RECYCLING.id || !RECYCLING.galaxy || !RECYCLING.system || !RECYCLING.planet) {
        return { isSend: false };
    }

    const lexxInPlanet = planet.fleet.find(f => f.id === LEXX.id)?.count ?? 0;

    if (lexxInPlanet <= 0) {
        return { isSend: false };
    }

    const info = await makeRequestJson('/fleet/send/info/', {
        body: `fleet_id=0&query_planet_id=0&galaxy=${RECYCLING.galaxy}&system=${RECYCLING.system}&planet=${RECYCLING.planet}&type=${RECYCLING.planetType}`,
        method: "POST",
    });
    const { planetId, visual } = info?.objects?.at?.(0) ?? {};
    const isInactive = visual?.includes('player_inactive');

    if (planetId != RECYCLING.id || !isInactive) {
        return { isSend: false };
    }

    const response = await makeRequestJson("/fleet/send/", {
        body: `ship%5B${LEXX.id}%5D=${lexxInPlanet}&target_user=&method=get&use_portal=false&metal=0&crystal=0&deuterium=0&galaxy=${RECYCLING.galaxy}&system=${RECYCLING.system}&planet=${RECYCLING.planet}&planettype=${RECYCLING.planetType}&planetId=${RECYCLING.id}&mission=25&holding=0&hyd=0&speed=100&fleet_group=0&fid=0&clusterId=0&targetFleetId=0&fleet_resource_priority=0&rec-auto-return=1&aggression=1&battle_begin_alarm=0&count=0&silent=0`,
        method: "POST",
    });

    return { isSend: !response.error };
}

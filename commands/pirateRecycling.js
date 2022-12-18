import { CHECKED_СOORDINATES_COUNT, PANKOR, PRODUCER } from "../constants.js";
import { getRandom } from "../utils/getRandom.js";
import { makeRequestJson } from "../utils/makeRequest.js";

const getCheckedСoordinates = (count, galaxy, system) => {
    const arr = [];

    while (arr.length < count) {
        const galaxyChecked = getRandom(+galaxy - 1, +galaxy + 1);
        const systemChecked = getRandom(+system - 1, +system + 1);
        const planetChecked = getRandom(1, 9);
        const coordinates = JSON.stringify([galaxyChecked, systemChecked, planetChecked])

        if (!arr.includes(coordinates)) {
            arr.push(coordinates)
        }
    }

    return arr.map(JSON.parse)
}

const getPirates = async (galaxy, system) => {
    const checkedСoordinates = getCheckedСoordinates(CHECKED_СOORDINATES_COUNT, galaxy, system);

    const coordinatesInfo = await Promise.all(checkedСoordinates.map(([gal, sys, plan]) => makeRequestJson('/fleet/send/info/', {
        body: `fleet_id=0&query_planet_id=0&galaxy=${gal}&system=${sys}&planet=${plan}&type=1`,
        method: "POST",
    })))

    const pirates = coordinatesInfo.map((info, key) => {
        const [gal, sys, plan] = checkedСoordinates[key]

        return info?.objects.map(object => {
            if (!object?.isSabAttack || object?.fleetIds?.length !== 1) {
                return false;
            }

            const power = +object.visual.split('<span class="fleet">')[1].split('</span>')[0];

            return {
                power,
                galaxy: gal,
                system: sys,
                planet: plan,
                fleetId: +object.fleetIds[0]
            };
        }).filter(Boolean)?.[0]
    }).filter(Boolean)

    return pirates ?? []
}

// Ищем пирата и отправляем флот в миссию "Переработка" на координаты с пиратом
export const pirateRecycling = async (planet) => {
    const { galaxy, system, fleet } = planet;
    const pirateMaxPower = 300;
    const pankorCount = 1;
    const producerCount = 20;
    const pankorsInPlanet = fleet.find(f => f.id === PANKOR.id)?.count;
    const producersInPlanet = fleet.find(f => f.id === PRODUCER.id)?.count;

    if (pankorsInPlanet < pankorCount || producersInPlanet < producerCount) {
        return false
    }

    const pirates = await getPirates(galaxy, system);
    const suitablePirate = pirates?.reduce((acc, pirate) => {
        if (pirate.power <= pirateMaxPower && pirate.power > (acc?.power ?? 0)) {
            return pirate;
        }
        return acc;
    }, null)
    console.log(pirates, suitablePirate)

    if (!suitablePirate) {
        return false;
    }

    const response = await makeRequestJson("/fleet/send/", {
        body: `ship%5B${PRODUCER.id}%5D=${producerCount}&ship%5B${PANKOR.id}%5D=${pankorCount}&target_user=&method=get&use_portal=false&metal=0&crystal=0&deuterium=0&galaxy=${suitablePirate.galaxy}&system=${suitablePirate.system}&planet=${suitablePirate.planet}&planettype=4&planetId=0&mission=8&holding=3&hyd=0&speed=10&fleet_group=0&fid=0&targetFleetId=${suitablePirate.fleetId}&fleet_resource_priority=0&rec-auto-return=1&aggression=1&battle_begin_alarm=0&count=0&silent=0`,
        method: "POST",
    });

    return !response?.error;
}
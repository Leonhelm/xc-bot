import { CHECKED_СOORDINATES_COUNT, PANKOR, PRODUCER, JUGGERNAUT } from "../constants.js";
import { getRandom } from "../utils/getRandom.js";
import { makeRequestJson } from "../utils/makeRequest.js";

const getCheckedСoordinates = (count, galaxy, system) => {
    const arr = [];

    while (arr.length < count) {
        const galaxyChecked = getRandom(+galaxy - 2, +galaxy + 2);
        const systemChecked = getRandom(+system - 2, +system + 2);
        const planetChecked = getRandom(1, 9);
        const coordinates = JSON.stringify([galaxyChecked, systemChecked, planetChecked])

        if (!arr.includes(coordinates)) {
            arr.push(coordinates)
        }
    }

    return arr.map(JSON.parse)
}

const getPirates = async (galaxy, system) => {
    try {
        const checkedСoordinates = getCheckedСoordinates(CHECKED_СOORDINATES_COUNT, galaxy, system);

        const coordinatesInfo = await Promise.all(checkedСoordinates.map(([gal, sys, plan]) => makeRequestJson('/fleet/send/info/', {
            body: `fleet_id=0&query_planet_id=0&galaxy=${gal}&system=${sys}&planet=${plan}&type=1`,
            method: "POST",
        })));

        const pirates = coordinatesInfo.map((info, key) => {
            const [gal, sys, plan] = checkedСoordinates[key]

            return info?.objects.map(object => {
                if (object?.isGroupFleet || !object?.visual) {
                    return false;
                }

                const fleetId = +object.visual.split('data-fleet-id="')[1]?.split('"')[0];

                if (!fleetId || Number.isNaN(fleetId)) {
                    return false;
                }

                const power = +object.visual.split('<span class="fleet">')[1]?.split('</span>')[0];

                if (!power || Number.isNaN(power)) {
                    return false;
                }

                return {
                    power,
                    galaxy: gal,
                    system: sys,
                    planet: plan,
                    fleetId,
                };
            }).filter(Boolean)?.[0]
        }).filter(Boolean)

        return pirates ?? []
    } catch {
        return [];
    }
}

// Ищем пирата и отправляем флот в миссию "Переработка" на координаты с пиратом
export const pirateRecycling = async (planet, pirateFleetBlackList = []) => {
    const { galaxy, system, fleet } = planet;
    const pirateMinPower = 50;
    const pirateMaxPower = 1500;
    const pankorMinCount = 1;
    const producerMinCount = 15;
    const pankorsInPlanet = fleet.find(f => f.id === PANKOR.id)?.count;
    const producersInPlanet = fleet.find(f => f.id === PRODUCER.id)?.count;

    if (pankorsInPlanet < pankorMinCount || producersInPlanet < producerMinCount) {
        return {
            isSend: false,
        }
    }

    const pirates = await getPirates(galaxy, system);
    const suitablePirate = pirates?.reduce((acc, pirate) => {
        const isInBlackList = pirateFleetBlackList.includes(pirate.fleetId);
        const isMinPower = pirate.power >= pirateMinPower;
        const isMaxPower = pirate.power <= pirateMaxPower;
        const isMostPowerful = pirate.power > (acc?.power ?? 0);

        if (!isInBlackList && isMinPower && isMaxPower && isMostPowerful) {
            return pirate;
        }
        return acc;
    }, null)

    if (!suitablePirate) {
        return {
            isSend: false,
        };
    }

    const ships = [];
    const juggernautsInPlanet = fleet.find(f => f.id === JUGGERNAUT.id)?.count;

    if (suitablePirate.power <= 450) {
        ships.push([PANKOR.id, pankorMinCount]);
        ships.push([PRODUCER.id, producerMinCount]);

        if (juggernautsInPlanet > 0) {
            ships.push([JUGGERNAUT.id, juggernautsInPlanet]);
        }
    } else if (pankorsInPlanet > pankorMinCount && producersInPlanet > producersInPlanet) {
        ships.push([PANKOR.id, pankorsInPlanet]);
        ships.push([PRODUCER.id, producersInPlanet]);

        if (juggernautsInPlanet > 0) {
            ships.push([JUGGERNAUT.id, juggernautsInPlanet]);
        }
    }

    if (!ships.length) {
        return {
            isSend: false,
        };
    }

    const response = await makeRequestJson("/fleet/send/", {
        body: `${ships.map(([id, count]) => `ship%5B${id}%5D=${count}`).join('&')}&target_user=&method=get&use_portal=false&metal=0&crystal=0&deuterium=0&galaxy=${suitablePirate.galaxy}&system=${suitablePirate.system}&planet=${suitablePirate.planet}&planettype=4&planetId=0&mission=8&holding=3&hyd=0&speed=100&fleet_group=0&fid=0&targetFleetId=${suitablePirate.fleetId}&fleet_resource_priority=0&rec-auto-return=1&aggression=1&battle_begin_alarm=0&count=0&silent=0`,
        method: "POST",
    });

    pirateFleetBlackList.push(suitablePirate.fleetId);

    return {
        isSend: !response?.error,
    };
}

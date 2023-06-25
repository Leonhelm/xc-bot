import { CAPITAL, PANKOR, PRODUCER } from "../constants.js";
import { makeRequestJson } from "../utils/makeRequest.js";

const getCheckedСoordinates = () => {
    const coordinates = [];

    for (let galaxy = CAPITAL.galaxy - 2; galaxy <= CAPITAL.galaxy + 2; galaxy ++) {
        for (let system = CAPITAL.system - 2; system <= CAPITAL.system + 2; system++) {
            for (let planet = 1; planet <= 9; planet++) {
                coordinates.push([galaxy, system, planet])
            }
        }
    }

    return coordinates;
}

const getPirates = async () => {
    try {
        const checkedСoordinates = getCheckedСoordinates();
        const coordinatesInfo = [];

        for (const coordinate of checkedСoordinates) {
            const [galaxy, system, planet] = coordinate;
            const response = await makeRequestJson('/fleet/send/info/', {
                body: `fleet_id=0&query_planet_id=0&galaxy=${galaxy}&system=${system}&planet=${planet}&type=1`,
                method: "POST",
            });
            coordinatesInfo.push(response);
        }

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

let pirates = null;

// Ищем пирата и отправляем флот в миссию "Переработка" на координаты с пиратом
export const pirateRecycling = async (planet) => {
    const { fleet } = planet;
    const pirateMinPower = 50;
    const pirateMaxPower = 1505;
    const pankorMinCount = 1;
    const producerMinCount = 15;
    const pankorsInPlanet = fleet.find(f => f.id === PANKOR.id)?.count;
    const producersInPlanet = fleet.find(f => f.id === PRODUCER.id)?.count;

    if (pankorsInPlanet < pankorMinCount || producersInPlanet < producerMinCount) {
        return {
            isSend: false,
        }
    }

    if (pirates == null) {
        pirates = await getPirates();
    }

    const suitablePirate = pirates?.reduce((acc, pirate) => {
        const isMinPower = pirate.power >= pirateMinPower;
        const isMaxPower = pirate.power <= pirateMaxPower;
        const isMostPowerful = pirate.power > (acc?.power ?? 0);

        if (isMinPower && isMaxPower && isMostPowerful) {
            return pirate;
        }
        return acc;
    }, null);

    if (!suitablePirate) {
        return {
            isSend: false,
        };
    }

    pirates = pirates.filter(({ fleetId }) => fleetId !== suitablePirate.fleetId);

    const ships = [];

    if (suitablePirate.power <= 450) {
        ships.push([PANKOR.id, pankorMinCount]);
        ships.push([PRODUCER.id, producerMinCount]);
    } else if (pankorsInPlanet > pankorMinCount && producersInPlanet > producersInPlanet) {
        ships.push([PANKOR.id, pankorsInPlanet]);
        ships.push([PRODUCER.id, producersInPlanet]);
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

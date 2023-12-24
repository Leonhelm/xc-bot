import { PANKOR, PRODUCER } from "../constants.js";
import { makeRequestJson } from "../utils/makeRequest.js";
import { randomInteger } from "../utils/random.js";
import { sendFleetTimeout } from "../utils/sendFleet.js";

const radius = 1;
const galaxyDeviation = randomInteger(-3, 3);
const systemDeviation = randomInteger(-3, 3);
const pirateMinPower = 50;
const pirateMaxPower = 1390;
const pankorMinCount = 1;
const producerMinCount = 20;
const sentFleetIds = [];

const getCheckedСoordinates = (planet) => {
    const { galaxy, system } = planet;
    const coordinates = [];
    const startGalaxy = parseInt(galaxy) + galaxyDeviation;
    const startSystem = parseInt(system) + systemDeviation;

    for (let galaxy = startGalaxy - radius; galaxy <= startGalaxy + radius; galaxy++) {
        for (let system = startSystem - radius; system <= startSystem + radius; system++) {
            coordinates.push([galaxy, system])
        }
    }

    return coordinates;
}

const filledPlanets = Array(9).fill(null).map((_val, key) => key + 1);

const getPirates = async (planet) => {
    try {
        const checkedСoordinates = getCheckedСoordinates(planet);
        const coordinatesInfo = [];

        for (const coordinate of checkedСoordinates) {
            const [galaxy, system] = coordinate;

            const response = await Promise.all(filledPlanets.map((planet) => (
                makeRequestJson('/fleet/send/info/', {
                    body: `fleet_id=0&query_planet_id=0&galaxy=${galaxy}&system=${system}&planet=${planet}&type=1`,
                    method: "POST",
                })
            )));

            coordinatesInfo.push(...response.map((info, key) => {
                return {
                    info,
                    galaxy,
                    system,
                    planet: key + 1,
                }
            }));
        }

        const pirates = coordinatesInfo.map(({ info, galaxy, system, planet }) => {
            let isSinglePirat = true;

            info?.objects?.forEach((object) => {
                const isFleet = object?.visual?.includes('fleet-destination-object_fleet');
                const isPirat = object?.visual?.includes('☠');

                if (isFleet && !isPirat) {
                    isSinglePirat = false;
                }
            });

            if (!isSinglePirat) {
                return [];
            }

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
                    galaxy,
                    system,
                    planet,
                    fleetId,
                };
            }).filter(Boolean)?.[0]
        }).filter(Boolean);

        return pirates ?? []
    } catch {
        return [];
    }
}

// Ищем пирата и отправляем флот в миссию "Переработка" на координаты с пиратом
export const pirateRecycling = async (planet) => {
    const { fleet } = planet;
    const pankorsInPlanet = fleet.find(f => f.id === PANKOR.id)?.count;
    const producersInPlanet = fleet.find(f => f.id === PRODUCER.id)?.count;

    if (pankorsInPlanet < pankorMinCount || producersInPlanet < producerMinCount) {
        return {
            isSend: false,
        }
    }

    const pirates = await getPirates(planet);

    const suitablePirate = pirates?.reduce((acc, pirate) => {
        if (sentFleetIds.includes(pirate.fleetId)) {
            return acc;
        }

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

    const ships = new Map();

    if (suitablePirate.power < 400) {
        ships.set(PANKOR.id, pankorMinCount);
        ships.set(PRODUCER.id, producerMinCount);
    } else if (pankorsInPlanet > 2) {
        if (suitablePirate.power < 800) {
            ships.set(PANKOR.id, 2);
            ships.set(PRODUCER.id, producersInPlanet);
        } else if (pankorsInPlanet > 2) {
            ships.set(PANKOR.id, pankorsInPlanet);
            ships.set(PRODUCER.id, producersInPlanet);
        }
    }

    if (ships.size === 0) {
        return {
            isSend: false,
        };
    }

    const responsePankor = await makeRequestJson("/fleet/send/", {
        body: `ship%5B${PANKOR.id}%5D=${ships.get(PANKOR.id)}&target_user=&method=get&use_portal=false&metal=0&crystal=0&deuterium=0&galaxy=${suitablePirate.galaxy}&system=${suitablePirate.system}&planet=${suitablePirate.planet}&planettype=4&planetId=0&mission=1&holding=0&hyd=0&speed=100&fleet_group=0&fid=0&targetFleetId=${suitablePirate.fleetId}&fleet_resource_priority=0&rec-auto-return=1&aggression=1&battle_begin_alarm=0&count=0&silent=0`,
        method: "POST",
    });
    const isSend = !responsePankor?.error;

    if (isSend) {
        sentFleetIds.push(suitablePirate.fleetId);

        await sendFleetTimeout();

        await makeRequestJson("/fleet/send/", {
            body: `ship%5B${PRODUCER.id}%5D=${ships.get(PRODUCER.id)}&target_user=&method=get&use_portal=false&metal=0&crystal=0&deuterium=0&galaxy=${suitablePirate.galaxy}&system=${suitablePirate.system}&planet=${suitablePirate.planet}&planettype=4&planetId=0&mission=8&holding=2&hyd=0&speed=60&fleet_group=0&fid=0&targetFleetId=${suitablePirate.fleetId}&fleet_resource_priority=0&rec-auto-return=1&aggression=1&battle_begin_alarm=0&count=0&silent=0`,
            method: "POST",
        });
    }

    return { isSend };
}

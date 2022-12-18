import { CHECKED_СOORDINATES_COUNT, PANKOR } from "../constants.js";
import { getRandom } from "../utils/getRandom.js";
import { makeRequestJson } from "../utils/makeRequest.js";

const getCheckedСoordinates = (count, galaxy) => {
    const arr = [];

    while (arr.length < count) {
        const galaxyChecked = getRandom(+galaxy - 1, +galaxy + 1);
        const systemChecked = getRandom(1, 9);
        const planetChecked = getRandom(1, 9);
        const coordinates = JSON.stringify([galaxyChecked, systemChecked, planetChecked])

        if (!arr.includes(coordinates)) {
            arr.push(coordinates)
        }
    }

    return arr.map(JSON.parse)
}

const getPirates = async (galaxy) => {
    const checkedСoordinates = getCheckedСoordinates(CHECKED_СOORDINATES_COUNT, galaxy);

    const coordinatesInfo = await Promise.all(checkedСoordinates.map(([gal, sys, plan]) => makeRequestJson('/fleet/send/info/', {
        body: `fleet_id=0&query_planet_id=0&galaxy=${gal}&system=${sys}&planet=${plan}&type=1`,
        method: "POST",
    })))

    const pirates = coordinatesInfo.map((info) => {
        return info?.objects.map(object => {
            if (!object?.isSabAttack || !object?.fleetIds?.length === 1) {
                return false;
            }

            // const pirat = 
        }).filter(Boolean)
    }).filter(Boolean)

    return pirates
}

// Ищем пирата и отправляем флот в миссию "Переработка" на координаты с пиратом
export const pirateRecycling = async (planet) => {
    const { galaxy } = planet;

    // сначала проверить наличие на планете панкоров и добытчиков

    const pirates = await getPirates(galaxy);

    console.log(pirates)

    return true
}
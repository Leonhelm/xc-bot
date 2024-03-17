import { makeRequestText } from "../utils/makeRequest.js";
import { randomSortArray } from "../utils/random.js";

const maxCreateSlots = 5;
const buildingWhiteListIds = [51, 52, 53, 54, 55, 56, 57, 58, 65, 68, 70];

const create = async (buildingsPage, buildTokens) => {
    const buildingIds = [];

    buildingsPage.split('<div class="planetbuilding_building"').slice(1).forEach((rawData) => {
        const buildingRaw = rawData.split('</video>').at(0);
        const isUpgrade = buildingRaw.includes('class="planetbuilding_item upgrade"');

        if (!isUpgrade) {
            return;
        }

        const buildingId = +buildingRaw.split('data-id="').at(1).split('"').at(0);

        if (!Number.isNaN(buildingId) && buildingWhiteListIds.includes(buildingId)) {
            buildingIds.push(buildingId);
        }
    });

    if (buildingIds.length <= 0) {
        return false;
    }

    const buildingId = randomSortArray(buildingIds).at(0);
    const token = buildTokens[buildingId];

    if (!token) {
        return false;
    }

    const formData = new FormData();
    formData.append('id', buildingId);
    formData.append('token', token);
    formData.append('cmd', 'insert');

    try {
        await makeRequestText('/buildings/', {
            body: formData,
            method: 'POST'
        });
        return true;
    } catch {
        return false;
    }
}

// Выращиваем здания на планете
export const createPlanet = async (buildingsPage, buildTokens) => {
    let isCreate = await create(buildingsPage, buildTokens);

    if (!isCreate) {
        return;
    }

    for (let count = 1; count < maxCreateSlots; count++) {
        const buildingsPageNew = await makeRequestText(`/buildings`);

        isCreate = await create(buildingsPageNew, buildTokens);

        if (!isCreate) {
            break;
        }
    }
}

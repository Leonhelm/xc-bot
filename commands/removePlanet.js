import { makeRequestText } from "../utils/makeRequest.js";
import { randomSortArray } from "../utils/random.js";

const maxRemoveSlots = 5;
const removeBlackListIds = [62];

// Утилизируем здания на планете
export const removePlanet = async (buildingsPage, buildTokens) => {
    let removeIds = [];

    buildingsPage.split('<div class="planetbuilding_building"').slice(1).forEach((rawData) => {
        const buildingRaw = rawData.split('</video>').at(0);
        const isRemove = buildingRaw.includes('poster="/images/buildings/animations/building_process_zerg.webp"');

        if (isRemove) {
            return;
        }

        const buildingId = +buildingRaw.split('data-id="').at(1).split('"').at(0);

        if (!Number.isNaN(buildingId) && !removeBlackListIds.includes(buildingId)) {
            removeIds.push(buildingId);
        }
    });

    removeIds = randomSortArray(removeIds);

    for (let i = 0; i < maxRemoveSlots; i++) {
        const removeId = removeIds[i];
        const token = buildTokens[removeId];

        if (!token) {
            continue;
        }

        const formData = new FormData();
        formData.append('id', removeId);
        formData.append('token', token);
        formData.append('cmd', 'destroy');

        await makeRequestText('/buildings/', {
            body: formData,
            method: 'POST'
        });
    }

}
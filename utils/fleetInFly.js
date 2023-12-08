import { USER_NAME } from "../constants.js";

export function getMyFleetInFly(page) {
    const fleetInFly = getFleetInFly(page);
    const myFleetInFly = fleetInFly.reduce((acc, { json: { fleet } }) => {
        if (fleet.user !== USER_NAME) {
            return acc;
        }

        acc.push(fleet);

        return acc;
    }, []);

    return myFleetInFly;
}

function getFleetInFly(page) {
    const rawFleetInFly = page
        .split(`"fleetInFlyList":`)[1]
        .split(`,"flST":`)[0];
    return JSON.parse(rawFleetInFly);
}

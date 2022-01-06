import { makeRequestJson } from "../utils/makeRequest.js";

// Строим корабли
export const createFleet = async (id, count) => {
  await makeRequestJson("/buildfleet/", {
    body: `fmenge%5B${id}%5D=${count}`,
    method: "POST",
  });
};

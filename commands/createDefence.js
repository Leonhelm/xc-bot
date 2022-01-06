import { makeRequestJson } from "../utils/makeRequest.js";

// Строим оборону
export const createDefence = async (id, count) => {
  await makeRequestJson("/defense/", {
    body: `fmenge%5B${id}%5D=${count}`,
    method: "POST",
  });
};

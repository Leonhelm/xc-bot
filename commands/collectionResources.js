import { makeRequestText, makeRequestJson } from "../utils/makeRequest.js";

// Собираем ресурсы с поверхности планеты planetId
export const collectionResources = async (planetId) => {
  const buildingsPage = await makeRequestText(`/buildings?cp=${planetId}&re=0`);

  const resourcesList = buildingsPage
    .split('<div data-token="')
    .slice(1)
    .map((content) => {
      const token = content.split('"')[0];
      const id = content.split('data-id="')[1].split('"')[0];
      return { token, id };
    });

  const resourcesRequests = async (index) => {
    const resource = resourcesList[index];

    if (!resource) {
      return;
    }

    const { token, id } = resource;

    await makeRequestJson("/ajax/buildings/resources/", {
      body: `id=${id}&token=${token}&planetID=${planetId}`,
      method: "POST",
    });
    await resourcesRequests(index + 1);
  };

  await resourcesRequests(0);

  return buildingsPage;
};

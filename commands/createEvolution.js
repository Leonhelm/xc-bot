import { makeRequestText, makeRequest } from "../utils/makeRequest.js";
import { getRandom } from "../utils/getRandom.js";

const dataPostReduce = (acc, data) => {
  const [name, value] = data.split("=");
  acc[name] = value;
  return acc;
};

const resourcesReduceCreator = (block) => (acc, resource) => {
  const valueString = block
    ?.split(`<span class="res-icon ${resource}">`)?.[1]
    ?.split("</span>")?.[0];
  const value = +valueString ?? 0;
  acc[resource] = Number.isNaN(value) ? 0 : value;
  return acc;
};

const researchListReduce = (acc, content) => {
  const block = content.split("</a>")[0];
  const dataPostBody = block?.split?.('data-post="')?.[1]?.split?.('"')?.[0];

  if (!dataPostBody) {
    return acc;
  }

  const dataPost = dataPostBody.split("&").reduce(dataPostReduce, {});
  const resources = ["metal", "crystal", "deuterium"].reduce(
    resourcesReduceCreator(block),
    {}
  );
  acc.push({ ...resources, dataPost });
  return acc;
};

// Запускает случайную доступную эволюцию
export const createEvolution = async (planet) => {
  const researchPage = await makeRequestText("/research/");
  const researchList = researchPage
    .split('<div class="research-tech__allow">')
    .slice(1)
    .reduce(researchListReduce, []);

  if (!researchList.length) {
    return;
  }

  const formData = new FormData();
  const { metal, crystal, deuterium, dataPost } =
    researchList[getRandom(0, researchList.length - 1)];

  Object.entries(dataPost).forEach(([name, value]) => {
    formData.append(name, value);
  });

  await makeRequest("/research/", {
    method: "POST",
    body: formData,
  });

  planet.metal -= metal;
  planet.crystal -= crystal;
  planet.deuterium -= deuterium;
};

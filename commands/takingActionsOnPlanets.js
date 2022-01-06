import { makeRequestText } from "../utils/makeRequest.js";

const getPlanetsData = async () => {
  const imperiumPage = await makeRequestText("/imperium/");

  const planetsData = imperiumPage
    .split('class="planet-bg"')
    .slice(1)
    .map((content, index) => {
      const planetId = +content.split("/overview/?cp=")[1].split("&re=0")[0];

      return {
        id: planetId,
        type: index === 0 ? "capital" : "colony",
        metal: 0,
        crystal: 0,
        deuterium: 0,
        fleet: [],
        defense: [],
      };
    });

  ["metal", "crystal", "deuterium"].forEach((recourceName) => {
    imperiumPage
      .split(`<td class="${recourceName} ">`)
      .slice(1)
      .forEach((content, index) => {
        const recourceCount = +content
          .split("<br>")[0]
          .replace("&nbsp;", "")
          .trim();

        planetsData[index] = {
          ...planetsData[index],
          [recourceName]: recourceCount,
        };
      });
  });

  [
    { sign: "Флот", fieldName: "fleet" },
    { sign: "Оборона", fieldName: "defense" },
  ].forEach(({ sign, fieldName }) => {
    const entities = [];
    const entitiesTable = imperiumPage
      .split(`<span>${sign}</span><div class="spoiler-icon"></div>`)[1]
      .split('<div class="both"></div>')[0];

    entitiesTable
      .split('<td><a href="/infos/?gid=')
      .slice(1)
      .forEach((content) => {
        const id = +content.split('"')[0];
        const name = content.split(`data-infos="${id}">`)[1].split("</a>")[0];

        entities.push({
          id,
          name,
        });
      });

    entitiesTable
      .split('<div class="overflow_table">')[1]
      .split(`<tr>`)
      .slice(1)
      .forEach((trContent, trIndex) => {
        const tr = trContent.split("</tr>")[0];

        tr.split(`<td>`)
          .slice(1)
          .forEach((tdContent, tdIndex) => {
            const count = +tdContent.split("</td>")[0];

            if (Number.isNaN(count) || count <= 0) {
              return;
            }

            const planet = planetsData[tdIndex];
            const entityData = {
              ...entities[trIndex],
              count,
            };

            planet[fieldName] = [...planet[fieldName], entityData];
          });
      });
  });

  return planetsData;
};

// Выполняем действие callbackAction на каждой из планет империи
export const takingActionsOnPlanets = async (callbackAction) => {
  const planetsData = await getPlanetsData();

  const takingAction = async (index) => {
    const planet = planetsData[index];

    if (!planet) {
      return;
    }

    await callbackAction(planet);
    await takingAction(index + 1);
  };

  await takingAction(0);
};

import {
  TOKEN,
  USER_NAME,
  GAME_URL,
  MAX_CAPITAL_METAL,
  MAX_COLONY_RESOURCES,
  CAPITAL,
  OVERLORD,
  QUEEN,
  FLAMING_WORM,
  MOLE,
  NEEDLE_TREE,
  HYDRALISK,
} from "./constants.js";

await (async () => {
  await takingActionsOnPlanets(async (planet) => {
    const { type, id, metal } = planet;
    const buildingsPage = await collectionResources(id);

    if (type === "colony") {
      await sendingResourcesToCapital(planet);
      return;
    }

    if (type === "capital") {
      await sendOnExpedition(planet, buildingsPage);

      // if (metal >= MAX_CAPITAL_METAL) {
      await createDefence(planet);
      // }
    }
  });

  // Помимо сбора премиум ресурсов также возвращаем фокус на столицу в конце прохода по всем планетам
  await collectionPremiumResources(CAPITAL.id);
})();

// Отправка ресурсов с колонии в столицу
async function sendingResourcesToCapital(planet) {
  const { metal, crystal, deuterium } = planet;

  if (
    metal < MAX_COLONY_RESOURCES &&
    crystal < MAX_COLONY_RESOURCES &&
    deuterium < MAX_COLONY_RESOURCES
  ) {
    return;
  }

  const overlordsCount = Math.ceil(
    (metal + crystal + deuterium) / OVERLORD.capacity
  );
  await makeRequestJson("/fleet/send/", {
    body: `ship%5B${OVERLORD.id}%5D=${overlordsCount}&target_user=&method=get&use_portal=false&metal=${metal}&crystal=${crystal}&deuterium=${deuterium}&galaxy=${CAPITAL.galaxy}&system=${CAPITAL.system}&planet=${CAPITAL.planet}&planettype=${CAPITAL.planetType}&planetId=${CAPITAL.id}&mission=3&holding=0&hyd=0&speed=10&fleet_group=0&fid=0&fleet_resource_priority=0&rec-auto-return=1&aggression=0&battle_begin_alarm=0&count=0&silent=0`,
    method: "POST",
  });
}

// Выполняем действие callbackAction на каждой из планет империи
async function takingActionsOnPlanets(callbackAction) {
  const planetsData = await getPlanetsData();

  await takingAction(0);

  async function takingAction(index) {
    const planet = planetsData[index];

    if (!planet) {
      return;
    }

    await callbackAction(planet);
    await takingAction(index + 1);
  }
}

async function getPlanetsData() {
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
}

// Собираем премиум ресурсы на нужную планету planetId
async function collectionPremiumResources(planetId) {
  const officierPage = await makeRequestText(`/officier?cp=${planetId}&re=0`);
  const resourceIndicator = officierPage.split('data-kit="resource"')[1];
  const hasFree =
    resourceIndicator.split("<span><span>")[1].split("</span></span>")[0] ===
    "Бесплатно";

  if (!hasFree) {
    return;
  }

  const token = resourceIndicator.split('data-token="')[1].split('"')[0];

  await makeRequestJson("/officier/", {
    body: `token=${token}&officer_id=resource&pay=0&type=kit`,
    method: "POST",
  });
}

// Собираем ресурсы с поверхности планеты planetId
async function collectionResources(planetId) {
  const buildingsPage = await makeRequestText(`/buildings?cp=${planetId}&re=0`);

  const resourcesList = buildingsPage
    .split('<div data-token="')
    .slice(1)
    .map((content) => {
      const token = content.split('"')[0];
      const id = content.split('data-id="')[1].split('"')[0];
      return { token, id };
    });

  await resourcesRequests(0);

  async function resourcesRequests(index) {
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
  }

  return buildingsPage;
}

// Создаём оборону на планете
async function createDefence(planet) {
  const { fleet } = planet;

  const fleetToId = new Map(
    fleet.map((structure) => [structure.id, structure])
  );
  const [flamingWormCount, hydraliskCount, moleCount, needleTreeCount] = [
    FLAMING_WORM,
    HYDRALISK,
    MOLE,
    NEEDLE_TREE,
  ].map((structure) => fleetToId.get(structure.id)?.count ?? 0);

  const isNeedCreateFlamingWorm = flamingWormCount < 127;
  const isNeedCreateHydralisk = hydraliskCount < 100;
  const isNeedCreateMole =
    !isNeedCreateHydralisk && moleCount <= needleTreeCount;
  const isNeedCreateNeedleTree = !isNeedCreateMole;

  const spendResources = async (structure) => {
    const calcResult = calcToCreateStructure(planet, structure);

    if (calcResult.count > 0) {
      await createStructure(structure.id, calcResult.count);
      planet.metal = calcResult.metal;
      planet.crystal = calcResult.crystal;
      planet.deuterium = calcResult.deuterium;
    }
  };

  if (isNeedCreateFlamingWorm) {
    await spendResources(FLAMING_WORM);
  }

  if (isNeedCreateHydralisk) {
    await spendResources(HYDRALISK);
  }

  if (isNeedCreateMole) {
    await spendResources(MOLE);
  }

  if (isNeedCreateNeedleTree) {
    await spendResources(NEEDLE_TREE);
  }
}

// Создаём всё необходимое для экспедиции или отправляем экспедицию
async function sendOnExpedition(planet, page) {
  const fleetInFly = page
    .split("window.jsConfig = ")[1]
    .split("window.iFaceToggles = ")[0];
  const isQueenInExpedition = fleetInFly.includes("Экспедиция");

  if (!isQueenInExpedition) {
    const isQueenInReserve = planet.fleet.some(
      (ship) => ship.id === QUEEN.id && ship.count > 0
    );

    if (isQueenInReserve) {
      await sendQueenOnExpedition();
    } else {
      await createStructure(QUEEN.id, 1);
      planet.metal -= QUEEN.metal;
      planet.crystal -= QUEEN.crystal;
      planet.deuterium -= QUEEN.deuterium;
    }
  }
}

// Отправляем королеву в экспедицию
async function sendQueenOnExpedition() {
  await makeRequestJson("/fleet/send/", {
    body: `ship%5B${QUEEN.id}%5D=1&target_user=&method=get&use_portal=false&metal=0&crystal=0&deuterium=0&galaxy=${CAPITAL.galaxy}&system=${CAPITAL.system}&planet=10&planettype=1&planetId=0&mission=15&holding=24&hyd=0&speed=10&fleet_group=0&fid=0&fleet_resource_priority=0&rec-auto-return=1&aggression=0&battle_begin_alarm=0&count=0&silent=0`,
    method: "POST",
  });
}

// Строим какую-либо структуру: корабль, оборону
async function createStructure(id, count) {
  await makeRequestJson("/buildfleet/", {
    body: `fmenge%5B${id}%5D=${count}`,
    method: "POST",
  });
}

function calcToCreateStructure(planet, structure) {
  const resources = new Map(
    ["metal", "crystal", "deuterium"].map((resourceName) => {
      let count = 0;
      let rest = planet[resourceName];

      if (planet[resourceName] > 0 && structure[resourceName] > 0) {
        count = Math.floor(planet[resourceName] / structure[resourceName]);
      }

      if (count > 0) {
        rest = Math.floor(planet[resourceName] % count);
      }

      return [resourceName, { count, rest }];
    })
  );
  return {
    count: Math.min(...[...resources].map(([, resource]) => resource.count)),
    metal: resources.get("metal").rest,
    crystal: resources.get("crystal").rest,
    deuterium: resources.get("deuterium").rest,
  };
}

async function makeRequestText(url, options) {
  const response = await makeRequest(url, options);
  return response.text();
}

async function makeRequestJson(url, options) {
  await makeRequest(url, {
    ...options,
    headers: {
      ...options?.headers,
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  });
}

function makeRequest(url, options) {
  return fetch(`${GAME_URL}${url}`, {
    ...options,
    referrer: GAME_URL,
    referrerPolicy: "strict-origin-when-cross-origin",
    mode: "cors",
    credentials: "include",
    headers: {
      ...options?.headers,
      cookie: `Xcraft=${TOKEN}; x-user=${USER_NAME}`,
    },
  });
}

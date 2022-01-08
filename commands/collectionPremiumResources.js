import { makeRequestText, makeRequestJson } from "../utils/makeRequest.js";

// Собираем премиум ресурсы на нужную планету planetId
// и фокусируем глобальное состояние игры на planetId
export const collectionPremiumResources = async (planetId) => {
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
};

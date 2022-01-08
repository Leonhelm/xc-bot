import { makeRequestText, makeRequestJson } from "../utils/makeRequest.js";

// Собираем премиум ресурсы на текущую планету
export const collectionPremiumResources = async () => {
  const officierPage = await makeRequestText(`/officier/`);
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

import { GAME_URL, TOKEN, USER_NAME } from "../constants.js";

const makeRequest = (url, options) => {
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
};

export const makeRequestText = async (url, options) => {
  const response = await makeRequest(url, options);
  return response.text();
};

export const makeRequestJson = async (url, options) => {
  await makeRequest(url, {
    ...options,
    headers: {
      ...options?.headers,
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
  });
};

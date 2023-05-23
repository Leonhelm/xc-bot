import { makeRequestText, makeRequestJson } from "../utils/makeRequest.js";

// Покупаем хайды на бирже за ресурсы
export const buyHydarian = async (planet) => {
    const offers = [];

    for (let pagination = 1; pagination <= 10; pagination++) {
        const dendrariumPage = await makeRequestText(`/dendrarium/?f[0][key]=hydarian&f[0][as]=sell&f[0][from]=0&f[0][to]=0&pagination=${pagination}`);
        const rawOffers = dendrariumPage.split('<span class="short" data-help="Кристаллы Хайдариан:').slice(1);

        if (rawOffers.length < 50) {
            break;
        }

        offers.push(...rawOffers.map(rawOffer => {
            const isOverflow = rawOffer.includes('overflow">');

            if (isOverflow) {
                return;
            }

            const hydarian = +rawOffer.split('">').at(0).trim();
            const commission = +rawOffer.split("<span class='hydarian res-icon'>").at(1).split("</span>").at(0).trim();
            const benefit = hydarian / commission;

            if (isNaN(benefit) || benefit < 5) {
                return;
            }

            const token = +rawOffer.split('data-post-id="').at(1).split('"').at(0).trim();

            if (isNaN(token)) {
                return;
            }

            return { benefit, token };
        }).filter(Boolean));
    }

    if (!offers.length) {
        return;
    }

    const bestOffer = Math.max(...offers.map(offer => offer.benefit));
    const { token } = offers.find(offer => offer.benefit === bestOffer) || {};

    if (token) {
        await makeRequestJson("/dendrarium/buy/", {
            body: `pid=${token}&bwd=0`,
            method: "POST",
        });
    }
}

import { makeRequestText } from "../utils/makeRequest.js";
import { MIN_HYDARIAN_BUY } from "../constants.js";

// Покупаем хайды на бирже за ресурсы
export const buyHydarian = async (planet) => {
    const offers = [];

    for (let pagination = 1; pagination <= 10; pagination++) {
        const dendrariumPage = await makeRequestText(`/dendrarium/?f[0][key]=hydarian&f[0][as]=sell&f[0][from]=0&f[0][to]=0&pagination=${pagination}`);
        const rawOffers = dendrariumPage.split('<span class="short" data-help="Кристаллы Хайдариан:').slice(1);

        if (!rawOffers.length) {
            break;
        }

        offers.push(...rawOffers.map(rawOffer => {
            const isOverflow = rawOffer.includes('overflow">');

            if (isOverflow) {
                return;
            }

            const hydarian = +rawOffer.split('">').at(0).trim();
            const commission = +rawOffer.split("<span class='hydarian res-icon'>").at(1).split("</span>").at(0).trim();

            return {
                hydarian,
                commission,
                benefit: hydarian / commission,
            };
        }).filter(Boolean));
    }

    console.log(offers)
}

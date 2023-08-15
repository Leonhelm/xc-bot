setInterval(async () => {
    if (document.querySelector('.planetbuilding_item.upgrade') == null) {
        return;
    }

    const elems = document.querySelectorAll('.planetbuilding_building');
    let elem = null;

    elems.forEach(el => {
        if (el.querySelector('[poster="/images/buildings/animations/building_process_zerg.webp"]') == null) {
            elem = el;
        }
    });

    if (elem == null) {
        return;
    }

    elem.click();

    await new Promise((r) => setTimeout(r, 300));

    document.querySelector(`.js-confirmcancel-${elem.dataset.id}[data-title="Отмена строительства"]`).click();

    await new Promise((r) => setTimeout(r, 300));

    document.querySelector(`[class="button btn-default btn-blue"][href="#"]`).click();

    console.log('REMOVE', elem.dataset.id)
}, 5000);

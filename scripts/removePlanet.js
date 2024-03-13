setInterval(async () => {
    if (document.querySelectorAll('[poster="/images/buildings/animations/building_process_zerg.webp"]').length === 5) {
        return;
    }

    let elem = null;
    const elems = document.querySelectorAll('.planetbuilding_building');

    elems.forEach(el => {
        if (el.querySelector('[poster="/images/buildings/animations/building_process_zerg.webp"]') == null && el.dataset.id !== '62') {
            elem = el;
        }
    });

    if (elem == null) {
        return;
    }

    elem.querySelector('.animation_wall').click();

    await new Promise((r) => setTimeout(r, 300));

    document.querySelector(`.js-confirmcancel-${elem.dataset.id}[data-title="Отмена строительства"]`).click();

    await new Promise((r) => setTimeout(r, 300));

    document.querySelector(`[class="button btn-default btn-blue"][href="#"]`).click();

    console.log('REMOVE', elem.dataset.id)
}, 5000);

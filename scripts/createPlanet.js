setInterval(async () => {
    if (document.querySelector('.planetbuilding_item.upgrade') == null) {
        return;
    }

    const elems = document.querySelectorAll('.planetbuilding_building');
    let elem = null;

    elems.forEach(el => {
        if (el.querySelector('.upgrade') != null && !['62', '57', '54', '56'].includes(el.dataset.id)) {
            elem = el;
        }
    });

    if (elem == null) {
        return;
    }

    elem.click();

    await new Promise((r) => setTimeout(r, 300));

    document.querySelector(`a[data-buildid="${elem.dataset.id}"][href="/buildings/"]`).click();

    console.log('BUILD', elem.dataset.id)
}, 5000);
[...document.querySelectorAll('.grid')].forEach(grid => {
    const griddie = new Griddie(grid, {
        masonry: true
    });

    window.griddie = griddie;

    [...document.querySelectorAll('nav li a')].forEach(link =>
        link.addEventListener('click', e => {
            e.preventDefault();

            if (link.matches('.gutter')) {
                griddie.animate(() => {
                    document.getElementsByClassName('grid')[0].classList.toggle('collapse');
                });

                return;
            }

            if (link.matches('.selected')) {
                return;
            }

            [...link.closest('nav').querySelectorAll('li > a')].forEach(sibling => sibling.classList.remove('selected'));
            link.classList.add('selected');

            if (link.matches('[data-filter]')) {
                griddie.filter(link.dataset.filter);

                return;
            }

            if (link.matches('.masonry-layout')) {
                griddie.animate(() => {
                    griddie.options = { ...griddie.options, ...{ masonry: true } };
                    grid.dataset.layout = 'masonry';
                });

                return;
            }

            if (link.matches('.block-layout')) {
                griddie.animate(() => {
                    griddie.options = { ...griddie.options, ...{ masonry: false } };
                    grid.dataset.layout = 'block';
                });

                return;
            }

            if (link.matches('.flex-layout')) {
                griddie.animate(() => {
                    griddie.options = { ...griddie.options, ...{ masonry: false } };
                    grid.dataset.layout = 'flex';
                });

                return;
            }

            if (link.matches('.float-layout')) {
                griddie.animate(() => {
                    griddie.options = { ...griddie.options, ...{ masonry: false } };
                    grid.dataset.layout = 'float';
                });

                return;
            }

            if (link.matches('.inline-block-layout')) {
                griddie.animate(() => {
                    griddie.options = { ...griddie.options, ...{ masonry: false } };
                    grid.dataset.layout = 'inline-block';
                });

                return;
            }
        })
    );
});

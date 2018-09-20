[...document.querySelectorAll('.grid')].forEach(grid => {
    const griddie = new Griddie(grid, {
        masonry: grid.classList.contains('masonry')
    });

    [...document.querySelectorAll('nav li a')].forEach(link =>
        link.addEventListener('click', e => {
            e.preventDefault();

            if (link.matches('[data-filter]')) {
                griddie.filter(link.dataset.filter);

                return;
            }

            if (link.matches('#gutterToggler')) {
                griddie.animate(() => {
                    document.getElementsByClassName('grid')[0].classList.toggle('collapse');
                });

                return;
            }

            if (link.matches('#masonryToggler')) {
                griddie.animate(() => {
                    griddie.options = { ...griddie.options, ...{ masonry: !griddie.options.masonry } };
                    grid.classList.toggle('standard', !grid.classList.toggle('masonry'));
                });

                return;
            }
        })
    );
});

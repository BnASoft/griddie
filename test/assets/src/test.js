[...document.querySelectorAll('.grid')].forEach(grid => {
    const griddie = new Griddie({
        element: grid,
        masonry: grid.classList.contains('masonry')
    });

    [...document.getElementById('nav').querySelectorAll('a')].forEach(link => link.addEventListener('click', () => griddie.filter(link.dataset.filter)));

    document.getElementById('gutterToggler').addEventListener('click', () =>
        griddie.animate(() => {
            document.getElementsByClassName('grid')[0].classList.toggle('collapse');
        })
    );

    document.getElementById('masonryToggler').addEventListener('click', () =>
        griddie.animate(() => {
            document.getElementsByClassName('grid')[0].classList.toggle('masonry');
        })
    );
});

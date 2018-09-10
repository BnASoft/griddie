'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

[].concat(_toConsumableArray(document.querySelectorAll('.grid'))).forEach(function (grid) {
    var griddie = new Griddie({
        element: grid,
        masonry: grid.classList.contains('masonry')
    });

    [].concat(_toConsumableArray(document.getElementById('nav').querySelectorAll('a'))).forEach(function (link) {
        return link.addEventListener('click', function () {
            return griddie.filter(link.dataset.filter);
        });
    });

    document.getElementById('gutterToggler').addEventListener('click', function () {
        return griddie.animate(function () {
            document.getElementsByClassName('grid')[0].classList.toggle('collapse');
        });
    });

    document.getElementById('masonryToggler').addEventListener('click', function () {
        return griddie.animate(function () {
            document.getElementsByClassName('grid')[0].classList.toggle('masonry');
        });
    });
});
//# sourceMappingURL=test.js.map

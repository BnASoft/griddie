'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

[].concat(_toConsumableArray(document.querySelectorAll('.grid'))).forEach(function (grid) {
    var griddie = new Griddie(grid, {
        masonry: grid.classList.contains('masonry')
    });

    [].concat(_toConsumableArray(document.querySelectorAll('nav li a'))).forEach(function (link) {
        return link.addEventListener('click', function (e) {
            e.preventDefault();

            if (link.matches('[data-filter]')) {
                griddie.filter(link.dataset.filter);

                return;
            }

            if (link.matches('#gutterToggler')) {
                griddie.animate(function () {
                    document.getElementsByClassName('grid')[0].classList.toggle('collapse');
                });

                return;
            }

            if (link.matches('#masonryToggler')) {
                griddie.animate(function () {
                    griddie.options = _extends({}, griddie.options, { masonry: !griddie.options.masonry });
                    grid.classList.toggle('standard', !grid.classList.toggle('masonry'));
                });

                return;
            }
        });
    });
});
//# sourceMappingURL=test.js.map

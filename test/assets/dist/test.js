'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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
            griddie.options = _extends({}, griddie.options, { masonry: !griddie.options.masonry });
        });
    });
});
//# sourceMappingURL=test.js.map

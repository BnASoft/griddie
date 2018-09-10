'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define('Griddie', factory) : global.Griddie = factory();
})(this, function () {
    'use strict';

    var isPromise = function isPromise(object) {
        return !!object && ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' || typeof object === 'function') && typeof object.then === 'function';
    };

    var Griddie = function () {
        function Griddie(options) {
            _classCallCheck(this, Griddie);

            this._options = {};

            this._animationTimeout = null; // TODO: replace with toolbox.timer ...
            this._filterTimeout = null; // TODO: replace with toolbox.timer ...

            this.options = options;
            this.layout();
            window.addEventListener('resize', this.layout);
        }

        _createClass(Griddie, [{
            key: 'animate',
            value: function animate() {
                var _this = this;

                var layoutChanges = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                var animation = new Promise(function (resolve, reject) {
                    var callback = function callback() {
                        _this.clear();
                        _this.layout(0);
                        _this.store(1);
                        _this.transform(0);

                        requestAnimationFrame(function () {
                            _this._options.element.style.transition = 'height ' + _this._options.transformTimingCSS + 's ease';
                            [].concat(_toConsumableArray(_this._options.items)).filter(function (item) {
                                return item.style.display !== 'none';
                            }).forEach(function (item) {
                                var transition = 'transform ' + _this._options.transformTimingCSS + 's ease';
                                if (_this.options.animateWidthAndHeight) {
                                    transition += ', width ' + _this._options.transformTimingCSS + 's ease, height ' + _this._options.transformTimingCSS + 's ease';
                                }

                                item.style.transition = transition;
                            });

                            requestAnimationFrame(function () {
                                return _this.transform(1);
                            });

                            clearTimeout(_this._animationTimeout);
                            _this._animationTimeout = setTimeout(function () {
                                _this.clear();
                                resolve();
                            }, _this.options.transformTiming);
                        });
                    };

                    _this.clear();
                    _this.store(0);
                    _this.transform(0);

                    var changes = layoutChanges();

                    if (isPromise(changes)) {
                        changes.then(function () {
                            return callback();
                        });
                    } else {
                        callback();
                    }
                });

                return animation;
            }
        }, {
            key: 'filter',
            value: function filter() {
                var _this2 = this;

                var _filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '*';

                var matched = this._options.items.filter(function (x) {
                    return x.matches(_filter);
                });
                var unmatched = this._options.items.filter(function (x) {
                    return !x.matches(_filter);
                });
                var hiddenMatched = matched.filter(function (x) {
                    return x.style.display === 'none';
                });
                var makeRoomBeforeFade = matched.length !== hiddenMatched.length;
                var prepareFade = function prepareFade() {
                    _this2._options.items.forEach(function (item) {
                        item.style.transition = 'opacity ' + _this2._options.opacityTimingCSS + 's ease';
                    });
                };
                var fade = function fade() {
                    matched.forEach(function (item) {
                        item.style.opacity = 1;
                    });

                    unmatched.forEach(function (item) {
                        item.style.opacity = 0;
                    });
                };
                var clearFade = function clearFade() {
                    _this2._options.items.forEach(function (item) {
                        item.style.transition = '';
                        item.style.opacity = '';
                    });

                    matched.forEach(function (item) {
                        item.style.display = '';
                    });

                    unmatched.forEach(function (item) {
                        item.style.display = 'none';
                    });
                };

                var animation = this.animate(function () {
                    var fadeAfterAnimation = new Promise(function (resolve, reject) {
                        var onFadeEnd = function onFadeEnd() {
                            _this2.store(0);
                            _this2.transform(0);
                            resolve();
                        };

                        prepareFade();

                        if (hiddenMatched.length) {
                            hiddenMatched.forEach(function (item) {
                                item.style.opacity = 0;
                            });
                        }

                        requestAnimationFrame(function () {
                            if (hiddenMatched.length) {
                                hiddenMatched.forEach(function (item) {
                                    item.style.display = '';
                                });
                            }

                            if (hiddenMatched.length && makeRoomBeforeFade) {
                                requestAnimationFrame(function () {
                                    return onFadeEnd();
                                });
                            } else if (!hiddenMatched.length || hiddenMatched.length && !makeRoomBeforeFade) {
                                requestAnimationFrame(function () {
                                    fade();

                                    clearTimeout(_this2._filterTimeout);

                                    _this2._filterTimeout = setTimeout(function () {
                                        clearFade();

                                        requestAnimationFrame(function () {
                                            return onFadeEnd();
                                        });
                                    }, _this2.options.opacityTiming);
                                });
                            }
                        });
                    });

                    return fadeAfterAnimation;
                });

                animation.then(function () {
                    if (makeRoomBeforeFade) {
                        prepareFade();

                        requestAnimationFrame(function () {
                            fade();

                            clearTimeout(_this2._filterTimeout);

                            _this2._filterTimeout = setTimeout(function () {
                                return clearFade();
                            }, _this2.options.opacityTiming);
                        });
                    }
                });
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                // TODO: do it
            }
        }, {
            key: 'refresh',
            value: function refresh() {}
            // TODO: do it


            // TODO: private

        }, {
            key: 'layout',
            value: function layout() {
                if (this.options.masonry) {
                    var rowHeight = parseInt(window.getComputedStyle(this._options.element).getPropertyValue('grid-auto-rows'));
                    var rowGap = parseInt(window.getComputedStyle(this._options.element).getPropertyValue('grid-row-gap'));

                    this._options.items.filter(function (item) {
                        return item.style.display !== 'none';
                    }).forEach(function (item) {
                        var rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
                        item.style.gridRowEnd = 'span ' + rowSpan;
                    });
                }
            }

            // TODO: private

        }, {
            key: 'clear',
            value: function clear() {
                this._options.element.style.position = '';
                this._options.element.style.width = '';
                this._options.element.style.height = '';
                this._options.element.style.transition = '';

                this._options.items.forEach(function (item) {
                    item.style.transform = '';
                    item.style.transformOrigin = '';
                    item.style.position = '';
                    item.style.transition = '';
                    item.style.width = '';
                    item.style.height = '';
                    item.style.margin = '';
                });
            }

            // TODO: private

        }, {
            key: 'store',
            value: function store() {
                var _this3 = this;

                var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

                var scroll = {
                    top: document.body.scrollTop,
                    left: document.body.scrollLeft
                };
                var gridRect = this._options.element.getBoundingClientRect();
                if (!('rect' in this._options.element)) {
                    this._options.element.rect = [];
                }
                this._options.element.rect[id] = {
                    width: gridRect.width,
                    height: gridRect.height,
                    top: gridRect.top + scroll.top,
                    left: gridRect.left + scroll.left
                };
                this._options.items.filter(function (item) {
                    return item.style.display !== 'none';
                }).forEach(function (item) {
                    if (!('rect' in item)) {
                        item.rect = [];
                    }
                    var itemRect = item.getBoundingClientRect();
                    item.rect[id] = {
                        width: itemRect.width,
                        height: itemRect.height,
                        top: itemRect.top + scroll.top - _this3._options.element.rect[id].top,
                        left: itemRect.left + scroll.left - _this3._options.element.rect[id].left,
                        scaleX: 1,
                        scaleY: 1
                    };
                    item.rect[id].top = item.rect[id].top >= 0 ? item.rect[id].top : 0;
                    item.rect[id].left = item.rect[id].left >= 0 ? item.rect[id].left : 0;
                    if (id === 1) {
                        var scaleX = item.rect[0].width / itemRect.width;
                        var scaleY = item.rect[0].height / itemRect.height;
                        if (scaleX > 0) {
                            item.rect[id].scaleX = 1 / scaleX;
                        }
                        if (scaleY > 0) {
                            item.rect[id].scaleY = 1 / scaleY;
                        }
                    }
                });
            }

            // TODO: private

        }, {
            key: 'transform',
            value: function transform() {
                var _this4 = this;

                var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

                this._options.element.style.position = 'relative';
                this._options.element.style.width = this._options.element.rect[id].width + 'px';
                this._options.element.style.height = this._options.element.rect[id].height + 'px';

                this._options.items.filter(function (item) {
                    return item.style.display !== 'none';
                }).forEach(function (item) {
                    var transform = 'translate3d(' + item.rect[id].left + 'px,' + item.rect[id].top + 'px, 0px)';

                    if (!_this4.options.animateWidthAndHeight) {
                        transform += ' scale3d(' + item.rect[id].scaleX + ', ' + item.rect[id].scaleY + ', 1)';
                    }

                    if (_this4.options.animateWidthAndHeight || id === 0) {
                        item.style.width = item.rect[id].width + 'px';
                        item.style.height = item.rect[id].height + 'px';
                    }

                    item.style.margin = 0;
                    item.style.position = 'absolute';
                    item.style.transformOrigin = '0 0 0';
                    item.style.transform = transform;
                });
            }
        }, {
            key: 'options',
            set: function set(options) {
                this._options = _extends({
                    animateWidthAndHeight: true, // TODO: single item exceptions ...
                    opacityTiming: 300,
                    transformTiming: 300,
                    masonry: false
                }, options);
                this._options.transformTimingCSS = this.options.transformTiming / 1000;
                this._options.opacityTimingCSS = this.options.opacityTiming / 1000;
                this._options.items = [].concat(_toConsumableArray(this._options.element.children));
            },
            get: function get() {
                return this._options;
            }
        }]);

        return Griddie;
    }();

    return Griddie;
});
//# sourceMappingURL=griddie.js.map

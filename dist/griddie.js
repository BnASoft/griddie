'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define('Griddie', factory) : global.Griddie = factory();
})(this, function () {
    'use strict';

    var isPromise = function isPromise(object) {
        return !!object && ((typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' || typeof object === 'function') && typeof object.then === 'function';
    };

    var userAgent = navigator.userAgent.toLowerCase();

    var vendorsPrefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];

    var MutationObserver = function () {
        for (var i = 0; i < vendorsPrefixes.length; i++) {
            if (vendorsPrefixes[i] + 'MutationObserver' in window) {
                return window[vendorsPrefixes[i] + 'MutationObserver'];
            }
        }

        return false;
    }();

    var transitionEndEventName = function () {
        var el = document.createElement('div');

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            msTransition: 'MSTransitionEnd',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return transEndEventNames[name];
            }
        }

        return false;
    }();

    var getObserverId = function getObserverId(parent, prefix) {
        return prefix + [].concat(_toConsumableArray(parent.classList)).join('') + parent.id + 'Observer';
    };

    var disconnectObserver = function disconnectObserver(parent, mode, id) {
        var observerId = getObserverId(parent, id + mode);
        if (parent[observerId]) {
            parent[observerId].disconnect();
            delete parent[observerId];
        }
    };

    var setElementTimer = function setElementTimer(element, mode, callback, time, id) {
        clearElementTimer(element, mode, id);
        element[id] = window['set' + mode](callback, time);

        var parent = element.parentElement;
        var observerId = getObserverId(parent, id + mode);
        parent[observerId] = new MutationObserver(function (e) {
            if ([].concat(_toConsumableArray(e[0].removedNodes)).some(function (el) {
                return el === element;
            })) {
                clearElementTimer(element, mode, id);
                disconnectObserver(parent, mode, id);
            }
        });
        parent[observerId].observe(parent, { childList: true });
    };

    var clearElementTimer = function clearElementTimer(element, mode, id) {
        var autoDisconnectObserver = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        window['clear' + mode](element[id]);
        delete element[id];

        var parent = element.parentElement;
        if (autoDisconnectObserver) {
            disconnectObserver(parent, mode, id);
        }
    };

    var attachTimeout = function attachTimeout(element) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};
        var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var id = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'niteTimeout';
        return setElementTimer(element, 'Timeout', callback, time, id);
    };
    var detachTimeout = function detachTimeout(element) {
        var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'niteTimeout';
        return clearElementTimer(element, 'Timeout', id, true);
    };

    /**
     * @param {string} prop
     * @param {string} value
     * @returns {boolean}
     */

    /**
     * @param {string} heystack
     * @param {string} needle
     * @returns {boolean}
     */
    var stringContains = function stringContains(heystack, needle) {
        return String.prototype.includes ? heystack.includes(needle) : heystack.indexOf(needle, 0) !== -1;
    };

    /**
     * @param {string} heystack
     * @param {string} needle
     * @returns {boolean}
     */
    var stringStartsWith = function stringStartsWith(heystack, needle) {
        return String.prototype.startsWith ? heystack.startsWith(needle) : heystack.substr(0, needle.length) === needle;
    };

    /**
     *
     */

    var Viewport = function () {
        function Viewport() {
            _classCallCheck(this, Viewport);

            this._window = window;
            this._html = document.documentElement;
            this._body = document.body;

            this._frame1 = this._window;
            this._frame2 = this._html || this._body;
            this._prefix1 = 'inner';
            this._prefix2 = 'offset';
            if (!this._prefix1 + 'Width' in this._frame1) {
                this._prefix1 = 'client';
                this._frame1 = this._frame2;
            }

            this._offsetWidth = 0;
            this._offsetHeight = 0;
            this._width = 0;
            this._height = 0;
            this._scrollTop = 0;
            this._scrollLeft = 0;

            this._lock = false;

            this.calcAll();
        }

        _createClass(Viewport, [{
            key: 'calcOffsetWidth',
            value: function calcOffsetWidth() {
                this._offsetWidth = this._body[this._prefix2 + 'Width'];
                return this.offsetWidth;
            }
        }, {
            key: 'calcOffsetHeight',
            value: function calcOffsetHeight() {
                this._offsetHeight = this._body[this._prefix2 + 'Height'];
                return this.offsetHeight;
            }
        }, {
            key: 'calcWidth',
            value: function calcWidth() {
                this._width = this._frame1[this._prefix1 + 'Width'];
                return this.width;
            }
        }, {
            key: 'calcHeight',
            value: function calcHeight() {
                this._height = this._frame1[this._prefix1 + 'Height'];
                return this.height;
            }
        }, {
            key: 'calcScrollTop',
            value: function calcScrollTop() {
                this._scrollTop = this._frame2.scrollTop || 0;
                return this.scrollTop;
            }
        }, {
            key: 'calcScrollLeft',
            value: function calcScrollLeft() {
                this._scrollLeft = this._frame2.scrollLeft || 0;
                return this.scrollLeft;
            }
        }, {
            key: 'calcAll',
            value: function calcAll() {
                this.calcOffsetWidth();
                this.calcOffsetHeight();
                this.calcWidth();
                this.calcHeight();
                this.calcScrollTop();
                this.calcScrollLeft();
                return this.all;
            }
        }, {
            key: 'offsetWidth',
            get: function get() {
                return this._offsetWidth;
            }
        }, {
            key: 'offsetHeight',
            get: function get() {
                return this._offsetHeight;
            }
        }, {
            key: 'width',
            get: function get() {
                return this._width;
            }
        }, {
            key: 'height',
            get: function get() {
                return this._height;
            }
        }, {
            key: 'scrollTop',
            get: function get() {
                return this._scrollTop;
            }
        }, {
            key: 'scrollLeft',
            get: function get() {
                return this._scrollLeft;
            }
        }, {
            key: 'all',
            get: function get() {
                return {
                    offsetWidth: this.offsetWidth,
                    offsetHeight: this.offsetHeight,
                    width: this.width,
                    height: this.height,
                    scrollTop: this.scrollTop,
                    scrollLeft: this.scrollLeft
                };
            }
        }, {
            key: 'lock',
            get: function get() {
                return this._lock;
            },
            set: function set(bool) {
                this._lock = bool;

                if (this._lock) {
                    this._body.style.top = -this.calcScrollTop() + 'px';
                    this._body.style.left = -this.calcScrollLeft() + 'px';

                    var scrollBarWidth = this.calcOffsetWidth();
                    var scrollBarHeight = this.calcOffsetHeight();

                    this._html.style.top = '0px';
                    this._html.style.left = '0px';
                    this._html.style.position = 'fixed';
                    this._body.style.position = 'fixed';
                    this._html.style.width = '100%';
                    this._body.style.width = '100%';

                    var offsetWidth = this.calcOffsetWidth();
                    var offsetHeight = this.calcOffsetHeight();
                    scrollBarWidth = offsetWidth - scrollBarWidth;
                    scrollBarHeight = offsetHeight - scrollBarHeight;

                    this._body.style.width = offsetWidth - scrollBarWidth + 'px';
                    this._body.style.height = offsetHeight - scrollBarHeight + 'px';
                } else {
                    var scrollTop = Math.abs(parseFloat(this._body.style.top));
                    var scrollLeft = Math.abs(parseFloat(this._body.style.left));

                    this._html.style.position = '';
                    this._html.style.top = '';
                    this._html.style.left = '';
                    this._html.style.width = '';
                    this._body.style.position = '';
                    this._body.style.top = '';
                    this._body.style.left = '';
                    this._body.style.width = '';

                    this._window.scroll({
                        top: scrollTop,
                        left: scrollLeft,
                        behavior: 'instant'
                    });
                }
            }
        }]);

        return Viewport;
    }();

    var eventNamespaceParserSeparator = '__namespace__';
    var privateEventsStorage = {};

    var CustomEvent = window.CustomEvent || function () {
        var _polyfill = function _polyfill(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        _polyfill.prototype = window.Event.prototype;
        return _polyfill;
    }();

    /**
     * @param {HTMLElement} element
     * @param {string} events
     * @returns {undefined}
     */
    var detachEventListener = function detachEventListener(element, events) {
        if (!element || typeof events !== 'string') {
            return;
        }

        if (stringStartsWith(events, '.')) {
            for (var key in privateEventsStorage) {
                var eventNameWithNamespace = key.replace(eventNamespaceParserSeparator, '.');
                if (stringContains(eventNameWithNamespace, events) && privateEventsStorage[key].element === element) {
                    detachEventListener(element, eventNameWithNamespace);
                }
            }
        } else {
            events = events.split('.');

            var type = events[0],
                namespace = events[1];

            if (namespace) {
                events = events.join(eventNamespaceParserSeparator);
            }

            if (events in privateEventsStorage) {
                element.removeEventListener(type, privateEventsStorage[events].handler);
                delete privateEventsStorage[events];
            }
        }
    };

    /**
     * @param {HTMLElement} element
     * @param {string} events
     * @param {Function} handler
     * @param {boolean} once
     * @returns {undefined}
     */
    // TODO: Class EventListener .on .one .off .trigger jQuery-like...
    var attachEventListener = function attachEventListener(element, events, handler, once) {
        if (!element || typeof events !== 'string' || typeof handler !== 'function') {
            return;
        }

        events = events.split('.');

        var type = events[0];
        var namespace = events[1];

        if (namespace) {
            events = events.join(eventNamespaceParserSeparator);
        }

        privateEventsStorage[events] = { element: element, count: 0, once: false };

        if (true === once) {
            var _handler = handler;
            handler = function handler(event) {
                if (events in privateEventsStorage) {
                    privateEventsStorage[events].count++;
                    if (privateEventsStorage[events].once && privateEventsStorage[events].count > 1) {
                        return;
                    }
                    _handler.call(this, event);
                }
                detachEventListener(element, events);
            };
        } else {
            once = false;
        }

        privateEventsStorage[events] = _extends({}, privateEventsStorage[events], { handler: handler, once: once });

        element.addEventListener(type, privateEventsStorage[events].handler, { once: once });
    };

    var Griddie = function () {
        function Griddie(element, options) {
            var _this = this;

            _classCallCheck(this, Griddie);

            this._element = element;
            this._items = [].concat(_toConsumableArray(this._element.children));
            this._options = {};
            this._viewport = new Viewport();

            this._element.instance = this;

            this.options = options;
            this.layout();
            attachEventListener(window, 'resize.griddie', function () {
                return _this.layout();
            });
        }

        _createClass(Griddie, [{
            key: 'animate',
            value: function animate() {
                var _this2 = this;

                var layoutChanges = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                if (!('instance' in this._element)) {
                    return;
                }

                var animation = new Promise(function (resolve, reject) {
                    var callback = function callback() {
                        _this2.clear();
                        _this2.layout(0);
                        _this2.store(1);
                        _this2.transform(0);

                        requestAnimationFrame(function () {
                            _this2._element.style.transition = 'height ' + _this2._options.transformTimingCSS + 's ease';

                            [].concat(_toConsumableArray(_this2._items)).filter(function (item) {
                                return item.style.display !== 'none';
                            }).forEach(function (item) {
                                var transition = 'transform ' + _this2._options.transformTimingCSS + 's ease';
                                if (!_this2.options.scaleXY) {
                                    transition += ', width ' + _this2._options.transformTimingCSS + 's ease, height ' + _this2._options.transformTimingCSS + 's ease';
                                }

                                item.style.transition = transition;
                            });

                            requestAnimationFrame(function () {
                                return _this2.transform(1);
                            });

                            attachTimeout(_this2._element, function () {
                                _this2.clear();
                                resolve();
                            }, _this2.options.transformTiming, 'transform');
                        });
                    };

                    detachTimeout(_this2._element, 'transform');

                    _this2.clear();
                    _this2.store(0);
                    _this2.transform(0);

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
                var _this3 = this;

                var _filter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '*';

                if (!('instance' in this._element)) {
                    return;
                }

                var matched = this._items.filter(function (x) {
                    return x.matches(_filter);
                });
                var unmatched = this._items.filter(function (x) {
                    return !x.matches(_filter);
                });
                var hiddenMatched = matched.filter(function (x) {
                    return x.style.display === 'none';
                });
                var makeRoomBeforeFade = matched.length !== hiddenMatched.length;

                var prepareFade = function prepareFade() {
                    _this3._items.forEach(function (item) {
                        item.style.transition = 'opacity ' + _this3._options.opacityTimingCSS + 's ease';
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
                    _this3._items.forEach(function (item) {
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
                    detachTimeout(_this3._element, 'opacity');

                    var fadeAfterAnimation = new Promise(function (resolve, reject) {
                        var onFadeEnd = function onFadeEnd() {
                            _this3.store(0);
                            _this3.transform(0);
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

                                    attachTimeout(_this3._element, function () {
                                        clearFade();

                                        requestAnimationFrame(function () {
                                            return onFadeEnd();
                                        });
                                    }, _this3.options.opacityTiming, 'opacity');
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

                            clearTimeout(_this3._filterTimeout);

                            _this3._filterTimeout = setTimeout(function () {
                                return clearFade();
                            }, _this3.options.opacityTiming);
                        });
                    }
                });
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.clear();
                this._items.forEach(function (item) {
                    item.style.gridRowEnd = ''; // TODO: possibly in clear()?
                    item.style.display = ''; // TODO: possibly in clear()?
                    delete item.rect;
                });
                delete this._element.rect;
                detachTimeout(this._element, 'transform');
                detachTimeout(this._element, 'opacity');
                detachEventListener(window, 'resize.griddie');
                delete this._element.instance;
            }
        }, {
            key: 'refresh',
            value: function refresh() {
                if (!('instance' in this._element)) {
                    return;
                }
                // TODO: do it
            }

            // TODO: private

        }, {
            key: 'layout',
            value: function layout() {
                if (!('instance' in this._element)) {
                    return;
                }

                if (this._options.masonry) {
                    if (window.getComputedStyle(this._element).getPropertyValue('grid-template-columns') === 'none') {
                        this._element.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                    }

                    if (window.getComputedStyle(this._element).getPropertyValue('display') !== 'grid') {
                        this._element.style.display = 'grid';
                    }

                    var rowHeight = window.getComputedStyle(this._element).getPropertyValue('grid-auto-rows');
                    if (rowHeight === 'auto') {
                        rowHeight = this._element.style.gridAutoRows = '20px';
                    }
                    rowHeight = parseInt(rowHeight);

                    if (window.getComputedStyle(this._element).getPropertyValue('grid-column-gap') === 'normal') {
                        this._element.style.gridColumnGap = '0px';
                    }

                    var rowGap = window.getComputedStyle(this._element).getPropertyValue('grid-row-gap');
                    if (rowGap === 'normal') {
                        rowGap = this._element.style.gridRowGap = '0px';
                    }
                    rowGap = parseInt(rowGap);

                    this._items.filter(function (item) {
                        return item.style.display !== 'none';
                    }).forEach(function (item) {
                        var rowSpan = Math.ceil(([].concat(_toConsumableArray(item.children))[0].getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
                        item.style.gridRowEnd = 'span ' + rowSpan;
                    });
                } else {
                    this._element.style.gridTemplateColumns = '';
                    this._element.style.display = '';
                    this._element.style.gridAutoRows = '';
                    this._element.style.gridColumnGap = '';
                    this._element.style.gridRowGap = '';
                    this._items.filter(function (item) {
                        return item.style.display !== 'none';
                    }).forEach(function (item) {
                        item.style.gridRowEnd = '';
                    });
                }
            }

            // TODO: private

        }, {
            key: 'clear',
            value: function clear() {
                if (!('instance' in this._element)) {
                    return;
                }

                this._element.style.position = '';
                this._element.style.width = '';
                this._element.style.height = '';
                this._element.style.transition = '';

                this._items.forEach(function (item) {
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
                var _this4 = this;

                var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

                if (!('instance' in this._element)) {
                    return;
                }

                this._viewport.calcScrollTop();
                this._viewport.calcScrollLeft();

                var gridRect = this._element.getBoundingClientRect();
                if (!('rect' in this._element)) {
                    this._element.rect = [];
                }

                this._element.rect[id] = {
                    width: gridRect.width,
                    height: gridRect.height,
                    top: gridRect.top + this._viewport.scrollTop,
                    left: gridRect.left + this._viewport.scrollLeft
                };

                this._items.filter(function (item) {
                    return item.style.display !== 'none';
                }).forEach(function (item) {
                    if (!('rect' in item)) {
                        item.rect = [];
                    }

                    var itemRect = item.getBoundingClientRect();
                    item.rect[id] = {
                        width: itemRect.width,
                        height: itemRect.height,
                        top: itemRect.top + _this4._viewport.scrollTop - _this4._element.rect[id].top,
                        left: itemRect.left + _this4._viewport.scrollLeft - _this4._element.rect[id].left,
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
                var _this5 = this;

                var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

                if (!('instance' in this._element)) {
                    return;
                }

                this._element.style.position = 'relative';
                this._element.style.width = this._element.rect[id].width + 'px';
                this._element.style.height = this._element.rect[id].height + 'px';

                this._items.filter(function (item) {
                    return item.style.display !== 'none';
                }).forEach(function (item) {
                    var transform = 'translate3d(' + item.rect[id].left + 'px,' + item.rect[id].top + 'px, 0px)';

                    if (_this5.options.scaleXY) {
                        transform += ' scale3d(' + item.rect[id].scaleX + ', ' + item.rect[id].scaleY + ', 1)';
                    }

                    if (!_this5.options.scaleXY || id === 0) {
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
                    scaleXY: false, // TODO: single item exceptions ...
                    opacityTiming: 300,
                    transformTiming: 300,
                    masonry: false
                }, options);
                this._options.transformTimingCSS = this.options.transformTiming / 1000;
                this._options.opacityTimingCSS = this.options.opacityTiming / 1000;
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

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('Griddie', factory) :
    (global.Griddie = factory());
}(this, (function () { 'use strict';

    const isPromise = object => !!object && (typeof object === 'object' || typeof object === 'function') && typeof object.then === 'function';

    const userAgent = navigator.userAgent.toLowerCase();

    const vendorsPrefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];

    const MutationObserver = (() => {
        for (let i = 0; i < vendorsPrefixes.length; i++) {
            if (vendorsPrefixes[i] + 'MutationObserver' in window) {
                return window[vendorsPrefixes[i] + 'MutationObserver'];
            }
        }

        return false;
    })();

    const transitionEndEventName = (() => {
        const el = document.createElement('div');

        const transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            msTransition: 'MSTransitionEnd',
            transition: 'transitionend'
        };

        for (let name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return transEndEventNames[name];
            }
        }

        return false;
    })();

    const getObserverId = (parent, prefix) => prefix + [...parent.classList].join('') + parent.id + 'Observer';

    const disconnectObserver = (parent, mode, id) => {
        const observerId = getObserverId(parent, id + mode);
        if (parent[observerId]) {
            parent[observerId].disconnect();
            delete parent[observerId];
        }
    };

    const setElementTimer = (element, mode, callback, time, id) => {
        clearElementTimer(element, mode, id);
        element[id] = window['set' + mode](callback, time);

        const parent = element.parentElement;
        const observerId = getObserverId(parent, id + mode);
        parent[observerId] = new MutationObserver(e => {
            if ([...e[0].removedNodes].some(el => el === element)) {
                clearElementTimer(element, mode, id);
                disconnectObserver(parent, mode, id);
            }
        });
        parent[observerId].observe(parent, { childList: true });
    };

    const clearElementTimer = (element, mode, id, autoDisconnectObserver = false) => {
        window['clear' + mode](element[id]);
        delete element[id];

        const parent = element.parentElement;
        if (autoDisconnectObserver) {
            disconnectObserver(parent, mode, id);
        }
    };

    const attachTimeout = (element, callback = () => {}, time = 0, id = 'niteTimeout') => setElementTimer(element, 'Timeout', callback, time, id);
    const detachTimeout = (element, id = 'niteTimeout') => clearElementTimer(element, 'Timeout', id, true);

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
    const stringContains = (heystack, needle) => {
        return String.prototype.includes ? heystack.includes(needle) : heystack.indexOf(needle, 0) !== -1;
    };

    /**
     * @param {string} heystack
     * @param {string} needle
     * @returns {boolean}
     */
    const stringStartsWith = (heystack, needle) => {
        return String.prototype.startsWith ? heystack.startsWith(needle) : heystack.substr(0, needle.length) === needle;
    };

    /**
     *
     */
    class Viewport {
        constructor() {
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

        get offsetWidth() {
            return this._offsetWidth;
        }
        get offsetHeight() {
            return this._offsetHeight;
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get scrollTop() {
            return this._scrollTop;
        }
        get scrollLeft() {
            return this._scrollLeft;
        }
        get all() {
            return {
                offsetWidth: this.offsetWidth,
                offsetHeight: this.offsetHeight,
                width: this.width,
                height: this.height,
                scrollTop: this.scrollTop,
                scrollLeft: this.scrollLeft
            };
        }

        calcOffsetWidth() {
            this._offsetWidth = this._body[this._prefix2 + 'Width'];
            return this.offsetWidth;
        }
        calcOffsetHeight() {
            this._offsetHeight = this._body[this._prefix2 + 'Height'];
            return this.offsetHeight;
        }
        calcWidth() {
            this._width = this._frame1[this._prefix1 + 'Width'];
            return this.width;
        }
        calcHeight() {
            this._height = this._frame1[this._prefix1 + 'Height'];
            return this.height;
        }
        calcScrollTop() {
            this._scrollTop = this._frame2.scrollTop || 0;
            return this.scrollTop;
        }
        calcScrollLeft() {
            this._scrollLeft = this._frame2.scrollLeft || 0;
            return this.scrollLeft;
        }
        calcAll() {
            this.calcOffsetWidth();
            this.calcOffsetHeight();
            this.calcWidth();
            this.calcHeight();
            this.calcScrollTop();
            this.calcScrollLeft();
            return this.all;
        }

        get lock() {
            return this._lock;
        }

        set lock(bool) {
            this._lock = bool;

            if (this._lock) {
                this._body.style.top = -this.calcScrollTop() + 'px';
                this._body.style.left = -this.calcScrollLeft() + 'px';

                let scrollBarWidth = this.calcOffsetWidth();
                let scrollBarHeight = this.calcOffsetHeight();

                this._html.style.top = '0px';
                this._html.style.left = '0px';
                this._html.style.position = 'fixed';
                this._body.style.position = 'fixed';
                this._html.style.width = '100%';
                this._body.style.width = '100%';

                let offsetWidth = this.calcOffsetWidth();
                let offsetHeight = this.calcOffsetHeight();
                scrollBarWidth = offsetWidth - scrollBarWidth;
                scrollBarHeight = offsetHeight - scrollBarHeight;

                this._body.style.width = offsetWidth - scrollBarWidth + 'px';
                this._body.style.height = offsetHeight - scrollBarHeight + 'px';
            } else {
                let scrollTop = Math.abs(parseFloat(this._body.style.top));
                let scrollLeft = Math.abs(parseFloat(this._body.style.left));

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
    }

    const eventNamespaceParserSeparator = '__namespace__';
    let privateEventsStorage = {};

    const CustomEvent =
        window.CustomEvent ||
        (() => {
            const _polyfill = (event, params) => {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                const evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            };
            _polyfill.prototype = window.Event.prototype;
            return _polyfill;
        })();

    /**
     * @param {HTMLElement} element
     * @param {string} events
     * @returns {undefined}
     */
    const detachEventListener = (element, events) => {
        if (!element || typeof events !== 'string') {
            return;
        }

        if (stringStartsWith(events, '.')) {
            for (let key in privateEventsStorage) {
                const eventNameWithNamespace = key.replace(eventNamespaceParserSeparator, '.');
                if (stringContains(eventNameWithNamespace, events) && privateEventsStorage[key].element === element) {
                    detachEventListener(element, eventNameWithNamespace);
                }
            }
        } else {
            events = events.split('.');

            const type = events[0],
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
    const attachEventListener = (element, events, handler, once) => {
        if (!element || typeof events !== 'string' || typeof handler !== 'function') {
            return;
        }

        events = events.split('.');

        const type = events[0];
        const namespace = events[1];

        if (namespace) {
            events = events.join(eventNamespaceParserSeparator);
        }

        privateEventsStorage[events] = { element: element, count: 0, once: false };

        if (true === once) {
            let _handler = handler;
            handler = function(event) {
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

        privateEventsStorage[events] = {
            ...privateEventsStorage[events],
            ...{ handler: handler, once: once }
        };

        element.addEventListener(type, privateEventsStorage[events].handler, { once: once });
    };

    class Griddie {
        constructor(element, options) {
            this._element = element;
            this._items = [...this._element.children];
            this._options = {};
            this._viewport = new Viewport();

            this._element.instance = this;

            this.options = options;
            this.layout();
            attachEventListener(window, 'resize.griddie', () => this.layout());
        }

        set options(options) {
            this._options = {
                ...{
                    scaleXY: false, // TODO: single item exceptions ...
                    opacityTiming: 300,
                    transformTiming: 300,
                    masonry: false
                },
                ...options
            };
            this._options.transformTimingCSS = this.options.transformTiming / 1000;
            this._options.opacityTimingCSS = this.options.opacityTiming / 1000;
        }

        get options() {
            return this._options;
        }

        animate(layoutChanges = () => {}) {
            if (!('instance' in this._element)) {
                return;
            }

            const animation = new Promise((resolve, reject) => {
                const callback = () => {
                    this.clearGridStyles();
                    this.clearItemsStyles();
                    this.layout();
                    this.storeGridData(1);
                    this.storeItemsData(1);
                    this.applyGridStyles(0);
                    this.applyItemsStyles(0);

                    requestAnimationFrame(() => {
                        const transformTransition = 'transform ' + this._options.transformTimingCSS + 's ease';
                        const widthHeightTransition = 'width ' + this._options.transformTimingCSS + 's ease, height ' + this._options.transformTimingCSS + 's ease';

                        this._element.style.transition = widthHeightTransition + ', ' + transformTransition;

                        [...this._items].filter(item => item.style.display !== 'none').forEach(item => {
                            let transition = transformTransition;
                            if (!this.options.scaleXY) {
                                transition += ', ' + widthHeightTransition;
                            }
                            item.style.transition = transition;
                        });

                        requestAnimationFrame(() => {
                            this.applyGridStyles(1);
                            this.applyItemsStyles(1);
                        });

                        attachTimeout(
                            this._element,
                            () => {
                                this.clearGridStyles();
                                this.clearItemsStyles();
                                resolve();
                            },
                            this.options.transformTiming,
                            'transform'
                        );
                    });
                };

                detachTimeout(this._element, 'transform');

                this.clearGridStyles();
                this.clearItemsStyles();
                this.storeGridData(0);
                this.storeItemsData(0);
                this.applyGridStyles(0);
                this.applyItemsStyles(0);

                const changes = layoutChanges();

                if (isPromise(changes)) {
                    changes.then(() => callback());
                } else {
                    requestAnimationFrame(() => callback());
                }
            });

            return animation;
        }

        filter(filter = '*') {
            if (!('instance' in this._element)) {
                return;
            }

            const matched = this._items.filter(x => x.matches(filter));
            const unmatched = this._items.filter(x => !x.matches(filter));
            const hiddenMatched = matched.filter(x => x.style.display === 'none');
            const makeRoomBeforeFade = matched.length !== hiddenMatched.length;

            const prepareFade = () => {
                this._items.forEach(item => {
                    item.style.transition = 'opacity ' + this._options.opacityTimingCSS + 's ease';
                });
            };
            const fade = () => {
                matched.forEach(item => {
                    item.style.opacity = 1;
                });

                unmatched.forEach(item => {
                    item.style.opacity = 0;
                });
            };
            const clearFade = () => {
                this._items.forEach(item => {
                    item.style.transition = '';
                    item.style.opacity = '';
                });

                matched.forEach(item => {
                    item.style.display = '';
                });

                unmatched.forEach(item => {
                    item.style.display = 'none';
                });
            };

            const animation = this.animate(() => {
                detachTimeout(this._element, 'opacity');

                const fadeAfterAnimation = new Promise((resolve, reject) => {
                    const onFadeEnd = () => {
                        //this.storeGridData(0);
                        this.storeItemsData(0);
                        this.applyGridStyles(0);
                        this.applyItemsStyles(0);
                        resolve();
                    };

                    prepareFade();

                    if (hiddenMatched.length) {
                        hiddenMatched.forEach(item => {
                            item.style.opacity = 0;
                        });
                    }

                    requestAnimationFrame(() => {
                        if (hiddenMatched.length) {
                            hiddenMatched.forEach(item => {
                                item.style.display = '';
                            });
                        }

                        if (hiddenMatched.length && makeRoomBeforeFade) {
                            requestAnimationFrame(() => onFadeEnd());
                        } else if (!hiddenMatched.length || (hiddenMatched.length && !makeRoomBeforeFade)) {
                            requestAnimationFrame(() => {
                                fade();

                                attachTimeout(
                                    this._element,
                                    () => {
                                        clearFade();

                                        requestAnimationFrame(() => onFadeEnd());
                                    },
                                    this.options.opacityTiming,
                                    'opacity'
                                );
                            });
                        }
                    });
                });

                return fadeAfterAnimation;
            });

            animation.then(() => {
                if (makeRoomBeforeFade) {
                    prepareFade();

                    requestAnimationFrame(() => {
                        fade();

                        clearTimeout(this._filterTimeout);

                        this._filterTimeout = setTimeout(() => clearFade(), this.options.opacityTiming);
                    });
                }
            });
        }

        destroy() {
            this.clearGridStyles();
            this.clearItemsStyles();
            this._items.forEach(item => {
                item.style.gridRowEnd = ''; // TODO: possibly in clear methods?
                item.style.display = ''; // TODO: possibly in clear methods?
                delete item.rect;
            });
            delete this._element.rect;
            detachTimeout(this._element, 'transform');
            detachTimeout(this._element, 'opacity');
            detachEventListener(window, 'resize.griddie');
            delete this._element.instance;
        }

        refresh() {
            if (!('instance' in this._element)) {
                return;
            }
            // TODO: do it
        }

        // TODO: private
        layout() {
            if (!('instance' in this._element)) {
                return;
            }

            this._element.style.position = 'relative';

            const computed = window.getComputedStyle(this._element);
            const display = computed.getPropertyValue('display');

            if (this._options.masonry) {
                if (computed.getPropertyValue('grid-template-columns') === 'none') {
                    this._element.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                }

                if (display !== 'grid') {
                    this._element.style.display = 'grid';
                }

                let rowHeight = computed.getPropertyValue('grid-auto-rows');
                if (rowHeight === 'auto') {
                    rowHeight = this._element.style.gridAutoRows = '20px';
                }
                rowHeight = parseInt(rowHeight);

                if (computed.getPropertyValue('grid-column-gap') === 'normal') {
                    this._element.style.gridColumnGap = '0px';
                }

                let rowGap = computed.getPropertyValue('grid-row-gap');
                if (rowGap === 'normal') {
                    rowGap = this._element.style.gridRowGap = '0px';
                }
                rowGap = parseInt(rowGap);

                this._items.filter(item => item.style.display !== 'none').forEach(item => {
                    const rowSpan = Math.ceil(([...item.children][0].getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
                    item.style.gridRowEnd = 'span ' + rowSpan;
                });
            } else {
                this._element.style.display = '';
                this._element.style.gridTemplateColumns = '';
                this._element.style.gridAutoRows = '';
                this._element.style.gridColumnGap = '';
                this._element.style.gridRowGap = '';
                this._items.filter(item => item.style.display !== 'none').forEach(item => {
                    item.style.gridRowEnd = '';
                });
            }
        }

        // TODO: private
        clearGridStyles() {
            if (!('instance' in this._element)) {
                return;
            }

            this._element.style.position = 'relative'; // ooooverkill
            this._element.style.transform = '';
            this._element.style.width = '';
            this._element.style.height = '';
            this._element.style.transition = '';
            this._element.style.margin = '';
        }

        // TODO: private
        clearItemsStyles() {
            if (!('instance' in this._element)) {
                return;
            }

            this._items.forEach(item => {
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
        storeGridData(id = 0) {
            if (!('instance' in this._element)) {
                return;
            }

            this._viewport.calcScrollTop(); // TODO: optimize
            this._viewport.calcScrollLeft(); // TODO: optimize

            const gridRect = this._element.getBoundingClientRect();
            const computed = window.getComputedStyle(this._element);
            if (!('rect' in this._element)) {
                this._element.rect = [];
            }

            this._element.rect[id] = {
                width: gridRect.width,
                height: gridRect.height,
                top: gridRect.top + this._viewport.scrollTop,
                left: gridRect.left + this._viewport.scrollLeft,
                marginTop: parseInt(computed.getPropertyValue('margin-top')),
                marginLeft: parseInt(computed.getPropertyValue('margin-left'))
            };
        }

        // TODO: private
        storeItemsData(id = 0) {
            if (!('instance' in this._element)) {
                return;
            }

            this._viewport.calcScrollTop(); // TODO: optimize
            this._viewport.calcScrollLeft(); // TODO: optimize

            this._items.filter(item => item.style.display !== 'none').forEach(item => {
                if (!('rect' in item)) {
                    item.rect = [];
                }

                const itemRect = item.getBoundingClientRect();
                item.rect[id] = {
                    width: itemRect.width,
                    height: itemRect.height,
                    top: itemRect.top + this._viewport.scrollTop - this._element.rect[id].top,
                    left: itemRect.left + this._viewport.scrollLeft - this._element.rect[id].left,
                    scaleX: 1,
                    scaleY: 1
                };

                item.rect[id].top = item.rect[id].top >= 0 ? item.rect[id].top : 0;
                item.rect[id].left = item.rect[id].left >= 0 ? item.rect[id].left : 0;

                if (id === 1) {
                    const scaleX = item.rect[0].width / itemRect.width;
                    const scaleY = item.rect[0].height / itemRect.height;

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
        applyGridStyles(id = 0) {
            if (!('instance' in this._element)) {
                return;
            }

            this._element.style.margin = 0;
            this._element.style.position = 'relative'; // overkill
            this._element.style.transformOrigin = '0 0 0';
            this._element.style.transform = 'translate3d(' + this._element.rect[id].marginLeft + 'px,' + this._element.rect[id].marginTop + 'px, 0px)';
            this._element.style.width = this._element.rect[id].width + 'px';
            this._element.style.height = this._element.rect[id].height + 'px';
        }

        // TODO: private
        applyItemsStyles(id = 0) {
            if (!('instance' in this._element)) {
                return;
            }

            this._items.filter(item => item.style.display !== 'none').forEach(item => {
                let transform = 'translate3d(' + item.rect[id].left + 'px,' + item.rect[id].top + 'px, 0px)';

                if (this.options.scaleXY) {
                    transform += ' scale3d(' + item.rect[id].scaleX + ', ' + item.rect[id].scaleY + ', 1)';
                }

                if (!this.options.scaleXY || id === 0) {
                    item.style.width = item.rect[id].width + 'px';
                    item.style.height = item.rect[id].height + 'px';
                }

                item.style.margin = 0;
                item.style.position = 'absolute';
                item.style.transformOrigin = '0 0 0';
                item.style.transform = transform;
            });
        }
    }

    return Griddie;

})));

//# sourceMappingURL=griddie.js.map

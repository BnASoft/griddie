import { isPromise } from './griddie.utils';
import { attachTimeout, detachTimeout } from './toolbox/src/toolbox.timers';
import { Viewport } from './toolbox/src/toolbox.viewport';
import { attachEventListener, detachEventListener } from './toolbox/src/toolbox.events';

export default class Griddie {
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
                this.clear();
                this.layout(0);
                this.store(1);
                this.transform(0);

                requestAnimationFrame(() => {
                    this._element.style.transition = 'height ' + this._options.transformTimingCSS + 's ease';

                    [...this._items].filter(item => item.style.display !== 'none').forEach(item => {
                        let transition = 'transform ' + this._options.transformTimingCSS + 's ease';
                        if (!this.options.scaleXY) {
                            transition += ', width ' + this._options.transformTimingCSS + 's ease, height ' + this._options.transformTimingCSS + 's ease';
                        }

                        item.style.transition = transition;
                    });

                    requestAnimationFrame(() => this.transform(1));

                    attachTimeout(
                        this._element,
                        () => {
                            this.clear();
                            resolve();
                        },
                        this.options.transformTiming,
                        'transform'
                    );
                });
            };

            detachTimeout(this._element, 'transform');

            this.clear();
            this.store(0);
            this.transform(0);

            const changes = layoutChanges();

            if (isPromise(changes)) {
                changes.then(() => callback());
            } else {
                callback();
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
                    this.store(0);
                    this.transform(0);
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
        this.clear();
        this._items.forEach(item => {
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

        if (this._options.masonry) {
            const rowHeight = parseInt(window.getComputedStyle(this._element).getPropertyValue('grid-auto-rows'));
            const rowGap = parseInt(window.getComputedStyle(this._element).getPropertyValue('grid-row-gap'));

            this._items.filter(item => item.style.display !== 'none').forEach(item => {
                const rowSpan = Math.ceil(([...item.children][0].getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
                item.style.gridRowEnd = 'span ' + rowSpan;
            });
        }
    }

    // TODO: private
    clear() {
        if (!('instance' in this._element)) {
            return;
        }

        this._element.style.position = '';
        this._element.style.width = '';
        this._element.style.height = '';
        this._element.style.transition = '';

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
    store(id = 0) {
        if (!('instance' in this._element)) {
            return;
        }

        this._viewport.calcScrollTop();
        this._viewport.calcScrollLeft();

        const gridRect = this._element.getBoundingClientRect();
        if (!('rect' in this._element)) {
            this._element.rect = [];
        }

        this._element.rect[id] = {
            width: gridRect.width,
            height: gridRect.height,
            top: gridRect.top + this._viewport.scrollTop,
            left: gridRect.left + this._viewport.scrollLeft
        };

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
    transform(id = 0) {
        if (!('instance' in this._element)) {
            return;
        }

        this._element.style.position = 'relative';
        this._element.style.width = this._element.rect[id].width + 'px';
        this._element.style.height = this._element.rect[id].height + 'px';

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

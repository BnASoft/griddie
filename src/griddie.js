import { isPromise } from './griddie.utils.js';

export default class Griddie {
    constructor(options) {
        this._options = {};

        this._animationTimeout = null; // TODO: replace with toolbox.timer ...
        this._filterTimeout = null; // TODO: replace with toolbox.timer ...

        this.options = options;
        this.layout();
        window.addEventListener('resize', this.layout);
    }

    set options(options) {
        this._options = {
            ...{
                animateWidthAndHeight: true, // TODO: single item exceptions ...
                opacityTiming: 300,
                transformTiming: 300,
                masonry: false
            },
            ...options
        };
        this._options.transformTimingCSS = this.options.transformTiming / 1000;
        this._options.opacityTimingCSS = this.options.opacityTiming / 1000;
        this._options.items = [...this._options.element.children];
    }

    get options() {
        return this._options;
    }

    animate(layoutChanges = () => {}) {
        const animation = new Promise((resolve, reject) => {
            const callback = () => {
                this.clear();
                this.layout(0);
                this.store(1);
                this.transform(0);

                requestAnimationFrame(() => {
                    this._options.element.style.transition = 'height ' + this._options.transformTimingCSS + 's ease';
                    [...this._options.items].filter(item => item.style.display !== 'none').forEach(item => {
                        let transition = 'transform ' + this._options.transformTimingCSS + 's ease';
                        if (this.options.animateWidthAndHeight) {
                            transition += ', width ' + this._options.transformTimingCSS + 's ease, height ' + this._options.transformTimingCSS + 's ease';
                        }

                        item.style.transition = transition;
                    });

                    requestAnimationFrame(() => this.transform(1));

                    clearTimeout(this._animationTimeout);
                    this._animationTimeout = setTimeout(() => {
                        this.clear();
                        resolve();
                    }, this.options.transformTiming);
                });
            };

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
        const matched = this._options.items.filter(x => x.matches(filter));
        const unmatched = this._options.items.filter(x => !x.matches(filter));
        const hiddenMatched = matched.filter(x => x.style.display === 'none');
        const makeRoomBeforeFade = matched.length !== hiddenMatched.length;
        const prepareFade = () => {
            this._options.items.forEach(item => {
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
            this._options.items.forEach(item => {
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

                            clearTimeout(this._filterTimeout);

                            this._filterTimeout = setTimeout(() => {
                                clearFade();

                                requestAnimationFrame(() => onFadeEnd());
                            }, this.options.opacityTiming);
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
        // TODO: do it
    }

    refresh() {
        // TODO: do it
    }

    // TODO: private
    layout() {
        if (this.options.masonry) {
            const rowHeight = parseInt(window.getComputedStyle(this._options.element).getPropertyValue('grid-auto-rows'));
            const rowGap = parseInt(window.getComputedStyle(this._options.element).getPropertyValue('grid-row-gap'));

            this._options.items.filter(item => item.style.display !== 'none').forEach(item => {
                const rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
                item.style.gridRowEnd = 'span ' + rowSpan;
            });
        }
    }

    // TODO: private
    clear() {
        this._options.element.style.position = '';
        this._options.element.style.width = '';
        this._options.element.style.height = '';
        this._options.element.style.transition = '';

        this._options.items.forEach(item => {
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
        const scroll = {
            top: document.body.scrollTop,
            left: document.body.scrollLeft
        };
        const gridRect = this._options.element.getBoundingClientRect();
        if (!('rect' in this._options.element)) {
            this._options.element.rect = [];
        }
        this._options.element.rect[id] = {
            width: gridRect.width,
            height: gridRect.height,
            top: gridRect.top + scroll.top,
            left: gridRect.left + scroll.left
        };
        this._options.items.filter(item => item.style.display !== 'none').forEach(item => {
            if (!('rect' in item)) {
                item.rect = [];
            }
            const itemRect = item.getBoundingClientRect();
            item.rect[id] = {
                width: itemRect.width,
                height: itemRect.height,
                top: itemRect.top + scroll.top - this._options.element.rect[id].top,
                left: itemRect.left + scroll.left - this._options.element.rect[id].left,
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
        this._options.element.style.position = 'relative';
        this._options.element.style.width = this._options.element.rect[id].width + 'px';
        this._options.element.style.height = this._options.element.rect[id].height + 'px';

        this._options.items.filter(item => item.style.display !== 'none').forEach(item => {
            let transform = 'translate3d(' + item.rect[id].left + 'px,' + item.rect[id].top + 'px, 0px)';

            if (!this.options.animateWidthAndHeight) {
                transform += ' scale3d(' + item.rect[id].scaleX + ', ' + item.rect[id].scaleY + ', 1)';
            }

            if (this.options.animateWidthAndHeight || id === 0) {
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
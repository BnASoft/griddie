const html = document.documentElement;
const body = document.body;
const scroller = html || body;

let scrollTop = 0;
let scrollLeft = 0;

const isPromise = object => !!object && (typeof object === 'object' || typeof object === 'function') && typeof object.then === 'function';

class Griddie {
    constructor(element, options) {
        this._element = element;
        this._items = [...this._element.children];
        this._options = {};

        this._element.instance = this;

        this.options = options;
        this.layout();
        window.addEventListener('resize', () => this.layout());

        // tmp...
        this._timer1 = null;
        this._timer2 = null;
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

                    this._timer1 = setTimeout(
                        // TODO: transitionend
                        () => {
                            this.clearGridStyles();
                            this.clearItemsStyles();
                            resolve();
                        },
                        this.options.transformTiming
                    );
                });
            };

            clearTimeout(this._timer1); // TODO: transitionend

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
            clearTimeout(this._timer2);

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

                            this._timer2 = setTimeout(() => {
                                // TODO: transitionend
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
        this.clearGridStyles();
        this.clearItemsStyles();
        this._items.forEach(item => {
            item.style.gridRowEnd = ''; // TODO: possibly in clear methods?
            item.style.display = ''; // TODO: possibly in clear methods?
            delete item.rect;
        });
        delete this._element.rect;
        clearTimeout(this._timer2); // TODO: transitionend
        clearTimeout(this._timer1); // TODO: transitionend
        window.removeEventListener('resize');
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

        scrollTop = scroller.scrollTop; // TODO: optimize
        scrollLeft = scroller.scrollLeft; // TODO: optimize

        const gridRect = this._element.getBoundingClientRect();
        const computed = window.getComputedStyle(this._element);
        if (!('rect' in this._element)) {
            this._element.rect = [];
        }

        this._element.rect[id] = {
            width: gridRect.width,
            height: gridRect.height,
            top: gridRect.top + scrollTop,
            left: gridRect.left + scrollLeft,
            marginTop: parseInt(computed.getPropertyValue('margin-top')),
            marginLeft: parseInt(computed.getPropertyValue('margin-left'))
        };
    }

    // TODO: private
    storeItemsData(id = 0) {
        if (!('instance' in this._element)) {
            return;
        }

        scrollTop = scroller.scrollTop; // TODO: optimize
        scrollLeft = scroller.scrollLeft; // TODO: optimize

        this._items.filter(item => item.style.display !== 'none').forEach(item => {
            if (!('rect' in item)) {
                item.rect = [];
            }

            const itemRect = item.getBoundingClientRect();
            item.rect[id] = {
                width: itemRect.width,
                height: itemRect.height,
                top: itemRect.top + scrollTop - this._element.rect[id].top,
                left: itemRect.left + scrollLeft - this._element.rect[id].left,
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

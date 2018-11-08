class Griddie {
    #scroller = document.documentElement || document.body;
    #scrollTop = 0;
    #scrollLeft = 0;

    #element;
    #items;
    #options;

    #isPromise = object => !!object && (typeof object === 'object' || typeof object === 'function') && typeof object.then === 'function';

    // FIXME: use transitionend
    #timer1 = null;
    // FIXME: use transitionend
    #timer2 = null;

    constructor(element = '', options = {}) {
        this.#element = typeof element === 'string' ? document.querySelector(element) : element;
        this.#items = [...this.#element.children];
        this.#options = {};

        this.#element.instance = this;

        this.options = options;
        this.#layout();
        window.addEventListener('resize', () => this.#layout());
    }

    set options(options = {}) {
        this.#options = {
            ...{
                scaleXY: false, // TODO: give ability to set this for every single item
                opacityTiming: 300, // FIXME: use transitionend
                transformTiming: 300, // FIXME: use transitionend
                masonry: false
            },
            ...options
        };
        this.#options.transformTimingCSS = this.options.transformTiming / 1000;
        this.#options.opacityTimingCSS = this.options.opacityTiming / 1000;
    }

    get options() {
        return this.#options;
    }

    animate(layoutChanges = () => {}) {
        if (!('instance' in this.#element)) {
            return;
        }

        const animation = new Promise((resolve, reject) => {
            const callback = () => {
                this.#clearGridStyles();
                this.#clearItemsStyles();
                this.#layout();
                this.#storeGridData(1);
                this.#storeItemsData(1);
                this.#applyGridStyles(0);
                this.#applyItemsStyles(0);

                requestAnimationFrame(() => {
                    const transformTransition = 'transform ' + this.#options.transformTimingCSS + 's ease';
                    const widthHeightTransition = 'width ' + this.#options.transformTimingCSS + 's ease, height ' + this.#options.transformTimingCSS + 's ease';

                    this.#element.style.transition = widthHeightTransition + ', ' + transformTransition;

                    [...this.#items]
                        .filter(item => item.style.display !== 'none')
                        .forEach(item => {
                            let transition = transformTransition;

                            if (!this.options.scaleXY) {
                                transition += ', ' + widthHeightTransition;
                            }
                            item.style.transition = transition;
                        });

                    requestAnimationFrame(() => {
                        this.#applyGridStyles(1);
                        this.#applyItemsStyles(1);
                    });

                    // FIXME: use transitionend
                    this.#timer1 = setTimeout(() => {
                        this.#clearGridStyles();
                        this.#clearItemsStyles();
                        resolve();
                    }, this.options.transformTiming);
                });
            };

            // FIXME: use transitionend
            clearTimeout(this.#timer1);

            this.#clearGridStyles();
            this.#clearItemsStyles();
            this.#storeGridData(0);
            this.#storeItemsData(0);
            this.#applyGridStyles(0);
            this.#applyItemsStyles(0);

            const changes = layoutChanges(this.#element);

            if (this.#isPromise(changes)) {
                changes.then(() => callback());
            } else {
                requestAnimationFrame(() => callback());
            }
        });

        return animation;
    }

    filter(filter = '*') {
        if (!('instance' in this.#element)) {
            return;
        }

        const matched = this.#items.filter(x => x.matches(filter));
        const unmatched = this.#items.filter(x => !x.matches(filter));
        const hiddenMatched = matched.filter(x => x.style.display === 'none');
        const makeRoomBeforeFade = matched.length !== hiddenMatched.length;

        const prepareFade = () => {
            this.#items.forEach(item => {
                item.style.transition = 'opacity ' + this.#options.opacityTimingCSS + 's ease';
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
            this.#items.forEach(item => {
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
            clearTimeout(this.#timer2);

            const fadeAfterAnimation = new Promise((resolve, reject) => {
                const onFadeEnd = () => {
                    //this.#storeGridData(0);
                    this.#storeItemsData(0);
                    this.#applyGridStyles(0);
                    this.#applyItemsStyles(0);
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

                            // FIXME: use transitionend
                            this.#timer2 = setTimeout(() => {
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
        this.#clearGridStyles();
        this.#clearItemsStyles();
        this.#items.forEach(item => {
            item.style.gridRowEnd = ''; // TODO: possibly in clear methods?
            item.style.display = ''; // TODO: possibly in clear methods?
            delete item.rect;
        });

        delete this.#element.rect;

        // FIXME: use transitionend
        clearTimeout(this.#timer1);
        // FIXME: use transitionend
        clearTimeout(this.#timer2);

        window.removeEventListener('resize');
        delete this.#element.instance;
    }

    #refresh = () => {
        if (!('instance' in this.#element)) {
            return;
        }
        // TODO: do it
    };

    #layout = () => {
        if (!('instance' in this.#element)) {
            return;
        }

        this.#element.style.position = 'relative';

        const computed = window.getComputedStyle(this.#element);
        const display = computed.getPropertyValue('display');

        if (this.#options.masonry) {
            if (computed.getPropertyValue('grid-template-columns') === 'none') {
                this.#element.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
            }

            if (display !== 'grid') {
                this.#element.style.display = 'grid';
            }

            let rowHeight = computed.getPropertyValue('grid-auto-rows');
            if (rowHeight === 'auto') {
                rowHeight = this.#element.style.gridAutoRows = '20px';
            }
            rowHeight = parseInt(rowHeight);

            if (computed.getPropertyValue('grid-column-gap') === 'normal') {
                this.#element.style.gridColumnGap = '0px';
            }

            let rowGap = computed.getPropertyValue('grid-row-gap');
            if (rowGap === 'normal') {
                rowGap = this.#element.style.gridRowGap = '0px';
            }
            rowGap = parseInt(rowGap);

            this.#items
                .filter(item => item.style.display !== 'none')
                .forEach(item => {
                    const rowSpan = Math.ceil(([...item.children][0].getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
                    item.style.gridRowEnd = 'span ' + rowSpan;
                });
        } else {
            this.#element.style.display = '';
            this.#element.style.gridTemplateColumns = '';
            this.#element.style.gridAutoRows = '';
            this.#element.style.gridColumnGap = '';
            this.#element.style.gridRowGap = '';
            this.#items
                .filter(item => item.style.display !== 'none')
                .forEach(item => {
                    item.style.gridRowEnd = '';
                });
        }
    };

    #clearGridStyles = () => {
        if (!('instance' in this.#element)) {
            return;
        }

        this.#element.style.position = 'relative'; // ooooverkill
        this.#element.style.transform = '';
        this.#element.style.width = '';
        this.#element.style.height = '';
        this.#element.style.transition = '';
        this.#element.style.margin = '';
    };

    #clearItemsStyles = () => {
        if (!('instance' in this.#element)) {
            return;
        }

        this.#items.forEach(item => {
            item.style.transform = '';
            item.style.transformOrigin = '';
            item.style.position = '';
            item.style.transition = '';
            item.style.width = '';
            item.style.height = '';
            item.style.margin = '';
        });
    };

    #storeGridData = (id = 0) => {
        if (!('instance' in this.#element)) {
            return;
        }

        this.#scrollTop = this.#scroller.scrollTop; // TODO: optimize
        this.#scrollLeft = this.#scroller.scrollLeft; // TODO: optimize

        const gridRect = this.#element.getBoundingClientRect();
        const computed = window.getComputedStyle(this.#element);
        if (!('rect' in this.#element)) {
            this.#element.rect = [];
        }

        this.#element.rect[id] = {
            width: gridRect.width,
            height: gridRect.height,
            top: gridRect.top + this.#scrollTop,
            left: gridRect.left + this.#scrollLeft,
            marginTop: parseInt(computed.getPropertyValue('margin-top')),
            marginLeft: parseInt(computed.getPropertyValue('margin-left'))
        };
    };

    #storeItemsData = (id = 0) => {
        if (!('instance' in this.#element)) {
            return;
        }

        this.#scrollTop = this.#scroller.scrollTop; // TODO: optimize
        this.#scrollLeft = this.#scroller.scrollLeft; // TODO: optimize

        this.#items
            .filter(item => item.style.display !== 'none')
            .forEach(item => {
                if (!('rect' in item)) {
                    item.rect = [];
                }

                const itemRect = item.getBoundingClientRect();
                item.rect[id] = {
                    width: itemRect.width,
                    height: itemRect.height,
                    top: itemRect.top + this.#scrollTop - this.#element.rect[id].top,
                    left: itemRect.left + this.#scrollLeft - this.#element.rect[id].left,
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
    };

    #applyGridStyles = (id = 0) => {
        if (!('instance' in this.#element)) {
            return;
        }

        this.#element.style.margin = 0;
        this.#element.style.position = 'relative'; // overkill
        this.#element.style.transformOrigin = '0 0 0';
        this.#element.style.transform = 'translate3d(' + this.#element.rect[id].marginLeft + 'px,' + this.#element.rect[id].marginTop + 'px, 0px)';
        this.#element.style.width = this.#element.rect[id].width + 'px';
        this.#element.style.height = this.#element.rect[id].height + 'px';
    };

    #applyItemsStyles = (id = 0) => {
        if (!('instance' in this.#element)) {
            return;
        }

        this.#items
            .filter(item => item.style.display !== 'none')
            .forEach(item => {
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
    };
}

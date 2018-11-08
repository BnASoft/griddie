# Griddie

✨ Animated CSS grid masonry layout

## Credits

1. Thanks to this [repository](https://github.com/aholachek/animate-css-grid), which inspired me to achieve the same result, but with pure CSS transitions and without external animation libraries: thanks [Alex](https://github.com/aholachek/).
2. Thanks to this [pen](https://codepen.io/andybarefoot/pen/pxpQmd), where I basically took the function that helps CSS grid layout to reach a proper dynamic masonry layout: thanks [Andy](https://andybarefoot.com/), i owe you a beer 🍺.

## Demo

Before any bla bla bla, lemme show ya [this demo](https://memob0x.github.io/griddie/) real quick.

## Syntax

Griddie can be initialized on every type of element; it obviously works better on "consistent" [layout systems](https://developer.mozilla.org/en-US/docs/Web/CSS/Layout_mode) wrappers: [block layouts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flow_Layout), float layouts, [flexible layouts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout) or [grid layouts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout), these have all been tested.

Please note that with the `masonry` option set to `true` a **grid layout** would be applied _inline_ if not specified in your stylesheet.

Basically, all you have to do is **initialize** an **instance**; the _first parameter_ can be both `HTMLElement` object or a _valid string selector_ to a unique element.

```javascript
const layout = new Griddie('ul#layout-wrapper', {
    masonry: true
});
```

To achieve a whatever **smooth layout change**, all you need to do is place your _DOM modifications_ within the `animate` method **callback**.

```javascript
layout.animate(el => {
    // class switches...
    el.classList.add('columns-4');
    el.classList.remove('columns-2');

    // inline styles...
    el.querySelector('li:first-child').style.order = 2; // valid in a flexible or grid layout...

    // DOM moves...
    el.querySelector('li:first-child').before(el.querySelector('li:last-child'));

    // ...you can even change the instance options runtime
    layout.options = {
        masonry: false // this would smoothly switch from a masonry layout to your preferred CSS fallback...
    };
});
```

This method supports the use of `Promise` too, just **return** one in the callback function and it will be awaited; this may result very useful in order to create composite animations.

```javascript
layout.animate(
    () =>
        new Promise(resolve => {
            const something = document.querySelector('li:last-child');

            something.addEventListener('transitionend', resolve, { once: true });

            something.classList('pre-animation');
        })
);
```

Some properties, like `display` or `visibility`, still won't be supported, but with the provided `filter` method you will be able to **make disappear/re-appear** all those items which doesn't match the **given selector** through a smooth **fade** effect.

```javascript
layout.filter('li:nth-child(even)'); // hiding all the odds...
```

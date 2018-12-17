# JavaScript

```js
mix.js(src | [src], output);
```

With a single line of code, Laravel Mix allows you to trigger a number of vital actions.

-   ES2017 + modules compilation
-   Build and compile `.vue` components \(via `vue-loader`\)
-   Hot module replacement
-   Tree-shaking, new in webpack 2 \(removes unused library code\)
-   Extract vendor libraries \(via `mix.extract()`\), for improved long-term caching
-   Automatic versioning \(query string hash\), via `mix.version()`

### Usage

```js
let mix = require('laravel-mix');

// 1. A single src and output path.
mix.js('src/app.js', 'dist/app.js');

// 2. For additional src files that should be
// bundled together:
mix.js(['src/app.js', 'src/another.js'], 'dist/app.js');

// 3. For multiple entry/output points:
mix.js('src/app.js', 'dist/').js('src/forum.js', 'dist/');
```

### Laravel Example

Consider a typical Laravel install. By default, your JavaScript entry point will be located at `./resources/assets/js/app.js`. Let's prepare a `webpack.mix.js` file to compile that to `./public/js/app.js`.

```js
let mix = require('laravel-mix');

mix.js('resources/assets/js/app.js', 'public/js');
```

Done! Now, all of the bullet items above are available to you, and it required exactly one method call.

To trigger the compilation, run `npm run dev` from the command line.

### Vue Components

Laravel Mix is mildly opinionated, and ships with compilation support for `.vue` component files. Don't worry: if you don't use Vue, you can ignore this entire section.

Single file components are one of Vue's neatest features. One file to declare the template, script, and styling for a component? Yes, please! Let's try it out.

##### ./resources/assets/js/app.js

```js
import Vue from 'vue';
import Notification from './components/Notification.vue';

new Vue({
    el: '#app',
    components: { Notification }
});
```

Above, we import Vue \(you'll want to first run `npm install vue --save-dev`\), require a `Notification` Vue component, and then build up our root Vue instance.

**./resources/assets/js/components/Notification.vue**

```js
<template>
    <div class="notification">
        {{ body }}
    </div>
</template>

<script>
    export default {
        data() {
            return {
                body: 'I am a notification.'
            }
        }
    }
</script>

<style>
    .notification {
        background: grey;
    }
</style>
```

If you're familiar with Vue, this should all look very familiar, so we'll move on.

**./webpack.mix.js**

```js
let mix = require('laravel-mix');

mix.js('resources/assets/js/app.js', 'public/js');
```

And that should do it! Run `npm run dev` to compile it all down. At this point, simply create an HTML file, import your `./js/app.js` bundle, and load the browser. Tada!

### React Support

Laravel Mix also ships with basic React support. Simply update your `mix.js()` call to `mix.react()`, and then use the exact same set of arguments. Behind the scenes, Mix will pull in and reference any necessary Babel plugins for React.

```js
mix.react('resources/assets/js/app.jsx', 'public/js/app.js');
```

Of course, you'll still want to install React and ReactDOM through NPM, per usual, but everything else should be taken care of.

### Typescript Support

Laravel Mix also ships with basic Typescript support. Simply update your `mix.js()` call to `mix.ts()`, and then use the exact same set of arguments.

```js
mix.ts('resources/assets/js/app.ts', 'public/js/app.js');
```

Of course, you'll still want to do the necessary tweeks like creating `tsconfig.json` file and installing [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped), but everything else should be taken care of.

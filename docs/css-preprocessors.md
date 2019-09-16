# CSS Preprocessors

```js
mix.sass('src', 'output', pluginOptions);
mix.less('src', 'output', pluginOptions);
mix.stylus('src', 'output', pluginOptions);
mix.postCss('src', 'output', [require('precss')()]);
```

A single method call allows you to compile your Sass, Less, or Stylus files, while applying automatic CSS3 prefixing.

Though webpack can inline all of your CSS directly into the bundled JavaScript, Laravel Mix automatically performs the necessary steps to extract it to your desired output path.

### Multiple Builds

Should you need to compile more than one root file, you may call `mix.sass()` (or any of the preprocessor variants) as many as times as is needed. For each call, webpack will output a new file with the relevant contents.

```js
mix.sass('src/app.scss', 'dist/') // creates 'dist/app.css'
    .sass('src/forum.scss', 'dist/'); // creates 'dist/forum.css'
```

### Example

Let's review a quick example:

**webpack.mix.js**

```js
let mix = require('laravel-mix');

mix.sass('resources/assets/sass/app.sass', 'public/css');
```

**./resources/assets/sass/app.sass**

```sass
$primary: grey

.app
    background: $primary
```

> Tip: For Sass compilation, you may freely use the `.sass` and `.scss` syntax styles.

Compile this down as usual \(`npm run webpack`\), and you'll find a `./public/css/app.css` file that contains:

```css
.app {
    background: grey;
}
```

### Plugin Options

Behind the scenes, Laravel Mix of course defers to Sass (Dart implementation), Less, and Stylus to compile your Sass and Less files, respectively. From time to time, you may need to override the default options that we pass to them. You may provide these as the third argument to `mix.sass()`, `mix.less()`, and `mix.stylus()`.

-   **Node-Sass Options:** https://github.com/sass/node-sass#options
-   **Less Options:** https://github.com/webpack-contrib/less-loader#options

```js
mix.sass('src', 'destination', {
    sassOptions: {
        outputStyle: 'nested',
    },
    implementation: require('node-sass') // Switch from Dart to node-sass implementation
});
```

#### Stylus Plugins

If using Stylus, you may wish to install extra plugins, such as [Rupture](https://github.com/jescalan/rupture). No problem. Simply install the plugin in question through NPM (`npm install rupture`), and then require it in your `mix.stylus()` call, like so:

```js
mix.stylus('resources/assets/stylus/app.styl', 'public/css', {
    use: [require('rupture')()]
});
```

Should you wish to take it further, and automatically import plugins globally, you may use the `import` option. Here's an example:

```js
mix.stylus('resources/assets/stylus/app.styl', 'public/css', {
    use: [require('rupture')(), require('nib')(), require('jeet')()],
    import: ['~nib/index.styl', '~jeet/jeet.styl']
});
```

That's all there is to it!

### CSS `url()` Rewriting

One key webpack concept to understand is that it will rewrite any `url()`s within your stylesheets. While this might initially sound strange, it's an incredibly powerful piece of functionality.

#### An Example

Imagine that we want to compile a bit of Sass that includes a relative url to an image.

```scss
.example {
    background: url('../images/thing.png');
}
```

> **Tip:** Absolute paths for `url()`s will of course be excluded from url-rewriting. As such, `url('/images/thing.png')` or `url('http://example.com/images/thing.png')` won't be touched.

Notice that relative URL? By default, Laravel Mix and webpack will find `thing.png`, copy it to your `public/images` folder, and then rewrite the `url()` within your generated stylesheet. As such, your compiled CSS will be:

```css
.example {
    background: url(/images/thing.png?d41d8cd98f00b204e9800998ecf8427e);
}
```

This, again, is a very cool feature of webpack's. However, it does have a tendency to confuse those who don't understand how webpack and the css-loader plugin works. It's possible that your folder structure is already just how you want it, and you'd prefer that Mix not modify those `url()`s. If that's the case, we do offer an override:

```js
mix.sass('src/app.scss', 'dist/').options({
    processCssUrls: false
});
```

With this addition to your `webpack.mix.js` file, we will no longer match `url()`s or copy assets to your public directory. As such, the compiled CSS will remain exactly as you typed it:

```css
.example {
    background: url('../images/thing.png');
}
```

> As an added bonus, when you disable url processing, your Webpack Sass compilation and extraction can compile far more quickly.

### PostCSS Plugins

By default, Mix will pipe all of your CSS through the popular [Autoprefixer PostCSS plugin](https://github.com/postcss/autoprefixer). As a result, you are free to use the latest CSS 3 syntax with the understanding that we'll apply any necessary browser-prefixes automatically. The default settings should be fine in most scenarios, however, if you need to tweak the underlying Autoprefixer configuration, here's how:

```js
mix.sass('resources/assets/sass/app.scss', 'public/css').options({
    autoprefixer: {
        options: {
            browsers: ['last 6 versions']
        }
    }
});
```

Additionally, if you wish to disable it entirely - or depend upon a PostCSS plugin that already includes Autoprefixer:

```js
mix.sass('resources/assets/sass/app.scss', 'public/css').options({
    autoprefixer: false
});
```

It's possible, however, that you'd like to apply [additional PostCSS plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md) to your build. No problem. Simply install the desired plugin through NPM, and then reference it in your `webpack.mix.js` file, like so:

```js
mix.sass('resources/assets/sass/app.scss', 'public/css').options({
    postCss: [require('postcss-custom-properties')]
});
```

Done! You may now use and compile custom CSS properties (if that's your thing). For example, if `resources/assets/sass/app.scss` contains...

```css
:root {
    --some-color: red;
}

.example {
    color: var(--some-color);
}
```

...when compiled, you'll now see:

```css
.example {
    color: red;
}
```

Nifty!

### PostCss Without Sass or Less

Alternatively, if you'd prefer to skip the Sass/Less/Stylus compile step entirely and instead use PostCSS, you may do so via the `mix.postCss()` method.

```js
mix.postCss('resources/assets/css/main.css', 'public/css', [
    require('precss')()
]);
```

Notice that the third argument is an array of [postcss plugins](https://github.com/postcss/postcss#plugins) that should be applied to your build.

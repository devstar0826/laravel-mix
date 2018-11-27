# Basic Example

Laravel Mix is a clean layer on top of webpack to make the 80% use case laughably simple to execute. Most would agree that, though incredibly powerful, webpack ships with a steep learning curve. But what if you didn't have to worry about that?

Have a look at a basic `webpack.mix.js` file. Let's imagine that we only desire JavaScript \(ES2015 with modules\), and Sass compilation:

```js
let mix = require('laravel-mix');

mix.sass('src/app.sass', 'dist').js('src/app.js', 'dist');
```

Done. Simple, right?

1. Compile the Sass file, `./src/app.sass`, to `./dist/app.css`
2. Bundle all JavaScript \(and any required modules\) at `./src/app.js` to `./dist/app.js`.

With this configuration in place, we may trigger webpack from the command line: `node_modules/.bin/webpack`.

During development, it's unnecessary to minify the output, however, this will be performed automatically when you trigger webpack within a production environment: `export NODE_ENV=production webpack`.

### Less?

But what if you prefer Less compilation instead? No problem. Just swap `mix.sass()` with `mix.less()`, and you're done!

You'll find that most common webpack tasks become a cinch with Laravel Mix.

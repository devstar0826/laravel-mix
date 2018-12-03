let { VueLoaderPlugin } = require('vue-loader');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

class Vue {
    /**
     * Required dependencies for the component.
     */
    dependencies() {
        if (Config.extractVueStyles && Config.globalVueStyles) {
            return ['sass-resources-loader']; // Required for importing global styles into every component.
        }
    }

    /**
     * Override the generated webpack configuration.
     *
     * @param {Object} webpackConfig
     */
    webpackConfig(webpackConfig) {
        webpackConfig.module.rules.push({
            test: /\.vue$/,
            loader: 'vue-loader'
        });

        webpackConfig.plugins.push(new VueLoaderPlugin());

        this.updateCssLoaders(webpackConfig);
    }

    /**
     * Update all preprocessor loaders to support CSS extraction.
     */
    updateCssLoaders(webpackConfig) {
        // Basic CSS and PostCSS
        this.updateCssLoader(
            'css',
            [
                { loader: 'css-loader', options: { importLoaders: 1 } },
                {
                    loader: 'postcss-loader',
                    options: this.postCssOptions()
                }
            ],
            webpackConfig
        );

        // LESS
        this.updateCssLoader(
            'less',
            ['css-loader', 'less-loader'],
            webpackConfig
        );

        // SASS
        this.updateCssLoader(
            'sass',
            [
                'css-loader',
                {
                    loader: 'sass-loader',
                    options: Config.globalVueStyles
                        ? {
                              resources: Mix.paths.root(Config.globalVueStyles),
                              indentedSyntax: true
                          }
                        : { indentedSyntax: true }
                }
            ],
            webpackConfig
        );

        // SCSS
        this.updateCssLoader(
            'scss',
            [
                'css-loader',
                {
                    loader: 'sass-loader',
                    options: Config.globalVueStyles
                        ? {
                              resources: Mix.paths.root(Config.globalVueStyles)
                          }
                        : {}
                }
            ],
            webpackConfig
        );

        // STYLUS
        this.addStylusLoader(webpackConfig);
    }

    /**
     * Update a single CSS loader.
     */
    updateCssLoader(loader, loaders, webpackConfig) {
        let rule = webpackConfig.module.rules.find(rule => {
            return rule.test instanceof RegExp && rule.test.test('.' + loader);
        });

        if (Config.extractVueStyles) {
            let extractPlugin = this.extractPlugin();

            rule.loaders = extractPlugin.extract({
                fallback: 'style-loader',
                use: loaders
            });

            this.addExtractPluginToConfig(extractPlugin, webpackConfig);
        } else {
            loaders.unshift('style-loader');

            rule.loaders = loaders;
        }
    }

    /**
     * Add Stylus loader support.
     */
    addStylusLoader(webpackConfig) {
        let extractPlugin = this.extractPlugin();

        webpackConfig.module.rules.push({
            test: /\.styl(us)?$/,
            loaders: Config.extractVueStyles
                ? extractPlugin.extract({
                      fallback: 'style-loader',
                      use: ['css-loader', 'stylus-loader']
                  })
                : ['style-loader', 'css-loader', 'stylus-loader']
        });

        if (Config.extractVueStyles) {
            this.addExtractPluginToConfig(extractPlugin, webpackConfig);
        }
    }

    /**
     * Fetch the appropriate postcss plugins for the compile.
     */
    postCssOptions() {
        let postCssOptions = { ident: 'postcss' };

        // 1. If there's a mix.postCss() call in webpack.mix.js, we'll use the plugins from that call.
        // 2. If the user has a postcss.config.js file, postcss-loader will automatically read from that.
        // 3. Otherwise, we'll set plugins to an empty array to avoid the compile breaking.

        if (Mix.components.get('postCss')) {
            postCssOptions.plugins = Mix.components.get(
                'postCss'
            ).details[0].postCssPlugins;
        } else if (!File.exists(Mix.paths.root('postcss.config.js'))) {
            postCssOptions.plugins = [];
        }

        return postCssOptions;
    }

    /**
     * Add an extract text plugin to the webpack config plugins array.
     */
    addExtractPluginToConfig(extractPlugin, webpackConfig) {
        if (extractPlugin.isNew) {
            webpackConfig.plugins.push(extractPlugin);
        }
    }

    /**
     * Fetch the appropriate extract plugin.
     */
    extractPlugin() {
        // If the user set extractVueStyles: true, we'll try
        // to append the Vue styles to an existing CSS chunk.
        if (typeof Config.extractVueStyles === 'boolean') {
            let preprocessorName = Object.keys(Mix.components.all())
                .reverse()
                .find(componentName => {
                    return ['sass', 'less', 'stylus', 'postCss'].includes(
                        componentName
                    );
                });

            if (preprocessorName) {
                return Mix.components
                    .get(preprocessorName)
                    .extractPlugins.slice(-1)[0];
            }
        }

        // Otherwise, we'll need to whip up a fresh extract text instance.
        return tap(
            new ExtractTextPlugin(this.extractFileName()),
            extractPlugin => {
                extractPlugin.isNew = true;
            }
        );
    }

    /**
     * Determine the extract file name.
     */
    extractFileName() {
        let fileName =
            typeof Config.extractVueStyles === 'string'
                ? Config.extractVueStyles
                : '/css/vue-styles.css';

        return fileName.replace(Config.publicPath, '').replace(/^\//, '');
    }
}

module.exports = Vue;

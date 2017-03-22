let path = require('path');
let Verify = require('./Verify');

class Api {
    /**
     * Create a new API instance.
     *
     * @param {Mix} Mix
     */
    constructor(Mix) {
        this.Mix = Mix;
    }

    /**
     * Register the Webpack entry/output paths.
     *
     * @param {string|Array}  entry
     * @param {string} output
     */
    js(entry, output) {
        Verify.js(entry, output);

        entry = [].concat(entry).map(file => {
            return new this.Mix.File(path.resolve(file)).parsePath();
        });

        output = new this.Mix.File(output).parsePath();

        if (output.isDir) {
            output = new this.Mix.File(
                path.join(output.path, entry[0].file)
            ).parsePath();
        }

        this.Mix.js = (this.Mix.js || []).concat({ entry, output });

        this.Mix.js.base = output.base.replace(this.Mix.options.publicPath, '');

        return this;
    };


    /**
     * Declare support for the React framework.
     */
    react(entry, output) {
        this.Mix.react = true;

        Verify.dependency(
            'babel-preset-react',
            'npm install babel-preset-react --save-dev'
        );

        this.js(entry, output);

        return this;
    };


    /**
     * Register vendor libs that should be extracted.
     * This helps drastically with long-term caching.
     *
     * @param {Array}  libs
     * @param {string} output
     */
    extract(libs, output) {
        this.Mix.extract = (this.Mix.extract || []).concat({
            libs,
            output: () => {
                if (output) {
                    return output.replace(/\.js$/, '')
                                 .replace(this.Mix.options.publicPath, '');
                }

                return path.join(this.Mix.js.base, 'vendor').replace(/\\/g, '/');
            }
        });

        return this;
    };


    /**
     * Register libraries to automatically "autoload" when
     * the appropriate variable is references in js
     *
     * @param {object} libs
     */
    autoload(libs) {
        let aliases = {};

        Object.keys(libs).forEach(library => {
            [].concat(libs[library]).forEach(alias => {
                aliases[alias] = library;
            });
        });

        this.Mix.autoload = aliases;

        return this;
    };


    /**
     * Enable Browsersync support for the project.
     *
     * @param {object} config
     */
    browserSync(config = {}) {
        if (typeof config === 'string') {
            config = { proxy: config };
        }

        this.Mix.browserSync = config;

        return this;
    };


    /**
     * Register Sass compilation.
     *
     * @param {string} src
     * @param {string} output
     * @param {object} pluginOptions
     */
    sass(src, output, pluginOptions = {}) {
        return this.preprocess(
            'Sass', src, output, pluginOptions
        );
    };


    /**
     * Register Less compilation.
     *
     * @param {string} src
     * @param {string} output
     * @param {object} pluginOptions
     */
    less(src, output, pluginOptions = {}) {
        return this.preprocess(
            'Less', src, output, pluginOptions
        );
    };


    /**
     * Register Stylus compilation.
     *
     * @param {string} src
     * @param {string} output
     * @param {object} pluginOptions
     */
    stylus(src, output, pluginOptions = {}) {
        Verify.dependency(
            'stylus-loader',
            'npm install stylus-loader stylus --save-dev'
        );

        return this.preprocess(
            'Stylus', src, output, pluginOptions
        );
    };


    /**
     * Register a generic CSS preprocessor.
     *
     * @param {string} type
     * @param {string} src
     * @param {string} output
     * @param {object} pluginOptions
     */
    preprocess(type, src, output, pluginOptions) {
        Verify.preprocessor(type, src, output);

        let Preprocessor = require('./Preprocessors/' + type);

        this.Mix.preprocessors = (this.Mix.preprocessors || []).concat(
            new Preprocessor(src, output, pluginOptions, this.Mix.options)
        );

        return this;
    };


    /**
     * Combine a collection of files.
     *
     * @param {string|Array} src
     * @param {string}       output
     */
    combine(src, output) {
        this.Mix.concat.add({ src, output });

        return this;
    };


    /**
     * Alias for this.Mix.combine().
     *
     * @param {string|Array} src
     * @param {string}       output
     */
    scripts(src, output) {
        return this.combine(src, output);
    };


    /**
     * Alias for this.Mix.combine().
     *
     * @param {string|Array} src
     * @param {string}       output
     */
    styles(src, output) {
        return this.combine(src, output);
    };


    /**
     * Identical to this.Mix.combine(), but includes Babel compilation.
     *
     * @param {string|Array} src
     * @param {string}       output
     */
    babel(src, output) {
        this.Mix.concat.add({ src, output, babel: true });

        return this;
    };


    /**
     * Copy one or more files to a new location.
     *
     * @param {string}  from
     * @param {string}  to
     * @param {boolean} flatten
     */
    copy(from, to, flatten = true) {
        this.Mix.copy = this.Mix.copy || [];

        [].concat(from).forEach(src => {
            this.Mix.copy.push({
                from: src,
                to: this.Mix.Paths.root(to),
                flatten: flatten
            });
        });

        return this;
    };


    /**
     * Copy an entire directory to a new location.
     *
     * @param {string} from
     * @param {string} to
     */
    copyDirectory(from, to) {
        return this.copy(from, to, false);
    };


    /**
     * Minify the provided file.
     *
     * @param {string|Array} src
     */
    minify(src) {
        let output = src.replace(/\.([a-z]{2,})$/i, '.min.$1');

        this.Mix.concat.add({ src, output });

        return this;
    };


    /**
     * Enable sourcemap support.
     */
    sourceMaps() {
        this.Mix.sourcemaps = (this.Mix.inProduction ? false : '#inline-source-map');

        return this;
    };


    /**
     * Enable compiled file versioning.
     *
     * @param {string|Array} files
     */
    version(files = []) {
        this.Mix.options.versioning = true;
        this.Mix.version = [].concat(files);

        return this;
    };


    /**
     * Disable all OS notifications.
     */
    disableNotifications() {
        this.Mix.options.notifications = false;

        return this;
    };


    /**
     * Set the path to your public folder.
     *
     * @param {string} path
     */
    setPublicPath(path) {
        this.Mix.options.publicPath = this.Mix.publicPath = new this.Mix.File(path)
            .parsePath()
            .pathWithoutExt;

        return this;
    };


    /**
     * Set prefix for generated asset paths
     *
     * @param {string} path
     */
    setResourceRoot(path) {
        this.Mix.options.resourceRoot = path;

        return this;
    };


    /**
     * Merge custom config with the provided webpack.config file.
     *
     * @param {object} config
     */
    webpackConfig(config) {
        this.Mix.webpackConfig = config;

        return this;
    }


    /**
     * Set Mix-specific options.
     *
     * @param {object} options
     */
    options(options) {
        if (options.purifyCss) {
            options.purifyCss = require('./PurifyPaths').build(options.purifyCss);

            Verify.dependency(
                'purifycss-webpack',
                'npm install purifycss-webpack --save-dev',
                true // abortOnComplete
            );
        }

        this.Mix.options.merge(options);

        return this;
    };


    /**
     * Register a Webpack build event handler.
     *
     * @param {Function} callback
     */
    then(callback) {
        this.Mix.events.listen('build', callback);

        return this;
    }
}

module.exports = Api;

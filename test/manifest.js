import test from 'ava';
import mix from '../src/index';
import Manifest from '../src/Manifest';
import ObjectValues from 'lodash/values';

let manifestPath = null;
let manifestFile = null;
let cssFile = null;
let jsFile = null;
let manifest = null;

let json = '{"/js/app.js":"/js/app.js","/css/app.css":"/css/app.css","/css/forum.css":"/css/forum.css","/js/admin.js":"/js/admin.js"}';

test.before(t => {
    manifestPath = path.resolve(__dirname, 'mix-manifest.json');
    manifestFile = new File(manifestPath).write(json);

    cssFile = new File(path.resolve(__dirname, 'fixtures/app.css')).write('css file');
    jsFile = new File(path.resolve(__dirname, 'fixtures/app.js')).write('js file');

    global.options.publicPath = __dirname;

    manifest = new Manifest();
});


test.after.always(t => {
    manifestFile.delete();
    cssFile.delete();
    jsFile.delete();
});


test('that the mix-manifest.json file exists', t => {
    t.is(manifest.exists(), true);
});


test('that it reads parses the JSON from the manifest', t => {
    t.deepEqual(manifest.read(), JSON.parse(json));
});


test('that it transforms the Webpack stats to a format we require', t => {
    let transformed = manifest.transform({
        assetsByChunkName: {
            app: [
                '/js/app.js',
                '/css/app.css',
                '/css/forum.css',
                '\\admin\\js/manifest.js'
            ],

            admin: '/js/admin.js'
        }
    });

    t.deepEqual({
        '/js/app.js': '/js/app.js',
        '/css/app.css': '/css/app.css',
        '/css/forum.css': '/css/forum.css',
        '/admin/js/manifest.js': '/admin/js/manifest.js',
        '/js/admin.js': '/js/admin.js'
    }, JSON.parse(transformed));
});


test('that it can remove the manifest file', t => {
    let filesToDelete = ObjectValues(manifest.read());

    filesToDelete.forEach(f => {
        manifest.remove(path.resolve(__dirname, f));
    });
});

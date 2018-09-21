// TODO:
// simplify this build... no args, only tasks and subtasks
// future command list:
// - gulp bundle
// - - gulp test-clean
// - - gulp library-clean
// - - gulp library-rollup
// - - gulp library-min
// - - (watch of involved files)
// - gulp test
// - - gulp library-clean
// - - gulp test-clean
// - - gulp test-css
// - - gulp test-html
// - - (watch of involved files)
// - gulp test-es5
// - - gulp bundle
// - - gulp test-clean
// - - gulp test-rollup
// - - gulp test-css
// - - gulp test-html
// - - (watch of involved files)

'use strict';

const arg = (argList => {
    let arg = {},
        a,
        opt,
        thisOpt,
        curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {
            if (curOpt) {
                arg[curOpt] = opt;
            }

            curOpt = null;
        } else {
            curOpt = opt;

            arg[curOpt] = true;
        }
    }

    return arg;
})(process.argv);

const gulp = require('gulp');
const watch = require('gulp-watch');
const gulpif = require('gulp-if');
const pump = require('pump');
const rename = require('gulp-rename');
const rollup = require('gulp-better-rollup');
const sourcemaps = require('gulp-sourcemaps');
const csso = require('gulp-csso');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const minify = require('gulp-minify');
const autoprefixer = require('autoprefixer');
const log = require('fancy-log');
const hb = require('gulp-hb');
const clone = require('gulp-clone');

const production = !arg.development;
const clearRequire = module => {
    delete require.cache[require.resolve(module)];
    return require(module);
};
const buildConfig = require('./build.json')[0];
const resources = buildConfig.resources;
let processedFiles = {
    css: [],
    js: [],
    html: []
};

gulp.task('build-js', callback => {
    let pipe = [];

    processedFiles.js = [];

    resources.forEach(resource => {
        if ('js' in resource.files && resource.files.js.list.length) {
            const src = 'src' in resource.files.js ? resource.files.css.js : resource.paths.src;
            const dst = 'dist' in resource.files.js ? resource.files.css.js : resource.paths.dist;

            resource.files.js.list.forEach(filename => {
                const source = src + filename;

                processedFiles.js.push(source);

                const cloneSink = clone.sink();

                pipe = pipe.concat([
                    // transpilation
                    gulp.src(source),
                    sourcemaps.init(),
                    gulpif(
                        'module' in resource.files.js && !!resource.files.js.module,
                        rollup(
                            {},
                            {
                                name: resource.files.js.module,
                                format: 'umd'
                            }
                        ).on('error', err => log(err))
                    ),
                    babel().on('error', err => log(err)),
                    cloneSink,
                    gulp.dest(dst),
                    // minification copy stream
                    cloneSink.tap(),
                    minify({ ext: { min: '.min.js' } }),
                    sourcemaps.write('.'),
                    gulp.dest(dst)
                ]);
            });
        }
    });

    pump(pipe, callback);
});

gulp.task('build-css', callback => {
    let pipe = [];

    resources.forEach(resource => {
        if ('css' in resource.files && resource.files.css.list.length) {
            const src = 'src' in resource.files.css ? resource.files.css.src : resource.paths.src;
            const dst = 'dist' in resource.files.css ? resource.files.css.src : resource.paths.dist;

            resource.files.css.list.forEach(filename => {
                const source = src + filename;

                processedFiles.css.push(source);

                const cloneSink = clone.sink();

                pipe = pipe.concat([
                    // transpilation
                    gulp.src(source),
                    sourcemaps.init(),
                    sass({ outputStyle: 'nested', onError: err => log(err) }),
                    postcss([autoprefixer()]).on('error', err => log(err)),
                    cloneSink,
                    cloneSink.tap(),
                    sourcemaps.write('.'),
                    gulp.dest(dst),
                    // minification copy stream
                    cloneSink.tap(),
                    csso(),
                    rename({ suffix: '.min' }),
                    sourcemaps.write('.'),
                    gulp.dest(dst)
                ]);
            });
        }
    });

    pump(pipe, callback);
});

gulp.task('build-html', callback => {
    let pipe = [];

    resources.forEach(resource => {
        if ('hbs' in resource.files && resource.files.hbs.list.length) {
            const src = 'src' in resource.files.hbs ? resource.files.hbs.src : resource.paths.src;
            const dst = 'dist' in resource.files.hbs ? resource.files.hbs.dist : resource.paths.dist;

            resource.files.hbs.list.forEach(filename => {
                const source = src + filename;

                processedFiles.html.push(source);

                const path = source.replace('.hbs', '');
                const jsons = path + '.json';
                const data = clearRequire(jsons);

                processedFiles.html.push(path + '.json');

                const hbs = path + '.*.hbs';
                processedFiles.html.push(hbs);

                pipe = pipe.concat([
                    gulp.src(source),
                    hb({ bustCache: true })
                        .data(data)
                        .data({
                            library: {
                                src: `../${production ? 'dist' : 'src'}/griddie${production ? '.min' : ''}.js`, // you'll need #enable-experimental-web-platform-features flag enabled under chrome://flags
                                type: !production ? 'module' : 'text/javascript',
                                attrs: ''
                            },
                            js: {
                                src: `assets/${production ? 'dist' : 'src'}/test${production ? '.min' : ''}.js`,
                                type: !production ? 'module' : 'text/javascript',
                                attrs: !production ? 'defer' : ''
                            },
                            css: `assets/dist/test${production ? '.min' : ''}.css`,
                            title: `Griddie.js ${production ? 'Playground' : 'Dev'}`
                        })
                        .partials(hbs),
                    rename({ extname: '.html' }),
                    gulp.dest(dst)
                ]);
            });
        }
    });

    pump(pipe, callback);
});

gulp.task('js', ['build-js'], () => gulp.watch(processedFiles.js, ['build-js']));
gulp.task('css', ['build-css'], () => gulp.watch(processedFiles.css, ['build-css']));
gulp.task('html', ['build-html'], () => gulp.watch(processedFiles.html, ['build-html']));
gulp.task('default', ['build-js', 'build-css', 'build-html'], () => {
    gulp.watch(processedFiles.js, ['build-js']);
    gulp.watch(processedFiles.css, ['build-css']);
    gulp.watch(processedFiles.html, ['build-html']);
});

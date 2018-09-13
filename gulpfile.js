// command list:
// gulp
// gulp --development
// gulp --development --nowatch
// gulp --debugger

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

const production = !arg.development;
const debug = arg.debugger;

const gulp = require('gulp');
const watch = require('gulp-watch');
const gulpif = require('gulp-if');
const pump = require('pump');
const rename = require('gulp-rename');
//const del = require('del');
const rollup = require('gulp-better-rollup');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const minify = require('gulp-minify');
const autoprefixer = require('autoprefixer');
const log = require('fancy-log');
const clear = require('clear');
const hb = require('gulp-hb');

const resources = [
    {
        paths: {
            src: './src/',
            dist: './dist/'
        },
        files: {
            js: {
                module: 'Griddie',
                list: ['griddie.js']
            }
        }
    },
    {
        paths: {
            src: './test/assets/src/',
            dist: './test/assets/dist/'
        },
        files: {
            js: { list: ['test.js'] },
            css: { list: ['test.scss'] },
            hbs: { list: ['index.html'], dist: './test/' }
        }
    }
];

const sourcemapsConf = { loadMaps: true, largeFile: true };

let processedFiles = [];
resources.forEach(resource => {
    for (let type in resource.files) {
        processedFiles = processedFiles.concat(resource.paths.src + resource.files[type].list);
    }
});

let pumpCounter = 0;
const pumpCallback = args => {
    pumpCounter++;

    if (pumpCounter === processedFiles.length) {
        args[0]();
    }
};

gulp.task('build', callback => {
    pumpCounter = 0;

    resources.forEach(resource => {
        // js files
        if ('js' in resource.files && resource.files.js.list.length) {
            const src = 'src' in resource.files.js ? resource.files.css.js : resource.paths.src;
            const dst = 'dist' in resource.files.js ? resource.files.css.js : resource.paths.dist;
            const isModule = 'module' in resource.files.js && !!resource.files.js.module;
            const moduleConf = {
                name: resource.files.js.module,
                format: 'umd'
            };

            resource.files.js.list.forEach(filename => {
                pump(
                    [
                        // rollup modules + transpilation to ES5 (production only)
                        gulp.src(src + filename),
                        gulpif(production, sourcemaps.init(sourcemapsConf)),
                        gulpif(isModule, rollup({}, moduleConf).on('error', err => log(err))),
                        gulpif(production, babel().on('error', err => log(err))),
                        gulpif(production, sourcemaps.write('.')),
                        gulp.dest(dst),

                        // minification (production only)
                        gulpif(production, gulp.src(src + filename)),
                        gulpif(production, sourcemaps.init(sourcemapsConf)),
                        gulpif(production && isModule, rollup({}, moduleConf).on('error', err => log(err))),
                        gulpif(production, babel().on('error', err => log(err))),
                        gulpif(production, minify({ ext: { min: '.min.js' } })),
                        gulpif(production, sourcemaps.write('.')),
                        gulpif(production, gulp.dest(dst))
                    ],
                    pumpCallback.bind(this, [callback])
                );
            });
        }

        // css files
        if ('css' in resource.files && resource.files.css.list.length) {
            const src = 'src' in resource.files.css ? resource.files.css.src : resource.paths.src;
            const dst = 'dist' in resource.files.css ? resource.files.css.src : resource.paths.dist;

            resource.files.css.list.forEach(filename => {
                pump(
                    [
                        // transpilation to standard CSS
                        gulp.src(src + filename),
                        gulpif(production, sourcemaps.init(sourcemapsConf)),
                        sass({ outputStyle: 'expanded', onError: err => log(err) }),
                        postcss([autoprefixer()]).on('error', err => log(err)),
                        gulpif(production, sourcemaps.write('.')),
                        gulp.dest(dst),

                        // minification (production only)
                        gulpif(production, gulp.src(src + filename)),
                        gulpif(production, sourcemaps.init(sourcemapsConf)),
                        gulpif(production, sass({ outputStyle: 'compressed', onError: err => log(err) })),
                        gulpif(production, postcss([autoprefixer()])).on('error', err => log(err)),
                        gulpif(production, rename({ suffix: '.min' })),
                        gulpif(production, sourcemaps.write('.')),
                        gulpif(production, gulp.dest(dst))
                    ],
                    pumpCallback.bind(this, [callback])
                );
            });
        }

        // template files
        if ('hbs' in resource.files && resource.files.hbs.list.length) {
            const src = 'src' in resource.files.hbs ? resource.files.hbs.src : resource.paths.src;
            const dst = 'dist' in resource.files.hbs ? resource.files.hbs.dist : resource.paths.dist;

            resource.files.hbs.list.forEach(filename => {
                const namespace = filename.replace('.html', '');

                log(src + namespace + '.json');

                pump(
                    [
                        gulp.src(src + filename),
                        hb()
                            .data(src + namespace + '.json')
                            //.helpers(src + '*.js')
                            .partials(src + namespace + '.*.hbs'),
                        gulp.dest(dst)
                    ],
                    pumpCallback.bind(this, [callback])
                );
            });
        }
    });

    if (!production && !arg.nowatch) {
        gulp.watch('./**/src/*.{scss,index,json,hbs,js}', ['default']);
    }
});

gulp.task('default', ['build'], () => {
    if (!debug) {
        clear();
        log('');
    }
    log('--------------------------------------');
    log('Build: ' + (production ? 'Production' : 'Development'));
    log('--------------------------------------');
    log(processedFiles);
    log('--------------------------------------');
    log('');
});

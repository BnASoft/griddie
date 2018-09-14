// command list:
// gulp
// gulp --development
// gulp --development --nowatch

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
const gulp = require('gulp');
const watch = require('gulp-watch');
const gulpif = require('gulp-if');
const pump = require('pump');
const rename = require('gulp-rename');
const rollup = require('gulp-better-rollup');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const minify = require('gulp-minify');
const autoprefixer = require('autoprefixer');
const log = require('fancy-log');
const hb = require('gulp-hb');

const sourcemapsConf = { loadMaps: true, largeFile: true };
const doWatch = !production && !arg.nowatch;

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
            hbs: { list: ['index.hbs'], dist: './test/' }
        }
    }
];

gulp.task('_js', callback =>
    resources.forEach(resource => {
        if ('js' in resource.files && resource.files.js.list.length) {
            const src = 'src' in resource.files.js ? resource.files.css.js : resource.paths.src;
            const dst = 'dist' in resource.files.js ? resource.files.css.js : resource.paths.dist;

            resource.files.js.list.forEach(filename =>
                pump(
                    [
                        gulp.src(src + filename),
                        gulpif(production, sourcemaps.init(sourcemapsConf)),
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
                        gulpif(production, babel().on('error', err => log(err))),
                        //gulpif(production, minify({ ext: { min: '.min.js' } })),
                        gulpif(production, sourcemaps.write('.')),
                        gulp.dest(dst)
                    ],
                    callback
                )
            );
        }
    })
);

gulp.task('_css', callback =>
    resources.forEach(resource => {
        if ('css' in resource.files && resource.files.css.list.length) {
            const src = 'src' in resource.files.css ? resource.files.css.src : resource.paths.src;
            const dst = 'dist' in resource.files.css ? resource.files.css.src : resource.paths.dist;

            resource.files.css.list.forEach(filename =>
                pump(
                    [
                        gulp.src(src + filename),
                        gulpif(production, sourcemaps.init(sourcemapsConf)),
                        sass({ outputStyle: 'expanded', onError: err => log(err) }),
                        //gulpif(production, sass({ outputStyle: 'compressed', onError: err => log(err) })),
                        //gulpif(production, rename({ suffix: '.min' })),
                        postcss([autoprefixer()]).on('error', err => log(err)),
                        gulpif(production, sourcemaps.write('.')),
                        gulp.dest(dst)
                    ],
                    callback
                )
            );
        }
    })
);

gulp.task('_hbs', callback =>
    resources.forEach(resource => {
        if ('hbs' in resource.files && resource.files.hbs.list.length) {
            const src = 'src' in resource.files.hbs ? resource.files.hbs.src : resource.paths.src;
            const dst = 'dist' in resource.files.hbs ? resource.files.hbs.dist : resource.paths.dist;

            resource.files.hbs.list.forEach(filename => {
                const path = src + filename.replace('.hbs', '');
                const data = require(path + '.json');

                pump(
                    [
                        gulp.src(src + filename),
                        hb()
                            .data(data)
                            .partials(path + '.*.hbs'),
                        gulp.dest(dst),
                        gulp.src(src + '.hbs'),
                        rename({ extname: '.html' }),
                        gulp.dest(dst)
                    ],
                    callback
                );
            });
        }
    })
);

gulp.task('js', ['_js']);
gulp.task('css', ['_css']);
gulp.task('hbs', ['_hbs']);
gulp.task('default', ['_js', '_css', '_hbs']);

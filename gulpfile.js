// TODO:
// simplify this build... no args, only tasks and subtasks
// future command list:
// - gulp bundle
// - - gulp playground-clean
// - - gulp library-clean
// - - gulp library-scripts
// - - gulp library-min
// - - (watch of involved files)
// - gulp test
// - - gulp library-clean
// - - gulp playground-clean
// - - gulp playground-styles
// - - gulp playground-html
// - - (watch of involved files)
// - gulp playground-es5
// - - gulp bundle
// - - gulp playground-clean
// - - gulp playground-scripts
// - - gulp playground-styles
// - - gulp playground-html
// - - (watch of involved files)

'use strict';

const clearRequire = module => {
    delete require.cache[require.resolve(module)];
    return require(module);
};
const gulp = require('gulp');
const watch = require('gulp-watch');
const pump = require('pump');
const rename = require('gulp-rename');
const rollup = require('gulp-better-rollup');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const del = require('del');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const minify = require('gulp-minify');
const autoprefixer = require('autoprefixer');
const log = require('fancy-log');
const hb = require('gulp-hb');
const configuration = require('./gulpfile.json')[0];

let processedFiles = {
    js: [],
    scss: [],
    html: [],
    json: []
};

// - - - - - - -
// micro tasks
// - - - - - - -
// library:
// cleanup
gulp.task('library-clean', done => {
    del.sync('./dist/');
    done();
});
// rollup js includes and transpile
gulp.task('library-js', callback => {
    pump(
        [
            gulp.src('./src/griddie.js'),
            sourcemaps.init(configuration.sourcemaps),
            rollup(
                {},
                {
                    ...configuration.rollup,
                    name: 'Griddie'
                }
            ).on('error', err => log(err)),
            babel().on('error', err => log(err)),
            sourcemaps.write('.'),
            gulp.dest('./dist/')
        ],
        callback
    );
});
// minify js
gulp.task('library-js-min', callback => {
    pump(
        [
            gulp.src('./src/griddie.js'),
            sourcemaps.init(configuration.sourcemaps),
            rollup(
                {},
                {
                    ...configuration.rollup,
                    name: 'Griddie'
                }
            ).on('error', err => log(err)),
            minify({ ext: { min: '.min.js' } }),
            sourcemaps.write('.'),
            gulp.dest('./dist/')
        ],
        callback
    );
});
// test:
// cleanup
gulp.task('playground-clean', done => {
    del.sync('./test/assets/dist/');
    del.sync('./test/index.html');
    done();
});
// transpile css
gulp.task('playground-scss', callback => {
    pump(
        [
            gulp.src('./test/assets/src/test.scss'),
            sourcemaps.init(configuration.sourcemaps),
            sass(configuration.sass).on('error', err => log(err)),
            postcss([autoprefixer()]).on('error', err => log(err)),
            sourcemaps.write('.'),
            gulp.dest('./test/assets/dist/')
        ],
        callback
    );
});
// rollup js includes and transpile
gulp.task('playground-js', callback =>
    pump(
        [
            /*gulp.src(),
            sourcemaps.init(configuration.sourcemaps),
            rollup({}, {...configuration.rollup, name : "GriddieTest"}).on('error', err => log(err)),
            babel().on('error', err => log(err)),
            sourcemaps.write('.'),
            gulp.dest(resource.paths.dist)*/
        ],
        callback
    )
);
// build handlebar
gulp.task('playground-html', callback =>
    pump(
        [
            /*gulp.src(source),
            hb(configuration.hbs)
                .data(clearRequire('test/assets/src/index.json'))
                .data()
                .partials(),
            rename({ extname: '.html' }),
            gulp.dest(dst)*/
        ],
        callback
    )
);
// build handlebar es5
gulp.task('playground-html', callback =>
    pump(
        [
            /*gulp.src(source),
            hb(configuration.hbs)
                .data(clearRequire('test/assets/src/index.json'))
                .data()
                .partials(),
            rename({ extname: '.html' }),
            gulp.dest(dst)*/
        ],
        callback
    )
);
// - - - - - - -

// - - - - - - -
// main tasks
// - - - - - - -
// clean all
gulp.task('clean', ['library-clean', 'playground-clean']);
// bundle library distribution
gulp.task('bundle', ['playground-clean', 'library-js', 'library-js-min'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// setup test page
gulp.task('playground', ['playground-clean', 'playground-scss', 'playground-html'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// setup test page (old browsers)
gulp.task('playground-es5', ['playground-clean', 'playground-scss', 'playground-js', 'playground-html-es5'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// - - - - - - -

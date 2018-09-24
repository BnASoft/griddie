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

// - - - - - - -
// micro tasks
// - - - - - - -
// library:
// cleanup
gulp.task('library-clean', done => {
    del.sync('dist');
    done();
});
// rollup js includes and transpile
gulp.task('library-rollup', callback =>
    pump(
        [
            /*gulp.src(),
            sourcemaps.init(configuration.sourcemaps),
            rollup({}, {...configuration.rollup, name : "Griddie"}).on('error', err => log(err)),
            babel().on('error', err => log(err)),
            sourcemaps.write('.'),
            gulp.dest(resource.paths.dist)*/
        ],
        callback
    )
);
// minify js
gulp.task('library-min', callback =>
    pump(
        [
            /*gulp.src(resource.paths.src + filename),
            sourcemaps.init(configuration.sourcemaps),
            rollup({}, {...configuration.rollup, name : "Griddie"}).on('error', err => log(err)),
            babel().on('error', err => log(err)),
            minify({ ext: { min: '.min.js' } }),
            sourcemaps.write('.'),
            gulp.dest(resource.paths.dist)*/
        ],
        callback
    )
);
// test:
// cleanup
gulp.task('test-clean', done => {
    del.sync('test/assets/dist');
    del.sync('test/index.html');
    done();
});
// transpile css
gulp.task('test-css', callback => {
    pump(
        [
            /*gulp.src(),
            sourcemaps.init(configuration.sourcemaps),
            sass({...configuration.sass, { onError: err => log(err) }}),
            postcss([autoprefixer()]).on('error', err => log(err)),
            sourcemaps.write('.'),
            gulp.dest(resource.paths.dist)*/
        ],
        callback
    );
});
// rollup js includes and transpile
gulp.task('test-rollup', callback =>
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
gulp.task('test-html', callback =>
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
gulp.task('test-html', callback =>
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
gulp.task('clean', ['library-clean', 'test-clean']);
// bundle library distribution
gulp.task('bundle', ['test-clean', 'library-clean', 'library-rollup', 'library-min'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// setup test page
gulp.task('test', ['library-clean', 'test-clean', 'test-css', 'test-html'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// setup test page (old browsers)
gulp.task('test-es5', ['library-clean', 'test-clean', 'test-css', 'test-rollup', 'test-html-es5'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// - - - - - - -

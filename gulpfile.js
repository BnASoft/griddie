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
    const source = './src/griddie.js';

    processedFiles.js.push(source);

    pump(
        [
            gulp.src(source),
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
    const source = './src/griddie.js';

    processedFiles.js.push(source);

    pump(
        [
            gulp.src(source),
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
gulp.task('page-clean', done => {
    del.sync('./test/assets/dist/');
    del.sync('./test/index.html');
    done();
});
// transpile css
gulp.task('page-scss', callback => {
    const source = './test/assets/src/test.scss';

    processedFiles.scss.push(source);

    pump(
        [
            gulp.src(source),
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
gulp.task('page-js', callback => {
    const source = './test/assets/src/test.js';

    processedFiles.js.push(source);

    pump(
        [
            gulp.src(source),
            sourcemaps.init(configuration.sourcemaps),
            rollup({}, configuration.rollup).on('error', err => log(err)),
            babel().on('error', err => log(err)),
            sourcemaps.write('.'),
            gulp.dest('./test/assets/dist/')
        ],
        callback
    );
});
// build handlebar
gulp.task('page-html', callback => {
    const page = './test/assets/src/index.hbs';
    const partials = './test/assets/src/index.*.hbs';
    const json = './test/assets/src/index.json';

    processedFiles.html.push(page);
    processedFiles.html.push(partials);
    processedFiles.json.push(json);

    pump(
        [
            gulp.src(page),
            hb(configuration.hbs)
                .data(clearRequire(json))
                .data({
                    modules: true
                })
                .partials(partials),
            rename({ extname: '.html' }),
            gulp.dest('./test/')
        ],
        callback
    );
});
// build handlebar es5
gulp.task('page-html-es5', callback => {
    const page = './test/assets/src/index.hbs';
    const partials = './test/assets/src/index.*.hbs';
    const json = './test/assets/src/index.json';

    processedFiles.html.push(page);
    processedFiles.html.push(partials);
    processedFiles.json.push(json);

    pump(
        [
            gulp.src(page),
            hb(configuration.hbs)
                .data(clearRequire(json))
                .data({
                    modules: false
                })
                .partials(partials),
            rename({ extname: '.html' }),
            gulp.dest('./test/')
        ],
        callback
    );
});
// - - - - - - -

// - - - - - - -
// main tasks
// - - - - - - -
// bundle library distribution
gulp.task('bundle', ['library-js', 'library-js-min'], () => {
    gulp.watch(processedFiles.js, ['library-js', 'library-js-min']);
});
// setup test page
gulp.task('page', ['page-clean', 'page-scss', 'page-html'], () => {
    gulp.watch(processedFiles.scss, ['page-scss']);
    gulp.watch([...processedFiles.html, processedFiles.json], ['page-html']);
});
// setup test page (old browsers)
gulp.task('page-es5', ['page-clean', 'page-scss', 'page-js', 'page-html-es5'], () => {
    gulp.watch(processedFiles.scss, ['page-scss']);
    gulp.watch([...processedFiles.html, processedFiles.json], ['page-html']);
    gulp.watch(processedFiles.js, ['page-js']);
});
// clean all
gulp.task('clean', ['library-clean', 'page-clean']);
// default task
gulp.task('default', ['clean', 'library-js', 'library-js-min', 'page-scss', 'page-html']);
// - - - - - - -

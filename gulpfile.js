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
const configuration = require('./gulpfile.json')[0];
const resources = configuration.resources;

let processed = {
    css: [],
    js: [],
    html: []
};

// - - - - - - -
// micro tasks
// - - - - - - -
// library:
// cleanup
gulp.task('library-clean', callback => {});
// rollup js includes and transpile
gulp.task('library-rollup', callback => {});
// minify js
gulp.task('library-min', callback => {});
// test:
// cleanup
gulp.task('test-clean', callback => {});
// transpile css
gulp.task('test-css', callback => {});
// rollup js includes and transpile
gulp.task('test-rollup', callback => {});
// build handlebar
gulp.task('test-html', callback => {});
// - - - - - - -

// - - - - - - -
// main tasks
// - - - - - - -
// bundle library distribution
gulp.task('bundle', ['test-clean', 'library-clean', 'library-rollup', 'library-min'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// setup test page
gulp.task('test', ['library-clean', 'test-clean', 'test-css', 'test-html'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// setup test page (old browsers)
gulp.task('test-es5', ['library-clean', 'test-clean', 'test-css', 'test-html'], () => {
    //gulp.watch(/* processed files ... */, [/* tasks ... */]);
});
// - - - - - - -

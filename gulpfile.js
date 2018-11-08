const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

const js = () =>
    gulp
        .src('./*.es6.js', { sourcemaps: true })
        .pipe(babel())
        .pipe(
            rename(opt => {
                opt.basename = opt.basename.replace(/\.es6/, '');
                return opt;
            })
        )
        .pipe(uglify())
        .pipe(gulp.dest('.'));

gulp.task('js:build', js);
gulp.task('js:watch', () => gulp.watch('./*.es6.js', js));

const css = () =>
    gulp
        .src('./*.scss', { sourcemaps: true })
        .pipe(
            sass({
                outputStyle: 'compressed'
            })
        )
        .pipe(gulp.dest('.'));

gulp.task('css:build', css);
gulp.task('css:watch', () => gulp.watch('./*.scss', css));

gulp.task('default', gulp.series(gulp.parallel('js:build', 'css:build'), gulp.parallel('js:watch', 'css:watch')));

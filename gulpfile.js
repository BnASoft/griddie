// command list:
// gulp <task>
// gulp <task> --development

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

                pipe = pipe.concat([
                    gulp.src(source),
                    sourcemaps.init(buildConfig.sourcemaps),
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
                    sourcemaps.write('.'),
                    gulp.dest(dst),

                    gulp.src(source), // FIXME: fix repeated code for minify
                    sourcemaps.init(buildConfig.sourcemaps),
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

                pipe = pipe.concat([
                    gulp.src(source),
                    gulpif(production, sourcemaps.init(buildConfig.sourcemaps)),
                    sass({ outputStyle: 'expanded', onError: err => log(err) }),
                    postcss([autoprefixer()]).on('error', err => log(err)),
                    gulpif(production, sourcemaps.write('.')),
                    gulp.dest(dst),

                    gulp.src(source), // FIXME: fix repeated code for minify
                    sourcemaps.init(buildConfig.sourcemaps),
                    sass({ outputStyle: 'compressed', onError: err => log(err) }),
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
                            library: `../${production ? 'dist' : 'src'}/griddie${production ? '.min' : ''}.js`,
                            js: `assets/${production ? 'dist' : 'src'}/test${production ? '.min' : ''}.js`,
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

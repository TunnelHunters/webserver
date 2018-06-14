const gulp = require('gulp');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');

gulp.task('make-bundle', () => {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/public/js/index.ts']
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('dist/public'));
});

gulp.task('default', ['make-bundle']);

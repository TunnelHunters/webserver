const gulp = require('gulp');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const ts = require('gulp-typescript');
const tsproject = ts.createProject('tsconfig.json');

gulp.task('copy-assets', () => {
    return gulp.src([
        'src/public/**/*',
        '!src/public/js'
    ])
        .pipe(gulp.dest('dist/public'));
});

gulp.task('make-bundle', ['copy-assets'], () => {
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

gulp.task('make-express', () => {
    return tsproject.src()
        .pipe(tsproject())
        .pipe(gulp.dest('dist'))
});

gulp.task('default', ['make-bundle', 'make-express']);

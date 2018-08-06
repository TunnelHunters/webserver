const gulp = require('gulp');
const browserify = require('browserify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const tsproject = ts.createProject('tsconfig.json');

gulp.task('copy-assets', () => {
    return gulp.src([
        'src/public/**/*',
        '!src/public/js'
    ])
        .pipe(gulp.dest('dist/public'));
});

gulp.task('make-control-bundle', () => {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/public/js/robotControl.ts']
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('controlBundle.js'))
        .pipe(gulp.dest('dist/public'));
});

gulp.task('make-select-bundle', () => {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/public/js/robotSelect.ts']
    })
        .plugin(tsify)
        .bundle()
        .pipe(source('selectBundle.js'))
        .pipe(gulp.dest('dist/public'));
});

gulp.task('make-bundles', ['make-select-bundle', 'make-control-bundle']);

gulp.task('make-express', () => {
    return tsproject.src()
        .pipe(sourcemaps.init())
        .pipe(tsproject())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
});

gulp.task('default', ['make-bundles', 'make-express']);

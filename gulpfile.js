var
    jshint = require('gulp-jshint'),
    gulp   = require('gulp'),
    nodeunit = require('gulp-nodeunit'),
    concat = require('gulp-concat'),
    build = require('./tasks/build');

gulp.task('lint', function() {
  return gulp.src(['./src/**/*.js','./test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('src', function() {
  gulp.src([
        './src/decoding-helpers.js',
        './src/ecoding-helpers.js',
        './src/public-methods.js',
        './src/rhythm-maker.js'
    ])
    .pipe(concat('hipku.js'))
    .pipe(build('./src/build-*.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('test', function () {
    gulp.src('./test/**/*_test.js')
        .pipe(nodeunit({
            reporterOptions: {
                output: 'test'
            }
        }));
});

gulp.task('default', ['lint', 'test', 'src']);
'use strict';

var
    build = require('./tasks/build'),
    dictionary = require('./tasks/dictionary'),

    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    nodeunit = require('gulp-nodeunit'),
    concat = require('gulp-concat'),
    gulpIgnore = require('gulp-ignore'),
    rename = require('gulp-rename'),
    wrap = require('gulp-wrap'),
    uglify = require('gulp-uglify');

gulp.task('lint', function() {
    return gulp.src(['./src/**/*.js', './test/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('src', function() {
    gulp.src([
        './src/decoding-helpers.js',
        './src/encoding-helpers.js',
        './src/public-methods.js',
        './src/rhythm-maker.js'
    ])
        .pipe(concat('hipku.js'))
        .pipe(dictionary('./dictionaries/*.yml'))
        .pipe(build('./src/build-*.js'))
        .pipe(wrap({
            src: './src/tmpls/index-tmpl.js'
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(gulpIgnore.exclude(function(f) {

            return (f.path.indexOf('npm.js') !== -1);
        }))
        .pipe(uglify())
        .pipe(rename({
            suffix: '-min',
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('test', function() {
    gulp.src('./test/**/*_test.js')
        .pipe(nodeunit({
            reporterOptions: {
                output: 'test'
            }
        }));
});

gulp.task('default', ['lint', 'test', 'src']);

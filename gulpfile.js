var gulp = require('gulp');
var ts = require('gulp-typescript');
var copy = require('gulp-copy');
var concat = require('gulp-concat');
var serve = require('gulp-serve');
var sequence = require("run-sequence").use(gulp);
var shell = require('gulp-shell');
var less = require('gulp-less');
var download = require('gulp-download');
var rename = require('gulp-rename');

gulp.task('typescript', function() {
  return gulp.src('./ts/**/*.ts')
    .pipe(ts({
        target: 'es5',
        experimentalDecorators: true,
        module: 'commonjs',
          sortoutput: true
    }))
      .pipe(concat('script.js'))
    .pipe(gulp.dest('htdocs/dist'))
});

gulp.task('less', function() {
    return gulp.src('./less/main.less')
        .pipe(less())
        .pipe(gulp.dest('./htdocs/dist'))
});

gulp.task('copy', function() {
    var files = {
        './bower_components/d3/d3.js': './htdocs/dist',
        './bower_components/jquery/dist/jquery.min.js': './htdocs/dist',
        './bower_components/hammerjs/hammer.min.js': './htdocs/dist',
        './bower_components/handlebars/handlebars.min.js': './htdocs/dist',
        './bower_components/localforage/dist/localforage.min.js': './htdocs/dist',
        './bower_components/firebase/firebase.js': './htdocs/dist',
    };

    for(var file in files) {
        console.log(file, '=>', files[file]);
        gulp.src(file)
            .pipe(gulp.dest(files[file]));
    }

    /*download('https://code.angularjs.org/2.0.0-alpha.31/angular2.dev.js')
        .pipe(rename('angular2.js'))
        .pipe(gulp.dest('htdocs/dist/angular2'));

    download('https://code.angularjs.org/2.0.0-alpha.31/router.dev.js')
        .pipe(rename('router.js'))
        .pipe(gulp.dest('htdocs/dist/angular2'));*/
});

gulp.task('serve', serve('htdocs'));

gulp.task('bower', shell.task('bower install'))

gulp.task('watch', function() {
  gulp.watch('./ts/**/*.ts', ['typescript']);
    gulp.watch('./less/**/*.less', ['less']);
});

gulp.task('build', function(cb) {
    sequence('bower', ['copy', 'typescript'], cb);
});
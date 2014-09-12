var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');

var coffee = require('gulp-coffee');

gulp.task('coffee', function() {
  gulp.src('./src/**/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./lib/'))
});

gulp.task('copy-templates', function(){
  gulp.src('./src/**/*.hbs')
  .pipe(gulp.dest('./lib/'));
});

gulp.task('test', ['coffee', 'copy-templates'], function(){
  gulp.src('./test/index.js')
  .pipe(mocha(
    {
      require: ['chai', 'chai-as-promised'],
      reporter: 'nyan',
      growl: true
    }
  ));
});

gulp.task('default', ['test']);

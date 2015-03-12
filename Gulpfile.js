'use strict';
var gulp = require('gulp'),
 runSequence = require('run-sequence'),
 mocha = require('gulp-mocha'),
 eslint = require('gulp-eslint');

gulp.task('lint', function () {

  return gulp.src(['**/*.js'])
    .pipe(eslint('./.eslintrc'))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('test', function(){
  gulp.src(['./test/**/*spec.js'])
  .pipe(mocha(
    {
      require: ['chai', 'chai-as-promised'],
      reporter: 'spec',
      growl: true
    }
  ));
});

gulp.task('build', function(callback) {
  runSequence(
    ['test', 'lint'],
    callback);
});


gulp.task('default', ['build']);

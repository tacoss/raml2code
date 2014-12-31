var gulp = require('gulp');
var del = require('del');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var coffee = require('gulp-coffee');

gulp.task('clean', function (cb) {
  del([
    'lib/**'
  ], cb);
});


gulp.task('coffee', ['clean'], function(cb) {
  gulp.src('./src/**/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./lib/'));
  cb(null);
});

gulp.task('copy-templates', ['clean'], function(cb){
  var stream = gulp.src('./src/**/*.hbs')
  .pipe(gulp.dest('./lib/'));
  return stream;
});

gulp.task('test', ['copy-templates', 'coffee'], function(cb){
  gulp.src(['./test/**/*spec.js'])
  .pipe(mocha(
    {
      require: ['chai', 'chai-as-promised'],
      reporter: 'spec',
      growl: true
    }
  ));
});

gulp.task('default', [ 'test']);

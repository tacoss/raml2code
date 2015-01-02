var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var coffee = require('gulp-coffee');

gulp.task('clean', function (cb) {
  del([
    'lib/**'
  ], cb);
});


gulp.task('coffee',  function() {
  return gulp.src('./src/**/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./lib/'));
});

gulp.task('copy-templates', function(){
  var stream = gulp.src('./src/**/*.hbs')
  .pipe(gulp.dest('./lib/'));
  return stream;
});

gulp.task('test', function(cb){
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
  runSequence('clean',
    ['copy-templates', 'coffee'],
    'test',
    callback);
});


gulp.task('default', ['build']);

var gulp = require('gulp');

var raml2code = require("raml2code");
var genPojos = require("raml2code/lib/generators/groovy/pojo");
var genJaxRS = require("raml2code/lib/generators/groovy/jaxrsInterface");
var genRetrofitClient = require("raml2code/lib/generators/groovy/retrofitClient");

var raml = require('gulp-raml');

var packagePojo = "gex.catapi.dto";
var packageClient = "gex.catapi.client";
var packageJersey = "gex.catapi.resources";

var ramlResource = '../../test/raml/cats.raml'

gulp.task('raml', function() {
  gulp.src(ramlResource)
    .pipe(raml())
    .pipe(raml.reporter('default'))
    .pipe(raml.reporter('fail'));

});


gulp.task("genPojos", ['raml'], function(){
  gulp.src(ramlResource)
    .pipe(raml2code({generator: genPojos, extra: {package: packagePojo}}))
    .pipe(gulp.dest('./src/generated/groovy/gex/catapi/dto'));
});


gulp.task("genRetrofitClient" , ['raml'], function(){
  gulp.src(ramlResource)
    .pipe(raml2code({generator: genRetrofitClient, extra: {package: packageClient, importPojos: packagePojo}}))
    .pipe(gulp.dest('./src/generated/java/gex/catapi/client'));
});


gulp.task("genJaxRS" , ['raml'], function(){
  gulp.src(ramlResource)
    .pipe(raml2code({generator: genJaxRS, extra: {package: packageJersey, importPojos: packagePojo}}))
    .pipe(gulp.dest('./src/generated/groovy/gex/catapi/resources'));
});



gulp.task('build', ['raml', 'genPojos',  'genJaxRS', 'genRetrofitClient']);

gulp.task('default', ['build']);

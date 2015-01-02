# Raml to code generator


[![Build Status](https://img.shields.io/travis/gextech/raml2code/master.svg?style=flat)](https://travis-ci.org/gextech/raml2code)
  
  * This module generate code from a RAML definition
  * It uses Handlebars templates

## It must be defined as Gulp-plugin
```js
var gulp = require('gulp');
var raml2code = require('raml2code');
var genDTO = require("raml2code/lib/generators/groovy/raml2DTO.js");

gulp.task("test", function(){
  gulp.src('./test/cats.raml')
    .pipe(raml2code({generator: genDTO, extra: {package:'com.gex'}}))
    .pipe(gulp.dest('build'));
});

```

## Sample gulpfile

```js
var gulp = require('gulp');

var raml2code = require("raml2code");
var genPojos = require("raml2code/lib/generators/groovy/pojo");
var genJaxRS = require("raml2code/lib/generators/groovy/jaxrsInterface");
var genRetrofitClient = require("raml2code/lib/generators/groovy/retrofitClient");

var raml = require('gulp-raml');

var packagePojo = "gex.catapi.dto";
var packageClient = "gex.catapi.client";
var packageJersey = "gex.catapi.resources";

//this should point to your raml definition
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

```

## We use the Gradle with the gulp plugin to build or loved Java project
(https://www.gradle.org/) [gradle]
(https://github.com/filipblondeel/gradle-gulp-plugin)[gradle-gulp-plugin]

  
## You don't like our generators, DIY

A generator is a simple object with the following properties:

 * Required properties:
    * template -> Handlebars template.
    * parser(data) -> Function it receives RAML parsed data, returns parsed data.
    [{ name: "test.test", model: {title:data.title + " finos"}}]
 * Optional properties:
    * helpers -> Handlebars helpers.  
    * partials -> Handlebars partials. 


## Generators included and tested
    * Groovy POJO
      If the json schema has $ref, it would try to use the title to make references, if the title doesn't exits
      it would generate a inner classes with the name of the property.
      If there are $ref definitions, consider the following http://json-schema.org/latest/json-schema-core.html#anchor30
    * JAX-RS Interface
    * RETROFIT Client


    





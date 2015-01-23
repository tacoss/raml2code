# Raml to code generator

[![Build Status](https://img.shields.io/travis/gextech/raml2code/master.svg?style=flat)](https://travis-ci.org/gextech/raml2code)

## Versioning

The raml2code generator is versioned in the following manner:

```
x.y.z
```

in which *x.y* denotes the version of the [RAML specification](http://raml.org/spec.html)
and *z* is the version of the raml2code.

So *0.8.38* is the 38nd revision of the ralm2code for the *0.8* version
of the [RAML specification](http://raml.org/spec.html).

  * This module generate code from a RAML definition
  * It uses Handlebars templates

## It's a Gulp-plugin
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
[gradle](https://www.gradle.org/)

[gradle-gulp-plugin](https://github.com/filipblondeel/gradle-gulp-plugin)

## And example of project could be found here:
[raml2codeFullSpringExample](https://github.com/atomsfat/raml2codeFullSpringExample)

  
## You don't like our generators, DIY

A generator is a simple object with the following properties:

 * Required properties:
    * template -> Handlebars template (you could use your own templates).
    * parser(data) -> Function it receives RAML parsed data, returns model that will be used in the
     template engine, each model must have a name, this name is the file that will be generated.
    [{ name: "test.test", model: {title:data.title + " finos"}}]
 * Optional properties:
    * helpers -> Handlebars helpers.  
    * partials -> Handlebars partials. 


## Generators included and tested
  * Groovy POJO
    This generator use json-schema spec heavily, when using $ref certain rules apply:
      * If the json schema has $ref and the schema referred has title we will use it to make a reference. For
       example the property owner on:
         [cat.schema.json](src/test/raml/cat.schema.json)
       it will result on the property Owner in [CatDTO.groovy](src/test/examples/CatDTO.groovy)
      * if the json schema has a property of type object like food on :
        [cat.schema.json](src/test/raml/cat.schema.json)
       it will result on a inner class called Food in [CatDTO.groovy](src/test/examples/CatDTO.groovy)

    More info on $ref definitions, http://json-schema.org/latest/json-schema-core.html#anchor30
  * JAX-RS Interface
      We use the optional resource.displayName to name resource classes, if you use this generator don't forget to provide it.
      Example:
      ```groovy
        /cats:
          displayName: Gatitos
      ```
      Will generate GatitosResource

  * RETROFIT Client java interface
  * raml-client-generator javascript client generator from mulesoft
    [raml-client-generator](https://github.com/mulesoft/raml-client-generator)

    





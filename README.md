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

## It's a Gulp-plugin so to try
1. Install gulp
```bash
 npm install -G gulp
```

2. install the generators you needed
```bash
 npm install --save-dev raml2code-groovy-pojo
```

3. configure the gulpfile.js
```js
var gulp = require('gulp');
var raml2code = require('raml2code');
//Install a generators:
var genDTO = require("raml2code-groovy-pojo");

gulp.task("dtos", function(){
  gulp.src('./test/cats.raml')
    .pipe(raml2code({generator: genDTO, extra: {package:'com.gex'}}))
    .pipe(gulp.dest('build'));
});
```

4. Run the generator
```bash
  gulp dtos
```

## Sample gulpfile.js

```js
var gulp = require('gulp');

var raml2code = require("raml2code");
var genPojos = require("raml2code-groovy-pojo");
var genJaxRS = require("raml2code-jaxrs-interfaces");
var genRetrofitClient = require("raml2code-retrofit");

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


## A full example of using using raml2code could be found here:
[raml2code-Example](https://github.com/atomsfat/raml2code-example)

## We use the Gradle with the gulp plugin to build and integrate with Java.
[gradle](https://www.gradle.org/)

[gradle-gulp-plugin](https://github.com/filipblondeel/gradle-gulp-plugin)


  
## You can make your own generators, DIY

A generator is a simple object with the following properties:

 * Required properties:
    * template -> Handlebars template (you could use your own templates).
    * parser(data) -> Function it receives RAML parsed data, returns model that will be used in the
     template engine, each model must have a name, this name is the file that will be generated.
    [{ name: "test.test", model: {title:data.title + " finos"}}]
 * Optional properties:
    * helpers -> Handlebars helpers.  
    * partials -> Handlebars partials.


## Generators create and in use by GEX.
  * [raml2code-groovy-pojo](https://www.npmjs.com/package/raml2code-pojo)
  * [raml2code-jaxrs-interfaces](https://www.npmjs.com/package/raml2code-jaxrs-interfaces)
  * [raml2code-js-client-mulesoft](https://www.npmjs.com/package/raml2code-js-client-mulesoft)
  * [raml2code-retrofit](https://www.npmjs.com/package/raml2code-retrofit)

If you create a generator let us know to add to this list.

    





:q>:# Raml to code generator

[![Build Status](https://img.shields.io/travis/gextech/raml2code/master.svg?style=flat)](https://travis-ci.org/gextech/raml2code)

## It's a Gulp-plugin so to try
1. Install gulp
```bash
 npm install -G gulp
```

2. install the generators you needed
```bash
 npm install --save-dev raml2code
 npm install --save-dev raml2code-groovy-pojo
```

3. configure the gulpfile.js
```js
var gulp = require('gulp');
var raml2code = require('raml2code');
//Install a generators:
var genDTO = require("raml2code-retrofit");

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

## Generators create and in use by GEX.
  * [raml2code-groovy-pojo](https://www.npmjs.com/package/raml2code-groovy-pojo)
  * [raml2code-jaxrs-interfaces](https://www.npmjs.com/package/raml2code-jaxrs-interfaces)
  * [raml2code-js-client-mulesoft](https://www.npmjs.com/package/raml2code-js-client-mulesoft)
  * [raml2code-retrofit](https://www.npmjs.com/package/raml2code-retrofit)

If you create a generator let us know to add to this list.

## A full example of using using raml2code could be found here:
[raml2code-Example](https://github.com/atomsfat/raml2code-example)

## You can make your own generators, DIY
[Generator specification](https://github.com/gextech/data2code/blob/master/Generator.md)

### We use the Gradle with the gulp plugin to build and integrate with Java.
[gradle](https://www.gradle.org/)

[gradle-gulp-plugin](https://github.com/filipblondeel/gradle-gulp-plugin)



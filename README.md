# Raml to code generator

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/gextech/raml2code?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
  
  * This module generate code from a RAML definition
  * It uses Handlebars templates
  
## Defining a Generator

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


    
## Gulp-plugin
```
var gulp = require('gulp');
var raml2code = require('raml2code');
var genDTO = require("raml2code/lib/generators/groovy/raml2DTO.js");

gulp.task("test", function(){
  gulp.src('./test/cats.raml')
    .pipe(raml2code({generator: genDTO, extra: {package:'com.gex'}}))
    .pipe(gulp.dest('build'));
});

```




# Raml to code generator
  
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


## generators included and tested
    * raml to Groovy pojo
    
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




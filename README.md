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


## generators included
    * raml to DTO groovy
    
## As gulp-plugin
```
var gulp = require('gulp');
var data2code = require('raml2code');
var gen = require('raml2code/raml2DTO.js')

gulp.task("test", function(){
  gulp.src('./test/cats.raml')
    .pipe(data2code({generator:gen}))
    .pipe(gulp.dest('build'));
});

```

## As command line 


 ```bash
  node lib/raml2code.js -i test/cats.raml -g "./generators/groovy/raml2DTO.js" -o target -e '{"package":"gex.dt"}'
```


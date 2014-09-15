var raml2code =require('../..');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var genDTO = require("../../lib/generators/groovy/pojo")
var wrapAssertion = require("../helpers").wrapAssertion;

console.log(wrapAssertion);

describe('RAML to Groovy ', function () {

  it('DTO from RAML file', function(done) {

    var raml2codeInstance = raml2code({generator:genDTO, extra: {package: 'org.gex'}});
    var ramlPath = path.join(__dirname, '../raml/cats.raml');
    var examplePath = path.join(__dirname, '../examples/CatDTO.groovy');

    var ramlContents = fs.readFileSync(ramlPath);
    var exampleContents = fs.readFileSync(examplePath);

    raml2codeInstance.write(new gutil.File({
      path: ramlPath,
      contents: ramlContents
    }));

    raml2codeInstance.on('data', function(file){
      console.log('what', file.path);
      if(file.path == 'CatDTO.groovy'){
        wrapAssertion(function () {
          file.isBuffer().should.equal(true);
          var content = file.contents.toString('utf8');
          console.log("-----");
          console.log(content);
          console.log("-----");
          exampleContents = exampleContents.toString('utf8').split('\n');
          content.split('\n').forEach(function(e,i){
            e.should.equal(exampleContents[i]);
          });
        }, done);
      }
    });

    raml2codeInstance.on('error', function(error) {
      console.log("error", error);
    });

  });

});

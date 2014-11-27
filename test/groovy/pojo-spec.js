var raml2code = require('../..');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var wrapAssertion = require("../helpers").wrapAssertion;


var chai = require('chai');
chai.should();

describe('should generate a Pojo', function () {

  var test = function (done, sampleFile, extra) {
    var genDTO = require("../../lib/generators/groovy/pojo");
    var raml2codeInstance = raml2code({generator: genDTO, extra: extra});
    var ramlPath = path.join(__dirname, '../raml/cats.raml');
    var examplePath = path.join(__dirname, sampleFile);

    var ramlContents = fs.readFileSync(ramlPath);
    var exampleContents = fs.readFileSync(examplePath);

    raml2codeInstance.write(new gutil.File({
      path: ramlPath,
      contents: ramlContents
    }));

    raml2codeInstance.on('data', function (file) {
      if (file.path == 'v1/Cat.groovy') {
        wrapAssertion(function () {
          file.isBuffer().should.equal(true);
          var content = file.contents.toString('utf8');
          exampleContents = exampleContents.toString('utf8').split('\n');
          content.split('\n').forEach(function (e, i) {
            e.should.equal(exampleContents[i]);
          });
        }, done);
      }
    });

    raml2codeInstance.on('error', function (error) {
      console.log("error", error);
    });

  }

  var test1 = function(done){
    test(done, "../examples/CatDTO.groovy" , {package: 'org.gex', enableAnnotations: false})
  }
  var test2 = function(done){
    test(done, "../examples/CatDTOJSR303.groovy" , {package: 'org.gex'})
  }

  it('from a RAML file', test1 );
  it('from a RAML file with bean validation', test2 );


});

var raml2code =require('../..');
var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');

describe('RAML to Groovy ', function () {

  it('DTO from RAML file', function(done) {
    var simpleGen = {};
    simpleGen.template = '{{title}}';
    simpleGen.parser = function (data) {
      return [{ name: "test.test", model: {title:data.title + " finos"}}]
    };

    var raml2codeInstance = raml2code({generator:simpleGen});
    var ramlPath = path.join(__dirname, '../raml/cats.raml');
    var ramlContents = fs.readFileSync(ramlPath);
    raml2codeInstance.write(new gutil.File({
      path: ramlPath,
      contents: ramlContents
    }));

    raml2codeInstance.on('data', function(file){
      file.path.should.equal('test.test');
      file.contents.toString('utf8').should.equal("Compra venta de gatitos finos");
      done();
    });

  });

});

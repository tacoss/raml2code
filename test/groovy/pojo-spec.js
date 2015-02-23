var test = require("../helpers").test;
var chai = require('chai');
chai.should();

describe('should generate a Pojo', function () {

  var generator = require("../../lib/generators/groovy/pojo");
  var catDTO = function(done){
    test(generator, done, {package: 'org.gex', enableAnnotations: false}, undefined , "v1/ComplexCat.groovy")
  };

  it('from a RAML file', catDTO );

});

var test = require("../helpers").test;
var chai = require('chai');
chai.should();

describe('should generate a Pojo', function () {

  var generator = require("../../lib/generators/groovy/pojo");
  var catDTO = function(done){
    test(generator, done, {package: 'org.gex', enableAnnotations: false}, "CatDTO.groovy" , "v1/Cat.groovy" )
  };
  var catDTOJSR303 = function(done){
    test(generator, done, {package: 'org.gex'}, "CatDTOJSR303.groovy", "v1/Cat.groovy")
  };
  var widgetDTOInlineRef = function(done){
    test(generator, done, {package: 'org.gex'}, "CatDTOJSR303.groovy", "v1/Widget.groovy", true)
  };

  it('from a RAML file', catDTO );
  it('from a RAML file with bean validation', catDTOJSR303 );
  it('from a Schema with inline ref', widgetDTOInlineRef )



});

var test = require("../helpers").test;
var chai = require('chai');
chai.should();



describe('RAML to JAX-RS', function () {
  var generator = require("../../lib/generators/groovy/jaxrsInterface");

  var gatitosResource = function (done) {
    test(generator, done, {package: 'org.gex', importPojos: 'org.gex.dto'}, "GatitosResource.groovy", "v1/GatitosResource.groovy")
  };
  var gatitoByIdResource = function (done) {
    test(generator, done, {package: 'org.gex', importPojos: 'org.gex.dto'}, "GatitoByIdResource.groovy", "v1/GatitoByIdResource.groovy")
  };

  var gatitoByIdPictureResource = function (done) {
    test(generator, done, {package: 'org.gex', importPojos: 'org.gex.dto'}, "GatitoByIdPictureResource.groovy", "v1/GatitoByIdPictureResource.groovy")
  };

  var gatitopByIdFormResource = function (done) {
    test(generator, done, {package: 'org.gex', importPojos: 'org.gex.dto'}, "GatitopByIdFormResource.groovy", "v1/GatitopByIdFormResource.groovy")
  };

  it('should generate a resource interface', gatitosResource);
  it('should generate a resourceById interface', gatitoByIdResource);
  it('should generate a GatitoByIdPictureResource upload interface', gatitoByIdPictureResource);
  it('should generate a GatitopByIdFormResource upload interface', gatitopByIdFormResource);

});

var test = require("../helpers").test;
var chai = require('chai');
chai.should();

describe('RAML to jsClient', function () {

  var generator = require("../../lib/generators/javascript/jsClient");

  var gatitosAPI = function(done){
    test(generator, done, {package: 'org.gex.client', importPojos: 'com.pojos'}, "GatitosAPI.java", "v1/GatitosAPI.java")
  };

  it('should generate a js client from RAML file', gatitosAPI );

});

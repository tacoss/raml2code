var test = require("../helpers").test;
var chai = require('chai');
chai.should();

describe('RAML to Retrofit client ', function () {

  var generator = require("../../lib/generators/groovy/retrofitClient");

  var gatitosAPI = function(done){
    test(generator, done, {package: 'org.gex.client', importPojos: 'com.pojos'}, "GatitosAPI.java", "v1/GatitosAPI.java")
  };

  it('should generate a retrofit client from RAML file', gatitosAPI );


});

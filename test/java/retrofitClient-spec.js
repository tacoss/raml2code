var test = require("../helpers").test;

describe('RAML to Retrofit client ', function () {

  var generator = require("../../lib/generators/java/retrofitClient");
  var gatitosAPI = function(done){
    test(generator, done, {package: 'org.gex.client', importPojos: 'com.pojos'}, "java/retrofit-client/FixtureAPI.java", "v1/FixtureAPI.java", false)
  };

  it('should generate a retrofit client from RAML file', gatitosAPI );

});

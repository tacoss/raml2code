var path = require('path');
var fs = require('fs');
var raml2code = require('..');
var gutil = require('gulp-util');
var testUtils = require("raml2code-fixtures");

var helpers = {};

helpers.test = function (generator, done, extra, sampleFile, validateWith, logContent ) {

  logContent = logContent || false;

  var raml2codeInstance = raml2code({generator: generator, extra: extra});
  var ramlPath = testUtils.ramlPath +'index.raml';
  var ramlContents = fs.readFileSync(ramlPath);

  raml2codeInstance.write(new gutil.File({
    path: ramlPath,
    contents: ramlContents
  }));

  raml2codeInstance.on('data', function (file) {
    if (file.path == validateWith) {
      testUtils.wrapAssertion(function(){
        testUtils.compareContents({body:file.contents.toString('utf8'), name: file.path}, sampleFile, logContent);
        done();
      }, done);
    }
  });

  raml2codeInstance.on('error', function (error) {
    console.log("error", error);
  });

};

module.exports = helpers;
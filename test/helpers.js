var path = require('path');
var fs = require('fs');
var raml2code = require('..');
var gutil = require('gulp-util');

var helpers = {};
helpers.wrapAssertion= function(fn, done) {
  try {
    fn();
    done();
  } catch (e) {
    done(e);
  }
};
helpers.test = function (generator, done, extra, sampleFile, validateWith, logContent ) {

  logContent = logContent || false;
  var raml2codeInstance = raml2code({generator: generator, extra: extra});
  var ramlPath = path.join(__dirname, './raml/cats.raml');
  var examplePath = path.join(__dirname, "./examples/" + sampleFile);

  var ramlContents = fs.readFileSync(ramlPath);
  var exampleContents = fs.readFileSync(examplePath);

  raml2codeInstance.write(new gutil.File({
    path: ramlPath,
    contents: ramlContents
  }));

  raml2codeInstance.on('data', function (file) {
    if (file.path == validateWith) {
      helpers.wrapAssertion(function () {
        file.isBuffer().should.equal(true);
        var content = file.contents.toString('utf8');
        if(logContent){
          console.log("=================" + file.path + "================")
          console.log(content);
          console.log("==================================================")
        }
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

};

module.exports = helpers;